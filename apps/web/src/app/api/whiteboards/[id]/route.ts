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

    const boardResult = await query(
      `SELECT id, name, description, created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
       FROM whiteboards WHERE id = $1`,
      [boardId]
    )

    if (boardResult.rows.length === 0) {
      throw new ApiError('Whiteboard not found', 404)
    }

    return NextResponse.json({ board: boardResult.rows[0] }, { status: 200 })
  } catch (error) {
    console.error('Get whiteboard error:', error)

    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserId(request)
    const boardId = params.id
    const body = await request.json()
    const { name, description } = body

    await assertMember(userId, boardId)

    if (name !== undefined && typeof name !== 'string') {
      throw new ValidationError('Invalid board name')
    }

    if (description !== undefined && typeof description !== 'string') {
      throw new ValidationError('Invalid description')
    }

    const result = await query(
      `UPDATE whiteboards
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, name, description, created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"`,
      [name ? name.trim() : null, description ? description.trim() : null, boardId]
    )

    if (result.rows.length === 0) {
      throw new ApiError('Whiteboard not found', 404)
    }

    return NextResponse.json({ board: result.rows[0] }, { status: 200 })
  } catch (error) {
    console.error('Update whiteboard error:', error)

    if (error instanceof ValidationError || error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserId(request)
    const boardId = params.id

    await assertMember(userId, boardId)

    await query('DELETE FROM whiteboards WHERE id = $1', [boardId])

    return NextResponse.json({ message: 'Whiteboard deleted' }, { status: 200 })
  } catch (error) {
    console.error('Delete whiteboard error:', error)

    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
