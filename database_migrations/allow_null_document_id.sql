-- Migration: Allow NULL document_id for lifetime subscriptions
-- Purpose: Enable support for lifetime access purchases (not tied to specific documents)
-- Date: 2025-11-08

-- =====================================================
-- Step 1: Alter payments table to allow NULL document_id
-- =====================================================

ALTER TABLE payments
  ALTER COLUMN document_id DROP NOT NULL;

COMMENT ON COLUMN payments.document_id IS
'Document ID for individual purchases, NULL for lifetime subscriptions';

-- =====================================================
-- Step 2: Alter purchases table to allow NULL document_id
-- =====================================================

ALTER TABLE purchases
  ALTER COLUMN document_id DROP NOT NULL;

COMMENT ON COLUMN purchases.document_id IS
'Document ID for individual purchases, NULL for lifetime access to all documents';

-- =====================================================
-- Step 3: Verify the changes
-- =====================================================

-- Check payments table structure
SELECT
  column_name,
  is_nullable,
  data_type
FROM information_schema.columns
WHERE table_name = 'payments'
  AND column_name = 'document_id';

-- Check purchases table structure
SELECT
  column_name,
  is_nullable,
  data_type
FROM information_schema.columns
WHERE table_name = 'purchases'
  AND column_name = 'document_id';

-- =====================================================
-- Expected results:
-- Both columns should show is_nullable = 'YES'
-- =====================================================
