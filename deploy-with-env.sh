#!/bin/bash

# 환경 변수 로드 및 배포 스크립트
# 사용법: ./deploy-with-env.sh

echo "🔐 환경 변수를 로드합니다..."

# .env.local 파일이 있는지 확인
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local 파일을 찾을 수 없습니다!"
    echo "프로젝트 루트에 .env.local 파일을 생성하고 환경 변수를 설정하세요."
    exit 1
fi

# .env.local 파일 로드
set -a  # 자동으로 export
source .env.local
set +a

# 환경 변수 확인
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ .env.local 파일에 필요한 Supabase 환경 변수가 없습니다!"
    echo "다음 환경 변수들이 설정되어 있는지 확인하세요:"
    echo "- NEXT_PUBLIC_SUPABASE_URL"
    echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "- SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

if [ -z "$GOOGLE_SERVICE_ACCOUNT_EMAIL" ] || [ -z "$GOOGLE_PRIVATE_KEY" ] || [ -z "$GOOGLE_SPREADSHEET_ID" ]; then
    echo "❌ .env.local 파일에 필요한 Google Sheets API 환경 변수가 없습니다!"
    echo "다음 환경 변수들이 설정되어 있는지 확인하세요:"
    echo "- GOOGLE_SERVICE_ACCOUNT_EMAIL"
    echo "- GOOGLE_PRIVATE_KEY"
    echo "- GOOGLE_SPREADSHEET_ID"
    exit 1
fi

echo "✅ 환경 변수 로드 완료!"

# 환경 변수 출력 (디버깅용)
echo "🔍 로드된 환경 변수 확인:"
echo "NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL:0:30}..."
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:20}..."
echo "SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY:0:20}..."
echo "GOOGLE_SERVICE_ACCOUNT_EMAIL: $GOOGLE_SERVICE_ACCOUNT_EMAIL"
echo "GOOGLE_PRIVATE_KEY: ${GOOGLE_PRIVATE_KEY:0:50}..."
echo "GOOGLE_SPREADSHEET_ID: $GOOGLE_SPREADSHEET_ID"

# deploy.sh 실행 (환경 변수는 이미 export됨)
echo ""
echo "🚀 배포를 시작합니다..."
./deploy.sh
