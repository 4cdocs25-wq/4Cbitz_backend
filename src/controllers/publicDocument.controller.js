import PublicDocumentService from '../services/publicDocument.service.js';
import UploadService from '../services/upload.service.js';
import ResponseHandler from '../utils/responseHandler.js';
import logger from '../utils/logger.js';

class PublicDocumentController {
  // Upload new public document (admin only)
  static async uploadPublicDocument(req, res, next) {
    try {
      const { title, description } = req.body;
      const adminId = req.user.id;
      const file = req.file;

      if (!file) {
        return ResponseHandler.badRequest(res, 'Document file is required');
      }

      if (!title) {
        return ResponseHandler.badRequest(res, 'Title is required');
      }

      // Upload file to storage
      const { fileUrl } = await UploadService.uploadDocument(file, adminId);

      // Create public document record in database
      const document = await PublicDocumentService.createPublicDocument(
        title,
        description || '',
        fileUrl,
        adminId
      );

      return ResponseHandler.created(res, document, 'Public document uploaded successfully');
    } catch (error) {
      logger.error('Upload public document controller error:', error);
      next(error);
    }
  }

  // Get all public documents (admin only)
  static async getAllPublicDocuments(req, res, next) {
    try {
      const documents = await PublicDocumentService.getAllPublicDocuments();
      return ResponseHandler.success(res, documents, 'Public documents retrieved successfully');
    } catch (error) {
      logger.error('Get all public documents controller error:', error);
      next(error);
    }
  }

  // Get public document by token (public access - no auth required)
  static async getPublicDocumentByToken(req, res, next) {
    try {
      const { token } = req.params;

      const document = await PublicDocumentService.getPublicDocumentByToken(token);

      return ResponseHandler.success(res, document, 'Document retrieved successfully');
    } catch (error) {
      if (error.message === 'Document not found or has been disabled') {
        return ResponseHandler.notFound(res, error.message);
      }
      logger.error('Get public document by token controller error:', error);
      next(error);
    }
  }

  // Delete public document (admin only)
  static async deletePublicDocument(req, res, next) {
    try {
      const { id } = req.params;

      await PublicDocumentService.deletePublicDocument(id);

      return ResponseHandler.success(res, null, 'Public document deleted successfully');
    } catch (error) {
      logger.error('Delete public document controller error:', error);
      next(error);
    }
  }

  // Toggle public document status (admin only)
  static async toggleStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;

      if (is_active === undefined) {
        return ResponseHandler.badRequest(res, 'is_active field is required');
      }

      const document = await PublicDocumentService.toggleStatus(id, is_active);

      return ResponseHandler.success(res, document, 'Document status updated successfully');
    } catch (error) {
      logger.error('Toggle public document status controller error:', error);
      next(error);
    }
  }
}

export default PublicDocumentController;
