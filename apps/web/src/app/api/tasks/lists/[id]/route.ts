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

async function assertOwner(userId: string, listId: string) {
  const result = await query(
    'SELECT 1 FROM task_lists WHERE id = $1 AND created_by = $2',
    [listId, userId]
  )

  if (result.rows.length === 0) {
    throw new ApiError('Task list not found', 404)
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserId(request)
    const listId = params.id

    await assertOwner(userId, listId)

    const result = await query(
      `SELECT id, name, description, color, created_by as "createdBy",
              created_at as "createdAt", updated_at as "updatedAt"
       FROM task_lists
       WHERE id = $1`,
      [listId]
    )

    return NextResponse.json({ list: result.rows[0] }, { status: 200 })
  } catch (error) {
    console.error('Get task list error:', error)

    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserId(request)
    const listId = params.id
    const body = await request.json()
    const { name, description, color } = body

    await assertOwner(userId, listId)

    if (name !== undefined && typeof name !== 'string') {
      throw new ValidationError('Invalid list name')
    }

    if (description !== undefined && typeof description !== 'string') {
      throw new ValidationError('Invalid description')
    }

    const result = await query(
      `UPDATE task_lists
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           color = COALESCE($3, color),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, name, description, color, created_by as "createdBy",
                 created_at as "createdAt", updated_at as "updatedAt"`,
      [name ? name.trim() : null, description ? description.trim() : null, color ? String(color) : null, listId]
    )

    return NextResponse.json({ list: result.rows[0] }, { status: 200 })
  } catch (error) {
    console.error('Update task list error:', error)

    if (error instanceof ValidationError || error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserId(request)
    const listId = params.id

    await assertOwner(userId, listId)

    await query('DELETE FROM task_lists WHERE id = $1', [listId])

    return NextResponse.json({ message: 'Task list deleted' }, { status: 200 })
  } catch (error) {
    console.error('Delete task list error:', error)

    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
