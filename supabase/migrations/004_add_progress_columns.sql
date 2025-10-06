-- ============================================================================
-- Migration 004: Add Progress Tracking Columns
-- ============================================================================
-- Purpose: Add missing columns for user progress tracking
-- Date: 2024
-- ============================================================================

-- Add category_id to user_session_progress (for easier querying)
ALTER TABLE user_session_progress
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE CASCADE;

-- Fill category_id from sessions table for existing records
UPDATE user_session_progress usp
SET category_id = s.category_id
FROM sessions s
WHERE usp.session_id = s.id
AND usp.category_id IS NULL;

-- Add session_id and category_id to user_expression_progress
ALTER TABLE user_expression_progress
ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES sessions(id) ON DELETE CASCADE;

ALTER TABLE user_expression_progress
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE CASCADE;

-- Fill session_id and category_id from expressions table for existing records
UPDATE user_expression_progress uep
SET session_id = e.session_id,
    category_id = s.category_id
FROM expressions e
JOIN sessions s ON e.session_id = s.id
WHERE uep.expression_id = e.id
AND (uep.session_id IS NULL OR uep.category_id IS NULL);

-- Add expressions_completed and study_time_minutes to daily_study_stats
ALTER TABLE daily_study_stats
ADD COLUMN IF NOT EXISTS expressions_completed INT DEFAULT 0;

ALTER TABLE daily_study_stats
ADD COLUMN IF NOT EXISTS study_time_minutes INT DEFAULT 0;
