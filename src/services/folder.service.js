import {
  createFolder,
  getFolderById,
  getAllFolders,
  getFolderTree,
  updateFolder,
  deleteFolder,
  getFolderWithDocuments,
  moveFolderToParent,
  getFolderDescendants
} from '../models/queries.js';
import logger from '../utils/logger.js';

class FolderService {
  // Create a new folder
  static async create(name, parentId, adminId) {
    try {
      // Validate folder name
      if (!name || name.trim().length === 0) {
        throw new Error('Folder name is required');
      }

      if (name.trim().length > 100) {
        throw new Error('Folder name must be less than 100 characters');
      }

      // Validate parent folder exists if parentId is provided
      if (parentId) {
        try {
          await getFolderById(parentId);
        } catch (error) {
          throw new Error('Parent folder does not exist');
        }
      }

      const folder = await createFolder(name.trim(), parentId, adminId);
      logger.info(`Folder created: ${folder.id} by admin: ${adminId}`);

      return folder;
    } catch (error) {
      logger.error('Create folder error:', error);
      throw error;
    }
  }

  // Get folder by ID
  static async getById(id) {
    try {
      const folder = await getFolderById(id);
      return folder;
    } catch (error) {
      logger.error(`Get folder error for ID ${id}:`, error);
      throw error;
    }
  }

  // Get all folders (flat list)
  static async getAll() {
    try {
      const folders = await getAllFolders();
      return folders;
    } catch (error) {
      logger.error('Get all folders error:', error);
      throw error;
    }
  }

  // Get folder tree (hierarchical structure)
  static async getTree() {
    try {
      const tree = await getFolderTree();
      return tree;
    } catch (error) {
      logger.error('Get folder tree error:', error);
      throw error;
    }
  }

  // Get folder with its documents
  static async getWithDocuments(id) {
    try {
      const folderWithDocs = await getFolderWithDocuments(id);
      return folderWithDocs;
    } catch (error) {
      logger.error(`Get folder with documents error for ID ${id}:`, error);
      throw error;
    }
  }

  // Update folder name
  static async update(id, name, adminId) {
    try {
      // Validate folder name
      if (!name || name.trim().length === 0) {
        throw new Error('Folder name is required');
      }

      if (name.trim().length > 100) {
        throw new Error('Folder name must be less than 100 characters');
      }

      // Check folder exists and belongs to admin
      const folder = await getFolderById(id);
      if (folder.admin_id !== adminId) {
        throw new Error('Unauthorized: You can only update your own folders');
      }

      const updatedFolder = await updateFolder(id, name.trim());
      logger.info(`Folder updated: ${id} by admin: ${adminId}`);

      return updatedFolder;
    } catch (error) {
      logger.error(`Update folder error for ID ${id}:`, error);
      throw error;
    }
  }

  // Delete folder with cascade (deletes all subfolders and documents)
  static async delete(id, adminId) {
    try {
      // Check folder exists and belongs to admin
      const folder = await getFolderById(id);
      if (folder.admin_id !== adminId) {
        throw new Error('Unauthorized: You can only delete your own folders');
      }

      // Cascade delete: recursively delete all subfolders and documents
      await this.cascadeDeleteFolder(id, adminId);

      logger.info(`Folder deleted with cascade: ${id} by admin: ${adminId}`);

      return { success: true, message: 'Folder and all its contents deleted successfully' };
    } catch (error) {
      logger.error(`Delete folder error for ID ${id}:`, error);
      throw error;
    }
  }

  // Helper: Recursively delete folder and all its contents
  static async cascadeDeleteFolder(folderId, adminId) {
    try {
      // Import document deletion function
      const { deleteDocument } = await import('../models/queries.js');

      // Get all subfolders
      const descendants = await getFolderDescendants(folderId);

      // Recursively delete all subfolders (deepest first)
      for (const subfolder of descendants.reverse()) {
        await this.cascadeDeleteFolder(subfolder.id, adminId);
      }

      // Get all documents in this folder
      const folderWithDocs = await getFolderWithDocuments(folderId);

      // Delete all documents in this folder
      if (folderWithDocs.documents && folderWithDocs.documents.length > 0) {
        for (const doc of folderWithDocs.documents) {
          await deleteDocument(doc.id);
          logger.info(`Document deleted during cascade: ${doc.id}`);
        }
      }

      // Finally, delete the folder itself
      await deleteFolder(folderId);
      logger.info(`Subfolder deleted during cascade: ${folderId}`);
    } catch (error) {
      logger.error(`Cascade delete error for folder ${folderId}:`, error);
      throw error;
    }
  }

  // Move folder to new parent
  static async move(id, newParentId, adminId) {
    try {
      // Check folder exists and belongs to admin
      const folder = await getFolderById(id);
      if (folder.admin_id !== adminId) {
        throw new Error('Unauthorized: You can only move your own folders');
      }

      // Validate new parent exists if provided
      if (newParentId) {
        try {
          const parentFolder = await getFolderById(newParentId);
          if (parentFolder.admin_id !== adminId) {
            throw new Error('Unauthorized: Cannot move folder to another admin\'s folder');
          }
        } catch (error) {
          throw new Error('Target parent folder does not exist');
        }
      }

      const movedFolder = await moveFolderToParent(id, newParentId);
      logger.info(`Folder moved: ${id} to parent: ${newParentId} by admin: ${adminId}`);

      return movedFolder;
    } catch (error) {
      logger.error(`Move folder error for ID ${id}:`, error);
      throw error;
    }
  }

  // Get folder path (breadcrumb)
  static async getFolderPath(id) {
    try {
      const path = [];
      let currentId = id;

      while (currentId) {
        const folder = await getFolderById(currentId);
        path.unshift({
          id: folder.id,
          name: folder.name
        });
        currentId = folder.parent_id;
      }

      return path;
    } catch (error) {
      logger.error(`Get folder path error for ID ${id}:`, error);
      throw error;
    }
  }
}

export default FolderService;
