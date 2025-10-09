-- ============================================================================
-- Migration 005: Update RLS Policies for Test User
-- ============================================================================
-- Purpose: Add RLS policies to allow test user access
-- Test User UUID: 00000000-0000-0000-0000-000000000001
-- Date: 2024
-- ============================================================================

-- user_session_progress RLS policies
DROP POLICY IF EXISTS "Users can view own session progress" ON user_session_progress;
DROP POLICY IF EXISTS "Users can insert own session progress" ON user_session_progress;
DROP POLICY IF EXISTS "Users can update own session progress" ON user_session_progress;

CREATE POLICY "Users can view own session progress"
  ON user_session_progress
  FOR SELECT
  USING (user_id = auth.uid() OR user_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Users can insert own session progress"
  ON user_session_progress
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Users can update own session progress"
  ON user_session_progress
  FOR UPDATE
  USING (user_id = auth.uid() OR user_id = '00000000-0000-0000-0000-000000000001');

-- user_expression_progress RLS policies
DROP POLICY IF EXISTS "Users can view own expression progress" ON user_expression_progress;
DROP POLICY IF EXISTS "Users can insert own expression progress" ON user_expression_progress;
DROP POLICY IF EXISTS "Users can update own expression progress" ON user_expression_progress;

CREATE POLICY "Users can view own expression progress"
  ON user_expression_progress
  FOR SELECT
  USING (user_id = auth.uid() OR user_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Users can insert own expression progress"
  ON user_expression_progress
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Users can update own expression progress"
  ON user_expression_progress
  FOR UPDATE
  USING (user_id = auth.uid() OR user_id = '00000000-0000-0000-0000-000000000001');

-- daily_study_stats RLS policies
DROP POLICY IF EXISTS "Users can view own daily stats" ON daily_study_stats;
DROP POLICY IF EXISTS "Users can insert own daily stats" ON daily_study_stats;
DROP POLICY IF EXISTS "Users can update own daily stats" ON daily_study_stats;

CREATE POLICY "Users can view own daily stats"
  ON daily_study_stats
  FOR SELECT
  USING (user_id = auth.uid() OR user_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Users can insert own daily stats"
  ON daily_study_stats
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Users can update own daily stats"
  ON daily_study_stats
  FOR UPDATE
  USING (user_id = auth.uid() OR user_id = '00000000-0000-0000-0000-000000000001');
