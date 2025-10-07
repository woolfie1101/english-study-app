import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useProgress() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * 표현 완료 처리
   * user_expression_progress 테이블에 저장
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
      const { data, error } = await supabase
        .from('user_expression_progress')
        .insert({
          user_id: userId,
          expression_id: expressionId,
          session_id: sessionId,
          category_id: categoryId,
          completed_at: new Date().toISOString(),
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
   * 사용자의 표현 완료 목록 조회
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
      return data || [];
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
            completed_at: new Date().toISOString(),
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
            completed_at: new Date().toISOString(),
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
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const today = `${year}-${month}-${day}`; // YYYY-MM-DD in local timezone

      console.log('=== Daily Stats Update ===');
      console.log('Current Date Object:', now);
      console.log('Formatted Date (Local):', today);
      console.log('ISO String:', now.toISOString());

      // Get total sessions for this category
      const { data: categoryData } = await supabase
        .from('categories')
        .select('total_sessions')
        .eq('id', categoryId)
        .single();

      const totalSessions = categoryData?.total_sessions || 0;

      // Count actual completed sessions for this category on this date
      const { data: completedSessions, error: countError } = await supabase
        .from('user_session_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('category_id', categoryId)
        .eq('status', 'completed')
        .not('completed_at', 'is', null);

      if (countError) throw countError;

      const actualCompletedCount = completedSessions?.length || 0;

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
