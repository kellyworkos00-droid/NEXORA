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

async function assertMember(userId: string, channelId: string) {
  const result = await query(
    `SELECT 1 FROM chat_channels c
     LEFT JOIN chat_members m ON c.id = m.channel_id
     WHERE c.id = $1 AND (c.created_by = $2 OR m.user_id = $2)
     LIMIT 1`,
    [channelId, userId]
  )

  if (result.rows.length === 0) {
    throw new ApiError('Channel not found', 404)
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserId(request)
    const channelId = params.id

    await assertMember(userId, channelId)

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const before = searchParams.get('before')

    if (limit < 1 || limit > 100) {
      throw new ApiError('Limit must be between 1 and 100', 400)
    }

    const result = await query(
      `SELECT m.id, m.channel_id as "channelId", m.user_id as "userId",
              m.content, m.thread_parent_id as "threadParentId",
              m.reply_count as "replyCount", m.edited_at as "editedAt",
              m.deleted_at as "deletedAt", m.created_at as "createdAt",
              u.name as "userName", u.avatar_url as "userAvatar"
       FROM chat_messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.channel_id = $1
         AND m.thread_parent_id IS NULL
         AND ($2::timestamp IS NULL OR m.created_at < $2::timestamp)
       ORDER BY m.created_at DESC
       LIMIT $3`,
      [channelId, before || null, limit]
    )

    return NextResponse.json({ messages: result.rows.reverse() }, { status: 200 })
  } catch (error) {
    console.error('Get messages error:', error)

    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserId(request)
    const channelId = params.id
    const body = await request.json()
    const { content } = body

    await assertMember(userId, channelId)

    if (!content || typeof content !== 'string') {
      throw new ValidationError('Message content is required')
    }

    const result = await query(
      `INSERT INTO chat_messages (channel_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, channel_id as "channelId", user_id as "userId", content,
                 thread_parent_id as "threadParentId", reply_count as "replyCount",
                 edited_at as "editedAt", deleted_at as "deletedAt", created_at as "createdAt"`,
      [channelId, userId, content.trim()]
    )

    const message = result.rows[0]

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Create message error:', error)

    if (error instanceof ValidationError || error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
