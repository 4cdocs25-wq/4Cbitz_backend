import express from 'express';
const router = express.Router();
import AuthController from '../controllers/auth.controller.js';
import authenticateToken from '../middleware/auth.js';
import { body } from 'express-validator';
import validateRequest from '../middleware/validateRequest.js';

// Google OAuth login/register
router.post(
  '/google',
  [
    body('idToken').notEmpty().withMessage('Google ID token is required'),
    validateRequest
  ],
  AuthController.googleAuth
);

// Refresh access token
router.post(
  '/refresh',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
    validateRequest
  ],
  AuthController.refreshToken
);

// Get current user profile (protected)
router.get('/profile', authenticateToken, AuthController.getProfile);

// Logout (info endpoint - client handles token removal)
router.post('/logout', authenticateToken, AuthController.logout);

// Admin email/password login
router.post(
  '/admin/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest
  ],
  AuthController.adminLogin
);

// Set admin password (protected - admin only)
router.post(
  '/admin/set-password',
  authenticateToken,
  [
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
    body('currentPassword')
      .optional({ nullable: true })
      .isString()
      .withMessage('Current password must be a string'),
    validateRequest
  ],
  AuthController.setAdminPassword
);

export default router;
