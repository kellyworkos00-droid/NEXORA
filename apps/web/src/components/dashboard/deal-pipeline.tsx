'use client'

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useState } from 'react'
import { Plus, MoreVertical, DollarSign, Calendar, User } from 'lucide-react'

interface Deal {
  id: string
  title: string
  customer: string
  value: number
  probability: number
  expectedClose: string
  assignee: string
}

interface Stage {
  id: string
  name: string
  deals: Deal[]
}

const initialStages: Stage[] = [
  {
    id: 'qualification',
    name: 'Qualification',
    deals: [
      {
        id: '1',
        title: 'Consulting Services',
        customer: 'Global Ventures',
        value: 25000,
        probability: 30,
        expectedClose: '2024-04-15',
        assignee: 'Admin User',
      },
    ],
  },
  {
    id: 'proposal',
    name: 'Proposal',
    deals: [
      {
        id: '2',
        title: 'Startup Package - Monthly',
        customer: 'TechStart Inc',
        value: 5000,
        probability: 50,
        expectedClose: '2024-02-28',
        assignee: 'Admin User',
      },
    ],
  },
  {
    id: 'negotiation',
    name: 'Negotiation',
    deals: [
      {
        id: '3',
        title: 'Enterprise License - Annual',
        customer: 'Acme Corporation',
        value: 150000,
        probability: 75,
        expectedClose: '2024-03-31',
        assignee: 'Admin User',
      },
    ],
  },
  {
    id: 'closed_won',
    name: 'Closed Won',
    deals: [],
  },
]

export default function DealPipeline() {
  const [stages, setStages] = useState<Stage[]>(initialStages)

  const onDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination } = result

    // Moving within the same column
    if (source.droppableId === destination.droppableId) {
      const stageIndex = stages.findIndex((s) => s.id === source.droppableId)
      const newDeals = Array.from(stages[stageIndex].deals)
      const [removed] = newDeals.splice(source.index, 1)
      newDeals.splice(destination.index, 0, removed)

      const newStages = [...stages]
      newStages[stageIndex].deals = newDeals
      setStages(newStages)
    } else {
      // Moving to a different column
      const sourceStageIndex = stages.findIndex((s) => s.id === source.droppableId)
      const destStageIndex = stages.findIndex((s) => s.id === destination.droppableId)

      const sourceDeals = Array.from(stages[sourceStageIndex].deals)
      const destDeals = Array.from(stages[destStageIndex].deals)

      const [removed] = sourceDeals.splice(source.index, 1)
      destDeals.splice(destination.index, 0, removed)

      const newStages = [...stages]
      newStages[sourceStageIndex].deals = sourceDeals
      newStages[destStageIndex].deals = destDeals
      setStages(newStages)
    }
  }

  const getTotalValue = (deals: Deal[]) => {
    return deals.reduce((sum, deal) => sum + deal.value, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Pipeline</h1>
          <p className="text-gray-500 mt-1">Manage your deals and opportunities</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <Plus className="h-5 w-5" />
          <span>Add Deal</span>
        </button>
      </div>

      {/* Pipeline stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stages.map((stage) => {
          const totalValue = getTotalValue(stage.deals)
          const dealCount = stage.deals.length

          return (
            <div
              key={stage.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              <h3 className="text-sm font-medium text-gray-500">{stage.name}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ${totalValue.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">{dealCount} deals</p>
            </div>
          )
        })}
      </div>

      {/* Kanban board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 overflow-x-auto">
          {stages.map((stage) => (
            <div key={stage.id} className="min-w-[300px]">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    {stage.name} ({stage.deals.length})
                  </h3>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Plus className="h-5 w-5" />
                  </button>
                </div>

                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-3 min-h-[400px] ${
                        snapshot.isDraggingOver ? 'bg-purple-50 rounded-lg' : ''
                      }`}
                    >
                      {stage.deals.map((deal, index) => (
                        <Draggable key={deal.id} draggableId={deal.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium text-gray-900 text-sm">
                                  {deal.title}
                                </h4>
                                <button className="text-gray-400 hover:text-gray-600">
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </div>

                              <p className="text-sm text-gray-500 mb-3">
                                {deal.customer}
                              </p>

                              <div className="space-y-2 text-sm">
                                <div className="flex items-center text-gray-600">
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  <span className="font-semibold">
                                    ${deal.value.toLocaleString()}
                                  </span>
                                  <span className="ml-2 text-gray-500">
                                    {deal.probability}%
                                  </span>
                                </div>

                                <div className="flex items-center text-gray-600">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  <span>
                                    {new Date(deal.expectedClose).toLocaleDateString()}
                                  </span>
                                </div>

                                <div className="flex items-center text-gray-600">
                                  <User className="h-4 w-4 mr-1" />
                                  <span>{deal.assignee}</span>
                                </div>
                              </div>

                              {/* Probability bar */}
                              <div className="mt-3">
                                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-purple-600 rounded-full"
                                    style={{ width: `${deal.probability}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
