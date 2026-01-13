import { NextResponse } from 'next/server'
import { getSessionCookie, clearSessionCookie, deleteSession } from '@/lib/auth'

export async function POST() {
  try {
    // Get current session token
    const token = await getSessionCookie()

    // Delete session from database if exists
    if (token) {
      await deleteSession(token)
    }

    // Clear the session cookie
    await clearSessionCookie()

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Logout error:', error)
    // Still clear cookie even if database operation fails
    await clearSessionCookie()
    return NextResponse.json({ success: true }, { status: 200 })
  }
}
