-- Test timezone calculations
-- Run this in Supabase SQL Editor to see what's happening

DO $$
DECLARE
  korea_now TIMESTAMPTZ;
  korea_today DATE;
  utc_now TIMESTAMPTZ;
BEGIN
  utc_now := NOW();
  korea_now := NOW() AT TIME ZONE 'Asia/Seoul';
  korea_today := korea_now::DATE;

  RAISE NOTICE '=== TIMEZONE TEST ===';
  RAISE NOTICE 'UTC NOW: %', utc_now;
  RAISE NOTICE 'Korea NOW: %', korea_now;
  RAISE NOTICE 'Korea TODAY: %', korea_today;
END $$;

-- Also show actual data from user_session_progress
SELECT
  session_id,
  completed_at as utc_time,
  (completed_at AT TIME ZONE 'Asia/Seoul') as korea_time,
  (completed_at AT TIME ZONE 'Asia/Seoul')::DATE as korea_date,
  (NOW() AT TIME ZONE 'Asia/Seoul')::DATE as today_korea
FROM user_session_progress
WHERE user_id = '00000000-0000-0000-0000-000000000001'
  AND status = 'completed'
ORDER BY completed_at DESC
LIMIT 5;

-- Test the RPC function directly
SELECT * FROM get_categories_with_progress('00000000-0000-0000-0000-000000000001');
