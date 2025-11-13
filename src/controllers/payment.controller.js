import PaymentService from '../services/payment.service.js';
import { getDocumentById, getAllTransactionsWithPagination, getTransactionStats, getSettingByKey } from '../models/queries.js';
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

        // Get subscription price from settings (required - no fallback)
        const priceSetting = await getSettingByKey('lifetime_subscription_price');

        if (!priceSetting || !priceSetting.value) {
          logger.error('Subscription price not configured in settings');
          throw new Error('Subscription price is not configured. Please contact support.');
        }

        const parsedPrice = parseFloat(priceSetting.value);

        if (isNaN(parsedPrice) || parsedPrice <= 0 || parsedPrice > 10000) {
          logger.error(`Invalid subscription price in settings: ${priceSetting.value}`);
          throw new Error('Invalid subscription price configuration. Please contact support.');
        }

        price = parsedPrice;
        logger.info(`Using subscription price from settings: $${price}`);
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

  // Admin: Get all transactions with pagination and filters
  static async getAdminTransactions(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;
      const filters = {
        status: req.query.status || null,
        search: req.query.search || null,
        startDate: req.query.startDate || null,
        endDate: req.query.endDate || null
      };

      const result = await getAllTransactionsWithPagination(limit, offset, filters);

      // If search filter is provided, filter by user email/name on backend
      let transactions = result.transactions;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        transactions = transactions.filter(t =>
          t.user?.email?.toLowerCase().includes(searchLower) ||
          t.user?.name?.toLowerCase().includes(searchLower)
        );
      }

      return ResponseHandler.success(res, {
        transactions,
        pagination: {
          limit,
          offset,
          total: transactions.length
        }
      }, 'Transactions retrieved successfully');
    } catch (error) {
      logger.error('Get admin transactions controller error:', error);
      next(error);
    }
  }

  // Admin: Get transaction statistics
  static async getAdminTransactionStats(req, res, next) {
    try {
      const stats = await getTransactionStats();

      return ResponseHandler.success(res, stats, 'Transaction statistics retrieved successfully');
    } catch (error) {
      logger.error('Get transaction stats controller error:', error);
      next(error);
    }
  }
}

export default PaymentController;
