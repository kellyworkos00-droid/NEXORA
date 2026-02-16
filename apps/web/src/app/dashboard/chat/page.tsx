"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { EmptyState, LoadingSpinner } from '@/components/dashboard/ui-states'

interface ChatChannel {
  id: string
  name: string
  description?: string | null
  isPrivate: boolean
  updatedAt: string
}

export default function ChatPage() {
  const [channels, setChannels] = useState<ChatChannel[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const loadChannels = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/chat/channels', { credentials: 'include' })
      const data = await response.json()
      if (!response.ok) {
        const message = data.error || 'Failed to load channels'
        if (response.status === 401) {
          setError('Authentication failed. Please login again.')
          return
        }
        throw new Error(message)
      }
      setChannels(data.channels || [])
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to load channels')
    } finally {
      setLoading(false)
    }
  }

  const createChannel = async () => {
    try {
      if (!name.trim()) return
      setCreating(true)
      const response = await fetch('/api/chat/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create channel')
      }
      setChannels((prev) => [data.channel, ...prev])
      setName('')
      setDescription('')
    } catch (err: any) {
      const message = err.message || 'Failed to create channel'
      if (message.includes('Unauthorized') || message.includes('401')) {
        setError('You are not logged in. Please login first to create a channel.')
      } else if (message.includes('Invalid') || message.includes('expired')) {
        setError('Your session has expired. Please login again.')
      } else {
        setError(message)
      }
    } finally {
      setCreating(false)
    }
  }

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      try {
        // Check authentication status first
        const authResponse = await fetch('/api/auth/status', { credentials: 'include' })
        const authData = await authResponse.json()
        
        if (!authData.authenticated) {
          setError(authData.message || 'Please login to view channels')
          setLoading(false)
          return
        }

        // If authenticated, load channels
        await loadChannels()
      } catch (err: any) {
        setError('Failed to check authentication status')
        setLoading(false)
      }
    }
    
    checkAuthAndLoad()
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header section */}
        <section className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-rose-100 via-purple-50 to-pink-100 dark:from-rose-900/30 dark:via-slate-900 dark:to-slate-900 p-5 sm:p-8 border border-rose-100 dark:border-rose-900/30">
          <div className="max-w-2xl">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-rose-700 dark:text-rose-300">Team Chat</p>
            <h1 className="mt-2 text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white">Keep conversations organized</h1>
            <p className="mt-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              Create channels for projects, updates, and customer work. Every message stays searchable and in context.
            </p>
          </div>
        </section>

        {/* Create form */}
        <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="mb-4">
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">Create new channel</label>
          </div>
          
          <div className="space-y-3 sm:space-y-4 mb-5">
            <div>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createChannel()}
                placeholder="e.g. product-launch or team-updates"
                className="input-field w-full"
              />
            </div>
            <div>
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createChannel()}
                placeholder="What is this channel for? (optional)"
                className="input-field w-full"
              />
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={createChannel}
            disabled={!name.trim() || creating}
            className="w-full rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 dark:from-rose-600 dark:to-pink-600 px-4 sm:px-6 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:from-rose-600 hover:to-pink-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {creating ? '⟳ Creating channel…' : '+ Create channel'}
          </button>

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 sm:p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-800 animate-slide-in-up">
              <p className="text-sm text-rose-700 dark:text-rose-300 font-medium">{error}</p>
              {(error.includes('login') || error.includes('not logged in') || error.includes('session')) && (
                <a href="/auth/login" className="mt-2 inline-block text-sm font-semibold text-rose-600 dark:text-rose-400 hover:underline">
                  Go to Login →
                </a>
              )}
            </div>
          )}
        </section>

        {loading ? (
          <LoadingSpinner text="Loading channels" />
        ) : channels.length === 0 ? (
          <EmptyState
            title="No channels yet"
            description="Create your first channel to get conversations started."
          />
        ) : (
          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Channels</h2>
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {channels.map((channel) => (
                <Link
                  key={channel.id}
                  href={`/dashboard/chat/${channel.id}`}
                  className="group rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-rose-200 dark:hover:border-rose-500/30 transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-widest text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded">Channel</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{new Date(channel.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white group-hover:text-rose-700 dark:group-hover:text-rose-400 transition truncate">
                    #{channel.name}
                  </h3>
                  {channel.description && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{channel.description}</p>
                  )}
                  <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 dark:bg-emerald-500" />
                    Live channel
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  )
}
