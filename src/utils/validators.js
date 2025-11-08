import { body, param, validationResult } from 'express-validator';

// Validation rules
export const authValidation = {
  register: [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('role').optional().isIn(['admin', 'user']).withMessage('Invalid role')
  ],
  login: [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ]
};

export const documentValidation = {
  upload: [
    body('title').trim().notEmpty().withMessage('Document title is required'),
    body('description').optional().trim(),
    body('price').optional().isNumeric().withMessage('Price must be a number').custom(value => value >= 0).withMessage('Price must be positive')
  ],
  getById: [
    param('id').isUUID().withMessage('Invalid document ID')
  ]
};

export const paymentValidation = {
  createCheckout: [
    body('documentId').optional().isUUID().withMessage('Invalid document ID')
  ],
  verifyPayment: [
    body('sessionId').notEmpty().withMessage('Session ID is required')
  ]
};

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};
