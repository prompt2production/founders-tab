'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { ExpenseForm } from './expense-form'
import { CreateExpenseInput } from '@/lib/validations/expense'
import { Trash2, Loader2 } from 'lucide-react'

interface Expense {
  id: string
  date: string
  amount: string
  description: string
  category: string
  receiptUrl: string | null
  notes: string | null
}

interface EditExpenseSheetProps {
  expense: Expense
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditExpenseSheet({ expense, open, onOpenChange, onSuccess }: EditExpenseSheetProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleSubmit(data: CreateExpenseInput) {
    const response = await fetch(`/api/expenses/${expense.id}`, {
      method: 'PATCH',
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
      throw new Error(error.error || 'Failed to update expense')
    }

    toast.success('Expense updated', {
      description: 'Your expense has been updated successfully',
    })

    onOpenChange(false)
    onSuccess?.()
  }

  async function handleDelete() {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/expenses/${expense.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete expense')
      }

      toast.success('Expense deleted', {
        description: 'Your expense has been deleted',
      })

      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete expense'
      toast.error('Failed to delete expense', {
        description: message,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Convert expense data to form default values
  const defaultValues: Partial<CreateExpenseInput> = {
    date: new Date(expense.date),
    amount: parseFloat(expense.amount),
    description: expense.description,
    category: expense.category,
    receiptUrl: expense.receiptUrl || undefined,
    notes: expense.notes || undefined,
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Edit Expense</SheetTitle>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete expense?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this expense. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </SheetHeader>
        <div className="px-4 pb-4">
          <ExpenseForm
            onSubmit={handleSubmit}
            defaultValues={defaultValues}
            submitLabel="Update Expense"
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
