# TODO List - English Study App

## ✅ Completed

- [x] PRD.md 백엔드 전략 업데이트 (Supabase → Hybrid 전환 계획)
- [x] DB 마이그레이션 파일에 테이블 설명 주석 추가

## 🔄 Phase 1: Supabase Backend Setup

### 1. Supabase 프로젝트 설정
- [ ] Supabase 프로젝트 생성 (supabase.com)
- [ ] 환경 변수 설정 (.env.local)
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] DB 마이그레이션 실행

### 2. 샘플 데이터 준비
- [ ] 샘플 데이터 시드 파일 생성 (categories, sessions 구조만)
- [ ] Supabase에 샘플 데이터 입력

### 3. Supabase Client 설정
- [ ] @supabase/supabase-js 패키지 설치
- [ ] Supabase Client 유틸리티 생성 (lib/supabase/client.ts)
- [ ] TypeScript 타입 정의 생성 (lib/supabase/types.ts)

## 🎨 Phase 2: 컴포넌트 Supabase 연동

### 4. 화면별 데이터 연동
- [ ] HomeScreen - 카테고리 목록 및 진행률 데이터
- [ ] CategoryScreen - 세션 목록 데이터
- [ ] SessionDetailScreen - 표현 목록 및 진행 상황
- [ ] CalendarScreen - 월별 학습 통계
- [ ] SettingsScreen - 사용자 설정

### 5. 진행 상황 업데이트 기능
- [ ] 표현 완료 처리 (user_expression_progress)
- [ ] 세션 완료 처리 (user_session_progress)
- [ ] 일별 통계 업데이트 (daily_study_stats)

## 📁 Phase 3: Storage & Audio

### 6. 오디오 파일 관리
- [ ] Supabase Storage 버킷 생성
- [ ] 오디오 파일 업로드 기능
- [ ] AudioPlayer 컴포넌트 실제 오디오 연동

## 🐛 Phase 4: 품질 개선

### 7. 에러 처리 및 UX
- [ ] 로딩 상태 UI 추가
- [ ] 에러 핸들링 추가
- [ ] 네트워크 에러 처리

### 8. 테스트
- [ ] 각 화면 동작 테스트
- [ ] 진행 상황 업데이트 테스트
- [ ] 버그 수정

## 🚀 Phase 5: 배포 준비

### 9. 배포 설정
- [ ] Vercel 배포 설정
- [ ] 프로덕션 환경 변수 설정
- [ ] 배포 테스트

---

## 📝 Notes

- **콘텐츠 준비**: 영어 표현, 한글 번역, 음성 파일은 별도로 준비 필요
- **백엔드 전략**: Phase 1-2는 Supabase 직접 호출, 나중에 필요시 Hybrid로 전환
- **코드 품질**: 모든 파일 300줄 이하 유지
