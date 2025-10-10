-- Reset News Expression category data
-- Delete all expressions and sessions for News Expression category

DO $$
DECLARE
  news_category_id UUID;
BEGIN
  -- Get News Expression category ID
  SELECT id INTO news_category_id
  FROM categories
  WHERE slug = 'news-expression';

  -- Delete user progress for news sessions
  DELETE FROM user_expression_progress
  WHERE expression_id IN (
    SELECT e.id
    FROM expressions e
    JOIN sessions s ON e.session_id = s.id
    WHERE s.category_id = news_category_id
  );

  DELETE FROM user_session_progress
  WHERE category_id = news_category_id;

  -- Delete daily stats for news category
  DELETE FROM daily_study_stats
  WHERE category_id = news_category_id;

  -- Delete expressions (will cascade to sessions via FK)
  DELETE FROM expressions
  WHERE session_id IN (
    SELECT id FROM sessions WHERE category_id = news_category_id
  );

  -- Delete sessions
  DELETE FROM sessions
  WHERE category_id = news_category_id;

  RAISE NOTICE 'News Expression category data has been reset';
END $$;
