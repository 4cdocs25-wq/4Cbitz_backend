import stripe from '../config/stripe.js';
import {
  createPayment,
  updatePaymentStatus,
  getPaymentBySessionId,
  createPurchase,
  checkPurchaseExists
} from '../models/queries.js';
import logger from '../utils/logger.js';

class PaymentService {
  // Create Stripe Checkout Session
  static async createCheckoutSession(userId, documentId, documentTitle, price) {
    try {
      // Check if user already has lifetime subscription
      const hasLifetimeSubscription = await checkPurchaseExists(userId, null);
      if (hasLifetimeSubscription) {
        throw new Error('You already have a lifetime subscription');
      }

      // Determine success URL based on subscription type
      const successUrl = documentId
        ? `${process.env.FRONTEND_URL}/documents/${documentId}?session_id={CHECKOUT_SESSION_ID}`
        : `${process.env.FRONTEND_URL}/documents?session_id={CHECKOUT_SESSION_ID}`;

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: documentTitle,
                description: documentId
                  ? 'One-time purchase for lifetime access'
                  : 'One-time payment for lifetime access to all premium documents'
              },
              unit_amount: Math.round(price * 100) // Convert to cents
            },
            quantity: 1
          }
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: `${process.env.FRONTEND_URL}/subscription`,
        metadata: {
          userId,
          documentId: documentId || 'lifetime_subscription', // Use special marker for lifetime
          subscriptionType: documentId ? 'document' : 'lifetime'
        }
      });

      // Save payment record in database
      await createPayment(userId, documentId, session.id, price);

      logger.info(`Checkout session created: ${session.id} for user: ${userId}, type: ${documentId ? 'document' : 'lifetime'}`);

      return {
        sessionId: session.id,
        checkoutUrl: session.url
      };
    } catch (error) {
      logger.error('Create checkout session error:', error);
      throw error;
    }
  }

  // Verify payment and grant access
  static async verifyPayment(sessionId, userId) {
    try {
      // Retrieve session from Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      // Check if payment was successful
      if (session.payment_status !== 'paid') {
        throw new Error('Payment not completed');
      }

      // Check if session belongs to this user
      if (session.metadata.userId !== userId) {
        throw new Error('Unauthorized access to this payment session');
      }

      // Get payment record from database
      const payment = await getPaymentBySessionId(sessionId);

      // Check if already processed
      if (payment.status === 'completed') {
        logger.info(`Payment already processed: ${sessionId}`);
        return {
          alreadyProcessed: true,
          documentId: payment.document_id,
          subscriptionType: session.metadata.subscriptionType
        };
      }

      // Update payment status
      await updatePaymentStatus(sessionId, 'completed');

      // Determine document ID for purchase record
      const documentId = session.metadata.documentId === 'lifetime_subscription'
        ? null
        : session.metadata.documentId;

      // Double-check user doesn't already have lifetime subscription before creating purchase
      const hasLifetime = await checkPurchaseExists(userId, null);
      if (hasLifetime) {
        throw new Error('You already have a lifetime subscription');
      }

      // Create purchase record (grant access)
      // If documentId is null, this represents lifetime access to all documents
      await createPurchase(
        session.metadata.userId,
        documentId,
        sessionId,
        payment.amount
      );

      logger.info(`Payment verified and access granted: ${sessionId}, type: ${session.metadata.subscriptionType}`);

      return {
        success: true,
        documentId: documentId,
        subscriptionType: session.metadata.subscriptionType
      };
    } catch (error) {
      logger.error('Verify payment error:', error);
      throw error;
    }
  }

  // Get payment status
  static async getPaymentStatus(sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      return {
        paymentStatus: session.payment_status,
        status: session.status
      };
    } catch (error) {
      logger.error('Get payment status error:', error);
      throw error;
    }
  }
}

export default PaymentService;
