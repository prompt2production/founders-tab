'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { triggerDataRefresh } from '@/lib/data-refresh'

interface UseRequestWithdrawalResult {
  requestWithdrawal: (expenseId: string) => Promise<void>
  isLoading: boolean
  error: string | null
  isSuccess: boolean
}

interface UseRequestWithdrawalOptions {
  onSuccess?: () => void
}

export function useRequestWithdrawal(options: UseRequestWithdrawalOptions = {}): UseRequestWithdrawalResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  async function requestWithdrawal(expenseId: string) {
    setIsLoading(true)
    setError(null)
    setIsSuccess(false)

    try {
      const response = await fetch(`/api/expenses/${expenseId}/request-withdrawal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const responseData = await response.json()
        throw new Error(responseData.error || 'Failed to request withdrawal')
      }

      const data = await response.json()
      setIsSuccess(true)

      if (data.autoApproved) {
        toast.success('Withdrawal approved', {
          description: 'No other founders to approve. You can now confirm receipt.',
        })
      } else {
        toast.success('Withdrawal requested', {
          description: 'Other founders will need to approve your request',
        })
      }

      // Trigger global data refresh
      triggerDataRefresh('all')
      options.onSuccess?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      toast.error('Failed to request withdrawal', {
        description: message,
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    requestWithdrawal,
    isLoading,
    error,
    isSuccess,
  }
}
