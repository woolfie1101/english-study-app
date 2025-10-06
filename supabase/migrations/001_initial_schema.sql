-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CATEGORIES TABLE
-- ============================================================================
-- 목적: 학습 카테고리 마스터 데이터 관리
-- 설명: Daily Expression, Pattern, Grammar 등 학습 분류 저장
--       각 카테고리의 총 세션 수, 표시 순서, 아이콘 관리
-- UI 연결: HomeScreen의 카테고리 카드 목록
-- ============================================================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  display_order INT,
  total_sessions INT DEFAULT 0,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SESSIONS TABLE
-- ============================================================================
-- 목적: 각 카테고리 내 개별 학습 세션(강의) 정보 저장
-- 설명: 세션 번호, 제목, 패턴 영어/한글 등 학습 콘텐츠
--       카테고리별로 순차적인 세션 번호 부여
-- UI 연결: CategoryScreen의 세션 목록 (Session 1, 2, 3...)
-- ============================================================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  session_number INT NOT NULL,
  title TEXT NOT NULL,
  pattern_english TEXT,
  pattern_korean TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, session_number)
);

-- ============================================================================
-- EXPRESSIONS TABLE
-- ============================================================================
-- 목적: 각 세션 내 학습할 영어 표현들을 저장
-- 설명: 영어 문장, 한글 번역, 오디오 파일 URL
--       표시 순서로 정렬하여 UI에 표시
-- UI 연결: SessionDetailScreen의 표현 카드들
-- ============================================================================
CREATE TABLE expressions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  display_order INT NOT NULL,
  english TEXT NOT NULL,
  korean TEXT NOT NULL,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- USER SESSION PROGRESS TABLE
-- ============================================================================
-- 목적: 사용자별 세션 완료 여부 및 진행 상태 추적
-- 설명: not-started(미시작), in-progress(진행중), completed(완료) 상태 관리
--       완료 시점 타임스탬프 기록
-- UI 연결: CategoryScreen의 체크마크, 진행 상태 표시
-- ============================================================================
CREATE TABLE user_session_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('not-started', 'in-progress', 'completed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, session_id)
);

-- ============================================================================
-- USER EXPRESSION PROGRESS TABLE
-- ============================================================================
-- 목적: 사용자별 개별 표현 완료 여부 추적
-- 설명: 각 표현의 'Complete' 버튼 클릭 시 기록
--       세션 내 모든 표현 완료 시 세션 완료 판단에 활용
-- UI 연결: SessionDetailScreen의 Complete 버튼 상태
-- ============================================================================
CREATE TABLE user_expression_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expression_id UUID NOT NULL REFERENCES expressions(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, expression_id)
);

-- ============================================================================
-- DAILY STUDY STATS TABLE
-- ============================================================================
-- 목적: 날짜별, 카테고리별 학습 통계 집계
-- 설명: 하루에 완료한 세션 수, 전체 세션 수 기록
--       캘린더 뷰에서 일별 진행률 계산에 사용
-- UI 연결: CalendarScreen의 날짜별 완료율 표시
-- ============================================================================
CREATE TABLE daily_study_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  study_date DATE NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  sessions_completed INT DEFAULT 0,
  total_sessions INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, study_date, category_id)
);

-- ============================================================================
-- USER SETTINGS TABLE
-- ============================================================================
-- 목적: 사용자별 앱 설정 저장
-- 설명: 자동 오디오 재생, 알림, 다크모드 등
--       사용자당 하나의 설정 레코드
-- UI 연결: SettingsScreen의 스위치 상태
-- ============================================================================
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  auto_play_audio BOOLEAN DEFAULT true,
  daily_reminder BOOLEAN DEFAULT false,
  dark_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_sessions_category_id ON sessions(category_id);
CREATE INDEX idx_expressions_session_id ON expressions(session_id);
CREATE INDEX idx_user_session_progress_user_id ON user_session_progress(user_id);
CREATE INDEX idx_user_session_progress_session_id ON user_session_progress(session_id);
CREATE INDEX idx_user_expression_progress_user_id ON user_expression_progress(user_id);
CREATE INDEX idx_user_expression_progress_expression_id ON user_expression_progress(expression_id);
CREATE INDEX idx_daily_study_stats_user_date ON daily_study_stats(user_id, study_date);

-- Create function for category progress (replaces inefficient view)
CREATE OR REPLACE FUNCTION get_user_category_progress(p_user_id UUID DEFAULT NULL)
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
    COALESCE(p_user_id, auth.uid()) as user_id,
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
    AND usp.user_id = COALESCE(p_user_id, auth.uid())
  GROUP BY c.id, c.name, c.display_order
  ORDER BY c.display_order NULLS LAST, c.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expressions_updated_at BEFORE UPDATE ON expressions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_session_progress_updated_at BEFORE UPDATE ON user_session_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_study_stats_updated_at BEFORE UPDATE ON daily_study_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_session_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_expression_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_study_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Categories: Public read access, authenticated users can manage
CREATE POLICY "Categories are viewable by all users"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert categories"
  ON categories FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update categories"
  ON categories FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete categories"
  ON categories FOR DELETE
  USING (auth.role() = 'authenticated');

-- Sessions: Public read access, authenticated users can manage
CREATE POLICY "Sessions are viewable by all users"
  ON sessions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update sessions"
  ON sessions FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete sessions"
  ON sessions FOR DELETE
  USING (auth.role() = 'authenticated');

-- Expressions: Public read access, authenticated users can manage
CREATE POLICY "Expressions are viewable by all users"
  ON expressions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert expressions"
  ON expressions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update expressions"
  ON expressions FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete expressions"
  ON expressions FOR DELETE
  USING (auth.role() = 'authenticated');

-- User session progress: Users can only access their own progress
CREATE POLICY "Users can view their own session progress"
  ON user_session_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own session progress"
  ON user_session_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own session progress"
  ON user_session_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- User expression progress: Users can only access their own progress
CREATE POLICY "Users can view their own expression progress"
  ON user_expression_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expression progress"
  ON user_expression_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Daily study stats: Users can only access their own stats
CREATE POLICY "Users can view their own daily stats"
  ON daily_study_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily stats"
  ON daily_study_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily stats"
  ON daily_study_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- User settings: Users can only access their own settings
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

-- Get current user's category progress:
-- SELECT * FROM get_user_category_progress();

-- Get specific user's category progress (admin use):
-- SELECT * FROM get_user_category_progress('user-uuid-here');

-- Insert a new category:
-- INSERT INTO categories (name, display_order, total_sessions, icon)
-- VALUES ('Daily Expression', 1, 20, 'message-circle');

-- Insert a new session:
-- INSERT INTO sessions (category_id, session_number, title, pattern_english, pattern_korean)
-- VALUES ('category-uuid', 1, 'How are you doing?', 'How long does it take to ~?', '~하는 데 얼마나 걸리나요?');

-- Mark expression as completed:
-- INSERT INTO user_expression_progress (user_id, expression_id)
-- VALUES (auth.uid(), 'expression-uuid')
-- ON CONFLICT (user_id, expression_id) DO NOTHING;
