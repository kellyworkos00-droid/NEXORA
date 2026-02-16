"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { LoadingSpinner, EmptyState } from '@/components/dashboard/ui-states'

interface Whiteboard {
  id: string
  name: string
  description?: string | null
  createdAt: string
  updatedAt: string
}

export default function WhiteboardsPage() {
  const [boards, setBoards] = useState<Whiteboard[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const loadBoards = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/whiteboards')
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load whiteboards')
      }
      setBoards(data.boards || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load whiteboards')
    } finally {
      setLoading(false)
    }
  }

  const createBoard = async () => {
    try {
      if (!name.trim()) return
      setCreating(true)
      const response = await fetch('/api/whiteboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create whiteboard')
      }
      setBoards((prev) => [data.board, ...prev])
      setName('')
      setDescription('')
    } catch (err: any) {
      setError(err.message || 'Failed to create whiteboard')
    } finally {
      setCreating(false)
    }
  }

  useEffect(() => {
    loadBoards()
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="rounded-3xl bg-gradient-to-br from-orange-100 via-rose-50 to-amber-100 p-6 sm:p-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">Whiteboards</p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">Plan, sketch, and ship together</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-700">
              Create collaborative spaces for product thinking, retros, and creative planning. All updates sync live.
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-white/90 ring-1 ring-orange-100 p-5 sm:p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-[1.3fr_1fr_auto]">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Board name</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Sprint 12 planning"
                className="mt-2 w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Description</label>
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Optional context"
                className="mt-2 w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={createBoard}
                disabled={!name.trim() || creating}
                className="w-full sm:w-auto rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
              >
                {creating ? 'Creating…' : 'Create board'}
              </button>
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
        </section>

        {loading ? (
          <LoadingSpinner text="Loading whiteboards" />
        ) : boards.length === 0 ? (
          <EmptyState
            title="No whiteboards yet"
            description="Create your first board to start collaborating."
          />
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {boards.map((board) => (
              <Link
                key={board.id}
                href={`/dashboard/whiteboards/${board.id}`}
                className="group rounded-2xl bg-white/95 ring-1 ring-orange-100 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-orange-700">
                    Whiteboard
                  </span>
                  <span className="text-xs text-gray-500">Updated {new Date(board.updatedAt).toLocaleDateString()}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-gray-900 group-hover:text-orange-700">
                  {board.name}
                </h3>
                {board.description && (
                  <p className="mt-2 text-sm text-gray-600">{board.description}</p>
                )}
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Live collaboration enabled
                </div>
              </Link>
            ))}
          </section>
        )}
      </div>
    </DashboardLayout>
  )
}
