'use client'

import { useMemo } from 'react'
import { format } from 'date-fns'
import { Receipt, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ExpenseListItem } from './expense-list-item'
import { useExpenses, Expense } from '@/hooks/useExpenses'
import { getCategoryLabel } from '@/lib/constants/categories'

interface ExpenseFilters {
  userId?: string
  category?: string
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
  const { expenses, total, totalPages, isLoading, error } = useExpenses({
    page,
    limit: 20,
    ...filters,
  })

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
    const hasFilters = filters.userId || filters.category || filters.startDate || filters.endDate

    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <Receipt className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-1">
          {hasFilters ? 'No expenses match your filters' : 'No expenses yet'}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {hasFilters
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
            Total: ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
            showUser
            onClick={onExpenseClick ? () => onExpenseClick(expense) : undefined}
          />
        ))}
      </div>

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
