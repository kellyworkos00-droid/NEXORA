import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/dashboard-layout'

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-100 via-rose-50 to-amber-100 p-6 sm:p-8">
          <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-white/40 blur-2xl" />
          <div className="absolute -left-10 -bottom-16 h-40 w-40 rounded-full bg-orange-200/60 blur-2xl" />
          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">Good afternoon</p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
              Your pipeline is heating up.
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-700 max-w-xl">
              Keep momentum on key deals, follow up on new leads, and ship next week’s launches with confidence.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button className="px-4 py-2 rounded-full bg-orange-600 text-white text-sm font-semibold shadow-sm hover:bg-orange-700">
                Create deal
              </button>
              <button className="px-4 py-2 rounded-full bg-white/80 text-orange-700 text-sm font-semibold ring-1 ring-orange-200 hover:bg-white">
                Schedule follow-up
              </button>
              <Link
                href="/dashboard/notifications"
                className="px-4 py-2 rounded-full bg-white/80 text-gray-800 text-sm font-semibold ring-1 ring-orange-200 hover:bg-white"
              >
                View notifications
              </Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Total Revenue', value: '$180K', trend: '+12% this month', barClass: 'bg-emerald-200' },
            { label: 'Active Deals', value: '24', trend: '3 closing this week', barClass: 'bg-orange-200' },
            { label: 'New Customers', value: '48', trend: '+8% this month', barClass: 'bg-rose-200' },
            { label: 'Pending Tasks', value: '12', trend: '5 due today', barClass: 'bg-amber-200' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl bg-white/90 ring-1 ring-orange-100 p-4 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="mt-2 text-xs text-gray-600">{stat.trend}</p>
              <div className={`mt-4 h-1.5 w-12 rounded-full ${stat.barClass}`} />
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl bg-white/90 ring-1 ring-orange-100 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Today’s Focus</h2>
              <button className="text-sm font-semibold text-orange-700">See all</button>
            </div>
            <div className="mt-4 space-y-4">
              {[
                { title: 'Follow up with Orbit Media', time: '11:30 AM', tag: 'High priority' },
                { title: 'Finalize Nova Labs proposal', time: '2:00 PM', tag: 'Due today' },
                { title: 'Prep Q1 handoff with Growth team', time: '4:00 PM', tag: 'Internal' },
              ].map((item) => (
                <div key={item.title} className="flex items-center justify-between rounded-xl bg-orange-50/60 p-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{item.time}</p>
                  </div>
                  <span className="text-xs font-semibold text-orange-700 bg-white px-2 py-1 rounded-full ring-1 ring-orange-200">
                    {item.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white/90 ring-1 ring-orange-100 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              <Link className="text-sm font-semibold text-orange-700" href="/dashboard/notifications">
                View all
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {[
                { title: 'Email verified', meta: '2h ago', dotClass: 'bg-emerald-400' },
                { title: 'New login from iPhone', meta: '5h ago', dotClass: 'bg-amber-400' },
                { title: '2FA enabled successfully', meta: '1d ago', dotClass: 'bg-rose-400' },
              ].map((note) => (
                <div key={note.title} className="flex items-center gap-3 rounded-xl bg-orange-50/60 p-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${note.dotClass}`} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{note.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{note.meta}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
