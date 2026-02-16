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

async function assertReactionAccess(userId: string, messageId: string): Promise<void> {
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

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserId(request)
    const messageId = params.id
    const body = await request.json()
    const { emoji } = body

    await assertReactionAccess(userId, messageId)

    if (!emoji || typeof emoji !== 'string') {
      throw new ValidationError('Emoji is required')
    }

    await query(
      `INSERT INTO chat_reactions (message_id, user_id, emoji)
       VALUES ($1, $2, $3)
       ON CONFLICT (message_id, user_id, emoji) DO NOTHING`,
      [messageId, userId, emoji]
    )

    return NextResponse.json({ message: 'Reaction added' }, { status: 200 })
  } catch (error) {
    console.error('Add reaction error:', error)

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
    const body = await request.json()
    const { emoji } = body

    await assertReactionAccess(userId, messageId)

    if (!emoji || typeof emoji !== 'string') {
      throw new ValidationError('Emoji is required')
    }

    const result = await query(
      'DELETE FROM chat_reactions WHERE message_id = $1 AND user_id = $2 AND emoji = $3',
      [messageId, userId, emoji]
    )

    if ((result.rowCount ?? 0) === 0) {
      throw new ApiError('Reaction not found', 404)
    }

    return NextResponse.json({ message: 'Reaction removed' }, { status: 200 })
  } catch (error) {
    console.error('Remove reaction error:', error)

    if (error instanceof ValidationError || error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
