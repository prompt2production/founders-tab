'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Clock, CheckCircle } from 'lucide-react'

interface ApprovalStatusBadgeProps {
  status: 'PENDING_APPROVAL' | 'APPROVED'
  approvalsReceived?: number
  approvalsNeeded?: number
  className?: string
}

export function ApprovalStatusBadge({
  status,
  approvalsReceived = 0,
  approvalsNeeded = 0,
  className,
}: ApprovalStatusBadgeProps) {
  const isPending = status === 'PENDING_APPROVAL'

  if (isPending) {
    return (
      <Badge
        className={cn(
          'bg-[#422006] text-[#FBBF24] border-[#854D0E]',
          className
        )}
      >
        <Clock className="h-3 w-3" />
        {approvalsNeeded > 0 ? (
          <span>{approvalsReceived}/{approvalsNeeded} approved</span>
        ) : (
          <span>Pending</span>
        )}
      </Badge>
    )
  }

  return (
    <Badge
      className={cn(
        'bg-[#052E16] text-[#4ADE80] border-[#166534]',
        className
      )}
    >
      <CheckCircle className="h-3 w-3" />
      <span>Approved</span>
    </Badge>
  )
}
