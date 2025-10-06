import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type Category = Database['public']['Tables']['categories']['Row']

interface CategoryWithProgress extends Category {
  completed: number
  percentage: number
}

export function useCategories(userId: string = '00000000-0000-0000-0000-000000000001') {
  const [categories, setCategories] = useState<CategoryWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)

      // Use the get_categories_with_progress function
      const { data, error: rpcError } = await supabase
        .rpc('get_categories_with_progress', { p_user_id: userId })

      if (rpcError) throw rpcError

      // Map the result to CategoryWithProgress format
      const categoriesWithProgress: CategoryWithProgress[] = (data || []).map((row: any) => ({
        id: row.category_id,
        name: row.category_name,
        description: null,
        display_order: row.display_order,
        total_sessions: Number(row.total_sessions),
        completed: Number(row.completed_sessions),
        percentage: Number(row.percentage),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      setCategories(categoriesWithProgress)
    } catch (err) {
      setError(err as Error)
      console.error('Error fetching categories:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [userId])

  // Return refetch function for manual refresh
  return { categories, loading, error, refetch: fetchCategories }
}
