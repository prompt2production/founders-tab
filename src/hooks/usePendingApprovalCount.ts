'use client'

import { useState, useEffect, useCallback } from 'react'

// Custom event name for triggering approval count refresh
export const APPROVAL_COUNT_REFRESH_EVENT = 'approval-count-refresh'

// Helper function to trigger a refresh of all pending approval counts
export function triggerApprovalCountRefresh() {
  window.dispatchEvent(new CustomEvent(APPROVAL_COUNT_REFRESH_EVENT))
}

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

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      fetchCount()
    }

    window.addEventListener(APPROVAL_COUNT_REFRESH_EVENT, handleRefresh)
    return () => {
      window.removeEventListener(APPROVAL_COUNT_REFRESH_EVENT, handleRefresh)
    }
  }, [fetchCount])

  return {
    count,
    isLoading,
    refetch: fetchCount,
  }
}
