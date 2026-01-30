'use client'

import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Receipt, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ExpenseListItem } from './expense-list-item'
import { NudgeConfirmationDialog } from './nudge-confirmation-dialog'
import { useExpenses, Expense } from '@/hooks/useExpenses'
import { useAuth } from '@/hooks/useAuth'
import { getCategoryLabel } from '@/lib/constants/categories'
import { useCompanySettings } from '@/hooks/useCompanySettings'
import { formatCurrency } from '@/lib/format-currency'

interface PendingApprover {
  id: string
  name: string
}

interface NudgeableExpense {
  id: string
  description: string
  amount: number | string
  date: Date | string
  category: string
  status: 'PENDING_APPROVAL' | 'WITHDRAWAL_REQUESTED'
  lastNudgeAt?: string | null
  pendingApprovers?: PendingApprover[]
}

interface ExpenseFilters {
  userId?: string
  category?: string
  status?: string
  startDate?: Date
  endDate?: Date
}

interface ExpenseListPaginatedProps {
  filters: ExpenseFilters
  page: number
  onPageChange: (page: number) => void
  onExpenseClick?: (expense: Expense) => void
}

export function ExpenseListPaginated({
  filters,
  page,
  onPageChange,
  onExpenseClick,
}: ExpenseListPaginatedProps) {
  const { user } = useAuth()
  const { currencySymbol, currency } = useCompanySettings()
  const { expenses, total, totalPages, isLoading, error } = useExpenses({
    page,
    limit: 20,
    ...filters,
  })

  const [nudgeDialogOpen, setNudgeDialogOpen] = useState(false)
  const [nudgeExpense, setNudgeExpense] = useState<NudgeableExpense | null>(null)

  // Get user's nudgeable expenses from the current list
  const nudgeableExpenses: NudgeableExpense[] = useMemo(() => {
    return expenses
      .filter((e) =>
        e.userId === user?.id &&
        (e.status === 'PENDING_APPROVAL' || e.status === 'WITHDRAWAL_REQUESTED')
      )
      .map((e) => ({
        id: e.id,
        description: e.description,
        amount: e.amount,
        date: e.date,
        category: e.category,
        status: e.status as 'PENDING_APPROVAL' | 'WITHDRAWAL_REQUESTED',
        lastNudgeAt: e.lastNudgeAt,
        pendingApprovers: e.pendingApprovers,
      }))
  }, [expenses, user?.id])

  function handleNudgeClick(expense: { id: string; description: string; amount: number | string; date: Date | string; category: string; status?: string; lastNudgeAt?: string | null }) {
    if (expense.status === 'PENDING_APPROVAL' || expense.status === 'WITHDRAWAL_REQUESTED') {
      // Find the full expense data to get pendingApprovers
      const fullExpense = expenses.find((e) => e.id === expense.id)
      setNudgeExpense({
        id: expense.id,
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        category: expense.category,
        status: expense.status,
        lastNudgeAt: expense.lastNudgeAt,
        pendingApprovers: fullExpense?.pendingApprovers,
      })
      setNudgeDialogOpen(true)
    }
  }

  // Calculate total amount for filtered expenses
  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, expense) => {
      const amount = parseFloat(expense.amount) || 0
      return sum + amount
    }, 0)
  }, [expenses])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Summary skeleton */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24" />
        </div>

        {/* List skeleton */}
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  if (expenses.length === 0) {
    const hasFilters = filters.userId || filters.category || filters.status || filters.startDate || filters.endDate
    const isNeedsActionFilter = filters.status === 'NEEDS_ACTION'

    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <Receipt className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-1">
          {isNeedsActionFilter
            ? 'No expenses need your action'
            : hasFilters
              ? 'No expenses match your filters'
              : 'No expenses yet'}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {isNeedsActionFilter
            ? 'All caught up!'
            : hasFilters
              ? 'Try adjusting your criteria'
              : 'Start tracking by adding your first expense'}
        </p>
      </div>
    )
  }

  // Build active filter descriptions
  const activeFilters: string[] = []
  if (filters.category) {
    activeFilters.push(getCategoryLabel(filters.category))
  }
  if (filters.startDate && filters.endDate) {
    activeFilters.push(`${format(filters.startDate, 'MMM d')} - ${format(filters.endDate, 'MMM d')}`)
  } else if (filters.startDate) {
    activeFilters.push(`From ${format(filters.startDate, 'MMM d')}`)
  } else if (filters.endDate) {
    activeFilters.push(`Until ${format(filters.endDate, 'MMM d')}`)
  }
  // Note: userId filter not shown as text since we don't have user names loaded here

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">
            Showing {expenses.length} of {total} expense{total !== 1 ? 's' : ''}
          </span>
          <span className="font-semibold tabular-nums">
            Total: {formatCurrency(totalAmount, currencySymbol, currency)}
          </span>
        </div>
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground">Filtered by:</span>
            {activeFilters.map((filter, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {filter}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Expense list */}
      <div className="divide-y divide-border">
        {expenses.map((expense) => (
          <ExpenseListItem
            key={expense.id}
            expense={expense}
            currentUserId={user?.id}
            showUser
            onClick={onExpenseClick ? () => onExpenseClick(expense) : undefined}
            needsAction={expense.canCurrentUserApprove || expense.canCurrentUserApproveWithdrawal}
            onNudgeClick={handleNudgeClick}
          />
        ))}
      </div>

      {/* Nudge Confirmation Dialog */}
      {nudgeExpense && (
        <NudgeConfirmationDialog
          open={nudgeDialogOpen}
          onOpenChange={setNudgeDialogOpen}
          triggerExpense={nudgeExpense}
          allNudgeableExpenses={nudgeableExpenses}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}
