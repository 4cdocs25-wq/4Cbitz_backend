import { getUserPurchases, findUserById, getAllUsersWithSubscription, updateUserProfile } from '../models/queries.js';
import ResponseHandler from '../utils/responseHandler.js';
import logger from '../utils/logger.js';

class UserController {
  // Get user's purchased documents
  static async getUserPurchases(req, res, next) {
    try {
      const userId = req.user.id;

      const purchases = await getUserPurchases(userId);

      return ResponseHandler.success(res, purchases, 'Purchases retrieved successfully');
    } catch (error) {
      logger.error('Get user purchases controller error:', error);
      next(error);
    }
  }

  // Get user profile (from auth controller, but can add more user-specific data here)
  static async getProfile(req, res, next) {
    try {
      const userId = req.user.id;

      const user = await findUserById(userId);

      return ResponseHandler.success(res, user, 'Profile retrieved successfully');
    } catch (error) {
      logger.error('Get profile controller error:', error);
      next(error);
    }
  }

  // Update user profile
  static async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const { name, industry, contact_number, address } = req.body;

      // Validation
      if (!industry || industry.trim() === '') {
        return ResponseHandler.error(res, 'Industry is required', 400);
      }

      if (!contact_number || contact_number.trim() === '') {
        return ResponseHandler.error(res, 'Contact number is required', 400);
      }

      // Basic phone number validation (allows various formats)
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(contact_number)) {
        return ResponseHandler.error(res, 'Invalid contact number format', 400);
      }

      const profileData = {
        name: name?.trim(),
        industry: industry.trim(),
        contact_number: contact_number.trim(),
        address: address?.trim() || null
      };

      const updatedUser = await updateUserProfile(userId, profileData);

      return ResponseHandler.success(res, updatedUser, 'Profile updated successfully');
    } catch (error) {
      logger.error('Update profile controller error:', error);
      next(error);
    }
  }

  // Admin: Get all users with subscription information
  static async getAdminUsers(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;
      const search = req.query.search || '';

      const result = await getAllUsersWithSubscription(limit, offset, search);

      return ResponseHandler.success(res, {
        users: result.users,
        pagination: {
          limit,
          offset,
          total: result.users.length
        }
      }, 'Users retrieved successfully');
    } catch (error) {
      logger.error('Get admin users controller error:', error);
      next(error);
    }
  }
}

export default UserController;
