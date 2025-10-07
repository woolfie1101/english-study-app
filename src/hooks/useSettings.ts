import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type UserSettings = Database['public']['Tables']['user_settings']['Row'];
type UserSettingsUpdate = Database['public']['Tables']['user_settings']['Update'];

const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 설정 로드
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .single();

      if (fetchError) {
        // 설정이 없으면 기본 설정 생성
        if (fetchError.code === 'PGRST116') {
          await createDefaultSettings();
          return;
        }
        throw fetchError;
      }

      setSettings(data);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  // 기본 설정 생성
  const createDefaultSettings = async () => {
    try {
      const { data, error: insertError } = await supabase
        .from('user_settings')
        .insert({
          user_id: TEST_USER_ID,
          auto_play_audio: true,
          daily_reminder: false,
          daily_goal: 10,
          dark_mode: false,
          reminder_time: '09:00:00'
        })
        .select()
        .single();

      if (insertError) throw insertError;
      setSettings(data);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to create default settings:', err);
    }
  };

  // 설정 업데이트
  const updateSettings = async (updates: UserSettingsUpdate) => {
    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', TEST_USER_ID)
        .select()
        .single();

      if (updateError) throw updateError;

      setSettings(data);
      return data;
    } catch (err) {
      setError(err as Error);
      console.error('Failed to update settings:', err);
      throw err;
    }
  };

  // 개별 설정 업데이트 헬퍼 함수들
  const toggleAutoPlayAudio = async () => {
    if (!settings) return;
    return updateSettings({ auto_play_audio: !settings.auto_play_audio });
  };

  const toggleDailyReminder = async () => {
    if (!settings) return;
    return updateSettings({ daily_reminder: !settings.daily_reminder });
  };

  const toggleDarkMode = async () => {
    if (!settings) return;
    return updateSettings({ dark_mode: !settings.dark_mode });
  };

  const updateDailyGoal = async (goal: number) => {
    return updateSettings({ daily_goal: goal });
  };

  const updateReminderTime = async (time: string) => {
    return updateSettings({ reminder_time: time });
  };

  // 진행 상황 초기화
  const resetProgress = async () => {
    try {
      setError(null);

      // 모든 진행 상황 데이터 삭제
      const { error: expressionError } = await supabase
        .from('user_expression_progress')
        .delete()
        .eq('user_id', TEST_USER_ID);

      if (expressionError) throw expressionError;

      const { error: sessionError } = await supabase
        .from('user_session_progress')
        .delete()
        .eq('user_id', TEST_USER_ID);

      if (sessionError) throw sessionError;

      const { error: statsError } = await supabase
        .from('daily_study_stats')
        .delete()
        .eq('user_id', TEST_USER_ID);

      if (statsError) throw statsError;

      return true;
    } catch (err) {
      setError(err as Error);
      console.error('Failed to reset progress:', err);
      throw err;
    }
  };

  return {
    settings,
    loading,
    error,
    updateSettings,
    toggleAutoPlayAudio,
    toggleDailyReminder,
    toggleDarkMode,
    updateDailyGoal,
    updateReminderTime,
    resetProgress,
    reload: loadSettings
  };
}
