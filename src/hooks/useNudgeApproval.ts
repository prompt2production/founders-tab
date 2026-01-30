'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { triggerDataRefresh } from '@/lib/data-refresh'

interface NudgeResponse {
  success: boolean
  nudgedCount: number
  nextNudgeAt: string
}

interface UseNudgeApprovalResult {
  nudge: (expenseId: string) => Promise<NudgeResponse | null>
  isLoading: boolean
  error: string | null
  isSuccess: boolean
}

interface UseNudgeApprovalOptions {
  onSuccess?: (response: NudgeResponse) => void
}

export function useNudgeApproval(options: UseNudgeApprovalOptions = {}): UseNudgeApprovalResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  async function nudge(expenseId: string): Promise<NudgeResponse | null> {
    setIsLoading(true)
    setError(null)
    setIsSuccess(false)

    try {
      const response = await fetch(`/api/expenses/${expenseId}/nudge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reminder')
      }

      setIsSuccess(true)
      toast.success('Reminder sent', {
        description: `Sent to ${data.nudgedCount} approver${data.nudgedCount > 1 ? 's' : ''}`,
      })

      triggerDataRefresh('all')
      options.onSuccess?.(data)

      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      toast.error('Failed to send reminder', {
        description: message,
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    nudge,
    isLoading,
    error,
    isSuccess,
  }
}
