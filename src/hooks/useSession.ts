import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type Session = Database['public']['Tables']['sessions']['Row']
type Expression = Database['public']['Tables']['expressions']['Row']
type Category = Database['public']['Tables']['categories']['Row']

interface SessionWithExpressions extends Session {
  expressions: Expression[]
  category?: Category
}

export function useSession(slug: string, sessionNumber: number) {
  const [session, setSession] = useState<SessionWithExpressions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchSession() {
      try {
        setLoading(true)

        // First get category by slug
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', slug)
          .single()

        if (categoryError) throw categoryError
        if (!categoryData) {
          setSession(null)
          return
        }

        // Fetch session with category
        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .select('*, categories(*)')
          .eq('category_id', categoryData.id)
          .eq('session_number', sessionNumber)
          .single()

        if (sessionError) throw sessionError
        if (!sessionData) {
          setSession(null)
          return
        }

        // Fetch expressions for this session
        const { data: expressionsData, error: expressionsError } = await supabase
          .from('expressions')
          .select('*')
          .eq('session_id', sessionData.id)
          .order('display_order')

        if (expressionsError) throw expressionsError

        // Audio URLs are already in full path format from database
        const category = (sessionData as any).categories as Category

        const expressionsWithPaths = expressionsData || []

        const sessionWithExpressions: SessionWithExpressions = {
          ...sessionData,
          expressions: expressionsWithPaths,
          category
        }

        setSession(sessionWithExpressions)
      } catch (err) {
        setError(err as Error)
        console.error('Error fetching session:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [slug, sessionNumber])

  return { session, loading, error }
}

/**
 * Get next session in category
 */
export async function getNextSession(categoryId: string, currentSessionNumber: number) {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('session_number')
      .eq('category_id', categoryId)
      .gt('session_number', currentSessionNumber)
      .order('session_number', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (error) throw error
    return data?.session_number || null
  } catch (err) {
    console.error('Error fetching next session:', err)
    return null
  }
}
