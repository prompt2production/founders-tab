import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { ExpenseStatus, Role, NudgeType } from '@prisma/client'
import { sendBulkApprovalNudgeEmail } from '@/lib/email'
import { z } from 'zod'

const bulkNudgeSchema = z.object({
  expenseIds: z.array(z.string()).min(1, 'At least one expense ID is required'),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { expenseIds } = bulkNudgeSchema.parse(body)

    // Get company settings for cooldown configuration
    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
      select: { nudgeCooldownHours: true },
    })
    const nudgeCooldownHours = company?.nudgeCooldownHours ?? 0
    const nudgeCooldownMs = nudgeCooldownHours * 60 * 60 * 1000

    // Get all expenses with their nudge history
    const expenses = await prisma.expense.findMany({
      where: {
        id: { in: expenseIds },
        userId: user.id, // Verify user is the creator
        status: {
          in: [ExpenseStatus.PENDING_APPROVAL, ExpenseStatus.WITHDRAWAL_REQUESTED],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            companyId: true,
          },
        },
        approvals: {
          select: { userId: true },
        },
        withdrawalApprovals: {
          select: { userId: true },
        },
        nudges: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (expenses.length === 0) {
      return NextResponse.json(
        { error: 'No valid expenses found to nudge' },
        { status: 400 }
      )
    }

    // Filter expenses based on cooldown (if cooldown > 0)
    const now = Date.now()
    const nudgeableExpenses = expenses.filter((expense) => {
      if (nudgeCooldownMs === 0) return true // No cooldown, always nudgeable

      const nudgeType = expense.status === ExpenseStatus.PENDING_APPROVAL
        ? NudgeType.EXPENSE_APPROVAL
        : NudgeType.WITHDRAWAL_APPROVAL
      const lastNudge = expense.nudges.find((n) => n.type === nudgeType)
      if (!lastNudge) return true

      const timeSinceLastNudge = now - lastNudge.createdAt.getTime()
      return timeSinceLastNudge >= nudgeCooldownMs
    })

    if (nudgeableExpenses.length === 0) {
      const hours = nudgeCooldownHours === 1 ? '1 hour' : `${nudgeCooldownHours} hours`
      return NextResponse.json(
        { error: `All expenses are on cooldown. You can send reminders every ${hours}.` },
        { status: 400 }
      )
    }

    // Get all founders in the company who could be approvers
    const allFounders = await prisma.user.findMany({
      where: {
        companyId: user.companyId,
        role: Role.FOUNDER,
        id: { not: user.id }, // Exclude the expense creator
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    // Group expenses by pending approver
    // For each approver, collect the expenses they haven't approved yet
    const approverExpensesMap = new Map<string, {
      approver: { id: string; email: string; name: string }
      expenses: typeof nudgeableExpenses
    }>()

    for (const expense of nudgeableExpenses) {
      const approvedUserIds = expense.status === ExpenseStatus.PENDING_APPROVAL
        ? expense.approvals.map((a) => a.userId)
        : expense.withdrawalApprovals.map((a) => a.userId)

      // Find founders who haven't approved this expense
      const pendingApprovers = allFounders.filter(
        (f) => !approvedUserIds.includes(f.id)
      )

      for (const approver of pendingApprovers) {
        if (!approverExpensesMap.has(approver.id)) {
          approverExpensesMap.set(approver.id, {
            approver,
            expenses: [],
          })
        }
        approverExpensesMap.get(approver.id)!.expenses.push(expense)
      }
    }

    if (approverExpensesMap.size === 0) {
      return NextResponse.json(
        { error: 'All approvers have already approved these expenses' },
        { status: 400 }
      )
    }

    // Create nudge records for all nudgeable expenses
    await prisma.nudge.createMany({
      data: nudgeableExpenses.map((expense) => ({
        expenseId: expense.id,
        userId: user.id,
        type: expense.status === ExpenseStatus.PENDING_APPROVAL
          ? NudgeType.EXPENSE_APPROVAL
          : NudgeType.WITHDRAWAL_APPROVAL,
      })),
    })

    // Send consolidated emails to each approver
    const emailPromises: Promise<boolean>[] = []
    for (const [, { approver, expenses: approverExpenses }] of approverExpensesMap) {
      const hasWithdrawal = approverExpenses.some(
        (e) => e.status === ExpenseStatus.WITHDRAWAL_REQUESTED
      )

      emailPromises.push(
        sendBulkApprovalNudgeEmail({
          to: approver.email,
          expenses: approverExpenses.map((e) => ({
            description: e.description,
            amount: `$${Number(e.amount).toFixed(2)}`,
            category: e.category,
            date: new Date(e.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }),
          })),
          submitterName: user.name,
          nudgeType: hasWithdrawal ? 'withdrawal' : 'expense',
        }).catch((err) => {
          console.error('[Email] Failed to send bulk nudge email:', err)
          return false
        })
      )
    }

    // Fire-and-forget emails
    Promise.all(emailPromises)

    const skippedCount = expenses.length - nudgeableExpenses.length
    const nextNudgeAt = nudgeCooldownMs > 0
      ? new Date(now + nudgeCooldownMs).toISOString()
      : null

    return NextResponse.json({
      success: true,
      nudgedCount: nudgeableExpenses.length,
      skippedCount,
      approversNotified: approverExpensesMap.size,
      nextNudgeAt,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error sending bulk nudge:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
