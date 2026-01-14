import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}))

// Mock auth
vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(),
}))

import { GET as getBalances } from '@/app/api/balances/route'
import { GET as getUserBalance } from '@/app/api/balances/[userId]/route'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// Helper to create Decimal-like object
const createDecimal = (value: number) => ({
  toNumber: () => value,
})

// Helper to create mock current user
const createMockCurrentUser = (overrides = {}) => ({
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  avatarInitials: 'TU',
  role: 'FOUNDER' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

describe('GET /api/balances', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null)

    const response = await getBalances()
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns correct response structure for team balances', async () => {
    const mockUser = createMockCurrentUser()
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const mockUsersWithExpenses = [
      {
        id: 'user-1',
        name: 'Alice',
        email: 'alice@example.com',
        expenses: [
          { amount: createDecimal(100) },
          { amount: createDecimal(50) },
        ],
      },
      {
        id: 'user-2',
        name: 'Bob',
        email: 'bob@example.com',
        expenses: [
          { amount: createDecimal(200) },
        ],
      },
    ]
    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsersWithExpenses as never)

    const response = await getBalances()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('teamTotal')
    expect(data).toHaveProperty('balances')
    expect(data.teamTotal).toBe(350)
    expect(data.balances).toHaveLength(2)

    // Check balance structure
    data.balances.forEach((balance: { user: object; total: number; expenseCount: number; percentage: number }) => {
      expect(balance).toHaveProperty('user')
      expect(balance).toHaveProperty('total')
      expect(balance).toHaveProperty('expenseCount')
      expect(balance).toHaveProperty('percentage')
      expect(balance.user).toHaveProperty('id')
      expect(balance.user).toHaveProperty('name')
      expect(balance.user).toHaveProperty('email')
    })
  })

  it('sorts balances by total descending', async () => {
    const mockUser = createMockCurrentUser()
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const mockUsersWithExpenses = [
      {
        id: 'user-1',
        name: 'Alice',
        email: 'alice@example.com',
        expenses: [{ amount: createDecimal(100) }],
      },
      {
        id: 'user-2',
        name: 'Bob',
        email: 'bob@example.com',
        expenses: [{ amount: createDecimal(300) }],
      },
      {
        id: 'user-3',
        name: 'Charlie',
        email: 'charlie@example.com',
        expenses: [{ amount: createDecimal(200) }],
      },
    ]
    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsersWithExpenses as never)

    const response = await getBalances()
    const data = await response.json()

    expect(data.balances[0].user.name).toBe('Bob')
    expect(data.balances[0].total).toBe(300)
    expect(data.balances[1].user.name).toBe('Charlie')
    expect(data.balances[1].total).toBe(200)
    expect(data.balances[2].user.name).toBe('Alice')
    expect(data.balances[2].total).toBe(100)
  })

  it('calculates percentage correctly', async () => {
    const mockUser = createMockCurrentUser()
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const mockUsersWithExpenses = [
      {
        id: 'user-1',
        name: 'Alice',
        email: 'alice@example.com',
        expenses: [{ amount: createDecimal(50) }],
      },
      {
        id: 'user-2',
        name: 'Bob',
        email: 'bob@example.com',
        expenses: [{ amount: createDecimal(50) }],
      },
    ]
    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsersWithExpenses as never)

    const response = await getBalances()
    const data = await response.json()

    expect(data.teamTotal).toBe(100)
    expect(data.balances[0].percentage).toBe(50)
    expect(data.balances[1].percentage).toBe(50)
  })
})

describe('GET /api/balances/[userId]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/balances/user-1')
    const response = await getUserBalance(request, { params: Promise.resolve({ userId: 'user-1' }) })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 404 when user not found', async () => {
    const mockUser = createMockCurrentUser()
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/balances/non-existent')
    const response = await getUserBalance(request, { params: Promise.resolve({ userId: 'non-existent' }) })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('User not found')
  })

  it('returns correct response structure for user balance', async () => {
    const mockCurrentUser = createMockCurrentUser()
    vi.mocked(getCurrentUser).mockResolvedValue(mockCurrentUser)

    const mockUserWithExpenses = {
      id: 'user-1',
      name: 'Alice',
      email: 'alice@example.com',
      expenses: [
        { amount: createDecimal(100), category: 'TRAVEL', date: new Date('2026-01-10') },
        { amount: createDecimal(50), category: 'TRAVEL', date: new Date('2026-01-05') },
        { amount: createDecimal(200), category: 'SOFTWARE', date: new Date('2025-12-15') },
      ],
    }
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUserWithExpenses as never)

    const request = new NextRequest('http://localhost/api/balances/user-1')
    const response = await getUserBalance(request, { params: Promise.resolve({ userId: 'user-1' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('user')
    expect(data).toHaveProperty('total')
    expect(data).toHaveProperty('expenseCount')
    expect(data).toHaveProperty('byCategory')
    expect(data).toHaveProperty('byMonth')

    expect(data.user).toEqual({
      id: 'user-1',
      name: 'Alice',
      email: 'alice@example.com',
    })
    expect(data.total).toBe(350)
    expect(data.expenseCount).toBe(3)

    // Check byCategory structure
    expect(Array.isArray(data.byCategory)).toBe(true)
    data.byCategory.forEach((cat: { category: string; total: number; count: number }) => {
      expect(cat).toHaveProperty('category')
      expect(cat).toHaveProperty('total')
      expect(cat).toHaveProperty('count')
    })

    // Check byMonth structure
    expect(Array.isArray(data.byMonth)).toBe(true)
    expect(data.byMonth.length).toBe(12)
    data.byMonth.forEach((month: { month: string; total: number }) => {
      expect(month).toHaveProperty('month')
      expect(month).toHaveProperty('total')
      expect(month.month).toMatch(/^\d{4}-\d{2}$/)
    })
  })

  it('groups expenses by category correctly', async () => {
    const mockCurrentUser = createMockCurrentUser()
    vi.mocked(getCurrentUser).mockResolvedValue(mockCurrentUser)

    const mockUserWithExpenses = {
      id: 'user-1',
      name: 'Alice',
      email: 'alice@example.com',
      expenses: [
        { amount: createDecimal(100), category: 'TRAVEL', date: new Date() },
        { amount: createDecimal(50), category: 'TRAVEL', date: new Date() },
        { amount: createDecimal(200), category: 'SOFTWARE', date: new Date() },
      ],
    }
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUserWithExpenses as never)

    const request = new NextRequest('http://localhost/api/balances/user-1')
    const response = await getUserBalance(request, { params: Promise.resolve({ userId: 'user-1' }) })
    const data = await response.json()

    expect(data.byCategory).toHaveLength(2)

    // Should be sorted by total descending
    const softwareCategory = data.byCategory.find((c: { category: string }) => c.category === 'SOFTWARE')
    const travelCategory = data.byCategory.find((c: { category: string }) => c.category === 'TRAVEL')

    expect(softwareCategory.total).toBe(200)
    expect(softwareCategory.count).toBe(1)
    expect(travelCategory.total).toBe(150)
    expect(travelCategory.count).toBe(2)
  })
})
