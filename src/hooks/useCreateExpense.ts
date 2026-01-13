'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { CreateExpenseInput } from '@/lib/validations/expense'

interface UseCreateExpenseResult {
  createExpense: (data: CreateExpenseInput) => Promise<void>
  isLoading: boolean
  error: string | null
}

interface UseCreateExpenseOptions {
  onSuccess?: () => void
}

export function useCreateExpense(options: UseCreateExpenseOptions = {}): UseCreateExpenseResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function createExpense(data: CreateExpenseInput) {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          date: data.date.toISOString(),
        }),
      })

      if (!response.ok) {
        const responseData = await response.json()
        throw new Error(responseData.error || 'Failed to create expense')
      }

      toast.success('Expense added', {
        description: `$${data.amount.toFixed(2)} logged to your account`,
      })

      options.onSuccess?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      toast.error('Failed to add expense', {
        description: message,
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createExpense,
    isLoading,
    error,
  }
}
