-- ========================================
-- EchoSprite Database Schema
-- Migration 002: Avatar Profiles System
-- ========================================

-- Create avatar_profiles table (replaces single avatar per user)
CREATE TABLE IF NOT EXISTS avatar_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    profile_name VARCHAR(100) NOT NULL,
    profile_slug VARCHAR(100) NOT NULL, -- URL-friendly version
    is_active BOOLEAN DEFAULT FALSE,
    idle_image TEXT,
    talking_image TEXT,
    muted_image TEXT,
    deafened_image TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, profile_slug)
);

CREATE INDEX IF NOT EXISTS idx_avatar_profiles_user_id ON avatar_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_avatar_profiles_active ON avatar_profiles(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_avatar_profiles_slug ON avatar_profiles(user_id, profile_slug);

-- Migrate existing avatars to profiles
-- This creates a "default" profile for each existing avatar
INSERT INTO avatar_profiles (user_id, profile_name, profile_slug, is_active, idle_image, talking_image, muted_image, deafened_image, settings, created_at, updated_at)
SELECT
    user_id,
    'Default' as profile_name,
    'default' as profile_slug,
    TRUE as is_active,
    idle_image,
    talking_image,
    muted_image,
    deafened_image,
    settings,
    created_at,
    updated_at
FROM avatars
WHERE idle_image IS NOT NULL OR talking_image IS NOT NULL
ON CONFLICT (user_id, profile_slug) DO NOTHING;

-- Note: Keep the old avatars table for now for backward compatibility
-- We can drop it later after confirming migration worked

-- Add constraint: Each user can have only one active profile at a time
CREATE OR REPLACE FUNCTION ensure_one_active_profile()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_active = TRUE THEN
        -- Deactivate all other profiles for this user
        UPDATE avatar_profiles
        SET is_active = FALSE
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ensure_one_active_profile ON avatar_profiles;
CREATE TRIGGER trigger_ensure_one_active_profile
    BEFORE INSERT OR UPDATE ON avatar_profiles
    FOR EACH ROW
    EXECUTE FUNCTION ensure_one_active_profile();

-- Success message
SELECT 'Schema migration 002 completed successfully - Avatar Profiles System' AS status;
