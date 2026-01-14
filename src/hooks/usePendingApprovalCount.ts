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
      const response = await fetch('/api/expenses?status=PENDING_APPROVAL&limit=100')
      if (!response.ok) {
        throw new Error('Failed to fetch pending approvals')
      }
      const data = await response.json()

      // Count expenses the current user can approve
      const canApproveCount = data.expenses.filter(
        (expense: { canCurrentUserApprove: boolean }) => expense.canCurrentUserApprove
      ).length

      setCount(canApproveCount)
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
