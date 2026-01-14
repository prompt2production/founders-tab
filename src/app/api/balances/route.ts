import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { ExpenseStatus } from '@prisma/client'

// Predefined filter presets
const STATUS_PRESETS: Record<string, ExpenseStatus[]> = {
  owed: [ExpenseStatus.APPROVED, ExpenseStatus.WITHDRAWAL_REQUESTED, ExpenseStatus.WITHDRAWAL_APPROVED],
  approved: [ExpenseStatus.APPROVED],
  pending: [ExpenseStatus.PENDING_APPROVAL],
  active: [ExpenseStatus.PENDING_APPROVAL, ExpenseStatus.APPROVED, ExpenseStatus.WITHDRAWAL_REQUESTED, ExpenseStatus.WITHDRAWAL_APPROVED],
  all: [ExpenseStatus.PENDING_APPROVAL, ExpenseStatus.APPROVED, ExpenseStatus.WITHDRAWAL_REQUESTED, ExpenseStatus.WITHDRAWAL_APPROVED, ExpenseStatus.RECEIVED],
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get filter from query params (default to 'owed')
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'owed'
    const statuses = STATUS_PRESETS[filter] || STATUS_PRESETS.owed

    // Get all users with their expense totals for selected statuses
    const usersWithTotals = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        expenses: {
          where: {
            status: { in: statuses },
          },
          select: {
            amount: true,
          },
        },
      },
    })

    // Calculate totals for each user based on selected filter
    const balances = usersWithTotals.map((u) => {
      const total = u.expenses.reduce((sum, expense) => {
        return sum + (expense.amount?.toNumber() || 0)
      }, 0)

      return {
        user: {
          id: u.id,
          name: u.name,
          email: u.email,
        },
        total,
        expenseCount: u.expenses.length,
        percentage: 0, // Will be calculated after we have teamTotal
      }
    })

    // Calculate team total
    const teamTotal = balances.reduce((sum, b) => sum + b.total, 0)

    // Calculate percentages and sort by total descending
    const balancesWithPercentage = balances
      .map((b) => ({
        ...b,
        percentage: teamTotal > 0 ? (b.total / teamTotal) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total)

    return NextResponse.json({
      teamTotal,
      balances: balancesWithPercentage,
    })
  } catch (error) {
    console.error('Error fetching balances:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
