import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signupSchema } from '@/lib/validations/auth'
import { hashPassword, createSession, setSessionCookie } from '@/lib/auth'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validated = signupSchema.parse(body)

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(validated.password)

    // Generate avatar initials from name
    const nameParts = validated.name.trim().split(/\s+/)
    const avatarInitials =
      nameParts.length >= 2
        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
        : validated.name.slice(0, 2).toUpperCase()

    // Public signup always creates a new company with the user as founder
    // Users join existing companies only through invitations
    const result = await prisma.$transaction(async (tx) => {
      // Create new company
      const company = await tx.company.create({
        data: {
          name: '',
          currency: 'USD',
        },
      })

      // Create user as FOUNDER of the new company
      const user = await tx.user.create({
        data: {
          email: validated.email,
          name: validated.name,
          passwordHash,
          avatarInitials,
          role: 'FOUNDER',
          companyId: company.id,
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

      return user
    })

    // Create session and set cookie
    const token = await createSession(result.id)
    await setSessionCookie(token)

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
