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
      `SELECT DISTINCT w.id, w.name, w.description, w.created_by as "createdBy",
              w.created_at as "createdAt", w.updated_at as "updatedAt"
       FROM whiteboards w
       LEFT JOIN whiteboard_members m ON w.id = m.board_id
       WHERE w.created_by = $1 OR m.user_id = $1
       ORDER BY w.updated_at DESC`,
      [userId]
    )

    return NextResponse.json({ boards: result.rows }, { status: 200 })
  } catch (error) {
    console.error('Get whiteboards error:', error)

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
    const { name, description } = body

    if (!name || typeof name !== 'string') {
      throw new ValidationError('Board name is required')
    }

    const result = await query(
      `INSERT INTO whiteboards (name, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING id, name, description, created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"`,
      [name.trim(), description ? String(description).trim() : null, userId]
    )

    const board = result.rows[0]

    await query(
      `INSERT INTO whiteboard_members (board_id, user_id, role)
       VALUES ($1, $2, 'owner')
       ON CONFLICT (board_id, user_id) DO NOTHING`,
      [board.id, userId]
    )

    return NextResponse.json({ board }, { status: 201 })
  } catch (error) {
    console.error('Create whiteboard error:', error)

    if (error instanceof ValidationError || error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
