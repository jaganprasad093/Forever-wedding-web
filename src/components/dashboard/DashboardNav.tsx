'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/templates', label: 'Templates', icon: Layers },
  { href: '/dashboard/rsvp', label: 'RSVP Responses', icon: Users },
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
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white/95 backdrop-blur-md border-r border-[#ece5db] fixed left-0 top-0 bottom-0 z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        {/* Brand Logo Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-[#f1eae0]">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8c6b48] to-[#6c4f31] flex items-center justify-center shadow-md shadow-[#8c6b48]/25 group-hover:scale-105 transition-transform duration-200">
              <Heart className="w-4 h-4 text-white fill-white/90" />
            </div>
            <div>
              <span className="font-serif text-lg font-semibold text-stone-900 tracking-tight block leading-none">
                ForeverVows
              </span>
              <span className="text-[10px] text-[#9c7d5c] tracking-widest uppercase font-medium mt-0.5 block">
                Studio
              </span>
            </div>
          </Link>
        </div>

        {/* Quick Action Ribbon */}
        <div className="px-4 pt-5 pb-2">
          <Link
            href="/templates"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-[#8c6b48] to-[#795938] hover:from-[#7e5f3e] hover:to-[#6c4f31] text-white text-xs font-medium tracking-wide rounded-xl shadow-sm shadow-[#8c6b48]/25 hover:shadow-md transition-all duration-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Create Invitation</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-stone-400 uppercase">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              (item.href === '/dashboard' && pathname === '/dashboard/invitations')

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-[#f7f2ea] text-[#704e2e] shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50/90'
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#8c6b48] rounded-r-full" />
                )}
                <Icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isActive ? 'text-[#8c6b48]' : 'text-stone-400 group-hover:text-stone-600'
                  )}
                />
                <span className="flex-1">{item.label}</span>
              </Link>
            )
          })}

          <div className="pt-4 px-3 py-2 text-[11px] font-semibold tracking-wider text-stone-400 uppercase">
            Quick Links
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-stone-500 hover:text-stone-800 hover:bg-stone-50/80 transition-colors"
          >
            <span>Landing Page</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </Link>
        </nav>

        {/* User Profile Card & Sign Out Menu */}
        <div className="p-3 border-t border-[#f1eae0] bg-[#faf7f2]/50">
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white border border-transparent hover:border-[#ede5db] transition-all duration-150 cursor-pointer text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8c6b48] to-[#6c4f31] flex items-center justify-center text-white text-xs font-serif font-bold shadow-xs flex-shrink-0">
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-stone-800 truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-stone-400 truncate">
                  {userEmail}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  'w-3.5 h-3.5 text-stone-400 transition-transform duration-200',
                  profileOpen && 'rotate-180'
                )}
              />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-[#ede5db] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden p-1.5 z-50"
                >
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-stone-700 hover:bg-[#faf6f0] hover:text-[#704e2e] transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-stone-400" />
                    <span>Profile Settings</span>
                  </Link>
                  <div className="h-px bg-stone-100 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* ── Mobile Top Bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-white/95 backdrop-blur-md border-b border-[#ece5db] flex items-center justify-between px-4 sm:px-6 shadow-xs">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8c6b48] to-[#6c4f31] flex items-center justify-center text-white shadow-xs">
            <Heart className="w-4 h-4 fill-white" />
          </div>
          <div>
            <span className="font-serif text-base font-semibold text-stone-900 leading-none block">
              ForeverVows
            </span>
            <span className="text-[9px] text-[#9c7d5c] tracking-widest uppercase font-medium block">
              Studio
            </span>
          </div>
        </Link>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100/70 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col z-10"
            >
              <div className="h-16 flex items-center justify-between px-5 border-b border-[#f1eae0]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8c6b48] to-[#6c4f31] flex items-center justify-center text-white">
                    <Heart className="w-4 h-4 fill-white" />
                  </div>
                  <span className="font-serif text-base font-semibold text-stone-900">
                    ForeverVows
                  </span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3">
                <Link
                  href="/templates"
                  onClick={() => setSidebarOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-[#8c6b48] text-white text-xs font-medium rounded-xl shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>Create Invitation</span>
                </Link>
              </div>

              <nav className="flex-1 px-3 py-2 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all',
                        isActive
                          ? 'bg-[#f7f2ea] text-[#704e2e] font-semibold'
                          : 'text-stone-600 hover:bg-stone-50'
                      )}
                    >
                      <Icon className="w-4 h-4 text-[#8c6b48]" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>

              <div className="p-4 border-t border-[#f1eae0] bg-[#faf7f2]/50 space-y-1">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-white rounded-lg transition-colors"
                >
                  <User className="w-4 h-4 text-stone-400" />
                  <span>Profile Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
