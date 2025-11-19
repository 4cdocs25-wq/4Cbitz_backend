-- Migration: Add version field to documents table
-- Description: Adds version field for document versioning
-- Date: 2025-11-17
-- Author: Admin

-- Add version column to documents table
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS version VARCHAR(50);

-- Add comment
COMMENT ON COLUMN documents.version IS 'Document version label (e.g., v1, v2, v3). Admin-provided on upload.';

-- Create index for faster filtering/sorting by version
CREATE INDEX IF NOT EXISTS idx_documents_version ON documents(version);

-- Set existing documents to v1 by default
UPDATE documents SET version = 'v1' WHERE version IS NULL;
