import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getCompanyUserIds, getFoundersCount } from '@/lib/company'
import { NudgeType } from '@prisma/client'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    // Get all company user IDs
    const companyUserIds = await getCompanyUserIds(user.companyId)
    const foundersCount = await getFoundersCount(user.companyId)
    const approvalsNeeded = Math.max(1, foundersCount - 1)

    // Get all founders in the company (for calculating pending approvers)
    const allFounders = await prisma.user.findMany({
      where: {
        companyId: user.companyId,
        role: 'FOUNDER',
      },
      select: { id: true, name: true },
    })

    // Run all queries in parallel for performance
    const [
      userExpensesSum,
      teamExpensesSum,
      userPendingCount,
      pendingApprovals,
      userPendingExpenses,
      monthlyTrend,
      categoryBreakdown,
      recentActivity,
    ] = await Promise.all([
      // User's total this month
      prisma.expense.aggregate({
        where: {
          userId: user.id,
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),

      // Team total this month
      prisma.expense.aggregate({
        where: {
          userId: { in: companyUserIds },
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),

      // User's pending expenses count
      prisma.expense.count({
        where: {
          userId: user.id,
          status: 'PENDING_APPROVAL',
        },
      }),

      // Expenses needing current user's approval (FOUNDER only)
      user.role === 'FOUNDER'
        ? prisma.expense.findMany({
            where: {
              userId: { in: companyUserIds, not: user.id },
              status: 'PENDING_APPROVAL',
              approvals: {
                none: { userId: user.id },
              },
            },
            include: {
              user: { select: { id: true, name: true } },
              approvals: { include: { user: { select: { id: true, name: true } } } },
            },
            orderBy: { createdAt: 'asc' },
            take: 5,
          })
        : Promise.resolve([]),

      // User's pending expenses (awaiting approval)
      prisma.expense.findMany({
        where: {
          userId: user.id,
          status: 'PENDING_APPROVAL',
        },
        include: {
          approvals: { include: { user: { select: { id: true, name: true } } } },
          nudges: {
            where: { type: NudgeType.EXPENSE_APPROVAL },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { createdAt: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Monthly trend (last 6 months)
      getMonthlyTrend(companyUserIds),

      // Category breakdown this month
      getCategoryBreakdown(companyUserIds, startOfMonth, endOfMonth),

      // Recent team activity
      prisma.expense.findMany({
        where: {
          userId: { in: companyUserIds },
        },
        include: {
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ])

    // Count pending approvals needing user's action
    const pendingApprovalCount = user.role === 'FOUNDER' ? pendingApprovals.length : 0

    return NextResponse.json({
      stats: {
        userTotal: userExpensesSum._sum.amount?.toNumber() || 0,
        teamTotal: teamExpensesSum._sum.amount?.toNumber() || 0,
        pendingApprovalCount,
        userPendingCount,
      },
      pendingApprovals: pendingApprovals.map((e) => ({
        id: e.id,
        date: e.date.toISOString(),
        amount: e.amount.toString(),
        description: e.description,
        category: e.category,
        status: e.status,
        user: e.user,
        approvals: e.approvals,
        approvalsNeeded,
      })),
      userPendingExpenses: userPendingExpenses.map((e) => {
        const approvedUserIds = e.approvals.map((a) => a.user.id)
        // Pending approvers are founders who haven't approved and aren't the expense creator
        const pendingApprovers = allFounders
          .filter((f) => f.id !== e.userId && !approvedUserIds.includes(f.id))
          .map((f) => ({ id: f.id, name: f.name }))

        return {
          id: e.id,
          date: e.date.toISOString(),
          amount: e.amount.toString(),
          description: e.description,
          category: e.category,
          status: e.status,
          userId: e.userId,
          approvals: e.approvals,
          approvalsNeeded,
          lastNudgeAt: e.nudges[0]?.createdAt?.toISOString() || null,
          pendingApproversCount: pendingApprovers.length,
          pendingApprovers,
        }
      }),
      monthlyTrend,
      categoryBreakdown,
      recentActivity: recentActivity.map((e) => ({
        id: e.id,
        date: e.date.toISOString(),
        amount: e.amount.toString(),
        description: e.description,
        category: e.category,
        userId: e.userId,
        user: e.user,
        status: e.status,
      })),
      userRole: user.role,
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function getMonthlyTrend(companyUserIds: string[]) {
  const now = new Date()
  const months: { month: string; total: number }[] = []

  for (let i = 5; i >= 0; i--) {
    const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999)

    const result = await prisma.expense.aggregate({
      where: {
        userId: { in: companyUserIds },
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    })

    const monthName = startDate.toLocaleDateString('en-US', { month: 'short' })
    months.push({
      month: monthName,
      total: result._sum.amount?.toNumber() || 0,
    })
  }

  return months
}

async function getCategoryBreakdown(
  companyUserIds: string[],
  startOfMonth: Date,
  endOfMonth: Date
) {
  const expenses = await prisma.expense.groupBy({
    by: ['category'],
    where: {
      userId: { in: companyUserIds },
      date: { gte: startOfMonth, lte: endOfMonth },
    },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: 5,
  })

  const total = expenses.reduce(
    (sum, e) => sum + (e._sum.amount?.toNumber() || 0),
    0
  )

  return expenses.map((e) => ({
    category: e.category,
    total: e._sum.amount?.toNumber() || 0,
    percentage: total > 0 ? Math.round(((e._sum.amount?.toNumber() || 0) / total) * 100) : 0,
  }))
}
