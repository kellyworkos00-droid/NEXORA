'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Customer, Deal, Activity } from '@/app/api/data/store'

interface UseQueryOptions {
  skip?: boolean
  refetchInterval?: number
}

interface UseQueryResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

// Custom hook for fetching data
function useQuery<T>(
  url: string,
  options: UseQueryOptions = {}
): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'API Error')
      }

      setData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    if (options.skip) return

    fetchData()

    if (options.refetchInterval) {
      const interval = setInterval(fetchData, options.refetchInterval)
      return () => clearInterval(interval)
    }
  }, [fetchData, options.skip, options.refetchInterval])

  return { data, loading, error, refetch: fetchData }
}

// Customers hooks
export function useCustomers(options: UseQueryOptions = {}): UseQueryResult<Customer[]> {
  return useQuery<Customer[]>('/api/customers', options)
}

export function useCustomer(id: string, options: UseQueryOptions = {}): UseQueryResult<Customer> {
  return useQuery<Customer>(`/api/customers/${id}`, options)
}

// Deals hooks  
export function useDeals(customerId?: string, options: UseQueryOptions = {}): UseQueryResult<Deal[]> {
  const url = customerId ? `/api/deals?customerId=${customerId}` : '/api/deals'
  return useQuery<Deal[]>(url, options)
}

// Activities hooks
export function useActivities(customerId?: string, options: UseQueryOptions = {}): UseQueryResult<Activity[]> {
  const url = customerId ? `/api/activities?customerId=${customerId}` : '/api/activities'
  return useQuery<Activity[]>(url, options)
}

// Mutation hooks for creating/updating/deleting
export function useMutation<T>(url: string, method: 'POST' | 'PUT' | 'DELETE') {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutate = useCallback(
    async (body?: any): Promise<T | null> => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: body ? JSON.stringify(body) : undefined,
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'API Error')
        }

        return result.data
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [url, method]
  )

  return { mutate, loading, error }
}

export function useCreateCustomer() {
  return useMutation('/api/customers', 'POST')
}

export function useUpdateCustomer(id: string) {
  return useMutation(`/api/customers/${id}`, 'PUT')
}

export function useDeleteCustomer(id: string) {
  return useMutation(`/api/customers/${id}`, 'DELETE')
}

export function useCreateDeal() {
  return useMutation('/api/deals', 'POST')
}

export function useCreateActivity() {
  return useMutation('/api/activities', 'POST')
}
