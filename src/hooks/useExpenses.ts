'use client'

import { useState, useEffect, useCallback } from 'react'

export interface ExpenseUser {
  id: string
  name: string
}

export interface Approval {
  id: string
  expenseId: string
  userId: string
  createdAt: string
  user: ExpenseUser
}

export interface Expense {
  id: string
  date: string
  amount: string
  description: string
  category: string
  status: 'PENDING_APPROVAL' | 'APPROVED'
  receiptUrl: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  userId: string
  user?: ExpenseUser
  approvals: Approval[]
  approvalsNeeded: number
  isFullyApproved: boolean
  canCurrentUserApprove: boolean
}

interface UseExpensesParams {
  page?: number
  limit?: number
  category?: string
  status?: string
  userId?: string
  startDate?: Date
  endDate?: Date
}

interface UseExpensesResult {
  expenses: Expense[]
  total: number
  totalPages: number
  page: number
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useExpenses(params: UseExpensesParams = {}): UseExpensesResult {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
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
      if (params.status) {
        searchParams.set('status', params.status)
      }
      if (params.userId) {
        searchParams.set('userId', params.userId)
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
      setTotalPages(data.totalPages || 1)
      setPage(data.page || 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [params.page, params.limit, params.category, params.status, params.userId, params.startDate, params.endDate])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  return {
    expenses,
    total,
    totalPages,
    page,
    isLoading,
    error,
    refetch: fetchExpenses,
  }
}
