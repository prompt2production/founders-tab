import { describe, it, expect } from 'vitest'
import { rejectExpenseSchema, ExpenseStatus } from '@/lib/validations/expense'

describe('rejectExpenseSchema', () => {
  it('should pass with a valid reason', () => {
    const result = rejectExpenseSchema.safeParse({
      reason: 'This does not look like a business expense',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.reason).toBe('This does not look like a business expense')
    }
  })

  it('should reject when reason is empty', () => {
    const result = rejectExpenseSchema.safeParse({ reason: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('required')
    }
  })

  it('should reject when reason is missing', () => {
    const result = rejectExpenseSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('should reject when reason exceeds 500 characters', () => {
    const result = rejectExpenseSchema.safeParse({
      reason: 'a'.repeat(501),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('500')
    }
  })

  it('should accept reason at exactly 500 characters', () => {
    const result = rejectExpenseSchema.safeParse({
      reason: 'a'.repeat(500),
    })
    expect(result.success).toBe(true)
  })

  it('should trim whitespace from reason', () => {
    const result = rejectExpenseSchema.safeParse({
      reason: '  Not a valid expense  ',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.reason).toBe('Not a valid expense')
    }
  })

  it('should reject when reason is only whitespace', () => {
    const result = rejectExpenseSchema.safeParse({
      reason: '   ',
    })
    expect(result.success).toBe(false)
  })
})

describe('ExpenseStatus includes rejection statuses', () => {
  it('should include REJECTED status', () => {
    expect(ExpenseStatus.REJECTED).toBe('REJECTED')
  })

  it('should include WITHDRAWAL_REJECTED status', () => {
    expect(ExpenseStatus.WITHDRAWAL_REJECTED).toBe('WITHDRAWAL_REJECTED')
  })
})
