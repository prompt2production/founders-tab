'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ExpenseFilters, ExpenseFiltersState } from '@/components/expenses/expense-filters'
import { ExpenseListPaginated } from '@/components/expenses/expense-list-paginated'
import { EditExpenseSheet } from '@/components/expenses/edit-expense-sheet'
import { Expense } from '@/hooks/useExpenses'
import { useExpenseFilters } from '@/hooks/useExpenseFilters'

function ExpensesContent() {
  const { filters, setFilters } = useExpenseFilters()
  const searchParams = useSearchParams()
  const [page, setPage] = useState(() => {
    const pageParam = searchParams.get('page')
    return pageParam ? parseInt(pageParam, 10) : 1
  })

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleFiltersChange = (newFilters: ExpenseFiltersState) => {
    setFilters(newFilters)
    setPage(1) // Reset to page 1 when filters change
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleSuccess = () => {
    setRefreshKey((k) => k + 1)
  }

  const handleExpenseClick = (expense: Expense) => {
    setEditingExpense(expense)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="px-4 lg:px-6 py-4">
          <h1 className="text-2xl font-semibold">Expenses</h1>
        </header>

        {/* Content */}
        <div className="px-4 lg:px-6 py-6 space-y-6">
          {/* Filters */}
          <ExpenseFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />

          {/* Expense List */}
          <ExpenseListPaginated
            key={refreshKey}
            filters={filters}
            page={page}
            onPageChange={handlePageChange}
            onExpenseClick={handleExpenseClick}
          />
        </div>
      </div>

      {/* Edit Expense Sheet */}
      {editingExpense && (
        <EditExpenseSheet
          expense={editingExpense}
          open={!!editingExpense}
          onOpenChange={(open) => !open && setEditingExpense(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}

export default function ExpensesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ExpensesContent />
    </Suspense>
  )
}
