import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/app/api/data/auth-store'
import { query } from '@/app/api/data/db'
import { ApiError } from '@/app/api/utils/errors'
import { logActivity, ActivityActions } from '@/app/api/utils/activity-logger'

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

    // Get all active sessions for user
    const result = await query(
      `SELECT id, device_name as "deviceName", device_type as "deviceType", 
              ip_address as "ipAddress", location, 
              created_at as "createdAt", last_used_at as "lastUsedAt",
              expires_at as "expiresAt"
       FROM sessions
       WHERE user_id = $1 AND expires_at > NOW()
       ORDER BY last_used_at DESC`,
      [payload.userId]
    )

    return NextResponse.json(
      { sessions: result.rows },
      { status: 200 }
    )

  } catch (error) {
    console.error('Get sessions error:', error)
    
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

export async function DELETE(req: NextRequest) {
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

    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('id')

    if (sessionId) {
      // Delete specific session
      await query(
        'DELETE FROM sessions WHERE id = $1 AND user_id = $2',
        [sessionId, payload.userId]
      )

      // Log activity
      await logActivity({
        userId: payload.userId,
        action: ActivityActions.SESSION_DELETE,
        description: 'User terminated a session',
        metadata: { sessionId },
        request: req,
      })

      return NextResponse.json(
        { message: 'Session terminated successfully' },
        { status: 200 }
      )
    } else {
      // Delete all sessions except current one
      // Find current session by checking which has the matching refresh token
      const refreshToken = req.cookies.get('refresh_token')?.value
      
      if (refreshToken) {
        await query(
          'DELETE FROM sessions WHERE user_id = $1 AND refresh_token != $2',
          [payload.userId, refreshToken]
        )
      } else {
        // If no refresh token, delete all sessions
        await query(
          'DELETE FROM sessions WHERE user_id = $1',
          [payload.userId]
        )
      }

      // Log activity
      await logActivity({
        userId: payload.userId,
        action: ActivityActions.SESSION_DELETE_ALL,
        description: 'User terminated all other sessions',
        request: req,
      })

      return NextResponse.json(
        { message: 'All other sessions terminated successfully' },
        { status: 200 }
      )
    }

  } catch (error) {
    console.error('Delete session error:', error)
    
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
