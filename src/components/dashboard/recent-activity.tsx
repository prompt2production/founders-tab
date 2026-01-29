'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Activity, ChevronRight, Receipt } from 'lucide-react'
import { ExpenseListItem } from '@/components/expenses/expense-list-item'
import type { RecentActivity as RecentActivityType } from '@/hooks/useDashboard'

interface RecentActivityProps {
  expenses: RecentActivityType[]
  isLoading: boolean
  onExpenseClick: (expense: RecentActivityType) => void
}

export function RecentActivity({ expenses, isLoading, onExpenseClick }: RecentActivityProps) {
  if (isLoading) {
    return (
      <Card className="bg-card border-border rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            Recent Team Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
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
            <Activity className="h-5 w-5 text-muted-foreground" />
            Recent Team Activity
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
            <Link href="/expenses">
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="text-center py-6">
            <Receipt className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No recent activity
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {expenses.map((expense) => (
              <ExpenseListItem
                key={expense.id}
                expense={expense}
                onClick={() => onExpenseClick(expense)}
                showUser
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
