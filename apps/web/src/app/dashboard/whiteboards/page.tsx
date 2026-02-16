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

interface Template {
  name: string
  description: string
  icon: React.ReactNode
  color: string
  hint?: string
}

const templates: Template[] = [
  {
    name: 'Sprint Planning',
    description: 'Plan your sprint with goals, tasks, and timeline',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 3v2H4v13h16V5h-5V3H9zm3 6h3v3h-3v-3zm0 5h3v3h-3v-3zm-4-5h3v3H8v-3zm0 5h3v3H8v-3z" />
      </svg>
    ),
    color: 'from-blue-100 to-blue-200',
    hint: 'Organize sprints with tasks and timelines',
  },
  {
    name: 'Retrospective',
    description: 'What went well, what to improve, action items',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
      </svg>
    ),
    color: 'from-purple-100 to-purple-200',
    hint: 'Review what went well and areas to improve',
  },
  {
    name: 'Brainstorming',
    description: 'Free-form creative idea generation',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    ),
    color: 'from-yellow-100 to-yellow-200',
    hint: 'Capture all ideas in one place',
  },
  {
    name: 'User Story Map',
    description: 'Map user journeys and stories',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
    color: 'from-green-100 to-green-200',
    hint: 'Visualize user workflows and journeys',
  },
  {
    name: 'Blank Canvas',
    description: 'Start from scratch with endless possibilities',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
      </svg>
    ),
    color: 'from-gray-100 to-gray-200',
    hint: 'Create with total freedom',
  },
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
                  onKeyDown={(e) => e.key === 'Enter' && createBoard()}
                  placeholder="My awesome whiteboard"
                  className="mt-2 w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Description</label>
                <input
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createBoard()}
                  placeholder="What is this board for?"
                  className="mt-2 w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="rounded-full bg-white ring-1 ring-orange-200 px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-orange-50 transition"
              >
                {showTemplates ? '✕ Templates' : '+ Templates'}
              </button>
              <button
                onClick={() => createBoard()}
                disabled={!name.trim() || creating}
                className="rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-60 hover:bg-orange-700 transition"
              >
                {creating ? '⟳ Creating…' : '+ Create'}
              </button>
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-rose-600">⚠ {error}</p>}
        </section>

        {showTemplates && (
          <section>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">Choose a template to get started</h2>
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">or create blank above</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <button
                  key={template.name}
                  onClick={() => createBoard(template.name)}
                  disabled={creating}
                  className={`group text-left rounded-2xl bg-gradient-to-br ${template.color} ring-1 ring-offset-2 ring-offset-white ring-gray-200 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-orange-400`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 rounded-xl bg-white/60 p-3 text-gray-700 group-hover:bg-white group-hover:text-orange-600 transition">
                      {template.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-gray-950">{template.name}</h3>
                      <p className="mt-1 text-sm text-gray-600 group-hover:text-gray-700">{template.description}</p>
                      {template.hint && (
                        <p className="mt-2 text-xs text-gray-500 font-medium">💡 {template.hint}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
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
                className="group rounded-2xl bg-white/95 ring-1 ring-orange-100 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:ring-orange-200"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-shrink-0 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 p-3 text-orange-700 text-lg">📋</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{new Date(board.updatedAt).toLocaleDateString()}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteBoard(board.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 rounded-lg px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
                <Link href={`/dashboard/whiteboards/${board.id}`}>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-700 transition truncate">
                    {board.name}
                  </h3>
                  {board.description && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2 group-hover:text-gray-700">{board.description}</p>
                  )}
                </Link>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>Live collaboration</span>
                  </div>
                  <Link
                    href={`/dashboard/whiteboards/${board.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 transition group-hover:translate-x-0.5"
                  >
                    Open
                    <span>→</span>
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
