import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/app/api/data/db'
import { verifyToken, findUserById } from '@/app/api/data/auth-store'
import { ApiError, ValidationError } from '@/app/api/utils/errors'

async function getUserId(request: NextRequest): Promise<string> {
  const accessToken = request.cookies.get('access_token')?.value
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

  return user.id
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserId(request)
    const messageId = params.id
    const body = await request.json()
    const { content } = body

    if (!content || typeof content !== 'string') {
      throw new ValidationError('Message content is required')
    }

    const result = await query(
      `UPDATE chat_messages
       SET content = $1, edited_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3 AND deleted_at IS NULL
       RETURNING id, channel_id as "channelId", user_id as "userId", content,
                 thread_parent_id as "threadParentId", reply_count as "replyCount",
                 edited_at as "editedAt", deleted_at as "deletedAt", created_at as "createdAt"`,
      [content.trim(), messageId, userId]
    )

    if (result.rows.length === 0) {
      throw new ApiError('Message not found', 404)
    }

    return NextResponse.json({ message: result.rows[0] }, { status: 200 })
  } catch (error) {
    console.error('Update message error:', error)

    if (error instanceof ValidationError || error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserId(request)
    const messageId = params.id

    const result = await query(
      `UPDATE chat_messages
       SET deleted_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [messageId, userId]
    )

    if ((result.rowCount ?? 0) === 0) {
      throw new ApiError('Message not found', 404)
    }

    return NextResponse.json({ message: 'Message deleted' }, { status: 200 })
  } catch (error) {
    console.error('Delete message error:', error)

    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
