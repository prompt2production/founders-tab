'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DollarSign, TrendingUp, Clock, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/format-currency'
import { useCompanySettings } from '@/hooks/useCompanySettings'
import type { DashboardStats } from '@/hooks/useDashboard'

interface QuickStatsProps {
  stats: DashboardStats | null
  isLoading: boolean
  userRole: 'FOUNDER' | 'MEMBER'
  currentUserId?: string
}

export function QuickStats({ stats, isLoading, userRole, currentUserId }: QuickStatsProps) {
  const router = useRouter()
  const { currencySymbol, currency } = useCompanySettings()

  const cards = [
    {
      title: 'Your Expenses',
      icon: DollarSign,
      value: stats?.userTotal || 0,
      isCurrency: true,
      subtitle: 'This month',
      href: currentUserId ? `/expenses?userId=${currentUserId}` : '/expenses',
    },
    {
      title: 'Team Total',
      icon: TrendingUp,
      value: stats?.teamTotal || 0,
      isCurrency: true,
      subtitle: 'This month',
      href: '/expenses',
    },
    ...(userRole === 'FOUNDER'
      ? [
          {
            title: 'Needs Action',
            icon: AlertCircle,
            value: stats?.pendingApprovalCount || 0,
            isCurrency: false,
            subtitle: 'Awaiting your approval',
            highlight: (stats?.pendingApprovalCount || 0) > 0,
            href: '/expenses?status=NEEDS_ACTION',
          },
        ]
      : []),
    {
      title: 'Your Pending',
      icon: Clock,
      value: stats?.userPendingCount || 0,
      isCurrency: false,
      subtitle: 'Awaiting approval',
      href: currentUserId ? `/expenses?status=PENDING_APPROVAL&userId=${currentUserId}` : '/expenses?status=PENDING_APPROVAL',
    },
  ]

  return (
    <div className={`grid gap-4 ${userRole === 'FOUNDER' ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 lg:grid-cols-3'}`}>
      {cards.map(({ title, icon: Icon, value, isCurrency, subtitle, highlight, href }) => (
        <Card
          key={title}
          className={`bg-card border-border rounded-xl cursor-pointer transition-colors hover:bg-muted/50 ${highlight ? 'border-primary/50 bg-primary/5 hover:bg-primary/10' : ''}`}
          onClick={() => router.push(href)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && router.push(href)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Icon className={`h-4 w-4 ${highlight ? 'text-primary' : ''}`} />
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-3 w-16 mt-2" />
              </>
            ) : (
              <>
                <p className={`text-2xl font-bold tabular-nums ${highlight ? 'text-primary' : ''}`}>
                  {isCurrency
                    ? formatCurrency(value, currencySymbol, currency)
                    : value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
