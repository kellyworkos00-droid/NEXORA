'use client'

import DashboardLayout from '@/components/dashboard/dashboard-layout'

export default function PreviewPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Preview</h1>
          <p className="text-gray-500 mt-1">Experience NEXORA's AI-powered CRM dashboard with sample data.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">$2.4M</p>
                <p className="text-sm text-green-600 mt-2">+23% from last quarter</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Deals</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">127</p>
                <p className="text-sm text-blue-600 mt-2">$18.5M total pipeline</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Customers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">892</p>
                <p className="text-sm text-purple-600 mt-2">+45 this month</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM16 20a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Win Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">73%</p>
                <p className="text-sm text-orange-600 mt-2">+8% vs industry avg</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity & AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 pb-4 border-b border-gray-200">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-semibold text-sm">✓</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Deal closed</span> - TechCorp Solutions for $285K
                  </p>
                  <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 pb-4 border-b border-gray-200">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">+</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">New customer</span> added - InnovateBuild Inc
                  </p>
                  <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 pb-4 border-b border-gray-200">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                  <span className="text-yellow-600 font-semibold text-sm">!</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Deal at risk</span> - DataFlow Systems (no activity 7 days)
                  </p>
                  <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-purple-600 font-semibold text-sm">🤖</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">AI Insight:</span> Next deal likely to close is with BrightStart (94% probability)
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Generated 1 hour ago</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-sm border border-purple-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Predictions</h2>
            <div className="space-y-3">
              <div className="bg-white rounded p-3">
                <p className="text-xs font-medium text-gray-500">Next 30 Days Revenue</p>
                <p className="text-xl font-bold text-gray-900 mt-1">$890K</p>
                <p className="text-xs text-green-600 mt-1">+18% confidence</p>
              </div>
              <div className="bg-white rounded p-3">
                <p className="text-xs font-medium text-gray-500">Churn Risk</p>
                <p className="text-xl font-bold text-gray-900 mt-1">3 customers</p>
                <p className="text-xs text-orange-600 mt-1">Action recommended</p>
              </div>
              <div className="bg-white rounded p-3">
                <p className="text-xs font-medium text-gray-500">Best Time to Upsell</p>
                <p className="text-xl font-bold text-gray-900 mt-1">Friday 2-4 PM</p>
                <p className="text-xs text-blue-600 mt-1">Based on past data</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pipeline Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Deal Pipeline Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { stage: 'Lead', count: 34, value: '$850K', color: 'bg-slate-100' },
              { stage: 'Qualified', count: 28, value: '$1.2M', color: 'bg-blue-100' },
              { stage: 'Proposal', count: 18, value: '$2.1M', color: 'bg-yellow-100' },
              { stage: 'Negotiation', count: 12, value: '$3.2M', color: 'bg-green-100' },
            ].map((stage) => (
              <div key={stage.stage} className={`${stage.color} rounded-lg p-4`}>
                <p className="text-sm font-medium text-gray-700">{stage.stage}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stage.count}</p>
                <p className="text-sm font-semibold text-gray-600 mt-1">{stage.value} value</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
