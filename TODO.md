# TODO List - English Study App

## ✅ Completed

- [x] PRD.md 백엔드 전략 업데이트 (Supabase → Hybrid 전환 계획)
- [x] DB 마이그레이션 파일에 테이블 설명 주석 추가
- [x] Phase 1: Supabase Backend Setup 완료
- [x] Phase 2: 주요 화면 데이터 연동 완료 (Home, Category, SessionDetail)
- [x] Phase 3: Storage & Audio 완료

## 🔄 다음 작업 (Next Steps)

### Phase 2 완료! 🎉

**진행 상황 업데이트 기능 완료:**
- [x] 표현 완료 처리 (user_expression_progress 테이블에 저장)
- [x] 세션 완료 처리 (user_session_progress 테이블 업데이트)
- [x] 일별 통계 업데이트 (daily_study_stats)
- [x] Next Session 버튼 기능 구현 (다음 세션으로 이동)
- [x] 진행률 실시간 업데이트 (HomeScreen, CategoryScreen)

### Phase 2 추가 화면 연동
- [ ] CalendarScreen - 월별 학습 통계
- [ ] SettingsScreen - 사용자 설정

---

## 📦 완료된 Phase 상세

### ✅ Phase 1: Supabase Backend Setup

**1. Supabase 프로젝트 설정**
- [x] Supabase 프로젝트 생성 (https://supabase.com/dashboard/project/mltoqwqobwbzgqutvclv)
- [x] 환경 변수 설정 (.env.local)
- [x] DB 마이그레이션 실행 (001_initial_schema.sql)

**2. 샘플 데이터 준비**
- [x] Daily Expression 카테고리 (5개 세션, 10개 표현)
- [x] Supabase에 샘플 데이터 입력

**3. Supabase Client 설정**
- [x] @supabase/supabase-js 설치
- [x] Client 유틸리티 생성 (src/lib/supabase.ts)
- [x] TypeScript 타입 정의 (src/types/database.ts)

### ✅ Phase 2: 주요 화면 Supabase 연동

**4. 화면별 데이터 연동**
- [x] HomeScreen - useCategories hook, 카테고리 목록 표시
- [x] CategoryScreen - useCategory hook, 세션 목록 표시
- [x] SessionDetailScreen - useSession hook, 표현 목록 및 패턴 표시

### ✅ Phase 3: Storage & Audio

**6. 오디오 파일 관리**
- [x] Supabase Storage 버킷 생성 (audio-files)
- [x] RLS 정책 설정
- [x] MP3 파일 10개 업로드 (Daily Expression)
- [x] AudioPlayer 실제 오디오 재생 구현

### ✅ Phase 2 추가: 진행 상황 업데이트 기능

**7. 진행 상황 추적 시스템**
- [x] useProgress hook 생성 (completeExpression, completeSession, updateDailyStats)
- [x] 표현 완료 처리 (user_expression_progress)
- [x] 세션 완료 처리 (user_session_progress)
- [x] 일별 통계 업데이트 (daily_study_stats)
- [x] Next Session 버튼 기능 (다음 세션 자동 이동)
- [x] 진행률 실시간 업데이트 (HomeScreen, CategoryScreen)

**8. 데이터베이스 마이그레이션**
- [x] 004_add_progress_columns.sql - 필수 컬럼 추가
- [x] 005_update_rls_policies.sql - RLS 정책 업데이트
- [x] 006_create_test_user.sql - 테스트 사용자 생성
- [x] 007_update_functions.sql - get_categories_with_progress 함수
- [x] 999_reset_test_data.sql - 테스트 데이터 초기화 유틸리티

## 🐛 Phase 4: 품질 개선

### 9. 에러 처리 및 UX
- [ ] 로딩 상태 UI 추가
- [ ] 에러 핸들링 추가
- [ ] 네트워크 에러 처리

### 10. 테스트
- [ ] 각 화면 동작 테스트
- [ ] 진행 상황 업데이트 테스트
- [ ] 버그 수정

## 🚀 Phase 5: 배포 준비

### 11. 배포 설정
- [ ] Vercel 배포 설정
- [ ] 프로덕션 환경 변수 설정
- [ ] 배포 테스트

---

## 📝 Notes

- **콘텐츠 준비**: 영어 표현, 한글 번역, 음성 파일은 별도로 준비 필요
- **백엔드 전략**: Phase 1-2는 Supabase 직접 호출, 나중에 필요시 Hybrid로 전환
- **코드 품질**: 모든 파일 300줄 이하 유지

## 🔧 개발 환경 설정

### 테스트 사용자 정보
```
UUID: 00000000-0000-0000-0000-000000000001
Email: test@example.com
```

### 진행 상황 초기화
```sql
-- supabase/migrations/999_reset_test_data.sql 실행
DELETE FROM user_expression_progress WHERE user_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM user_session_progress WHERE user_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM daily_study_stats WHERE user_id = '00000000-0000-0000-0000-000000000001';
```

### 마이그레이션 실행 순서
1. 001_initial_schema.sql
2. 002_storage_policies.sql
3. 003_allow_anon_upload.sql
4. 004_add_progress_columns.sql
5. 005_update_rls_policies.sql
6. 006_create_test_user.sql
7. 007_update_functions.sql
