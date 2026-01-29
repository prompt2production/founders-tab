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

// Filters that already include PENDING_APPROVAL — no need to show pending subtext
const FILTERS_INCLUDING_PENDING = new Set(['pending', 'active', 'all'])

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

    // Determine whether we need to separately fetch pending expenses
    const filterIncludesPending = FILTERS_INCLUDING_PENDING.has(filter)

    // Build the status list for the query: include PENDING_APPROVAL if not already present
    const queryStatuses = filterIncludesPending
      ? statuses
      : [...new Set([...statuses, ExpenseStatus.PENDING_APPROVAL])]

    // Get all users in the same company with their expense totals
    const usersWithTotals = await prisma.user.findMany({
      where: {
        companyId: user.companyId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        expenses: {
          where: {
            status: { in: queryStatuses },
          },
          select: {
            amount: true,
            status: true,
          },
        },
      },
    })

    // Calculate totals for each user, splitting main vs pending
    const balances = usersWithTotals.map((u) => {
      let total = 0
      let pendingTotal = 0

      u.expenses.forEach((expense) => {
        const amount = expense.amount?.toNumber() || 0
        if (!filterIncludesPending && expense.status === ExpenseStatus.PENDING_APPROVAL) {
          pendingTotal += amount
        } else {
          total += amount
        }
      })

      return {
        user: {
          id: u.id,
          name: u.name,
          email: u.email,
        },
        total,
        pendingTotal,
        expenseCount: u.expenses.filter(
          (e) => filterIncludesPending || e.status !== ExpenseStatus.PENDING_APPROVAL
        ).length,
        percentage: 0, // Will be calculated after we have teamTotal
      }
    })

    // Calculate team totals
    const teamTotal = balances.reduce((sum, b) => sum + b.total, 0)
    const teamPendingTotal = balances.reduce((sum, b) => sum + b.pendingTotal, 0)

    // Calculate percentages and sort by total descending
    const balancesWithPercentage = balances
      .map((b) => ({
        ...b,
        percentage: teamTotal > 0 ? (b.total / teamTotal) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total)

    return NextResponse.json({
      teamTotal,
      pendingTotal: teamPendingTotal,
      balances: balancesWithPercentage,
    })
  } catch (error) {
    console.error('Error fetching balances:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
