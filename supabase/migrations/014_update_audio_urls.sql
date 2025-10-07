-- =====================================================
-- 014_update_audio_urls.sql
-- Update existing audio URLs to include category slug path
-- =====================================================

-- Update expressions audio_url to include category slug
-- Before: Daily_Expressions_001_1.mp3
-- After: daily-expression/Daily_Expressions_001_1.mp3

UPDATE expressions
SET audio_url = 'daily-expression/' || audio_url
WHERE audio_url IS NOT NULL
  AND audio_url NOT LIKE '%/%'  -- Only update if it doesn't already have a path
  AND session_id IN (
    SELECT s.id
    FROM sessions s
    JOIN categories c ON s.category_id = c.id
    WHERE c.slug = 'daily-expression'
  );

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
