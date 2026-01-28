import { useCompanySettingsContext } from '@/components/company/company-settings-provider'

export function useCompanySettings() {
  const context = useCompanySettingsContext()

  return {
    companyName: context.companyName,
    currency: context.currency,
    currencySymbol: context.currencySymbol,
    isLoading: context.isLoading,
    refetch: context.refetch,
  }
}
