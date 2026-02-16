"use client"

import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { EmptyState, LoadingSpinner } from '@/components/dashboard/ui-states'

interface TaskList {
  id: string
  name: string
  description?: string | null
  color: string
}

interface Task {
  id: string
  listId: string
  title: string
  description?: string | null
  status: 'todo' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueAt?: string | null
  orderIndex: number
}

interface TaskComment {
  id: string
  userId: string
  content: string
  createdAt: string
  userName?: string
  userAvatar?: string | null
}

interface TaskAssignee {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
}

interface TaskSprint {
  id: string
  listId: string
  name: string
  goal?: string | null
  startAt?: string | null
  endAt?: string | null
  status: 'planned' | 'active' | 'completed' | 'archived'
}

const statusColumns = [
  { id: 'todo', title: 'To do', color: 'bg-amber-100 text-amber-700' },
  { id: 'in_progress', title: 'In progress', color: 'bg-orange-100 text-orange-700' },
  { id: 'review', title: 'Review', color: 'bg-rose-100 text-rose-700' },
  { id: 'done', title: 'Done', color: 'bg-emerald-100 text-emerald-700' },
] as const

export default function TasksPage() {
  const [lists, setLists] = useState<TaskList[]>([])
  const [activeListId, setActiveListId] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [searchResults, setSearchResults] = useState<Task[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [comments, setComments] = useState<TaskComment[]>([])
  const [commentText, setCommentText] = useState('')
  const [assignees, setAssignees] = useState<TaskAssignee[]>([])
  const [assigneeCandidates, setAssigneeCandidates] = useState<TaskAssignee[]>([])
  const [assigneeQuery, setAssigneeQuery] = useState('')
  const [assigneeLoading, setAssigneeLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'board' | 'sprints' | 'backlog'>('board')
  const [sprints, setSprints] = useState<TaskSprint[]>([])
  const [activeSprintId, setActiveSprintId] = useState<string | null>(null)
  const [sprintItems, setSprintItems] = useState<Record<string, Task[]>>({})
  const [sprintLoading, setSprintLoading] = useState(false)
  const [newSprintName, setNewSprintName] = useState('')
  const [newSprintGoal, setNewSprintGoal] = useState('')
  const [newSprintStart, setNewSprintStart] = useState('')
  const [newSprintEnd, setNewSprintEnd] = useState('')

  const activeList = useMemo(() => lists.find((list) => list.id === activeListId), [lists, activeListId])

  const loadLists = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tasks/lists')
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load task lists')
      }
      setLists(data.lists || [])
      if (!activeListId && data.lists?.length) {
        setActiveListId(data.lists[0].id)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load task lists')
    } finally {
      setLoading(false)
    }
  }

  const loadListTasks = async (listId: string) => {
    try {
      const response = await fetch(`/api/tasks/lists/${listId}/tasks`)
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load tasks')
      }
      setTasks(data.tasks || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks')
    }
  }

  const loadSearchTasks = async (listId: string, queryText: string, status: string, priority: string) => {
    try {
      const params = new URLSearchParams({
        listId,
        q: queryText,
        status: status === 'all' ? '' : status,
        priority: priority === 'all' ? '' : priority,
      })

      const response = await fetch(`/api/tasks/search?${params.toString()}`)
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to search tasks')
      }
      setSearchResults(data.tasks || [])
    } catch (err: any) {
      setError(err.message || 'Failed to search tasks')
    }
  }

  const createTask = async () => {
    try {
      if (!taskTitle.trim() || !activeListId) return
      setCreating(true)
      const response = await fetch(`/api/tasks/lists/${activeListId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: taskTitle.trim(), status: 'todo' }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create task')
      }
      setTasks((prev) => [...prev, data.task])
      setSearchResults(null)
      setTaskTitle('')
    } catch (err: any) {
      setError(err.message || 'Failed to create task')
    } finally {
      setCreating(false)
    }
  }

  const createList = async () => {
    try {
      const response = await fetch('/api/tasks/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New list', color: 'sunrise' }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create list')
      }
      setLists((prev) => [data.list, ...prev])
      setActiveListId(data.list.id)
    } catch (err: any) {
      setError(err.message || 'Failed to create list')
    }
  }

  const updateTask = async (taskId: string, payload: Partial<Task>) => {
    try {
      const response = await fetch(`/api/tasks/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update task')
      }
      setTasks((prev) => prev.map((item) => (item.id === taskId ? data.task : item)))
      setSearchResults((prev) =>
        prev ? prev.map((item) => (item.id === taskId ? data.task : item)) : prev
      )
      if (activeTask?.id === taskId) {
        setActiveTask(data.task)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update task')
    }
  }

  const loadSprints = async (listId: string) => {
    try {
      setSprintLoading(true)
      const response = await fetch(`/api/tasks/sprints?listId=${listId}`)
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load sprints')
      }
      const loadedSprints = data.sprints || []
      setSprints(loadedSprints)

      if (loadedSprints.length > 0 && !activeSprintId) {
        setActiveSprintId(loadedSprints[0].id)
      }

      const itemsBySprint: Record<string, Task[]> = {}
      await Promise.all(
        loadedSprints.map(async (sprint: TaskSprint) => {
          const itemsResponse = await fetch(`/api/tasks/sprints/${sprint.id}/items`)
          const itemsData = await itemsResponse.json()
          if (itemsResponse.ok) {
            itemsBySprint[sprint.id] = itemsData.tasks || []
          }
        })
      )
      setSprintItems(itemsBySprint)
    } catch (err: any) {
      setError(err.message || 'Failed to load sprints')
    } finally {
      setSprintLoading(false)
    }
  }

  const updateSprint = async (sprintId: string, payload: Partial<TaskSprint>) => {
    try {
      const response = await fetch(`/api/tasks/sprints/${sprintId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update sprint')
      }
      setSprints((prev) => prev.map((sprint) => (sprint.id === sprintId ? data.sprint : sprint)))
    } catch (err: any) {
      setError(err.message || 'Failed to update sprint')
    }
  }

  const createSprint = async () => {
    try {
      if (!activeListId || !newSprintName.trim()) return
      const response = await fetch('/api/tasks/sprints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listId: activeListId,
          name: newSprintName.trim(),
          goal: newSprintGoal.trim() || null,
          startAt: newSprintStart || null,
          endAt: newSprintEnd || null,
          status: 'planned',
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create sprint')
      }
      setSprints((prev) => [data.sprint, ...prev])
      setActiveSprintId(data.sprint.id)
      setNewSprintName('')
      setNewSprintGoal('')
      setNewSprintStart('')
      setNewSprintEnd('')
    } catch (err: any) {
      setError(err.message || 'Failed to create sprint')
    }
  }

  const addTaskToSprint = async (sprintId: string, taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/sprints/${sprintId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add task to sprint')
      }
      const refreshed = await fetch(`/api/tasks/sprints/${sprintId}/items`)
      const refreshedData = await refreshed.json()
      if (refreshed.ok) {
        setSprintItems((prev) => ({ ...prev, [sprintId]: refreshedData.tasks || [] }))
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add task to sprint')
    }
  }

  const removeTaskFromSprint = async (sprintId: string, taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/sprints/${sprintId}/items`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove task from sprint')
      }
      const refreshed = await fetch(`/api/tasks/sprints/${sprintId}/items`)
      const refreshedData = await refreshed.json()
      if (refreshed.ok) {
        setSprintItems((prev) => ({ ...prev, [sprintId]: refreshedData.tasks || [] }))
      }
    } catch (err: any) {
      setError(err.message || 'Failed to remove task from sprint')
    }
  }

  const loadAssignees = async (taskId: string, queryText?: string) => {
    try {
      setAssigneeLoading(true)
      const params = queryText ? `?q=${encodeURIComponent(queryText)}` : ''
      const response = await fetch(`/api/tasks/tasks/${taskId}/assignees${params}`)
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load assignees')
      }
      setAssignees(data.assignees || [])
      setAssigneeCandidates(data.candidates || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load assignees')
    } finally {
      setAssigneeLoading(false)
    }
  }

  const addAssignee = async (assigneeId: string) => {
    if (!activeTask) return
    try {
      const response = await fetch(`/api/tasks/tasks/${activeTask.id}/assignees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigneeId }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add assignee')
      }
      loadAssignees(activeTask.id, assigneeQuery)
    } catch (err: any) {
      setError(err.message || 'Failed to add assignee')
    }
  }

  const removeAssignee = async (assigneeId: string) => {
    if (!activeTask) return
    try {
      const response = await fetch(`/api/tasks/tasks/${activeTask.id}/assignees`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigneeId }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove assignee')
      }
      loadAssignees(activeTask.id, assigneeQuery)
    } catch (err: any) {
      setError(err.message || 'Failed to remove assignee')
    }
  }

  useEffect(() => {
    loadLists()
  }, [])

  useEffect(() => {
    if (activeListId) {
      loadListTasks(activeListId)
      loadSprints(activeListId)
      setSearchResults(null)
    }
  }, [activeListId])

  useEffect(() => {
    if (!activeListId) return
    const hasServerFilters =
      searchQuery.trim().length > 0 || statusFilter !== 'all' || priorityFilter !== 'all'

    if (!hasServerFilters) {
      setSearchResults(null)
      return
    }

    loadSearchTasks(activeListId, searchQuery.trim(), statusFilter, priorityFilter)
  }, [activeListId, searchQuery, statusFilter, priorityFilter])

  useEffect(() => {
    if (!activeTask) return
    const loadComments = async () => {
      try {
        const response = await fetch(`/api/tasks/tasks/${activeTask.id}/comments`)
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load comments')
        }
        setComments(data.comments || [])
      } catch (err: any) {
        setError(err.message || 'Failed to load comments')
      }
    }
    loadComments()
    setAssigneeQuery('')
    loadAssignees(activeTask.id)
  }, [activeTask])

  useEffect(() => {
    if (!activeTask) return
    const handler = setTimeout(() => {
      loadAssignees(activeTask.id, assigneeQuery.trim())
    }, 300)

    return () => clearTimeout(handler)
  }, [assigneeQuery, activeTask])

  const hasServerFilters = useMemo(() => {
    return searchQuery.trim().length > 0 || statusFilter !== 'all' || priorityFilter !== 'all'
  }, [searchQuery, statusFilter, priorityFilter])

  const boardTasks = useMemo(() => {
    if (!hasServerFilters) return tasks
    return searchResults || []
  }, [hasServerFilters, searchResults, tasks])

  const tasksByStatus = useMemo(() => {
    return statusColumns.reduce((acc, column) => {
      acc[column.id] = boardTasks
        .filter((task) => task.status === column.id)
        .sort((a, b) => a.orderIndex - b.orderIndex)
      return acc
    }, {} as Record<string, Task[]>)
  }, [boardTasks])

  const activeSprint = useMemo(
    () => sprints.find((sprint) => sprint.id === activeSprintId) || null,
    [sprints, activeSprintId]
  )

  const sprintTaskIds = useMemo(() => {
    const ids = new Set<string>()
    Object.values(sprintItems).forEach((items) => {
      items.forEach((task) => ids.add(task.id))
    })
    return ids
  }, [sprintItems])

  const backlogTasks = useMemo(() => {
    return tasks.filter((task) => !sprintTaskIds.has(task.id))
  }, [tasks, sprintTaskIds])

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result
    if (!destination) return

    const sourceStatus = source.droppableId
    const destStatus = destination.droppableId as Task['status']

    if (sourceStatus === destStatus && destination.index === source.index) return

    const movedTask = tasks.find((task) => task.id === draggableId)
    if (!movedTask) return

    const updatedTask = { ...movedTask, status: destStatus }

    setTasks((prev) =>
      prev.map((task) => (task.id === movedTask.id ? updatedTask : task))
    )

    updateTask(movedTask.id, { status: destStatus })
  }

  const addComment = async () => {
    if (!activeTask || !commentText.trim()) return
    try {
      const response = await fetch(`/api/tasks/tasks/${activeTask.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText.trim() }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add comment')
      }
      setComments((prev) => [...prev, data.comment])
      setCommentText('')
    } catch (err: any) {
      setError(err.message || 'Failed to add comment')
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner text="Loading tasks" />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="rounded-3xl bg-gradient-to-br from-orange-100 via-rose-50 to-amber-100 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">Tasks</p>
              <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">ClickUp-ready workflows</h1>
              <p className="mt-2 text-sm sm:text-base text-gray-700">
                Plan sprints, track priorities, and keep every deliverable moving with clear stages.
              </p>
            </div>
            <button
              onClick={createList}
              className="rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm"
            >
              New list
            </button>
          </div>
        </section>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        {lists.length === 0 ? (
          <EmptyState
            title="No task lists yet"
            description="Create a list to start managing tasks."
            action={{ label: 'Create list', onClick: createList }}
          />
        ) : (
          <section className="space-y-5">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {lists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => setActiveListId(list.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 transition ${
                    activeListId === list.id
                      ? 'bg-orange-600 text-white ring-orange-600'
                      : 'bg-white text-gray-700 ring-orange-200 hover:bg-orange-50'
                  }`}
                >
                  {list.name}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { id: 'board', label: 'Board' },
                { id: 'sprints', label: 'Sprints' },
                { id: 'backlog', label: 'Backlog' },
              ].map((view) => (
                <button
                  key={view.id}
                  onClick={() => setViewMode(view.id as typeof viewMode)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
                    viewMode === view.id
                      ? 'bg-orange-600 text-white ring-orange-600'
                      : 'bg-white text-gray-700 ring-orange-200 hover:bg-orange-50'
                  }`}
                >
                  {view.label}
                </button>
              ))}
            </div>

            <div className="rounded-2xl bg-white/95 ring-1 ring-orange-100 p-4 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{activeList?.name}</p>
                  {activeList?.description && (
                    <p className="text-xs text-gray-600 mt-1">{activeList.description}</p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={taskTitle}
                    onChange={(event) => setTaskTitle(event.target.value)}
                    placeholder="New task"
                    className="w-full sm:w-64 rounded-full border border-orange-200 bg-white px-4 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  />
                  <button
                    onClick={createTask}
                    disabled={!taskTitle.trim() || creating}
                    className="rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {creating ? 'Adding…' : 'Add task'}
                  </button>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-[2fr_1fr_1fr]">
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search tasks"
                  className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                >
                  <option value="all">All statuses</option>
                  <option value="todo">To do</option>
                  <option value="in_progress">In progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={(event) => setPriorityFilter(event.target.value)}
                  className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                >
                  <option value="all">All priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {viewMode === 'board' && (
              <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid gap-4 lg:grid-cols-4">
                {statusColumns.map((column) => (
                  <Droppable droppableId={column.id} key={column.id}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="rounded-2xl bg-white/90 ring-1 ring-orange-100 p-4 min-h-[300px]"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{column.title}</p>
                            <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${column.color}`}>
                              {tasksByStatus[column.id]?.length || 0}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 space-y-3">
                          {tasksByStatus[column.id]?.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(dragProvided) => (
                                <div
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                  onClick={() => setActiveTask(task)}
                                  className="rounded-2xl bg-orange-50/60 p-4 ring-1 ring-orange-100 cursor-pointer"
                                >
                                  <p className="text-sm font-semibold text-gray-900">{task.title}</p>
                                  {task.description && (
                                    <p className="mt-2 text-xs text-gray-600">{task.description}</p>
                                  )}
                                  <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-500">
                                    <span className="rounded-full bg-white px-2 py-0.5 ring-1 ring-orange-200">
                                      {task.priority}
                                    </span>
                                    {task.dueAt && (
                                      <span className="rounded-full bg-white px-2 py-0.5 ring-1 ring-orange-200">
                                        Due {new Date(task.dueAt).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </DragDropContext>
            )}

            {viewMode === 'sprints' && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-white/95 ring-1 ring-orange-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Create sprint</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <input
                      value={newSprintName}
                      onChange={(event) => setNewSprintName(event.target.value)}
                      placeholder="Sprint name"
                      className="rounded-full border border-orange-200 bg-white px-3 py-2 text-sm"
                    />
                    <input
                      value={newSprintGoal}
                      onChange={(event) => setNewSprintGoal(event.target.value)}
                      placeholder="Goal (optional)"
                      className="rounded-full border border-orange-200 bg-white px-3 py-2 text-sm"
                    />
                    <input
                      type="date"
                      value={newSprintStart}
                      onChange={(event) => setNewSprintStart(event.target.value)}
                      placeholder="Start"
                      className="rounded-full border border-orange-200 bg-white px-3 py-2 text-sm"
                    />
                    <input
                      type="date"
                      value={newSprintEnd}
                      onChange={(event) => setNewSprintEnd(event.target.value)}
                      placeholder="End"
                      className="rounded-full border border-orange-200 bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <button
                    onClick={createSprint}
                    disabled={!newSprintName.trim()}
                    className="mt-3 rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    Create sprint
                  </button>
                </div>

                {sprints.length === 0 ? (
                  <p className="text-sm text-gray-500">No sprints yet. Create one above.</p>
                ) : (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {sprints.map((sprint) => (
                      <button
                        key={sprint.id}
                        onClick={() => setActiveSprintId(sprint.id)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 transition ${
                          activeSprintId === sprint.id
                            ? 'bg-orange-600 text-white ring-orange-600'
                            : 'bg-white text-gray-700 ring-orange-200 hover:bg-orange-50'
                        }`}
                      >
                        {sprint.name}
                      </button>
                    ))}
                  </div>
                )}

                {activeSprint && (
                  <div className="rounded-2xl bg-white/95 ring-1 ring-orange-100 p-4 space-y-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
                        {activeSprint.name}
                      </p>
                      {activeSprint.goal && <p className="mt-1 text-sm text-gray-700">{activeSprint.goal}</p>}
                      <div className="mt-2 flex gap-2 text-xs text-gray-500">
                        {activeSprint.startAt && <span>Start: {new Date(activeSprint.startAt).toLocaleDateString()}</span>}
                        {activeSprint.endAt && <span>End: {new Date(activeSprint.endAt).toLocaleDateString()}</span>}
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-orange-700 font-semibold">
                          {activeSprint.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      {sprintItems[activeSprint.id]?.length === 0 ? (
                        <p className="text-sm text-gray-500">No tasks in this sprint. Add from backlog.</p>
                      ) : (
                        sprintItems[activeSprint.id]?.map((task) => (
                          <div key={task.id} className="rounded-2xl bg-orange-50/60 p-4 ring-1 ring-orange-100">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">{task.title}</p>
                                {task.description && <p className="mt-1 text-xs text-gray-600">{task.description}</p>}
                                <div className="mt-2 flex gap-2 text-[11px] text-gray-500">
                                  <span className="rounded-full bg-white px-2 py-0.5 ring-1 ring-orange-200">
                                    {task.priority}
                                  </span>
                                  <span className="rounded-full bg-white px-2 py-0.5 ring-1 ring-orange-200">
                                    {task.status}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => removeTaskFromSprint(activeSprint.id, task.id)}
                                className="ml-2 rounded-full bg-rose-100 px-2 py-1 text-[11px] font-semibold text-rose-700"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex gap-2">
                      <select
                        value={activeSprint.status}
                        onChange={(event) =>
                          updateSprint(activeSprint.id, { status: event.target.value as TaskSprint['status'] })
                        }
                        className="rounded-full border border-orange-200 bg-white px-3 py-2 text-sm"
                      >
                        <option value="planned">Planned</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {viewMode === 'backlog' && (
              <div className="rounded-2xl bg-white/95 ring-1 ring-orange-100 p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">Backlog</p>
                <p className="text-xs text-gray-600">Tasks not yet assigned to any sprint.</p>

                {backlogTasks.length === 0 ? (
                  <p className="text-sm text-gray-500">All tasks are in sprints or none exist.</p>
                ) : (
                  <div className="grid gap-2">
                    {backlogTasks.map((task) => (
                      <div key={task.id} className="rounded-2xl bg-orange-50/60 p-4 ring-1 ring-orange-100">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">{task.title}</p>
                            {task.description && <p className="mt-1 text-xs text-gray-600">{task.description}</p>}
                            <div className="mt-2 flex gap-2 text-[11px] text-gray-500">
                              <span className="rounded-full bg-white px-2 py-0.5 ring-1 ring-orange-200">
                                {task.priority}
                              </span>
                              <span className="rounded-full bg-white px-2 py-0.5 ring-1 ring-orange-200">
                                {task.status}
                              </span>
                            </div>
                          </div>
                          {activeSprintId && (
                            <button
                              onClick={() => addTaskToSprint(activeSprintId, task.id)}
                              className="ml-2 rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700"
                            >
                              Add to {activeSprint?.name || 'Sprint'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTask && (
              <div className="fixed inset-0 z-50 bg-black/30 flex items-end sm:items-center justify-center p-4">
                <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">Task details</p>
                      <h3 className="mt-2 text-xl font-semibold text-gray-900">{activeTask.title}</h3>
                    </div>
                    <button
                      onClick={() => setActiveTask(null)}
                      className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700"
                    >
                      Close
                    </button>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Priority</label>
                      <select
                        value={activeTask.priority}
                        onChange={(event) =>
                          updateTask(activeTask.id, { priority: event.target.value as Task['priority'] })
                        }
                        className="mt-2 w-full rounded-2xl border border-orange-200 bg-white px-3 py-2 text-sm"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Due date</label>
                      <input
                        type="date"
                        value={activeTask.dueAt ? new Date(activeTask.dueAt).toISOString().slice(0, 10) : ''}
                        onChange={(event) =>
                          updateTask(activeTask.id, { dueAt: event.target.value || null })
                        }
                        className="mt-2 w-full rounded-2xl border border-orange-200 bg-white px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Description</label>
                    <textarea
                      defaultValue={activeTask.description || ''}
                      onBlur={(event) => updateTask(activeTask.id, { description: event.target.value })}
                      className="mt-2 w-full rounded-2xl border border-orange-200 bg-white px-3 py-2 text-sm min-h-[100px]"
                    />
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Assignees</p>
                    {assigneeLoading ? (
                      <p className="mt-2 text-sm text-gray-500">Loading...</p>
                    ) : (
                      <>
                        {assignees.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {assignees.map((assignee) => (
                              <div
                                key={assignee.id}
                                className="flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 ring-1 ring-orange-200"
                              >
                                <span className="text-xs font-semibold text-gray-900">{assignee.name}</span>
                                <button
                                  onClick={() => removeAssignee(assignee.id)}
                                  className="text-xs font-bold text-rose-600"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="mt-3">
                          <input
                            value={assigneeQuery}
                            onChange={(event) => setAssigneeQuery(event.target.value)}
                            placeholder="Search users to assign"
                            className="w-full rounded-full border border-orange-200 bg-white px-4 py-2 text-sm"
                          />
                          {assigneeCandidates.length > 0 && (
                            <div className="mt-2 max-h-32 space-y-1 overflow-y-auto">
                              {assigneeCandidates.map((candidate) => (
                                <button
                                  key={candidate.id}
                                  onClick={() => addAssignee(candidate.id)}
                                  className="w-full rounded-2xl bg-white px-3 py-2 text-left text-sm hover:bg-orange-50 ring-1 ring-orange-200"
                                >
                                  <span className="font-semibold text-gray-900">{candidate.name}</span>
                                  <span className="ml-2 text-xs text-gray-500">{candidate.email}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Comments</p>
                    <div className="mt-3 space-y-3 max-h-48 overflow-y-auto">
                      {comments.length === 0 ? (
                        <p className="text-sm text-gray-500">No comments yet.</p>
                      ) : (
                        comments.map((comment) => (
                          <div key={comment.id} className="rounded-2xl bg-orange-50/60 p-3">
                            <p className="text-xs font-semibold text-gray-900">{comment.userName || 'User'}</p>
                            <p className="mt-1 text-sm text-gray-700">{comment.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="mt-3 flex flex-col sm:flex-row gap-2">
                      <input
                        value={commentText}
                        onChange={(event) => setCommentText(event.target.value)}
                        placeholder="Add a comment"
                        className="flex-1 rounded-full border border-orange-200 bg-white px-4 py-2 text-sm"
                      />
                      <button
                        onClick={addComment}
                        className="rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white"
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </DashboardLayout>
  )
}
