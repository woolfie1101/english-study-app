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

  return {
    loading,
    error,
    completeExpression,
    getCompletedExpressions,
    isExpressionCompleted,
  };
}
