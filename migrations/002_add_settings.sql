-- Migration: Add Settings Table
-- Description: Creates settings table for platform configurations (subscription price, etc.)
-- Date: 2025-11-13

-- ============= CREATE SETTINGS TABLE =============

CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============= CREATE INDEXES =============

-- Index on key for faster lookups
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- ============= ADD CONSTRAINTS =============

-- Ensure setting keys are not empty
ALTER TABLE settings
ADD CONSTRAINT check_setting_key_not_empty CHECK (char_length(trim(key)) > 0);

-- Ensure setting values are not empty
ALTER TABLE settings
ADD CONSTRAINT check_setting_value_not_empty CHECK (char_length(trim(value)) > 0);

-- ============= SEED DEFAULT SETTINGS =============

-- Insert default lifetime subscription price
INSERT INTO settings (key, value, description)
VALUES
  ('lifetime_subscription_price', '29.99', 'Price for lifetime subscription access in USD')
ON CONFLICT (key) DO NOTHING;

-- ============= COMMENTS =============

COMMENT ON TABLE settings IS 'Platform configuration settings';
COMMENT ON COLUMN settings.key IS 'Unique setting identifier (e.g., lifetime_subscription_price)';
COMMENT ON COLUMN settings.value IS 'Setting value stored as text';
COMMENT ON COLUMN settings.description IS 'Human-readable description of the setting';

-- ============= VERIFICATION =============

-- Verify the migration
SELECT * FROM settings;
