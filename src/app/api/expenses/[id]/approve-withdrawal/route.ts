import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { Role, ExpenseStatus } from '@prisma/client'
import { sendWithdrawalApprovedEmail } from '@/lib/email'
import { isExpenseInCompany } from '@/lib/company'

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

    // Verify expense belongs to same company
    const inCompany = await isExpenseInCompany(user.companyId, id)
    if (!inCompany) {
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

    // Get all founders in the same company except the expense owner
    const foundersExceptOwner = await prisma.user.findMany({
      where: {
        companyId: user.companyId,
        role: Role.FOUNDER,
        id: { not: expense.userId },
      },
      select: { id: true },
    })

    // Get current withdrawal approvals count (including the one just created)
    const approvalCount = expense.withdrawalApprovals.length + 1

    // Check if all founders (except owner) have approved
    const isFullyApproved = approvalCount >= foundersExceptOwner.length

    // Update status if fully approved
    if (isFullyApproved) {
      await prisma.expense.update({
        where: { id },
        data: { status: ExpenseStatus.WITHDRAWAL_APPROVED },
      })
    }

    // Fetch updated expense with withdrawal approvals
    const updatedExpense = await prisma.expense.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
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

    // Fire-and-forget: notify expense owner when withdrawal is fully approved
    if (isFullyApproved && updatedExpense?.user) {
      const expenseDetails = {
        description: expense.description,
        amount: `$${Number(expense.amount).toFixed(2)}`,
        category: expense.category,
        date: new Date(expense.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        submitterName: updatedExpense.user.name,
      }
      sendWithdrawalApprovedEmail({
        to: updatedExpense.user.email,
        expense: expenseDetails,
      }).catch((err) => console.error('[Email] Failed to send withdrawal approved email:', err))
    }

    return NextResponse.json({ ...updatedExpense, isFullyApproved })
  } catch (error) {
    console.error('Error approving withdrawal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
