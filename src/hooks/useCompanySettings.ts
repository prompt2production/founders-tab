import { useCompanySettingsContext } from '@/components/company/company-settings-provider'

export function useCompanySettings() {
  const context = useCompanySettingsContext()

  return {
    companyName: context.companyName,
    currency: context.currency,
    currencySymbol: context.currencySymbol,
    nudgeCooldownHours: context.nudgeCooldownHours,
    isLoading: context.isLoading,
    refetch: context.refetch,
  }
}
