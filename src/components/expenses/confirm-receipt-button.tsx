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
import { useConfirmReceipt } from '@/hooks/useConfirmReceipt'
import { CheckCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfirmReceiptButtonProps {
  expenseId: string
  isOwner: boolean
  status: string
  onSuccess?: () => void
  className?: string
}

export function ConfirmReceiptButton({
  expenseId,
  isOwner,
  status,
  onSuccess,
  className,
}: ConfirmReceiptButtonProps) {
  const [open, setOpen] = useState(false)
  const { confirmReceipt, isLoading, isSuccess } = useConfirmReceipt({
    onSuccess: () => {
      setOpen(false)
      onSuccess?.()
    },
  })

  // Only show for expense owner and WITHDRAWAL_APPROVED status
  if (!isOwner || status !== 'WITHDRAWAL_APPROVED') {
    return null
  }

  async function handleConfirm() {
    try {
      await confirmReceipt(expenseId)
    } catch {
      // Error is handled in the hook
    }
  }

  if (isSuccess) {
    return (
      <Button variant="outline" disabled className={cn('gap-2', className)}>
        <CheckCircle className="h-4 w-4" />
        Received
      </Button>
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="default" className={cn('gap-2', className)}>
          <CheckCircle className="h-4 w-4" />
          Confirm Receipt
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Receipt of Funds</AlertDialogTitle>
          <AlertDialogDescription>
            Please confirm that you have received the funds for this expense. This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Confirming...
              </>
            ) : (
              'Confirm Receipt'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
