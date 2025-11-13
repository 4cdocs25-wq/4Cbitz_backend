import { getAllSettings, getSettingByKey, updateSetting, createSetting } from '../models/queries.js';
import logger from '../utils/logger.js';

class SettingsService {
  static async getAll() {
    try {
      const settings = await getAllSettings();
      return settings;
    } catch (error) {
      logger.error('Error getting all settings:', error);
      throw error;
    }
  }

  static async getByKey(key) {
    try {
      const setting = await getSettingByKey(key);
      if (!setting) {
        throw new Error(`Setting with key "${key}" not found`);
      }
      return setting;
    } catch (error) {
      logger.error(`Error getting setting ${key}:`, error);
      throw error;
    }
  }

  static async update(key, value) {
    try {
      // Validate value is not empty
      if (!value || value.trim() === '') {
        throw new Error('Setting value cannot be empty');
      }

      // Special validation for subscription price
      if (key === 'lifetime_subscription_price') {
        const price = parseFloat(value);
        if (isNaN(price) || price < 1 || price > 9999) {
          throw new Error('Subscription price must be between $1 and $9999');
        }
        // Ensure 2 decimal places
        value = price.toFixed(2);
      }

      const updatedSetting = await updateSetting(key, value);
      return updatedSetting;
    } catch (error) {
      logger.error(`Error updating setting ${key}:`, error);
      throw error;
    }
  }

  static async create(key, value, description = null) {
    try {
      // Validate inputs
      if (!key || key.trim() === '') {
        throw new Error('Setting key cannot be empty');
      }
      if (!value || value.trim() === '') {
        throw new Error('Setting value cannot be empty');
      }

      const newSetting = await createSetting(key, value, description);
      return newSetting;
    } catch (error) {
      logger.error('Error creating setting:', error);
      throw error;
    }
  }
}

export default SettingsService;
