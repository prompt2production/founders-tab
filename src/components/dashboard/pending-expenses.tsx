'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Clock, ChevronRight, CheckCircle } from 'lucide-react'
import { ExpenseListItem } from '@/components/expenses/expense-list-item'
import { NudgeConfirmationDialog } from '@/components/expenses/nudge-confirmation-dialog'
import { useAuth } from '@/hooks/useAuth'
import type { UserPendingExpense } from '@/hooks/useDashboard'

interface PendingExpensesProps {
  expenses: UserPendingExpense[]
  isLoading: boolean
  onExpenseClick: (expense: UserPendingExpense) => void
}

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

export function PendingExpenses({ expenses, isLoading, onExpenseClick }: PendingExpensesProps) {
  const { user } = useAuth()
  const [nudgeDialogOpen, setNudgeDialogOpen] = useState(false)
  const [nudgeExpense, setNudgeExpense] = useState<NudgeableExpense | null>(null)

  // Get all nudgeable expenses (pending approval or withdrawal requested)
  const nudgeableExpenses: NudgeableExpense[] = expenses
    .filter((e) => e.status === 'PENDING_APPROVAL' || e.status === 'WITHDRAWAL_REQUESTED')
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

  if (isLoading) {
    return (
      <Card className="bg-card border-border rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Your Pending Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
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
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border rounded-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Your Pending Expenses
          </CardTitle>
          {expenses.length > 0 && (
            <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
              <Link href="/expenses?status=PENDING_APPROVAL&view=mine">
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              All your expenses have been approved!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {expenses.map((expense) => (
              <ExpenseListItem
                key={expense.id}
                expense={expense}
                currentUserId={user?.id}
                onClick={() => onExpenseClick(expense)}
                onNudgeClick={handleNudgeClick}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Nudge Confirmation Dialog */}
      {nudgeExpense && (
        <NudgeConfirmationDialog
          open={nudgeDialogOpen}
          onOpenChange={setNudgeDialogOpen}
          triggerExpense={nudgeExpense}
          allNudgeableExpenses={nudgeableExpenses}
        />
      )}
    </Card>
  )
}
