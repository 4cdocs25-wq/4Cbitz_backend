import SettingsService from '../services/settings.service.js';
import logger from '../utils/logger.js';

class SettingsController {
  // Get public setting by key (no authentication required)
  static async getPublicSetting(req, res) {
    try {
      const { key } = req.params;

      // Whitelist of public settings
      const publicSettings = ['lifetime_subscription_price'];

      if (!publicSettings.includes(key)) {
        return res.status(403).json({
          success: false,
          message: 'This setting is not publicly accessible'
        });
      }

      const setting = await SettingsService.getByKey(key);
      res.json({
        success: true,
        data: setting
      });
    } catch (error) {
      logger.error('Error in getPublicSetting:', error);
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get all settings
  static async getAllSettings(req, res) {
    try {
      const settings = await SettingsService.getAll();
      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      logger.error('Error in getAllSettings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch settings',
        error: error.message
      });
    }
  }

  // Get setting by key
  static async getSettingByKey(req, res) {
    try {
      const { key } = req.params;
      const setting = await SettingsService.getByKey(key);
      res.json({
        success: true,
        data: setting
      });
    } catch (error) {
      logger.error('Error in getSettingByKey:', error);
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update setting
  static async updateSetting(req, res) {
    try {
      const { key } = req.params;
      const { value } = req.body;

      if (!value) {
        return res.status(400).json({
          success: false,
          message: 'Value is required'
        });
      }

      const updatedSetting = await SettingsService.update(key, value);
      res.json({
        success: true,
        data: updatedSetting,
        message: 'Setting updated successfully'
      });
    } catch (error) {
      logger.error('Error in updateSetting:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Create new setting
  static async createSetting(req, res) {
    try {
      const { key, value, description } = req.body;

      if (!key || !value) {
        return res.status(400).json({
          success: false,
          message: 'Key and value are required'
        });
      }

      const newSetting = await SettingsService.create(key, value, description);
      res.status(201).json({
        success: true,
        data: newSetting,
        message: 'Setting created successfully'
      });
    } catch (error) {
      logger.error('Error in createSetting:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default SettingsController;
