'use client'

import { useCompanySettings } from '@/hooks/useCompanySettings'
import { formatCurrency } from '@/lib/format-currency'

interface BalanceSummaryProps {
  teamTotal: number
  memberCount: number
}

export function BalanceSummary({ teamTotal, memberCount }: BalanceSummaryProps) {
  const { currencySymbol, currency } = useCompanySettings()
  const formattedTotal = formatCurrency(teamTotal, currencySymbol, currency)
  const average = memberCount > 0 ? teamTotal / memberCount : 0
  const formattedAverage = formatCurrency(average, currencySymbol, currency)

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-red-600 p-5">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-white/80">Total Team Expenses</p>
          <p className="text-3xl font-bold text-white tabular-nums mt-1">
            {formattedTotal}
          </p>
        </div>
        <div className="h-8 w-12 bg-white/20 rounded-md" />
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div>
          <p className="text-xs text-white/60">Team Members</p>
          <p className="text-lg font-semibold text-white tabular-nums">{memberCount}</p>
        </div>
        <div className="h-6 w-px bg-white/20" />
        <div>
          <p className="text-xs text-white/60">Average per Founder</p>
          <p className="text-lg font-semibold text-white tabular-nums">{formattedAverage}</p>
        </div>
      </div>
    </div>
  )
}
