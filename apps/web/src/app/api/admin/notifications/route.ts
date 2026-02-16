import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, findUserById } from '@/app/api/data/auth-store'
import { createBroadcastNotification } from '@/app/api/utils/notifications'
import { ApiError, ValidationError } from '@/app/api/utils/errors'

async function checkAdmin(accessToken: string | undefined) {
  if (!accessToken) {
    throw new ApiError('Unauthorized', 401)
  }

  const payload = verifyToken(accessToken)
  if (!payload) {
    throw new ApiError('Invalid or expired token', 401)
  }

  const user = await findUserById(payload.userId)
  if (!user) {
    throw new ApiError('User not found', 404)
  }

  if (user.role !== 'admin') {
    throw new ApiError('Forbidden: Admin access required', 403)
  }

  return user
}

export async function POST(req: NextRequest) {
  try {
    const accessToken = req.cookies.get('access_token')?.value
    await checkAdmin(accessToken)

    const body = await req.json()
    const { type, title, message, link } = body

    if (!title || typeof title !== 'string') {
      throw new ValidationError('Title is required')
    }

    if (!message || typeof message !== 'string') {
      throw new ValidationError('Message is required')
    }

    if (type && !['info', 'success', 'warning', 'error'].includes(type)) {
      throw new ValidationError('Invalid notification type')
    }

    const count = await createBroadcastNotification(
      type || 'info',
      title.trim(),
      message.trim(),
      link ? String(link).trim() : undefined
    )

    return NextResponse.json(
      {
        message: 'Broadcast notification sent',
        recipients: count,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Broadcast notification error:', error)

    if (error instanceof ValidationError || error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
