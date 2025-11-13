import express from 'express';
import SettingsController from '../controllers/settings.controller.js';
import authenticateToken from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleCheck.js';

const router = express.Router();

// ============= PUBLIC ROUTES =============

// Get public setting by key (no authentication required)
router.get('/public/:key', SettingsController.getPublicSetting);

// ============= ADMIN-ONLY ROUTES =============

// Get all settings
router.get('/', authenticateToken, requireAdmin, SettingsController.getAllSettings);

// Get setting by key
router.get('/:key', authenticateToken, requireAdmin, SettingsController.getSettingByKey);

// Update setting
router.put('/:key', authenticateToken, requireAdmin, SettingsController.updateSetting);

// Create new setting
router.post('/', authenticateToken, requireAdmin, SettingsController.createSetting);

export default router;
