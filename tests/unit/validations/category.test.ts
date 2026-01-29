import { describe, it, expect } from 'vitest'
import { labelToValue, DEFAULT_CATEGORIES } from '@/lib/constants/default-categories'
import { CATEGORY_ICONS } from '@/lib/constants/category-icons'

describe('labelToValue', () => {
  it('should convert simple label to uppercase', () => {
    expect(labelToValue('Food')).toBe('FOOD')
  })

  it('should replace spaces with underscores', () => {
    expect(labelToValue('Legal Fees')).toBe('LEGAL_FEES')
  })

  it('should replace multiple spaces with single underscore', () => {
    expect(labelToValue('Office   Supplies')).toBe('OFFICE_SUPPLIES')
  })

  it('should handle special characters', () => {
    expect(labelToValue('Food & Dining')).toBe('FOOD_DINING')
  })

  it('should remove leading and trailing underscores', () => {
    expect(labelToValue('  Test  ')).toBe('TEST')
  })

  it('should handle numbers', () => {
    expect(labelToValue('Category 123')).toBe('CATEGORY_123')
  })

  it('should handle lowercase input', () => {
    expect(labelToValue('software subscriptions')).toBe('SOFTWARE_SUBSCRIPTIONS')
  })
})

describe('DEFAULT_CATEGORIES', () => {
  it('should have 9 default categories', () => {
    expect(DEFAULT_CATEGORIES).toHaveLength(9)
  })

  it('should include all expected categories', () => {
    const values = DEFAULT_CATEGORIES.map((c) => c.value)
    expect(values).toContain('FOOD')
    expect(values).toContain('TRANSPORT')
    expect(values).toContain('SOFTWARE')
    expect(values).toContain('HARDWARE')
    expect(values).toContain('OFFICE')
    expect(values).toContain('TRAVEL')
    expect(values).toContain('MARKETING')
    expect(values).toContain('SERVICES')
    expect(values).toContain('OTHER')
  })

  it('should have valid icons for all categories', () => {
    const validIcons = CATEGORY_ICONS.map((i) => i.value)
    DEFAULT_CATEGORIES.forEach((category) => {
      expect(validIcons).toContain(category.icon)
    })
  })

  it('should have non-empty labels for all categories', () => {
    DEFAULT_CATEGORIES.forEach((category) => {
      expect(category.label).toBeTruthy()
      expect(category.label.length).toBeGreaterThan(0)
    })
  })
})

describe('CATEGORY_ICONS', () => {
  it('should have more than 10 icon options', () => {
    expect(CATEGORY_ICONS.length).toBeGreaterThan(10)
  })

  it('should include default Tag icon', () => {
    const values = CATEGORY_ICONS.map((i) => i.value)
    expect(values).toContain('Tag')
  })

  it('should have unique values', () => {
    const values = CATEGORY_ICONS.map((i) => i.value)
    const uniqueValues = [...new Set(values)]
    expect(values.length).toBe(uniqueValues.length)
  })

  it('should have labels for all icons', () => {
    CATEGORY_ICONS.forEach((icon) => {
      expect(icon.label).toBeTruthy()
      expect(icon.label.length).toBeGreaterThan(0)
    })
  })
})
