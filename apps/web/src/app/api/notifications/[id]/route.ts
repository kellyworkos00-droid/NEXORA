import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/app/api/data/auth-store'
import { markNotificationAsRead, deleteNotification } from '@/app/api/utils/notifications'
import { ApiError } from '@/app/api/utils/errors'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const accessToken = req.cookies.get('access_token')?.value
    if (!accessToken) {
      throw new ApiError('Unauthorized', 401)
    }

    const payload = verifyToken(accessToken)
    if (!payload) {
      throw new ApiError('Invalid or expired token', 401)
    }

    const notificationId = params.id
    const success = await markNotificationAsRead(notificationId, payload.userId)

    if (!success) {
      throw new ApiError('Notification not found', 404)
    }

    return NextResponse.json(
      { message: 'Notification marked as read' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Mark notification read error:', error)

    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const accessToken = req.cookies.get('access_token')?.value
    if (!accessToken) {
      throw new ApiError('Unauthorized', 401)
    }

    const payload = verifyToken(accessToken)
    if (!payload) {
      throw new ApiError('Invalid or expired token', 401)
    }

    const notificationId = params.id
    const success = await deleteNotification(notificationId, payload.userId)

    if (!success) {
      throw new ApiError('Notification not found', 404)
    }

    return NextResponse.json(
      { message: 'Notification deleted' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete notification error:', error)

    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
