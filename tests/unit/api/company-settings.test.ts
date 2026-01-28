import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    companySettings: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}))

// Mock auth
vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(),
}))

import { GET, PATCH } from '@/app/api/company-settings/route'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

const createMockUser = (overrides = {}) => ({
  id: 'user-1',
  name: 'Test Founder',
  email: 'founder@example.com',
  avatarInitials: 'TF',
  role: 'FOUNDER' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

const createMockSettings = (overrides = {}) => ({
  id: 'settings-1',
  name: 'Acme Corp',
  currency: 'USD',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  ...overrides,
})

describe('GET /api/company-settings', () => {
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

  it('returns existing settings for authenticated user', async () => {
    const mockUser = createMockUser()
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const mockSettings = createMockSettings()
    vi.mocked(prisma.companySettings.findFirst).mockResolvedValue(mockSettings as never)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.name).toBe('Acme Corp')
    expect(data.currency).toBe('USD')
  })

  it('creates default settings if none exist', async () => {
    const mockUser = createMockUser()
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    vi.mocked(prisma.companySettings.findFirst).mockResolvedValue(null)

    const defaultSettings = createMockSettings({ name: '', currency: 'USD' })
    vi.mocked(prisma.companySettings.create).mockResolvedValue(defaultSettings as never)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(prisma.companySettings.create).toHaveBeenCalledWith({
      data: { name: '', currency: 'USD' },
    })
    expect(data.currency).toBe('USD')
  })

  it('allows MEMBER role to access settings', async () => {
    const mockUser = createMockUser({ role: 'MEMBER' as const })
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const mockSettings = createMockSettings()
    vi.mocked(prisma.companySettings.findFirst).mockResolvedValue(mockSettings as never)

    const response = await GET()

    expect(response.status).toBe(200)
  })
})

describe('PATCH /api/company-settings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/company-settings', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'New Name' }),
    })
    const response = await PATCH(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 403 when user is MEMBER', async () => {
    const mockUser = createMockUser({ role: 'MEMBER' as const })
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const request = new NextRequest('http://localhost/api/company-settings', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'New Name' }),
    })
    const response = await PATCH(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Only founders can update company settings')
  })

  it('returns 400 for invalid currency', async () => {
    const mockUser = createMockUser()
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const request = new NextRequest('http://localhost/api/company-settings', {
      method: 'PATCH',
      body: JSON.stringify({ currency: 'BTC' }),
    })
    const response = await PATCH(request)

    expect(response.status).toBe(400)
  })

  it('returns 400 for name exceeding 100 characters', async () => {
    const mockUser = createMockUser()
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const request = new NextRequest('http://localhost/api/company-settings', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'A'.repeat(101) }),
    })
    const response = await PATCH(request)

    expect(response.status).toBe(400)
  })

  it('updates settings when called by FOUNDER with valid data', async () => {
    const mockUser = createMockUser()
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const existingSettings = createMockSettings()
    vi.mocked(prisma.companySettings.findFirst).mockResolvedValue(existingSettings as never)

    const updatedSettings = createMockSettings({ name: 'New Corp', currency: 'GBP' })
    vi.mocked(prisma.companySettings.update).mockResolvedValue(updatedSettings as never)

    const request = new NextRequest('http://localhost/api/company-settings', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'New Corp', currency: 'GBP' }),
    })
    const response = await PATCH(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.name).toBe('New Corp')
    expect(data.currency).toBe('GBP')
    expect(prisma.companySettings.update).toHaveBeenCalledWith({
      where: { id: 'settings-1' },
      data: { name: 'New Corp', currency: 'GBP' },
    })
  })

  it('supports partial update with only name', async () => {
    const mockUser = createMockUser()
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const existingSettings = createMockSettings()
    vi.mocked(prisma.companySettings.findFirst).mockResolvedValue(existingSettings as never)

    const updatedSettings = createMockSettings({ name: 'Updated Name' })
    vi.mocked(prisma.companySettings.update).mockResolvedValue(updatedSettings as never)

    const request = new NextRequest('http://localhost/api/company-settings', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Updated Name' }),
    })
    const response = await PATCH(request)

    expect(response.status).toBe(200)
    expect(prisma.companySettings.update).toHaveBeenCalledWith({
      where: { id: 'settings-1' },
      data: { name: 'Updated Name' },
    })
  })

  it('supports partial update with only currency', async () => {
    const mockUser = createMockUser()
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

    const existingSettings = createMockSettings()
    vi.mocked(prisma.companySettings.findFirst).mockResolvedValue(existingSettings as never)

    const updatedSettings = createMockSettings({ currency: 'EUR' })
    vi.mocked(prisma.companySettings.update).mockResolvedValue(updatedSettings as never)

    const request = new NextRequest('http://localhost/api/company-settings', {
      method: 'PATCH',
      body: JSON.stringify({ currency: 'EUR' }),
    })
    const response = await PATCH(request)

    expect(response.status).toBe(200)
    expect(prisma.companySettings.update).toHaveBeenCalledWith({
      where: { id: 'settings-1' },
      data: { currency: 'EUR' },
    })
  })
})
