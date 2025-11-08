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

export default authenticateToken;
