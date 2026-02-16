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

async function assertMember(userId: string, boardId: string): Promise<void> {
  const result = await query(
    `SELECT 1 FROM whiteboards w
     LEFT JOIN whiteboard_members m ON w.id = m.board_id
     WHERE w.id = $1 AND (w.created_by = $2 OR m.user_id = $2)
     LIMIT 1`,
    [boardId, userId]
  )

  if (result.rows.length === 0) {
    throw new ApiError('Whiteboard not found', 404)
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserId(request)
    const boardId = params.id

    await assertMember(userId, boardId)

    const result = await query(
      `SELECT id, board_id as "boardId", type, x, y, width, height, content, color,
              created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
       FROM whiteboard_items
       WHERE board_id = $1
       ORDER BY created_at ASC`,
      [boardId]
    )

    return NextResponse.json({ items: result.rows }, { status: 200 })
  } catch (error) {
    console.error('Get whiteboard items error:', error)

    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserId(request)
    const boardId = params.id
    const body = await request.json()
    const { type, x, y, width, height, content, color } = body

    await assertMember(userId, boardId)

    if (!type || typeof type !== 'string') {
      throw new ValidationError('Item type is required')
    }

    const result = await query(
      `INSERT INTO whiteboard_items (board_id, type, x, y, width, height, content, color, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, board_id as "boardId", type, x, y, width, height, content, color,
                 created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"`,
      [
        boardId,
        type,
        Number.isFinite(x) ? x : 0,
        Number.isFinite(y) ? y : 0,
        Number.isFinite(width) ? width : 240,
        Number.isFinite(height) ? height : 160,
        content ? String(content) : null,
        color ? String(color) : 'sunrise',
        userId,
      ]
    )

    return NextResponse.json({ item: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error('Create whiteboard item error:', error)

    if (error instanceof ValidationError || error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
