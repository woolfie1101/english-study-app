-- Seed data for Daily Expression category

-- Insert Daily Expression category
INSERT INTO categories (name, display_order, total_sessions, icon)
VALUES ('Daily Expression', 1, 5, 'message-circle')
ON CONFLICT DO NOTHING;

-- Get category ID for reference
DO $$
DECLARE
  v_category_id UUID;
BEGIN
  SELECT id INTO v_category_id FROM categories WHERE name = 'Daily Expression';

  -- Insert sessions
  INSERT INTO sessions (category_id, session_number, title, pattern_english, pattern_korean)
  VALUES
    (v_category_id, 1, 'I appreciate ~', 'I appreciate ~', '~에 감사드립니다.'),
    (v_category_id, 2, 'I''m getting ~', 'I''m getting ~', '점점 ~해지고 있어요.'),
    (v_category_id, 3, 'What a + N', 'What a + N', '정말 ~하네요.'),
    (v_category_id, 4, 'some other time', 'some other time', '기회가 되면 / 나중에'),
    (v_category_id, 5, 'What''s the best way to ~ ?', 'What''s the best way to ~ ?', '~하기 위해 가장 좋은 방법은 무엇일까요?')
  ON CONFLICT (category_id, session_number) DO NOTHING;

  -- Insert expressions for Session 1: I appreciate ~
  INSERT INTO expressions (session_id, display_order, english, korean, audio_url)
  SELECT id, 1,
    'I appreciate your prompt response to my inquiry.',
    '제 문의에 신속하게 답변해 주셔서 감사드립니다.',
    'Daily_Expressions_001_1.mp3'
  FROM sessions WHERE category_id = v_category_id AND session_number = 1
  ON CONFLICT DO NOTHING;

  INSERT INTO expressions (session_id, display_order, english, korean, audio_url)
  SELECT id, 2,
    'I appreciate you taking the time to explain that to me.',
    '시간을 내어 설명해 주셔서 감사합니다.',
    'Daily_Expressions_001_2.mp3'
  FROM sessions WHERE category_id = v_category_id AND session_number = 1
  ON CONFLICT DO NOTHING;

  -- Insert expressions for Session 2: I'm getting ~
  INSERT INTO expressions (session_id, display_order, english, korean, audio_url)
  SELECT id, 1,
    'I''m getting more comfortable with my new job.',
    '새 직장에서 점점 더 편안해지고 있어요.',
    'Daily_Expressions_002_1.mp3'
  FROM sessions WHERE category_id = v_category_id AND session_number = 2
  ON CONFLICT DO NOTHING;

  INSERT INTO expressions (session_id, display_order, english, korean, audio_url)
  SELECT id, 2,
    'I''m getting better at cooking, my meals are tasting much better now.',
    '요리 실력이 점점 나아지고 있어, 내 요리가 이제 훨씬 맛있어졌어.',
    'Daily_Expressions_002_2.mp3'
  FROM sessions WHERE category_id = v_category_id AND session_number = 2
  ON CONFLICT DO NOTHING;

  -- Insert expressions for Session 3: What a + N
  INSERT INTO expressions (session_id, display_order, english, korean, audio_url)
  SELECT id, 1,
    'What a long day it''s been! I can''t wait to relax.',
    '오늘 정말 긴 하루였어! 이제 좀 쉬고 싶어.',
    'Daily_Expressions_003_1.mp3'
  FROM sessions WHERE category_id = v_category_id AND session_number = 3
  ON CONFLICT DO NOTHING;

  INSERT INTO expressions (session_id, display_order, english, korean, audio_url)
  SELECT id, 2,
    'What a relief to finally get everything done!',
    '드디어 모든 걸 끝내서 정말 홀가분하다!',
    'Daily_Expressions_003_2.mp3'
  FROM sessions WHERE category_id = v_category_id AND session_number = 3
  ON CONFLICT DO NOTHING;

  -- Insert expressions for Session 4: some other time
  INSERT INTO expressions (session_id, display_order, english, korean, audio_url)
  SELECT id, 1,
    'Let''s grab coffee some other time. I''m too busy today.',
    '오늘은 너무 바빠서, 다음에 커피 마시자.',
    'Daily_Expressions_004_1.mp3'
  FROM sessions WHERE category_id = v_category_id AND session_number = 4
  ON CONFLICT DO NOTHING;

  INSERT INTO expressions (session_id, display_order, english, korean, audio_url)
  SELECT id, 2,
    'I can''t make it now, some other time though.',
    '지금은 못 가지만, 나중에 갈게.',
    'Daily_Expressions_004_2.mp3'
  FROM sessions WHERE category_id = v_category_id AND session_number = 4
  ON CONFLICT DO NOTHING;

  -- Insert expressions for Session 5: What's the best way to ~ ?
  INSERT INTO expressions (session_id, display_order, english, korean, audio_url)
  SELECT id, 1,
    'What''s the best way to save money for a big trip?',
    '큰 여행을 위해 돈을 저축하는 가장 좋은 방법은 무엇일까요?',
    'Daily_Expressions_005_1.mp3'
  FROM sessions WHERE category_id = v_category_id AND session_number = 5
  ON CONFLICT DO NOTHING;

  INSERT INTO expressions (session_id, display_order, english, korean, audio_url)
  SELECT id, 2,
    'What''s the best way to stay motivated while studying?',
    '공부할 때 동기 부여를 유지하는 가장 좋은 방법은 뭐야?',
    'Daily_Expressions_005_2.mp3'
  FROM sessions WHERE category_id = v_category_id AND session_number = 5
  ON CONFLICT DO NOTHING;

END $$;
