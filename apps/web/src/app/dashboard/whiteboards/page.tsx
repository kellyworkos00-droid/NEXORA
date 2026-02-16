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

const templates = [
  { name: 'Sprint Planning', description: 'Plan your sprint with goals, tasks, and timeline', icon: '🎯' },
  { name: 'Retrospective', description: 'What went well, what to improve, action items', icon: '🔄' },
  { name: 'Brainstorming', description: 'Free-form creative idea generation', icon: '💡' },
  { name: 'User Story Map', description: 'Map user journeys and stories', icon: '🗺️' },
  { name: 'Blank Canvas', description: 'Start from scratch', icon: '✨' },
]

export default function WhiteboardsPage() {
  const [boards, setBoards] = useState<Whiteboard[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)

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

  const createBoard = async (templateName?: string) => {
    try {
      const boardName = name.trim() || (templateName ? `${templateName} - ${new Date().toLocaleDateString()}` : 'Untitled Board')
      setCreating(true)
      const response = await fetch('/api/whiteboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: boardName, 
          description: description.trim() || undefined,
          template: templateName 
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create whiteboard')
      }
      setBoards((prev) => [data.board, ...prev])
      setName('')
      setDescription('')
      setShowTemplates(false)
    } catch (err: any) {
      setError(err.message || 'Failed to create whiteboard')
    } finally {
      setCreating(false)
    }
  }

  const deleteBoard = async (boardId: string) => {
    if (!confirm('Delete this whiteboard? This action cannot be undone.')) return
    try {
      const response = await fetch(`/api/whiteboards/${boardId}`, { method: 'DELETE' })
      if (response.ok) {
        setBoards((prev) => prev.filter(b => b.id !== boardId))
      }
    } catch (err) {
      console.error('Failed to delete board', err)
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex-1 grid gap-4 sm:grid-cols-2">
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
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="rounded-full bg-white ring-1 ring-orange-200 px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-orange-50"
              >
                {showTemplates ? 'Hide templates' : 'Use template'}
              </button>
              <button
                onClick={() => createBoard()}
                disabled={creating}
                className="rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-60 hover:bg-orange-700"
              >
                {creating ? 'Creating…' : 'Create blank'}
              </button>
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
        </section>

        {showTemplates && (
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <button
                key={template.name}
                onClick={() => createBoard(template.name)}
                disabled={creating}
                className="group text-left rounded-2xl bg-gradient-to-br from-white to-orange-50/50 ring-1 ring-orange-100 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{template.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-orange-700">{template.name}</h3>
                    <p className="mt-1 text-sm text-gray-600">{template.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </section>
        )}

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
              <div
                key={board.id}
                className="group rounded-2xl bg-white/95 ring-1 ring-orange-100 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-orange-700">
                    Whiteboard
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{new Date(board.updatedAt).toLocaleDateString()}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteBoard(board.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 rounded-lg px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <Link href={`/dashboard/whiteboards/${board.id}`}>
                  <h3 className="mt-3 text-lg font-semibold text-gray-900 group-hover:text-orange-700">
                    {board.name}
                  </h3>
                  {board.description && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{board.description}</p>
                  )}
                </Link>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Live collaboration
                  </div>
                  <Link
                    href={`/dashboard/whiteboards/${board.id}`}
                    className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                  >
                    Open board →
                  </Link>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </DashboardLayout>
  )
}
