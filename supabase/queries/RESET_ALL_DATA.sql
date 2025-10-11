-- Reset all data for fresh start after schema changes
-- This will delete all sessions, expressions, and user progress

-- 1. Delete all user progress data
DELETE FROM user_expression_progress;
DELETE FROM user_session_progress;
DELETE FROM daily_study_stats;

-- 2. Delete all expressions (will cascade from sessions)
DELETE FROM expressions;

-- 3. Delete all sessions
DELETE FROM sessions;

-- 4. Verify deletion
SELECT 'Sessions deleted' as status, COUNT(*) as remaining FROM sessions
UNION ALL
SELECT 'Expressions deleted' as status, COUNT(*) as remaining FROM expressions
UNION ALL
SELECT 'User expression progress deleted' as status, COUNT(*) as remaining FROM user_expression_progress
UNION ALL
SELECT 'User session progress deleted' as status, COUNT(*) as remaining FROM user_session_progress
UNION ALL
SELECT 'Daily stats deleted' as status, COUNT(*) as remaining FROM daily_study_stats;

-- 5. Update categories if needed (remove total_sessions column if it still exists)
-- This will be handled by migration 024_remove_total_sessions_column.sql
