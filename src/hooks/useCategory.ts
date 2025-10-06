import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type Category = Database['public']['Tables']['categories']['Row']
type Session = Database['public']['Tables']['sessions']['Row']

interface CategoryWithSessions extends Category {
  sessions: Session[]
  completed: number
}

export function useCategory(categoryId: string) {
  const [category, setCategory] = useState<CategoryWithSessions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchCategory() {
      try {
        setLoading(true)

        // Fetch category
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('*')
          .eq('id', categoryId)
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
          .eq('category_id', categoryId)
          .order('session_number')

        if (sessionsError) throw sessionsError

        // For now, completed is 0 (will add user progress later)
        const categoryWithSessions: CategoryWithSessions = {
          ...categoryData,
          sessions: sessionsData || [],
          completed: 0
        }

        setCategory(categoryWithSessions)
      } catch (err) {
        setError(err as Error)
        console.error('Error fetching category:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategory()
  }, [categoryId])

  return { category, loading, error }
}
