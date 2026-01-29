import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
    },
  },
}))

// Mock auth
vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(),
}))

import { GET } from '@/app/api/users/route'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// Helper to create mock current user
const createMockCurrentUser = (overrides = {}) => ({
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  avatarInitials: 'TU',
  role: 'FOUNDER' as const,
  companyId: 'company-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

describe('GET /api/users', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns users with correct fields when authenticated', async () => {
    const mockUser = createMockCurrentUser()
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const mockUsers = [
      { id: 'user-1', name: 'Alice', email: 'alice@example.com' },
      { id: 'user-2', name: 'Bob', email: 'bob@example.com' },
      { id: 'user-3', name: 'Charlie', email: 'charlie@example.com' },
    ]
    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as never)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockUsers)
    expect(data).toHaveLength(3)

    // Verify each user has correct fields
    data.forEach((user: { id: string; name: string; email: string }) => {
      expect(user).toHaveProperty('id')
      expect(user).toHaveProperty('name')
      expect(user).toHaveProperty('email')
      // Should NOT have password or other sensitive data
      expect(user).not.toHaveProperty('password')
      expect(user).not.toHaveProperty('passwordHash')
    })
  })

  it('calls prisma with correct select, where and orderBy', async () => {
    const mockUser = createMockCurrentUser()
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(prisma.user.findMany).mockResolvedValue([] as never)

    await GET()

    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: {
        companyId: 'company-1',
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: 'asc' },
    })
  })

  it('returns empty array when no users exist', async () => {
    const mockUser = createMockCurrentUser()
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(prisma.user.findMany).mockResolvedValue([] as never)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual([])
  })
})
