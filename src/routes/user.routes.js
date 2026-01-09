import express from 'express';
const router = express.Router();
import UserController from '../controllers/user.controller.js';
import authenticateToken from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleCheck.js';

// Get user's purchased documents
router.get('/purchases', authenticateToken, UserController.getUserPurchases);

// Get user profile
router.get('/profile', authenticateToken, UserController.getProfile);

// Update user profile
router.put('/profile', authenticateToken, UserController.updateProfile);

// Admin routes
// Get all users with subscription information (admin only)
router.get('/admin/all', authenticateToken, requireAdmin, UserController.getAdminUsers);

// Export users for date range (admin only)
router.get('/admin/export', authenticateToken, requireAdmin, UserController.exportUsers);

export default router;
