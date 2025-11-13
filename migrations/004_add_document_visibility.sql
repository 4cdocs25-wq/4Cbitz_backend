-- Migration: Add document visibility toggle
-- Description: Adds is_visible field to control whether documents are shown to users

-- Add visibility column to documents table
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE;

-- Add comment
COMMENT ON COLUMN documents.is_visible IS 'Controls whether document is visible to regular users. Admin can always see all documents.';

-- Create index for faster filtering by visibility
CREATE INDEX IF NOT EXISTS idx_documents_visibility ON documents(is_visible, status);

-- Set all existing documents to visible by default
UPDATE documents SET is_visible = TRUE WHERE is_visible IS NULL;
