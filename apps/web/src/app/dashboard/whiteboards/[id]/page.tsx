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
  shapeType?: string
  imageUrl?: string
  reactions?: Record<string, string[]>
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

const shapeTypes = ['rectangle', 'circle', 'triangle', 'diamond', 'hexagon']

type ToolType = 'select' | 'sticky' | 'text' | 'shape' | 'image' | 'draw' | 'line' | 'arrow'

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
  const [showShapeMenu, setShowShapeMenu] = useState(false)
  const [selectedItemForEmoji, setSelectedItemForEmoji] = useState<string | null>(null)

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

      if (!boardRes.ok) throw new Error(boardData.error || 'Failed to load board')
      if (!itemsRes.ok) throw new Error(itemsData.error || 'Failed to load items')

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

    return () => socket.close()
  }, [boardId])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && activeItem) deleteItem(activeItem)
      if (e.key === 's' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setActiveTool('sticky') }
      if (e.key === 't' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setActiveTool('text') }
      if (e.key === 'v' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setActiveTool('select') }
      if (e.key === 'Escape') { setActiveItem(null); setActiveTool('select') }
      if (e.key === '+' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); setZoom(prev => Math.min(prev + 0.1, 2)) }
      if (e.key === '-' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); setZoom(prev => Math.max(prev - 0.1, 0.5)) }
      if (e.key === '0' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); setZoom(1); setPan({ x: 0, y: 0 }) }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeItem])

  const broadcast = (type: string, payload: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, payload }))
    }
  }

  const createItem = async (type: string, x: number, y: number, extras?: any) => {
    try {
      const itemData: any = {
        type, x: Math.round(x / zoom - pan.x), y: Math.round(y / zoom - pan.y), color: selectedColor, ...extras,
      }

      if (type === 'note') { itemData.width = 240; itemData.height = 160; itemData.content = 'New idea' }
      else if (type === 'text') { itemData.width = 300; itemData.height = 100; itemData.content = 'Type here...' }
      else if (type === 'shape') { itemData.width = extras?.width || 150; itemData.height = extras?.height || 150; itemData.shapeType = extras?.shapeType || 'rectangle' }
      else if (type === 'image') { itemData.width = extras?.width || 300; itemData.height = extras?.height || 200; itemData.imageUrl = extras?.imageUrl }

      const response = await fetch(`/api/whiteboards/${boardId}/items`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(itemData),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to create item')

      setItems((prev) => [...prev, data.item])
      broadcast('item:create', data.item)
      setActiveTool('select')
    } catch (err: any) {
      setError(err.message || 'Failed to create item')
    }
  }

  const updateItem = async (item: WhiteboardItem) => {
    try {
      const response = await fetch(`/api/whiteboards/${boardId}/items/${item.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to update item')
      setItems((prev) => prev.map((prevItem) => (prevItem.id === item.id ? data.item : prevItem)))
      broadcast('item:update', data.item)
    } catch (err: any) {
      setError(err.message || 'Failed to update item')
    }
  }

  const deleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/whiteboards/${boardId}/items/${itemId}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to delete item')
      setItems((prev) => prev.filter((item) => item.id !== itemId))
      broadcast('item:delete', { id: itemId })
      setActiveItem(null)
    } catch (err: any) {
      setError(err.message || 'Failed to delete item')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/upload', { method: 'POST', body: formData, credentials: 'include' })
      if (!response.ok) throw new Error('Upload failed')
      const data = await response.json()
      createItem('image', 150, 150, { imageUrl: data.url, width: 300, height: 200 })
    } catch (err: any) {
      setError('Failed to upload image')
    }
  }

  const addReaction = async (itemId: string, emoji: string) => {
    const item = items.find(i => i.id === itemId)
    if (!item) return
    const updatedReactions = { ...item.reactions || {} }
    if (!updatedReactions[emoji]) updatedReactions[emoji] = []
    if (!updatedReactions[emoji].includes('current-user')) updatedReactions[emoji].push('current-user')
    await updateItem({ ...item, reactions: updatedReactions })
  }

  const saveAsTemplate = async () => {
    const templateName = prompt('Enter template name:')
    if (!templateName) return
    try {
      const response = await fetch(`/api/whiteboards/${boardId}/templates`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ name: templateName, description: 'Saved template', config: items }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to save template')
    } catch (err: any) {
      setError(err.message || 'Failed to save template')
    }
  }

  const createShapeItem = (shapeType: string) => {
    createItem('shape', 150, 150, { shapeType, width: 150, height: 150 })
    setShowShapeMenu(false)
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
    dragOffset.current = { x: event.clientX - item.x * zoom, y: event.clientY - item.y * zoom }
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>, item: WhiteboardItem) => {
    if (activeItem !== item.id) return
    const nextX = Math.max(0, (event.clientX - dragOffset.current.x) / zoom)
    const nextY = Math.max(0, (event.clientY - dragOffset.current.y) / zoom)
    setItems((prev) => prev.map((note) => (note.id === item.id ? { ...note, x: nextX, y: nextY } : note)))
  }

  const handlePointerUp = (itemId: string) => {
    if (activeItem !== itemId) return
    setActiveItem(null)
    const latestItem = items.find((note) => note.id === itemId)
    if (latestItem) updateItem(latestItem)
  }

  const handleCanvasPanStart = (e: React.PointerEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsPanning(true)
      panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
    }
  }

  const handleCanvasPanMove = (e: React.PointerEvent) => {
    if (isPanning) setPan({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y })
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
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-orange-700 dark:text-orange-300">Whiteboard</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{board.name}</h1>
              {board.description && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{board.description}</p>}
            </div>
            <Link href="/dashboard/whiteboards" className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition">
              ← Back
            </Link>
          </div>
        </section>

        {error && <p className="text-sm text-rose-600 px-4">{error}</p>}

        {/* Toolbar */}
        {showToolbar && (
          <section className="rounded-2xl bg-white/90 ring-1 ring-orange-100 p-3 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
                {(['select', 'sticky', 'text', 'shape', 'image', 'draw', 'line', 'arrow'] as ToolType[]).map((tool) => (
                  <button key={tool} onClick={() => tool === 'image' ? null : setActiveTool(tool)} className={`rounded px-2 py-1.5 text-sm ${activeTool === tool ? 'bg-white text-orange-700 shadow ring-1 ring-orange-200' : 'text-gray-600 hover:text-gray-900'}`} title={tool}>
                    {tool === 'select' && '👆'} {tool === 'sticky' && '📌'} {tool === 'text' && '📝'} {tool === 'shape' && '⬚'} {tool === 'image' && '🖼'} {tool === 'draw' && '✏️'} {tool === 'line' && '↗'} {tool === 'arrow' && '➜'}
                  </button>
                ))}
                <label className="rounded px-2 py-1.5 text-sm text-gray-600 hover:text-gray-900 cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
                  Upload
                </label>
              </div>

              <div className="h-6 w-px bg-gray-300 hidden sm:block" />

              <div className="flex gap-1">
                {colors.map((color) => (
                  <button key={color} onClick={() => setSelectedColor(color)} className={`h-6 w-6 rounded border-2 ${noteColors[color].split(' ')[0]} ${selectedColor === color ? 'border-orange-700 ring-1 ring-orange-300' : 'border-gray-300'}`} />
                ))}
              </div>

              <button onClick={() => setShowShapeMenu(!showShapeMenu)} className="rounded px-2 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100">
                Shapes ▼
              </button>

              <button onClick={saveAsTemplate} className="rounded px-2 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100">
                💾 Save
              </button>

              <button onClick={() => setShowToolbar(false)} className="ml-auto rounded px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100">
                Hide
              </button>
            </div>
          </section>
        )}

        {!showToolbar && <button onClick={() => setShowToolbar(true)} className="rounded px-3 py-2 text-sm font-medium bg-white ring-1 ring-orange-100 hover:bg-orange-50">Show Toolbar</button>}

        {/* Shape Menu */}
        {showShapeMenu && (
          <div className="absolute left-24 top-96 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50">
            {shapeTypes.map((shape) => (
              <button key={shape} onClick={() => createShapeItem(shape)} className="block w-full text-left px-3 py-2 rounded hover:bg-orange-50 text-sm">
                {shape}
              </button>
            ))}
          </div>
        )}

        {/* Canvas */}
        <section className="relative rounded-3xl bg-white/90 ring-1 ring-orange-100 shadow overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.08)_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="relative h-[70vh] overflow-hidden" onClick={handleCanvasClick} onPointerDown={handleCanvasPanStart} onPointerMove={handleCanvasPanMove} onPointerUp={handleCanvasPanEnd}>
            <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0', transition: isPanning ? 'none' : 'transform 0.1s ease-out' }} className="absolute min-h-[60vh] min-w-[900px]">
              {items.map((item) => (
                <div key={item.id} style={{ left: item.x, top: item.y, width: item.width, height: item.height }} className={`absolute rounded-2xl border-2 shadow-lg p-4 ${item.type === 'image' ? 'p-0' : ''} ${!item.imageUrl ? noteColors[item.color || 'sunrise'] : 'bg-white border-gray-200'} ${activeItem === item.id ? 'ring-4 ring-orange-400 shadow-2xl' : ''}`} onPointerDown={(e) => handlePointerDown(e, item)} onPointerMove={(e) => handlePointerMove(e, item)} onPointerUp={() => handlePointerUp(item.id)}>
                  {(item.type === 'note' || item.type === 'text') && (
                    <textarea value={item.content || ''} onChange={(e) => setItems(prev => prev.map(n => (n.id === item.id ? { ...n, content: e.target.value } : n)))} onBlur={() => updateItem(item)} placeholder="Type..." className="h-full w-full resize-none bg-transparent outline-none font-medium" />
                  )}
                  {item.type === 'image' && item.imageUrl && <img src={item.imageUrl} alt="img" className="w-full h-full object-cover rounded-lg" />}
                  {item.type === 'shape' && (
                    <svg className="w-full h-full" viewBox="0 0 200 200">
                      {item.shapeType === 'circle' && <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />}
                      {!item.shapeType || item.shapeType === 'rectangle' && <rect x="20" y="20" width="160" height="160" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />}
                      {item.shapeType === 'triangle' && <polygon points="100,20 180,180 20,180" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />}
                      {item.shapeType === 'diamond' && <polygon points="100,20 180,100 100,180 20,100" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />}
                    </svg>
                  )}
                  {activeItem === item.id && (
                    <div className="absolute -top-10 right-0 flex gap-1 rounded-lg bg-white shadow ring-1 ring-gray-200 p-1">
                      <button onClick={() => setSelectedItemForEmoji(item.id)} className="rounded px-2 py-1 text-xs font-semibold text-amber-600 hover:bg-amber-50">
                        ☺️
                      </button>
                      <button onClick={() => deleteItem(item.id)} className="rounded px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50">
                        🗑
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="flex justify-between text-xs text-gray-500 px-4">
          <span>{items.length} items</span>
          <span>🟢 Live Collab</span>
        </div>
      </div>

      {/* Emoji Picker */}
      {selectedItemForEmoji && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Add Reaction</h3>
              <button onClick={() => setSelectedItemForEmoji(null)} className="text-2xl text-gray-500">✕</button>
            </div>
            <div className="grid grid-cols-8 gap-2">
              {['👍', '❤️', '😂', '🎉', '🔥', '✨', '🚀', '👌', '💯', '💡', '🤔', '😍', '🙌', '⭐', '👏', '🎯'].map((emoji) => (
                <button key={emoji} onClick={() => { addReaction(selectedItemForEmoji, emoji); setSelectedItemForEmoji(null) }} className="text-2xl hover:scale-125 transition">
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
