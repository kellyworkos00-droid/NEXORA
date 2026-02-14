'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
}

const toastColors = {
  success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
  error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
}

interface ToastItemProps {
  toast: Toast
  onClose: (id: string) => void
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const Icon = toastIcons[toast.type]
  const colorClass = toastColors[toast.type]

  useEffect(() => {
    const duration = toast.duration || 5000
    const timer = setTimeout(() => {
      onClose(toast.id)
    }, duration)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onClose])

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300 ${colorClass}`}
      role="alert"
    >
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="font-semibold">{toast.title}</h4>
        {toast.message && <p className="text-sm mt-1 opacity-90">{toast.message}</p>}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Close"
      >
        <XCircle className="h-4 w-4" />
      </button>
    </div>
  )
}

let toastCounter = 0
const toastListeners = new Set<(toasts: Toast[]) => void>()
let toastsState: Toast[] = []

function notifyListeners() {
  toastListeners.forEach(listener => listener([...toastsState]))
}

export const toast = {
  success: (title: string, message?: string, duration?: number) => {
    const id = `toast-${++toastCounter}`
    toastsState.push({ id, type: 'success', title, message, duration })
    notifyListeners()
  },
  error: (title: string, message?: string, duration?: number) => {
    const id = `toast-${++toastCounter}`
    toastsState.push({ id, type: 'error', title, message, duration })
    notifyListeners()
  },
  warning: (title: string, message?: string, duration?: number) => {
    const id = `toast-${++toastCounter}`
    toastsState.push({ id, type: 'warning', title, message, duration })
    notifyListeners()
  },
  info: (title: string, message?: string, duration?: number) => {
    const id = `toast-${++toastCounter}`
    toastsState.push({ id, type: 'info', title, message, duration })
    notifyListeners()
  },
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    toastListeners.add(setToasts)
    return () => {
      toastListeners.delete(setToasts)
    }
  }, [])

  const removeToast = (id: string) => {
    toastsState = toastsState.filter(t => t.id !== id)
    notifyListeners()
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onClose={removeToast} />
        </div>
      ))}
    </div>
  )
}
