import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { ExpenseStatus } from '@prisma/client'

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
    })

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    // Check if user is the expense owner
    if (expense.userId !== user.id) {
      return NextResponse.json(
        { error: 'Only the expense owner can confirm receipt' },
        { status: 400 }
      )
    }

    // Check if expense is in WITHDRAWAL_APPROVED status
    if (expense.status !== ExpenseStatus.WITHDRAWAL_APPROVED) {
      return NextResponse.json(
        { error: 'Withdrawal must be approved before confirming receipt' },
        { status: 400 }
      )
    }

    // Update expense status to RECEIVED
    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: { status: ExpenseStatus.RECEIVED },
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
    console.error('Error confirming receipt:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
