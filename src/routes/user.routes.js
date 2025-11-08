import express from 'express';
const router = express.Router();
import UserController from '../controllers/user.controller.js';
import authenticateToken from '../middleware/auth.js';

// Get user's purchased documents
router.get('/purchases', authenticateToken, UserController.getUserPurchases);

// Get user profile
router.get('/profile', authenticateToken, UserController.getProfile);

export default router;
