'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { triggerDataRefresh } from '@/lib/data-refresh'
import {
  ResponsiveDrawer,
  ResponsiveDrawerContent,
  ResponsiveDrawerHeader,
  ResponsiveDrawerTitle,
  ResponsiveDrawerBody,
} from '@/components/ui/responsive-drawer'
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
import { RequestWithdrawalButton } from './request-withdrawal-button'
import { ApproveWithdrawalButton } from './approve-withdrawal-button'
import { RejectExpenseButton } from './reject-expense-button'
import { RejectWithdrawalButton } from './reject-withdrawal-button'
import { ConfirmReceiptButton } from './confirm-receipt-button'
import { CreateExpenseInput } from '@/lib/validations/expense'
import { Trash2, Loader2, User, XCircle, FileText, ExternalLink } from 'lucide-react'

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

interface ApprovalUser {
  id: string
  name: string
}

interface Approval {
  id: string
  user: ApprovalUser
}

interface WithdrawalApproval {
  id: string
  user: ApprovalUser
}

interface Expense {
  id: string
  date: string
  amount: string
  description: string
  category: string
  status?: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'WITHDRAWAL_REQUESTED' | 'WITHDRAWAL_APPROVED' | 'WITHDRAWAL_REJECTED' | 'RECEIVED'
  receiptUrl: string | null
  notes: string | null
  userId?: string
  approvals?: Approval[]
  approvalsNeeded?: number
  canCurrentUserApprove?: boolean
  withdrawalApprovals?: WithdrawalApproval[]
  withdrawalApprovalsNeeded?: number
  canCurrentUserApproveWithdrawal?: boolean
  rejectedBy?: ApprovalUser | null
  rejectedAt?: string | null
  rejectionReason?: string | null
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
  const hasApprovedWithdrawal = expense.withdrawalApprovals?.some((a) => a.user.id === currentUserId) || false
  const withdrawalApprovalsReceived = expense.withdrawalApprovals?.length || 0
  const isInWithdrawalFlow = expense.status === 'WITHDRAWAL_REQUESTED' || expense.status === 'WITHDRAWAL_APPROVED' || expense.status === 'RECEIVED'

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
    triggerDataRefresh('all')
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
      triggerDataRefresh('all')
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
    <ResponsiveDrawer open={open} onOpenChange={onOpenChange}>
      <ResponsiveDrawerContent>
        <ResponsiveDrawerHeader>
          <ResponsiveDrawerTitle>Edit Expense</ResponsiveDrawerTitle>
        </ResponsiveDrawerHeader>
        <ResponsiveDrawerBody>
          {/* Approval Status Section */}
          {expense.status && (
            <div className="rounded-lg bg-card-elevated p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <ApprovalStatusBadge
                  status={expense.status}
                  approvalsReceived={approvalsReceived}
                  approvalsNeeded={expense.approvalsNeeded}
                  withdrawalApprovalsReceived={withdrawalApprovalsReceived}
                  withdrawalApprovalsNeeded={expense.withdrawalApprovalsNeeded}
                />
              </div>

              {/* Who has approved (for pending approval) */}
              {expense.status === 'PENDING_APPROVAL' && expense.approvals && expense.approvals.length > 0 && (
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

              {/* Who has approved withdrawal */}
              {expense.status === 'WITHDRAWAL_REQUESTED' && expense.withdrawalApprovals && expense.withdrawalApprovals.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground">Withdrawal approved by:</span>
                  <div className="flex flex-wrap gap-2">
                    {expense.withdrawalApprovals.map((approval) => (
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

              {/* Who still needs to approve (expense approval) */}
              {expense.status === 'PENDING_APPROVAL' && expense.approvalsNeeded && approvalsReceived < expense.approvalsNeeded && (
                <p className="text-xs text-muted-foreground">
                  {expense.approvalsNeeded - approvalsReceived} more approval{expense.approvalsNeeded - approvalsReceived > 1 ? 's' : ''} needed
                </p>
              )}

              {/* Who still needs to approve (withdrawal) */}
              {expense.status === 'WITHDRAWAL_REQUESTED' && expense.withdrawalApprovalsNeeded && withdrawalApprovalsReceived < expense.withdrawalApprovalsNeeded && (
                <p className="text-xs text-muted-foreground">
                  {expense.withdrawalApprovalsNeeded - withdrawalApprovalsReceived} more withdrawal approval{expense.withdrawalApprovalsNeeded - withdrawalApprovalsReceived > 1 ? 's' : ''} needed
                </p>
              )}

              {/* Rejection details */}
              {(expense.status === 'REJECTED' || expense.status === 'WITHDRAWAL_REJECTED') && expense.rejectionReason && (
                <div className="rounded-lg border border-[#991B1B] bg-[#450A0A]/50 p-3 space-y-2">
                  <div className="flex items-center gap-2 text-[#F87171]">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Rejected by {expense.rejectedBy?.name || 'Unknown'}
                    </span>
                    {expense.rejectedAt && (
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatRelativeDate(expense.rejectedAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {expense.rejectionReason}
                  </p>
                </div>
              )}

              {/* Approve button for pending approval */}
              <ApproveButton
                expenseId={expense.id}
                canApprove={expense.canCurrentUserApprove || false}
                isCreator={isCreator}
                hasApproved={hasApproved}
                onSuccess={() => {
                  onOpenChange(false)
                  onSuccess?.()
                }}
                className="w-full"
              />

              {/* Reject button for pending approval */}
              <RejectExpenseButton
                expenseId={expense.id}
                canReject={expense.canCurrentUserApprove || false}
                isCreator={isCreator}
                onSuccess={() => {
                  onOpenChange(false)
                  onSuccess?.()
                }}
                className="w-full"
              />

              {/* Request Withdrawal button for approved expenses */}
              <RequestWithdrawalButton
                expenseId={expense.id}
                isOwner={isCreator}
                status={expense.status}
                onSuccess={onSuccess}
                className="w-full"
              />

              {/* Approve Withdrawal button */}
              <ApproveWithdrawalButton
                expenseId={expense.id}
                isOwner={isCreator}
                status={expense.status}
                hasApproved={hasApprovedWithdrawal}
                onSuccess={onSuccess}
                className="w-full"
              />

              {/* Reject Withdrawal button */}
              <RejectWithdrawalButton
                expenseId={expense.id}
                isOwner={isCreator}
                status={expense.status}
                onSuccess={() => {
                  onOpenChange(false)
                  onSuccess?.()
                }}
                className="w-full"
              />

              {/* Confirm Receipt button */}
              <ConfirmReceiptButton
                expenseId={expense.id}
                isOwner={isCreator}
                status={expense.status}
                onSuccess={onSuccess}
                className="w-full"
              />
            </div>
          )}

          {/* Receipt Preview */}
          {expense.receiptUrl && (
            <div className="rounded-lg bg-card-elevated p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Receipt</span>
                <a
                  href={expense.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Open <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <a
                href={expense.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {expense.receiptUrl.endsWith('.pdf') ? (
                  <div className="flex items-center justify-center h-32 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                  </div>
                ) : (
                  <img
                    src={expense.receiptUrl}
                    alt="Receipt"
                    className="w-full h-32 object-cover rounded-lg hover:opacity-90 transition-opacity"
                  />
                )}
              </a>
            </div>
          )}

          {/* Disable editing during withdrawal flow */}
          {isInWithdrawalFlow ? (
            <div className="rounded-lg border border-muted p-4 text-center text-muted-foreground text-sm">
              Expense cannot be edited while in withdrawal process
            </div>
          ) : (
            <ExpenseForm
              onSubmit={handleSubmit}
              defaultValues={defaultValues}
              submitLabel="Update Expense"
            />
          )}

          {/* Delete section - separated from main actions */}
          <div className="pt-4 border-t border-border">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete Expense
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
        </ResponsiveDrawerBody>
      </ResponsiveDrawerContent>
    </ResponsiveDrawer>
  )
}
