# Product Requirements Document (PRD)
## English Study App

### 📋 Overview

**Product Name**: English Study App
**Version**: 1.0.0
**Last Updated**: 2025-10-05
**Status**: In Development

### 🎯 Product Vision

영어 학습을 위한 개인화된 학습 관리 앱. 카테고리별 세션 구조로 체계적인 학습을 지원하며, 진행 상황 추적과 통계 기능을 제공합니다.

### 👥 Target Users

**Phase 1 (Current)**: 개인 사용자 (개발자 본인)
- 영어 학습 콘텐츠 관리 및 진행 상황 추적
- 오디오 기반 학습 지원

**Phase 2 (Future)**: 다중 사용자
- 회원가입/로그인 기능
- 개인별 학습 진행 상황 분리
- 사용자별 설정 관리

### 🏗️ System Architecture

**Frontend**: Next.js 15 (App Router) + React 19
**Backend**:
- Phase 1-2: Supabase 전체 활용 (PostgreSQL + Auth + Storage)
- Phase 3+: Hybrid 방식 전환 (Next.js API Routes + Supabase DB)
**UI**: Tailwind CSS + shadcn/ui + Radix UI
**Deployment**: Vercel (예정)

### 🔄 Backend Evolution Strategy

#### Phase 1-2 (개인/소규모 사용자)
**Supabase 전체 활용**
- 컴포넌트에서 Supabase Client 직접 호출
- 빠른 개발 및 프로토타이핑 우선
- Auth, Storage, Realtime 등 모든 기능 활용
- 개발 속도 최우선

#### Phase 3+ (사용자 증가 시)
**Hybrid 방식으로 전환**
- Next.js API Routes로 비즈니스 로직 이동
- Supabase는 DB만 사용 (Auth, Storage 선택적)
- 커스텀 로직, 캐싱, 검증 레이어 추가
- 더 세밀한 제어와 최적화 가능
- **전환 작업량**: 1-2시간 (점진적 마이그레이션 가능)

#### Long-term (선택적)
**완전 독립형 백엔드**
- 필요 시 다른 DB로 마이그레이션 (PostgreSQL 호환)
- 전환 작업량: 2-3일
- 완전한 커스터마이징 및 비용 최적화

---

## 📱 Core Features

### 1. 학습 카테고리 시스템

#### 1.1 기본 카테고리 (Phase 1)
- Daily Expression (일상 표현)
- Pattern (문장 패턴)
- Grammar (문법)
- **확장 가능**: 추가 카테고리 자유롭게 생성 가능

#### 1.2 카테고리 관리
- ✅ Phase 1: 관리자가 DB에서 직접 카테고리 추가/수정
- 🔮 Future (Phase 3): 사용자가 UI에서 카테고리 커스터마이징
  - 드래그 앤 드롭으로 카테고리 순서 변경
  - 카테고리별 표시/숨김 설정
  - 카테고리별 색상/아이콘 커스터마이징

### 2. 세션 기반 학습 시스템

#### 2.1 세션 구조
```
Category (카테고리)
  └── Session 1, 2, 3... (개별 학습 세션)
        └── Expressions (영어 표현 목록)
              ├── English Text
              ├── Korean Translation
              └── Audio File
```

#### 2.2 세션 진행 방식
- 순차적 진행: 이전 세션 완료 시 다음 세션 unlock
- 세션 내 모든 표현 완료 시 세션 완료 처리
- 완료 시 다음 세션으로 자동 이동 옵션

### 3. 학습 콘텐츠 관리

#### 3.1 콘텐츠 데이터
- ⚠️ **학습 콘텐츠는 개발자가 별도로 준비**
- 콘텐츠 구성: 영어 문장 + 한글 번역 + 음성 파일
- DB에 직접 입력 또는 CSV/JSON 임포트

#### 3.2 오디오 관리
- Supabase Storage에 음성 파일 업로드
- AudioPlayer 컴포넌트로 재생
- 자동 재생 설정 지원

### 4. 진행 상황 추적

