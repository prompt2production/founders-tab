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
    const mockUser = { id: 'user-1', name: 'Test User', email: 'test@example.com' }
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const mockUsers = [
      { id: 'user-1', name: 'Alice', email: 'alice@example.com' },
      { id: 'user-2', name: 'Bob', email: 'bob@example.com' },
      { id: 'user-3', name: 'Charlie', email: 'charlie@example.com' },
    ]
    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers)

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

  it('calls prisma with correct select and orderBy', async () => {
    const mockUser = { id: 'user-1', name: 'Test User', email: 'test@example.com' }
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(prisma.user.findMany).mockResolvedValue([])

    await GET()

    expect(prisma.user.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: 'asc' },
    })
  })

  it('returns empty array when no users exist', async () => {
    const mockUser = { id: 'user-1', name: 'Test User', email: 'test@example.com' }
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(prisma.user.findMany).mockResolvedValue([])

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual([])
  })
})
