'use client'

import { useState } from 'react'
import { toast } from 'sonner'

interface UseConfirmReceiptResult {
  confirmReceipt: (expenseId: string) => Promise<void>
  isLoading: boolean
  error: string | null
  isSuccess: boolean
}

interface UseConfirmReceiptOptions {
  onSuccess?: () => void
}

export function useConfirmReceipt(options: UseConfirmReceiptOptions = {}): UseConfirmReceiptResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  async function confirmReceipt(expenseId: string) {
    setIsLoading(true)
    setError(null)
    setIsSuccess(false)

    try {
      const response = await fetch(`/api/expenses/${expenseId}/confirm-receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const responseData = await response.json()
        throw new Error(responseData.error || 'Failed to confirm receipt')
      }

      setIsSuccess(true)
      toast.success('Receipt confirmed', {
        description: 'Withdrawal complete. Expense marked as received.',
      })

      options.onSuccess?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      toast.error('Failed to confirm receipt', {
        description: message,
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    confirmReceipt,
    isLoading,
    error,
    isSuccess,
  }
}
