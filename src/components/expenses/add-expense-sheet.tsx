'use client'

import { toast } from 'sonner'
import {
  ResponsiveDrawer,
  ResponsiveDrawerContent,
  ResponsiveDrawerHeader,
  ResponsiveDrawerTitle,
  ResponsiveDrawerDescription,
  ResponsiveDrawerBody,
} from '@/components/ui/responsive-drawer'
import { ExpenseForm } from './expense-form'
import { CreateExpenseInput } from '@/lib/validations/expense'
import { Info } from 'lucide-react'
import { useCompanySettings } from '@/hooks/useCompanySettings'
import { formatCurrency } from '@/lib/format-currency'

interface AddExpenseSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddExpenseSheet({ open, onOpenChange, onSuccess }: AddExpenseSheetProps) {
  const { currencySymbol, currency } = useCompanySettings()

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
        ? `${formatCurrency(data.amount, currencySymbol, currency)} logged. Pending approval from other founders.`
        : `${formatCurrency(data.amount, currencySymbol, currency)} logged and auto-approved.`,
    })

    onOpenChange(false)
    onSuccess?.()
  }

  return (
    <ResponsiveDrawer open={open} onOpenChange={onOpenChange}>
      <ResponsiveDrawerContent>
        <ResponsiveDrawerHeader>
          <ResponsiveDrawerTitle>Add Expense</ResponsiveDrawerTitle>
          <ResponsiveDrawerDescription className="sr-only">
            Add a new expense that will require approval from other founders
          </ResponsiveDrawerDescription>
        </ResponsiveDrawerHeader>
        <ResponsiveDrawerBody>
          {/* Approval notice */}
          <div className="flex items-start gap-3 rounded-lg bg-[#0C1929] border border-[#1E40AF] p-3">
            <Info className="h-5 w-5 text-[#60A5FA] shrink-0 mt-0.5" />
            <p className="text-sm text-[#60A5FA]">
              New expenses require approval from other founders before they&apos;re included in balance calculations.
            </p>
          </div>

          <ExpenseForm onSubmit={handleSubmit} />
        </ResponsiveDrawerBody>
      </ResponsiveDrawerContent>
    </ResponsiveDrawer>
  )
}
