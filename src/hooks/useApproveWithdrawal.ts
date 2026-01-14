'use client'

import { useState } from 'react'
import { toast } from 'sonner'

interface UseApproveWithdrawalResult {
  approveWithdrawal: (expenseId: string) => Promise<void>
  isLoading: boolean
  error: string | null
  isSuccess: boolean
}

interface UseApproveWithdrawalOptions {
  onSuccess?: () => void
}

export function useApproveWithdrawal(options: UseApproveWithdrawalOptions = {}): UseApproveWithdrawalResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  async function approveWithdrawal(expenseId: string) {
    setIsLoading(true)
    setError(null)
    setIsSuccess(false)

    try {
      const response = await fetch(`/api/expenses/${expenseId}/approve-withdrawal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const responseData = await response.json()
        throw new Error(responseData.error || 'Failed to approve withdrawal')
      }

      const data = await response.json()
      setIsSuccess(true)

      if (data.isFullyApproved) {
        toast.success('Withdrawal fully approved', {
          description: 'Owner can now confirm receipt of funds',
        })
      } else {
        toast.success('Withdrawal approval recorded', {
          description: 'Waiting for other founders to approve',
        })
      }

      options.onSuccess?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      toast.error('Failed to approve withdrawal', {
        description: message,
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    approveWithdrawal,
    isLoading,
    error,
    isSuccess,
  }
}
