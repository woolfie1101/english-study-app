# 진행 상황 추적 시스템 문서

## 개요

사용자의 학습 진행 상황을 추적하고 실시간으로 업데이트하는 시스템입니다.

## 주요 기능

### 1. 표현 완료 처리
- **위치**: [SessionDetailScreen.tsx](src/components/SessionDetailScreen.tsx)
- **Hook**: [useProgress.ts](src/hooks/useProgress.ts) - `completeExpression()`
- **테이블**: `user_expression_progress`
- **동작**: Complete 버튼 클릭 시 자동 저장

### 2. 세션 완료 처리
- **위치**: [SessionDetailScreen.tsx](src/components/SessionDetailScreen.tsx)
- **Hook**: [useProgress.ts](src/hooks/useProgress.ts) - `completeSession()`
- **테이블**: `user_session_progress`
- **동작**: 모든 표현 완료 시 자동 처리

### 3. 일별 통계 업데이트
- **위치**: [SessionDetailScreen.tsx](src/components/SessionDetailScreen.tsx)
- **Hook**: [useProgress.ts](src/hooks/useProgress.ts) - `updateDailyStats()`
- **테이블**: `daily_study_stats`
- **동작**: 세션 완료 시 자동 업데이트

### 4. Next Session 기능
- **위치**: [SessionDetailScreen.tsx](src/components/SessionDetailScreen.tsx)
- **함수**: [useSession.ts](src/hooks/useSession.ts) - `getNextSession()`
- **동작**: 다음 세션 자동 조회 및 이동

### 5. 진행률 실시간 표시
- **HomeScreen**: [useCategories.ts](src/hooks/useCategories.ts)
- **CategoryScreen**: [useCategory.ts](src/hooks/useCategory.ts)
- **함수**: `get_categories_with_progress`
- **동작**: 카테고리별 완료율 실시간 계산

## 데이터베이스 스키마

### user_expression_progress
```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users)
- expression_id (UUID, FK → expressions)
- session_id (UUID, FK → sessions)  -- 추가됨
- category_id (UUID, FK → categories)  -- 추가됨
- completed_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### user_session_progress
```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users)
- session_id (UUID, FK → sessions)
- category_id (UUID, FK → categories)  -- 추가됨
- status (TEXT: 'not-started' | 'in-progress' | 'completed')
- completed_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### daily_study_stats
```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users)
- study_date (DATE)
- category_id (UUID, FK → categories)
- sessions_completed (INT)
- total_sessions (INT)
- expressions_completed (INT)  -- 추가됨
- study_time_minutes (INT)  -- 추가됨
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 마이그레이션

필수 마이그레이션 파일:
1. [004_add_progress_columns.sql](supabase/migrations/004_add_progress_columns.sql) - 컬럼 추가
2. [005_update_rls_policies.sql](supabase/migrations/005_update_rls_policies.sql) - RLS 정책
3. [006_create_test_user.sql](supabase/migrations/006_create_test_user.sql) - 테스트 사용자
4. [007_update_functions.sql](supabase/migrations/007_update_functions.sql) - 함수 생성

## 테스트 사용자

```typescript
const userId = '00000000-0000-0000-0000-000000000001';
```

진행 상황 초기화:
```sql
-- supabase/migrations/999_reset_test_data.sql 참조
```

## 사용 예시

### 표현 완료
```typescript
const { completeExpression } = useProgress();

await completeExpression(
  userId,
  expressionId,
  sessionId,
  categoryId
);
```

### 세션 완료
```typescript
const { completeSession } = useProgress();

await completeSession(
  userId,
  sessionId,
  categoryId
);
```

### 일별 통계 업데이트
```typescript
const { updateDailyStats } = useProgress();

await updateDailyStats(
  userId,
  categoryId,
  expressionsCompleted
);
```

### 진행률 조회
```typescript
const { categories } = useCategories(userId);
// categories[0].completed
// categories[0].total_sessions
// categories[0].percentage
```

## 주의사항

1. **RLS 정책**: 테스트 사용자는 특별 정책으로 허용됨
2. **UUID 타입**: user_id는 반드시 UUID 형식 사용
3. **자동 처리**: 세션 완료 시 일별 통계도 자동 업데이트됨
4. **Optimistic Update**: UI는 즉시 업데이트, 실패 시 롤백
