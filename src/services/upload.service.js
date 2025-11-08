import { supabaseAdmin } from '../config/database.js';
import logger from '../utils/logger.js';
import path from 'path';

class UploadService {
  // Upload file to Supabase Storage
  static async uploadDocument(file, adminId) {
    try {
      const bucketName = process.env.STORAGE_BUCKET_NAME || 'documents';

      // Generate unique filename
      const timestamp = Date.now();
      const fileExt = path.extname(file.originalname);
      const fileName = `${adminId}/${timestamp}${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabaseAdmin.storage
        .from(bucketName)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) {
        logger.error('Supabase storage upload error:', error);
        throw error;
      }

      // Get public URL
      const { data: publicUrlData } = supabaseAdmin.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      logger.info(`File uploaded successfully: ${fileName}`);

      return {
        fileName: data.path,
        fileUrl: publicUrlData.publicUrl
      };
    } catch (error) {
      logger.error('Upload document error:', error);
      throw error;
    }
  }

  // Delete file from Supabase Storage
  static async deleteDocument(fileName) {
    try {
      const bucketName = process.env.STORAGE_BUCKET_NAME || 'documents';

      const { data, error } = await supabaseAdmin.storage
        .from(bucketName)
        .remove([fileName]);

      if (error) {
        logger.error('Supabase storage delete error:', error);
        throw error;
      }

      logger.info(`File deleted successfully: ${fileName}`);
      return data;
    } catch (error) {
      logger.error('Delete document error:', error);
      throw error;
    }
  }

  // Get signed URL for secure access (optional - for enhanced security)
  static async getSignedUrl(fileName, expiresIn = 3600) {
    try {
      const bucketName = process.env.STORAGE_BUCKET_NAME || 'documents';

      const { data, error } = await supabaseAdmin.storage
        .from(bucketName)
        .createSignedUrl(fileName, expiresIn);

      if (error) {
        logger.error('Create signed URL error:', error);
        throw error;
      }

      return data.signedUrl;
    } catch (error) {
      logger.error('Get signed URL error:', error);
      throw error;
    }
  }
}

export default UploadService;
