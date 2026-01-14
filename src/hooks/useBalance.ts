'use client'

import { useState, useEffect, useCallback } from 'react'
import { BalanceFilter } from './useBalances'

export interface BalanceUser {
  id: string
  name: string
  email: string
}

export interface CategoryBreakdown {
  category: string
  total: number
  count: number
}

export interface MonthlyBreakdown {
  month: string
  total: number
}

interface UseBalanceResult {
  user: BalanceUser | null
  total: number
  expenseCount: number
  byCategory: CategoryBreakdown[]
  byMonth: MonthlyBreakdown[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useBalance(userId: string | null, filter: BalanceFilter = 'owed'): UseBalanceResult {
  const [user, setUser] = useState<BalanceUser | null>(null)
  const [total, setTotal] = useState(0)
  const [expenseCount, setExpenseCount] = useState(0)
  const [byCategory, setByCategory] = useState<CategoryBreakdown[]>([])
  const [byMonth, setByMonth] = useState<MonthlyBreakdown[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBalance = useCallback(async () => {
    if (!userId) {
      setUser(null)
      setTotal(0)
      setExpenseCount(0)
      setByCategory([])
      setByMonth([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/balances/${userId}?filter=${filter}`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch balance')
      }

      const data = await response.json()
      setUser(data.user)
      setTotal(data.total)
      setExpenseCount(data.expenseCount)
      setByCategory(data.byCategory)
      setByMonth(data.byMonth)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [userId, filter])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  return {
    user,
    total,
    expenseCount,
    byCategory,
    byMonth,
    isLoading,
    error,
    refetch: fetchBalance,
  }
}
