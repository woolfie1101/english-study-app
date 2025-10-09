-- ============================================================================
-- GET FULL DATABASE SCHEMA
-- ============================================================================
-- 이 쿼리는 현재 데이터베이스의 모든 테이블 구조를 가져옵니다.
-- Supabase SQL Editor에서 실행하고 결과를 복사해주세요.
-- ============================================================================

-- 1. 모든 테이블 목록과 코멘트
SELECT
  table_name,
  obj_description((table_schema||'.'||table_name)::regclass, 'pg_class') as table_comment
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. 각 테이블의 컬럼 정보 (타입, NULL 여부, 기본값)
SELECT
  c.table_name,
  c.column_name,
  c.data_type,
  c.udt_name,
  c.is_nullable,
  c.column_default,
  col_description((c.table_schema||'.'||c.table_name)::regclass, c.ordinal_position) as column_comment
FROM information_schema.columns c
WHERE c.table_schema = 'public'
  AND c.table_name IN (
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
  )
ORDER BY c.table_name, c.ordinal_position;

-- 3. 모든 제약조건 (PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK)
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule,
  rc.update_rule
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
  AND tc.table_schema = ccu.table_schema
LEFT JOIN information_schema.referential_constraints rc
  ON tc.constraint_name = rc.constraint_name
  AND tc.table_schema = rc.constraint_schema
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

-- 4. 모든 인덱스
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 5. 모든 함수
SELECT
  routine_name,
  routine_type,
  data_type as return_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- 6. 모든 트리거
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 7. RLS 정책 (Row Level Security)
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 8. Storage buckets and policies
SELECT
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets;
