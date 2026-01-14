import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    expense: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    approval: {
      create: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
    },
  },
}))

// Mock auth
vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(),
}))

import { POST } from '@/app/api/expenses/[id]/approve/route'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

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

// Helper to create mock expense
const createMockExpense = (overrides = {}) => ({
  id: 'expense-1',
  userId: 'user-2',
  date: new Date(),
  amount: { toNumber: () => 100 },
  description: 'Test expense',
  category: 'TRAVEL',
  status: 'PENDING_APPROVAL',
  receiptUrl: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  approvals: [],
  ...overrides,
})

describe('POST /api/expenses/[id]/approve', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/expenses/expense-1/approve', {
      method: 'POST',
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'expense-1' }) })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 404 when expense not found', async () => {
    const mockUser = createMockCurrentUser()
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(prisma.expense.findUnique).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/expenses/non-existent/approve', {
      method: 'POST',
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'non-existent' }) })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Expense not found')
  })

  it('returns 400 when approving own expense', async () => {
    const mockUser = createMockCurrentUser({ id: 'user-1' })
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    // Expense created by the same user trying to approve
    const mockExpense = createMockExpense({ userId: 'user-1' })
    vi.mocked(prisma.expense.findUnique).mockResolvedValue(mockExpense as never)

    const request = new NextRequest('http://localhost/api/expenses/expense-1/approve', {
      method: 'POST',
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'expense-1' }) })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Cannot approve your own expense')
  })

  it('returns 400 when already approved by user', async () => {
    const mockUser = createMockCurrentUser({ id: 'user-1' })
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    // Expense already has approval from this user
    const mockExpense = createMockExpense({
      userId: 'user-2',
      approvals: [
        {
          id: 'approval-1',
          expenseId: 'expense-1',
          userId: 'user-1',
          createdAt: new Date(),
          user: { id: 'user-1', name: 'Test User' },
        },
      ],
    })
    vi.mocked(prisma.expense.findUnique).mockResolvedValue(mockExpense as never)

    const request = new NextRequest('http://localhost/api/expenses/expense-1/approve', {
      method: 'POST',
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'expense-1' }) })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Already approved this expense')
  })

  it('returns 400 when user role is not FOUNDER', async () => {
    const mockUser = createMockCurrentUser({ id: 'user-1', role: 'EMPLOYEE' as const })
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const request = new NextRequest('http://localhost/api/expenses/expense-1/approve', {
      method: 'POST',
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'expense-1' }) })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Only founders can approve expenses')
  })

  it('creates approval record on success', async () => {
    const mockUser = createMockCurrentUser({ id: 'user-1' })
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const mockExpense = createMockExpense({ userId: 'user-2', approvals: [] })
    vi.mocked(prisma.expense.findUnique)
      .mockResolvedValueOnce(mockExpense as never)
      .mockResolvedValueOnce({
        ...mockExpense,
        approvals: [
          {
            id: 'approval-1',
            expenseId: 'expense-1',
            userId: 'user-1',
            createdAt: new Date(),
            user: { id: 'user-1', name: 'Test User' },
          },
        ],
        user: { id: 'user-2', name: 'Creator' },
      } as never)

    vi.mocked(prisma.approval.create).mockResolvedValue({
      id: 'approval-1',
      expenseId: 'expense-1',
      userId: 'user-1',
      createdAt: new Date(),
    } as never)

    // Two founders: creator (user-2) and approver (user-1)
    vi.mocked(prisma.user.findMany).mockResolvedValue([{ id: 'user-1' }] as never)

    const request = new NextRequest('http://localhost/api/expenses/expense-1/approve', {
      method: 'POST',
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'expense-1' }) })

    expect(response.status).toBe(200)
    expect(prisma.approval.create).toHaveBeenCalledWith({
      data: {
        expenseId: 'expense-1',
        userId: 'user-1',
      },
    })
  })

  it('returns updated expense with approvals', async () => {
    const mockUser = createMockCurrentUser({ id: 'user-1' })
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const mockExpense = createMockExpense({ userId: 'user-2', approvals: [] })
    const updatedExpense = {
      ...mockExpense,
      status: 'APPROVED',
      approvals: [
        {
          id: 'approval-1',
          expenseId: 'expense-1',
          userId: 'user-1',
          createdAt: new Date(),
          user: { id: 'user-1', name: 'Test User' },
        },
      ],
      user: { id: 'user-2', name: 'Creator' },
    }

    vi.mocked(prisma.expense.findUnique)
      .mockResolvedValueOnce(mockExpense as never)
      .mockResolvedValueOnce(updatedExpense as never)

    vi.mocked(prisma.approval.create).mockResolvedValue({
      id: 'approval-1',
      expenseId: 'expense-1',
      userId: 'user-1',
      createdAt: new Date(),
    } as never)

    vi.mocked(prisma.user.findMany).mockResolvedValue([{ id: 'user-1' }] as never)
    vi.mocked(prisma.expense.update).mockResolvedValue(updatedExpense as never)

    const request = new NextRequest('http://localhost/api/expenses/expense-1/approve', {
      method: 'POST',
    })
    const response = await POST(request, { params: Promise.resolve({ id: 'expense-1' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('approvals')
    expect(data.approvals).toHaveLength(1)
    expect(data.approvals[0].user.id).toBe('user-1')
  })

  it('updates status to APPROVED when all founders have approved', async () => {
    const mockUser = createMockCurrentUser({ id: 'user-1' })
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const mockExpense = createMockExpense({ userId: 'user-2', approvals: [] })
    vi.mocked(prisma.expense.findUnique)
      .mockResolvedValueOnce(mockExpense as never)
      .mockResolvedValueOnce({
        ...mockExpense,
        status: 'APPROVED',
        approvals: [
          {
            id: 'approval-1',
            expenseId: 'expense-1',
            userId: 'user-1',
            createdAt: new Date(),
            user: { id: 'user-1', name: 'Test User' },
          },
        ],
        user: { id: 'user-2', name: 'Creator' },
      } as never)

    vi.mocked(prisma.approval.create).mockResolvedValue({
      id: 'approval-1',
      expenseId: 'expense-1',
      userId: 'user-1',
      createdAt: new Date(),
    } as never)

    // Only one founder besides the creator
    vi.mocked(prisma.user.findMany).mockResolvedValue([{ id: 'user-1' }] as never)

    const request = new NextRequest('http://localhost/api/expenses/expense-1/approve', {
      method: 'POST',
    })
    await POST(request, { params: Promise.resolve({ id: 'expense-1' }) })

    // Should update status to APPROVED
    expect(prisma.expense.update).toHaveBeenCalledWith({
      where: { id: 'expense-1' },
      data: { status: 'APPROVED' },
    })
  })

  it('does not update status when more approvals needed', async () => {
    const mockUser = createMockCurrentUser({ id: 'user-1' })
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const mockExpense = createMockExpense({ userId: 'user-3', approvals: [] })
    vi.mocked(prisma.expense.findUnique)
      .mockResolvedValueOnce(mockExpense as never)
      .mockResolvedValueOnce({
        ...mockExpense,
        approvals: [
          {
            id: 'approval-1',
            expenseId: 'expense-1',
            userId: 'user-1',
            createdAt: new Date(),
            user: { id: 'user-1', name: 'Test User' },
          },
        ],
        user: { id: 'user-3', name: 'Creator' },
      } as never)

    vi.mocked(prisma.approval.create).mockResolvedValue({
      id: 'approval-1',
      expenseId: 'expense-1',
      userId: 'user-1',
      createdAt: new Date(),
    } as never)

    // Two founders besides the creator (need 2 approvals, only have 1)
    vi.mocked(prisma.user.findMany).mockResolvedValue([
      { id: 'user-1' },
      { id: 'user-2' },
    ] as never)

    const request = new NextRequest('http://localhost/api/expenses/expense-1/approve', {
      method: 'POST',
    })
    await POST(request, { params: Promise.resolve({ id: 'expense-1' }) })

    // Should NOT update status since more approvals needed
    expect(prisma.expense.update).not.toHaveBeenCalled()
  })
})
