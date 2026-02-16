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

async function assertTaskOwner(userId: string, taskId: string) {
  const result = await query(
    `SELECT 1
     FROM tasks t
     JOIN task_lists l ON t.list_id = l.id
     WHERE t.id = $1 AND l.created_by = $2`,
    [taskId, userId]
  )

  if (result.rows.length === 0) {
    throw new ApiError('Task not found', 404)
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserId(request)
    const taskId = params.id
    const body = await request.json()
    const { title, description, status, priority, dueAt, orderIndex } = body

    await assertTaskOwner(userId, taskId)

    if (title !== undefined && typeof title !== 'string') {
      throw new ValidationError('Invalid title')
    }

    if (description !== undefined && typeof description !== 'string') {
      throw new ValidationError('Invalid description')
    }

    const result = await query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           priority = COALESCE($4, priority),
           due_at = COALESCE($5, due_at),
           order_index = COALESCE($6, order_index),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING id, list_id as "listId", title, description, status, priority,
                 due_at as "dueAt", order_index as "orderIndex",
                 created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"`,
      [
        title ? title.trim() : null,
        description ? description.trim() : null,
        status || null,
        priority || null,
        dueAt ? new Date(dueAt) : null,
        Number.isFinite(orderIndex) ? orderIndex : null,
        taskId,
      ]
    )

    return NextResponse.json({ task: result.rows[0] }, { status: 200 })
  } catch (error) {
    console.error('Update task error:', error)

    if (error instanceof ValidationError || error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserId(request)
    const taskId = params.id

    await assertTaskOwner(userId, taskId)

    await query('DELETE FROM tasks WHERE id = $1', [taskId])

    return NextResponse.json({ message: 'Task deleted' }, { status: 200 })
  } catch (error) {
    console.error('Delete task error:', error)

    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
