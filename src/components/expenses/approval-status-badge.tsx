'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Clock, CheckCircle, ArrowUpRight, XCircle } from 'lucide-react'

interface ApprovalStatusBadgeProps {
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'WITHDRAWAL_REQUESTED' | 'WITHDRAWAL_APPROVED' | 'WITHDRAWAL_REJECTED' | 'RECEIVED'
  approvalsReceived?: number
  approvalsNeeded?: number
  withdrawalApprovalsReceived?: number
  withdrawalApprovalsNeeded?: number
  className?: string
}

export function ApprovalStatusBadge({
  status,
  approvalsReceived = 0,
  approvalsNeeded = 0,
  withdrawalApprovalsReceived = 0,
  withdrawalApprovalsNeeded = 0,
  className,
}: ApprovalStatusBadgeProps) {
  // Pending approval status
  if (status === 'PENDING_APPROVAL') {
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

  // Withdrawal requested status
  if (status === 'WITHDRAWAL_REQUESTED') {
    return (
      <Badge
        className={cn(
          'bg-[#422006] text-[#FBBF24] border-[#854D0E]',
          className
        )}
      >
        <ArrowUpRight className="h-3 w-3" />
        {withdrawalApprovalsNeeded > 0 ? (
          <span>Withdrawal {withdrawalApprovalsReceived}/{withdrawalApprovalsNeeded}</span>
        ) : (
          <span>Withdrawal Requested</span>
        )}
      </Badge>
    )
  }

  // Withdrawal approved - ready for receipt
  if (status === 'WITHDRAWAL_APPROVED') {
    return (
      <Badge
        className={cn(
          'bg-[#0C1929] text-[#60A5FA] border-[#1E40AF]',
          className
        )}
      >
        <Clock className="h-3 w-3" />
        <span>Ready for Receipt</span>
      </Badge>
    )
  }

  // Received status - terminal state
  if (status === 'RECEIVED') {
    return (
      <Badge
        className={cn(
          'bg-[#052E16] text-[#4ADE80] border-[#166534]',
          className
        )}
      >
        <CheckCircle className="h-3 w-3" />
        <span>Received</span>
      </Badge>
    )
  }

  // Rejected status
  if (status === 'REJECTED') {
    return (
      <Badge
        className={cn(
          'bg-[#450A0A] text-[#F87171] border-[#991B1B]',
          className
        )}
      >
        <XCircle className="h-3 w-3" />
        <span>Rejected</span>
      </Badge>
    )
  }

  // Withdrawal rejected status
  if (status === 'WITHDRAWAL_REJECTED') {
    return (
      <Badge
        className={cn(
          'bg-[#450A0A] text-[#F87171] border-[#991B1B]',
          className
        )}
      >
        <XCircle className="h-3 w-3" />
        <span>Withdrawal Rejected</span>
      </Badge>
    )
  }

  // Approved status (default)
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
