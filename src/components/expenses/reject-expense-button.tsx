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
import { triggerDataRefresh } from '@/lib/data-refresh'

interface RejectExpenseButtonProps {
  expenseId: string
  canReject: boolean
  isCreator: boolean
  onSuccess?: () => void
  className?: string
}

export function RejectExpenseButton({
  expenseId,
  canReject,
  isCreator,
  onSuccess,
  className,
}: RejectExpenseButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [reason, setReason] = useState('')
  const [open, setOpen] = useState(false)

  if (!canReject || isCreator) {
    return null
  }

  async function handleReject() {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/expenses/${expenseId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to reject expense')
      }

      toast.success('Expense rejected', {
        description: 'The expense has been rejected',
      })

      triggerDataRefresh('all')
      setOpen(false)
      setReason('')
      onSuccess?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      toast.error('Failed to reject expense', {
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
          Reject
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject Expense</AlertDialogTitle>
          <AlertDialogDescription>
            Please provide a reason for rejecting this expense. The submitter will be notified.
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
