-- ============================================================================
-- UTILITY: Reset Test User Progress Data
-- ============================================================================
-- Purpose: Delete all progress data for test user (use for testing)
-- WARNING: This will delete all progress data for the test user!
-- Date: 2024
-- ============================================================================

-- Delete all progress data for test user
DELETE FROM user_expression_progress
WHERE user_id = '00000000-0000-0000-0000-000000000001';

DELETE FROM user_session_progress
WHERE user_id = '00000000-0000-0000-0000-000000000001';

DELETE FROM daily_study_stats
WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- NOTE: This does NOT delete the test user itself or content data
-- (categories, sessions, expressions remain intact)
