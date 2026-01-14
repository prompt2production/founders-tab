import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { ExpenseStatus } from '@prisma/client'

export async function GET() {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all users with their APPROVED expense totals only
    const usersWithTotals = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        expenses: {
          where: {
            status: ExpenseStatus.APPROVED,
          },
          select: {
            amount: true,
          },
        },
      },
    })

    // Calculate totals for each user (only approved expenses)
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
