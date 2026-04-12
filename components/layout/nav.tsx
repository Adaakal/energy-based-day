'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CheckSquare, ListTodo, CalendarDays, LogOut, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/checkin', label: 'Check In', icon: CheckSquare },
  { href: '/tasks', label: 'Tasks', icon: ListTodo },
  { href: '/plan', label: 'Plan', icon: CalendarDays },
]

export function Nav() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 min-h-screen bg-white border-r border-gray-200 py-6 px-3">
        <div className="px-3 mb-8">
          <h1 className="font-bold text-gray-900 text-base leading-tight">
            Energy Day<br />Designer
          </h1>
          <p className="text-xs text-gray-400 mt-1">Plan with your capacity</p>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname.startsWith(href)
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        <Link
          href="/export"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            pathname.startsWith('/export')
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
          )}
        >
          <Download className="w-4 h-4" />
          Export
        </Link>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors mt-1"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
                pathname.startsWith(href)
                  ? 'text-gray-900'
                  : 'text-gray-400'
              )}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
