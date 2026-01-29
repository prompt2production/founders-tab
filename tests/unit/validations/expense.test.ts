import { describe, it, expect } from 'vitest'
import {
  createExpenseSchema,
  updateExpenseSchema,
  listExpensesQuerySchema,
  Category,
} from '@/lib/validations/expense'

describe('createExpenseSchema', () => {
  const validExpense = {
    date: new Date().toISOString(),
    amount: 45.99,
    description: 'Team lunch',
    category: 'FOOD',
  }

  it('should pass with valid expense data', () => {
    const result = createExpenseSchema.safeParse(validExpense)
    expect(result.success).toBe(true)
  })

  it('should pass with all optional fields', () => {
    const result = createExpenseSchema.safeParse({
      ...validExpense,
      receiptUrl: 'https://example.com/receipt.jpg',
      notes: 'Client meeting lunch',
    })
    expect(result.success).toBe(true)
  })

  // Amount validation tests
  describe('amount validation', () => {
    it('should reject negative amount', () => {
      const result = createExpenseSchema.safeParse({
        ...validExpense,
        amount: -10,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('positive')
      }
    })

    it('should reject zero amount', () => {
      const result = createExpenseSchema.safeParse({
        ...validExpense,
        amount: 0,
      })
      expect(result.success).toBe(false)
    })

    it('should reject amount with too many decimal places', () => {
      const result = createExpenseSchema.safeParse({
        ...validExpense,
        amount: 45.999,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('2 decimal places')
      }
    })

    it('should reject amount exceeding maximum', () => {
      const result = createExpenseSchema.safeParse({
        ...validExpense,
        amount: 1000000,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('999,999.99')
      }
    })

    it('should accept amount at maximum', () => {
      const result = createExpenseSchema.safeParse({
        ...validExpense,
        amount: 999999.99,
      })
      expect(result.success).toBe(true)
    })

    it('should accept amount with 2 decimal places', () => {
      const result = createExpenseSchema.safeParse({
        ...validExpense,
        amount: 123.45,
      })
      expect(result.success).toBe(true)
    })

    it('should accept whole number amount', () => {
      const result = createExpenseSchema.safeParse({
        ...validExpense,
        amount: 100,
      })
      expect(result.success).toBe(true)
    })
  })

  // Date validation tests
  describe('date validation', () => {
    it('should reject future date', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)
      const result = createExpenseSchema.safeParse({
        ...validExpense,
        date: futureDate.toISOString(),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('future')
      }
    })

    it('should reject date older than 1 year', () => {
      const oldDate = new Date()
      oldDate.setFullYear(oldDate.getFullYear() - 2)
      const result = createExpenseSchema.safeParse({
        ...validExpense,
        date: oldDate.toISOString(),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('1 year')
      }
    })

    it('should accept today date', () => {
      const result = createExpenseSchema.safeParse({
        ...validExpense,
        date: new Date().toISOString(),
      })
      expect(result.success).toBe(true)
    })

    it('should accept date 6 months ago', () => {
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      const result = createExpenseSchema.safeParse({
        ...validExpense,
        date: sixMonthsAgo.toISOString(),
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid date string', () => {
      const result = createExpenseSchema.safeParse({
        ...validExpense,
        date: 'not-a-date',
      })
      expect(result.success).toBe(false)
    })
  })

  // Category validation tests
  // Note: Category is now a string - company-specific validation happens at API level
  describe('category validation', () => {
    it('should reject empty category', () => {
      const result = createExpenseSchema.safeParse({
        ...validExpense,
        category: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('required')
      }
    })

    it('should reject category exceeding max length', () => {
      const result = createExpenseSchema.safeParse({
        ...validExpense,
        category: 'A'.repeat(51),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('50')
      }
    })

    it('should accept any valid string category', () => {
      // Categories are now dynamic per company, schema just validates it's a non-empty string
      const result = createExpenseSchema.safeParse({
        ...validExpense,
        category: 'CUSTOM_CATEGORY',
      })
      expect(result.success).toBe(true)
    })

    it('should accept all default categories', () => {
      const categories = Object.values(Category)
      categories.forEach((category) => {
        const result = createExpenseSchema.safeParse({
          ...validExpense,
          category,
        })
        expect(result.success).toBe(true)
      })
    })
  })

  // Description validation tests
  describe('description validation', () => {
    it('should reject empty description', () => {
      const result = createExpenseSchema.safeParse({
        ...validExpense,
        description: '',
      })
      expect(result.success).toBe(false)
    })

    it('should reject description over 200 characters', () => {
      const result = createExpenseSchema.safeParse({
        ...validExpense,
        description: 'a'.repeat(201),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('200')
      }
    })

    it('should accept description at 200 characters', () => {
      const result = createExpenseSchema.safeParse({
        ...validExpense,
        description: 'a'.repeat(200),
      })
      expect(result.success).toBe(true)
    })

    it('should trim whitespace from description', () => {
      const result = createExpenseSchema.safeParse({
        ...validExpense,
        description: '  Team lunch  ',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.description).toBe('Team lunch')
      }
    })
  })

  // Optional fields tests
  describe('optional fields', () => {
    it('should reject invalid receiptUrl', () => {
      const result = createExpenseSchema.safeParse({
        ...validExpense,
        receiptUrl: 'not-a-url',
      })
      expect(result.success).toBe(false)
    })

    it('should accept valid https receiptUrl', () => {
      const result = createExpenseSchema.safeParse({
        ...validExpense,
        receiptUrl: 'https://example.com/receipt.pdf',
      })
      expect(result.success).toBe(true)
    })

    it('should accept valid http receiptUrl', () => {
      const result = createExpenseSchema.safeParse({
        ...validExpense,
        receiptUrl: 'http://example.com/receipt.pdf',
      })
      expect(result.success).toBe(true)
    })

    it('should accept relative /uploads/ path for receiptUrl', () => {
      const result = createExpenseSchema.safeParse({
        ...validExpense,
        receiptUrl: '/uploads/receipts/user-123-456789.pdf',
      })
      expect(result.success).toBe(true)
    })

    it('should reject notes over 500 characters', () => {
      const result = createExpenseSchema.safeParse({
        ...validExpense,
        notes: 'a'.repeat(501),
      })
      expect(result.success).toBe(false)
    })
  })
})

describe('updateExpenseSchema', () => {
  it('should allow partial updates', () => {
    const result = updateExpenseSchema.safeParse({
      amount: 50.00,
    })
    expect(result.success).toBe(true)
  })

  it('should allow empty object', () => {
    const result = updateExpenseSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('should validate provided fields', () => {
    const result = updateExpenseSchema.safeParse({
      amount: -10,
    })
    expect(result.success).toBe(false)
  })
})

describe('listExpensesQuerySchema', () => {
  it('should provide defaults for page and limit', () => {
    const result = listExpensesQuerySchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(20)
    }
  })

  it('should coerce string numbers', () => {
    const result = listExpensesQuerySchema.safeParse({
      page: '2',
      limit: '50',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(2)
      expect(result.data.limit).toBe(50)
    }
  })

  it('should enforce max limit of 100', () => {
    const result = listExpensesQuerySchema.safeParse({
      limit: 200,
    })
    expect(result.success).toBe(false)
  })

  it('should accept valid category filter', () => {
    const result = listExpensesQuerySchema.safeParse({
      category: 'FOOD',
    })
    expect(result.success).toBe(true)
  })

  it('should accept valid date filters', () => {
    const result = listExpensesQuerySchema.safeParse({
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    })
    expect(result.success).toBe(true)
  })
})
