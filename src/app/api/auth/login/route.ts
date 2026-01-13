import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { loginSchema } from '@/lib/validations/auth'
import { verifyPassword, createSession, setSessionCookie } from '@/lib/auth'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validated = loginSchema.parse(body)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    // Use generic error message for security (don't reveal if email exists)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const passwordValid = await verifyPassword(validated.password, user.passwordHash)

    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create session and set cookie
    const token = await createSession(user.id)
    await setSessionCookie(token)

    // Return user data without passwordHash
    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarInitials: user.avatarInitials,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
