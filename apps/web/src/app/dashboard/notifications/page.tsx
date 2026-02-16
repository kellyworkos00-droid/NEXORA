import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/dashboard-layout'

const filters = ['All', 'Unread', 'Security', 'Account', 'System']

const notifications = [
  {
    title: 'Email verified successfully',
    message: 'Your email address is confirmed. You now have full access to all features.',
    time: '2 hours ago',
    tag: 'Account',
    unread: true,
  },
  {
    title: 'New login from iPhone 15',
    message: 'A new device signed in from Lagos, Nigeria. Review your sessions if this was not you.',
    time: '5 hours ago',
    tag: 'Security',
    unread: true,
  },
  {
    title: '2FA enabled',
    message: 'Two-factor authentication is now protecting your account.',
    time: 'Yesterday',
    tag: 'Security',
    unread: false,
  },
  {
    title: 'Weekly pipeline report is ready',
    message: 'Your Q1 pipeline summary has been generated. Review the highlights.',
    time: '2 days ago',
    tag: 'System',
    unread: false,
  },
]

export default function NotificationsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="rounded-3xl bg-white/90 ring-1 ring-orange-100 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">Notifications</p>
              <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">Stay ahead of every update</h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-2xl">
                Monitor security, system updates, and account activity in one place. Mark alerts as read or jump into action.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 rounded-full bg-orange-600 text-white text-sm font-semibold shadow-sm hover:bg-orange-700">
                Mark all read
              </button>
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-full bg-white text-gray-700 text-sm font-semibold ring-1 ring-orange-200 hover:bg-orange-50"
              >
                Back to dashboard
              </Link>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {filters.map((filter, index) => (
                <button
                  key={filter}
                  className={`px-4 py-2 rounded-full text-sm font-semibold ring-1 transition-colors ${
                    index === 0
                      ? 'bg-orange-600 text-white ring-orange-600'
                      : 'bg-white text-gray-700 ring-orange-200 hover:bg-orange-50'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.title}
              className={`rounded-2xl bg-white/95 ring-1 p-5 shadow-sm ${
                notification.unread ? 'ring-orange-200' : 'ring-gray-200'
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        notification.unread ? 'bg-orange-500' : 'bg-gray-300'
                      }`}
                    />
                    <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                    <span className="text-xs font-semibold uppercase tracking-wide text-orange-700 bg-orange-50 px-2 py-1 rounded-full">
                      {notification.tag}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{notification.time}</span>
                  <button className="px-3 py-1 rounded-full text-xs font-semibold text-orange-700 bg-orange-50">
                    Mark read
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-2xl bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 ring-1 ring-orange-100 p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Tune notification preferences</h2>
              <p className="text-sm text-gray-600 mt-1">
                Choose exactly which updates you want to receive across email, push, and in-app alerts.
              </p>
            </div>
            <Link
              href="/dashboard/settings"
              className="px-4 py-2 rounded-full bg-white text-gray-700 text-sm font-semibold ring-1 ring-orange-200 hover:bg-orange-50"
            >
              Manage settings
            </Link>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
