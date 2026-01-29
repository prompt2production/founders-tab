import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'
import { labelToValue, DEFAULT_CATEGORIES } from '@/lib/constants/default-categories'
import { CATEGORY_ICONS } from '@/lib/constants/category-icons'

const validIconValues = CATEGORY_ICONS.map((i) => i.value) as string[]

const createCategorySchema = z.object({
  label: z
    .string()
    .min(1, 'Label is required')
    .max(50, 'Label cannot exceed 50 characters')
    .transform((val) => val.trim()),
  icon: z.string().refine((val) => validIconValues.includes(val), {
    message: 'Invalid icon',
  }).optional().default('Tag'),
  value: z
    .string()
    .max(50, 'Value cannot exceed 50 characters')
    .transform((val) => val.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, ''))
    .optional(),
})

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!user.companyId) {
      return NextResponse.json({ error: 'No company associated' }, { status: 400 })
    }

    const categories = await prisma.companyCategory.findMany({
      where: {
        companyId: user.companyId,
        isActive: true,
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'asc' },
      ],
      select: {
        id: true,
        value: true,
        label: true,
        icon: true,
        isDefault: true,
        sortOrder: true,
      },
    })

    // Sort so OTHER is always last (it's a special category for custom entries)
    const sortedCategories = categories.sort((a, b) => {
      if (a.value === 'OTHER') return 1
      if (b.value === 'OTHER') return -1
      return 0 // Preserve existing order for non-OTHER categories
    })

    return NextResponse.json(sortedCategories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'FOUNDER') {
      return NextResponse.json({ error: 'Only founders can create categories' }, { status: 403 })
    }

    if (!user.companyId) {
      return NextResponse.json({ error: 'No company associated' }, { status: 400 })
    }

    const body = await request.json()
    const validated = createCategorySchema.parse(body)

    // Generate value from label if not provided
    const value = validated.value || labelToValue(validated.label)

    // Check for duplicate value
    const existing = await prisma.companyCategory.findUnique({
      where: {
        companyId_value: {
          companyId: user.companyId,
          value,
        },
      },
    })

    if (existing) {
      // If it exists but is inactive, reactivate it
      if (!existing.isActive) {
        const reactivated = await prisma.companyCategory.update({
          where: { id: existing.id },
          data: {
            isActive: true,
            label: validated.label,
            icon: validated.icon,
          },
          select: {
            id: true,
            value: true,
            label: true,
            icon: true,
            isDefault: true,
            sortOrder: true,
          },
        })
        return NextResponse.json(reactivated, { status: 200 })
      }
      return NextResponse.json({ error: 'Category already exists' }, { status: 400 })
    }

    // Get the OTHER category's sortOrder so we can insert before it
    const otherCategory = await prisma.companyCategory.findFirst({
      where: { companyId: user.companyId, value: 'OTHER' },
      select: { sortOrder: true },
    })

    // Get max sortOrder excluding OTHER
    const maxSortOrder = await prisma.companyCategory.aggregate({
      where: {
        companyId: user.companyId,
        value: { not: 'OTHER' },
      },
      _max: { sortOrder: true },
    })

    // New category goes after existing categories but before OTHER
    const newSortOrder = (maxSortOrder._max.sortOrder ?? -1) + 1

    // If OTHER exists and would be at or before the new category, bump it up
    if (otherCategory && otherCategory.sortOrder <= newSortOrder) {
      await prisma.companyCategory.updateMany({
        where: { companyId: user.companyId, value: 'OTHER' },
        data: { sortOrder: newSortOrder + 1 },
      })
    }

    const category = await prisma.companyCategory.create({
      data: {
        companyId: user.companyId,
        value,
        label: validated.label,
        icon: validated.icon,
        isDefault: false,
        isActive: true,
        sortOrder: newSortOrder,
      },
      select: {
        id: true,
        value: true,
        label: true,
        icon: true,
        isDefault: true,
        sortOrder: true,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
