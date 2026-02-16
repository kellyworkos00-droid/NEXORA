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

async function assertSprintOwner(userId: string, sprintId: string) {
  const result = await query(
    `SELECT 1
     FROM task_sprints s
     JOIN task_lists l ON s.list_id = l.id
     WHERE s.id = $1 AND l.created_by = $2`,
    [sprintId, userId]
  )

  if (result.rows.length === 0) {
    throw new ApiError('Sprint not found', 404)
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserId(request)
    const sprintId = params.id

    await assertSprintOwner(userId, sprintId)

    const result = await query(
      `SELECT t.id, t.list_id as "listId", t.title, t.description, t.status, t.priority,
              t.due_at as "dueAt", t.order_index as "orderIndex",
              t.created_by as "createdBy", t.created_at as "createdAt", t.updated_at as "updatedAt"
       FROM task_sprint_items si
       JOIN tasks t ON si.task_id = t.id
       WHERE si.sprint_id = $1
       ORDER BY t.order_index ASC, t.created_at DESC`,
      [sprintId]
    )

    return NextResponse.json({ tasks: result.rows }, { status: 200 })
  } catch (error) {
    console.error('Get sprint items error:', error)

    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserId(request)
    const sprintId = params.id
    const body = await request.json()
    const { taskId } = body

    await assertSprintOwner(userId, sprintId)

    if (!taskId || typeof taskId !== 'string') {
      throw new ValidationError('taskId is required')
    }

    await query(
      `INSERT INTO task_sprint_items (sprint_id, task_id)
       VALUES ($1, $2)
       ON CONFLICT (sprint_id, task_id) DO NOTHING`,
      [sprintId, taskId]
    )

    return NextResponse.json({ message: 'Task added to sprint' }, { status: 200 })
  } catch (error) {
    console.error('Add sprint item error:', error)

    if (error instanceof ValidationError || error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserId(request)
    const sprintId = params.id
    const body = await request.json()
    const { taskId } = body

    await assertSprintOwner(userId, sprintId)

    if (!taskId || typeof taskId !== 'string') {
      throw new ValidationError('taskId is required')
    }

    await query('DELETE FROM task_sprint_items WHERE sprint_id = $1 AND task_id = $2', [sprintId, taskId])

    return NextResponse.json({ message: 'Task removed from sprint' }, { status: 200 })
  } catch (error) {
    console.error('Remove sprint item error:', error)

    if (error instanceof ValidationError || error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
