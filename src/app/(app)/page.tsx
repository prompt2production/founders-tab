'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useDashboard, type PendingApproval, type UserPendingExpense, type RecentActivity as RecentActivityType } from '@/hooks/useDashboard'
import { AddExpenseSheet } from '@/components/expenses/add-expense-sheet'
import { EditExpenseSheet } from '@/components/expenses/edit-expense-sheet'
import {
  QuickStats,
  ActionItems,
  PendingExpenses,
  SpendingTrendChart,
  CategoryBreakdownChart,
  RecentActivity,
} from '@/components/dashboard'
import { getTimeBasedGreeting, getContextMessage } from '@/lib/greetings'

type EditableExpense = PendingApproval | UserPendingExpense | RecentActivityType

export default function HomePage() {
  const { user } = useAuth()
  const { data, isLoading, refetch } = useDashboard()
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<EditableExpense | null>(null)

  const handleExpenseSuccess = useCallback(() => {
    refetch()
  }, [refetch])

  const handleExpenseClick = useCallback((expense: EditableExpense) => {
    setEditingExpense(expense)
  }, [])

  if (!user) return null

  const userRole = data?.userRole || 'MEMBER'

  return (
    <div className="px-4 lg:px-6 pt-8 pb-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">
            {getTimeBasedGreeting(user.name)}
          </h1>
          {!isLoading && (
            <p className="text-muted-foreground">
              {getContextMessage(
                data?.stats.pendingApprovalCount || 0,
                data?.stats.userPendingCount || 0,
                userRole
              )}
            </p>
          )}
        </div>
        <p className="text-sm text-muted-foreground hidden lg:block">
          {new Date().toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Quick Stats Grid */}
      <QuickStats
        stats={data?.stats || null}
        isLoading={isLoading}
        userRole={userRole}
        currentUserId={user.id}
      />

      {/* Action Items (FOUNDER only) */}
      {userRole === 'FOUNDER' && (
        <ActionItems
          expenses={data?.pendingApprovals || []}
          isLoading={isLoading}
          onExpenseClick={handleExpenseClick}
        />
      )}

      {/* Your Pending Expenses */}
      <PendingExpenses
        expenses={data?.userPendingExpenses || []}
        isLoading={isLoading}
        onExpenseClick={handleExpenseClick}
      />

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SpendingTrendChart
          data={data?.monthlyTrend || []}
          isLoading={isLoading}
        />
        <CategoryBreakdownChart
          data={data?.categoryBreakdown || []}
          isLoading={isLoading}
        />
      </div>

      {/* Recent Activity */}
      <RecentActivity
        expenses={data?.recentActivity || []}
        isLoading={isLoading}
        onExpenseClick={handleExpenseClick}
      />

      {/* Add Expense Sheet */}
      <AddExpenseSheet
        open={isAddExpenseOpen}
        onOpenChange={setIsAddExpenseOpen}
        onSuccess={handleExpenseSuccess}
      />

      {/* Edit Expense Sheet */}
      {editingExpense && (
        <EditExpenseSheet
          expense={{
            id: editingExpense.id,
            date: editingExpense.date,
            amount: editingExpense.amount,
            description: editingExpense.description,
            category: editingExpense.category,
            receiptUrl: null,
            notes: null,
          }}
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
