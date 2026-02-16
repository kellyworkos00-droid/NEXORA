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

    const result = await query(
      `SELECT id, name, description, is_private as "isPrivate",
              created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
       FROM chat_channels
       WHERE id = $1`,
      [channelId]
    )

    if (result.rows.length === 0) {
      throw new ApiError('Channel not found', 404)
    }

    return NextResponse.json({ channel: result.rows[0] }, { status: 200 })
  } catch (error) {
    console.error('Get channel error:', error)

    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserId(request)
    const channelId = params.id
    const body = await request.json()
    const { name, description, isPrivate } = body

    await assertMember(userId, channelId)

    if (name !== undefined && typeof name !== 'string') {
      throw new ValidationError('Invalid channel name')
    }

    if (description !== undefined && typeof description !== 'string') {
      throw new ValidationError('Invalid description')
    }

    const result = await query(
      `UPDATE chat_channels
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           is_private = COALESCE($3, is_private),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, name, description, is_private as "isPrivate",
                 created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"`,
      [name ? name.trim() : null, description ? description.trim() : null, isPrivate, channelId]
    )

    if (result.rows.length === 0) {
      throw new ApiError('Channel not found', 404)
    }

    return NextResponse.json({ channel: result.rows[0] }, { status: 200 })
  } catch (error) {
    console.error('Update channel error:', error)

    if (error instanceof ValidationError || error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserId(request)
    const channelId = params.id

    await assertMember(userId, channelId)

    await query('DELETE FROM chat_channels WHERE id = $1', [channelId])

    return NextResponse.json({ message: 'Channel deleted' }, { status: 200 })
  } catch (error) {
    console.error('Delete channel error:', error)

    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
