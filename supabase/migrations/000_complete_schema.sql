-- ============================================================================
-- COMPLETE DATABASE SCHEMA
-- ============================================================================
-- English Study App - Complete database schema
-- Generated: 2025-10-09
-- This file represents the final state of all migrations combined
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: categories
-- ============================================================================
-- Purpose: Learning category master data (Daily Expression, Pattern, Grammar, etc.)
-- UI: HomeScreen category cards
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  display_order INT,
  total_sessions INT DEFAULT 0,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT categories_slug_key UNIQUE (slug)
);

COMMENT ON COLUMN categories.slug IS '카테고리 URL 슬러그 (audio 파일 경로에 사용)';

-- ============================================================================
-- TABLE: sessions
-- ============================================================================
-- Purpose: Individual learning sessions within each category
-- UI: CategoryScreen session list
-- ============================================================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  session_number INT NOT NULL,
  title TEXT NOT NULL,
  pattern_english TEXT,
  pattern_korean TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT sessions_category_id_session_number_key UNIQUE (category_id, session_number)
);

COMMENT ON COLUMN sessions.description IS '패턴(오늘의 표현)에 대한 추가 설명 (선택적)';
COMMENT ON COLUMN sessions.metadata IS '카테고리별 고유 데이터 (JSON 형식)';

-- ============================================================================
-- TABLE: expressions
-- ============================================================================
-- Purpose: English expressions to learn within each session
-- UI: SessionDetailScreen expression cards
-- ============================================================================
CREATE TABLE IF NOT EXISTS expressions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  display_order INT NOT NULL,
  english TEXT NOT NULL,
  korean TEXT NOT NULL,
  audio_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON COLUMN expressions.metadata IS '표현별 고유 데이터 (JSON 형식, 예: 난이도, 출처 등)';

-- ============================================================================
-- TABLE: user_session_progress
-- ============================================================================
-- Purpose: Track user session completion status
-- Status: not-started, in-progress, completed
-- UI: CategoryScreen checkmarks and progress indicators
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_session_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('not-started', 'in-progress', 'completed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT user_session_progress_user_id_session_id_key UNIQUE (user_id, session_id)
);

-- ============================================================================
-- TABLE: user_expression_progress
-- ============================================================================
-- Purpose: Track individual expression completion
-- UI: SessionDetailScreen Complete button state
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_expression_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expression_id UUID NOT NULL REFERENCES expressions(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT user_expression_progress_user_id_expression_id_key UNIQUE (user_id, expression_id)
);

-- ============================================================================
-- TABLE: daily_study_stats
-- ============================================================================
-- Purpose: Daily study statistics aggregated by date and category
-- UI: CalendarScreen daily completion percentages
-- ============================================================================
CREATE TABLE IF NOT EXISTS daily_study_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  study_date DATE NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  sessions_completed INT DEFAULT 0,
  total_sessions INT DEFAULT 0,
  expressions_completed INT DEFAULT 0,
  study_time_minutes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT daily_study_stats_user_id_study_date_category_id_key UNIQUE (user_id, study_date, category_id)
);

-- ============================================================================
-- TABLE: user_settings
-- ============================================================================
-- Purpose: User app settings
-- UI: SettingsScreen toggle switches
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  auto_play_audio BOOLEAN DEFAULT true,
  daily_reminder BOOLEAN DEFAULT false,
  dark_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT user_settings_user_id_key UNIQUE (user_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_sessions_category_id ON sessions(category_id);
CREATE INDEX IF NOT EXISTS idx_sessions_metadata ON sessions USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_expressions_session_id ON expressions(session_id);
CREATE INDEX IF NOT EXISTS idx_expressions_metadata ON expressions USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_user_session_progress_user_id ON user_session_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_session_progress_session_id ON user_session_progress(session_id);
CREATE INDEX IF NOT EXISTS idx_user_expression_progress_user_id ON user_expression_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_expression_progress_expression_id ON user_expression_progress(expression_id);
CREATE INDEX IF NOT EXISTS idx_daily_study_stats_user_date ON daily_study_stats(user_id, study_date);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Get categories with daily progress (TODAY only)
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
BEGIN
  RETURN QUERY
  SELECT
    p_user_id as user_id,
    c.id as category_id,
    c.name as category_name,
    c.slug,
    c.display_order,
    COUNT(DISTINCT s.id) as total_sessions,
    -- Only count sessions completed TODAY
    COUNT(DISTINCT CASE
      WHEN usp.status = 'completed'
        AND DATE(usp.completed_at) = CURRENT_DATE
      THEN s.id
    END) as completed_sessions,
    ROUND(
      100.0 * COUNT(DISTINCT CASE
        WHEN usp.status = 'completed'
          AND DATE(usp.completed_at) = CURRENT_DATE
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

-- ============================================================================
-- TRIGGERS
-- ============================================================================
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expressions_updated_at
  BEFORE UPDATE ON expressions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_session_progress_updated_at
  BEFORE UPDATE ON user_session_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_study_stats_updated_at
  BEFORE UPDATE ON daily_study_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_session_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_expression_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_study_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Categories: Public read, authenticated can manage
CREATE POLICY "Categories are viewable by all users"
  ON categories FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert categories"
  ON categories FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update categories"
  ON categories FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete categories"
  ON categories FOR DELETE
  USING (auth.role() = 'authenticated');

-- Sessions: Public read, authenticated can manage
CREATE POLICY "Sessions are viewable by all users"
  ON sessions FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update sessions"
  ON sessions FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete sessions"
  ON sessions FOR DELETE
  USING (auth.role() = 'authenticated');

-- Expressions: Public read, authenticated can manage
CREATE POLICY "Expressions are viewable by all users"
  ON expressions FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert expressions"
  ON expressions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update expressions"
  ON expressions FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete expressions"
  ON expressions FOR DELETE
  USING (auth.role() = 'authenticated');

-- User session progress: Users can only access their own (or test user)
CREATE POLICY "Users can view own session progress"
  ON user_session_progress FOR SELECT
  USING (user_id = auth.uid() OR user_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Users can insert own session progress"
  ON user_session_progress FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Users can update own session progress"
  ON user_session_progress FOR UPDATE
  USING (user_id = auth.uid() OR user_id = '00000000-0000-0000-0000-000000000001');

-- User expression progress: Users can only access their own (or test user)
CREATE POLICY "Users can view own expression progress"
  ON user_expression_progress FOR SELECT
  USING (user_id = auth.uid() OR user_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Users can insert own expression progress"
  ON user_expression_progress FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Users can update own expression progress"
  ON user_expression_progress FOR UPDATE
  USING (user_id = auth.uid() OR user_id = '00000000-0000-0000-0000-000000000001');

-- Daily study stats: Users can only access their own (or test user)
CREATE POLICY "Users can view own daily stats"
  ON daily_study_stats FOR SELECT
  USING (user_id = auth.uid() OR user_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Users can insert own daily stats"
  ON daily_study_stats FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Users can update own daily stats"
  ON daily_study_stats FOR UPDATE
  USING (user_id = auth.uid() OR user_id = '00000000-0000-0000-0000-000000000001');

-- User settings: Users can only access their own (or test user)
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (user_id = auth.uid() OR user_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (user_id = auth.uid() OR user_id = '00000000-0000-0000-0000-000000000001');

-- ============================================================================
-- STORAGE BUCKETS & POLICIES
-- ============================================================================

-- Create audio-files bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-files', 'audio-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for audio-files bucket
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'audio-files');

CREATE POLICY "Authenticated users can upload audio files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'audio-files' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update audio files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'audio-files' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete audio files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'audio-files' AND auth.role() = 'authenticated');

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
