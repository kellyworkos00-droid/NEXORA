import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { StatCard } from '@/components/dashboard/charts/stat-card'
import { LineChart } from '@/components/dashboard/charts/line-chart'
import { BarChart } from '@/components/dashboard/charts/bar-chart'
import { TrendingUp, Users, DollarSign, Zap } from 'lucide-react'

export default function AnalyticsPage() {
  // Sample data for charts
  const revenueData = [
    { label: 'Jan', value: 45000 },
    { label: 'Feb', value: 52000 },
    { label: 'Mar', value: 48000 },
    { label: 'Apr', value: 61000 },
    { label: 'May', value: 55000 },
    { label: 'Jun', value: 72000 },
  ]

  const dealStageData = [
    { label: 'Lead', value: 24 },
    { label: 'Discovery', value: 18 },
    { label: 'Proposal', value: 12 },
    { label: 'Negotiation', value: 8 },
    { label: 'Closed', value: 6 },
  ]

  const conversionData = [
    { label: 'Week 1', value: 14 },
    { label: 'Week 2', value: 18 },
    { label: 'Week 3', value: 16 },
    { label: 'Week 4', value: 22 },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Performance metrics and business insights</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value="$385K"
            change="+18% from last month"
            changeType="positive"
            icon={<DollarSign />}
            color="green"
          />
          <StatCard
            title="Active Deals"
            value="68"
            change="+12 new deals"
            changeType="positive"
            icon={<TrendingUp />}
            color="blue"
          />
          <StatCard
            title="Total Customers"
            value="142"
            change="+8 new customers"
            changeType="positive"
            icon={<Users />}
            color="purple"
          />
          <StatCard
            title="Win Rate"
            value="42%"
            change="+4% from last quarter"
            changeType="positive"
            icon={<Zap />}
            color="orange"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LineChart title="Revenue Trend (Last 6 Months)" data={revenueData} />
          <BarChart title="Deals by Stage" data={dealStageData} />
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pipeline Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Pipeline</span>
                <span className="font-semibold text-gray-900 dark:text-white">$2.4M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Qualified Leads</span>
                <span className="font-semibold text-gray-900 dark:text-white">$890K</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">In Negotiation</span>
                <span className="font-semibold text-gray-900 dark:text-white">$520K</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Expected Close</span>
                <span className="font-semibold text-gray-900 dark:text-white">$380K</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer Metrics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Avg Contract Value</span>
                <span className="font-semibold text-gray-900 dark:text-white">$47.3K</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Customer Retention</span>
                <span className="font-semibold text-gray-900 dark:text-white">94%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Avg Deal Cycle</span>
                <span className="font-semibold text-gray-900 dark:text-white">45 days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">New Customers (MoM)</span>
                <span className="font-semibold text-gray-900 dark:text-white">+18</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Team Performance</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Top Performer</span>
                <span className="font-semibold text-gray-900 dark:text-white">Sarah Chen</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Avg Deals/Person</span>
                <span className="font-semibold text-gray-900 dark:text-white">8.5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Team Win Rate</span>
                <span className="font-semibold text-gray-900 dark:text-white">42%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Activities This Week</span>
                <span className="font-semibold text-gray-900 dark:text-white">284</span>
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Conversions</h2>
          <BarChart title="" data={conversionData} height={250} />
        </div>

        {/* Forecast */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Q1 2026 Forecast</h2>
          <p className="text-purple-100 mb-4">Based on current pipeline and conversion trends</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-purple-200 text-sm">Projected Revenue</p>
              <p className="text-3xl font-bold">$1.2M</p>
            </div>
            <div>
              <p className="text-purple-200 text-sm">Expected Deals</p>
              <p className="text-3xl font-bold">24</p>
            </div>
            <div>
              <p className="text-purple-200 text-sm">Target Achievement</p>
              <p className="text-3xl font-bold">87%</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
