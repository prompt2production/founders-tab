import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { updateCompanySettingsSchema } from '@/lib/validations/company-settings'
import { Role } from '@prisma/client'
import { z } from 'zod'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user's company settings
    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
      select: {
        id: true,
        name: true,
        currency: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error fetching company settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== Role.FOUNDER) {
      return NextResponse.json(
        { error: 'Only founders can update company settings' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = updateCompanySettingsSchema.parse(body)

    // Update the user's company directly
    const updated = await prisma.company.update({
      where: { id: user.companyId },
      data: validated,
      select: {
        id: true,
        name: true,
        currency: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error updating company settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
