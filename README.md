# English Study Review App

This is a code bundle for English Study Review App. The original project is available at https://www.figma.com/design/81TlHgMRrwyy2oZmOUixRm/English-Study-Review-App.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Environment Variables Setup

### Local Development

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your actual values in `.env.local`:
   - Get Supabase credentials from your Supabase project settings
   - Get Google Service Account credentials from Google Cloud Console

### Deployment (Vercel/Netlify/etc.)

For the "데이터 업데이트" (Data Update) feature to work in production, you **must** configure these environment variables in your deployment platform:

#### Required Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_SPREADSHEET_ID`

#### Important: GOOGLE_PRIVATE_KEY Format

The `GOOGLE_PRIVATE_KEY` must be entered with **escaped newlines** (`\n`):

**Correct format:**
```
"-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhki...\n-----END PRIVATE KEY-----\n"
```

**Common mistakes:**
- ❌ Using literal newlines (will cause "string did not match expected pattern" error)
- ❌ Missing the quotes around the entire key
- ❌ Missing `\n` characters

#### Platform-specific Instructions:

**Vercel:**
1. Go to Project Settings → Environment Variables
2. Add each variable
3. For `GOOGLE_PRIVATE_KEY`, paste the key **with** `\n` characters (not actual newlines)
4. Redeploy after adding variables

**Netlify:**
1. Go to Site Settings → Environment Variables
2. Add each variable
3. For `GOOGLE_PRIVATE_KEY`, use the same escaped format
4. Trigger a new deploy

**Google Cloud Run:**

**Step 1: Configure Environment Variables**
1. Go to Cloud Run Console → Select your service
2. Click "EDIT & DEPLOY NEW REVISION" (수정 및 새 리비전 배포)
3. Go to "Variables & Secrets" tab (변수 및 보안 비밀)
4. Click "ADD VARIABLE" (변수 추가) for each environment variable:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_SPREADSHEET_ID`
5. For `GOOGLE_PRIVATE_KEY`:
   - Click "ADD VARIABLE"
   - Name: `GOOGLE_PRIVATE_KEY`
   - Value: **WITHOUT quotes**, use `\n` for newlines:
     ```
     -----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhki...(your key)...\n-----END PRIVATE KEY-----\n
     ```
   - ⚠️ **IMPORTANT**:
     - Do NOT include the `"` quotes in the value field
     - GCP will automatically handle the value as a string
     - Use `\n` (backslash + n) for line breaks, not actual newlines

**Step 2: Increase Request Timeout (Optional, if needed)**
1. In the same "EDIT & DEPLOY NEW REVISION" page
2. Expand "Container, Connections, Security" section (컨테이너, 연결, 보안)
3. Under "General" tab, find "Request timeout" (요청 제한 시간)
4. If you experience 504 timeout errors, increase from default (60 seconds) to **120 seconds** (2 minutes)
5. Click "DEPLOY" (배포)
6. Wait for deployment to complete

**Alternative for Google Cloud Run (using Secret Manager - Recommended for sensitive data):**
1. Go to Secret Manager → Create Secret
2. Name: `google-private-key`
3. Value: Your private key (can use actual newlines here)
4. Click "CREATE SECRET"
5. Go to Cloud Run → Edit & Deploy New Revision → Variables & Secrets
6. Click "REFERENCE A SECRET"
7. Select `google-private-key` and set it to `GOOGLE_PRIVATE_KEY` environment variable
8. Deploy

#### How to get Google Private Key with proper format:

From your Google Cloud Service Account JSON file:
```json
{
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"
}
```

Copy the entire value of `private_key` field (including the quotes) into your deployment platform's `GOOGLE_PRIVATE_KEY` environment variable.
