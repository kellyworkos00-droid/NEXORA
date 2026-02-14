import { NextResponse } from 'next/server'
import { cleanupExpiredSessions } from '@/app/api/data/auth-store'

export async function POST() {
  try {
    // Only allow in development or with proper auth in production
    if (process.env.NODE_ENV === 'production') {
      // In production, you should verify an API key or admin token here
      const apiKey = process.env.CRON_SECRET
      if (!apiKey) {
        return NextResponse.json(
          { error: 'Session cleanup not configured' },
          { status: 403 }
        )
      }
    }

    const deletedCount = await cleanupExpiredSessions()

    return NextResponse.json(
      {
        success: true,
        message: `Cleaned up ${deletedCount} expired sessions`,
        deletedCount,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Session cleanup error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to cleanup sessions',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

// GET endpoint to view session stats
export async function GET() {
  try {
    return NextResponse.json(
      {
        message: 'Use POST to trigger session cleanup',
        endpoint: '/api/admin/cleanup-sessions',
      },
      { status: 200 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
