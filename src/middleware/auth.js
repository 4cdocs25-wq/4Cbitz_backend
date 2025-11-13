import jwt from 'jsonwebtoken';
import ResponseHandler from '../utils/responseHandler.js';
import logger from '../utils/logger.js';

const authenticateToken = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return ResponseHandler.unauthorized(res, 'Access token required');
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        logger.error('JWT verification failed:', err.message);
        return ResponseHandler.unauthorized(res, 'Invalid or expired token');
      }

      // Attach user info to request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };

      next();
    });
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return ResponseHandler.error(res, 'Authentication failed');
  }
};

// Optional authentication - populates req.user if valid token exists, otherwise continues
export const optionalAuthenticateToken = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    // If no token, continue without user info
    if (!token) {
      return next();
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        // Invalid token - log but continue without user info
        logger.debug('Optional auth: Invalid token, continuing as anonymous');
        return next();
      }

      // Attach user info to request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };

      next();
    });
  } catch (error) {
    logger.error('Optional auth middleware error:', error);
    // Don't fail the request, just continue without user info
    next();
  }
};

export default authenticateToken;
