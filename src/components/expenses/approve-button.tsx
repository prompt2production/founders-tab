'use client'

import { Button } from '@/components/ui/button'
import { useApproveExpense } from '@/hooks/useApproveExpense'
import { cn } from '@/lib/utils'
import { Check, Loader2 } from 'lucide-react'

interface ApproveButtonProps {
  expenseId: string
  canApprove: boolean
  isCreator: boolean
  hasApproved: boolean
  onSuccess?: () => void
  className?: string
}

export function ApproveButton({
  expenseId,
  canApprove,
  isCreator,
  hasApproved,
  onSuccess,
  className,
}: ApproveButtonProps) {
  const { approve, isLoading, isSuccess } = useApproveExpense({ onSuccess })

  // Don't render if user can't approve
  if (!canApprove) {
    if (isCreator) {
      return null // Hide for creators
    }
    if (hasApproved) {
      return (
        <Button
          variant="secondary"
          size="sm"
          disabled
          className={cn('gap-1', className)}
        >
          <Check className="h-4 w-4" />
          Approved
        </Button>
      )
    }
    return null
  }

  // Show success state after approval
  if (isSuccess) {
    return (
      <Button
        variant="secondary"
        size="sm"
        disabled
        className={cn('gap-1', className)}
      >
        <Check className="h-4 w-4" />
        Approved
      </Button>
    )
  }

  return (
    <Button
      variant="default"
      size="sm"
      disabled={isLoading}
      onClick={() => approve(expenseId)}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Approving...
        </>
      ) : (
        'Approve'
      )}
    </Button>
  )
}
