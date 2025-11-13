import express from 'express';
import FolderController from '../controllers/folder.controller.js';
import authenticateToken from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleCheck.js';

const router = express.Router();

// ============= PUBLIC ROUTES (AUTHENTICATED USERS) =============

// Get folder tree - authenticated users can view folder structure
router.get('/tree', authenticateToken, FolderController.getFolderTree);

// Get folder by ID
router.get('/:id', authenticateToken, FolderController.getFolder);

// Get folder with documents
router.get('/:id/documents', authenticateToken, FolderController.getFolderWithDocuments);

// Get folder path (breadcrumb)
router.get('/:id/path', authenticateToken, FolderController.getFolderPath);

// ============= ADMIN-ONLY ROUTES =============

// Create new folder
router.post('/', authenticateToken, requireAdmin, FolderController.createFolder);

// Update folder name
router.put('/:id', authenticateToken, requireAdmin, FolderController.updateFolder);

// Delete folder
router.delete('/:id', authenticateToken, requireAdmin, FolderController.deleteFolder);

// Move folder to new parent
router.put('/:id/move', authenticateToken, requireAdmin, FolderController.moveFolder);

export default router;
