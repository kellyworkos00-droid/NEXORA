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
      const response = await fetch('/api/chat/channels')
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load channels')
      }
      setChannels(data.channels || [])
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
      setError(err.message || 'Failed to create channel')
    } finally {
      setCreating(false)
    }
  }

  useEffect(() => {
    loadChannels()
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="rounded-3xl bg-gradient-to-br from-orange-100 via-rose-50 to-amber-100 p-6 sm:p-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">Team Chat</p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">Keep conversations moving fast</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-700">
              Build channels for projects, product launches, and customer work. Every thread stays searchable and organized.
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-white/90 ring-1 ring-orange-100 p-5 sm:p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-[1.2fr_1fr_auto]">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Channel name</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. product-launch"
                className="mt-2 w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Description</label>
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Optional topic"
                className="mt-2 w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={createChannel}
                disabled={!name.trim() || creating}
                className="w-full sm:w-auto rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
              >
                {creating ? 'Creating…' : 'Create channel'}
              </button>
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
        </section>

        {loading ? (
          <LoadingSpinner text="Loading channels" />
        ) : channels.length === 0 ? (
          <EmptyState
            title="No channels yet"
            description="Create a channel to start the conversation."
          />
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {channels.map((channel) => (
              <Link
                key={channel.id}
                href={`/dashboard/chat/${channel.id}`}
                className="group rounded-2xl bg-white/95 ring-1 ring-orange-100 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-orange-700">Channel</span>
                  <span className="text-xs text-gray-500">Updated {new Date(channel.updatedAt).toLocaleDateString()}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-gray-900 group-hover:text-orange-700">
                  #{channel.name}
                </h3>
                {channel.description && (
                  <p className="mt-2 text-sm text-gray-600">{channel.description}</p>
                )}
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Live channel
                </div>
              </Link>
            ))}
          </section>
        )}
      </div>
    </DashboardLayout>
  )
}
