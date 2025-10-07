import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type DailyStats = Database['public']['Tables']['daily_study_stats']['Row'];

export interface CalendarDayData {
  date: string; // YYYY-MM-DD format
  studyDate: Date;
  sessionsCompleted: number;
  totalSessions: number;
  percentage: number;
  status: 'completed' | 'partial' | 'not-studied';
  categoryBreakdown: {
    categoryId: string;
    categoryName: string;
    completed: number;
    total: number;
  }[];
}

interface UseCalendarReturn {
  monthData: CalendarDayData[];
  loading: boolean;
  error: Error | null;
  refreshMonth: () => Promise<void>;
}

/**
 * Hook for fetching monthly calendar study data
 * @param year - Year to fetch (YYYY)
 * @param month - Month to fetch (1-12)
 * @param userId - User ID (defaults to test user)
 */
export function useCalendar(
  year: number,
  month: number,
  userId: string = '00000000-0000-0000-0000-000000000001'
): UseCalendarReturn {
  const [monthData, setMonthData] = useState<CalendarDayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMonthData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date range for the month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); // Last day of month

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Fetch daily stats for the month
      const { data: dailyStats, error: statsError } = await supabase
        .from('daily_study_stats')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .eq('user_id', userId)
        .gte('study_date', startDateStr)
        .lte('study_date', endDateStr)
        .order('study_date', { ascending: true });

      if (statsError) throw statsError;

      // Create a map of date -> stats
      const statsMap = new Map<string, DailyStats[]>();

      dailyStats?.forEach((stat) => {
        const dateKey = stat.study_date;
        if (!statsMap.has(dateKey)) {
          statsMap.set(dateKey, []);
        }
        statsMap.get(dateKey)!.push(stat);
      });

      // Generate calendar data for all days in month
      const daysInMonth = endDate.getDate();
      const calendarData: CalendarDayData[] = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month - 1, day);
        // Use local date formatting to avoid timezone shift
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayStats = statsMap.get(dateStr) || [];

        // Calculate totals across all categories for this day
        const totalCompleted = dayStats.reduce((sum, stat) => sum + stat.sessions_completed, 0);
        const totalSessions = dayStats.reduce((sum, stat) => sum + stat.total_sessions, 0);

        const percentage = totalSessions > 0 ? Math.round((totalCompleted / totalSessions) * 100) : 0;

        // Debug: Log percentage for today
        const today = new Date();
        const isToday = currentDate.getDate() === today.getDate() &&
                       currentDate.getMonth() === today.getMonth() &&
                       currentDate.getFullYear() === today.getFullYear();

        if (isToday && dayStats.length > 0) {
          console.log('Today Calendar Data:', {
            date: dateStr,
            totalCompleted,
            totalSessions,
            percentage,
            stats: dayStats
          });
        }

        // Determine status
        let status: 'completed' | 'partial' | 'not-studied' = 'not-studied';
        if (percentage === 100) {
          status = 'completed';
        } else if (percentage > 0) {
          status = 'partial';
        }

        // Build category breakdown
        const categoryBreakdown = dayStats.map((stat) => ({
          categoryId: stat.category_id,
          categoryName: (stat as any).categories?.name || 'Unknown',
          completed: stat.sessions_completed,
          total: stat.total_sessions,
        }));

        calendarData.push({
          date: dateStr,
          studyDate: currentDate,
          sessionsCompleted: totalCompleted,
          totalSessions: totalSessions,
          percentage,
          status,
          categoryBreakdown,
        });
      }

      setMonthData(calendarData);
    } catch (err) {
      console.error('Error fetching calendar data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch calendar data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthData();
  }, [year, month, userId]);

  return {
    monthData,
    loading,
    error,
    refreshMonth: fetchMonthData,
  };
}
