'use client'

import { useState, useEffect, useCallback } from 'react'
import { subscribeToDataRefresh } from '@/lib/data-refresh'

interface ExpenseUser {
  id: string
  name: string
}

interface Approval {
  id: string
  user: ExpenseUser
}

type ExpenseStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'WITHDRAWAL_REQUESTED' | 'WITHDRAWAL_APPROVED' | 'WITHDRAWAL_REJECTED' | 'RECEIVED'

interface PendingApproval {
  id: string
  date: string
  amount: string
  description: string
  category: string
  status: ExpenseStatus
  user: ExpenseUser
  approvals: Approval[]
  approvalsNeeded: number
}

interface PendingApprover {
  id: string
  name: string
}

interface UserPendingExpense {
  id: string
  date: string
  amount: string
  description: string
  category: string
  status: ExpenseStatus
  userId: string
  approvals: Approval[]
  approvalsNeeded: number
  lastNudgeAt: string | null
  pendingApproversCount: number
  pendingApprovers: PendingApprover[]
}

interface RecentActivity {
  id: string
  date: string
  amount: string
  description: string
  category: string
  userId: string
  user: ExpenseUser
  status?: ExpenseStatus
}

interface MonthlyTrend {
  month: string
  total: number
}

interface CategoryBreakdown {
  category: string
  total: number
  percentage: number
}

interface DashboardStats {
  userTotal: number
  teamTotal: number
  pendingApprovalCount: number
  userPendingCount: number
}

interface DashboardData {
  stats: DashboardStats
  pendingApprovals: PendingApproval[]
  userPendingExpenses: UserPendingExpense[]
  monthlyTrend: MonthlyTrend[]
  categoryBreakdown: CategoryBreakdown[]
  recentActivity: RecentActivity[]
  userRole: 'FOUNDER' | 'MEMBER'
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/dashboard')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  // Subscribe to global data refresh events
  useEffect(() => {
    return subscribeToDataRefresh(fetchDashboard, ['dashboard', 'expenses', 'all'])
  }, [fetchDashboard])

  return {
    data,
    isLoading,
    error,
    refetch: fetchDashboard,
  }
}

export type {
  DashboardData,
  DashboardStats,
  PendingApproval,
  UserPendingExpense,
  RecentActivity,
  MonthlyTrend,
  CategoryBreakdown,
}
