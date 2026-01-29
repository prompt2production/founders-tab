import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    expense: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    withdrawalApproval: {
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

// Mock company utilities
vi.mock('@/lib/company', () => ({
  isExpenseInCompany: vi.fn().mockResolvedValue(true),
}))

import { POST as requestWithdrawal } from '@/app/api/expenses/[id]/request-withdrawal/route'
import { POST as approveWithdrawal } from '@/app/api/expenses/[id]/approve-withdrawal/route'
import { POST as confirmReceipt } from '@/app/api/expenses/[id]/confirm-receipt/route'
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

// Helper to create mock expense
const createMockExpense = (overrides = {}) => ({
  id: 'expense-1',
  userId: 'user-1',
  date: new Date(),
  amount: { toNumber: () => 100 },
  description: 'Test expense',
  category: 'TRAVEL',
  status: 'APPROVED',
  receiptUrl: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  approvals: [],
  withdrawalApprovals: [],
  user: { id: 'user-1', name: 'Test User' },
  ...overrides,
})

describe('POST /api/expenses/[id]/request-withdrawal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/expenses/expense-1/request-withdrawal', {
      method: 'POST',
    })
    const response = await requestWithdrawal(request, { params: Promise.resolve({ id: 'expense-1' }) })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 404 when expense not found', async () => {
    const mockUser = createMockCurrentUser()
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(prisma.expense.findUnique).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/expenses/non-existent/request-withdrawal', {
      method: 'POST',
    })
    const response = await requestWithdrawal(request, { params: Promise.resolve({ id: 'non-existent' }) })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Expense not found')
  })

  it('returns 400 when user is not expense owner', async () => {
    const mockUser = createMockCurrentUser({ id: 'user-1' })
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const mockExpense = createMockExpense({ userId: 'user-2' })
    vi.mocked(prisma.expense.findUnique).mockResolvedValue(mockExpense as never)

    const request = new NextRequest('http://localhost/api/expenses/expense-1/request-withdrawal', {
      method: 'POST',
    })
    const response = await requestWithdrawal(request, { params: Promise.resolve({ id: 'expense-1' }) })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Only the expense owner can request withdrawal')
  })

  it('returns 400 when expense is not APPROVED', async () => {
    const mockUser = createMockCurrentUser({ id: 'user-1' })
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const mockExpense = createMockExpense({ status: 'PENDING_APPROVAL' })
    vi.mocked(prisma.expense.findUnique).mockResolvedValue(mockExpense as never)

    const request = new NextRequest('http://localhost/api/expenses/expense-1/request-withdrawal', {
      method: 'POST',
    })
    const response = await requestWithdrawal(request, { params: Promise.resolve({ id: 'expense-1' }) })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Only approved expenses can be withdrawn')
  })

  it('updates status to WITHDRAWAL_REQUESTED on success', async () => {
    const mockUser = createMockCurrentUser({ id: 'user-1' })
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const mockExpense = createMockExpense()
    vi.mocked(prisma.expense.findUnique).mockResolvedValue(mockExpense as never)

    // Other founders exist
    vi.mocked(prisma.user.findMany).mockResolvedValue([{ id: 'user-2' }] as never)

    const updatedExpense = { ...mockExpense, status: 'WITHDRAWAL_REQUESTED' }
    vi.mocked(prisma.expense.update).mockResolvedValue(updatedExpense as never)

    const request = new NextRequest('http://localhost/api/expenses/expense-1/request-withdrawal', {
      method: 'POST',
    })
    const response = await requestWithdrawal(request, { params: Promise.resolve({ id: 'expense-1' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(prisma.expense.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'expense-1' },
      data: { status: 'WITHDRAWAL_REQUESTED' },
    }))
    expect(data.autoApproved).toBe(false)
  })

  it('auto-approves when no other founders exist', async () => {
    const mockUser = createMockCurrentUser({ id: 'user-1' })
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const mockExpense = createMockExpense()
    vi.mocked(prisma.expense.findUnique).mockResolvedValue(mockExpense as never)

    // No other founders
    vi.mocked(prisma.user.findMany).mockResolvedValue([] as never)

    const updatedExpense = { ...mockExpense, status: 'WITHDRAWAL_APPROVED' }
    vi.mocked(prisma.expense.update).mockResolvedValue(updatedExpense as never)

    const request = new NextRequest('http://localhost/api/expenses/expense-1/request-withdrawal', {
      method: 'POST',
    })
    const response = await requestWithdrawal(request, { params: Promise.resolve({ id: 'expense-1' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(prisma.expense.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'expense-1' },
      data: { status: 'WITHDRAWAL_APPROVED' },
    }))
    expect(data.autoApproved).toBe(true)
  })
})

