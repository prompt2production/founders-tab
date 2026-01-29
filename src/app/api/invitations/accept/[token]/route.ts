import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { acceptInvitationSchema } from '@/lib/validations/invitation'
import { hashPassword } from '@/lib/auth/password'
import { createSession } from '@/lib/auth/session'
import { setSessionCookie } from '@/lib/auth/cookies'
import { z } from 'zod'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Find the invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        invitedBy: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 400 }
      )
    }

    // Check if expired
    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'This invitation has expired' },
        { status: 400 }
      )
    }

    // Check if already accepted
    if (invitation.status === 'ACCEPTED') {
      return NextResponse.json(
        { error: 'This invitation has already been accepted' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        email: invitation.email,
        inviterName: invitation.invitedBy.name,
        message: invitation.message,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get invitation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()

    // Validate input (add token to body for validation)
    const validated = acceptInvitationSchema.parse({ ...body, token })

    // Find the invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 400 }
      )
    }

    // Check if expired
    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'This invitation has expired' },
        { status: 400 }
      )
    }

    // Check if already accepted
    if (invitation.status === 'ACCEPTED') {
      return NextResponse.json(
        { error: 'This invitation has already been accepted' },
        { status: 400 }
      )
    }

    // Check if email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(validated.password)

    // Generate avatar initials from name
    const nameParts = validated.name.trim().split(' ')
    const avatarInitials =
      nameParts.length >= 2
        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
        : validated.name.slice(0, 2).toUpperCase()

    // Create user with MEMBER role, joining the inviter's company
    const user = await prisma.user.create({
      data: {
        email: invitation.email,
        name: validated.name,
        passwordHash,
        avatarInitials,
        role: 'MEMBER',
        companyId: invitation.companyId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarInitials: true,
        role: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Mark invitation as accepted
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
        acceptedById: user.id,
      },
    })

    // Create session and set cookie
    const sessionToken = await createSession(user.id)
    await setSessionCookie(sessionToken)

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Accept invitation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
