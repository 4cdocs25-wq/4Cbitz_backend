import PaymentService from '../services/payment.service.js';
import { getDocumentById } from '../models/queries.js';
import ResponseHandler from '../utils/responseHandler.js';
import logger from '../utils/logger.js';

class PaymentController {
  // Create checkout session
  static async createCheckout(req, res, next) {
    try {
      const { documentId } = req.body;
      const userId = req.user.id;

      let title, price;

      // If documentId is provided, get specific document details
      if (documentId) {
        const document = await getDocumentById(documentId);

        if (!document) {
          return ResponseHandler.notFound(res, 'Document not found');
        }

        if (document.status !== 'active') {
          return ResponseHandler.badRequest(res, 'Document is not available for purchase');
        }

        title = document.title;
        price = document.price;
      } else {
        // Lifetime subscription for all documents
        title = 'Lifetime Access - All Premium Documents';
        price = 29.99; // Fixed price for lifetime access
      }

      // Create checkout session
      const result = await PaymentService.createCheckoutSession(
        userId,
        documentId || null, // Pass null for lifetime subscription
        title,
        price
      );

      return ResponseHandler.success(res, result, 'Checkout session created');
    } catch (error) {
      if (error.message === 'You have already purchased this document') {
        return ResponseHandler.conflict(res, error.message);
      }
      logger.error('Create checkout controller error:', error);
      next(error);
    }
  }

  // Verify payment after successful checkout
  static async verifyPayment(req, res, next) {
    try {
      const { sessionId } = req.body;
      const userId = req.user.id;

      const result = await PaymentService.verifyPayment(sessionId, userId);

      return ResponseHandler.success(res, result, 'Payment verified successfully');
    } catch (error) {
      if (error.message === 'Payment not completed') {
        return ResponseHandler.badRequest(res, error.message);
      }
      if (error.message === 'Unauthorized access to this payment session') {
        return ResponseHandler.forbidden(res, error.message);
      }
      logger.error('Verify payment controller error:', error);
      next(error);
    }
  }

  // Get payment status
  static async getPaymentStatus(req, res, next) {
    try {
      const { sessionId } = req.params;

      const result = await PaymentService.getPaymentStatus(sessionId);

      return ResponseHandler.success(res, result, 'Payment status retrieved');
    } catch (error) {
      logger.error('Get payment status controller error:', error);
      next(error);
    }
  }
}

export default PaymentController;
