import FolderService from '../services/folder.service.js';
import logger from '../utils/logger.js';

class FolderController {
  // Get all folders (tree structure)
  static async getFolderTree(req, res) {
    try {
      const tree = await FolderService.getTree();

      res.status(200).json({
        success: true,
        data: tree
      });
    } catch (error) {
      logger.error('Get folder tree controller error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get folder tree'
      });
    }
  }

  // Get folder by ID
  static async getFolder(req, res) {
    try {
      const { id } = req.params;
      const folder = await FolderService.getById(id);

      res.status(200).json({
        success: true,
        data: folder
      });
    } catch (error) {
      logger.error('Get folder controller error:', error);
      res.status(404).json({
        success: false,
        message: error.message || 'Folder not found'
      });
    }
  }

  // Get folder with documents
  static async getFolderWithDocuments(req, res) {
    try {
      const { id } = req.params;
      const folderWithDocs = await FolderService.getWithDocuments(id);

      res.status(200).json({
        success: true,
        data: folderWithDocs
      });
    } catch (error) {
      logger.error('Get folder with documents controller error:', error);
      res.status(404).json({
        success: false,
        message: error.message || 'Folder not found'
      });
    }
  }

  // Get folder path (breadcrumb)
  static async getFolderPath(req, res) {
    try {
      const { id } = req.params;
      const path = await FolderService.getFolderPath(id);

      res.status(200).json({
        success: true,
        data: path
      });
    } catch (error) {
      logger.error('Get folder path controller error:', error);
      res.status(404).json({
        success: false,
        message: error.message || 'Folder not found'
      });
    }
  }

  // Create new folder (admin only)
  static async createFolder(req, res) {
    try {
      const { name, parent_id } = req.body;
      const adminId = req.user.id;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Folder name is required'
        });
      }

      const folder = await FolderService.create(name, parent_id, adminId);

      res.status(201).json({
        success: true,
        data: folder,
        message: 'Folder created successfully'
      });
    } catch (error) {
      logger.error('Create folder controller error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create folder'
      });
    }
  }

  // Update folder name (admin only)
  static async updateFolder(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const adminId = req.user.id;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Folder name is required'
        });
      }

      const folder = await FolderService.update(id, name, adminId);

      res.status(200).json({
        success: true,
        data: folder,
        message: 'Folder updated successfully'
      });
    } catch (error) {
      logger.error('Update folder controller error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update folder'
      });
    }
  }

  // Delete folder (admin only)
  static async deleteFolder(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;

      await FolderService.delete(id, adminId);

      res.status(200).json({
        success: true,
        message: 'Folder deleted successfully'
      });
    } catch (error) {
      logger.error('Delete folder controller error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete folder'
      });
    }
  }

  // Move folder to new parent (admin only)
  static async moveFolder(req, res) {
    try {
      const { id } = req.params;
      const { parent_id } = req.body;
      const adminId = req.user.id;

      const folder = await FolderService.move(id, parent_id, adminId);

      res.status(200).json({
        success: true,
        data: folder,
        message: 'Folder moved successfully'
      });
    } catch (error) {
      logger.error('Move folder controller error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to move folder'
      });
    }
  }
}

export default FolderController;
