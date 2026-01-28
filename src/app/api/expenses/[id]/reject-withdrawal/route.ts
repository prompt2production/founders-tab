import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { Role, ExpenseStatus } from '@prisma/client'
import { rejectExpenseSchema } from '@/lib/validations/expense'
import { z } from 'zod'
import { sendWithdrawalRejectedEmail } from '@/lib/email'

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

    if (user.role !== Role.FOUNDER) {
      return NextResponse.json(
        { error: 'Only founders can reject withdrawals' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = rejectExpenseSchema.parse(body)

    const expense = await prisma.expense.findUnique({
      where: { id },
    })

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    if (expense.userId === user.id) {
      return NextResponse.json(
        { error: 'Cannot reject your own withdrawal request' },
        { status: 403 }
      )
    }

    if (expense.status !== ExpenseStatus.WITHDRAWAL_REQUESTED) {
      return NextResponse.json(
        { error: 'Expense is not in withdrawal requested status' },
        { status: 400 }
      )
    }

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: {
        status: ExpenseStatus.WITHDRAWAL_REJECTED,
        rejectedById: user.id,
        rejectedAt: new Date(),
        rejectionReason: validated.reason,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        rejectedBy: {
          select: { id: true, name: true },
        },
      },
    })

    // Fire-and-forget: notify expense owner of withdrawal rejection
    if (updatedExpense.user) {
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
      sendWithdrawalRejectedEmail({
        to: updatedExpense.user.email,
        expense: expenseDetails,
        rejectorName: user.name,
        rejectionReason: validated.reason,
      }).catch((err) => console.error('[Email] Failed to send withdrawal rejected email:', err))
    }

    return NextResponse.json(updatedExpense)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error rejecting withdrawal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
