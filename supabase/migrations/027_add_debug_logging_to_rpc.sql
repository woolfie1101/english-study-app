-- Add debug logging to get_categories_with_progress function
-- This will help us see exactly what date is being used for filtering

CREATE OR REPLACE FUNCTION get_categories_with_progress(
  p_user_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'
)
RETURNS TABLE (
  user_id UUID,
  category_id UUID,
  category_name TEXT,
  slug TEXT,
  display_order INT,
  total_sessions BIGINT,
  completed_sessions BIGINT,
  percentage NUMERIC
) AS $$
DECLARE
  korea_today DATE;
  korea_now TIMESTAMPTZ;
BEGIN
  -- Get current time in Asia/Seoul timezone
  korea_now := NOW() AT TIME ZONE 'Asia/Seoul';
  korea_today := korea_now::DATE;

  -- Debug logging
  RAISE NOTICE 'UTC NOW: %, Korea NOW: %, Korea TODAY: %', NOW(), korea_now, korea_today;

  RETURN QUERY
  SELECT
    p_user_id as user_id,
    c.id as category_id,
    c.name as category_name,
    c.slug,
    c.display_order,
    COUNT(DISTINCT s.id) as total_sessions,
    -- Only count sessions completed TODAY in Korea timezone
    COUNT(DISTINCT CASE
      WHEN usp.status = 'completed'
        AND (usp.completed_at AT TIME ZONE 'Asia/Seoul')::DATE = korea_today
      THEN s.id
    END) as completed_sessions,
    ROUND(
      100.0 * COUNT(DISTINCT CASE
        WHEN usp.status = 'completed'
          AND (usp.completed_at AT TIME ZONE 'Asia/Seoul')::DATE = korea_today
        THEN s.id
      END)::numeric /
      NULLIF(COUNT(DISTINCT s.id), 0),
      2
    ) as percentage
  FROM categories c
  LEFT JOIN sessions s ON s.category_id = c.id
  LEFT JOIN user_session_progress usp ON usp.session_id = s.id
    AND usp.user_id = p_user_id
  GROUP BY c.id, c.name, c.slug, c.display_order
  ORDER BY c.display_order NULLS LAST, c.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_categories_with_progress IS 'Get categories with today''s progress in Asia/Seoul timezone. Completed count resets daily at midnight KST. Includes debug logging.';
