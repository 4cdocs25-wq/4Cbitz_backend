import { validationResult } from 'express-validator';
import ResponseHandler from '../utils/responseHandler.js';

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return ResponseHandler.badRequest(res, 'Validation failed', errors.array());
  }

  next();
};

export default validateRequest;
