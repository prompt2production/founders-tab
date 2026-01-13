import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { createExpenseSchema } from '@/lib/validations/expense'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validated = createExpenseSchema.parse(body)

    // Create expense in database
    const expense = await prisma.expense.create({
      data: {
        userId: user.id,
        date: validated.date,
        amount: validated.amount,
        description: validated.description,
        category: validated.category,
        receiptUrl: validated.receiptUrl || null,
        notes: validated.notes || null,
      },
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error creating expense:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
