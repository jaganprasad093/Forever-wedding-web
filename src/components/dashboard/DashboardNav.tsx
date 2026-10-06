'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Heart,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  X,
  User,
  ChevronDown,
  BarChart3,
  Users,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/invitations', label: 'My Invitations', icon: Heart },
  { href: '/templates', label: 'Templates', icon: Layers },
  { href: '/dashboard/rsvp', label: 'RSVPs', icon: Users },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
]

interface DashboardNavProps {
  userName: string | null
  userEmail: string | null
}

export default function DashboardNav({ userName, userEmail }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const displayName = userName || userEmail?.split('@')[0] || 'User'

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r border-stone-100 fixed left-0 top-0 bottom-0 z-40">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-stone-100">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-gold rounded-full flex items-center justify-center shadow-gold">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-serif text-lg font-semibold text-stone-800">ForeverVows</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'text-stone-600 hover:text-stone-800 hover:bg-stone-50'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-amber-600' : '')} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Profile */}
        <div className="px-3 pb-4 border-t border-stone-100 pt-4">
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-50 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-stone-800 truncate">{displayName}</p>
                <p className="text-xs text-stone-500 truncate">{userEmail}</p>
              </div>
              <ChevronDown className={cn('w-4 h-4 text-stone-400 transition-transform', profileOpen && 'rotate-180')} />
            </button>

            {profileOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-stone-100 rounded-xl shadow-card overflow-hidden">
                <Link href="/dashboard/profile" className="flex items-center gap-2 px-3 py-2.5 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-800 transition-colors">
                  <User className="w-4 h-4" />
                  Profile Settings
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b border-stone-100 flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-gold rounded-full flex items-center justify-center">
            <Heart className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <span className="font-serif text-base font-semibold text-stone-800">ForeverVows</span>
        </Link>
        <button onClick={() => setSidebarOpen(true)} className="p-2 text-stone-600">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col"
          >
            <div className="h-14 flex items-center justify-between px-4 border-b border-stone-100">
              <span className="font-serif text-lg font-semibold text-stone-800">ForeverVows</span>
              <button onClick={() => setSidebarOpen(false)} className="p-1 text-stone-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                      isActive
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'text-stone-600 hover:bg-stone-50'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="px-3 pb-4 border-t border-stone-100 pt-4 space-y-1">
              <Link href="/dashboard/profile" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-stone-600 hover:bg-stone-50 rounded-xl">
                <User className="w-4 h-4" />
                Profile Settings
              </Link>
              <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl">
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}
