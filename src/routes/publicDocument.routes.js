import express from 'express';
const router = express.Router();
import multer from 'multer';
import PublicDocumentController from '../controllers/publicDocument.controller.js';
import authenticateToken from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleCheck.js';

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

// Admin only routes (mounted at /api/public-documents)
router.post(
  '/',
  authenticateToken,
  requireAdmin,
  upload.single('file'),
  PublicDocumentController.uploadPublicDocument
);

router.get(
  '/',
  authenticateToken,
  requireAdmin,
  PublicDocumentController.getAllPublicDocuments
);

router.delete(
  '/:id',
  authenticateToken,
  requireAdmin,
  PublicDocumentController.deletePublicDocument
);

router.patch(
  '/:id/status',
  authenticateToken,
  requireAdmin,
  PublicDocumentController.toggleStatus
);

// Public route - Create separate router for public access
const publicRouter = express.Router();
publicRouter.get('/:token', PublicDocumentController.getPublicDocumentByToken);

export default router;
export { publicRouter };
