import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { ExpenseStatus } from '@prisma/client'

// Predefined filter presets (same as main balances route)
const STATUS_PRESETS: Record<string, ExpenseStatus[]> = {
  owed: [ExpenseStatus.APPROVED, ExpenseStatus.WITHDRAWAL_REQUESTED, ExpenseStatus.WITHDRAWAL_APPROVED],
  approved: [ExpenseStatus.APPROVED],
  pending: [ExpenseStatus.PENDING_APPROVAL],
  active: [ExpenseStatus.PENDING_APPROVAL, ExpenseStatus.APPROVED, ExpenseStatus.WITHDRAWAL_REQUESTED, ExpenseStatus.WITHDRAWAL_APPROVED],
  all: [ExpenseStatus.PENDING_APPROVAL, ExpenseStatus.APPROVED, ExpenseStatus.WITHDRAWAL_REQUESTED, ExpenseStatus.WITHDRAWAL_APPROVED, ExpenseStatus.RECEIVED],
}

// Filters that already include PENDING_APPROVAL — no need to show pending subtext
const FILTERS_INCLUDING_PENDING = new Set(['pending', 'active', 'all'])

interface RouteParams {
  params: Promise<{ userId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await params

    // Get filter from query params (default to 'owed')
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'owed'
    const statuses = STATUS_PRESETS[filter] || STATUS_PRESETS.owed

    // Determine whether we need to separately fetch pending expenses
    const filterIncludesPending = FILTERS_INCLUDING_PENDING.has(filter)
    const queryStatuses = filterIncludesPending
      ? statuses
      : [...new Set([...statuses, ExpenseStatus.PENDING_APPROVAL])]

    // Get user with expenses for selected statuses
    // Only allow viewing users in the same company
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        companyId: true,
        expenses: {
          where: {
            status: { in: queryStatuses },
          },
          select: {
            amount: true,
            status: true,
            category: true,
            date: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify user is in the same company
    if (user.companyId !== currentUser.companyId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Split expenses into main (matching filter) and pending
    const mainExpenses = filterIncludesPending
      ? user.expenses
      : user.expenses.filter((e) => e.status !== ExpenseStatus.PENDING_APPROVAL)
    const pendingExpenses = filterIncludesPending
      ? []
      : user.expenses.filter((e) => e.status === ExpenseStatus.PENDING_APPROVAL)

    // Calculate total and expense count (main filter only)
    const total = mainExpenses.reduce((sum, expense) => {
      return sum + (expense.amount?.toNumber() || 0)
    }, 0)
    const expenseCount = mainExpenses.length

    // Calculate pending total
    const pendingTotal = pendingExpenses.reduce((sum, expense) => {
      return sum + (expense.amount?.toNumber() || 0)
    }, 0)

    // Calculate breakdown by category (main filter only)
    const categoryMap = new Map<string, { total: number; count: number }>()
    mainExpenses.forEach((expense) => {
      const category = expense.category
      const amount = expense.amount?.toNumber() || 0
      const existing = categoryMap.get(category) || { total: 0, count: 0 }
      categoryMap.set(category, {
        total: existing.total + amount,
        count: existing.count + 1,
      })
    })

    const byCategory = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
      }))
      .sort((a, b) => b.total - a.total)

    // Calculate breakdown by month (last 12 months, main filter only)
    const monthMap = new Map<string, number>()

    // Initialize last 12 months with 0
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthMap.set(monthKey, 0)
    }

    // Populate with actual expense data
    mainExpenses.forEach((expense) => {
      const date = new Date(expense.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (monthMap.has(monthKey)) {
        const existing = monthMap.get(monthKey) || 0
        monthMap.set(monthKey, existing + (expense.amount?.toNumber() || 0))
      }
    })

    const byMonth = Array.from(monthMap.entries())
      .map(([month, total]) => ({
        month,
        total,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      total,
      pendingTotal,
      expenseCount,
      byCategory,
      byMonth,
    })
  } catch (error) {
    console.error('Error fetching user balance:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
