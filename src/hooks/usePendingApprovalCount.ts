'use client'

import { useState, useEffect, useCallback } from 'react'

interface UsePendingApprovalCountResult {
  count: number
  isLoading: boolean
  refetch: () => Promise<void>
}

export function usePendingApprovalCount(): UsePendingApprovalCountResult {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const fetchCount = useCallback(async () => {
    try {
      setIsLoading(true)

      // Fetch both pending approvals and withdrawal requests
      const [pendingResponse, withdrawalResponse] = await Promise.all([
        fetch('/api/expenses?status=PENDING_APPROVAL&limit=100'),
        fetch('/api/expenses?status=WITHDRAWAL_REQUESTED&limit=100'),
      ])

      if (!pendingResponse.ok || !withdrawalResponse.ok) {
        throw new Error('Failed to fetch pending approvals')
      }

      const [pendingData, withdrawalData] = await Promise.all([
        pendingResponse.json(),
        withdrawalResponse.json(),
      ])

      // Count expenses the current user can approve
      const canApproveCount = pendingData.expenses.filter(
        (expense: { canCurrentUserApprove: boolean }) => expense.canCurrentUserApprove
      ).length

      // Count withdrawal requests the current user can approve
      const canApproveWithdrawalCount = withdrawalData.expenses.filter(
        (expense: { canCurrentUserApproveWithdrawal: boolean }) => expense.canCurrentUserApproveWithdrawal
      ).length

      setCount(canApproveCount + canApproveWithdrawalCount)
    } catch (error) {
      console.error('Error fetching pending approval count:', error)
      setCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCount()
  }, [fetchCount])

  return {
    count,
    isLoading,
    refetch: fetchCount,
  }
}
