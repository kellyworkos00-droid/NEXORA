import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/app/api/data/db'
import { verifyToken, findUserById } from '@/app/api/data/auth-store'
import { ApiError } from '@/app/api/utils/errors'

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
    const queryText = searchParams.get('q')?.trim()
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    if (!listId) {
      return NextResponse.json({ tasks: [] }, { status: 200 })
    }

    const normalizedQuery = queryText ? `%${queryText}%` : null

    const result = await query(
      `SELECT t.id, t.list_id as "listId", t.title, t.description, t.status, t.priority,
              t.due_at as "dueAt", t.order_index as "orderIndex",
              t.created_by as "createdBy", t.created_at as "createdAt", t.updated_at as "updatedAt",
              l.name as "listName"
       FROM tasks t
       JOIN task_lists l ON t.list_id = l.id
       WHERE l.created_by = $1
         AND t.list_id = $2
         AND ($3::text IS NULL OR t.title ILIKE $3 OR t.description ILIKE $3)
         AND ($4::text IS NULL OR t.status = $4)
         AND ($5::text IS NULL OR t.priority = $5)
       ORDER BY t.updated_at DESC
       LIMIT 200`,
      [userId, listId, normalizedQuery, status || null, priority || null]
    )

    return NextResponse.json({ tasks: result.rows }, { status: 200 })
  } catch (error) {
    console.error('Search tasks error:', error)

    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
