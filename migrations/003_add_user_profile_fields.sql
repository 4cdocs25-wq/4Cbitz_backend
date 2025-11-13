-- Migration: Add user profile fields
-- Description: Adds industry, contact_number, address, and profile_completed fields to users table

-- Add new columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS contact_number TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- Create index for faster profile completion checks
CREATE INDEX IF NOT EXISTS idx_users_profile_completed ON users(profile_completed);

-- Add comment to document the purpose of these fields
COMMENT ON COLUMN users.industry IS 'User business industry';
COMMENT ON COLUMN users.contact_number IS 'User contact phone number';
COMMENT ON COLUMN users.address IS 'User business address (optional)';
COMMENT ON COLUMN users.profile_completed IS 'Flag indicating whether user has completed their profile information';
