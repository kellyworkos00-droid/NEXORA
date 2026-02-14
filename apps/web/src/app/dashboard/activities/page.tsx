'use client'

import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { ActivityTimeline } from '@/components/dashboard/charts/activity-timeline'
import { useActivities } from '@/hooks/use-api'
import { LoadingSpinner, ErrorState } from '@/components/dashboard/ui-states'

export default function ActivitiesPage() {
  const { data: allActivities, loading, error } = useActivities()

  if (loading) return <DashboardLayout><LoadingSpinner text="Loading activities..." /></DashboardLayout>
  if (error) return <DashboardLayout><ErrorState message={error.message} /></DashboardLayout>

  const activities = allActivities || []
  const today = new Date()
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

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
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{activities.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{activities.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{activities.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{activities.length}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-8">
          {activities.length > 0 ? (
            <ActivityTimeline items={activities} />
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">No activities yet</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
