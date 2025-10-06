-- ============================================================================
-- DEPRECATED: This file is replaced by 005_update_rls_policies.sql
-- DO NOT USE - Keep for reference only
-- ============================================================================

-- Enable RLS for user progress tables
ALTER TABLE user_expression_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_study_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_expression_progress
-- Users can view their own progress
CREATE POLICY "Users can view own expression progress"
  ON user_expression_progress
  FOR SELECT
  USING (user_id = auth.uid() OR user_id = '00000000-0000-0000-0000-000000000001');

-- Users can insert their own progress
CREATE POLICY "Users can insert own expression progress"
  ON user_expression_progress
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id = '00000000-0000-0000-0000-000000000001');

-- Users can update their own progress
CREATE POLICY "Users can update own expression progress"
  ON user_expression_progress
  FOR UPDATE
  USING (user_id = auth.uid() OR user_id = '00000000-0000-0000-0000-000000000001');

-- RLS Policies for daily_study_stats
-- Users can view their own stats
CREATE POLICY "Users can view own daily stats"
  ON daily_study_stats
  FOR SELECT
  USING (user_id = auth.uid() OR user_id = '00000000-0000-0000-0000-000000000001');

-- Users can insert their own stats
CREATE POLICY "Users can insert own daily stats"
  ON daily_study_stats
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id = '00000000-0000-0000-0000-000000000001');

-- Users can update their own stats
CREATE POLICY "Users can update own daily stats"
  ON daily_study_stats
  FOR UPDATE
  USING (user_id = auth.uid() OR user_id = '00000000-0000-0000-0000-000000000001');

-- Add trigger for user_expression_progress updated_at
CREATE TRIGGER update_user_expression_progress_updated_at
  BEFORE UPDATE ON user_expression_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add trigger for daily_study_stats updated_at
CREATE TRIGGER update_daily_study_stats_updated_at
  BEFORE UPDATE ON daily_study_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
