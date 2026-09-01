-- Temporary free-access campaign controls.
-- The checkout code only activates free access when enabled is true AND this end time is still in the future.

INSERT INTO settings (key, value, description)
VALUES
  ('free_access_enabled', 'false', 'Whether the temporary free lifetime-access campaign is enabled'),
  ('free_access_ends_at', '2026-09-16T18:29:59.000Z', 'UTC timestamp when the temporary free-access campaign ends')
ON CONFLICT (key) DO NOTHING;
