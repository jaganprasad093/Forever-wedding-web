'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
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
  Loader2,
  type LucideIcon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  /** Match only this exact path (used for the dashboard root). */
  exact?: boolean
  /** Extra paths that should also highlight this item. */
  alsoMatches?: string[]
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    exact: true,
    alsoMatches: ['/dashboard/invitations'],
  },
  { href: '/templates', label: 'Templates', icon: Layers },
  { href: '/dashboard/rsvp', label: 'RSVP Responses', icon: Users },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
]

interface DashboardNavProps {
  userName: string | null
  userEmail: string | null
}

function isItemActive(pathname: string, item: NavItem) {
  const matches = (base: string) =>
    pathname === base || (!item.exact && pathname.startsWith(base + '/'))

  if (matches(item.href)) return true
  return (item.alsoMatches ?? []).some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )
}

function BrandMark({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <div
      className={cn(
        'rounded-xl bg-gradient-to-br from-[#8c6b48] to-[#6c4f31] flex items-center justify-center shadow-md shadow-[#8c6b48]/25 transition-transform duration-200',
        size === 'md' ? 'w-9 h-9' : 'w-8 h-8'
      )}
    >
      <Heart
        className={cn('text-white fill-white/90', size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5')}
        aria-hidden="true"
      />
    </div>
  )
}

export default function DashboardNav({ userName, userEmail }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const reduceMotion = useReducedMotion()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const profileRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const drawerCloseRef = useRef<HTMLButtonElement>(null)

  const displayName = userName || userEmail?.split('@')[0] || 'User'
  const initial = displayName.charAt(0).toUpperCase()

  const handleLogout = useCallback(async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    } catch (err) {
      console.error('Sign out failed', err)
      setLoggingOut(false)
    }
  }, [loggingOut, router])

  const [prevPathname, setPrevPathname] = useState(pathname)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname)
    setSidebarOpen(false)
    setProfileOpen(false)
  }

  // Close profile dropdown on outside click / Escape
  useEffect(() => {
    if (!profileOpen) return
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProfileOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [profileOpen])

  // Mobile drawer: lock body scroll, Escape to close, manage focus
  useEffect(() => {
    if (!sidebarOpen) return
    const prevOverflow = document.body.style.overflow
    const menuButton = menuButtonRef.current
    document.body.style.overflow = 'hidden'
    drawerCloseRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    document.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKey)
      menuButton?.focus()
    }
  }, [sidebarOpen])

  const fade = reduceMotion ? { duration: 0 } : { duration: 0.15 }

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden lg:flex flex-col w-64 min-h-screen bg-white/95 backdrop-blur-md border-r border-[#ece5db] fixed left-0 top-0 bottom-0 z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
        aria-label="Sidebar"
      >
        {/* Brand */}
        <div className="h-20 flex items-center px-6 border-b border-[#f1eae0]">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c6b48]/50 focus-visible:ring-offset-2"
          >
            <div className="group-hover:scale-105 transition-transform duration-200">
              <BrandMark />
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

        {/* Primary CTA */}
        <div className="px-4 pt-5 pb-2">
          <Link
            href="/templates"
            className="group w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-[#8c6b48] to-[#795938] hover:from-[#7e5f3e] hover:to-[#6c4f31] text-white text-xs font-medium tracking-wide rounded-xl shadow-sm shadow-[#8c6b48]/25 hover:shadow-md active:scale-[0.98] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c6b48]/60 focus-visible:ring-offset-2"
          >
            {/* <Sparkles
              className="w-3.5 h-3.5 text-amber-200 group-hover:rotate-12 transition-transform duration-200"
              aria-hidden="true"
            /> */}
            <span>Create Invitation</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto" aria-label="Main">
          <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-stone-400 uppercase">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isItemActive(pathname, item)

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c6b48]/40',
                  active
                    ? 'bg-[#f7f2ea] text-[#704e2e] shadow-sm font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50/90'
                )}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active-indicator"
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 400, damping: 32 }
                    }
                    className="absolute left-0 top-2 bottom-2 w-1 bg-[#8c6b48] rounded-r-full"
                  />
                )}
                <Icon
                  aria-hidden="true"
                  className={cn(
                    'w-4 h-4 transition-colors',
                    active ? 'text-[#8c6b48]' : 'text-stone-400 group-hover:text-stone-600'
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
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-stone-500 hover:text-stone-800 hover:bg-stone-50/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c6b48]/40"
          >
            <span>Landing Page</span>
            <ExternalLink className="w-3 h-3 text-stone-400" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </Link>
        </nav>

        {/* Profile */}
        <div className="p-3 border-t border-[#f1eae0] bg-[#faf7f2]/50">
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white border border-transparent hover:border-[#ede5db] transition-all duration-150 cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c6b48]/40"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8c6b48] to-[#6c4f31] flex items-center justify-center text-white text-xs font-serif font-bold shadow-sm flex-shrink-0">
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-stone-800 truncate">{displayName}</p>
                {userEmail && (
                  <p className="text-[11px] text-stone-400 truncate">{userEmail}</p>
                )}
              </div>
              <ChevronDown
                aria-hidden="true"
                className={cn(
                  'w-3.5 h-3.5 text-stone-400 transition-transform duration-200',
                  profileOpen && 'rotate-180'
                )}
              />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  role="menu"
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={fade}
                  className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-[#ede5db] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden p-1.5 z-50"
                >
                  <Link
                    href="/dashboard/profile"
                    role="menuitem"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-stone-700 hover:bg-[#faf6f0] hover:text-[#704e2e] transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-stone-400" aria-hidden="true" />
                    <span>Profile Settings</span>
                  </Link>
                  <div className="h-px bg-stone-100 my-1" role="separator" />
                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer text-left"
                  >
                    {loggingOut ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                      <LogOut className="w-3.5 h-3.5 text-rose-500" aria-hidden="true" />
                    )}
                    <span>{loggingOut ? 'Signing out…' : 'Sign Out'}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* ── Mobile Top Bar ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-white/95 backdrop-blur-md border-b border-[#ece5db] flex items-center justify-between px-4 sm:px-6 shadow-sm">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <BrandMark size="sm" />
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
          ref={menuButtonRef}
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c6b48]/40"
          aria-label="Open menu"
          aria-expanded={sidebarOpen}
          aria-controls="mobile-drawer"
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </button>
      </header>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fade}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              id="mobile-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: 'spring', damping: 25, stiffness: 280 }
              }
              className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col z-10"
            >
              <div className="h-16 flex items-center justify-between px-5 border-b border-[#f1eae0]">
                <div className="flex items-center gap-2">
                  <BrandMark size="sm" />
                  <span className="font-serif text-base font-semibold text-stone-900">
                    ForeverVows
                  </span>
                </div>
                <button
                  ref={drawerCloseRef}
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c6b48]/40"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <div className="p-3">
                <Link
                  href="/templates"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-[#8c6b48] to-[#795938] text-white text-xs font-medium rounded-xl shadow-sm active:scale-[0.98] transition-transform"
                >
                  {/* <Sparkles className="w-3.5 h-3.5 text-amber-200" aria-hidden="true" /> */}
                  <span>Create Invitation</span>
                </Link>
              </div>

              <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto" aria-label="Main">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const active = isItemActive(pathname, item)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all',
                        active
                          ? 'bg-[#f7f2ea] text-[#704e2e] font-semibold'
                          : 'text-stone-600 hover:bg-stone-50'
                      )}
                    >
                      <Icon
                        className={cn('w-4 h-4', active ? 'text-[#8c6b48]' : 'text-stone-400')}
                        aria-hidden="true"
                      />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}

                <Link
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-3.5 py-3 rounded-xl text-sm text-stone-500 hover:bg-stone-50 transition-colors"
                >
                  <span>Landing Page</span>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-400" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </Link>
              </nav>

              <div className="p-3 border-t border-[#f1eae0] bg-[#faf7f2]/50 space-y-1 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <div className="flex items-center gap-3 px-2 py-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8c6b48] to-[#6c4f31] flex items-center justify-center text-white text-xs font-serif font-bold flex-shrink-0">
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-stone-800 truncate">{displayName}</p>
                    {userEmail && (
                      <p className="text-[11px] text-stone-400 truncate">{userEmail}</p>
                    )}
                  </div>
                </div>
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-stone-700 hover:bg-white rounded-lg transition-colors"
                >
                  <User className="w-4 h-4 text-stone-400" aria-hidden="true" />
                  <span>Profile Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-60 rounded-lg transition-colors text-left"
                >
                  {loggingOut ? (
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <LogOut className="w-4 h-4 text-rose-500" aria-hidden="true" />
                  )}
                  <span>{loggingOut ? 'Signing out…' : 'Sign Out'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}