-- =====================================================
-- Vanguard Sports Academy - Add Password Change Flag
-- Migration: 004
-- Description: Add require_password_change column for temporary password flow
-- =====================================================

-- Add require_password_change column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS require_password_change BOOLEAN DEFAULT FALSE;

-- Add index for faster lookups during login
CREATE INDEX IF NOT EXISTS idx_users_require_password_change
ON users(require_password_change)
WHERE require_password_change = TRUE;

-- Add comment for documentation
COMMENT ON COLUMN users.require_password_change IS 'Flag indicating user must change password on next login (used for auto-created accounts with temporary passwords)';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
