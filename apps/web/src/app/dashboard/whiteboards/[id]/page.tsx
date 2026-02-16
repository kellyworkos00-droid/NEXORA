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

const noteColors: Record<string, string> = {
  sunrise: 'bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300 text-orange-900',
  blush: 'bg-gradient-to-br from-rose-100 to-rose-200 border-rose-300 text-rose-900',
  mint: 'bg-gradient-to-br from-emerald-100 to-emerald-200 border-emerald-300 text-emerald-900',
  ocean: 'bg-gradient-to-br from-sky-100 to-sky-200 border-sky-300 text-sky-900',
  lavender: 'bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300 text-purple-900',
  sunshine: 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-300 text-yellow-900',
}

type ToolType = 'select' | 'sticky' | 'text' | 'shape'

export default function WhiteboardDetailPage({ params }: { params: { id: string } }) {
  const boardId = params.id
  const [board, setBoard] = useState<Whiteboard | null>(null)
  const [items, setItems] = useState<WhiteboardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTool, setActiveTool] = useState<ToolType>('select')
  const [activeItem, setActiveItem] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState('sunrise')
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [showToolbar, setShowToolbar] = useState(true)
  
  const dragOffset = useRef({ x: 0, y: 0 })
  const panStart = useRef({ x: 0, y: 0 })
  const socketRef = useRef<WebSocket | null>(null)
  const wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000'

  const colors = useMemo(() => Object.keys(noteColors), [])

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && activeItem) {
        deleteItem(activeItem)
      }
      if (e.key === 's' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setActiveTool('sticky')
      }
      if (e.key === 't' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setActiveTool('text')
      }
      if (e.key === 'v' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setActiveTool('select')
      }
      if (e.key === 'Escape') {
        setActiveItem(null)
        setActiveTool('select')
      }
      if (e.key === '+' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        setZoom(prev => Math.min(prev + 0.1, 2))
      }
      if (e.key === '-' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        setZoom(prev => Math.max(prev - 0.1, 0.5))
      }
      if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        setZoom(1)
        setPan({ x: 0, y: 0 })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeItem])

  const broadcast = (type: string, payload: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, payload }))
    }
  }

  const createItem = async (type: string, x: number, y: number) => {
    try {
      const itemData: any = {
        type,
        x: Math.round(x / zoom - pan.x),
        y: Math.round(y / zoom - pan.y),
        color: selectedColor,
      }

      if (type === 'note') {
        itemData.width = 240
        itemData.height = 160
        itemData.content = 'New idea'
      } else if (type === 'text') {
        itemData.width = 300
        itemData.height = 100
        itemData.content = 'Type here...'
      } else if (type === 'shape') {
        itemData.width = 200
        itemData.height = 200
        itemData.content = 'rectangle'
      }

      const response = await fetch(`/api/whiteboards/${boardId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create item')
      }

      setItems((prev) => [...prev, data.item])
      broadcast('item:create', data.item)
      setActiveTool('select')
    } catch (err: any) {
      setError(err.message || 'Failed to create item')
    }
  }

  const createStickyNote = async () => {
    createItem('note', 120, 120)
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
      setActiveItem(null)
    } catch (err: any) {
      setError(err.message || 'Failed to delete item')
    }
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && activeTool !== 'select') {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      createItem(activeTool === 'sticky' ? 'note' : activeTool, x, y)
    }
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>, item: WhiteboardItem) => {
    if (activeTool !== 'select') return
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    setActiveItem(item.id)
    dragOffset.current = {
      x: event.clientX - item.x * zoom,
      y: event.clientY - item.y * zoom,
    }
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>, item: WhiteboardItem) => {
    if (activeItem !== item.id) return
    const nextX = Math.max(0, (event.clientX - dragOffset.current.x) / zoom)
    const nextY = Math.max(0, (event.clientY - dragOffset.current.y) / zoom)

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

  const handleCanvasPanStart = (e: React.PointerEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsPanning(true)
      panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
    }
  }

  const handleCanvasPanMove = (e: React.PointerEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.current.x,
        y: e.clientY - panStart.current.y,
      })
    }
  }

  const handleCanvasPanEnd = () => {
    setIsPanning(false)
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
      <div className="space-y-4">
        {/* Header */}
        <section className="rounded-3xl bg-white/90 ring-1 ring-orange-100 p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/whiteboards"
                  className="rounded-lg p-2 hover:bg-orange-50 text-gray-600"
                >
                  ← Back
                </Link>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">Whiteboard</p>
                  <h1 className="mt-1 text-xl sm:text-2xl font-bold text-gray-900">{board.name}</h1>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowToolbar(!showToolbar)}
                className="rounded-lg bg-white text-gray-700 px-3 py-2 text-sm font-medium ring-1 ring-orange-200 hover:bg-orange-50"
              >
                {showToolbar ? 'Hide toolbar' : 'Show toolbar'}
              </button>
              <div className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1">
                <button
                  onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}
                  className="rounded-lg px-2 py-1 text-sm font-medium hover:bg-white"
                >
                  −
                </button>
                <span className="px-2 text-sm font-semibold text-gray-700">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))}
                  className="rounded-lg px-2 py-1 text-sm font-medium hover:bg-white"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </section>

        {error && <p className="text-sm text-rose-600 px-4">{error}</p>}

        {/* Toolbar */}
        {showToolbar && (
          <section className="rounded-2xl bg-white/90 ring-1 ring-orange-100 p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex gap-1 rounded-lg bg-gray-100 p-1.5">
                <button
                  onClick={() => setActiveTool('select')}
                  className={`rounded-lg px-3 py-2 text-lg transition flex items-center gap-2 ${
                    activeTool === 'select' ? 'bg-white text-orange-700 shadow-sm ring-1 ring-orange-200' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Select tool (V)"
                >
                  <span>👆</span>
                  <span className="hidden sm:inline text-sm font-semibold">Select</span>
                </button>
                <button
                  onClick={() => setActiveTool('sticky')}
                  className={`rounded-lg px-3 py-2 text-lg transition flex items-center gap-2 ${
                    activeTool === 'sticky' ? 'bg-white text-orange-700 shadow-sm ring-1 ring-orange-200' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Sticky note tool (S)"
                >
                  <span>📌</span>
                  <span className="hidden sm:inline text-sm font-semibold">Sticky</span>
                </button>
                <button
                  onClick={() => setActiveTool('text')}
                  className={`rounded-lg px-3 py-2 text-lg transition flex items-center gap-2 ${
                    activeTool === 'text' ? 'bg-white text-orange-700 shadow-sm ring-1 ring-orange-200' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Text box tool (T)"
                >
                  <span>📝</span>
                  <span className="hidden sm:inline text-sm font-semibold">Text</span>
                </button>
                <button
                  onClick={() => setActiveTool('shape')}
                  className={`rounded-lg px-3 py-2 text-lg transition flex items-center gap-2 ${
                    activeTool === 'shape' ? 'bg-white text-orange-700 shadow-sm ring-1 ring-orange-200' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Shape tool"
                >
                  <span>⬚</span>
                  <span className="hidden sm:inline text-sm font-semibold">Shape</span>
                </button>
              </div>

              <div className="h-8 w-px bg-gray-300" />

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 hidden sm:inline">Colors:</span>
                <div className="flex gap-1.5">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`h-7 w-7 rounded-lg border-2 transition transform hover:scale-110 ${
                        noteColors[color].split(' ')[0]
                      } ${
                        selectedColor === color ? 'border-orange-700 ring-2 ring-orange-300 shadow-md' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      title={`${color} color`}
                    />
                  ))}
                </div>
              </div>

              <div className="h-8 w-px bg-gray-300" />

              <div className="flex items-center gap-2 flex-1 justify-end lg:justify-start">
                <span className="text-xs text-gray-500 font-medium hidden lg:inline">💡 Keyboard: S=Sticky, T=Text, V=Select, Delete=Remove, Esc=Cancel</span>
              </div>
            </div>
          </section>
        )}

        {/* Canvas */}
        <section className="relative rounded-3xl bg-white/90 ring-1 ring-orange-100 shadow-sm overflow-hidden">
          <div
            className={`absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.08)_1px,transparent_1px)] [background-size:24px_24px] ${
              isPanning ? 'cursor-grabbing' : activeTool === 'select' ? 'cursor-default' : 'cursor-crosshair'
            }`}
          />

          <div
            className="relative h-[70vh] overflow-hidden"
            onClick={handleCanvasClick}
            onPointerDown={handleCanvasPanStart}
            onPointerMove={handleCanvasPanMove}
            onPointerUp={handleCanvasPanEnd}
          >
            <div
              className="absolute min-h-[60vh] min-w-[900px]"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0 0',
                transition: isPanning ? 'none' : 'transform 0.1s ease-out',
              }}
            >
              {items.map((item) => {
                const isNote = item.type === 'note'
                const isText = item.type === 'text'
                const isShape = item.type === 'shape'

                return (
                  <div
                    key={item.id}
                    className={`absolute rounded-2xl border-2 shadow-lg p-4 text-sm transition-all ${
                      noteColors[item.color || 'sunrise']
                    } ${activeItem === item.id ? 'ring-4 ring-orange-400 ring-opacity-50 shadow-2xl scale-105' : 'hover:shadow-xl'}`}
                    style={{
                      left: item.x,
                      top: item.y,
                      width: item.width,
                      height: item.height,
                      cursor: activeTool === 'select' ? 'move' : 'default',
                    }}
                    onPointerDown={(event) => handlePointerDown(event, item)}
                    onPointerMove={(event) => handlePointerMove(event, item)}
                    onPointerUp={() => handlePointerUp(item.id)}
                  >
                    {(isNote || isText) && (
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
                        placeholder={isNote ? "What's on your mind?" : "Type here..."}
                        className={`h-full w-full resize-none bg-transparent ${
                          isText ? 'text-base' : 'text-sm'
                        } font-medium outline-none placeholder:text-current placeholder:opacity-40`}
                        style={{ pointerEvents: activeTool === 'select' ? 'auto' : 'none' }}
                      />
                    )}
                    {isShape && (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-bold opacity-20">
                        ◻
                      </div>
                    )}
                    {activeItem === item.id && (
                      <div className="absolute -top-10 right-0 flex gap-1 rounded-lg bg-white shadow-lg ring-1 ring-gray-200 p-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteItem(item.id)
                          }}
                          className="rounded px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="flex items-center justify-between px-4 text-xs text-gray-500">
          <span>{items.length} items on board</span>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Live collaboration active</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
