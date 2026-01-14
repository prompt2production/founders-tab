'use client'

import { getCategoryLabel } from '@/lib/constants/categories'

interface CategoryBreakdown {
  category: string
  total: number
  count: number
}

interface MonthlyBreakdown {
  month: string
  total: number
}

interface BalanceBreakdownProps {
  byCategory: CategoryBreakdown[]
  byMonth: MonthlyBreakdown[]
}

function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

export function BalanceBreakdown({ byCategory, byMonth }: BalanceBreakdownProps) {
  const maxCategoryTotal = Math.max(...byCategory.map((c) => c.total), 1)
  const recentMonths = byMonth.slice(-6)
  const maxMonthTotal = Math.max(...recentMonths.map((m) => m.total), 1)

  return (
    <div className="space-y-6">
      {/* Category Breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">By Category</h3>
        <div className="space-y-3">
          {byCategory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No expenses yet</p>
          ) : (
            byCategory.map((category) => (
              <div key={category.category} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">{getCategoryLabel(category.category)}</span>
                  <span className="tabular-nums text-muted-foreground">
                    ${category.total.toFixed(2)}
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(category.total / maxCategoryTotal) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {category.count} {category.count === 1 ? 'expense' : 'expenses'}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Monthly Trend */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Monthly Trend</h3>
        <div className="flex items-end gap-2 h-32">
          {recentMonths.map((month) => (
            <div key={month.month} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-secondary rounded-t overflow-hidden flex-1 flex items-end">
                <div
                  className="w-full bg-primary rounded-t transition-all"
                  style={{
                    height:
                      month.total > 0 ? `${Math.max((month.total / maxMonthTotal) * 100, 5)}%` : '0%',
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{formatMonth(month.month)}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>
            $
            {recentMonths
              .reduce((sum, m) => sum + m.total, 0)
              .toFixed(2)}{' '}
            total (last 6 months)
          </span>
        </div>
      </div>
    </div>
  )
}
