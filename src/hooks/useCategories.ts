import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type Category = Database['public']['Tables']['categories']['Row']

interface CategoryWithProgress extends Category {
  completed: number
  percentage: number
}

export function useCategories() {
  const [categories, setCategories] = useState<CategoryWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true)

        // Fetch all categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('display_order')

        if (categoriesError) throw categoriesError

        // For now, we'll set progress to 0 since we don't have user authentication yet
        // Later, we'll use the get_user_category_progress function
        const categoriesWithProgress: CategoryWithProgress[] = (categoriesData || []).map(cat => ({
          ...cat,
          completed: 0,
          percentage: 0
        }))

        setCategories(categoriesWithProgress)
      } catch (err) {
        setError(err as Error)
        console.error('Error fetching categories:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}
