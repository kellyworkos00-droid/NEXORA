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

    const result = await query(
      `SELECT id, name, description, color, created_by as "createdBy",
              created_at as "createdAt", updated_at as "updatedAt"
       FROM task_lists
       WHERE created_by = $1
       ORDER BY updated_at DESC`,
      [userId]
    )

    return NextResponse.json({ lists: result.rows }, { status: 200 })
  } catch (error) {
    console.error('Get task lists error:', error)

    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    const body = await request.json()
    const { name, description, color } = body

    if (!name || typeof name !== 'string') {
      throw new ValidationError('List name is required')
    }

    const result = await query(
      `INSERT INTO task_lists (name, description, color, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, description, color, created_by as "createdBy",
                 created_at as "createdAt", updated_at as "updatedAt"`,
      [name.trim(), description ? String(description).trim() : null, color ? String(color) : 'sunrise', userId]
    )

    return NextResponse.json({ list: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error('Create task list error:', error)

    if (error instanceof ValidationError || error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
