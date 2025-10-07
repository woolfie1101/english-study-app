-- =====================================================
-- 015_revert_audio_urls.sql
-- Revert audio URLs to store only filename (remove category slug prefix)
-- =====================================================

-- Remove 'daily-expression/' prefix from audio URLs
-- After: Daily_Expressions_001_1.mp3 (filename only)
-- We'll combine with category_slug in the application code

UPDATE expressions
SET audio_url = REPLACE(audio_url, 'daily-expression/', '')
WHERE audio_url IS NOT NULL
  AND audio_url LIKE 'daily-expression/%';

-- Verify updates
SELECT
  e.id,
  e.english,
  e.audio_url,
  s.session_number,
  c.name as category_name,
  c.slug as category_slug
FROM expressions e
JOIN sessions s ON e.session_id = s.id
JOIN categories c ON s.category_id = c.id
WHERE e.audio_url IS NOT NULL
ORDER BY s.session_number, e.display_order
LIMIT 10;
