-- =====================================================
-- 008_create_user_settings.sql
-- 사용자 설정 테이블 생성
-- =====================================================

-- 사용자 설정 테이블
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,

  -- 학습 설정
  auto_play_audio BOOLEAN DEFAULT true,
  daily_reminder BOOLEAN DEFAULT false,
  daily_goal INTEGER DEFAULT 10, -- 일일 학습 목표 (표현 개수)

  -- UI 설정
  dark_mode BOOLEAN DEFAULT false,

  -- 알림 설정
  reminder_time TIME DEFAULT '09:00:00', -- 알림 시간

  -- 메타데이터
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- RLS 정책 활성화
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 자신의 설정만 조회 가능
CREATE POLICY "Users can view own settings"
  ON user_settings
  FOR SELECT
  TO authenticated, anon
  USING (user_id = '00000000-0000-0000-0000-000000000001');

-- RLS 정책: 자신의 설정만 생성 가능
CREATE POLICY "Users can insert own settings"
  ON user_settings
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001');

-- RLS 정책: 자신의 설정만 수정 가능
CREATE POLICY "Users can update own settings"
  ON user_settings
  FOR UPDATE
  TO authenticated, anon
  USING (user_id = '00000000-0000-0000-0000-000000000001');

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_updated_at();

-- 테스트 사용자 기본 설정 생성
INSERT INTO user_settings (user_id)
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- 설정 조회 함수
CREATE OR REPLACE FUNCTION get_user_settings(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  auto_play_audio BOOLEAN,
  daily_reminder BOOLEAN,
  daily_goal INTEGER,
  dark_mode BOOLEAN,
  reminder_time TIME,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    us.id,
    us.user_id,
    us.auto_play_audio,
    us.daily_reminder,
    us.daily_goal,
    us.dark_mode,
    us.reminder_time,
    us.created_at,
    us.updated_at
  FROM user_settings us
  WHERE us.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
