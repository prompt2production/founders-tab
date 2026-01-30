'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import { CURRENCY_OPTIONS, SupportedCurrency } from '@/lib/validations/company-settings'

interface CompanySettingsContextType {
  companyName: string
  currency: SupportedCurrency
  currencySymbol: string
  nudgeCooldownHours: number
  isLoading: boolean
  refetch: () => Promise<void>
}

const CompanySettingsContext = createContext<CompanySettingsContextType | undefined>(undefined)

function getSymbol(currency: SupportedCurrency): string {
  return CURRENCY_OPTIONS.find((o) => o.value === currency)?.symbol ?? currency
}

export function CompanySettingsProvider({ children }: { children: ReactNode }) {
  const [companyName, setCompanyName] = useState('')
  const [currency, setCurrency] = useState<SupportedCurrency>('USD')
  const [nudgeCooldownHours, setNudgeCooldownHours] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const refetch = useCallback(async () => {
    try {
      const response = await fetch('/api/company-settings')
      if (response.ok) {
        const data = await response.json()
        setCompanyName(data.name ?? '')
        setCurrency(data.currency ?? 'USD')
        setNudgeCooldownHours(data.nudgeCooldownHours ?? 0)
      }
    } catch {
      // keep defaults
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  const value: CompanySettingsContextType = {
    companyName,
    currency,
    currencySymbol: getSymbol(currency),
    nudgeCooldownHours,
    isLoading,
    refetch,
  }

  return (
    <CompanySettingsContext.Provider value={value}>
      {children}
    </CompanySettingsContext.Provider>
  )
}

export function useCompanySettingsContext() {
  const context = useContext(CompanySettingsContext)
  if (context === undefined) {
    throw new Error('useCompanySettingsContext must be used within a CompanySettingsProvider')
  }
  return context
}
