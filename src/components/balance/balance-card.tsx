'use client'

import { cn } from '@/lib/utils'
import { useCompanySettings } from '@/hooks/useCompanySettings'
import { formatCurrency } from '@/lib/format-currency'

interface BalanceUser {
  id: string
  name: string
  email: string
}

interface BalanceCardProps {
  user: BalanceUser
  total: number
  expenseCount: number
  percentage: number
  highlight?: boolean
  onClick?: () => void
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function BalanceCard({
  user,
  total,
  expenseCount,
  percentage,
  highlight = false,
  onClick,
}: BalanceCardProps) {
  const { currencySymbol, currency } = useCompanySettings()
  const formattedTotal = formatCurrency(total, currencySymbol, currency)
  const formattedPercentage = `${percentage.toFixed(1)}%`
  const initials = getInitials(user.name)

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl p-5 transition-all',
        highlight
          ? 'bg-gradient-to-br from-primary to-red-600 text-white'
          : 'bg-card border border-border',
        onClick && 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className={cn(
            'h-12 w-12 rounded-full flex items-center justify-center font-medium text-lg',
            highlight ? 'bg-white/20 text-white' : 'bg-gradient-to-br from-primary to-red-600 text-white'
          )}
        >
          {initials}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'font-medium truncate',
              highlight ? 'text-white' : 'text-foreground'
            )}
          >
            {user.name}
          </p>
          <p
            className={cn(
              'text-3xl font-bold tabular-nums mt-1',
              highlight ? 'text-white' : 'text-foreground'
            )}
          >
            {formattedTotal}
          </p>
        </div>
      </div>

      {/* Footer stats */}
      <div className="mt-4 flex items-center justify-between">
        <p
          className={cn(
            'text-xs',
            highlight ? 'text-white/70' : 'text-muted-foreground'
          )}
        >
          {expenseCount} {expenseCount === 1 ? 'expense' : 'expenses'}
        </p>
        <p
          className={cn(
            'text-sm font-medium tabular-nums',
            highlight ? 'text-white/90' : 'text-muted-foreground'
          )}
        >
          {formattedPercentage} of total
        </p>
      </div>
    </div>
  )
}
