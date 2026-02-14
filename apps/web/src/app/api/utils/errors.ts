// Standardized API error responses
export class ApiError extends Error {
  statusCode: number
  details?: any

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.details = details
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, 400, details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 401)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(message, 404)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, 409, details)
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = 'Too many requests', details?: any) {
    super(message, 429, details)
    this.name = 'RateLimitError'
  }
}

export function formatErrorResponse(error: any) {
  if (error instanceof ApiError) {
    return {
      success: false,
      error: error.message,
      ...(error.details && { details: error.details }),
    }
  }

  // Generic error
  return {
    success: false,
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: error.message }),
  }
}

export function getStatusCode(error: any): number {
  if (error instanceof ApiError) {
    return error.statusCode
  }
  return 500
}
