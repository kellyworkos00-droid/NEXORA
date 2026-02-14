'use client'

interface TimelineItem {
  id: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'task'
  title: string
  description: string
  timestamp: string
  actor?: string
}

interface ActivityTimelineProps {
  items: TimelineItem[]
}

const typeIcons = {
  call: '📞',
  email: '📧',
  meeting: '📅',
  note: '📝',
  task: '✓',
}

const typeBgColors = {
  call: 'bg-blue-100 dark:bg-blue-900/30',
  email: 'bg-purple-100 dark:bg-purple-900/30',
  meeting: 'bg-green-100 dark:bg-green-900/30',
  note: 'bg-gray-100 dark:bg-slate-700',
  task: 'bg-orange-100 dark:bg-orange-900/30',
}

export function ActivityTimeline({ items }: ActivityTimelineProps) {
  return (
    <div className="space-y-6">
      {items.map((item, index) => (
        <div key={item.id} className="flex gap-4">
          {/* Timeline line and dot */}
          <div className="flex flex-col items-center">
            <div className={`h-10 w-10 rounded-full ${typeBgColors[item.type]} flex items-center justify-center text-lg`}>
              {typeIcons[item.type]}
            </div>
            {index < items.length - 1 && (
              <div className="w-1 h-12 bg-gradient-to-b from-gray-300 to-gray-200 dark:from-slate-600 dark:to-slate-700 mt-2"></div>
            )}
          </div>

          {/* Content */}
          <div className="pt-1 pb-4 flex-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{item.title}</p>
                {item.actor && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.actor}</p>
                )}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{item.timestamp}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
