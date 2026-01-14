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
import { ApprovalStatusBadge } from './approval-status-badge'
import { ApproveButton } from './approve-button'
import { CreateExpenseInput } from '@/lib/validations/expense'
import { Trash2, Loader2, User } from 'lucide-react'

interface ApprovalUser {
  id: string
  name: string
}

interface Approval {
  id: string
  user: ApprovalUser
}

interface Expense {
  id: string
  date: string
  amount: string
  description: string
  category: string
  status?: 'PENDING_APPROVAL' | 'APPROVED'
  receiptUrl: string | null
  notes: string | null
  userId?: string
  approvals?: Approval[]
  approvalsNeeded?: number
  canCurrentUserApprove?: boolean
}

interface EditExpenseSheetProps {
  expense: Expense
  currentUserId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditExpenseSheet({ expense, currentUserId, open, onOpenChange, onSuccess }: EditExpenseSheetProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const isCreator = currentUserId === expense.userId
  const hasApproved = expense.approvals?.some((a) => a.user.id === currentUserId) || false
  const approvalsReceived = expense.approvals?.length || 0

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
        <div className="px-4 pb-4 space-y-4">
          {/* Approval Status Section */}
          {expense.status && (
            <div className="rounded-lg bg-card-elevated p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Approval Status</span>
                <ApprovalStatusBadge
                  status={expense.status}
                  approvalsReceived={approvalsReceived}
                  approvalsNeeded={expense.approvalsNeeded}
                />
              </div>

              {/* Who has approved */}
              {expense.approvals && expense.approvals.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground">Approved by:</span>
                  <div className="flex flex-wrap gap-2">
                    {expense.approvals.map((approval) => (
                      <div
                        key={approval.id}
                        className="flex items-center gap-1.5 text-xs bg-secondary px-2 py-1 rounded-full"
                      >
                        <User className="h-3 w-3" />
                        {approval.user.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Who still needs to approve */}
              {expense.status === 'PENDING_APPROVAL' && expense.approvalsNeeded && approvalsReceived < expense.approvalsNeeded && (
                <p className="text-xs text-muted-foreground">
                  {expense.approvalsNeeded - approvalsReceived} more approval{expense.approvalsNeeded - approvalsReceived > 1 ? 's' : ''} needed
                </p>
              )}

              {/* Approve button */}
              <ApproveButton
                expenseId={expense.id}
                canApprove={expense.canCurrentUserApprove || false}
                isCreator={isCreator}
                hasApproved={hasApproved}
                onSuccess={onSuccess}
                className="w-full"
              />
            </div>
          )}

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
