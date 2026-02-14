import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { ActivityTimeline } from '@/components/dashboard/charts/activity-timeline'
import Link from 'next/link'
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react'

// Mock data - in production, fetch from API
const customers: Record<string, any> = {
  '1': {
    id: '1',
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    phone: '+1 (555) 123-4567',
    website: 'acme.com',
    location: 'San Francisco, CA',
    industry: 'Technology',
    employees: '500-1000',
    status: 'Active',
    annualValue: '$450K',
    joinDate: 'Jan 15, 2024',
    lastContact: '2 days ago',
    description: 'Leading enterprise software company specializing in cloud infrastructure and AI solutions.',
  },
  '2': {
    id: '2',
    name: 'TechFlow Inc',
    email: 'sales@techflow.com',
    phone: '+1 (555) 987-6543',
    website: 'techflow.io',
    location: 'Austin, TX',
    industry: 'Software',
    employees: '50-100',
    status: 'Active',
    annualValue: '$120K',
    joinDate: 'Mar 22, 2024',
    lastContact: '1 week ago',
    description: 'Innovative startup focused on developer tools and automation.',
  },
  '3': {
    id: '3',
    name: 'Global Ventures Ltd',
    email: 'info@globalventures.com',
    phone: '+1 (555) 456-7890',
    website: 'globalventures.co',
    location: 'New York, NY',
    industry: 'Consulting',
    employees: '100-500',
    status: 'Active',
    annualValue: '$280K',
    joinDate: 'Feb 10, 2024',
    lastContact: '3 days ago',
    description: 'Business consulting firm helping companies with digital transformation.',
  },
}

const activities = [
  {
    id: '1',
    type: 'email' as const,
    title: 'Email sent',
    description: 'Proposal document shared with stakeholders',
    timestamp: '2 days ago',
    actor: 'You',
  },
  {
    id: '2',
    type: 'call' as const,
    title: 'Call completed',
    description: 'Follow-up call with engineering team',
    timestamp: '3 days ago',
    actor: 'Alex Johnson',
  },
  {
    id: '3',
    type: 'meeting' as const,
    title: 'Meeting scheduled',
    description: 'Q1 planning meeting confirmed',
    timestamp: '1 week ago',
    actor: 'Calendar',
  },
  {
    id: '4',
    type: 'note' as const,
    title: 'Note added',
    description: 'Customer interested in enterprise plan upgrade',
    timestamp: '1 week ago',
    actor: 'You',
  },
]

const relatedDeals = [
  {
    id: '1',
    name: 'Enterprise License Renewal',
    amount: '$150K',
    stage: 'Negotiation',
    dueDate: 'Feb 28, 2026',
    probability: 75,
  },
  {
    id: '2',
    name: 'Custom Integration Project',
    amount: '$85K',
    stage: 'Proposal',
    dueDate: 'Mar 15, 2026',
    probability: 60,
  },
  {
    id: '3',
    name: 'Support Contract Expansion',
    amount: '$45K',
    stage: 'Discovery',
    dueDate: 'Apr 10, 2026',
    probability: 40,
  },
]

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = customers[params.id] || customers['1']

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard/customers" className="text-purple-600 dark:text-purple-400 hover:underline text-sm mb-2 inline-block">
              ← Back to Customers
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{customer.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{customer.description}</p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
              {customer.status}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-semibold">Annual Value</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{customer.annualValue}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-semibold">Customer Since</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{customer.joinDate}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-semibold">Last Contact</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{customer.lastContact}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-semibold">Employees</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{customer.employees}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Email</p>
                    <a href={`mailto:${customer.email}`} className="text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400">
                      {customer.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Phone</p>
                    <a href={`tel:${customer.phone}`} className="text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400">
                      {customer.phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Location</p>
                    <p className="text-gray-900 dark:text-white">{customer.location}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <ExternalLink className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Website</p>
                    <a href={`https://${customer.website}`} target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">
                      {customer.website}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Interaction History</h2>
              <ActivityTimeline items={activities} />
            </div>
          </div>

          {/* Right Column - Related Deals */}
          <div>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Related Deals</h2>
              <div className="space-y-3">
                {relatedDeals.map((deal) => (
                  <Link
                    key={deal.id}
                    href={`/dashboard/deals/${deal.id}`}
                    className="block p-3 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{deal.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{deal.stage}</p>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{deal.amount}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">{deal.dueDate}</span>
                      <div className="flex items-center gap-1">
                        <div className="h-1.5 w-12 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-600" style={{ width: `${deal.probability}%` }}></div>
                        </div>
                        <span className="text-gray-600 dark:text-gray-400">{deal.probability}%</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Company Details */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Industry</p>
              <p className="text-gray-900 dark:text-white mt-1">{customer.industry}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Company Size</p>
              <p className="text-gray-900 dark:text-white mt-1">{customer.employees}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Account Status</p>
              <p className="text-gray-900 dark:text-white mt-1">{customer.status}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
