'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
import { useRequestWithdrawal } from '@/hooks/useRequestWithdrawal'
import { ArrowUpRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RequestWithdrawalButtonProps {
  expenseId: string
  isOwner: boolean
  status: string
  onSuccess?: () => void
  className?: string
}

export function RequestWithdrawalButton({
  expenseId,
  isOwner,
  status,
  onSuccess,
  className,
}: RequestWithdrawalButtonProps) {
  const [open, setOpen] = useState(false)
  const { requestWithdrawal, isLoading, isSuccess } = useRequestWithdrawal({
    onSuccess: () => {
      setOpen(false)
      onSuccess?.()
    },
  })

  // Only show for expense owner and APPROVED status
  if (!isOwner || status !== 'APPROVED') {
    return null
  }

  async function handleConfirm() {
    try {
      await requestWithdrawal(expenseId)
    } catch {
      // Error is handled in the hook
    }
  }

  if (isSuccess) {
    return (
      <Button variant="outline" disabled className={cn('gap-2', className)}>
        <ArrowUpRight className="h-4 w-4" />
        Requested
      </Button>
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="default" className={cn('gap-2', className)}>
          <ArrowUpRight className="h-4 w-4" />
          Request Withdrawal
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Request Withdrawal</AlertDialogTitle>
          <AlertDialogDescription>
            This will request withdrawal of this expense. Other founders will need to approve
            before you can confirm receipt of funds.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Requesting...
              </>
            ) : (
              'Request Withdrawal'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
