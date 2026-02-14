import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/app/api/data/auth-store'
import { getActivityLogs } from '@/app/api/utils/activity-logger'
import { ApiError } from '@/app/api/utils/errors'

export async function GET(req: NextRequest) {
  try {
    // Get access token from cookie
    const accessToken = req.cookies.get('access_token')?.value

    if (!accessToken) {
      throw new ApiError('Unauthorized', 401)
    }

    // Verify token
    const payload = verifyToken(accessToken)
    if (!payload) {
      throw new ApiError('Invalid or expired token', 401)
    }

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Validate limits
    if (limit < 1 || limit > 100) {
      throw new ApiError('Limit must be between 1 and 100', 400)
    }

    // Get activity logs
    const logs = await getActivityLogs(payload.userId, limit, offset)

    return NextResponse.json(
      {
        logs,
        pagination: {
          limit,
          offset,
          total: logs.length,
        },
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Get activity logs error:', error)
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
