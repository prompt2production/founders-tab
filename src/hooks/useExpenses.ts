'use client'

import { useState, useEffect, useCallback } from 'react'

interface Expense {
  id: string
  date: string
  amount: string
  description: string
  category: string
  receiptUrl: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

interface UseExpensesParams {
  page?: number
  limit?: number
  category?: string
  startDate?: Date
  endDate?: Date
}

interface UseExpensesResult {
  expenses: Expense[]
  total: number
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useExpenses(params: UseExpensesParams = {}): UseExpensesResult {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchExpenses = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams()

      if (params.page !== undefined) {
        searchParams.set('page', params.page.toString())
      }
      if (params.limit !== undefined) {
        searchParams.set('limit', params.limit.toString())
      }
      if (params.category) {
        searchParams.set('category', params.category)
      }
      if (params.startDate) {
        searchParams.set('startDate', params.startDate.toISOString())
      }
      if (params.endDate) {
        searchParams.set('endDate', params.endDate.toISOString())
      }

      const queryString = searchParams.toString()
      const url = queryString ? `/api/expenses?${queryString}` : '/api/expenses'

      const response = await fetch(url)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch expenses')
      }

      const data = await response.json()
      setExpenses(data.expenses)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [params.page, params.limit, params.category, params.startDate, params.endDate])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  return {
    expenses,
    total,
    isLoading,
    error,
    refetch: fetchExpenses,
  }
}
