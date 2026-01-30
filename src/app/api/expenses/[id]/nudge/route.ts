import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { ExpenseStatus, Role, NudgeType } from '@prisma/client'
import { sendApprovalNudgeEmail } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get company settings for cooldown configuration
    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
      select: { nudgeCooldownHours: true },
    })
    const nudgeCooldownHours = company?.nudgeCooldownHours ?? 0
    const nudgeCooldownMs = nudgeCooldownHours * 60 * 60 * 1000

    // Get expense with user info and nudge history
    const expense = await prisma.expense.findUnique({
      where: { id },
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

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    // Verify user is the expense creator
    if (expense.userId !== user.id) {
      return NextResponse.json(
        { error: 'Only the expense creator can send reminders' },
        { status: 403 }
      )
    }

    // Determine nudge type based on status
    let nudgeType: NudgeType
    if (expense.status === ExpenseStatus.PENDING_APPROVAL) {
      nudgeType = NudgeType.EXPENSE_APPROVAL
    } else if (expense.status === ExpenseStatus.WITHDRAWAL_REQUESTED) {
      nudgeType = NudgeType.WITHDRAWAL_APPROVAL
    } else {
      return NextResponse.json(
        { error: 'Can only send reminders for expenses pending approval' },
        { status: 400 }
      )
    }

    // Check rate limit (only if cooldown > 0)
    if (nudgeCooldownMs > 0) {
      const lastNudge = expense.nudges.find((n) => n.type === nudgeType)
      if (lastNudge) {
        const timeSinceLastNudge = Date.now() - lastNudge.createdAt.getTime()
        if (timeSinceLastNudge < nudgeCooldownMs) {
          const nextNudgeAt = new Date(lastNudge.createdAt.getTime() + nudgeCooldownMs)
          const hours = nudgeCooldownHours === 1 ? '1 hour' : `${nudgeCooldownHours} hours`
          return NextResponse.json(
            {
              error: `You can only send one reminder every ${hours}`,
              nextNudgeAt: nextNudgeAt.toISOString(),
            },
            { status: 400 }
          )
        }
      }
    }

    // Get founders who haven't approved yet
    const approvedUserIds =
      nudgeType === NudgeType.EXPENSE_APPROVAL
        ? expense.approvals.map((a) => a.userId)
        : expense.withdrawalApprovals.map((a) => a.userId)

    const pendingApprovers = await prisma.user.findMany({
      where: {
        companyId: expense.user.companyId,
        role: Role.FOUNDER,
        id: {
          notIn: [...approvedUserIds, expense.userId], // Exclude already approved and creator
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    if (pendingApprovers.length === 0) {
      return NextResponse.json(
        { error: 'All approvers have already approved' },
        { status: 400 }
      )
    }

    // Create nudge record
    await prisma.nudge.create({
      data: {
        expenseId: expense.id,
        userId: user.id,
        type: nudgeType,
      },
    })

    // Send emails (fire-and-forget)
    const expenseDetails = {
      description: expense.description,
      amount: `$${Number(expense.amount).toFixed(2)}`,
      category: expense.category,
      date: new Date(expense.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      submitterName: expense.user.name,
    }

    pendingApprovers.forEach((approver) => {
      sendApprovalNudgeEmail({
        to: approver.email,
        expense: expenseDetails,
        nudgeType: nudgeType === NudgeType.EXPENSE_APPROVAL ? 'expense' : 'withdrawal',
      }).catch((err) => console.error('[Email] Failed to send nudge email:', err))
    })

    // Return next nudge time (if cooldown is 0, return null to indicate immediate availability)
    const nextNudgeAt = nudgeCooldownMs > 0
      ? new Date(Date.now() + nudgeCooldownMs).toISOString()
      : null

    return NextResponse.json({
      success: true,
      nudgedCount: pendingApprovers.length,
      nextNudgeAt,
    })
  } catch (error) {
    console.error('Error sending nudge:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
