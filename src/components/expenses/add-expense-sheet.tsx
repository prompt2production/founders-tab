'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ExpenseForm } from './expense-form'
import { CreateExpenseInput } from '@/lib/validations/expense'

interface AddExpenseSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddExpenseSheet({ open, onOpenChange, onSuccess }: AddExpenseSheetProps) {
  async function handleSubmit(data: CreateExpenseInput) {
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
      const error = await response.json()
      throw new Error(error.error || 'Failed to create expense')
    }

    onOpenChange(false)
    onSuccess?.()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Expense</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-4">
          <ExpenseForm onSubmit={handleSubmit} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
