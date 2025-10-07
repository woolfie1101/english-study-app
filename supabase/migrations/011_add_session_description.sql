-- =====================================================
-- 011_add_session_description.sql
-- Add description column to sessions table
-- Remove description column from expressions table (if exists)
-- =====================================================

-- Add description column to sessions table (for pattern description)
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS description TEXT;

COMMENT ON COLUMN sessions.description IS '패턴(오늘의 표현)에 대한 추가 설명 (선택적)';

-- Remove description column from expressions table if it exists
-- (description should be on sessions, not expressions)
ALTER TABLE expressions
DROP COLUMN IF EXISTS description;

-- Update sample data with descriptions from CSV
-- Session 2: I'm getting ~
UPDATE sessions
SET description = '변해가는 감정이나 상태를 표현할 때 쓸 수 있는 패턴. getting 뒤에 단어를 넣어 빈번하게 사용 가능.'
WHERE title = 'I''m getting ~';

-- Session 5: What's the best way to ~ ?
UPDATE sessions
SET description = '상대방에게 방법이나 조언을 얻을 때 사용할 수 있는 표현. 낯선 곳에 가서 길을 물어볼 때도 유용하게 사용 가능'
WHERE title = 'What''s the best way to ~ ?';

-- Verify updates
SELECT
  id,
  session_number,
  title,
  description
FROM sessions
WHERE description IS NOT NULL
ORDER BY session_number;
