'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PieChart } from 'lucide-react'
import { CategoryIcon } from '@/components/expenses/category-icon'
import { getCategoryLabel } from '@/lib/constants/categories'
import { formatCurrency } from '@/lib/format-currency'
import { useCompanySettings } from '@/hooks/useCompanySettings'
import type { CategoryBreakdown } from '@/hooks/useDashboard'

interface CategoryBreakdownChartProps {
  data: CategoryBreakdown[]
  isLoading: boolean
}

export function CategoryBreakdownChart({ data, isLoading }: CategoryBreakdownChartProps) {
  const { currencySymbol, currency } = useCompanySettings()

  if (isLoading) {
    return (
      <Card className="bg-card border-border rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <PieChart className="h-5 w-5 text-muted-foreground" />
            Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card className="bg-card border-border rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <PieChart className="h-5 w-5 text-muted-foreground" />
            Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <PieChart className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No expenses this month
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <PieChart className="h-5 w-5 text-muted-foreground" />
          Category Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CategoryIcon category={item.category} size="sm" className="text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {getCategoryLabel(item.category)}
                  </span>
                </div>
                <span className="text-sm tabular-nums">
                  {formatCurrency(item.total, currencySymbol, currency)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-red-600 rounded-full transition-all"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
