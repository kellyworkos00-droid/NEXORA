import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { ActivityTimeline } from '@/components/dashboard/charts/activity-timeline'

// Mock data
const allActivities = [
  {
    id: '1',
    type: 'email' as const,
    title: 'Email sent to Acme Corporation',
    description: 'Quarterly business review proposal shared',
    timestamp: '2 hours ago',
    actor: 'You',
  },
  {
    id: '2',
    type: 'call' as const,
    title: 'Call with TechFlow Inc',
    description: 'Discussed integration roadmap and timelines',
    timestamp: '4 hours ago',
    actor: 'Sarah Chen',
  },
  {
    id: '3',
    type: 'meeting' as const,
    title: 'Team sync completed',
    description: 'Weekly pipeline review meeting',
    timestamp: '1 day ago',
    actor: 'Calendar',
  },
  {
    id: '4',
    type: 'note' as const,
    title: 'Deal moved to negotiation',
    description: 'Global Ventures contract progressing',
    timestamp: '1 day ago',
    actor: 'Mike Johnson',
  },
  {
    id: '5',
    type: 'email' as const,
    title: 'Follow-up email sent',
    description: 'Reminded about pending proposal review',
    timestamp: '2 days ago',
    actor: 'You',
  },
  {
    id: '6',
    type: 'meeting' as const,
    title: 'Customer onboarding call',
    description: 'New customer TechFlow Inc orientation',
    timestamp: '2 days ago',
    actor: 'Support Team',
  },
  {
    id: '7',
    type: 'task' as const,
    title: 'Task completed',
    description: 'Follow up with 3 accounts due today',
    timestamp: '3 days ago',
    actor: 'You',
  },
  {
    id: '8',
    type: 'call' as const,
    title: 'Support call',
    description: 'Acme Corporation technical support',
    timestamp: '3 days ago',
    actor: 'Lisa Park',
  },
]

export default function ActivitiesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Activity Feed</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Timeline of all CRM activities and interactions</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-slate-700">
          <button className="px-4 py-2 border-b-2 border-purple-600 text-purple-600 dark:text-purple-400 font-medium">
            All Activities
          </button>
          <button className="px-4 py-2 border-b-2 border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
            Emails
          </button>
          <button className="px-4 py-2 border-b-2 border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
            Calls
          </button>
          <button className="px-4 py-2 border-b-2 border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
            Meetings
          </button>
          <button className="px-4 py-2 border-b-2 border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
            Tasks
          </button>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Today</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">4</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">18</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">72</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">284</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-8">
          <ActivityTimeline items={allActivities} />
        </div>
      </div>
    </DashboardLayout>
  )
}
