-- ============================================================================
-- Reset Today's Progress (Simple Version)
-- ============================================================================
-- Just copy and paste these queries into Supabase SQL Editor

-- 1. Delete today's expression progress
DELETE FROM user_expression_progress
WHERE DATE(completed_at) = CURRENT_DATE;

-- 2. Delete today's session progress
DELETE FROM user_session_progress
WHERE DATE(completed_at) = CURRENT_DATE
  AND status = 'completed';

-- 3. Delete today's daily stats
DELETE FROM daily_study_stats
WHERE study_date = TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD');

-- 4. Verify (should show 0 for all)
SELECT
  'Expression Progress' as table_name,
  COUNT(*) as today_count
FROM user_expression_progress
WHERE DATE(completed_at) = CURRENT_DATE

UNION ALL

SELECT
  'Session Progress' as table_name,
  COUNT(*) as today_count
FROM user_session_progress
WHERE DATE(completed_at) = CURRENT_DATE
  AND status = 'completed'

UNION ALL

SELECT
  'Daily Stats' as table_name,
  COUNT(*) as today_count
FROM daily_study_stats
WHERE study_date = TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD');
