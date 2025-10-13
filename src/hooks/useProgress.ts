import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getLocalDateTimeString, getLocalDateString, extractLocalDateString } from '@/lib/utils';

export function useProgress() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * 표현 완료 처리
   * user_expression_progress 테이블에 저장
   * 이미 완료한 표현이면 오늘 날짜로 업데이트
   */
  const completeExpression = async (
    userId: string,
    expressionId: string,
    sessionId: string,
    categoryId: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Use upsert to handle duplicates - update completed_at to today
      // Store date in local timezone to avoid UTC/local mismatch
      const { data, error } = await supabase
        .from('user_expression_progress')
        .upsert({
          user_id: userId,
          expression_id: expressionId,
          session_id: sessionId,
          category_id: categoryId,
          completed_at: getLocalDateTimeString(),
        }, {
          onConflict: 'user_id,expression_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 사용자의 표현 완료 목록 조회 (오늘 날짜 기준)
   */
  const getCompletedExpressions = async (
    userId: string,
    sessionId?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('user_expression_progress')
        .select('expression_id, completed_at')
        .eq('user_id', userId);

      if (sessionId) {
        query = query.eq('session_id', sessionId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter by today's date in local timezone
      const today = getLocalDateString();

      const todayCompleted = (data || []).filter(item => {
        if (!item.completed_at) return false;
        const completedDateStr = extractLocalDateString(item.completed_at);
        return completedDateStr === today;
      });

      return todayCompleted;
    } catch (err) {
      const error = err as Error;
      setError(error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * 표현 완료 여부 확인
   */
  const isExpressionCompleted = async (
    userId: string,
    expressionId: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('user_expression_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('expression_id', expressionId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (err) {
      console.error('Error checking expression completion:', err);
      return false;
    }
  };

  /**
   * 세션 완료 처리
   * user_session_progress 테이블 업데이트
   */
  const completeSession = async (
    userId: string,
    sessionId: string,
    categoryId: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Check if progress record exists
      const { data: existing } = await supabase
        .from('user_session_progress')
        .select('id, status')
        .eq('user_id', userId)
        .eq('session_id', sessionId)
        .maybeSingle();

      if (existing) {
        // Update existing record
        const { data, error } = await supabase
          .from('user_session_progress')
          .update({
            status: 'completed',
            completed_at: getLocalDateTimeString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('user_session_progress')
          .insert({
            user_id: userId,
            session_id: sessionId,
            category_id: categoryId,
            status: 'completed',
            completed_at: getLocalDateTimeString(),
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 세션 진행 상황 조회
   */
  const getSessionProgress = async (
    userId: string,
    sessionId: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('user_session_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('session_id', sessionId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching session progress:', err);
      return null;
    }
  };

  /**
   * 일별 통계 업데이트
   * daily_study_stats 테이블 업데이트
   */
  const updateDailyStats = async (
    userId: string,
    categoryId: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Use local timezone to avoid date shift
      const today = getLocalDateString();

      console.log('=== Daily Stats Update ===');
      console.log('Formatted Date (Local):', today);

      // Get ACTUAL total sessions count for this category
      // Don't trust categories.total_sessions - count directly from sessions table
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('id')
        .eq('category_id', categoryId);

      if (sessionsError) throw sessionsError;

      const totalSessions = sessionsData?.length || 0;

      // Count actual completed sessions for this category on this date only
      const { data: completedSessions, error: countError } = await supabase
        .from('user_session_progress')
        .select('id, completed_at')
        .eq('user_id', userId)
        .eq('category_id', categoryId)
        .eq('status', 'completed')
        .not('completed_at', 'is', null);

      // Filter by today's date in local timezone
      const todayCompleted = completedSessions?.filter(session => {
        if (!session.completed_at) return false;
        const completedDateStr = extractLocalDateString(session.completed_at);
        return completedDateStr === today;
      }) || [];

      if (countError) throw countError;

      const actualCompletedCount = todayCompleted.length;

      console.log('=== Calculating Actual Completed Count ===');
      console.log('Category ID:', categoryId);
      console.log('Actual Completed Sessions:', actualCompletedCount);
      console.log('Total Sessions:', totalSessions);

      // Check if today's stats exist for this category
      const { data: existing } = await supabase
        .from('daily_study_stats')
        .select('*')
        .eq('user_id', userId)
        .eq('study_date', today)
        .eq('category_id', categoryId)
        .maybeSingle();

      if (existing) {
        // Update existing stats with actual count
        console.log('Updating existing stats for:', today);
        const { data, error } = await supabase
          .from('daily_study_stats')
          .update({
            sessions_completed: actualCompletedCount,
            total_sessions: totalSessions,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        console.log('Updated stats:', data);
        return data;
      } else {
        // Insert new stats
        console.log('Inserting new stats for:', today);
        const { data, error } = await supabase
          .from('daily_study_stats')
          .insert({
            user_id: userId,
            category_id: categoryId,
            study_date: today,
            sessions_completed: actualCompletedCount,
            total_sessions: totalSessions,
          })
          .select()
          .single();

        if (error) throw error;
        console.log('Inserted stats:', data);
        return data;
      }
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 일별 통계 조회
   */
  const getDailyStats = async (
    userId: string,
    startDate?: string,
    endDate?: string
  ) => {
    try {
      let query = supabase
        .from('daily_study_stats')
        .select('*')
        .eq('user_id', userId)
        .order('study_date', { ascending: false });

      if (startDate) {
        query = query.gte('study_date', startDate);
      }
      if (endDate) {
        query = query.lte('study_date', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching daily stats:', err);
      return [];
    }
  };

  return {
    loading,
    error,
    completeExpression,
    getCompletedExpressions,
    isExpressionCompleted,
    completeSession,
    getSessionProgress,
    updateDailyStats,
    getDailyStats,
  };
}
