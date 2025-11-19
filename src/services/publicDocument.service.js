import {
  createPublicDocument,
  getAllPublicDocuments,
  getPublicDocumentByToken,
  deletePublicDocument,
  togglePublicDocumentStatus
} from '../models/queries.js';
import logger from '../utils/logger.js';

class PublicDocumentService {
  // Create new public document
  static async createPublicDocument(title, description, fileUrl, adminId) {
    try {
      const document = await createPublicDocument(title, description, fileUrl, adminId);
      logger.info(`Public document created: ${document.id} by admin: ${adminId}`);
      return document;
    } catch (error) {
      logger.error('Create public document error:', error);
      throw error;
    }
  }

  // Get all public documents (admin only)
  static async getAllPublicDocuments() {
    try {
      const documents = await getAllPublicDocuments();
      return documents;
    } catch (error) {
      logger.error('Get all public documents error:', error);
      throw error;
    }
  }

  // Get public document by token (public access)
  static async getPublicDocumentByToken(token) {
    try {
      const document = await getPublicDocumentByToken(token);
      if (!document) {
        throw new Error('Document not found or has been disabled');
      }
      return document;
    } catch (error) {
      logger.error('Get public document by token error:', error);
      throw error;
    }
  }

  // Delete public document (admin only)
  static async deletePublicDocument(id) {
    try {
      const deletedDocument = await deletePublicDocument(id);
      logger.info(`Public document deleted: ${id}`);
      return deletedDocument;
    } catch (error) {
      logger.error('Delete public document error:', error);
      throw error;
    }
  }

  // Toggle public document active status (admin only)
  static async toggleStatus(id, isActive) {
    try {
      const document = await togglePublicDocumentStatus(id, isActive);
      logger.info(`Public document ${id} status changed to: ${isActive}`);
      return document;
    } catch (error) {
      logger.error('Toggle public document status error:', error);
      throw error;
    }
  }
}

export default PublicDocumentService;
