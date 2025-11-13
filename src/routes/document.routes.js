import express from 'express';
const router = express.Router();
import multer from 'multer';
import DocumentController from '../controllers/document.controller.js';
import authenticateToken, { optionalAuthenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleCheck.js';
import { documentValidation } from '../utils/validators.js';
import validateRequest from '../middleware/validateRequest.js';

// Configure multer for file upload (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Public route with optional auth - Get all documents (browse/listing)
// Admins see all documents, regular users see only visible documents
router.get('/', optionalAuthenticateToken, DocumentController.getAllDocuments);

// Protected routes - Require authentication
router.get(
  '/:id',
  authenticateToken,
  documentValidation.getById,
  validateRequest,
  DocumentController.getDocumentById
);

router.get(
  '/:id/access',
  authenticateToken,
  documentValidation.getById,
  validateRequest,
  DocumentController.checkAccess
);

// Admin only routes
router.post(
  '/',
  authenticateToken,
  requireAdmin,
  upload.single('file'),
  documentValidation.upload,
  validateRequest,
  DocumentController.uploadDocument
);

router.put(
  '/:id',
  authenticateToken,
  requireAdmin,
  documentValidation.getById,
  validateRequest,
  DocumentController.updateDocument
);

router.delete(
  '/:id',
  authenticateToken,
  requireAdmin,
  documentValidation.getById,
  validateRequest,
  DocumentController.deleteDocument
);

router.patch(
  '/:id/visibility',
  authenticateToken,
  requireAdmin,
  documentValidation.getById,
  validateRequest,
  DocumentController.toggleVisibility
);

export default router;
