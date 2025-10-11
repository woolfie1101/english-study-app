-- Add Shadowing category
INSERT INTO categories (name, slug, display_order, icon)
VALUES ('Shadowing', 'shadowing', 5, '🎤')
ON CONFLICT (slug) DO NOTHING;
