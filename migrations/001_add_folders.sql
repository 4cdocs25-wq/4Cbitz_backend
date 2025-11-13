-- Migration: Add Folders Table and Update Documents Table
-- Description: Creates folders table for nested folder structure and adds folder_id to documents
-- Date: 2025-11-13

-- ============= CREATE FOLDERS TABLE =============

-- Create folders table with self-referencing parent_id for nested structure
CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============= UPDATE DOCUMENTS TABLE =============

-- Add folder_id column to documents table
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES folders(id) ON DELETE SET NULL;

-- ============= CREATE INDEXES =============

-- Index on parent_id for faster tree queries
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);

-- Index on folder_id in documents for faster filtering
CREATE INDEX IF NOT EXISTS idx_documents_folder_id ON documents(folder_id);

-- Index on folder name for search functionality
CREATE INDEX IF NOT EXISTS idx_folders_name ON folders(name);

-- ============= ADD CONSTRAINTS =============

-- Ensure folder names are not empty
ALTER TABLE folders
ADD CONSTRAINT check_folder_name_not_empty CHECK (char_length(trim(name)) > 0);

-- ============= COMMENTS =============

COMMENT ON TABLE folders IS 'Hierarchical folder structure for organizing documents';
COMMENT ON COLUMN folders.name IS 'Folder name (user-facing)';
COMMENT ON COLUMN folders.parent_id IS 'Parent folder ID (NULL for root folders)';
COMMENT ON COLUMN folders.admin_id IS 'Admin user who created this folder';
COMMENT ON COLUMN documents.folder_id IS 'Folder this document belongs to (NULL for root level)';

-- ============= VERIFICATION QUERIES =============

-- Uncomment below to verify the migration after running:

-- -- Check folders table structure
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'folders';

-- -- Check documents table now has folder_id
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'documents' AND column_name = 'folder_id';

-- -- Check indexes were created
-- SELECT indexname, tablename
-- FROM pg_indexes
-- WHERE tablename IN ('folders', 'documents')
-- AND indexname LIKE 'idx_%';
