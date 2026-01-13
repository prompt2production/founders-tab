import { NextResponse } from 'next/server'
import { getProgress } from '@/lib/progress'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const progress = getProgress()
    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}
