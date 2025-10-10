-- Reset Conversational Expression category data
-- Delete all expressions and sessions for Conversational Expression category

DO $$
DECLARE
  conversational_category_id UUID;
BEGIN
  -- Get Conversational Expression category ID
  SELECT id INTO conversational_category_id
  FROM categories
  WHERE slug = 'conversational-expression';

  -- Delete user progress for conversational sessions
  DELETE FROM user_expression_progress
  WHERE expression_id IN (
    SELECT e.id
    FROM expressions e
    JOIN sessions s ON e.session_id = s.id
    WHERE s.category_id = conversational_category_id
  );

  DELETE FROM user_session_progress
  WHERE category_id = conversational_category_id;

  -- Delete daily stats for conversational category
  DELETE FROM daily_study_stats
  WHERE category_id = conversational_category_id;

  -- Delete expressions
  DELETE FROM expressions
  WHERE session_id IN (
    SELECT id FROM sessions WHERE category_id = conversational_category_id
  );

  -- Delete sessions
  DELETE FROM sessions
  WHERE category_id = conversational_category_id;

  RAISE NOTICE 'Conversational Expression category data has been reset';
END $$;
