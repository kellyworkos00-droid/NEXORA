import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, findUserById, updateUserRole, deleteUserAccount } from '@/app/api/data/auth-store'
import { ApiError, ValidationError } from '@/app/api/utils/errors'

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const accessToken = req.cookies.get('access_token')?.value
    const admin = await checkAdmin(accessToken)

    const userId = params.id
    const body = await req.json()
    const { role } = body

    // Validate input
    if (!role || typeof role !== 'string') {
      throw new ValidationError('Role is required')
    }

    if (!['user', 'admin'].includes(role)) {
      throw new ValidationError('Invalid role value')
    }

    // Prevent admin from changing their own role
    if (userId === admin.id) {
      throw new ApiError('Cannot change your own role', 400)
    }

    // Update user role
    const success = await updateUserRole(userId, role)

    if (!success) {
      throw new ApiError('Failed to update user role', 500)
    }

    // Get updated user
    const user = await findUserById(userId)

    return NextResponse.json(
      {
        message: 'User role updated successfully',
        user,
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Update user role error:', error)
    
    if (error instanceof ValidationError || error instanceof ApiError) {
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const accessToken = req.cookies.get('access_token')?.value
    const admin = await checkAdmin(accessToken)

    const userId = params.id

    // Prevent admin from deleting themselves
    if (userId === admin.id) {
      throw new ApiError('Cannot delete your own account', 400)
    }

    // Delete user
    const success = await deleteUserAccount(userId)

    if (!success) {
      throw new ApiError('Failed to delete user', 500)
    }

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Delete user error:', error)
    
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
