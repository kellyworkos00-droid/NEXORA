import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, findUserById } from '@/app/api/data/auth-store'
import { getRecentActivity } from '@/app/api/utils/activity-logger'
import { query } from '@/app/api/data/db'
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

    // Get user
    const user = await findUserById(payload.userId)
    if (!user) {
      throw new ApiError('User not found', 404)
    }

    // Get recent activity summary
    const recentActivity = await getRecentActivity(payload.userId, 30)

    // Get session count
    const sessionsResult = await query(
      'SELECT COUNT(*) as count FROM sessions WHERE user_id = $1 AND expires_at > NOW()',
      [payload.userId]
    )
    const activeSessions = parseInt(sessionsResult.rows[0]?.count || '0')

    // Get total activity count
    const activityResult = await query(
      'SELECT COUNT(*) as count FROM activity_logs WHERE user_id = $1',
      [payload.userId]
    )
    const totalActivities = parseInt(activityResult.rows[0]?.count || '0')

    // Get account age in days
    const accountAge = Math.floor(
      (new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )

    return NextResponse.json(
      {
        stats: {
          accountAge,
          activeSessions,
          totalActivities,
          emailVerified: user.emailVerified || false,
          twoFactorEnabled: user.twoFactorEnabled || false,
          lastLogin: user.lastLoginAt || null,
        },
        recentActivity,
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Get stats error:', error)
    
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
