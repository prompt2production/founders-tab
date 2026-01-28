'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { XCircle, Loader2 } from 'lucide-react'
import { triggerApprovalCountRefresh } from '@/hooks/usePendingApprovalCount'

interface RejectWithdrawalButtonProps {
  expenseId: string
  isOwner: boolean
  status?: string
  onSuccess?: () => void
  className?: string
}

export function RejectWithdrawalButton({
  expenseId,
  isOwner,
  status,
  onSuccess,
  className,
}: RejectWithdrawalButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [reason, setReason] = useState('')
  const [open, setOpen] = useState(false)

  if (isOwner || status !== 'WITHDRAWAL_REQUESTED') {
    return null
  }

  async function handleReject() {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/expenses/${expenseId}/reject-withdrawal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to reject withdrawal')
      }

      toast.success('Withdrawal rejected', {
        description: 'The withdrawal request has been rejected',
      })

      triggerApprovalCountRefresh()
      setOpen(false)
      setReason('')
      onSuccess?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      toast.error('Failed to reject withdrawal', {
        description: message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className={cn('gap-1', className)}
        >
          <XCircle className="h-4 w-4" />
          Reject Withdrawal
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject Withdrawal</AlertDialogTitle>
          <AlertDialogDescription>
            Please provide a reason for rejecting this withdrawal request. The expense owner will be notified.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Textarea
          placeholder="Enter rejection reason..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="min-h-[80px]"
        />
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setReason('')}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={reason.trim().length === 0 || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Rejecting...
              </>
            ) : (
              'Reject'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
