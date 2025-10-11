export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string | null
          display_order: number | null
          description: string | null
          metadata: any | null
          icon: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug?: string | null
          display_order?: number | null
          description?: string | null
          metadata?: any | null
          icon?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string | null
          display_order?: number | null
          description?: string | null
          metadata?: any | null
          icon?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          category_id: string
          session_number: number
          title: string
          pattern_english: string | null
          pattern_korean: string | null
          description: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          session_number: number
          title: string
          pattern_english?: string | null
          pattern_korean?: string | null
          description?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          session_number?: number
          title?: string
          pattern_english?: string | null
          pattern_korean?: string | null
          description?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      expressions: {
        Row: {
          id: string
          session_id: string
          display_order: number
          english: string
          korean: string
          audio_url: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          display_order: number
          english: string
          korean: string
          audio_url?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          display_order?: number
          english?: string
          korean?: string
          audio_url?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      user_session_progress: {
        Row: {
          id: string
          user_id: string
          session_id: string
          status: 'not-started' | 'in-progress' | 'completed'
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id: string
          status: 'not-started' | 'in-progress' | 'completed'
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string
          status?: 'not-started' | 'in-progress' | 'completed'
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_expression_progress: {
        Row: {
          id: string
          user_id: string
          expression_id: string
          completed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          expression_id: string
          completed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          expression_id?: string
          completed_at?: string
          created_at?: string
        }
      }
      daily_study_stats: {
        Row: {
          id: string
          user_id: string
          study_date: string
          category_id: string
          sessions_completed: number
          total_sessions: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          study_date: string
          category_id: string
          sessions_completed?: number
          total_sessions?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          study_date?: string
          category_id?: string
          sessions_completed?: number
          total_sessions?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          auto_play_audio: boolean
          daily_reminder: boolean
          daily_goal: number
          dark_mode: boolean
          reminder_time: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          auto_play_audio?: boolean
          daily_reminder?: boolean
          daily_goal?: number
          dark_mode?: boolean
          reminder_time?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          auto_play_audio?: boolean
          daily_reminder?: boolean
          daily_goal?: number
          dark_mode?: boolean
          reminder_time?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_category_progress: {
        Args: {
          p_user_id?: string
        }
        Returns: {
          user_id: string
          category_id: string
          category_name: string
          display_order: number
          total_sessions: number
          completed_sessions: number
          percentage: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
