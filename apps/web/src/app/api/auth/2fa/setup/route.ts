import { NextRequest, NextResponse } from 'next/server'
import { findUserById, verifyToken } from '@/app/api/data/auth-store'
import { ApiError } from '@/app/api/utils/errors'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'

export async function POST(req: NextRequest) {
  try {
    // Get access token from cookie
    const accessToken = req.cookies.get('access_token')?.value

    if (!accessToken) {
      throw new ApiError('Unauthorized', 401)
    }

    // Verify token
    const payload = verifyToken(accessToken)
    if (!payload) {
      throw new ApiError('Invalid or expired token', 401)
    }

    // Get user
    const user = await findUserById(payload.userId)
    if (!user) {
      throw new ApiError('User not found', 404)
    }

    // Check if 2FA is already enabled
    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: 'Two-factor authentication is already enabled' },
        { status: 400 }
      )
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `NEXORA (${user.email})`,
      issuer: 'NEXORA',
      length: 32,
    })

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url || '')

    // Return secret and QR code (don't save to DB yet - only after verification)
    return NextResponse.json(
      { 
        secret: secret.base32,
        qrCode,
        manualEntryKey: secret.base32,
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('2FA setup error:', error)
    
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
