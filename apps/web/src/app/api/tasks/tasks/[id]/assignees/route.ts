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

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserId(request)
    const taskId = params.id
    const body = await request.json()
    const { assigneeId } = body

    await assertTaskOwner(userId, taskId)

    if (!assigneeId || typeof assigneeId !== 'string') {
      throw new ValidationError('Assignee ID is required')
    }

    await query(
      `INSERT INTO task_assignees (task_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (task_id, user_id) DO NOTHING`,
      [taskId, assigneeId]
    )

    return NextResponse.json({ message: 'Assignee added' }, { status: 200 })
  } catch (error) {
    console.error('Add assignee error:', error)

    if (error instanceof ValidationError || error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserId(request)
    const taskId = params.id
    const { searchParams } = new URL(request.url)
    const queryText = searchParams.get('q')?.trim()

    await assertTaskOwner(userId, taskId)

    const assigneesResult = await query(
      `SELECT u.id, u.name, u.email, u.avatar_url as "avatarUrl"
       FROM task_assignees ta
       JOIN users u ON ta.user_id = u.id
       WHERE ta.task_id = $1
       ORDER BY u.name ASC`,
      [taskId]
    )

    const searchTerm = queryText ? `%${queryText}%` : null

    const candidatesResult = await query(
      `SELECT u.id, u.name, u.email, u.avatar_url as "avatarUrl"
       FROM users u
       WHERE ($1::text IS NULL OR u.name ILIKE $1 OR u.email ILIKE $1)
         AND u.id NOT IN (
           SELECT user_id FROM task_assignees WHERE task_id = $2
         )
       ORDER BY u.created_at DESC
       LIMIT 20`,
      [searchTerm, taskId]
    )

    return NextResponse.json(
      { assignees: assigneesResult.rows, candidates: candidatesResult.rows },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get assignees error:', error)

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
    const body = await request.json()
    const { assigneeId } = body

    await assertTaskOwner(userId, taskId)

    if (!assigneeId || typeof assigneeId !== 'string') {
      throw new ValidationError('Assignee ID is required')
    }

    const result = await query(
      'DELETE FROM task_assignees WHERE task_id = $1 AND user_id = $2',
      [taskId, assigneeId]
    )

    if ((result.rowCount ?? 0) === 0) {
      throw new ApiError('Assignee not found', 404)
    }

    return NextResponse.json({ message: 'Assignee removed' }, { status: 200 })
  } catch (error) {
    console.error('Remove assignee error:', error)

    if (error instanceof ValidationError || error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
