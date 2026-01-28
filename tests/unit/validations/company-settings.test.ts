import { describe, it, expect } from 'vitest'
import {
  SUPPORTED_CURRENCIES,
  CURRENCY_OPTIONS,
  updateCompanySettingsSchema,
} from '@/lib/validations/company-settings'

describe('Company Settings Validation', () => {
  describe('SUPPORTED_CURRENCIES', () => {
    it('contains 12 currency codes', () => {
      expect(SUPPORTED_CURRENCIES).toHaveLength(12)
    })

    it('includes all expected currencies', () => {
      const expected = ['USD', 'GBP', 'EUR', 'CAD', 'AUD', 'NZD', 'JPY', 'CHF', 'SEK', 'NOK', 'INR', 'ZAR']
      expected.forEach((code) => {
        expect(SUPPORTED_CURRENCIES).toContain(code)
      })
    })
  })

  describe('CURRENCY_OPTIONS', () => {
    it('has an entry for each supported currency', () => {
      expect(CURRENCY_OPTIONS).toHaveLength(SUPPORTED_CURRENCIES.length)
    })

    it('each option has value, label, and symbol', () => {
      CURRENCY_OPTIONS.forEach((option) => {
        expect(option).toHaveProperty('value')
        expect(option).toHaveProperty('label')
        expect(option).toHaveProperty('symbol')
        expect(typeof option.value).toBe('string')
        expect(typeof option.label).toBe('string')
        expect(typeof option.symbol).toBe('string')
      })
    })

    it('USD option has correct details', () => {
      const usd = CURRENCY_OPTIONS.find((o) => o.value === 'USD')
      expect(usd).toBeDefined()
      expect(usd!.label).toBe('US Dollar')
      expect(usd!.symbol).toBe('$')
    })
  })

  describe('updateCompanySettingsSchema', () => {
    it('passes with valid name and currency', () => {
      const result = updateCompanySettingsSchema.safeParse({
        name: 'Acme Corp',
        currency: 'GBP',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Acme Corp')
        expect(result.data.currency).toBe('GBP')
      }
    })

    it('passes with only name', () => {
      const result = updateCompanySettingsSchema.safeParse({ name: 'Acme Corp' })
      expect(result.success).toBe(true)
    })

    it('passes with only currency', () => {
      const result = updateCompanySettingsSchema.safeParse({ currency: 'EUR' })
      expect(result.success).toBe(true)
    })

    it('passes with empty object (both fields optional)', () => {
      const result = updateCompanySettingsSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('trims whitespace from name', () => {
      const result = updateCompanySettingsSchema.safeParse({ name: '  Acme Corp  ' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Acme Corp')
      }
    })

    it('rejects name longer than 100 characters', () => {
      const result = updateCompanySettingsSchema.safeParse({ name: 'A'.repeat(101) })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Company name must be at most 100 characters')
      }
    })

    it('rejects unsupported currency code', () => {
      const result = updateCompanySettingsSchema.safeParse({ currency: 'BTC' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Currency must be a supported currency code')
      }
    })

    it('rejects lowercase currency code', () => {
      const result = updateCompanySettingsSchema.safeParse({ currency: 'usd' })
      expect(result.success).toBe(false)
    })

    it('accepts all supported currencies', () => {
      SUPPORTED_CURRENCIES.forEach((code) => {
        const result = updateCompanySettingsSchema.safeParse({ currency: code })
        expect(result.success).toBe(true)
      })
    })
  })
})
