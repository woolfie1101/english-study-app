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
- [x] CalendarScreen - 월별 학습 통계 (useCalendar hook, 실시간 데이터 연동)
- [x] SettingsScreen - 사용자 설정 (useSettings hook, user_settings 테이블)

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
- [x] 008_create_user_settings.sql - user_settings 테이블 생성
- [x] 999_reset_test_data.sql - 테스트 데이터 초기화 유틸리티

**9. SettingsScreen 구현**
- [x] useSettings hook 생성 (설정 CRUD, 진행 상황 초기화)
- [x] UI 업데이트 (Auto-play, Reminder, Daily goal, Dark mode, Reminder time)
- [x] 진행 상황 초기화 기능 (Reset Progress with confirmation modal)

## 🎯 Phase 4: Grammar & Word 카테고리 추가

### 📋 개요
Grammar와 Word 카테고리는 기존 MVP(Daily Phrases, Real Talk 등)와 다른 **계층적 구조**를 가집니다.
- **기존 MVP**: Session → Expression 리스트 (평면적)
- **Grammar/Word**: Session → Section → Subsection → Concept → Examples (계층적)

### 📊 Google Sheets 구조 (STEP 1 - 데이터 준비)

#### 컬럼 구조
```
session_number | section_number | section_title | subsection | concept | explanation | ex_en | ex_ko | note
```

#### 컬럼 설명
- `session_number`: 세션 번호 (1, 2, 3, ...)
- `section_number`: 섹션 번호 (1, 2, 3, ...)
- `section_title`: 섹션 제목 ("전치사란?", "시간 전치사", ...)
- `subsection`: 서브섹션 ID ("2-1", "2-2", NULL)
- `concept`: 개념 이름 ("at", "on", "in", "since", "for", ...)
- `explanation`: 개념 설명 (마크업 문법 사용 가능)
- `ex_en`: 영어 예문
- `ex_ko`: 한글 뜻/설명
- `note`: 추가 설명 (예외 사항, 팁 등)

#### 실제 데이터 예시 (전치사)
```
1 | 1 | 전치사란? | NULL | 정의 | 명사의 앞에 나와서 시간, 장소, 방향 등등 {b:'어떤 관계'}에 대해 설명하는 말 | The vase is on the table. | 장소 | NULL
1 | 2 | 시간 전치사 | 2-1 | at | 특정 시점에 사용 {r:(시계에 점 찍기!)} - 24시간 보다 짧 | at 3 O'clock | NULL | NULL
1 | 2 | 시간 전치사 | 2-1 | on | 날짜, 요일, 기념일 {r:(달력에 O 표시!)} - 24시간 | on Monday | NULL | NULL
1 | 2 | 시간 전치사 | 2-1 | in | 주, 월, 연도 {r:(하루 이상의 긴 시간)} - 24시간 보다 긴 | in May | NULL | {y:(예외: morning, evening, afternoon은 in을 쓴다)}
1 | 2 | 시간 전치사 | 2-2 | since | 특정한 과거 시점부터 지금까지 {g:("언제부터?")} | since yesterday | NULL | NULL
1 | 2 | 시간 전치사 | 2-2 | for | 어떤 기간 동안 {g:("얼마나 오래?")} - 구체적인 시간, 숫자와 사용 | for two hours | NULL | NULL
```

#### 텍스트 마크업 문법 (중요!)
강조하고 싶은 텍스트는 색상 마크업 사용:
- `{r:텍스트}` - 빨강 (중요한 포인트)
- `{b:텍스트}` - 파랑 (핵심 개념)
- `{g:텍스트}` - 초록 (긍정적 예시)
- `{y:텍스트}` - 노랑 (예외 사항)
- `{p:텍스트}` - 보라 (추가 팁)

**참고 문서**: [MARKUP_SYNTAX.md](./MARKUP_SYNTAX.md)

---

### 🎨 UI 구성 (STEP 2 - UI 설계)

#### A. CategoriesScreen (변경 최소)
```
Categories
├── Daily Phrases ✓
├── News Phrases ✓
├── Real Talk ✓
├── Grammar ← 새로 추가
└── Word ← 새로 추가
```

#### B. GrammarScreen (새로운 UI)
```
┌─────────────────────────────────────┐
│ ← Grammar                    🔄     │  ← Header
├─────────────────────────────────────┤
│                                     │
│  📚 Session 1: 전치사               │  ← Session Title
│                                     │
│  ┌──────────────────────────────┐  │
│  │ 1. 전치사란? ✓                │  │  ← Section (완료)
│  │                               │  │
│  │ 정의: 명사의 앞에 나와서...   │  │
│  │ • The vase is on the table.   │  │
│  │   → 장소                      │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ 2. 시간 전치사 ▼               │  │  ← Section (확장됨)
│  │                               │  │
│  │  📌 2-1. at/on/in             │  │  ← Subsection
│  │                               │  │
│  │  • at                         │  │  ← Concept
│  │    특정 시점에 사용           │  │
│  │    (시계에 점 찍기!) ← 빨강   │  │
│  │    ex) at 3 o'clock           │  │
│  │                               │  │
│  │  • on                         │  │
│  │    날짜, 요일, 기념일          │  │
│  │    (달력에 O 표시!) ← 빨강    │  │
│  │    ex) on Monday              │  │
│  │                               │  │
│  │  • in                         │  │
│  │    주, 월, 연도               │  │
│  │    ex) in May                 │  │
│  │    ⚠️ 예외: morning은 in 사용 │  │
│  │                               │  │
│  │  📌 2-2. since/for            │  │
│  │  ...                          │  │
│  │                               │  │
│  │  [✓ 이 섹션 완료하기]          │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ 3. 장소 전치사 ▶               │  │  ← Section (접힘)
│  └──────────────────────────────┘  │
│                                     │
│  [Next Session →]                   │
└─────────────────────────────────────┘
```

