import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get start and end of current month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    // Get user's expenses this month
    const userExpenses = await prisma.expense.aggregate({
      where: {
        userId: user.id,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    })

    // Get all team expenses this month
    const teamExpenses = await prisma.expense.aggregate({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    })

    return NextResponse.json({
      userTotal: userExpenses._sum.amount?.toNumber() || 0,
      teamTotal: teamExpenses._sum.amount?.toNumber() || 0,
    })
  } catch (error) {
    console.error('Error fetching expense summary:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
