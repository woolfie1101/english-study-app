-- ============================================================================
-- RESET TODAY'S COMPLETION DATA
-- ============================================================================
-- 오늘 날짜의 모든 완료 기록을 삭제합니다.
--
-- 테이블 구조 참고:
-- - user_expression_progress.completed_at: TIMESTAMPTZ
-- - user_session_progress.completed_at: TIMESTAMPTZ
-- - daily_study_stats.study_date: DATE
-- ============================================================================

-- 1. 오늘 완료한 표현 기록 삭제
DELETE FROM user_expression_progress
WHERE DATE(completed_at) = CURRENT_DATE;

-- 2. 오늘 완료한 세션 기록 삭제
DELETE FROM user_session_progress
WHERE DATE(completed_at) = CURRENT_DATE
  AND status = 'completed';

-- 3. 오늘의 일별 통계 삭제
DELETE FROM daily_study_stats
WHERE study_date = CURRENT_DATE;

-- ============================================================================
-- 확인 쿼리 (모두 0이어야 정상)
-- ============================================================================

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
WHERE study_date = CURRENT_DATE;
