'use client'

import { AlertCircle, Loader, TrendingUp } from 'lucide-react'

interface LoadingSkeletonProps {
  count?: number
}

export function LoadingSkeleton({ count = 1 }: LoadingSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-12 bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-xl"></div>
        </div>
      ))}
    </div>
  )
}

interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-gradient-to-br from-red-50 to-red-50/50 dark:from-red-900/20 dark:to-red-800/10 p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5 sm:mt-1" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-red-800 dark:text-red-200 text-sm sm:text-base">Something went wrong</h3>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1 leading-relaxed">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-sm font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              Try again →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8 sm:py-12">
      <div className="relative">
        <Loader className={`${sizeClasses[size]} animate-spin text-orange-500 dark:text-orange-400`} />
      </div>
      {text && <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">{text}</p>}
    </div>
  )
}

interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-slate-50/50 dark:from-slate-900/30 dark:to-slate-900/10 p-6 sm:p-12 text-center min-h-96 flex flex-col items-center justify-center">
      {icon ? (
        <div className="mb-4 text-5xl sm:text-6xl opacity-30 transform transition-transform hover:scale-110">{icon}</div>
      ) : (
        <div className="mb-4 p-3 sm:p-4 rounded-lg bg-gradient-to-br from-orange-100 to-rose-100 dark:from-orange-900/20 dark:to-rose-900/20">
          <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 dark:text-orange-400" />
        </div>
      )}
      <h3 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">{title}</h3>
      {description && (
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 leading-relaxed max-w-md">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 dark:from-orange-600 dark:to-rose-600 hover:from-orange-600 hover:to-rose-600 text-white rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
