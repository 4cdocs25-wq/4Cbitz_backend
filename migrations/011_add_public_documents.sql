-- Migration: Add Public Documents Table
-- Created: 2025-11-19
-- Description: Creates table for public documents with generated shareable links

-- Create public_documents table
CREATE TABLE IF NOT EXISTS public_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  public_token UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES users(id) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_public_documents_token ON public_documents(public_token);
CREATE INDEX IF NOT EXISTS idx_public_documents_admin_id ON public_documents(admin_id);
CREATE INDEX IF NOT EXISTS idx_public_documents_is_active ON public_documents(is_active);

-- Add constraints
ALTER TABLE public_documents
ADD CONSTRAINT check_title_not_empty CHECK (char_length(trim(title)) > 0);

ALTER TABLE public_documents
ADD CONSTRAINT check_file_url_not_empty CHECK (char_length(trim(file_url)) > 0);

-- Comments
COMMENT ON TABLE public_documents IS 'Publicly accessible documents with generated shareable links';
COMMENT ON COLUMN public_documents.title IS 'Document title';
COMMENT ON COLUMN public_documents.description IS 'Optional document description';
COMMENT ON COLUMN public_documents.file_url IS 'Storage path/URL for the document file';
COMMENT ON COLUMN public_documents.public_token IS 'Unique UUID token for public access URL';
COMMENT ON COLUMN public_documents.admin_id IS 'Admin user who uploaded the document';
COMMENT ON COLUMN public_documents.is_active IS 'Whether the document is active/accessible';
