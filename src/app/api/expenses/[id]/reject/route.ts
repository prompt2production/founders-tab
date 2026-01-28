import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { Role, ExpenseStatus } from '@prisma/client'
import { rejectExpenseSchema } from '@/lib/validations/expense'
import { z } from 'zod'

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
        { error: 'Only founders can reject expenses' },
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
        { error: 'Cannot reject your own expense' },
        { status: 403 }
      )
    }

    if (expense.status !== ExpenseStatus.PENDING_APPROVAL) {
      return NextResponse.json(
        { error: 'Expense is not pending approval' },
        { status: 400 }
      )
    }

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: {
        status: ExpenseStatus.REJECTED,
        rejectedById: user.id,
        rejectedAt: new Date(),
        rejectionReason: validated.reason,
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
        rejectedBy: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json(updatedExpense)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error rejecting expense:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
