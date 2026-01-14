'use client'

import { Button } from '@/components/ui/button'
import { useApproveWithdrawal } from '@/hooks/useApproveWithdrawal'
import { CheckCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ApproveWithdrawalButtonProps {
  expenseId: string
  isOwner: boolean
  status: string
  hasApproved: boolean
  onSuccess?: () => void
  className?: string
}

export function ApproveWithdrawalButton({
  expenseId,
  isOwner,
  status,
  hasApproved,
  onSuccess,
  className,
}: ApproveWithdrawalButtonProps) {
  const { approveWithdrawal, isLoading, isSuccess } = useApproveWithdrawal({
    onSuccess,
  })

  // Hide for expense owner or if not in WITHDRAWAL_REQUESTED status
  if (isOwner || status !== 'WITHDRAWAL_REQUESTED') {
    return null
  }

  // Show disabled state if already approved
  if (hasApproved || isSuccess) {
    return (
      <Button variant="outline" disabled className={cn('gap-2', className)}>
        <CheckCircle className="h-4 w-4" />
        Approved
      </Button>
    )
  }

  async function handleApprove() {
    try {
      await approveWithdrawal(expenseId)
    } catch {
      // Error is handled in the hook
    }
  }

  return (
    <Button
      variant="default"
      onClick={handleApprove}
      disabled={isLoading}
      className={cn('gap-2', className)}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Approving...
        </>
      ) : (
        <>
          <CheckCircle className="h-4 w-4" />
          Approve Withdrawal
        </>
      )}
    </Button>
  )
}
