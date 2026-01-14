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
        { error: 'Only founders can approve expenses' },
        { status: 400 }
      )
    }

    // Find expense with approvals
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
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
      },
    })

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    // Check if user is the expense creator
    if (expense.userId === user.id) {
      return NextResponse.json(
        { error: 'Cannot approve your own expense' },
        { status: 400 }
      )
    }

    // Check if user already approved
    const existingApproval = expense.approvals.find((a) => a.userId === user.id)
    if (existingApproval) {
      return NextResponse.json(
        { error: 'Already approved this expense' },
        { status: 400 }
      )
    }

    // Create approval
    await prisma.approval.create({
      data: {
        expenseId: id,
        userId: user.id,
      },
    })

    // Get all founders except the expense creator
    const foundersExceptCreator = await prisma.user.findMany({
      where: {
        role: Role.FOUNDER,
        id: { not: expense.userId },
      },
      select: { id: true },
    })

    // Get current approvals count (including the one just created)
    const approvalCount = expense.approvals.length + 1

    // Check if all founders (except creator) have approved
    const isFullyApproved = approvalCount >= foundersExceptCreator.length

    // Update status if fully approved
    if (isFullyApproved) {
      await prisma.expense.update({
        where: { id },
        data: { status: ExpenseStatus.APPROVED },
      })
    }

    // Fetch updated expense with approvals
    const updatedExpense = await prisma.expense.findUnique({
      where: { id },
      include: {
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
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(updatedExpense)
  } catch (error) {
    console.error('Error approving expense:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
