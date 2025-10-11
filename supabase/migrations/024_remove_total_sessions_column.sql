-- Remove total_sessions column from categories table
-- This column is redundant as the value is calculated dynamically in get_categories_with_progress function

ALTER TABLE categories
DROP COLUMN IF EXISTS total_sessions;

-- Add comment to the table
COMMENT ON TABLE categories IS 'Category information. Total sessions count is calculated dynamically via get_categories_with_progress function.';
