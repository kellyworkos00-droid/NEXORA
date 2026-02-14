import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, findUserById, getAllUsers, getUserCount } from '@/app/api/data/auth-store'
import { ApiError } from '@/app/api/utils/errors'

// Middleware to check admin role
async function checkAdmin(accessToken: string | undefined) {
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

  if (user.role !== 'admin') {
    throw new ApiError('Forbidden: Admin access required', 403)
  }

  return user
}

export async function GET(req: NextRequest) {
  try {
    const accessToken = req.cookies.get('access_token')?.value
    await checkAdmin(accessToken)

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get users
    const users = await getAllUsers(limit, offset)
    const totalCount = await getUserCount()

    return NextResponse.json(
      {
        users,
        pagination: {
          limit,
          offset,
          total: totalCount,
          hasMore: offset + users.length < totalCount,
        },
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Get users error:', error)
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