#### UI 특징
- 📖 **읽기 중심**: 스크롤하며 학습
- 🎯 **섹션별 체크**: 각 섹션을 읽었는지 체크
- 📱 **Accordion UI**: 섹션 펼치기/접기
- 🎨 **색상 강조**: 마크업된 텍스트는 색상 표시
- ✅ **진행도 추적**: 섹션 완료 체크

---

### 🗂️ 데이터베이스 구조 (STEP 3 - DB 스키마)

#### 기존 테이블 활용
- `categories` 테이블: Grammar, Word 카테고리 추가
- `sessions` 테이블: metadata에 섹션 구조 저장
- `expressions` 테이블: metadata에 concept, explanation 저장

#### sessions.metadata 구조
```json
{
  "type": "grammar",
  "sections": [
    { "id": "1", "title": "전치사란?", "order": 1 },
    { "id": "2", "title": "시간 전치사", "order": 2, "subsections": ["2-1", "2-2"] },
    { "id": "3", "title": "장소 전치사", "order": 3 },
    { "id": "4", "title": "방향 전치사", "order": 4 }
  ]
}
```

#### expressions.metadata 구조
```json
{
  "section_id": "2",
  "subsection_id": "2-1",
  "concept": "at",
  "explanation": "특정 시점에 사용 {r:(시계에 점 찍기!)} - 24시간 보다 짧",
  "note": null,
  "type": "example"
}
```

---

### ✅ 작업 순서 (Implementation Plan)

#### STEP 1: 데이터 준비 ✋ **[현재 단계 - 수동 작업]**
- [ ] Google Sheets에 `grammar` 시트 생성
- [ ] 컬럼 구조 설정 (위 구조 참고)
- [ ] 전치사 데이터 입력 (마크업 문법 사용)
- [ ] Google Sheets에 `word` 시트 생성 (선택)
- [ ] Word 데이터 입력 (선택)

#### STEP 2: 데이터베이스 확장
- [ ] `categories` 테이블에 Grammar, Word 카테고리 추가
  ```sql
  INSERT INTO categories (name, slug, display_order, description, icon)
  VALUES
    ('Grammar', 'grammar', 4, 'Learn English grammar concepts', '📚'),
    ('Word', 'word', 5, 'Expand your vocabulary', '📖');
  ```

#### STEP 3: Google Sheets API 확장
- [ ] `/api/sync-google-sheets` API 수정
  - [ ] grammar 시트 파싱 로직 추가
  - [ ] 평면 데이터 → 계층 구조 변환
  - [ ] sessions.metadata에 섹션 구조 저장
  - [ ] expressions.metadata에 concept 정보 저장

#### STEP 4: StyledText 컴포넌트 생성
- [ ] `src/components/StyledText.tsx` 생성
- [ ] 마크업 파싱 로직 구현 (`{r:텍스트}` → 빨간색)
- [ ] Tailwind 색상 클래스 매핑

#### STEP 5: GrammarScreen 컴포넌트 생성
- [ ] `src/components/GrammarScreen.tsx` 생성
- [ ] Accordion UI 구현 (섹션 펼치기/접기)
- [ ] 섹션별 체크박스 구현
- [ ] StyledText 컴포넌트 적용
- [ ] 진행도 추적 (섹션 단위)

#### STEP 6: 라우팅 및 통합
- [ ] CategoriesScreen에 Grammar 카테고리 표시
- [ ] 라우팅: `/category/grammar/session/[number]`
- [ ] CategoryScreen에서 Grammar 감지 시 GrammarScreen 렌더링

#### STEP 7: 테스트
- [ ] 데이터 동기화 테스트
- [ ] UI 렌더링 테스트
- [ ] 진행도 추적 테스트
- [ ] 마크업 색상 표시 테스트

#### STEP 8: WordScreen (선택)
- [ ] GrammarScreen 복사하여 WordScreen 생성
- [ ] Word 카테고리 데이터 동기화

---

### 📝 참고 문서
- [MARKUP_SYNTAX.md](./MARKUP_SYNTAX.md) - 텍스트 강조 마크업 문법
- [PRD.md](./PRD.md) - 프로젝트 요구사항
- [PROGRESS_TRACKING.md](./PROGRESS_TRACKING.md) - 진행도 추적 시스템

---

## 🐛 Phase 5: 품질 개선

### 10. 에러 처리 및 UX
- [ ] 로딩 상태 UI 추가
- [ ] 에러 핸들링 추가
- [ ] 네트워크 에러 처리

### 11. 테스트
- [ ] 각 화면 동작 테스트
- [ ] 진행 상황 업데이트 테스트
- [ ] 버그 수정

## 🚀 Phase 5: 배포 준비

### 12. 배포 설정
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
8. 008_create_user_settings.sql
