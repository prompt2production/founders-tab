const ZERO_DECIMAL_CURRENCIES = new Set(['JPY'])

export function formatCurrency(amount: number, symbol: string, currencyCode?: string): string {
  if (currencyCode && ZERO_DECIMAL_CURRENCIES.has(currencyCode)) {
    return `${symbol}${Math.round(amount).toLocaleString('en-US')}`
  }
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
