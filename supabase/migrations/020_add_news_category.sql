-- Add News Expression category
INSERT INTO categories (name, slug, display_order, icon)
VALUES ('News Expression', 'news-expression', 2, '📰')
ON CONFLICT (slug) DO NOTHING;
