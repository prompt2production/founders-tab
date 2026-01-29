'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/format-currency'
import { useCompanySettings } from '@/hooks/useCompanySettings'
import type { MonthlyTrend } from '@/hooks/useDashboard'

interface SpendingTrendChartProps {
  data: MonthlyTrend[]
  isLoading: boolean
}

export function SpendingTrendChart({ data, isLoading }: SpendingTrendChartProps) {
  const { currencySymbol, currency } = useCompanySettings()

  if (isLoading) {
    return (
      <Card className="bg-card border-border rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            Spending Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-end justify-between gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <Skeleton className="w-full" style={{ height: `${20 + Math.random() * 60}%` }} />
                <Skeleton className="h-3 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const maxValue = Math.max(...data.map((d) => d.total), 1)

  return (
    <Card className="bg-card border-border rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          Spending Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48 flex items-end justify-between gap-2">
          {data.map((item, index) => {
            const heightPercent = maxValue > 0 ? (item.total / maxValue) * 100 : 0
            const isCurrentMonth = index === data.length - 1

            return (
              <div
                key={item.month}
                className="flex-1 flex flex-col items-center gap-2 group"
              >
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-center whitespace-nowrap">
                  {formatCurrency(item.total, currencySymbol, currency)}
                </div>

                {/* Bar */}
                <div
                  className={`w-full rounded-t-md transition-all ${
                    isCurrentMonth
                      ? 'bg-gradient-to-t from-primary to-red-600'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                  style={{
                    height: `${Math.max(heightPercent, 4)}%`,
                  }}
                />

                {/* Month label */}
                <span
                  className={`text-xs ${
                    isCurrentMonth ? 'text-primary font-medium' : 'text-muted-foreground'
                  }`}
                >
                  {item.month}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
