# 데이터 초기화 및 재설정 가이드

구조 변경 후 데이터를 초기화하고 새로 시작하는 방법입니다.

## 🔄 변경 사항 요약

### 1. 카테고리 Slug 변경
- `daily-expression` → `daily-phrases`
- `news-expression` → `news-phrases`
- `conversational-expression` → `real-talk`
- `conversational-ex-expression` → `real-talk-examples`
- `shadowing` (변경 없음)
- `english-order` (변경 없음)

### 2. 스토리지 폴더명 변경
- `daily` → `daily-phrases`
- `news` → `news-phrases`
- `conversational` → `real-talk`
- `shadowing` (변경 없음)
- `english-order` (변경 없음)

### 3. 테이블 구조 변경
- `categories.total_sessions` 컬럼 제거 (동적 계산으로 변경)
- `news-phrases`가 `contents_json` 사용 (Real Talk과 동일한 형식)

## 📋 초기화 순서

### Step 1: Supabase 마이그레이션 실행

Supabase Dashboard > SQL Editor에서 실행:

```sql
-- 1. total_sessions 컬럼 제거
ALTER TABLE categories DROP COLUMN IF EXISTS total_sessions;

-- 2. description과 metadata 컬럼 추가 (없으면)
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS metadata JSONB;
```

### Step 2: Categories 테이블의 Slug 업데이트

Supabase Dashboard > Table Editor > categories 테이블에서 각 카테고리의 `slug` 컬럼을 수정:

| 현재 Slug | 새 Slug |
|-----------|---------|
| `daily-expression` | `daily-phrases` |
| `news-expression` | `news-phrases` |
| `conversational-expression` | `real-talk` |
| `conversational-ex-expression` | `real-talk-examples` |
| `shadowing` | `shadowing` |
| `english-order` | `english-order` |

### Step 3: 기존 데이터 삭제

**방법 A: 스크립트 사용 (권장)**

터미널에서 실행:

```bash
npx tsx scripts/reset-all-data.ts
```

프롬프트에서 `yes` 입력하여 확인

**방법 B: SQL 직접 실행**

Supabase Dashboard > SQL Editor에서 [RESET_ALL_DATA.sql](supabase/queries/RESET_ALL_DATA.sql) 내용 실행

### Step 4: Google Sheets 업데이트

#### 4.1 시트명 변경
- `ConversationalEx` → `real-talk-examples`
- `Conversational` → `real-talk`
- `News` → `news-phrases`
- `Daily` → `daily-phrases`
- `Shadowing` → `shadowing`
- `EnglishOrder` → `english-order`

#### 4.2 시트 컬럼 확인

**공통 컬럼 (모든 시트):**
- `number` - 세션 번호
- `audio-folder` - 스토리지 폴더명
- `status` - sync 상태 (비우거나 "pending")
- `additional_explain` - 추가 설명 (선택)

**daily-phrases:**
- `pattern_english`, `pattern_korean`
- `ex1_en`, `ex1_kor`, `ex1_filename`
- `ex2_en`, `ex2_kor`, `ex2_filename`

**news-phrases:**
- `pattern_english`, `pattern_korean`
- `filename` - 패턴 오디오 파일명
- `contents_json` - JSON 형식 표현들

**real-talk:**
- `filename` - 패턴 오디오 파일명
- `image-folder`, `image1`, `image2`
- `contents_json` - JSON 형식 표현들

**real-talk-examples:**
- `filename` - 패턴 오디오 파일명
- `conversational_num` - 연결된 Real Talk 세션 번호
- `contents_json` - JSON 형식 표현들

**shadowing:**
- `filename` - 패턴 오디오 파일명
- `contents_json` - JSON 형식 표현들

**english-order:**
- `filename` - 패턴 오디오 파일명
- `question` - 질문
- `contents_json` - JSON 형식 표현들

#### 4.3 제거 가능한 컬럼
- `category` - 더 이상 사용하지 않음 (시트명으로 카테고리 결정)
- news-phrases의 `ex1_en ~ ex6_en`, `ex1_kor ~ ex6_kor` - contents_json 사용

#### 4.4 audio-folder 값 업데이트

각 시트의 `audio-folder` 컬럼 값:
- `daily-phrases` 시트 → `daily-phrases`
- `news-phrases` 시트 → `news-phrases`
- `real-talk` 시트 → `real-talk`
- `real-talk-examples` 시트 → `real-talk`
- `shadowing` 시트 → `shadowing`
- `english-order` 시트 → `english-order`

### Step 5: Supabase Storage 폴더명 변경

Supabase Dashboard > Storage > audio-files 버킷:
- `daily` → `daily-phrases`로 폴더명 변경
- `news` → `news-phrases`로 폴더명 변경
- `conversational` → `real-talk`로 폴더명 변경

이미지 파일도 동일하게 변경

### Step 6: 데이터 동기화

1. 브라우저에서 앱 실행: `http://localhost:3000`
2. Admin 페이지로 이동
3. 각 카테고리별로 "Sync" 버튼 클릭:
   - daily-phrases
   - news-phrases
   - real-talk
   - real-talk-examples
   - shadowing
   - english-order

### Step 7: 확인

1. Home 화면에서 카테고리별 진행률 확인
2. 각 카테고리 클릭하여 세션 목록 확인
3. 세션 클릭하여 표현들이 올바르게 표시되는지 확인
4. Complete 버튼 테스트
5. Calendar 화면에서 진행률 확인

## ✅ 체크리스트

- [ ] Supabase 마이그레이션 실행 (total_sessions 제거)
- [ ] Categories 테이블 slug 업데이트
- [ ] 기존 데이터 삭제 (스크립트 또는 SQL)
- [ ] Google Sheets 시트명 변경
- [ ] Google Sheets 컬럼 확인 및 정리
- [ ] Google Sheets audio-folder 값 업데이트
- [ ] Supabase Storage 폴더명 변경
- [ ] 각 카테고리 데이터 동기화
- [ ] 앱에서 모든 기능 테스트

## 🚨 주의사항

- 이 과정은 **모든 진행 데이터를 삭제**합니다
- 실행 전에 중요한 데이터가 있다면 백업하세요
- `SUPABASE_SERVICE_ROLE_KEY`가 `.env.local`에 설정되어 있어야 합니다
- 프로덕션 환경에서는 신중하게 진행하세요

## 🔗 관련 파일

- [Reset Script](scripts/reset-all-data.ts)
- [Reset SQL](supabase/queries/RESET_ALL_DATA.sql)
- [Migration 024](supabase/migrations/024_remove_total_sessions_column.sql)
- [Sync API](app/api/sync-google-sheets/route.ts)