#### 4.1 진행률 표시
- **홈 화면**: 전체 진행률 (Today's Progress)
- **카테고리 화면**: 카테고리별 진행률
- **세션 화면**: 개별 표현 완료 체크

#### 4.2 학습 통계
- 일별 학습 통계 (CalendarScreen)
- 월별 학습 캘린더
- 카테고리별 완료율

### 5. 사용자 설정

#### 5.1 현재 지원 설정
- Auto-play audio (자동 오디오 재생)
- Daily reminder (일일 알림) - 구현 예정
- Dark mode (다크 모드) - 구현 예정

---

## 🗄️ Database Schema

### Core Tables

#### 1. categories
**목적**: 학습 카테고리 마스터 데이터
```sql
- id: UUID (PK)
- name: TEXT (카테고리 이름)
- display_order: INT (표시 순서)
- total_sessions: INT (총 세션 수)
- icon: TEXT (아이콘 식별자)
```

#### 2. sessions
**목적**: 카테고리별 학습 세션
```sql
- id: UUID (PK)
- category_id: UUID (FK)
- session_number: INT (세션 번호)
- title: TEXT (세션 제목)
- pattern_english: TEXT (메인 패턴 영어)
- pattern_korean: TEXT (메인 패턴 한글)
```

#### 3. expressions
**목적**: 세션별 학습 표현
```sql
- id: UUID (PK)
- session_id: UUID (FK)
- display_order: INT (표시 순서)
- english: TEXT (영어 문장)
- korean: TEXT (한글 번역)
- audio_url: TEXT (음성 파일 URL)
```

#### 4. user_session_progress
**목적**: 사용자별 세션 진행 상황
```sql
- user_id: UUID (FK)
- session_id: UUID (FK)
- status: ENUM (not-started, in-progress, completed)
- completed_at: TIMESTAMP
```

#### 5. user_expression_progress
**목적**: 사용자별 표현 완료 여부
```sql
- user_id: UUID (FK)
- expression_id: UUID (FK)
- completed_at: TIMESTAMP
```

#### 6. daily_study_stats
**목적**: 일별 학습 통계
```sql
- user_id: UUID (FK)
- study_date: DATE
- category_id: UUID (FK)
- sessions_completed: INT
- total_sessions: INT
```

#### 7. user_settings
**목적**: 사용자별 앱 설정
```sql
- user_id: UUID (FK)
- auto_play_audio: BOOLEAN
- daily_reminder: BOOLEAN
- dark_mode: BOOLEAN
```

---

## 🔌 Data Access Pattern

### Phase 1-2: Direct Supabase Client
컴포넌트에서 Supabase Client 직접 호출
```typescript
// src/components/HomeScreen.tsx
const { data } = await supabase.from('categories').select('*')
```

### Phase 3+: Next.js API Routes (Hybrid)
API Routes를 통한 데이터 접근
```typescript
// app/api/categories/route.ts
export async function GET() {
  const supabase = createClient(...)
  const { data } = await supabase.from('categories').select('*')
  return Response.json(data)
}
```

### API Endpoints (Phase 3+용 참고)

#### Categories
- `GET /api/categories` - 전체 카테고리 목록 + 사용자 진행률
- `GET /api/categories/[id]` - 특정 카테고리 + 세션 목록

#### Sessions
- `GET /api/sessions/[id]` - 세션 상세 + 표현 목록
- `POST /api/sessions/[id]/progress` - 세션 진행 상황 업데이트
- `POST /api/sessions/[id]/complete` - 세션 완료 처리

#### Expressions
- `POST /api/expressions/[id]/complete` - 표현 완료 처리
- `GET /api/expressions/[id]/audio` - 오디오 파일 스트리밍

#### Progress
- `GET /api/progress/overview` - 전체 진행 상황 요약
- `GET /api/progress/daily` - 오늘의 진행 상황
- `GET /api/calendar/[year]/[month]` - 월별 학습 달력 데이터

#### Settings
- `GET /api/settings` - 사용자 설정 조회
- `PUT /api/settings` - 사용자 설정 업데이트

---

## 🎨 UI/UX Screens

### 1. HomeScreen (/)
- Today's Progress (전체 진행률)
- 카테고리 카드 목록
- 각 카테고리별 진행률 및 Start/Continue 버튼

### 2. CategoryScreen (/category/[id])
- 카테고리별 세션 목록
- 세션 상태 표시 (완료/진행중/잠김)
- 세션 번호 + 제목

### 3. SessionDetailScreen (/category/[id]/session/[sessionNumber])
- Today's Pattern (메인 패턴)
- 표현 카드 목록 (영어 + 한글 + 오디오)
- Complete 버튼
- Next Session 버튼

### 4. CalendarScreen (/calendar)
- 월별 캘린더
- 날짜별 학습 상태 (완료/부분완료/미학습)
- 선택 날짜의 상세 통계

### 5. SettingsScreen (/settings)
- 학습 설정 (오디오 자동재생, 알림)
- 계정 설정 (프로필) - Phase 2
- 앱 정보 (버전)

---

## 🔐 Security & Authentication

### Phase 1 (Current)
- 단일 사용자 (개발자 본인)
- Supabase Auth 기본 설정
- RLS(Row Level Security) 적용

### Phase 2 (Multi-user Support)
- 이메일/비밀번호 인증
- 소셜 로그인 (Google, Apple) - 선택
- 사용자별 데이터 격리
- JWT 기반 세션 관리

---

## 📈 Future Enhancements (Phase 3+)

### 1. 카테고리 커스터마이징
- ✨ 드래그 앤 드롭으로 카테고리 순서 변경
- 🎨 카테고리별 색상/아이콘 설정
- 👁️ 카테고리 표시/숨김 토글
- 📱 홈 화면 레이아웃 커스터마이징

### 2. 고급 학습 기능
- 복습 시스템 (Spaced Repetition)
- 단어장 기능
- 퀴즈/테스트 모드
- AI 발음 피드백

### 3. 소셜 기능
- 학습 그룹 생성
- 친구 진행 상황 공유
- 리더보드

### 4. 분석 및 인사이트
- 학습 패턴 분석
- 추천 학습 경로
- 성취 뱃지

---

## 🚀 Development Phases

### ✅ Phase 0: Foundation (Completed)
- Next.js 15 App Router 마이그레이션
- UI 컴포넌트 구현
- 목 데이터로 화면 구성

### 🔄 Phase 1: Backend Integration (Current)
**방식**: Supabase 전체 활용 (Direct Client)
1. Supabase 프로젝트 설정
2. DB 스키마 생성 및 마이그레이션
3. Supabase Client 설정
4. 컴포넌트에서 Supabase 직접 호출
5. 오디오 스트리밍 구현

### 📅 Phase 2: Multi-user Support
**방식**: Supabase 전체 활용 유지
- 회원가입/로그인 UI
- Supabase Auth 활용
- RLS로 데이터 격리
- 프로필 관리

### 🔀 Phase 3: Hybrid Backend (사용자 증가 시)
**방식**: Next.js API Routes + Supabase DB
- Next.js API Routes 생성
- 비즈니스 로직 API로 이동
- 컴포넌트를 API 호출로 변경
- 캐싱 및 최적화 레이어 추가
- **전환 작업**: 1-2시간

### 🎯 Phase 4: Advanced Features
- 카테고리 커스터마이징 (드래그앤드롭)
- 복습 시스템
- 고급 통계
- 소셜 기능

---

## 📝 Development Notes

### Content Management
⚠️ **중요**: 학습 콘텐츠(영어 문장, 번역, 음성)는 개발자가 별도로 준비
- CSV/JSON 포맷으로 준비
- Supabase DB에 직접 입력
- 음성 파일은 Supabase Storage에 업로드

### Tech Stack Decisions
- **Next.js 15**: App Router, Server Components
- **Supabase**: PostgreSQL, Auth, Storage (Phase 1-2 전체 활용 → Phase 3+ DB만)
- **TypeScript**: Type safety across full stack
- **Tailwind CSS**: Rapid UI development

### Backend Migration Strategy
**Phase 1-2 → Phase 3 전환 과정**:
1. Next.js API Routes 폴더 생성 (`app/api/`)
2. Supabase 호출 로직을 API Route로 이동
3. 컴포넌트에서 fetch()로 API 호출로 변경
4. 점진적 마이그레이션 (한 번에 하나씩)

**변경 예시**:
```typescript
// BEFORE (Phase 1-2): Direct Supabase
const { data } = await supabase.from('categories').select('*')

// AFTER (Phase 3): API Route
const res = await fetch('/api/categories')
const data = await res.json()
```

### Performance Considerations
- **Phase 1-2**: Supabase Client로 직접 데이터 fetch
- **Phase 3+**: API Routes에서 캐싱 레이어 추가
- Server Components for initial data fetching
- Client Components only for interactivity
- Image/Audio optimization

### File Size Limit
⚠️ **코드 품질 규칙**: 모든 파일은 300줄 이하로 유지
- 300줄 초과 시 모듈 분리
- 재사용 로직은 별도 유틸리티 파일
- 복잡한 상태 로직은 커스텀 훅으로 분리

---

## 📞 Contact & Support

**Developer**: Kim Joohee
