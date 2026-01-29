import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { updateRoleSchema } from '@/lib/validations/role'
import { Role } from '@prisma/client'
import { z } from 'zod'
import { sendPromotedToFounderEmail } from '@/lib/email'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if requesting user is a FOUNDER
    if (currentUser.role !== Role.FOUNDER) {
      return NextResponse.json(
        { error: 'Only founders can change roles' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()

    // Validate input
    const validated = updateRoleSchema.parse(body)

    // Find target user
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
      },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify target user is in the same company
    if (targetUser.companyId !== currentUser.companyId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If demoting to MEMBER, check if this is the last founder in the company
    if (targetUser.role === Role.FOUNDER && validated.role === 'MEMBER') {
      const founderCount = await prisma.user.count({
        where: { companyId: currentUser.companyId, role: Role.FOUNDER },
      })

      if (founderCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot demote the last founder' },
          { status: 403 }
        )
      }
    }

    // Update role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: validated.role as Role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    // Send notification email when a member is promoted to founder
    if (targetUser.role === Role.MEMBER && validated.role === 'FOUNDER') {
      sendPromotedToFounderEmail({
        to: updatedUser.email!,
        userName: updatedUser.name || 'there',
      }).catch((err) => console.error('Error sending promoted-to-founder email:', err))
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error updating role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
