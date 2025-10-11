import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Hook to initialize daily stats for today on app load
 * This ensures that when a new day starts, all categories start with 0 completed sessions
 */
export function useDailyStatsInitializer(userId: string = '00000000-0000-0000-0000-000000000001') {
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only run once per session
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initializeDailyStats = async () => {
      try {
        // Get today's date in local timezone
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        // Get all categories
        const { data: categories, error: categoriesError } = await supabase
          .from('categories')
          .select('id');

        if (categoriesError) throw categoriesError;
        if (!categories) return;

        // For each category, check if today's stats exist
        for (const category of categories) {
          // Get total sessions for this category
          const { data: sessionsData, error: sessionsError } = await supabase
            .from('sessions')
            .select('id')
            .eq('category_id', category.id);

          if (sessionsError) throw sessionsError;

          const totalSessions = sessionsData?.length || 0;

          // Count today's completed sessions for this category
          const { data: completedSessions, error: completedError } = await supabase
            .from('user_session_progress')
            .select('id, completed_at')
            .eq('user_id', userId)
            .eq('category_id', category.id)
            .eq('status', 'completed')
            .not('completed_at', 'is', null);

          if (completedError) throw completedError;

          // Filter by today's date in local timezone
          const todayCompleted = completedSessions?.filter(session => {
            if (!session.completed_at) return false;
            const completedDate = new Date(session.completed_at);
            const completedDateStr = `${completedDate.getFullYear()}-${String(completedDate.getMonth() + 1).padStart(2, '0')}-${String(completedDate.getDate()).padStart(2, '0')}`;
            return completedDateStr === today;
          }) || [];

          const actualCompletedCount = todayCompleted.length;

          // Check if today's stats exist for this category
          const { data: existingStats } = await supabase
            .from('daily_study_stats')
            .select('*')
            .eq('user_id', userId)
            .eq('study_date', today)
            .eq('category_id', category.id)
            .maybeSingle();

          if (existingStats) {
            // Update existing stats with correct count
            await supabase
              .from('daily_study_stats')
              .update({
                sessions_completed: actualCompletedCount,
                total_sessions: totalSessions,
              })
              .eq('id', existingStats.id);
          } else {
            // Insert new stats with 0 completed (or actual count if any)
            await supabase
              .from('daily_study_stats')
              .insert({
                user_id: userId,
                category_id: category.id,
                study_date: today,
                sessions_completed: actualCompletedCount,
                total_sessions: totalSessions,
              });
          }
        }
      } catch (error) {
        console.error('Error initializing daily stats:', error);
      }
    };

    initializeDailyStats();
  }, [userId]);
}
