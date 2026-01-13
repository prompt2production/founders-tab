import { describe, it, expect } from 'vitest'
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/lib/validations/auth'

describe('Auth Validation Schemas', () => {
  describe('signupSchema', () => {
    it('passes with valid data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
      }
      const result = signupSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects invalid email', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'not-an-email',
        password: 'Password1',
        confirmPassword: 'Password1',
      }
      const result = signupSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email')
      }
    })

    it('rejects password without uppercase', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password1',
        confirmPassword: 'password1',
      }
      const result = signupSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('uppercase')
      }
    })

    it('rejects password without lowercase', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'PASSWORD1',
        confirmPassword: 'PASSWORD1',
      }
      const result = signupSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('lowercase')
      }
    })

    it('rejects password without number', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Passwordd',
        confirmPassword: 'Passwordd',
      }
      const result = signupSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('number')
      }
    })

    it('rejects password shorter than 8 characters', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Pass1',
        confirmPassword: 'Pass1',
      }
      const result = signupSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('8 characters')
      }
    })

    it('rejects mismatched passwords', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password1',
        confirmPassword: 'Password2',
      }
      const result = signupSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('match')
      }
    })

    it('rejects name shorter than 2 characters', () => {
      const invalidData = {
        name: 'J',
        email: 'john@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
      }
      const result = signupSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('name')
      }
    })

    it('rejects name longer than 100 characters', () => {
      const invalidData = {
        name: 'J'.repeat(101),
        email: 'john@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
      }
      const result = signupSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('name')
      }
    })
  })

  describe('loginSchema', () => {
    it('passes with valid data', () => {
      const validData = {
        email: 'john@example.com',
        password: 'anypassword',
      }
      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'anypassword',
      }
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects empty password', () => {
      const invalidData = {
        email: 'john@example.com',
        password: '',
      }
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('forgotPasswordSchema', () => {
    it('passes with valid email', () => {
      const validData = {
        email: 'john@example.com',
      }
      const result = forgotPasswordSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
      }
      const result = forgotPasswordSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('resetPasswordSchema', () => {
    it('passes with valid data', () => {
      const validData = {
        token: 'valid-token-123',
        password: 'NewPassword1',
        confirmPassword: 'NewPassword1',
      }
      const result = resetPasswordSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects empty token', () => {
      const invalidData = {
        token: '',
        password: 'NewPassword1',
        confirmPassword: 'NewPassword1',
      }
      const result = resetPasswordSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects weak password', () => {
      const invalidData = {
        token: 'valid-token-123',
        password: 'weak',
        confirmPassword: 'weak',
      }
      const result = resetPasswordSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects mismatched passwords', () => {
      const invalidData = {
        token: 'valid-token-123',
        password: 'NewPassword1',
        confirmPassword: 'DifferentPassword1',
      }
      const result = resetPasswordSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})
