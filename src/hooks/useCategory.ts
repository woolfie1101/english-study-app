import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type Category = Database['public']['Tables']['categories']['Row']
type Session = Database['public']['Tables']['sessions']['Row']

interface CategoryWithSessions extends Category {
  sessions: Session[]
  completed: number
}

export function useCategory(slug: string, userId: string = '00000000-0000-0000-0000-000000000001') {
  const [category, setCategory] = useState<CategoryWithSessions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCategory = async () => {
    try {
      setLoading(true)

      // Fetch category by slug
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single()

      if (categoryError) throw categoryError
      if (!categoryData) {
        setCategory(null)
        return
      }

      // Fetch sessions for this category
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')
        .eq('category_id', categoryData.id)
        .order('session_number')

      if (sessionsError) throw sessionsError

      // Get user progress for this category
      const { data: progressData, error: progressError } = await supabase
        .from('user_session_progress')
        .select('session_id, status')
        .eq('user_id', userId)
        .eq('category_id', categoryData.id)
        .eq('status', 'completed')

      if (progressError) throw progressError

      // Count completed sessions
      const completed = progressData?.length || 0

      const categoryWithSessions: CategoryWithSessions = {
        ...categoryData,
        sessions: sessionsData || [],
        completed
      }

      setCategory(categoryWithSessions)
    } catch (err) {
      setError(err as Error)
      console.error('Error fetching category:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategory()
  }, [slug, userId])

  // Return refetch function for manual refresh
  return { category, loading, error, refetch: fetchCategory }
}
