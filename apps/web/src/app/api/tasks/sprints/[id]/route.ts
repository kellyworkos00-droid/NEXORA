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

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserId(request)
    const sprintId = params.id
    const body = await request.json()
    const { name, goal, startAt, endAt, status } = body

    await assertSprintOwner(userId, sprintId)

    if (name !== undefined && typeof name !== 'string') {
      throw new ValidationError('Invalid sprint name')
    }

    const result = await query(
      `UPDATE task_sprints
       SET name = COALESCE($1, name),
           goal = COALESCE($2, goal),
           start_at = COALESCE($3, start_at),
           end_at = COALESCE($4, end_at),
           status = COALESCE($5, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING id, list_id as "listId", name, goal,
                 start_at as "startAt", end_at as "endAt", status,
                 created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"`,
      [
        name ? name.trim() : null,
        goal ? String(goal).trim() : null,
        startAt ? new Date(startAt) : null,
        endAt ? new Date(endAt) : null,
        status || null,
        sprintId,
      ]
    )

    return NextResponse.json({ sprint: result.rows[0] }, { status: 200 })
  } catch (error) {
    console.error('Update sprint error:', error)

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

    await assertSprintOwner(userId, sprintId)

    await query('DELETE FROM task_sprints WHERE id = $1', [sprintId])

    return NextResponse.json({ message: 'Sprint deleted' }, { status: 200 })
  } catch (error) {
    console.error('Delete sprint error:', error)

    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
