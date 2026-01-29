import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'
import { CATEGORY_ICONS } from '@/lib/constants/category-icons'

const validIconValues = CATEGORY_ICONS.map((i) => i.value) as string[]

const updateCategorySchema = z.object({
  label: z
    .string()
    .min(1, 'Label is required')
    .max(50, 'Label cannot exceed 50 characters')
    .transform((val) => val.trim())
    .optional(),
  icon: z.string().refine((val) => validIconValues.includes(val), {
    message: 'Invalid icon',
  }).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
})

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'FOUNDER') {
      return NextResponse.json({ error: 'Only founders can update categories' }, { status: 403 })
    }

    if (!user.companyId) {
      return NextResponse.json({ error: 'No company associated' }, { status: 400 })
    }

    const { id } = await params
    const body = await request.json()
    const validated = updateCategorySchema.parse(body)

    // Find the category and verify it belongs to the user's company
    const category = await prisma.companyCategory.findFirst({
      where: {
        id,
        companyId: user.companyId,
      },
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Cannot disable the OTHER category - it's required for custom expense entries
    if (category.value === 'OTHER' && validated.isActive === false) {
      return NextResponse.json(
        { error: 'Cannot disable the "Other" category. It is required for custom entries.' },
        { status: 400 }
      )
    }

    const updated = await prisma.companyCategory.update({
      where: { id },
      data: {
        ...(validated.label !== undefined && { label: validated.label }),
        ...(validated.icon !== undefined && { icon: validated.icon }),
        ...(validated.isActive !== undefined && { isActive: validated.isActive }),
        ...(validated.sortOrder !== undefined && { sortOrder: validated.sortOrder }),
      },
      select: {
        id: true,
        value: true,
        label: true,
        icon: true,
        isDefault: true,
        isActive: true,
        sortOrder: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'FOUNDER') {
      return NextResponse.json({ error: 'Only founders can delete categories' }, { status: 403 })
    }

    if (!user.companyId) {
      return NextResponse.json({ error: 'No company associated' }, { status: 400 })
    }

    const { id } = await params

    // Find the category and verify it belongs to the user's company
    const category = await prisma.companyCategory.findFirst({
      where: {
        id,
        companyId: user.companyId,
      },
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Cannot delete the OTHER category - it's required for custom expense entries
    if (category.value === 'OTHER') {
      return NextResponse.json(
        { error: 'Cannot delete the "Other" category. It is required for custom entries.' },
        { status: 400 }
      )
    }

    // Cannot delete default categories - only disable them
    if (category.isDefault) {
      return NextResponse.json(
        { error: 'Cannot delete default categories. You can disable them instead.' },
        { status: 400 }
      )
    }

    // Check if any expenses use this category
    // We need to find expenses from users in the same company
    const usersInCompany = await prisma.user.findMany({
      where: { companyId: user.companyId },
      select: { id: true },
    })
    const userIds = usersInCompany.map((u) => u.id)

    const expenseCount = await prisma.expense.count({
      where: {
        userId: { in: userIds },
        category: category.value,
      },
    })

    if (expenseCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category. ${expenseCount} expense(s) use this category.` },
        { status: 400 }
      )
    }

    await prisma.companyCategory.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
