-- Migration: Add Footer Settings
-- Created: 2025-11-18
-- Description: Adds footer contact information settings (address, email, tel)

-- Insert Footer Address
INSERT INTO settings (key, value, description)
VALUES (
  'footer_address',
  'P O Box 48707, Level 14, Boulevard Plaza Tower 1, Downtown Dubai, Dubai, UAE.',
  'Footer company address displayed on landing page'
)
ON CONFLICT (key) DO NOTHING;

-- Insert Footer Email
INSERT INTO settings (key, value, description)
VALUES (
  'footer_email',
  '4cdoc@4CBZ.com',
  'Footer contact email displayed on landing page'
)
ON CONFLICT (key) DO NOTHING;

-- Insert Footer Telephone
INSERT INTO settings (key, value, description)
VALUES (
  'footer_tel',
  '+971 4 2288006',
  'Footer contact telephone number displayed on landing page'
)
ON CONFLICT (key) DO NOTHING;
