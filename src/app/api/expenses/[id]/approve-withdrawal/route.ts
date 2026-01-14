import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { Role, ExpenseStatus } from '@prisma/client'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if user is a FOUNDER
    if (user.role !== Role.FOUNDER) {
      return NextResponse.json(
        { error: 'Only founders can approve withdrawals' },
        { status: 400 }
      )
    }

    // Find expense with withdrawal approvals
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        withdrawalApprovals: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    // Check if expense is in WITHDRAWAL_REQUESTED status
    if (expense.status !== ExpenseStatus.WITHDRAWAL_REQUESTED) {
      return NextResponse.json(
        { error: 'Expense is not in withdrawal requested status' },
        { status: 400 }
      )
    }

    // Check if user is the expense owner
    if (expense.userId === user.id) {
      return NextResponse.json(
        { error: 'Cannot approve your own withdrawal request' },
        { status: 400 }
      )
    }

    // Check if user already approved
    const existingApproval = expense.withdrawalApprovals.find(
      (a) => a.userId === user.id
    )
    if (existingApproval) {
      return NextResponse.json(
        { error: 'Already approved this withdrawal' },
        { status: 400 }
      )
    }

    // Create withdrawal approval
    await prisma.withdrawalApproval.create({
      data: {
        expenseId: id,
        userId: user.id,
      },
    })

    // Fetch updated expense with withdrawal approvals
    const updatedExpense = await prisma.expense.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        approvals: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        withdrawalApprovals: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(updatedExpense)
  } catch (error) {
    console.error('Error approving withdrawal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
