-- =====================================================
-- 009_fix_daily_stats.sql
-- Fix incorrect daily_study_stats data
-- =====================================================

-- Update daily_study_stats with actual completed session counts
UPDATE daily_study_stats dss
SET sessions_completed = (
  SELECT COUNT(*)
  FROM user_session_progress usp
  WHERE usp.user_id = dss.user_id
    AND usp.category_id = dss.category_id
    AND usp.status = 'completed'
    AND usp.completed_at IS NOT NULL
)
WHERE dss.user_id = '00000000-0000-0000-0000-000000000001';
