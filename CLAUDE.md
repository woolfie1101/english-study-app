# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

English Study App - A language learning application built with Next.js 15 App Router, migrated from Vite + React. The app helps users study English through categorized sessions with audio playback and progress tracking.

**Original Design**: https://www.figma.com/design/81TlHgMRrwyy2oZmOUixRm/English-Study-Review-App

## Development Commands

```bash
# Install dependencies
npm i

# Run development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Architecture & Key Patterns

### App Router Structure

The app uses Next.js 15 App Router with file-based routing:

```
app/
├── layout.tsx              # Root layout with BottomNavigation
├── page.tsx                # Home page (/)
├── calendar/page.tsx       # Calendar view (/calendar)
├── settings/page.tsx       # Settings page (/settings)
└── category/
    └── [id]/
        ├── page.tsx        # Category detail (/category/[id])
        └── session/[sessionNumber]/page.tsx  # Session detail
```

**Important**: All routes are defined by the folder structure. No manual route configuration needed.

### Component Architecture

**Screen Components** (`src/components/`):
- All screen components are Client Components (`"use client"`)
- Screen components are imported into page files in `app/` directory
- Each screen manages its own state and handles its UI logic

**Pattern**: Page files in `app/` are minimal wrappers that extract route params and pass them to screen components:

```tsx
// app/category/[id]/page.tsx
export default function CategoryPage() {
  const params = useParams();
  return <CategoryScreen categoryId={params.id} />;
}
```

### Server vs Client Components

**Server Components** (default):
- Page files in `app/` directory
- Root layout (`app/layout.tsx`)

**Client Components** (`"use client"`):
- All components in `src/components/` directory
- Any component using hooks (useState, useEffect, useRouter, etc.)
- Interactive UI components

### Data Flow Pattern

Currently using **mock data** within components. The app is ready for Supabase backend integration:

**Expected API structure**:
```
GET /api/categories               # List all categories
GET /api/categories/[id]          # Category detail with sessions
GET /api/sessions/[id]            # Session detail with expressions
PUT /api/sessions/[id]/complete   # Mark session complete
GET /api/progress                 # User progress data
GET /api/calendar/[year]/[month]  # Monthly study calendar
```

**Data types** (from existing components):
```typescript
interface Category {
  id: string;
  name: string;
  completed: number;
  total: number;
  percentage: number;
}

interface Session {
  number: number;
  title: string;
  pattern_english: string;
  pattern_korean: string;
}

interface Expression {
  id: string;
  english: string;
  korean: string;
  audioUrl: string;
  completed: boolean;
}
```

### Import Path Alias

Uses `@/` alias for `src/` directory:
```tsx
import { HomeScreen } from "@/components/HomeScreen";
import { Button } from "@/components/ui/button";
```

### UI Component Library

Uses shadcn/ui components with Radix UI primitives + Tailwind CSS:

**Essential components** (in `src/components/ui/`):
- `button.tsx` - Button component with variants
- `card.tsx` - Card container
- `progress.tsx` - Linear progress bar
- `slider.tsx` - Range slider
- `switch.tsx` - Toggle switch

**Custom components**:
- `AudioPlayer.tsx` - Audio playback with progress bar
- `CircularProgress.tsx` - Circular progress indicator
- `BottomNavigation.tsx` - Main navigation using Next.js Link

### Styling Approach

- **Tailwind CSS** for all styling (no CSS modules)
- **Mobile-first** responsive design
- **Max-width container**: `max-w-md mx-auto` for mobile app feel
- **Color scheme**: White background, green accent (`bg-green-500`), blue patterns (`bg-blue-50`)

### Known Issues & Solutions

**Hydration Warnings**:
- Caused by browser extensions (WXT framework)
- Already mitigated: Date objects rendered only on client using `useEffect`
- Safe to ignore during development

**TypeScript Configuration**:
- Strict mode enabled
- Path alias: `@/*` → `./src/*`
- All `.tsx` files must have proper type annotations

## Migration Context

**Recently migrated from**:
- Vite + React → Next.js 15 App Router
- React Router → Next.js file-based routing
- Client-side rendering → Server Components + Client Components

**Removed dependencies**:
- All Vite-related packages
- React Router
- Unused shadcn/ui components (40+ components removed)

**Current state**:
- ✅ Next.js App Router fully functional
- ✅ All routes working with proper navigation
- ✅ TypeScript configured
- ✅ Tailwind CSS integrated
- 🔄 Backend integration pending (Supabase planned)

## Planned Backend (Supabase)

The app is architected for Supabase integration with this schema:

```sql
categories        # id, name, total_sessions, icon
sessions          # id, category_id, number, title, pattern_english, pattern_korean
expressions       # id, session_id, english, korean, audio_url
user_progress     # id, user_id, session_id, completed_at, status
daily_study       # id, user_id, date, category_id, sessions_completed
```

**Integration approach**:
1. Supabase client setup with environment variables
2. API Routes in `app/api/` for data operations
3. Server Components for initial data fetching
4. Client Components for mutations via API routes

## Development Guidelines

### Code Organization Rules

**⚠️ File Size Limit**: Keep all files under 300 lines of code
- If a file exceeds 300 lines, split it into smaller, focused modules
- Extract reusable logic into separate utility files
- Create custom hooks for complex state logic
- Break down large components into smaller sub-components

### Adding New Routes

1. Create folder structure in `app/` directory
2. Add `page.tsx` file (Server Component by default)
3. Import screen component from `src/components/`
4. Extract params using `useParams()` if dynamic route

### Adding New Components

1. Create in `src/components/` directory
2. Add `"use client"` if using hooks or interactivity
3. Use TypeScript interfaces for props
4. Import UI components from `@/components/ui/`

### Working with Navigation

- Use Next.js `Link` component for navigation
- Use `useRouter()` from `next/navigation` for programmatic navigation
- Use `usePathname()` to check current route
- Bottom navigation automatically highlights active route

### State Management

Currently using local component state (`useState`). For backend integration:
- Server Components: Direct Supabase calls
- Client Components: API Routes + SWR/React Query (to be added)
- No global state management (Redux, Zustand) needed yet

## Tech Stack Reference

- **Next.js**: 15.5.4 (App Router)
- **React**: 19.2.0
- **TypeScript**: 5.9.3
- **Tailwind CSS**: 3.4.17
- **UI Library**: Radix UI + shadcn/ui
- **Icons**: lucide-react
