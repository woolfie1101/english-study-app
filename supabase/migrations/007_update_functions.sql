-- ============================================================================
-- Migration 007: Update Database Functions
-- ============================================================================
-- Purpose: Create/update functions for category progress tracking
-- Date: 2024
-- ============================================================================

-- Drop old function if exists
DROP FUNCTION IF EXISTS get_user_category_progress(UUID);
DROP FUNCTION IF EXISTS get_categories_with_progress(TEXT);

-- Create get_categories_with_progress function with UUID parameter
CREATE OR REPLACE FUNCTION get_categories_with_progress(
  p_user_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'
)
RETURNS TABLE (
  user_id UUID,
  category_id UUID,
  category_name TEXT,
  display_order INT,
  total_sessions BIGINT,
  completed_sessions BIGINT,
  percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p_user_id as user_id,
    c.id as category_id,
    c.name as category_name,
    c.display_order,
    COUNT(DISTINCT s.id) as total_sessions,
    COUNT(DISTINCT CASE WHEN usp.status = 'completed' THEN s.id END) as completed_sessions,
    ROUND(
      100.0 * COUNT(DISTINCT CASE WHEN usp.status = 'completed' THEN s.id END)::numeric /
      NULLIF(COUNT(DISTINCT s.id), 0),
      2
    ) as percentage
  FROM categories c
  LEFT JOIN sessions s ON s.category_id = c.id
  LEFT JOIN user_session_progress usp ON usp.session_id = s.id
    AND usp.user_id = p_user_id
  GROUP BY c.id, c.name, c.display_order
  ORDER BY c.display_order NULLS LAST, c.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
