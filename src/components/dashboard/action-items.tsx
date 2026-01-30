'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, ChevronRight } from 'lucide-react'
import { ExpenseListItem } from '@/components/expenses/expense-list-item'
import { useAuth } from '@/hooks/useAuth'
import type { PendingApproval } from '@/hooks/useDashboard'

interface ActionItemsProps {
  expenses: PendingApproval[]
  isLoading: boolean
  onExpenseClick: (expense: PendingApproval) => void
}

export function ActionItems({ expenses, isLoading, onExpenseClick }: ActionItemsProps) {
  const { user } = useAuth()

  if (isLoading) {
    return (
      <Card className="bg-card border-border rounded-xl border-primary/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2 text-primary">
            <AlertCircle className="h-5 w-5" />
            Needs Your Approval
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    )
  }

  if (expenses.length === 0) {
    return null
  }

  return (
    <Card className="bg-card border-border rounded-xl border-primary/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2 text-primary">
            <AlertCircle className="h-5 w-5" />
            Needs Your Approval
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
            <Link href="/expenses?status=PENDING_APPROVAL&view=needs_action">
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border">
          {expenses.map((expense) => (
            <ExpenseListItem
              key={expense.id}
              expense={{
                ...expense,
                canCurrentUserApprove: true,
              }}
              currentUserId={user?.id}
              onClick={() => onExpenseClick(expense)}
              showUser
              needsAction
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
