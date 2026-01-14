'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ArrowUpRight, Clock, CheckCircle } from 'lucide-react'

interface WithdrawalStatusBadgeProps {
  status: 'WITHDRAWAL_REQUESTED' | 'WITHDRAWAL_APPROVED' | 'RECEIVED'
  approvalsReceived?: number
  approvalsNeeded?: number
  className?: string
}

export function WithdrawalStatusBadge({
  status,
  approvalsReceived = 0,
  approvalsNeeded = 0,
  className,
}: WithdrawalStatusBadgeProps) {
  if (status === 'WITHDRAWAL_REQUESTED') {
    return (
      <Badge
        className={cn(
          'bg-[#422006] text-[#FBBF24] border-[#854D0E]',
          className
        )}
      >
        <ArrowUpRight className="h-3 w-3" />
        {approvalsNeeded > 0 ? (
          <span>Withdrawal {approvalsReceived}/{approvalsNeeded}</span>
        ) : (
          <span>Withdrawal Requested</span>
        )}
      </Badge>
    )
  }

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

  // RECEIVED status
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
