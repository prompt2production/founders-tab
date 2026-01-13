import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { createInvitationSchema } from '@/lib/validations/invitation'
import { z } from 'zod'

const INVITATION_EXPIRY_DAYS = 7

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get invitations sent by current user
    const invitations = await prisma.invitation.findMany({
      where: { invitedById: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        message: true,
        status: true,
        expiresAt: true,
        createdAt: true,
        acceptedAt: true,
      },
    })

    return NextResponse.json(invitations, { status: 200 })
  } catch (error) {
    console.error('Get invitations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Only founders can invite
    if (user.role !== 'FOUNDER') {
      return NextResponse.json(
        { error: 'Only founders can invite new members' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate input
    const validated = createInvitationSchema.parse(body)

    // Check if email is already a member
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'This email is already a team member' },
        { status: 400 }
      )
    }

    // Check if there's already a pending invitation for this email
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email: validated.email,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
    })

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'An invitation is already pending for this email' },
        { status: 400 }
      )
    }

    // Generate invitation token
    const token = randomBytes(32).toString('hex')

    // Calculate expiry date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS)

    // Create invitation
    const invitation = await prisma.invitation.create({
      data: {
        email: validated.email,
        token,
        message: validated.message,
        expiresAt,
        invitedById: user.id,
      },
      select: {
        id: true,
        email: true,
        message: true,
        status: true,
        expiresAt: true,
        createdAt: true,
      },
    })

    return NextResponse.json(invitation, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Create invitation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
