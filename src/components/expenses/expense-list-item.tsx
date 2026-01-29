'use client'

import { format } from 'date-fns'
import { CategoryIcon } from './category-icon'
import { ApprovalStatusBadge } from './approval-status-badge'
import { getCategoryLabel } from '@/lib/constants/categories'
import { cn } from '@/lib/utils'
import { useCompanySettings } from '@/hooks/useCompanySettings'
import { formatCurrency } from '@/lib/format-currency'

interface ExpenseUser {
  id: string
  name: string
}

interface Approval {
  id: string
  user: ExpenseUser
}

interface WithdrawalApproval {
  id: string
  user: ExpenseUser
}

interface Expense {
  id: string
  date: Date | string
  amount: number | string
  description: string
  category: string
  status?: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'WITHDRAWAL_REQUESTED' | 'WITHDRAWAL_APPROVED' | 'WITHDRAWAL_REJECTED' | 'RECEIVED'
  receiptUrl?: string | null
  notes?: string | null
  user?: ExpenseUser
  approvals?: Approval[]
  approvalsNeeded?: number
  withdrawalApprovals?: WithdrawalApproval[]
  withdrawalApprovalsNeeded?: number
  canCurrentUserApprove?: boolean
  canCurrentUserApproveWithdrawal?: boolean
}

interface ExpenseListItemProps {
  expense: Expense
  onClick?: () => void
  showUser?: boolean
  needsAction?: boolean
}

function getStatusDescription(
  status: Expense['status'],
  canApprove?: boolean,
  canApproveWithdrawal?: boolean
): string | null {
  if (status === 'PENDING_APPROVAL') {
    return canApprove ? 'Needs your approval' : 'Awaiting approval'
  }
  if (status === 'APPROVED') {
    return 'Approved, awaiting withdrawal request'
  }
  if (status === 'REJECTED') {
    return 'Expense was rejected'
  }
  if (status === 'WITHDRAWAL_REQUESTED') {
    return canApproveWithdrawal ? 'Approve withdrawal' : 'Awaiting withdrawal approval'
  }
  if (status === 'WITHDRAWAL_APPROVED') {
    return 'Ready to mark as received'
  }
  if (status === 'WITHDRAWAL_REJECTED') {
    return 'Withdrawal was rejected'
  }
  if (status === 'RECEIVED') {
    return 'Complete'
  }
  return null
}

export function ExpenseListItem({ expense, onClick, showUser = false, needsAction = false }: ExpenseListItemProps) {
  const { currencySymbol, currency } = useCompanySettings()
  const date = expense.date instanceof Date ? expense.date : new Date(expense.date)
  const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount
  const formattedAmount = formatCurrency(amount, currencySymbol, currency)
  const categoryLabel = getCategoryLabel(expense.category)
  const userName = expense.user?.name
  const isPending = expense.status === 'PENDING_APPROVAL'
  const isWithdrawalPending = expense.status === 'WITHDRAWAL_REQUESTED' || expense.status === 'WITHDRAWAL_APPROVED'
  const isReceived = expense.status === 'RECEIVED'
  const approvalsReceived = expense.approvals?.length || 0
  const withdrawalApprovalsReceived = expense.withdrawalApprovals?.length || 0
  const statusDescription = getStatusDescription(
    expense.status,
    expense.canCurrentUserApprove,
    expense.canCurrentUserApproveWithdrawal
  )

  return (
    <div
      className={cn(
        'flex items-center gap-3 py-3',
        needsAction && 'border-l-3 border-l-primary pl-3',
        onClick && 'cursor-pointer hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors'
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {/* Icon */}
      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
        <CategoryIcon category={expense.category} size="md" className="text-muted-foreground" />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{expense.description}</p>
        <p className="text-xs text-muted-foreground">
          {format(date, 'MMM d, yyyy')}
          {showUser && userName && (
            <span className="text-muted-foreground"> · {userName}</span>
          )}
        </p>
      </div>

      {/* Amount and Status */}
      <div className="text-right flex flex-col items-end gap-1">
        <p className={cn(
          'font-semibold tabular-nums',
          isPending && 'text-muted-foreground',
          isWithdrawalPending && 'text-[#60A5FA]',
          isReceived && 'text-[#4ADE80]'
        )}>
          {formattedAmount}
        </p>
        {expense.status && (
          <ApprovalStatusBadge
            status={expense.status}
            approvalsReceived={approvalsReceived}
            approvalsNeeded={expense.approvalsNeeded}
            withdrawalApprovalsReceived={withdrawalApprovalsReceived}
            withdrawalApprovalsNeeded={expense.withdrawalApprovalsNeeded}
          />
        )}
        {statusDescription && (
          <p className={cn(
            'text-xs',
            needsAction ? 'text-primary font-medium' : 'text-muted-foreground'
          )}>
            {statusDescription}
          </p>
        )}
        {!expense.status && <p className="text-xs text-muted-foreground">{categoryLabel}</p>}
      </div>
    </div>
  )
}
