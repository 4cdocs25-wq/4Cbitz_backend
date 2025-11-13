# Database Migrations

This directory contains SQL migration files for the 4Cbitz database.

## How to Run Migrations in Supabase

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of the migration file (e.g., `001_add_folders.sql`)
5. Paste into the SQL editor
6. Click **Run** to execute the migration
7. Check the output for any errors

### Option 2: Supabase CLI

If you have the Supabase CLI installed:

```bash
# From the backend directory
supabase db reset

# Or apply specific migration
supabase db push
```

## Migration Files

- `001_add_folders.sql` - Creates folders table and adds folder_id to documents table

## Verification

After running a migration, you can verify it was successful by running the verification queries at the bottom of each migration file (uncomment them first).

## Rollback

If you need to rollback changes, use the SQL Editor to manually drop tables/columns:

```sql
-- Rollback for 001_add_folders.sql
ALTER TABLE documents DROP COLUMN IF EXISTS folder_id;
DROP TABLE IF EXISTS folders CASCADE;
```

⚠️ **Warning**: Be careful with rollbacks in production. Always backup your data first.
