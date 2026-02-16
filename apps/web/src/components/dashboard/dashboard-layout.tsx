'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  BarChart3,
  Package,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  Bell,
  Search,
  PenSquare,
  MessageSquare,
  CheckSquare,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Whiteboards', href: '/dashboard/whiteboards', icon: PenSquare },
  { name: 'Chat', href: '/dashboard/chat', icon: MessageSquare },
  { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Customers', href: '/dashboard/customers', icon: Users },
  { name: 'Deals', href: '/dashboard/deals', icon: Briefcase },
  { name: 'Activities', href: '/dashboard/activities', icon: Calendar },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Products', href: '/dashboard/products', icon: Package },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-[#FFF7F0] dark:bg-slate-950">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 transform bg-white dark:bg-slate-900 border-r border-orange-100 dark:border-slate-800
          transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-orange-100 dark:border-slate-800">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 via-rose-500 to-amber-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">NEXORA</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-colors duration-150
                    ${
                      isActive
                        ? 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-200'
                        : 'text-gray-700 hover:bg-orange-50/70 hover:text-gray-900 dark:text-slate-200 dark:hover:bg-slate-800'
                    }
                  `}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User menu */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-semibold">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Admin User
                </p>
                <p className="text-xs text-gray-500 truncate">
                  admin@demo.nexora.ai
                </p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-orange-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur px-4 sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-700 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-auto px-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-400" />
              <input
                type="search"
                placeholder="Search customers, deals, activities..."
                className="w-full pl-10 pr-4 py-2 border border-orange-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button className="md:hidden text-gray-500 hover:text-gray-700">
              <Search className="h-6 w-6" />
            </button>
            <ThemeToggle />
            <Link href="/dashboard/notifications" className="relative text-gray-500 hover:text-gray-700">
              <Bell className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center">
                3
              </span>
            </Link>
            <button className="text-gray-500 hover:text-gray-700">
              <User className="h-6 w-6" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[#FFF7F0] dark:bg-slate-950 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
