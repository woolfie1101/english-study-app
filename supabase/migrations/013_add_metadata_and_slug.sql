-- =====================================================
-- 013_add_metadata_and_slug.sql
-- Add metadata JSONB columns and category slug for scalability
-- =====================================================

-- ========================================
-- 1. Add slug to categories table
-- ========================================
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

COMMENT ON COLUMN categories.slug IS '카테고리 URL 슬러그 (audio 파일 경로에 사용)';

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Update existing category with slug
UPDATE categories
SET slug = 'daily-expression'
WHERE name = 'Daily Expression';

-- ========================================
-- 2. Add metadata JSONB columns
-- ========================================

-- Add metadata to sessions table
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN sessions.metadata IS '카테고리별 고유 데이터 (JSON 형식)';

-- Add metadata to expressions table
ALTER TABLE expressions
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN expressions.metadata IS '표현별 고유 데이터 (JSON 형식, 예: 난이도, 출처 등)';

-- Create GIN indexes for efficient JSONB queries
CREATE INDEX IF NOT EXISTS idx_sessions_metadata ON sessions USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_expressions_metadata ON expressions USING GIN (metadata);

-- ========================================
-- 3. Add sample metadata to existing data
-- ========================================

-- Update sessions with metadata
UPDATE sessions
SET metadata = jsonb_build_object(
  'type', 'daily_expression',
  'difficulty', 'beginner'
)
WHERE category_id IN (SELECT id FROM categories WHERE slug = 'daily-expression');

-- Update expressions with metadata
UPDATE expressions
SET metadata = jsonb_build_object(
  'type', 'daily_expression'
)
WHERE session_id IN (
  SELECT id FROM sessions
  WHERE category_id IN (SELECT id FROM categories WHERE slug = 'daily-expression')
);

-- ========================================
-- 4. Verify updates
-- ========================================

SELECT
  c.name,
  c.slug,
  COUNT(s.id) as session_count
FROM categories c
LEFT JOIN sessions s ON s.category_id = c.id
GROUP BY c.id, c.name, c.slug
ORDER BY c.display_order;
