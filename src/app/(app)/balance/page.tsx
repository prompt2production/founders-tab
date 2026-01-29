'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuthContext } from '@/components/auth/auth-provider'
import { useBalances, Balance, BalanceFilter } from '@/hooks/useBalances'
import { useBalance } from '@/hooks/useBalance'
import { useCompanySettings } from '@/hooks/useCompanySettings'
import { formatCurrency } from '@/lib/format-currency'
import { BalanceSummary } from '@/components/balance/balance-summary'
import { BalanceCard } from '@/components/balance/balance-card'
import { BalanceBreakdown } from '@/components/balance/balance-breakdown'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ResponsiveDrawer,
  ResponsiveDrawerContent,
  ResponsiveDrawerHeader,
  ResponsiveDrawerTitle,
  ResponsiveDrawerBody,
} from '@/components/ui/responsive-drawer'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const FILTER_OPTIONS: { value: BalanceFilter; label: string; description: string }[] = [
  { value: 'owed', label: 'Owed', description: 'Approved + withdrawal in progress' },
  { value: 'approved', label: 'Approved Only', description: 'Only approved expenses' },
  { value: 'pending', label: 'Pending', description: 'Awaiting approval' },
  { value: 'active', label: 'All Active', description: 'Everything except received' },
  { value: 'all', label: 'All', description: 'Including received payments' },
]

function BalanceCardSkeleton() {
  return (
    <div className="rounded-xl bg-card border border-border p-5 space-y-4">
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  )
}

function BalanceSummarySkeleton() {
  return (
    <div className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-orange-500/20 p-5 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-white/20 rounded animate-pulse" />
          <div className="h-8 w-40 bg-white/20 rounded animate-pulse" />
        </div>
        <div className="h-8 w-12 bg-white/20 rounded-md" />
      </div>
      <div className="flex items-center gap-4">
        <div className="space-y-1">
          <div className="h-3 w-16 bg-white/20 rounded animate-pulse" />
          <div className="h-5 w-8 bg-white/20 rounded animate-pulse" />
        </div>
        <div className="h-6 w-px bg-white/20" />
        <div className="space-y-1">
          <div className="h-3 w-24 bg-white/20 rounded animate-pulse" />
          <div className="h-5 w-16 bg-white/20 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}

function BalanceDetailSheet({
  userId,
  filter,
  onClose,
}: {
  userId: string | null
  filter: BalanceFilter
  onClose: () => void
}) {
  const { user, total, expenseCount, byCategory, byMonth, isLoading } = useBalance(userId, filter)
  const { currencySymbol, currency } = useCompanySettings()

  return (
    <ResponsiveDrawer open={!!userId} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveDrawerContent className="h-[85vh]">
        <ResponsiveDrawerHeader>
          <ResponsiveDrawerTitle>{user?.name || 'Loading...'}</ResponsiveDrawerTitle>
        </ResponsiveDrawerHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ResponsiveDrawerBody className="space-y-6">
            {/* Summary stats */}
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold tabular-nums">{formatCurrency(total, currencySymbol, currency)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Expense Count</p>
                <p className="text-2xl font-bold tabular-nums">{expenseCount}</p>
              </div>
            </div>

            {/* Breakdown */}
            <BalanceBreakdown byCategory={byCategory} byMonth={byMonth} />

            {/* View expenses link */}
            <div className="pt-4">
              <Link href={`/expenses?userId=${userId}`}>
                <Button variant="outline" className="w-full">
                  View Expenses
                </Button>
              </Link>
            </div>
          </ResponsiveDrawerBody>
        )}
      </ResponsiveDrawerContent>
    </ResponsiveDrawer>
  )
}

export default function BalancePage() {
  const { user: currentUser } = useAuthContext()
  const { currencySymbol: pageSymbol } = useCompanySettings()
  const [filter, setFilter] = useState<BalanceFilter>('owed')
  const { teamTotal, pendingTotal, balances, isLoading, error } = useBalances(filter)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold">Running Balances</h1>
            <Select value={filter} onValueChange={(value) => setFilter(value as BalanceFilter)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>

        {/* Content */}
        <div className="px-4 lg:px-6 py-6 space-y-6">
          {/* Summary */}
          {isLoading ? (
            <BalanceSummarySkeleton />
          ) : (
            <BalanceSummary teamTotal={teamTotal} pendingTotal={pendingTotal} memberCount={balances.length} />
          )}

          {/* Error state */}
          {error && (
            <div className="rounded-xl bg-red-900/20 border border-red-900/50 p-4 text-center">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Balance Cards Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <BalanceCardSkeleton />
              <BalanceCardSkeleton />
              <BalanceCardSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {balances.map((balance: Balance) => (
                <BalanceCard
                  key={balance.user.id}
                  user={balance.user}
                  total={balance.total}
                  pendingTotal={balance.pendingTotal}
                  expenseCount={balance.expenseCount}
                  percentage={balance.percentage}
                  highlight={balance.user.id === currentUser?.id}
                  onClick={() => setSelectedUserId(balance.user.id)}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && balances.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <span className="text-2xl">{pageSymbol}</span>
              </div>
              <h3 className="font-semibold mb-1">No balances yet</h3>
              <p className="text-sm text-muted-foreground">
                Balances will appear once team members add expenses
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Sheet */}
      <BalanceDetailSheet userId={selectedUserId} filter={filter} onClose={() => setSelectedUserId(null)} />
    </div>
  )
}
