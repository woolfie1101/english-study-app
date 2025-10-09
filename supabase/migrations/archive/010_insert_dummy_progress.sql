-- =====================================================
-- 010_insert_dummy_progress.sql
-- Insert dummy progress data for past dates for testing
-- =====================================================

-- Test user ID
DO $$
DECLARE
  test_user_id UUID := '00000000-0000-0000-0000-000000000001';
  daily_category_id UUID;
  session_1_id UUID;
  session_2_id UUID;
  session_3_id UUID;
BEGIN
  -- Get Daily Expression category ID
  SELECT id INTO daily_category_id
  FROM categories
  WHERE name = 'Daily Expression'
  LIMIT 1;

  -- Get first 3 session IDs
  SELECT id INTO session_1_id
  FROM sessions
  WHERE category_id = daily_category_id
  ORDER BY session_number
  LIMIT 1 OFFSET 0;

  SELECT id INTO session_2_id
  FROM sessions
  WHERE category_id = daily_category_id
  ORDER BY session_number
  LIMIT 1 OFFSET 1;

  SELECT id INTO session_3_id
  FROM sessions
  WHERE category_id = daily_category_id
  ORDER BY session_number
  LIMIT 1 OFFSET 2;

  -- ========================================
  -- 5 days ago: 1 session completed (20%)
  -- ========================================

  -- Session progress
  INSERT INTO user_session_progress (user_id, session_id, category_id, status, completed_at, created_at, updated_at)
  VALUES (
    test_user_id,
    session_1_id,
    daily_category_id,
    'completed',
    (CURRENT_DATE - INTERVAL '5 days')::timestamp,
    (CURRENT_DATE - INTERVAL '5 days')::timestamp,
    (CURRENT_DATE - INTERVAL '5 days')::timestamp
  )
  ON CONFLICT DO NOTHING;

  -- Daily stats
  INSERT INTO daily_study_stats (user_id, category_id, study_date, sessions_completed, total_sessions, created_at, updated_at)
  VALUES (
    test_user_id,
    daily_category_id,
    (CURRENT_DATE - INTERVAL '5 days')::date,
    1,
    5,
    (CURRENT_DATE - INTERVAL '5 days')::timestamp,
    (CURRENT_DATE - INTERVAL '5 days')::timestamp
  )
  ON CONFLICT (user_id, category_id, study_date)
  DO UPDATE SET
    sessions_completed = 1,
    total_sessions = 5,
    updated_at = (CURRENT_DATE - INTERVAL '5 days')::timestamp;

  -- ========================================
  -- 3 days ago: 3 sessions completed (60%)
  -- ========================================

  -- Session progress
  INSERT INTO user_session_progress (user_id, session_id, category_id, status, completed_at, created_at, updated_at)
  VALUES
    (test_user_id, session_1_id, daily_category_id, 'completed', (CURRENT_DATE - INTERVAL '3 days')::timestamp, (CURRENT_DATE - INTERVAL '3 days')::timestamp, (CURRENT_DATE - INTERVAL '3 days')::timestamp),
    (test_user_id, session_2_id, daily_category_id, 'completed', (CURRENT_DATE - INTERVAL '3 days')::timestamp, (CURRENT_DATE - INTERVAL '3 days')::timestamp, (CURRENT_DATE - INTERVAL '3 days')::timestamp),
    (test_user_id, session_3_id, daily_category_id, 'completed', (CURRENT_DATE - INTERVAL '3 days')::timestamp, (CURRENT_DATE - INTERVAL '3 days')::timestamp, (CURRENT_DATE - INTERVAL '3 days')::timestamp)
  ON CONFLICT DO NOTHING;

  -- Daily stats
  INSERT INTO daily_study_stats (user_id, category_id, study_date, sessions_completed, total_sessions, created_at, updated_at)
  VALUES (
    test_user_id,
    daily_category_id,
    (CURRENT_DATE - INTERVAL '3 days')::date,
    3,
    5,
    (CURRENT_DATE - INTERVAL '3 days')::timestamp,
    (CURRENT_DATE - INTERVAL '3 days')::timestamp
  )
  ON CONFLICT (user_id, category_id, study_date)
  DO UPDATE SET
    sessions_completed = 3,
    total_sessions = 5,
    updated_at = (CURRENT_DATE - INTERVAL '3 days')::timestamp;

  -- ========================================
  -- Yesterday: 5 sessions completed (100%)
  -- ========================================

  -- Get all 5 session IDs
  DECLARE
    session_ids UUID[];
  BEGIN
    SELECT ARRAY_AGG(id) INTO session_ids
    FROM (
      SELECT id
      FROM sessions
      WHERE category_id = daily_category_id
      ORDER BY session_number
      LIMIT 5
    ) s;

    -- Insert session progress for all 5 sessions
    FOR i IN 1..5 LOOP
      INSERT INTO user_session_progress (user_id, session_id, category_id, status, completed_at, created_at, updated_at)
      VALUES (
        test_user_id,
        session_ids[i],
        daily_category_id,
        'completed',
        (CURRENT_DATE - INTERVAL '1 day')::timestamp,
        (CURRENT_DATE - INTERVAL '1 day')::timestamp,
        (CURRENT_DATE - INTERVAL '1 day')::timestamp
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END;

  -- Daily stats
  INSERT INTO daily_study_stats (user_id, category_id, study_date, sessions_completed, total_sessions, created_at, updated_at)
  VALUES (
    test_user_id,
    daily_category_id,
    (CURRENT_DATE - INTERVAL '1 day')::date,
    5,
    5,
    (CURRENT_DATE - INTERVAL '1 day')::timestamp,
    (CURRENT_DATE - INTERVAL '1 day')::timestamp
  )
  ON CONFLICT (user_id, category_id, study_date)
  DO UPDATE SET
    sessions_completed = 5,
    total_sessions = 5,
    updated_at = (CURRENT_DATE - INTERVAL '1 day')::timestamp;

END $$;

-- Verify inserted data
SELECT
  study_date,
  sessions_completed,
  total_sessions,
  ROUND((sessions_completed::decimal / total_sessions * 100), 0) as percentage
FROM daily_study_stats
WHERE user_id = '00000000-0000-0000-0000-000000000001'
ORDER BY study_date DESC
LIMIT 10;
