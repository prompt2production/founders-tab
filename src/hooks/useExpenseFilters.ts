'use client'

import { useCallback, useMemo } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

export interface ExpenseFilters {
  userId?: string
  category?: string
  startDate?: Date
  endDate?: Date
}

export interface UseExpenseFiltersResult {
  filters: ExpenseFilters
  setFilters: (updates: Partial<ExpenseFilters>) => void
  clearFilters: () => void
  activeFilterCount: number
}

export function useExpenseFilters(): UseExpenseFiltersResult {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Parse filters from URL
  const filters = useMemo<ExpenseFilters>(() => {
    const userId = searchParams.get('userId') || undefined
    const category = searchParams.get('category') || undefined
    const startDateStr = searchParams.get('startDate')
    const endDateStr = searchParams.get('endDate')

    return {
      userId,
      category,
      startDate: startDateStr ? new Date(startDateStr) : undefined,
      endDate: endDateStr ? new Date(endDateStr) : undefined,
    }
  }, [searchParams])

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return [
      filters.userId,
      filters.category,
      filters.startDate || filters.endDate,
    ].filter(Boolean).length
  }, [filters])

  // Update URL with new filters
  const setFilters = useCallback(
    (updates: Partial<ExpenseFilters>) => {
      const params = new URLSearchParams(searchParams.toString())

      // Update userId
      if ('userId' in updates) {
        if (updates.userId) {
          params.set('userId', updates.userId)
        } else {
          params.delete('userId')
        }
      }

      // Update category
      if ('category' in updates) {
        if (updates.category) {
          params.set('category', updates.category)
        } else {
          params.delete('category')
        }
      }

      // Update startDate
      if ('startDate' in updates) {
        if (updates.startDate) {
          params.set('startDate', updates.startDate.toISOString())
        } else {
          params.delete('startDate')
        }
      }

      // Update endDate
      if ('endDate' in updates) {
        if (updates.endDate) {
          params.set('endDate', updates.endDate.toISOString())
        } else {
          params.delete('endDate')
        }
      }

      // Reset to page 1 when filters change
      params.delete('page')

      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
      router.push(newUrl, { scroll: false })
    },
    [searchParams, pathname, router]
  )

  // Clear all filters
  const clearFilters = useCallback(() => {
    router.push(pathname, { scroll: false })
  }, [pathname, router])

  return {
    filters,
    setFilters,
    clearFilters,
    activeFilterCount,
  }
}
