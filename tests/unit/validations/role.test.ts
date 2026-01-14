import { describe, it, expect } from 'vitest'
import { updateRoleSchema } from '@/lib/validations/role'

describe('Role Validation Schema', () => {
  describe('updateRoleSchema', () => {
    it('passes with FOUNDER role', () => {
      const validData = { role: 'FOUNDER' }
      const result = updateRoleSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.role).toBe('FOUNDER')
      }
    })

    it('passes with MEMBER role', () => {
      const validData = { role: 'MEMBER' }
      const result = updateRoleSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.role).toBe('MEMBER')
      }
    })

    it('rejects invalid role value', () => {
      const invalidData = { role: 'ADMIN' }
      const result = updateRoleSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Role must be either FOUNDER or MEMBER')
      }
    })

    it('rejects lowercase role value', () => {
      const invalidData = { role: 'founder' }
      const result = updateRoleSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects empty string', () => {
      const invalidData = { role: '' }
      const result = updateRoleSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects missing role field', () => {
      const invalidData = {}
      const result = updateRoleSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects null role', () => {
      const invalidData = { role: null }
      const result = updateRoleSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})
