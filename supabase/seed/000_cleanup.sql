-- Cleanup script - Delete all data from tables
-- Run this before running seed scripts

-- Delete in order (respecting foreign key constraints)
DELETE FROM user_expression_progress;
DELETE FROM user_session_progress;
DELETE FROM daily_study_stats;
DELETE FROM user_settings;
DELETE FROM expressions;
DELETE FROM sessions;
DELETE FROM categories;
