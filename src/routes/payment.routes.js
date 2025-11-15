import express from 'express';
const router = express.Router();
import PaymentController from '../controllers/payment.controller.js';
import authenticateToken from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleCheck.js';
import { paymentValidation } from '../utils/validators.js';
import validateRequest from '../middleware/validateRequest.js';

// Create checkout session
router.post(
  '/create-checkout',
  authenticateToken,
  paymentValidation.createCheckout,
  validateRequest,
  PaymentController.createCheckout
);

// Verify payment after successful checkout
router.post(
  '/verify-payment',
  authenticateToken,
  paymentValidation.verifyPayment,
  validateRequest,
  PaymentController.verifyPayment
);

// Get payment status
router.get(
  '/status/:sessionId',
  authenticateToken,
  PaymentController.getPaymentStatus
);

// Admin routes
// Get all transactions (admin only)
router.get(
  '/admin/transactions',
  authenticateToken,
  requireAdmin,
  PaymentController.getAdminTransactions
);

// Get transaction statistics (admin only)
router.get(
  '/admin/stats',
  authenticateToken,
  requireAdmin,
  PaymentController.getAdminTransactionStats
);

// Stripe webhook endpoint (no auth - Stripe calls this)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  PaymentController.handleWebhook
);

export default router;
