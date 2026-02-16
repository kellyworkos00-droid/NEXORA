import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/app/api/data/auth-store'
import {
  getUserNotifications,
  markAllNotificationsAsRead,
  getUnreadCount,
} from '@/app/api/utils/notifications'
import { ApiError } from '@/app/api/utils/errors'

export async function GET(req: NextRequest) {
  try {
    const accessToken = req.cookies.get('access_token')?.value
    if (!accessToken) {
      throw new ApiError('Unauthorized', 401)
    }

    const payload = verifyToken(accessToken)
    if (!payload) {
      throw new ApiError('Invalid or expired token', 401)
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const unreadOnly = searchParams.get('unread') === 'true'

    if (limit < 1 || limit > 100) {
      throw new ApiError('Limit must be between 1 and 100', 400)
    }

    const notifications = await getUserNotifications(payload.userId, limit, offset, unreadOnly)
    const unreadCount = await getUnreadCount(payload.userId)

    return NextResponse.json(
      {
        notifications,
        unreadCount,
        pagination: {
          limit,
          offset,
          total: notifications.length,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get notifications error:', error)

    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const accessToken = req.cookies.get('access_token')?.value
    if (!accessToken) {
      throw new ApiError('Unauthorized', 401)
    }

    const payload = verifyToken(accessToken)
    if (!payload) {
      throw new ApiError('Invalid or expired token', 401)
    }

    const updatedCount = await markAllNotificationsAsRead(payload.userId)
    const unreadCount = await getUnreadCount(payload.userId)

    return NextResponse.json(
      {
        message: 'All notifications marked as read',
        updatedCount,
        unreadCount,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Mark all notifications read error:', error)

    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
