import { NextRequest, NextResponse } from 'next/server'

// Request logger middleware
export function logRequest(request: NextRequest, context?: Record<string, any>) {
  const timestamp = new Date().toISOString()
  const method = request.method
  const url = request.nextUrl.pathname
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  const logData = {
    timestamp,
    method,
    url,
    ip,
    userAgent,
    ...context,
  }

  // In production, send to logging service (Datadog, Sentry, etc.)
  console.log('[API]', JSON.stringify(logData))
}

// Security headers
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  )
  
  return response
}

// Sanitize user input
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .substring(0, 1000) // Limit length
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 255
}

// Validate password strength
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' }
  }
  
  if (password.length > 128) {
    return { valid: false, message: 'Password is too long' }
  }
  
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  
  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    return { 
      valid: false, 
      message: 'Password must contain uppercase, lowercase, and numbers' 
    }
  }
  
  return { valid: true }
}

// Parse and validate request body
export async function parseRequestBody<T = any>(request: NextRequest): Promise<T> {
  try {
    const body = await request.json()
    
    // Sanitize all string values
    const sanitized: any = {}
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeInput(value)
      } else {
        sanitized[key] = value
      }
    }
    
    return sanitized as T
  } catch {
    throw new Error('Invalid JSON body')
  }
}
