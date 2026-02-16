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
    const { searchParams } = new URL(request.url)
    const listId = searchParams.get('listId')

    if (!listId) {
      throw new ValidationError('listId is required')
    }

    const result = await query(
      `SELECT s.id, s.list_id as "listId", s.name, s.goal,
              s.start_at as "startAt", s.end_at as "endAt", s.status,
              s.created_by as "createdBy", s.created_at as "createdAt", s.updated_at as "updatedAt"
       FROM task_sprints s
       JOIN task_lists l ON s.list_id = l.id
       WHERE s.list_id = $1 AND l.created_by = $2
       ORDER BY s.created_at DESC`,
      [listId, userId]
    )

    return NextResponse.json({ sprints: result.rows }, { status: 200 })
  } catch (error) {
    console.error('Get sprints error:', error)

    if (error instanceof ValidationError || error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    const body = await request.json()
    const { listId, name, goal, startAt, endAt, status } = body

    if (!listId || typeof listId !== 'string') {
      throw new ValidationError('listId is required')
    }

    if (!name || typeof name !== 'string') {
      throw new ValidationError('Sprint name is required')
    }

    const result = await query(
      `INSERT INTO task_sprints (list_id, name, goal, start_at, end_at, status, created_by)
       SELECT $1, $2, $3, $4, $5, $6, $7
       FROM task_lists
       WHERE id = $1 AND created_by = $7
       RETURNING id, list_id as "listId", name, goal,
                 start_at as "startAt", end_at as "endAt", status,
                 created_by as "createdBy", created_at as "createdAt", updated_at as "updatedAt"`,
      [
        listId,
        name.trim(),
        goal ? String(goal).trim() : null,
        startAt ? new Date(startAt) : null,
        endAt ? new Date(endAt) : null,
        status || 'planned',
        userId,
      ]
    )

    if (result.rows.length === 0) {
      throw new ApiError('Task list not found', 404)
    }

    return NextResponse.json({ sprint: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error('Create sprint error:', error)

    if (error instanceof ValidationError || error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
