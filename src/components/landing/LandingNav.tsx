'use client'

import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useReducedMotion,
} from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, Heart, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// "/#id" so the links also work when the nav is rendered on other pages
const navLinks = [
  { href: '/#templates', id: 'templates', label: 'Templates' },
  { href: '/#features', id: 'features', label: 'Features' },
  { href: '/#how-it-works', id: 'how-it-works', label: 'How it works' },
  { href: '/#testimonials', id: 'testimonials', label: 'Love stories' },
  { href: '/#faq', id: 'faq', label: 'FAQ' },
]

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white'

/* ─── Mobile drawer variants ─────────────────────────────────────────── */
const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
}

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const reduceMotion = useReducedMotion()

  // Scroll progress bar
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 25, mass: 0.3 })

  // Nav surface changes once the page is scrolled
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Highlight the section currently in view (and clear it when leaving all sections)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const { id } = entry.target
          if (entry.isIntersecting) setActiveId(id)
          else setActiveId((prev) => (prev === id ? null : prev))
        })
      },
      { rootMargin: '-40% 0px -55% 0px' }
    )
    navLinks.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  // Lock page scroll + close on Escape while the mobile menu is open
  useEffect(() => {
    if (!menuOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  // Close the drawer if the viewport grows into the desktop layout
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = (e: MediaQueryListEvent) => e.matches && setMenuOpen(false)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const solid = scrolled || menuOpen
  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      {/* Scroll progress */}
      <motion.div
        style={{ scaleX: progress, transformOrigin: 'left' }}
        className="fixed inset-x-0 top-0 z-[60] h-[2px] bg-gradient-to-r from-amber-500 via-amber-400 to-rose-400"
        aria-hidden="true"
      />

      {/* Backdrop behind the mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeMenu}
            className="fixed inset-0 z-40 bg-stone-900/30 backdrop-blur-[2px] lg:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <motion.header
        initial={reduceMotion ? false : { y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none fixed inset-x-0 top-0 z-50 !px-3 sm:!px-6 !pt-3 sm:!pt-4"
      >
        <div className="pointer-events-auto mx-auto max-w-6xl">
          {/* ───────── Floating bar ───────── */}
          <div
            className={cn(
              'grid h-14 sm:h-16 grid-cols-[1fr_auto] lg:grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-full border !pl-3 !pr-2 sm:!pl-4 sm:!pr-2.5 backdrop-blur-xl transition-[background-color,box-shadow,border-color] duration-300',
              solid
                ? 'bg-white/90 border-stone-200/80 shadow-[0_8px_30px_-8px_rgba(120,53,15,0.18)]'
                : 'bg-white/55 border-white/70 shadow-none'
            )}
          >
            {/* Brand */}
            <Link
              href="/"
              onClick={closeMenu}
              aria-label="Wedora home"
              className={cn('group flex shrink-0 items-center gap-2.5 justify-self-start rounded-full', focusRing)}
            >
              <motion.span
                whileHover={reduceMotion ? undefined : { rotate: -6, scale: 1.06 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 shadow-sm"
              >
                <span className="grid h-[calc(100%-3px)] w-[calc(100%-3px)] place-items-center rounded-full bg-white">
                  <Heart className="h-4 w-4 fill-amber-500 text-amber-600" aria-hidden="true" />
                </span>
              </motion.span>
              <span className="flex flex-col gap-1">
                <span className="font-serif text-xl font-bold leading-none tracking-tight text-stone-900 transition-colors group-hover:text-amber-800 sm:text-[1.4rem]">
                  Wed<span className="font-normal italic text-amber-600">ora</span>
                </span>
                <span className="hidden text-[11px] font-medium leading-none text-stone-500 sm:block">
                  Digital invitations
                </span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
              {navLinks.map((link) => {
                const isActive = activeId === link.id
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? 'location' : undefined}
                    className={cn(
                      'relative rounded-full !px-4 !py-2 text-sm font-medium transition-colors duration-200',
                      isActive
                        ? 'text-amber-900'
                        : 'text-stone-600 hover:bg-stone-900/[0.04] hover:text-stone-900',
                      focusRing
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-pill"
                        transition={
                          reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 30 }
                        }
                        className="absolute inset-0 rounded-full border border-amber-200/70 bg-amber-50"
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Desktop actions */}
            <div className="hidden items-center gap-1 justify-self-end lg:flex">
              <Link
                href="/login"
                className={cn(
                  'rounded-full !px-4 !py-2 text-sm font-medium text-stone-700 transition-colors hover:text-amber-800',
                  focusRing
                )}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className={cn(
                  'group inline-flex items-center gap-3 rounded-full bg-stone-900 !py-1.5 !pl-5 !pr-1.5 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-stone-800',
                  focusRing
                )}
              >
                Create invitation
                <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-stone-900 transition-transform duration-200 group-hover:translate-x-0.5">
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            </div>

            {/* Mobile / tablet trigger (below lg) */}
            <div className="flex items-center gap-1.5 justify-self-end lg:hidden">
              <Link
                href="/register"
                className={cn(
                  'rounded-full bg-stone-900 !px-4 !py-2 text-sm font-semibold text-white transition-transform active:scale-95',
                  focusRing
                )}
              >
                Create
              </Link>
              <button
                type="button"
                className={cn(
                  'grid h-10 w-10 place-items-center rounded-full text-stone-700 transition-colors hover:bg-stone-900/[0.05]',
                  focusRing
                )}
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={menuOpen ? 'close' : 'open'}
                    initial={reduceMotion ? false : { rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={reduceMotion ? undefined : { rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="block"
                  >
                    {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </div>

          {/* ───────── Mobile drawer ───────── */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                id="mobile-menu"
                initial={reduceMotion ? false : { opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: 'top center' }}
                className="mt-2 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-3xl border border-stone-200/80 bg-white/95 shadow-[0_20px_50px_-12px_rgba(120,53,15,0.25)] backdrop-blur-xl lg:hidden"
              >
                <motion.div
                  variants={listVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-col gap-5 !p-5 sm:!p-6"
                >
                  <nav aria-label="Mobile" className="flex flex-col">
                    {navLinks.map((link) => {
                      const isActive = activeId === link.id
                      return (
                        <motion.div key={link.href} variants={itemVariants}>
                          <Link
                            href={link.href}
                            onClick={closeMenu}
                            aria-current={isActive ? 'location' : undefined}
                            className={cn(
                              'group flex items-center justify-between border-b border-stone-100 !py-3.5 font-serif text-xl transition-colors',
                              isActive ? 'text-amber-700' : 'text-stone-800 hover:text-amber-700',
                              focusRing
                            )}
                          >
                            <span className="flex items-center gap-3">
                              <span
                                className={cn(
                                  'h-1.5 w-1.5 rounded-full transition-colors',
                                  isActive ? 'bg-amber-500' : 'bg-transparent'
                                )}
                                aria-hidden="true"
                              />
                              {link.label}
                            </span>
                            <ArrowRight
                              className="h-4 w-4 text-stone-300 transition-all group-hover:translate-x-1 group-hover:text-amber-600"
                              aria-hidden="true"
                            />
                          </Link>
                        </motion.div>
                      )
                    })}
                  </nav>

                  <motion.div variants={itemVariants} className="flex flex-col gap-2.5">
                    <Link
                      href="/register"
                      onClick={closeMenu}
                      className={cn(
                        'flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-900 !py-3.5 text-sm font-semibold text-white transition-colors hover:bg-stone-800',
                        focusRing
                      )}
                    >
                      Start free invitation
                      <ArrowRight className="h-4 w-4 text-amber-300" aria-hidden="true" />
                    </Link>
                    <Link
                      href="/login"
                      onClick={closeMenu}
                      className={cn(
                        'w-full rounded-2xl border border-stone-200 !py-3.5 text-center text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50',
                        focusRing
                      )}
                    >
                      Sign in to dashboard
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>
    </>
  )
}