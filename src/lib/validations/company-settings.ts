import { z } from 'zod'

export const SUPPORTED_CURRENCIES = [
  'USD', 'GBP', 'EUR', 'CAD', 'AUD', 'NZD',
  'JPY', 'CHF', 'SEK', 'NOK', 'INR', 'ZAR',
] as const

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]

export const CURRENCY_OPTIONS: { value: SupportedCurrency; label: string; symbol: string }[] = [
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'GBP', label: 'British Pound', symbol: '\u00a3' },
  { value: 'EUR', label: 'Euro', symbol: '\u20ac' },
  { value: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
  { value: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
  { value: 'NZD', label: 'New Zealand Dollar', symbol: 'NZ$' },
  { value: 'JPY', label: 'Japanese Yen', symbol: '\u00a5' },
  { value: 'CHF', label: 'Swiss Franc', symbol: 'CHF' },
  { value: 'SEK', label: 'Swedish Krona', symbol: 'kr' },
  { value: 'NOK', label: 'Norwegian Krone', symbol: 'kr' },
  { value: 'INR', label: 'Indian Rupee', symbol: '\u20b9' },
  { value: 'ZAR', label: 'South African Rand', symbol: 'R' },
]

export const NUDGE_COOLDOWN_OPTIONS = [
  { value: 0, label: 'Off (can nudge anytime)' },
  { value: 1, label: '1 hour' },
  { value: 6, label: '6 hours' },
  { value: 12, label: '12 hours' },
  { value: 24, label: '24 hours' },
  { value: 48, label: '48 hours' },
  { value: 168, label: '1 week' },
] as const

export const updateCompanySettingsSchema = z.object({
  name: z
    .string()
    .max(100, 'Company name must be at most 100 characters')
    .trim()
    .optional(),
  currency: z.enum(SUPPORTED_CURRENCIES, {
    errorMap: () => ({ message: 'Currency must be a supported currency code' }),
  }).optional(),
  nudgeCooldownHours: z
    .number()
    .int()
    .min(0, 'Cooldown must be at least 0')
    .max(168, 'Cooldown must be at most 168 hours (1 week)')
    .optional(),
})

export type UpdateCompanySettingsInput = z.infer<typeof updateCompanySettingsSchema>
