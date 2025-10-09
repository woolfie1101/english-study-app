-- ============================================================================
-- Reset Today's Progress
-- ============================================================================
-- This query deletes all completion records for today's date
-- Use this to reset daily progress at the start of a new day

-- Get today's date in the database timezone
DO $$
DECLARE
  today_date DATE := CURRENT_DATE;
BEGIN
  RAISE NOTICE 'Resetting progress for date: %', today_date;

  -- Delete today's expression progress
  DELETE FROM user_expression_progress
  WHERE DATE(completed_at) = today_date;

  RAISE NOTICE 'Deleted % expression progress records',
    (SELECT COUNT(*) FROM user_expression_progress WHERE DATE(completed_at) = today_date);

  -- Delete today's session progress
  DELETE FROM user_session_progress
  WHERE DATE(completed_at) = today_date
    AND status = 'completed';

  RAISE NOTICE 'Deleted % session progress records',
    (SELECT COUNT(*) FROM user_session_progress
     WHERE DATE(completed_at) = today_date AND status = 'completed');

  -- Delete today's daily stats
  DELETE FROM daily_study_stats
  WHERE study_date = today_date::TEXT;

  RAISE NOTICE 'Deleted % daily stats records',
    (SELECT COUNT(*) FROM daily_study_stats WHERE study_date = today_date::TEXT);

  RAISE NOTICE 'Reset complete!';
END $$;

-- Verify deletion
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
WHERE study_date = CURRENT_DATE::TEXT;
