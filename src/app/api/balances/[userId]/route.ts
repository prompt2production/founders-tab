import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

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

    // Get user with expenses
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        expenses: {
          select: {
            amount: true,
            category: true,
            date: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate total and expense count
    const total = user.expenses.reduce((sum, expense) => {
      return sum + (expense.amount?.toNumber() || 0)
    }, 0)
    const expenseCount = user.expenses.length

    // Calculate breakdown by category
    const categoryMap = new Map<string, { total: number; count: number }>()
    user.expenses.forEach((expense) => {
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

    // Calculate breakdown by month (last 12 months)
    const monthMap = new Map<string, number>()

    // Initialize last 12 months with 0
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthMap.set(monthKey, 0)
    }

    // Populate with actual expense data
    user.expenses.forEach((expense) => {
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
      expenseCount,
      byCategory,
      byMonth,
    })
  } catch (error) {
    console.error('Error fetching user balance:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
