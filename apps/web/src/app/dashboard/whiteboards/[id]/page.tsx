"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { LoadingSpinner, EmptyState } from '@/components/dashboard/ui-states'

interface Whiteboard {
  id: string
  name: string
  description?: string | null
}

interface WhiteboardItem {
  id: string
  boardId: string
  type: string
  x: number
  y: number
  width: number
  height: number
  content: string | null
  color: string | null
  createdBy: string
}

const noteStyles: Record<string, string> = {
  sunrise: 'bg-orange-100 border-orange-200 text-orange-900',
  blush: 'bg-rose-100 border-rose-200 text-rose-900',
  mint: 'bg-emerald-100 border-emerald-200 text-emerald-900',
  ocean: 'bg-sky-100 border-sky-200 text-sky-900',
}

export default function WhiteboardDetailPage({ params }: { params: { id: string } }) {
  const boardId = params.id
  const [board, setBoard] = useState<Whiteboard | null>(null)
  const [items, setItems] = useState<WhiteboardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeItem, setActiveItem] = useState<string | null>(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const socketRef = useRef<WebSocket | null>(null)
  const wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000'

  const colors = useMemo(() => Object.keys(noteStyles), [])

  const loadBoard = async () => {
    try {
      setLoading(true)
      const [boardRes, itemsRes] = await Promise.all([
        fetch(`/api/whiteboards/${boardId}`),
        fetch(`/api/whiteboards/${boardId}/items`),
      ])

      const boardData = await boardRes.json()
      const itemsData = await itemsRes.json()

      if (!boardRes.ok) {
        throw new Error(boardData.error || 'Failed to load board')
      }

      if (!itemsRes.ok) {
        throw new Error(itemsData.error || 'Failed to load items')
      }

      setBoard(boardData.board)
      setItems(itemsData.items || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load board')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBoard()
  }, [boardId])

  useEffect(() => {
    const socket = new WebSocket(`${wsBaseUrl}/ws/whiteboards?boardId=${boardId}`)
    socketRef.current = socket

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        if (message.type === 'item:create') {
          setItems((prev) => {
            if (prev.find((item) => item.id === message.payload.id)) return prev
            return [...prev, message.payload]
          })
        }
        if (message.type === 'item:update') {
          setItems((prev) =>
            prev.map((item) => (item.id === message.payload.id ? message.payload : item))
          )
        }
        if (message.type === 'item:delete') {
          setItems((prev) => prev.filter((item) => item.id !== message.payload.id))
        }
      } catch (err) {
        console.error('Invalid websocket message', err)
      }
    }

    return () => {
      socket.close()
    }
  }, [boardId])

  const broadcast = (type: string, payload: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, payload }))
    }
  }

  const createStickyNote = async () => {
    try {
      const response = await fetch(`/api/whiteboards/${boardId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'note',
          x: 60 + Math.floor(Math.random() * 120),
          y: 60 + Math.floor(Math.random() * 120),
          width: 240,
          height: 160,
          content: 'New idea',
          color: colors[Math.floor(Math.random() * colors.length)],
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create note')
      }

      setItems((prev) => [...prev, data.item])
      broadcast('item:create', data.item)
    } catch (err: any) {
      setError(err.message || 'Failed to create note')
    }
  }

  const updateItem = async (item: WhiteboardItem) => {
    try {
      const response = await fetch(`/api/whiteboards/${boardId}/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update item')
      }
      setItems((prev) => prev.map((prevItem) => (prevItem.id === item.id ? data.item : prevItem)))
      broadcast('item:update', data.item)
    } catch (err: any) {
      setError(err.message || 'Failed to update item')
    }
  }

  const deleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/whiteboards/${boardId}/items/${itemId}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete item')
      }
      setItems((prev) => prev.filter((item) => item.id !== itemId))
      broadcast('item:delete', { id: itemId })
    } catch (err: any) {
      setError(err.message || 'Failed to delete item')
    }
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>, item: WhiteboardItem) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    setActiveItem(item.id)
    dragOffset.current = {
      x: event.clientX - item.x,
      y: event.clientY - item.y,
    }
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>, item: WhiteboardItem) => {
    if (activeItem !== item.id) return
    const nextX = Math.max(0, event.clientX - dragOffset.current.x)
    const nextY = Math.max(0, event.clientY - dragOffset.current.y)

    setItems((prev) =>
      prev.map((note) =>
        note.id === item.id
          ? { ...note, x: nextX, y: nextY }
          : note
      )
    )
  }

  const handlePointerUp = (itemId: string) => {
    if (activeItem !== itemId) return
    setActiveItem(null)
    const latestItem = items.find((note) => note.id === itemId)
    if (latestItem) {
      updateItem(latestItem)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner text="Loading whiteboard" />
      </DashboardLayout>
    )
  }

  if (!board) {
    return (
      <DashboardLayout>
        <EmptyState title="Whiteboard not found" description={error || 'Please try again.'} />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="rounded-3xl bg-white/90 ring-1 ring-orange-100 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">Whiteboard</p>
              <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">{board.name}</h1>
              {board.description && <p className="mt-2 text-sm text-gray-600">{board.description}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={createStickyNote}
                className="rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm"
              >
                Add sticky note
              </button>
              <Link
                href="/dashboard/whiteboards"
                className="rounded-full bg-white text-gray-700 px-4 py-2 text-sm font-semibold ring-1 ring-orange-200"
              >
                Back to boards
              </Link>
            </div>
          </div>
        </section>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <section className="relative min-h-[60vh] rounded-3xl bg-white/90 ring-1 ring-orange-100 shadow-sm overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.12)_1px,transparent_1px)] [background-size:24px_24px]" />

          <div className="relative h-[60vh] sm:h-[70vh] overflow-auto">
            <div className="relative min-h-[60vh] min-w-[900px]">
            {items.map((item) => (
              <div
                key={item.id}
                className={`absolute rounded-2xl border shadow-md p-4 text-sm ${
                  noteStyles[item.color || 'sunrise']
                } ${activeItem === item.id ? 'ring-2 ring-orange-400' : ''}`}
                style={{
                  left: item.x,
                  top: item.y,
                  width: item.width,
                  height: item.height,
                }}
                onPointerDown={(event) => handlePointerDown(event, item)}
                onPointerMove={(event) => handlePointerMove(event, item)}
                onPointerUp={() => handlePointerUp(item.id)}
              >
                <textarea
                  value={item.content || ''}
                  onChange={(event) => {
                    const nextValue = event.target.value
                    setItems((prev) =>
                      prev.map((note) =>
                        note.id === item.id ? { ...note, content: nextValue } : note
                      )
                    )
                  }}
                  onBlur={() => updateItem(item)}
                  className="h-full w-full resize-none bg-transparent text-sm font-medium outline-none"
                />
                <button
                  onClick={() => deleteItem(item.id)}
                  className="absolute right-3 top-3 text-xs font-semibold text-orange-700"
                >
                  Delete
                </button>
              </div>
            ))}
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
