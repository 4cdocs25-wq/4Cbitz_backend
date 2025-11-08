import AuthService from '../services/auth.service.js';
import ResponseHandler from '../utils/responseHandler.js';
import logger from '../utils/logger.js';

class AuthController {
  // Google OAuth login/register
  static async googleAuth(req, res, next) {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return ResponseHandler.badRequest(res, 'Google ID token is required');
      }

      const result = await AuthService.googleAuth(idToken);

      return ResponseHandler.success(res, result, 'Authentication successful');
    } catch (error) {
      if (error.message === 'Invalid Google token') {
        return ResponseHandler.unauthorized(res, error.message);
      }
      if (error.message === 'Email not verified with Google') {
        return ResponseHandler.badRequest(res, error.message);
      }
      logger.error('Google auth controller error:', error);
      next(error);
    }
  }

  // Refresh access token
  static async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return ResponseHandler.badRequest(res, 'Refresh token is required');
      }

      const result = await AuthService.refreshAccessToken(refreshToken);

      return ResponseHandler.success(res, result, 'Token refreshed successfully');
    } catch (error) {
      if (error.message.includes('Invalid') || error.message.includes('expired')) {
        return ResponseHandler.unauthorized(res, error.message);
      }
      logger.error('Refresh token controller error:', error);
      next(error);
    }
  }

  // Get current user profile
  static async getProfile(req, res, next) {
    try {
      const userId = req.user.id;

      const { findUserById } = await import('../models/queries.js');
      const user = await findUserById(userId);

      return ResponseHandler.success(res, user, 'Profile retrieved successfully');
    } catch (error) {
      logger.error('Get profile controller error:', error);
      next(error);
    }
  }

  // Logout (client-side - just info endpoint)
  static async logout(req, res) {
    // In JWT auth, logout is handled client-side by removing tokens
    return ResponseHandler.success(res, null, 'Logout successful. Please remove tokens from client.');
  }
}

export default AuthController;
