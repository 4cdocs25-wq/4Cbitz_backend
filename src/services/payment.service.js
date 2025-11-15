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
  static async createCheckoutSession(userId, userEmail, documentId, documentTitle, price) {
    try {
      // Check if user already has lifetime subscription
      const hasLifetimeSubscription = await checkPurchaseExists(userId, null);
      if (hasLifetimeSubscription) {
        throw new Error('You already have a lifetime subscription');
      }

      // Redirect to Thank You page after successful payment
      const successUrl = `${process.env.FRONTEND_URL}/thank-you?session_id={CHECKOUT_SESSION_ID}`;

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: userEmail,
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
        cancel_url: `${process.env.FRONTEND_URL}/subscription?session_id={CHECKOUT_SESSION_ID}&status=cancelled`,
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

      // Check if session belongs to this user
      if (session.metadata.userId !== userId) {
        throw new Error('Unauthorized access to this payment session');
      }

      // Get payment record from database
      const payment = await getPaymentBySessionId(sessionId);

      // Check if payment was successful
      if (session.payment_status !== 'paid') {
        // Payment failed or was cancelled - update status to failed
        await updatePaymentStatus(sessionId, 'failed');
        logger.info(`Payment failed or cancelled: ${sessionId}`);

        return {
          success: false,
          failed: true,
          reason: 'Payment was not completed'
        };
      }

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

  // Handle Stripe webhook events
  static async handleStripeWebhook(req) {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error('Webhook secret not configured');
    }

    let event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      logger.error('Webhook signature verification failed:', err.message);
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    logger.info(`Webhook received: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object);
        break;

      case 'checkout.session.expired':
        await this.handleCheckoutExpired(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  // Handle successful checkout completion
  static async handleCheckoutCompleted(session) {
    try {
      logger.info(`Processing completed checkout: ${session.id}`);

      const payment = await getPaymentBySessionId(session.id);

      if (!payment) {
        logger.error(`Payment not found for session: ${session.id}`);
        return;
      }

      // Check if already processed
      if (payment.status === 'completed') {
        logger.info(`Payment already processed: ${session.id}`);
        return;
      }

      // Update payment status
      await updatePaymentStatus(session.id, 'completed');

      // Determine document ID for purchase record
      const documentId = session.metadata.documentId === 'lifetime_subscription'
        ? null
        : session.metadata.documentId;

      // Create purchase record (grant access)
      await createPurchase(
        session.metadata.userId,
        documentId,
        session.id,
        payment.amount
      );

      logger.info(`Webhook: Payment completed and access granted: ${session.id}`);
    } catch (error) {
      logger.error('Error handling checkout.session.completed:', error);
      throw error;
    }
  }

  // Handle expired checkout session
  static async handleCheckoutExpired(session) {
    try {
      logger.info(`Processing expired checkout: ${session.id}`);

      const payment = await getPaymentBySessionId(session.id);

      if (!payment) {
        logger.error(`Payment not found for session: ${session.id}`);
        return;
      }

      // Only update if still pending
      if (payment.status === 'pending') {
        await updatePaymentStatus(session.id, 'expired');
        logger.info(`Webhook: Payment marked as expired: ${session.id}`);
      }
    } catch (error) {
      logger.error('Error handling checkout.session.expired:', error);
      throw error;
    }
  }

  // Handle failed payment intent
  static async handlePaymentFailed(paymentIntent) {
    try {
      logger.info(`Processing failed payment: ${paymentIntent.id}`);

      // Find the checkout session associated with this payment intent
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: paymentIntent.id,
        limit: 1
      });

      if (sessions.data.length === 0) {
        logger.error(`No session found for payment intent: ${paymentIntent.id}`);
        return;
      }

      const sessionId = sessions.data[0].id;
      const payment = await getPaymentBySessionId(sessionId);

      if (!payment) {
        logger.error(`Payment not found for session: ${sessionId}`);
        return;
      }

      // Only update if still pending
      if (payment.status === 'pending') {
        await updatePaymentStatus(sessionId, 'failed');
        logger.info(`Webhook: Payment marked as failed: ${sessionId}`);
      }
    } catch (error) {
      logger.error('Error handling payment_intent.payment_failed:', error);
      throw error;
    }
  }
}

export default PaymentService;
