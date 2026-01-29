'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useExpenses } from '@/hooks/useExpenses'
import { useCompanySettings } from '@/hooks/useCompanySettings'
import { formatCurrency } from '@/lib/format-currency'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/auth/user-avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ExpenseListItem } from '@/components/expenses/expense-list-item'
import { AddExpenseSheet } from '@/components/expenses/add-expense-sheet'
import { EditExpenseSheet } from '@/components/expenses/edit-expense-sheet'
import { DollarSign, TrendingUp, Receipt, Plus } from 'lucide-react'

interface ExpenseSummary {
  userTotal: number
  teamTotal: number
}

interface Expense {
  id: string
  date: string
  amount: string
  description: string
  category: string
  receiptUrl: string | null
  notes: string | null
}

export default function HomePage() {
  const { user } = useAuth()
  const { currencySymbol, currency } = useCompanySettings()
  const [summary, setSummary] = useState<ExpenseSummary | null>(null)
  const [isSummaryLoading, setIsSummaryLoading] = useState(true)
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const { expenses, isLoading: isExpensesLoading, refetch: refetchExpenses } = useExpenses({ limit: 5 })

  const fetchSummary = useCallback(async () => {
    try {
      const response = await fetch('/api/expenses/summary')
      if (response.ok) {
        const data = await response.json()
        setSummary(data)
      }
    } catch (error) {
      console.error('Error fetching expense summary:', error)
    } finally {
      setIsSummaryLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchSummary()
    }
  }, [user, fetchSummary])

  const handleExpenseSuccess = useCallback(() => {
    refetchExpenses()
    fetchSummary()
  }, [refetchExpenses, fetchSummary])

  if (!user) return null

  return (
    <div className="px-4 lg:px-6 py-6 space-y-6">
      {/* Welcome Card */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-950 to-red-950 border border-orange-700/30 p-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-white/80">Welcome back,</p>
            <p className="text-2xl font-bold text-white mt-1">{user.name}</p>
            <Badge className="bg-white/20 text-white border-0 mt-2">
              {user.role}
            </Badge>
          </div>
          <UserAvatar
            name={user.name}
            initials={user.avatarInitials || undefined}
            size="lg"
          />
        </div>
        <Button
          className="mt-4 bg-white text-primary hover:bg-white/90"
          onClick={() => setIsAddExpenseOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card border-border rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Your Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isSummaryLoading ? (
              <>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-3 w-16 mt-2" />
              </>
            ) : (
              <>
                <p className="text-2xl font-bold tabular-nums">
                  {formatCurrency(summary?.userTotal || 0, currencySymbol, currency)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Team Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isSummaryLoading ? (
              <>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-3 w-16 mt-2" />
              </>
            ) : (
              <>
                <p className="text-2xl font-bold tabular-nums">
                  {formatCurrency(summary?.teamTotal || 0, currencySymbol, currency)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses */}
      <Card className="bg-card border-border rounded-xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Recent Expenses
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
              <Link href="/expenses">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isExpensesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 py-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20 mt-1" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-12 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">
                No expenses yet. Start tracking by adding your first expense.
              </p>
              <Button onClick={() => setIsAddExpenseOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {expenses.map((expense) => (
                <ExpenseListItem
                  key={expense.id}
                  expense={expense}
                  onClick={() => setEditingExpense(expense as Expense)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Expense Sheet */}
      <AddExpenseSheet
        open={isAddExpenseOpen}
        onOpenChange={setIsAddExpenseOpen}
        onSuccess={handleExpenseSuccess}
      />

      {/* Edit Expense Sheet */}
      {editingExpense && (
        <EditExpenseSheet
          expense={editingExpense}
          open={!!editingExpense}
          onOpenChange={(open) => {
            if (!open) setEditingExpense(null)
          }}
          onSuccess={handleExpenseSuccess}
        />
      )}
    </div>
  )
}
