-- Migration: Make documents storage bucket public
-- Purpose: Allow users to access PDF files via public URLs after purchase
-- Date: 2025-11-08

-- =====================================================
-- Step 1: Update bucket to be public
-- =====================================================

UPDATE storage.buckets
SET public = true
WHERE id = 'documents';

-- =====================================================
-- Step 2: Add storage policy to allow public reads
-- =====================================================

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Public read access for documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view purchased documents" ON storage.objects;

-- Create new policy for public read access
CREATE POLICY "Public read access for documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'documents');

-- =====================================================
-- Step 3: Verify the changes
-- =====================================================

-- Check bucket is now public
SELECT id, name, public
FROM storage.buckets
WHERE id = 'documents';

-- Expected result: public = true

-- =====================================================
-- IMPORTANT: Service role policies remain for upload/delete
-- =====================================================
-- The existing service role policies allow admin to upload/delete
-- The new public policy allows anyone to READ files
-- This matches the business model: admin uploads, users view after payment
