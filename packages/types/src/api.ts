// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: ResponseMeta
}

export interface ApiError {
  code: string
  message: string
  details?: any
}

export interface ResponseMeta {
  page?: number
  limit?: number
  total?: number
  timestamp: string
}

// Pagination
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Filters
export interface FilterParams {
  search?: string
  filters?: Record<string, any>
  dateRange?: {
    start: string
    end: string
  }
}
