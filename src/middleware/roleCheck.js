import ResponseHandler from '../utils/responseHandler.js';
import { USER_ROLES } from '../config/constants.js';

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return ResponseHandler.unauthorized(res, 'Authentication required');
  }

  if (req.user.role !== USER_ROLES.ADMIN) {
    return ResponseHandler.forbidden(res, 'Admin access required');
  }

  next();
};

export const requireUser = (req, res, next) => {
  if (!req.user) {
    return ResponseHandler.unauthorized(res, 'Authentication required');
  }

  if (req.user.role !== USER_ROLES.USER) {
    return ResponseHandler.forbidden(res, 'User access only');
  }

  next();
};
