'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

interface LoadingStateProps {
  message?: string
}

export function AuthLoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  )
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: { redirectTo?: string } = {}
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, loading } = useAuth()
    const router = useRouter()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
      setMounted(true)
    }, [])

    useEffect(() => {
      if (mounted && !loading && !isAuthenticated) {
        const redirectPath = options.redirectTo || '/login'
        router.push(redirectPath)
      }
    }, [mounted, loading, isAuthenticated, router])

    if (!mounted || loading) {
      return <AuthLoadingState message="Verifying authentication..." />
    }

    if (!isAuthenticated) {
      return <AuthLoadingState message="Redirecting to login..." />
    }

    return <Component {...props} />
  }
}

// Hook for protecting routes
export function useRequireAuth(redirectTo: string = '/login') {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [mounted, loading, isAuthenticated, redirectTo, router])

  return { isAuthenticated, loading, mounted }
}
