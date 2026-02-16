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

async function assertThreadAccess(userId: string, messageId: string): Promise<void> {
  const result = await query(
    `SELECT 1
     FROM chat_messages m
     LEFT JOIN chat_channels c ON m.channel_id = c.id
     LEFT JOIN chat_members cm ON c.id = cm.channel_id
     WHERE m.id = $1 AND (c.created_by = $2 OR cm.user_id = $2)
     LIMIT 1`,
    [messageId, userId]
  )

  if (result.rows.length === 0) {
    throw new ApiError('Message not found', 404)
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserId(request)
    const messageId = params.id

    await assertThreadAccess(userId, messageId)

    const result = await query(
      `SELECT m.id, m.channel_id as "channelId", m.user_id as "userId",
              m.content, m.thread_parent_id as "threadParentId",
              m.reply_count as "replyCount", m.edited_at as "editedAt",
              m.deleted_at as "deletedAt", m.created_at as "createdAt",
              u.name as "userName", u.avatar_url as "userAvatar"
       FROM chat_messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.thread_parent_id = $1
       ORDER BY m.created_at ASC`,
      [messageId]
    )

    return NextResponse.json({ replies: result.rows }, { status: 200 })
  } catch (error) {
    console.error('Get thread error:', error)

    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserId(request)
    const messageId = params.id
    const body = await request.json()
    const { content } = body

    await assertThreadAccess(userId, messageId)

    if (!content || typeof content !== 'string') {
      throw new ValidationError('Reply content is required')
    }

    const result = await query(
      `INSERT INTO chat_messages (channel_id, user_id, content, thread_parent_id)
       SELECT channel_id, $1, $2, id FROM chat_messages WHERE id = $3
       RETURNING id, channel_id as "channelId", user_id as "userId", content,
                 thread_parent_id as "threadParentId", reply_count as "replyCount",
                 edited_at as "editedAt", deleted_at as "deletedAt", created_at as "createdAt"`,
      [userId, content.trim(), messageId]
    )

    if (result.rows.length === 0) {
      throw new ApiError('Message not found', 404)
    }

    await query(
      'UPDATE chat_messages SET reply_count = reply_count + 1 WHERE id = $1',
      [messageId]
    )

    return NextResponse.json({ reply: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error('Create reply error:', error)

    if (error instanceof ValidationError || error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
