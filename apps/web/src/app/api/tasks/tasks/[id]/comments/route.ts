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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserId(request)
    const taskId = params.id

    await assertTaskOwner(userId, taskId)

    const result = await query(
      `SELECT c.id, c.task_id as "taskId", c.user_id as "userId", c.content,
              c.created_at as "createdAt", u.name as "userName", u.avatar_url as "userAvatar"
       FROM task_comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.task_id = $1
       ORDER BY c.created_at ASC`,
      [taskId]
    )

    return NextResponse.json({ comments: result.rows }, { status: 200 })
  } catch (error) {
    console.error('Get task comments error:', error)

    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserId(request)
    const taskId = params.id
    const body = await request.json()
    const { content } = body

    await assertTaskOwner(userId, taskId)

    if (!content || typeof content !== 'string') {
      throw new ValidationError('Comment content is required')
    }

    const result = await query(
      `INSERT INTO task_comments (task_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, task_id as "taskId", user_id as "userId", content, created_at as "createdAt"`,
      [taskId, userId, content.trim()]
    )

    return NextResponse.json({ comment: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error('Create task comment error:', error)

    if (error instanceof ValidationError || error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
