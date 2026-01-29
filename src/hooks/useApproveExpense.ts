'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { triggerDataRefresh } from '@/lib/data-refresh'

interface UseApproveExpenseResult {
  approve: (expenseId: string) => Promise<void>
  isLoading: boolean
  error: string | null
  isSuccess: boolean
}

interface UseApproveExpenseOptions {
  onSuccess?: () => void
}

export function useApproveExpense(options: UseApproveExpenseOptions = {}): UseApproveExpenseResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  async function approve(expenseId: string) {
    setIsLoading(true)
    setError(null)
    setIsSuccess(false)

    try {
      const response = await fetch(`/api/expenses/${expenseId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const responseData = await response.json()
        throw new Error(responseData.error || 'Failed to approve expense')
      }

      setIsSuccess(true)
      toast.success('Expense approved', {
        description: 'Your approval has been recorded',
      })

      // Trigger global data refresh
      triggerDataRefresh('all')

      options.onSuccess?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      toast.error('Failed to approve expense', {
        description: message,
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    approve,
    isLoading,
    error,
    isSuccess,
  }
}