describe('POST /api/expenses/[id]/approve-withdrawal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/expenses/expense-1/approve-withdrawal', {
      method: 'POST',
    })
    const response = await approveWithdrawal(request, { params: Promise.resolve({ id: 'expense-1' }) })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 400 when user is not FOUNDER', async () => {
    const mockUser = createMockCurrentUser({ role: 'MEMBER' as never })
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const request = new NextRequest('http://localhost/api/expenses/expense-1/approve-withdrawal', {
      method: 'POST',
    })
    const response = await approveWithdrawal(request, { params: Promise.resolve({ id: 'expense-1' }) })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Only founders can approve withdrawals')
  })

  it('returns 404 when expense not found', async () => {
    const mockUser = createMockCurrentUser()
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(prisma.expense.findUnique).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/expenses/non-existent/approve-withdrawal', {
      method: 'POST',
    })
    const response = await approveWithdrawal(request, { params: Promise.resolve({ id: 'non-existent' }) })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Expense not found')
  })

  it('returns 400 when expense is not WITHDRAWAL_REQUESTED', async () => {
    const mockUser = createMockCurrentUser({ id: 'user-2' })
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const mockExpense = createMockExpense({ userId: 'user-1', status: 'APPROVED' })
    vi.mocked(prisma.expense.findUnique).mockResolvedValue(mockExpense as never)

    const request = new NextRequest('http://localhost/api/expenses/expense-1/approve-withdrawal', {
      method: 'POST',
    })
    const response = await approveWithdrawal(request, { params: Promise.resolve({ id: 'expense-1' }) })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Expense is not in withdrawal requested status')
  })

  it('returns 400 when user is expense owner', async () => {
    const mockUser = createMockCurrentUser({ id: 'user-1' })
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const mockExpense = createMockExpense({ userId: 'user-1', status: 'WITHDRAWAL_REQUESTED' })
    vi.mocked(prisma.expense.findUnique).mockResolvedValue(mockExpense as never)

    const request = new NextRequest('http://localhost/api/expenses/expense-1/approve-withdrawal', {
      method: 'POST',
    })
    const response = await approveWithdrawal(request, { params: Promise.resolve({ id: 'expense-1' }) })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Cannot approve your own withdrawal request')
  })

  it('returns 400 when already approved', async () => {
    const mockUser = createMockCurrentUser({ id: 'user-2' })
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const mockExpense = createMockExpense({
      userId: 'user-1',
      status: 'WITHDRAWAL_REQUESTED',
      withdrawalApprovals: [{ userId: 'user-2', user: { id: 'user-2', name: 'User 2' } }],
    })
    vi.mocked(prisma.expense.findUnique).mockResolvedValue(mockExpense as never)

    const request = new NextRequest('http://localhost/api/expenses/expense-1/approve-withdrawal', {
      method: 'POST',
    })
    const response = await approveWithdrawal(request, { params: Promise.resolve({ id: 'expense-1' }) })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Already approved this withdrawal')
  })

  it('creates withdrawal approval on success', async () => {
    const mockUser = createMockCurrentUser({ id: 'user-2' })
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const mockExpense = createMockExpense({
      userId: 'user-1',
      status: 'WITHDRAWAL_REQUESTED',
      withdrawalApprovals: [],
    })
    vi.mocked(prisma.expense.findUnique)
      .mockResolvedValueOnce(mockExpense as never)
      .mockResolvedValueOnce({ ...mockExpense, withdrawalApprovals: [{ userId: 'user-2' }] } as never)

    vi.mocked(prisma.withdrawalApproval.create).mockResolvedValue({} as never)
    vi.mocked(prisma.user.findMany).mockResolvedValue([{ id: 'user-2' }] as never)

    const request = new NextRequest('http://localhost/api/expenses/expense-1/approve-withdrawal', {
      method: 'POST',
    })
    const response = await approveWithdrawal(request, { params: Promise.resolve({ id: 'expense-1' }) })

    expect(response.status).toBe(200)
    expect(prisma.withdrawalApproval.create).toHaveBeenCalledWith({
      data: {
        expenseId: 'expense-1',
        userId: 'user-2',
      },
    })
  })
})

describe('POST /api/expenses/[id]/confirm-receipt', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/expenses/expense-1/confirm-receipt', {
      method: 'POST',
    })
    const response = await confirmReceipt(request, { params: Promise.resolve({ id: 'expense-1' }) })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 404 when expense not found', async () => {
    const mockUser = createMockCurrentUser()
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(prisma.expense.findUnique).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/expenses/non-existent/confirm-receipt', {
      method: 'POST',
    })
    const response = await confirmReceipt(request, { params: Promise.resolve({ id: 'non-existent' }) })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Expense not found')
  })

  it('returns 400 when user is not expense owner', async () => {
    const mockUser = createMockCurrentUser({ id: 'user-2' })
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const mockExpense = createMockExpense({ userId: 'user-1', status: 'WITHDRAWAL_APPROVED' })
    vi.mocked(prisma.expense.findUnique).mockResolvedValue(mockExpense as never)

    const request = new NextRequest('http://localhost/api/expenses/expense-1/confirm-receipt', {
      method: 'POST',
    })
    const response = await confirmReceipt(request, { params: Promise.resolve({ id: 'expense-1' }) })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Only the expense owner can confirm receipt')
  })

  it('returns 400 when expense is not WITHDRAWAL_APPROVED', async () => {
    const mockUser = createMockCurrentUser({ id: 'user-1' })
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const mockExpense = createMockExpense({ userId: 'user-1', status: 'WITHDRAWAL_REQUESTED' })
    vi.mocked(prisma.expense.findUnique).mockResolvedValue(mockExpense as never)

    const request = new NextRequest('http://localhost/api/expenses/expense-1/confirm-receipt', {
      method: 'POST',
    })
    const response = await confirmReceipt(request, { params: Promise.resolve({ id: 'expense-1' }) })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Withdrawal must be approved before confirming receipt')
  })

  it('updates status to RECEIVED on success', async () => {
    const mockUser = createMockCurrentUser({ id: 'user-1' })
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const mockExpense = createMockExpense({ userId: 'user-1', status: 'WITHDRAWAL_APPROVED' })
    vi.mocked(prisma.expense.findUnique).mockResolvedValue(mockExpense as never)

    const updatedExpense = { ...mockExpense, status: 'RECEIVED' }
    vi.mocked(prisma.expense.update).mockResolvedValue(updatedExpense as never)

    const request = new NextRequest('http://localhost/api/expenses/expense-1/confirm-receipt', {
      method: 'POST',
    })
    const response = await confirmReceipt(request, { params: Promise.resolve({ id: 'expense-1' }) })

    expect(response.status).toBe(200)
    expect(prisma.expense.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'expense-1' },
      data: { status: 'RECEIVED' },
    }))
  })
})
