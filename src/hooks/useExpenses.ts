'use client'

import { useState, useEffect, useCallback } from 'react'
import { subscribeToDataRefresh } from '@/lib/data-refresh'

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

export interface WithdrawalApproval {
  id: string
  expenseId: string
  userId: string
  createdAt: string
  user: ExpenseUser
}

export interface PendingApprover {
  id: string
  name: string
}

export interface Expense {
  id: string
  date: string
  amount: string
  description: string
  category: string
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'WITHDRAWAL_REQUESTED' | 'WITHDRAWAL_APPROVED' | 'WITHDRAWAL_REJECTED' | 'RECEIVED'
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
  withdrawalApprovals: WithdrawalApproval[]
  withdrawalApprovalsNeeded: number
  canCurrentUserApproveWithdrawal: boolean
  rejectedBy?: ExpenseUser | null
  rejectedAt?: string | null
  rejectionReason?: string | null
  lastNudgeAt?: string | null
  pendingApproversCount?: number
  pendingApprovers?: PendingApprover[]
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
      // Special handling for NEEDS_ACTION filter
      if (params.status === 'NEEDS_ACTION') {
        // Build common params for both requests
        const commonParams = new URLSearchParams()
        commonParams.set('limit', '100') // Fetch larger batch for client-side filtering
        if (params.category) {
          commonParams.set('category', params.category)
        }
        if (params.userId) {
          commonParams.set('userId', params.userId)
        }
        if (params.startDate) {
          commonParams.set('startDate', params.startDate.toISOString())
        }
        if (params.endDate) {
          commonParams.set('endDate', params.endDate.toISOString())
        }

        // Fetch both PENDING_APPROVAL and WITHDRAWAL_REQUESTED expenses
        const pendingParams = new URLSearchParams(commonParams)
        pendingParams.set('status', 'PENDING_APPROVAL')
        const withdrawalParams = new URLSearchParams(commonParams)
        withdrawalParams.set('status', 'WITHDRAWAL_REQUESTED')

        const [pendingResponse, withdrawalResponse] = await Promise.all([
          fetch(`/api/expenses?${pendingParams.toString()}`),
          fetch(`/api/expenses?${withdrawalParams.toString()}`),
        ])

        if (!pendingResponse.ok || !withdrawalResponse.ok) {
          throw new Error('Failed to fetch expenses')
        }

        const [pendingData, withdrawalData] = await Promise.all([
          pendingResponse.json(),
          withdrawalResponse.json(),
        ])

        // Filter to only items where user can take action
        const actionableExpenses = [
          ...pendingData.expenses.filter((e: Expense) => e.canCurrentUserApprove),
          ...withdrawalData.expenses.filter((e: Expense) => e.canCurrentUserApproveWithdrawal),
        ]

        // Sort by date descending
        actionableExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        // Handle pagination client-side
        const limit = params.limit || 20
        const currentPage = params.page || 1
        const startIndex = (currentPage - 1) * limit
        const paginatedExpenses = actionableExpenses.slice(startIndex, startIndex + limit)

        setExpenses(paginatedExpenses)
        setTotal(actionableExpenses.length)
        setTotalPages(Math.ceil(actionableExpenses.length / limit))
        setPage(currentPage)
        return
      }

      // Standard fetch for other status filters
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

  // Subscribe to global data refresh events
  useEffect(() => {
    return subscribeToDataRefresh(fetchExpenses, ['expenses', 'all'])
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
