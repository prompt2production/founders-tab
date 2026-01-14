import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { createExpenseSchema, listExpensesQuerySchema } from '@/lib/validations/expense'
import { z } from 'zod'
import { Prisma, Category, ExpenseStatus, Role } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const query = listExpensesQuerySchema.parse({
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
      category: searchParams.get('category') || undefined,
      userId: searchParams.get('userId') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    })

    // Build where clause
    // If userId is provided, filter by that user; otherwise show all users (team view)
    const where: Prisma.ExpenseWhereInput = {}

    if (query.userId) {
      where.userId = query.userId
    }

    if (query.category) {
      where.category = query.category as Category
    }

    if (query.startDate || query.endDate) {
      where.date = {}
      if (query.startDate) {
        where.date.gte = query.startDate
      }
      if (query.endDate) {
        where.date.lte = query.endDate
      }
    }

    // Get total count and expenses with user info
    const [total, expenses] = await Promise.all([
      prisma.expense.count({ where }),
      prisma.expense.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ])

    return NextResponse.json({
      expenses,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error fetching expenses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

    // Check if there are other founders who need to approve
    const otherFoundersCount = await prisma.user.count({
      where: {
        role: Role.FOUNDER,
        id: { not: user.id },
      },
    })

    // If no other founders, auto-approve; otherwise set to PENDING_APPROVAL
    const initialStatus = otherFoundersCount === 0
      ? ExpenseStatus.APPROVED
      : ExpenseStatus.PENDING_APPROVAL

    // Create expense in database
    const expense = await prisma.expense.create({
      data: {
        userId: user.id,
        date: validated.date,
        amount: validated.amount,
        description: validated.description,
        category: validated.category as Category,
        status: initialStatus,
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
