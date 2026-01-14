'use client'

import { format } from 'date-fns'
import { CategoryIcon } from './category-icon'
import { ApprovalStatusBadge } from './approval-status-badge'
import { getCategoryLabel } from '@/lib/constants/categories'
import { cn } from '@/lib/utils'

interface ExpenseUser {
  id: string
  name: string
}

interface Approval {
  id: string
  user: ExpenseUser
}

interface Expense {
  id: string
  date: Date | string
  amount: number | string
  description: string
  category: string
  status?: 'PENDING_APPROVAL' | 'APPROVED'
  receiptUrl?: string | null
  notes?: string | null
  user?: ExpenseUser
  approvals?: Approval[]
  approvalsNeeded?: number
}

interface ExpenseListItemProps {
  expense: Expense
  onClick?: () => void
  showUser?: boolean
}

export function ExpenseListItem({ expense, onClick, showUser = false }: ExpenseListItemProps) {
  const date = expense.date instanceof Date ? expense.date : new Date(expense.date)
  const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount
  const formattedAmount = `$${amount.toFixed(2)}`
  const categoryLabel = getCategoryLabel(expense.category)
  const userName = expense.user?.name
  const isPending = expense.status === 'PENDING_APPROVAL'
  const approvalsReceived = expense.approvals?.length || 0

  return (
    <div
      className={cn(
        'flex items-center gap-3 py-3',
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
        <p className={cn('font-semibold tabular-nums', isPending && 'text-muted-foreground')}>
          {formattedAmount}
        </p>
        {expense.status && (
          <ApprovalStatusBadge
            status={expense.status}
            approvalsReceived={approvalsReceived}
            approvalsNeeded={expense.approvalsNeeded}
          />
        )}
        {!expense.status && <p className="text-xs text-muted-foreground">{categoryLabel}</p>}
      </div>
    </div>
  )
}
