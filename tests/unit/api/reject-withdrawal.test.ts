import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    expense: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(),
}))

import { POST } from '@/app/api/expenses/[id]/reject-withdrawal/route'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

const createMockCurrentUser = (overrides = {}) => ({
  id: 'user-1',
  name: 'Test Founder',
  email: 'founder@example.com',
  avatarInitials: 'TF',
  role: 'FOUNDER' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

const createMockExpense = (overrides = {}) => ({
  id: 'expense-1',
  userId: 'user-2',
  date: new Date(),
  amount: { toNumber: () => 100 },
  description: 'Test expense',
  category: 'TRAVEL',
  status: 'WITHDRAWAL_REQUESTED',
  receiptUrl: null,
  notes: null,
  rejectedById: null,
  rejectedAt: null,
  rejectionReason: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

const makeRequest = (body: Record<string, unknown>) =>
  new NextRequest('http://localhost/api/expenses/expense-1/reject-withdrawal', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })

describe('POST /api/expenses/[id]/reject-withdrawal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null)

    const request = makeRequest({ reason: 'Not valid' })
    const response = await POST(request, { params: Promise.resolve({ id: 'expense-1' }) })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 403 when user is not a FOUNDER', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(
      createMockCurrentUser({ role: 'MEMBER' })
    )

    const request = makeRequest({ reason: 'Not valid' })
    const response = await POST(request, { params: Promise.resolve({ id: 'expense-1' }) })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Only founders can reject withdrawals')
  })

  it('returns 404 when expense not found', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(createMockCurrentUser())
    vi.mocked(prisma.expense.findUnique).mockResolvedValue(null)

    const request = makeRequest({ reason: 'Not valid' })
    const response = await POST(request, { params: Promise.resolve({ id: 'non-existent' }) })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Expense not found')
  })

  it('returns 403 when rejecting own withdrawal', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(createMockCurrentUser({ id: 'user-1' }))
    vi.mocked(prisma.expense.findUnique).mockResolvedValue(
      createMockExpense({ userId: 'user-1' }) as never
    )

    const request = makeRequest({ reason: 'Not valid' })
    const response = await POST(request, { params: Promise.resolve({ id: 'expense-1' }) })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Cannot reject your own withdrawal request')
  })

  it('returns 400 when expense is not in withdrawal requested status', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(createMockCurrentUser())
    vi.mocked(prisma.expense.findUnique).mockResolvedValue(
      createMockExpense({ status: 'APPROVED' }) as never
    )

    const request = makeRequest({ reason: 'Not valid' })
    const response = await POST(request, { params: Promise.resolve({ id: 'expense-1' }) })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Expense is not in withdrawal requested status')
  })

  it('returns 400 when reason is missing', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(createMockCurrentUser())

    const request = new NextRequest('http://localhost/api/expenses/expense-1/reject-withdrawal', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'expense-1' }) })

    expect(response.status).toBe(400)
  })

  it('rejects withdrawal successfully with reason', async () => {
    const mockUser = createMockCurrentUser({ id: 'user-1' })
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(prisma.expense.findUnique).mockResolvedValue(
      createMockExpense({ userId: 'user-2' }) as never
    )

    const updatedExpense = {
      ...createMockExpense(),
      status: 'WITHDRAWAL_REJECTED',
      rejectedById: 'user-1',
      rejectedAt: new Date(),
      rejectionReason: 'Need more documentation',
      user: { id: 'user-2', name: 'Creator' },
      rejectedBy: { id: 'user-1', name: 'Test Founder' },
    }
    vi.mocked(prisma.expense.update).mockResolvedValue(updatedExpense as never)

    const request = makeRequest({ reason: 'Need more documentation' })
    const response = await POST(request, { params: Promise.resolve({ id: 'expense-1' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(prisma.expense.update).toHaveBeenCalledWith({
      where: { id: 'expense-1' },
      data: {
        status: 'WITHDRAWAL_REJECTED',
        rejectedById: 'user-1',
        rejectedAt: expect.any(Date),
        rejectionReason: 'Need more documentation',
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        rejectedBy: { select: { id: true, name: true } },
      },
    })
    expect(data.rejectedBy).toEqual({ id: 'user-1', name: 'Test Founder' })
  })
})
