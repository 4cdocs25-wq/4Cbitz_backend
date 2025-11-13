import DocumentService from '../services/document.service.js';
import UploadService from '../services/upload.service.js';
import ResponseHandler from '../utils/responseHandler.js';
import logger from '../utils/logger.js';

class DocumentController {
  // Get all documents (public - for browse/listing)
  static async getAllDocuments(req, res, next) {
    try {
      const { folder_id } = req.query;
      const isAdmin = req.user?.role === 'admin';
      const documents = await DocumentService.getAllDocuments(folder_id, isAdmin);

      return ResponseHandler.success(res, documents, 'Documents retrieved successfully');
    } catch (error) {
      logger.error('Get all documents controller error:', error);
      next(error);
    }
  }

  // Get single document by ID with access check
  static async getDocumentById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const document = await DocumentService.getDocumentById(id, userId, userRole);

      logger.info('Document being returned to frontend:', {
        hasFileUrl: !!document.file_url,
        fileUrl: document.file_url,
        hasAccess: document.hasAccess,
        documentKeys: Object.keys(document)
      });

      return ResponseHandler.success(res, document, 'Document retrieved successfully');
    } catch (error) {
      if (error.message === 'Document not found') {
        return ResponseHandler.notFound(res, error.message);
      }
      logger.error('Get document controller error:', error);
      next(error);
    }
  }

  // Upload new document (admin only)
  static async uploadDocument(req, res, next) {
    try {
      const { title, description, price, folder_id } = req.body;
      const adminId = req.user.id;
      const file = req.file;

      if (!file) {
        return ResponseHandler.badRequest(res, 'Document file is required');
      }

      // Upload file to storage
      const { fileUrl } = await UploadService.uploadDocument(file, adminId);

      // Create document record in database
      // Default price to 0 if not provided (lifetime subscription model - no per-document pricing)
      const documentPrice = price ? parseFloat(price) : 0;
      const folderId = folder_id || null;

      const document = await DocumentService.createDocument(
        title,
        description,
        documentPrice,
        fileUrl,
        adminId,
        folderId
      );

      return ResponseHandler.created(res, document, 'Document uploaded successfully');
    } catch (error) {
      logger.error('Upload document controller error:', error);
      next(error);
    }
  }

  // Update document (admin only)
  static async updateDocument(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const document = await DocumentService.updateDocument(id, updates);

      return ResponseHandler.success(res, document, 'Document updated successfully');
    } catch (error) {
      logger.error('Update document controller error:', error);
      next(error);
    }
  }

  // Delete document (admin only - soft delete)
  static async deleteDocument(req, res, next) {
    try {
      const { id } = req.params;

      const document = await DocumentService.deleteDocument(id);

      return ResponseHandler.success(res, document, 'Document deleted successfully');
    } catch (error) {
      logger.error('Delete document controller error:', error);
      next(error);
    }
  }

  // Check if user has access to a document
  static async checkAccess(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const hasAccess = await DocumentService.checkAccess(userId, id);

      return ResponseHandler.success(res, { hasAccess }, 'Access check completed');
    } catch (error) {
      logger.error('Check access controller error:', error);
      next(error);
    }
  }

  // Toggle document visibility (admin only)
  static async toggleVisibility(req, res, next) {
    try {
      const { id } = req.params;

      const document = await DocumentService.toggleVisibility(id);

      return ResponseHandler.success(res, document, 'Document visibility toggled successfully');
    } catch (error) {
      logger.error('Toggle visibility controller error:', error);
      next(error);
    }
  }
}

export default DocumentController;
