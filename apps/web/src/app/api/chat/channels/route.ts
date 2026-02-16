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

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request)

    const result = await query(
      `SELECT DISTINCT c.id, c.name, c.description, c.is_private as "isPrivate",
              c.created_by as "createdBy", c.created_at as "createdAt", c.updated_at as "updatedAt"
       FROM chat_channels c
       LEFT JOIN chat_members m ON c.id = m.channel_id
       WHERE c.created_by = $1 OR m.user_id = $1
       ORDER BY c.updated_at DESC`,
      [userId]
    )

    return NextResponse.json({ channels: result.rows }, { status: 200 })
  } catch (error) {
    console.error('Get channels error:', error)

    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    const body = await request.json()
    const { name, description, isPrivate } = body

    if (!name || typeof name !== 'string') {
      throw new ValidationError('Channel name is required')
    }

    const result = await query(
      `INSERT INTO chat_channels (name, description, is_private, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, description, is_private as "isPrivate",
                 created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"`,
      [name.trim(), description ? String(description).trim() : null, Boolean(isPrivate), userId]
    )

    const channel = result.rows[0]

    await query(
      `INSERT INTO chat_members (channel_id, user_id, role)
       VALUES ($1, $2, 'owner')
       ON CONFLICT (channel_id, user_id) DO NOTHING`,
      [channel.id, userId]
    )

    return NextResponse.json({ channel }, { status: 201 })
  } catch (error) {
    console.error('Create channel error:', error)

    if (error instanceof ValidationError || error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
