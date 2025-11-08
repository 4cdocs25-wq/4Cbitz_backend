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

export default router;
