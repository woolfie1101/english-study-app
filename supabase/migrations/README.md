# Database Migrations

## 마이그레이션 실행 방법

### 옵션 1: Supabase Dashboard (권장)
1. [Supabase Dashboard](https://supabase.com/dashboard/project/mltoqwqobwbzgqutvclv/editor) 접속
2. SQL Editor 열기
3. 마이그레이션 파일 내용 복사 & 실행
4. **순서대로 실행** (중요!):
   - `001_initial_schema.sql` - 기본 스키마
   - `002_storage_policies.sql` - Storage RLS
   - `003_allow_anon_upload.sql` - Anonymous upload
   - `004_add_progress_columns.sql` - 진행 상황 컬럼 추가
   - `005_update_rls_policies.sql` - RLS 정책 업데이트
   - `006_create_test_user.sql` - 테스트 사용자 생성
   - `007_update_functions.sql` - 함수 업데이트

### 옵션 2: Supabase CLI
```bash
# 프로젝트 연결 (최초 1회)
npx supabase link --project-ref mltoqwqobwbzgqutvclv

# 마이그레이션 실행
npx supabase db push
```

## 마이그레이션 목록

### 001_initial_schema.sql
- 초기 데이터베이스 스키마 생성
- 테이블: categories, sessions, expressions, user_session_progress, user_expression_progress, daily_study_stats, user_settings
- 기본 RLS 정책: categories, sessions, expressions (읽기 전용)
- 인덱스 생성 (성능 최적화)

### 002_storage_policies.sql
- Supabase Storage 설정
- audio-files 버킷 RLS 정책

### 003_allow_anon_upload.sql
- Anonymous 사용자 오디오 업로드 허용

### 004_add_progress_columns.sql ⭐ NEW
- user_session_progress에 category_id 추가
- user_expression_progress에 session_id, category_id 추가
- daily_study_stats에 expressions_completed, study_time_minutes 추가
- 기존 데이터 마이그레이션 포함

### 005_update_rls_policies.sql ⭐ NEW
- 모든 진행 상황 테이블에 RLS 정책 추가
- 테스트 사용자(00000000-0000-0000-0000-000000000001) 접근 허용
- user_session_progress, user_expression_progress, daily_study_stats

### 006_create_test_user.sql ⭐ NEW
- 테스트 사용자 생성
- UUID: 00000000-0000-0000-0000-000000000001
- Email: test@example.com

### 007_update_functions.sql ⭐ NEW
- get_categories_with_progress 함수 생성/업데이트
- UUID 파라미터 사용으로 변경
- 카테고리별 진행률 계산

### 999_reset_test_data.sql 🔧 UTILITY
- 테스트 사용자 진행 상황 초기화
- 개발/테스트 용도
- **경고**: 모든 진행 데이터 삭제됨

## 테스트 사용자 정보

```
UUID: 00000000-0000-0000-0000-000000000001
Email: test@example.com
```

코드에서 사용:
```typescript
const userId = '00000000-0000-0000-0000-000000000001';
```

## 진행 상황 초기화

테스트 중 진행 상황을 리셋하려면:
```sql
-- 999_reset_test_data.sql 실행
```

## 트러블슈팅

### RLS 정책 에러
```
new row violates row-level security policy
```
→ 005_update_rls_policies.sql 재실행

### 함수 없음 에러
```
Could not find the function get_categories_with_progress
```
→ 007_update_functions.sql 재실행

### 컬럼 없음 에러
```
column does not exist
```
→ 004_add_progress_columns.sql 재실행
