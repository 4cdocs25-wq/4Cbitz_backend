import {
  createDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  checkPurchaseExists
} from '../models/queries.js';
import logger from '../utils/logger.js';

class DocumentService {
  // Create new document
  static async createDocument(title, description, price, fileUrl, adminId) {
    try {
      const document = await createDocument(title, description, price, fileUrl, adminId);
      logger.info(`Document created: ${document.id} by admin: ${adminId}`);
      return document;
    } catch (error) {
      logger.error('Create document error:', error);
      throw error;
    }
  }

  // Get all active documents (for browse/listing)
  static async getAllDocuments() {
    try {
      const documents = await getAllDocuments();
      return documents;
    } catch (error) {
      logger.error('Get all documents error:', error);
      throw error;
    }
  }

  // Get document by ID with access check
  static async getDocumentById(documentId, userId, userRole) {
    try {
      const document = await getDocumentById(documentId);

      if (!document) {
        throw new Error('Document not found');
      }

      // Admin can access any document
      if (userRole === 'admin') {
        return {
          ...document,
          hasAccess: true
        };
      }

      // Check if user has purchased the document
      const hasPurchased = await checkPurchaseExists(userId, documentId);

      return {
        id: document.id,
        title: document.title,
        description: document.description,
        price: document.price,
        hasAccess: hasPurchased,
        // Only include file URL if user has access
        ...(hasPurchased && { file_url: document.file_url })
      };
    } catch (error) {
      logger.error('Get document error:', error);
      throw error;
    }
  }

  // Update document (admin only)
  static async updateDocument(documentId, updates) {
    try {
      const document = await updateDocument(documentId, updates);
      logger.info(`Document updated: ${documentId}`);
      return document;
    } catch (error) {
      logger.error('Update document error:', error);
      throw error;
    }
  }

  // Delete document (soft delete - admin only)
  static async deleteDocument(documentId) {
    try {
      const document = await deleteDocument(documentId);
      logger.info(`Document deleted: ${documentId}`);
      return document;
    } catch (error) {
      logger.error('Delete document error:', error);
      throw error;
    }
  }

  // Check if user has access to document
  static async checkAccess(userId, documentId) {
    try {
      const hasAccess = await checkPurchaseExists(userId, documentId);
      return hasAccess;
    } catch (error) {
      logger.error('Check access error:', error);
      throw error;
    }
  }
}

export default DocumentService;
