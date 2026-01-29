import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { ExpenseStatus, Role } from '@prisma/client'

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

    // Find expense
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    // Check if user is the expense owner
    if (expense.userId !== user.id) {
      return NextResponse.json(
        { error: 'Only the expense owner can request withdrawal' },
        { status: 400 }
      )
    }

    // Check if expense is in APPROVED status
    if (expense.status !== ExpenseStatus.APPROVED) {
      return NextResponse.json(
        { error: 'Only approved expenses can be withdrawn' },
        { status: 400 }
      )
    }

    // Get all founders in the same company except the expense owner
    const foundersExceptOwner = await prisma.user.findMany({
      where: {
        companyId: user.companyId,
        role: Role.FOUNDER,
        id: { not: expense.userId },
      },
      select: { id: true },
    })

    // Determine the new status - auto-approve if no other founders exist
    const autoApproved = foundersExceptOwner.length === 0
    const newStatus = autoApproved
      ? ExpenseStatus.WITHDRAWAL_APPROVED
      : ExpenseStatus.WITHDRAWAL_REQUESTED

    // Update expense status
    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: { status: newStatus },
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

    return NextResponse.json({ ...updatedExpense, autoApproved })
  } catch (error) {
    console.error('Error requesting withdrawal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
