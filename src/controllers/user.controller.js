import { getUserPurchases, findUserById } from '../models/queries.js';
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
}

export default UserController;
