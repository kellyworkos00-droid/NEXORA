"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { LoadingSpinner, EmptyState } from '@/components/dashboard/ui-states'

interface Channel {
  id: string
  name: string
  description?: string | null
}

interface Message {
  id: string
  channelId: string
  userId: string
  content: string | null
  createdAt: string
  editedAt?: string | null
  deletedAt?: string | null
  replyCount?: number
  userName?: string
  userAvatar?: string | null
}

interface Reply {
  id: string
  userId: string
  content: string | null
  createdAt: string
  userName?: string
  userAvatar?: string | null
}

export default function ChatChannelPage({ params }: { params: { id: string } }) {
  const channelId = params.id
  const [channel, setChannel] = useState<Channel | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [messageText, setMessageText] = useState('')
  const [activeThread, setActiveThread] = useState<Message | null>(null)
  const [threadReplies, setThreadReplies] = useState<Reply[]>([])
  const [replyText, setReplyText] = useState('')

  const socketRef = useRef<WebSocket | null>(null)
  const wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000'
  const endRef = useRef<HTMLDivElement | null>(null)

  const hasMessages = useMemo(() => messages.length > 0, [messages.length])

  const loadChannel = async () => {
    try {
      setLoading(true)
      const [channelRes, messageRes] = await Promise.all([
        fetch(`/api/chat/channels/${channelId}`),
        fetch(`/api/chat/channels/${channelId}/messages?limit=50`),
      ])

      const channelData = await channelRes.json()
      const messageData = await messageRes.json()

      if (!channelRes.ok) {
        throw new Error(channelData.error || 'Failed to load channel')
      }

      if (!messageRes.ok) {
        throw new Error(messageData.error || 'Failed to load messages')
      }

      setChannel(channelData.channel)
      setMessages(messageData.messages || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load channel')
    } finally {
      setLoading(false)
    }
  }

  const loadThread = async (message: Message) => {
    try {
      const response = await fetch(`/api/chat/messages/${message.id}/thread`)
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load thread')
      }
      setThreadReplies(data.replies || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load thread')
    }
  }

  useEffect(() => {
    loadChannel()
  }, [channelId])

  useEffect(() => {
    const socket = new WebSocket(`${wsBaseUrl}/ws/chat?channelId=${channelId}`)
    socketRef.current = socket

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        if (message.type === 'message:create') {
          setMessages((prev) => {
            if (prev.find((item) => item.id === message.payload.id)) return prev
            return [...prev, message.payload]
          })
        }
        if (message.type === 'message:update') {
          setMessages((prev) =>
            prev.map((item) => (item.id === message.payload.id ? message.payload : item))
          )
        }
        if (message.type === 'message:delete') {
          setMessages((prev) =>
            prev.map((item) => (item.id === message.payload.id ? message.payload : item))
          )
        }
        if (message.type === 'thread:create' && activeThread?.id === message.payload.threadParentId) {
          setThreadReplies((prev) => [...prev, message.payload])
        }
      } catch (err) {
        console.error('Invalid websocket message', err)
      }
    }

    return () => socket.close()
  }, [channelId, wsBaseUrl, activeThread])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const broadcast = (type: string, payload: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, payload }))
    }
  }

  const sendMessage = async () => {
    try {
      if (!messageText.trim()) return
      const response = await fetch(`/api/chat/channels/${channelId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageText.trim() }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }
      setMessages((prev) => [...prev, data.message])
      broadcast('message:create', data.message)
      setMessageText('')
    } catch (err: any) {
      setError(err.message || 'Failed to send message')
    }
  }

  const sendReply = async () => {
    try {
      if (!replyText.trim() || !activeThread) return
      const response = await fetch(`/api/chat/messages/${activeThread.id}/thread`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyText.trim() }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reply')
      }
      setThreadReplies((prev) => [...prev, data.reply])
      broadcast('thread:create', data.reply)
      setReplyText('')
    } catch (err: any) {
      setError(err.message || 'Failed to send reply')
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner text="Loading channel" />
      </DashboardLayout>
    )
  }

  if (!channel) {
    return (
      <DashboardLayout>
        <EmptyState title="Channel not found" description={error || 'Please try again.'} />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <section className="rounded-3xl bg-white/90 ring-1 ring-orange-100 p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">Channel</p>
              <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">#{channel.name}</h1>
              {channel.description && <p className="mt-2 text-sm text-gray-600">{channel.description}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard/chat"
                className="rounded-full bg-white text-gray-700 px-4 py-2 text-sm font-semibold ring-1 ring-orange-200"
              >
                Back to channels
              </Link>
            </div>
          </div>
        </section>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-3xl bg-white/95 ring-1 ring-orange-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-orange-100 px-5 py-4">
              <p className="text-sm font-semibold text-gray-900">Live messages</p>
              <span className="text-xs text-gray-500">{messages.length} updates</span>
            </div>
            <div className="h-[60vh] overflow-y-auto px-5 py-4 space-y-4">
              {!hasMessages && (
                <EmptyState
                  title="No messages yet"
                  description="Start the conversation with a quick update."
                />
              )}
              {messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 text-white flex items-center justify-center text-sm font-semibold">
                    {(message.userName || 'U')[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{message.userName || 'User'}</p>
                      <span className="text-xs text-gray-400">
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {message.editedAt && <span className="text-[11px] text-gray-400">Edited</span>}
                    </div>
                    <p className="mt-1 text-sm text-gray-700">
                      {message.deletedAt ? 'This message was deleted.' : message.content}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <button
                        onClick={() => {
                          setActiveThread(message)
                          loadThread(message)
                        }}
                        className="text-xs font-semibold text-orange-700"
                      >
                        {message.replyCount ? `${message.replyCount} replies` : 'Reply in thread'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <div className="border-t border-orange-100 px-5 py-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <textarea
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  placeholder="Write a message..."
                  className="flex-1 min-h-[90px] rounded-2xl border border-orange-200 bg-white p-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
                <button
                  onClick={sendMessage}
                  className="h-[48px] rounded-full bg-orange-600 px-6 text-sm font-semibold text-white"
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          <aside className="rounded-3xl bg-white/95 ring-1 ring-orange-100 shadow-sm">
            <div className="border-b border-orange-100 px-5 py-4">
              <p className="text-sm font-semibold text-gray-900">Thread</p>
              <p className="text-xs text-gray-500 mt-1">Keep focused conversations right here.</p>
            </div>
            {activeThread ? (
              <div className="flex h-[60vh] flex-col">
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                  <div className="rounded-2xl bg-orange-50 p-3">
                    <p className="text-sm font-semibold text-gray-900">{activeThread.userName || 'User'}</p>
                    <p className="mt-1 text-sm text-gray-700">{activeThread.content}</p>
                  </div>
                  {threadReplies.map((reply) => (
                    <div key={reply.id} className="flex gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 text-white flex items-center justify-center text-xs font-semibold">
                        {(reply.userName || 'U')[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{reply.userName || 'User'}</p>
                        <p className="mt-1 text-sm text-gray-700">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-orange-100 px-5 py-4">
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={replyText}
                      onChange={(event) => setReplyText(event.target.value)}
                      placeholder="Reply in thread"
                      className="min-h-[72px] rounded-2xl border border-orange-200 bg-white p-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    />
                    <button
                      onClick={sendReply}
                      className="rounded-full bg-orange-600 px-4 py-2 text-xs font-semibold text-white"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-5 py-8">
                <EmptyState
                  title="Select a message"
                  description="Open a thread to focus the discussion."
                />
              </div>
            )}
          </aside>
        </section>
      </div>
    </DashboardLayout>
  )
}
