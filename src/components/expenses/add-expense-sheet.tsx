'use client'

import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { ExpenseForm } from './expense-form'
import { CreateExpenseInput } from '@/lib/validations/expense'
import { Info } from 'lucide-react'

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
      const message = typeof error.error === 'string' ? error.error : 'Failed to create expense'
      toast.error('Failed to add expense', { description: message })
      throw new Error(message)
    }

    const result = await response.json()
    const isPending = result.status === 'PENDING_APPROVAL'

    toast.success('Expense added', {
      description: isPending
        ? `$${data.amount.toFixed(2)} logged. Pending approval from other founders.`
        : `$${data.amount.toFixed(2)} logged and auto-approved.`,
    })

    onOpenChange(false)
    onSuccess?.()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Expense</SheetTitle>
          <SheetDescription className="sr-only">
            Add a new expense that will require approval from other founders
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-4 space-y-4">
          {/* Approval notice */}
          <div className="flex items-start gap-3 rounded-lg bg-[#0C1929] border border-[#1E40AF] p-3">
            <Info className="h-5 w-5 text-[#60A5FA] shrink-0 mt-0.5" />
            <p className="text-sm text-[#60A5FA]">
              New expenses require approval from other founders before they&apos;re included in balance calculations.
            </p>
          </div>

          <ExpenseForm onSubmit={handleSubmit} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
