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
      `SELECT id, list_id as "listId", title, description, status, priority,
              due_at as "dueAt", order_index as "orderIndex",
              created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"
       FROM tasks
       WHERE list_id = $1
       ORDER BY order_index ASC, created_at DESC`,
      [listId]
    )

    return NextResponse.json({ tasks: result.rows }, { status: 200 })
  } catch (error) {
    console.error('Get tasks error:', error)

    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserId(request)
    const listId = params.id
    const body = await request.json()
    const { title, description, status, priority, dueAt } = body

    await assertOwner(userId, listId)

    if (!title || typeof title !== 'string') {
      throw new ValidationError('Task title is required')
    }

    const result = await query(
      `INSERT INTO tasks (list_id, title, description, status, priority, due_at, created_by, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7, (SELECT COALESCE(MAX(order_index), 0) + 1 FROM tasks WHERE list_id = $1))
       RETURNING id, list_id as "listId", title, description, status, priority,
                 due_at as "dueAt", order_index as "orderIndex",
                 created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"`,
      [
        listId,
        title.trim(),
        description ? String(description).trim() : null,
        status || 'todo',
        priority || 'medium',
        dueAt ? new Date(dueAt) : null,
        userId,
      ]
    )

    return NextResponse.json({ task: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error('Create task error:', error)

    if (error instanceof ValidationError || error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
