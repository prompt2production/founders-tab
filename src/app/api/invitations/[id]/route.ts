import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Only founders can cancel invitations
    if (user.role !== 'FOUNDER') {
      return NextResponse.json(
        { error: 'Only founders can cancel invitations' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Find the invitation
    const invitation = await prisma.invitation.findUnique({
      where: { id },
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Delete the invitation
    await prisma.invitation.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: 'Invitation cancelled successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Cancel invitation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
