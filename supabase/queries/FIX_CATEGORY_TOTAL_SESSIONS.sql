-- ============================================================================
-- FIX CATEGORY TOTAL SESSIONS
-- ============================================================================
-- categories 테이블의 total_sessions 값을 실제 세션 수로 업데이트합니다.

-- 모든 카테고리의 total_sessions를 실제 세션 수로 업데이트
UPDATE categories
SET total_sessions = (
  SELECT COUNT(*)
  FROM sessions
  WHERE sessions.category_id = categories.id
);

-- 결과 확인
SELECT
  c.name,
  c.total_sessions as stored_count,
  COUNT(s.id) as actual_count
FROM categories c
LEFT JOIN sessions s ON s.category_id = c.id
GROUP BY c.id, c.name, c.total_sessions;
