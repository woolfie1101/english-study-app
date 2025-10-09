# Database Migrations

## Current Schema

**Active Migration**: `000_complete_schema.sql`

This file contains the complete, consolidated database schema for the English Study App.

## Schema Overview

### Tables
1. **categories** - Learning categories (Daily Expression, Pattern, Grammar)
2. **sessions** - Individual learning sessions within categories
3. **expressions** - English expressions to learn within sessions
4. **user_session_progress** - Track user session completion status
5. **user_expression_progress** - Track individual expression completion
6. **daily_study_stats** - Daily study statistics by date and category
7. **user_settings** - User app settings

### Key Features
- **Daily Reset Logic**: Progress is filtered by CURRENT_DATE in queries
- **RLS Policies**: Row-level security for user data isolation
- **Test User Support**: Special UUID `00000000-0000-0000-0000-000000000001` for development
- **Storage Integration**: Audio files bucket with public read access

## Fresh Database Setup

```bash
# Apply the complete schema to a new Supabase project
supabase db push
```

Or manually via Supabase Dashboard:
1. Open SQL Editor
2. Copy and run `000_complete_schema.sql`

## Archive

All previous migration files (001-017) have been archived in the `/archive` folder.
These represent the historical evolution of the schema but are no longer needed for new deployments.

## Test User

```
UUID: 00000000-0000-0000-0000-000000000001
Email: test@example.com
```

Usage in code:
```typescript
const userId = '00000000-0000-0000-0000-000000000001';
```

## Important Notes

1. **Date Handling**: All date comparisons use `DATE(completed_at) = CURRENT_DATE` to ensure proper daily reset
2. **Test User**: Anonymous users use test user ID for development
3. **Storage**: Audio files are stored in `audio-files` bucket with public access
4. **Functions**: `get_categories_with_progress()` returns TODAY's progress only

## Schema Version

- **Version**: 1.0.0 (Consolidated)
- **Generated**: 2025-10-09
- **Previous Migrations**: 18 files archived

## Future Updates

For future schema changes, create new numbered migration files:
```bash
# Example: Add new feature
# Create: 018_add_feature_name.sql
```
