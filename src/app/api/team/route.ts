import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get all team members (excluding passwordHash)
    const members = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatarInitials: true,
        role: true,
        createdAt: true,
      },
      orderBy: [
        { role: 'asc' }, // FOUNDER first, then MEMBER
        { createdAt: 'asc' },
      ],
    })

    return NextResponse.json(members, { status: 200 })
  } catch (error) {
    console.error('Get team error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
