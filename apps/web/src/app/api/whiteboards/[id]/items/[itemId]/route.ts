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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const userId = await getUserId(request)
    const boardId = params.id
    const itemId = params.itemId
    const body = await request.json()
    const { x, y, width, height, content, color } = body

    await assertMember(userId, boardId)

    const result = await query(
      `UPDATE whiteboard_items
       SET x = COALESCE($1, x),
           y = COALESCE($2, y),
           width = COALESCE($3, width),
           height = COALESCE($4, height),
           content = COALESCE($5, content),
           color = COALESCE($6, color),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND board_id = $8
       RETURNING id, board_id as "boardId", type, x, y, width, height, content, color,
                 created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"`,
      [
        Number.isFinite(x) ? x : null,
        Number.isFinite(y) ? y : null,
        Number.isFinite(width) ? width : null,
        Number.isFinite(height) ? height : null,
        content !== undefined ? String(content) : null,
        color !== undefined ? String(color) : null,
        itemId,
        boardId,
      ]
    )

    if (result.rows.length === 0) {
      throw new ApiError('Item not found', 404)
    }

    return NextResponse.json({ item: result.rows[0] }, { status: 200 })
  } catch (error) {
    console.error('Update whiteboard item error:', error)

    if (error instanceof ValidationError || error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const userId = await getUserId(request)
    const boardId = params.id
    const itemId = params.itemId

    await assertMember(userId, boardId)

    const result = await query(
      'DELETE FROM whiteboard_items WHERE id = $1 AND board_id = $2',
      [itemId, boardId]
    )

    if ((result.rowCount ?? 0) === 0) {
      throw new ApiError('Item not found', 404)
    }

    return NextResponse.json({ message: 'Item deleted' }, { status: 200 })
  } catch (error) {
    console.error('Delete whiteboard item error:', error)

    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
