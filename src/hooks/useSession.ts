import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type Session = Database['public']['Tables']['sessions']['Row']
type Expression = Database['public']['Tables']['expressions']['Row']

interface SessionWithExpressions extends Session {
  expressions: Expression[]
}

export function useSession(categoryId: string, sessionNumber: number) {
  const [session, setSession] = useState<SessionWithExpressions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchSession() {
      try {
        setLoading(true)

        // Fetch session
        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .select('*')
          .eq('category_id', categoryId)
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

        const sessionWithExpressions: SessionWithExpressions = {
          ...sessionData,
          expressions: expressionsData || []
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
  }, [categoryId, sessionNumber])

  return { session, loading, error }
}
