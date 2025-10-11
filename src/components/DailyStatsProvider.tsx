"use client";

import { useDailyStatsInitializer } from '@/hooks/useDailyStatsInitializer';

export function DailyStatsProvider() {
  useDailyStatsInitializer();
  return null;
}
