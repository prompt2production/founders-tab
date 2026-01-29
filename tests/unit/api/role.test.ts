import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
    },
  },
}))

// Mock auth
vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(),
}))

import { PATCH } from '@/app/api/users/[id]/role/route'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// Helper to create mock current user
const createMockCurrentUser = (overrides = {}) => ({
  id: 'user-1',
  name: 'Test Founder',
  email: 'founder@example.com',
  avatarInitials: 'TF',
  role: 'FOUNDER' as const,
  companyId: 'company-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

// Helper to create mock target user
const createMockTargetUser = (overrides = {}) => ({
  id: 'user-2',
  name: 'Test Member',
  email: 'member@example.com',
  role: 'MEMBER' as const,
  companyId: 'company-1',
  ...overrides,
})

describe('PATCH /api/users/[id]/role', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/users/user-2/role', {
      method: 'PATCH',
      body: JSON.stringify({ role: 'FOUNDER' }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'user-2' }) })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 403 when requesting user is not a FOUNDER', async () => {
    const mockUser = createMockCurrentUser({ role: 'MEMBER' as const })
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const request = new NextRequest('http://localhost/api/users/user-2/role', {
      method: 'PATCH',
      body: JSON.stringify({ role: 'FOUNDER' }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'user-2' }) })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Only founders can change roles')
  })

  it('returns 404 when target user not found', async () => {
    const mockUser = createMockCurrentUser()
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/users/non-existent/role', {
      method: 'PATCH',
      body: JSON.stringify({ role: 'FOUNDER' }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'non-existent' }) })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('User not found')
  })

  it('returns 403 when attempting to demote the last founder', async () => {
    const mockUser = createMockCurrentUser()
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    // Target user is a FOUNDER
    const mockTargetUser = createMockTargetUser({ role: 'FOUNDER' as const })
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockTargetUser as never)

    // Only 1 founder exists
    vi.mocked(prisma.user.count).mockResolvedValue(1)

    const request = new NextRequest('http://localhost/api/users/user-2/role', {
      method: 'PATCH',
      body: JSON.stringify({ role: 'MEMBER' }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'user-2' }) })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Cannot demote the last founder')
  })

  it('successfully promotes a MEMBER to FOUNDER', async () => {
    const mockUser = createMockCurrentUser()
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const mockTargetUser = createMockTargetUser({ role: 'MEMBER' as const })
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockTargetUser as never)

    const updatedUser = { ...mockTargetUser, role: 'FOUNDER' }
    vi.mocked(prisma.user.update).mockResolvedValue(updatedUser as never)

    const request = new NextRequest('http://localhost/api/users/user-2/role', {
      method: 'PATCH',
      body: JSON.stringify({ role: 'FOUNDER' }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'user-2' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.role).toBe('FOUNDER')
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-2' },
      data: { role: 'FOUNDER' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })
  })

  it('successfully demotes a FOUNDER to MEMBER when multiple founders exist', async () => {
    const mockUser = createMockCurrentUser()
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const mockTargetUser = createMockTargetUser({ id: 'user-2', role: 'FOUNDER' as const })
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockTargetUser as never)

    // 2 founders exist
    vi.mocked(prisma.user.count).mockResolvedValue(2)

    const updatedUser = { ...mockTargetUser, role: 'MEMBER' }
    vi.mocked(prisma.user.update).mockResolvedValue(updatedUser as never)

    const request = new NextRequest('http://localhost/api/users/user-2/role', {
      method: 'PATCH',
      body: JSON.stringify({ role: 'MEMBER' }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'user-2' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.role).toBe('MEMBER')
  })

  it('returns 400 for invalid role value', async () => {
    const mockUser = createMockCurrentUser()
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const request = new NextRequest('http://localhost/api/users/user-2/role', {
      method: 'PATCH',
      body: JSON.stringify({ role: 'ADMIN' }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'user-2' }) })

    expect(response.status).toBe(400)
  })

  it('allows founder to demote themselves when other founders exist', async () => {
    const mockUser = createMockCurrentUser({ id: 'user-1' })
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    // Self-demotion - target is the current user
    const mockTargetUser = createMockTargetUser({ id: 'user-1', role: 'FOUNDER' as const })
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockTargetUser as never)

    // 2 founders exist
    vi.mocked(prisma.user.count).mockResolvedValue(2)

    const updatedUser = { ...mockTargetUser, role: 'MEMBER' }
    vi.mocked(prisma.user.update).mockResolvedValue(updatedUser as never)

    const request = new NextRequest('http://localhost/api/users/user-1/role', {
      method: 'PATCH',
      body: JSON.stringify({ role: 'MEMBER' }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'user-1' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.role).toBe('MEMBER')
  })
})
