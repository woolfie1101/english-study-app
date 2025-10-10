-- Add Conversational Expression category
INSERT INTO categories (name, slug, display_order, icon)
VALUES ('Conversational Expression', 'conversational-expression', 3, '💬')
ON CONFLICT (slug) DO NOTHING;

-- Add image support to sessions table via metadata
-- Images will be stored in metadata as { images: ['image1.png', 'image2.png'] }
COMMENT ON COLUMN sessions.metadata IS 'Category-specific data (JSON): pattern_audio_url, images array, etc.';
