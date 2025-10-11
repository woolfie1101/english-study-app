-- Add EnglishOrder category
INSERT INTO categories (name, slug, display_order, icon)
VALUES ('English Order', 'english-order', 6, '📝')
ON CONFLICT (slug) DO NOTHING;
