-- Migration: Add password authentication support
-- Description: Adds password_hash and auth_method fields to support email/password login alongside Google OAuth

-- Add password hash column (nullable - existing Google OAuth users don't have passwords yet)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add authentication method column
-- Values: 'google', 'email', 'both'
-- Default to 'google' for existing users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS auth_method VARCHAR(20) DEFAULT 'google';

-- Add comment for password_hash
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password for email/password authentication. NULL for Google OAuth-only users.';

-- Add comment for auth_method
COMMENT ON COLUMN users.auth_method IS 'Authentication method: google, email, or both. Determines which login methods are available.';

-- Create index on email for faster login lookups
CREATE INDEX IF NOT EXISTS idx_users_email_auth ON users(email, auth_method);

-- Update existing users to have 'google' auth method (if not already set)
UPDATE users SET auth_method = 'google' WHERE auth_method IS NULL;
