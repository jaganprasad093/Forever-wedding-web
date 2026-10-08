'use client'

import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, Heart, Sparkles, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// "/#id" so the links also work when the nav is rendered on other pages
const navLinks = [
  { href: '/#templates', id: 'templates', label: 'Templates' },
  { href: '/#features', id: 'features', label: 'Features' },
  { href: '/#how-it-works', id: 'how-it-works', label: 'How It Works' },
  { href: '/#testimonials', id: 'testimonials', label: 'Love Stories' },
  { href: '/#faq', id: 'faq', label: 'FAQ' },
]

/* ─── Mobile drawer variants ─────────────────────────────────────────── */
const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}
const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
}

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  // Scroll progress bar
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 25, mass: 0.3 })

  // Header background on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Highlight the section currently in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
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

  const solid = scrolled || menuOpen

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        solid
          ? '!py-3 bg-white/85 backdrop-blur-md border-b border-amber-100/60 shadow-sm'
          : '!py-4 sm:!py-5 bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto !px-5 sm:!px-8 lg:!px-12 flex items-center justify-between gap-4">
        {/* ───────── Brand ───────── */}
        <Link href="/" className="flex items-center gap-3 group shrink-0" onClick={() => setMenuOpen(false)}>
          <motion.div
            whileHover={{ rotate: -8, scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 !p-[1.5px] shadow-sm group-hover:shadow-gold transition-shadow duration-300"
          >
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-amber-600 fill-amber-500" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-1 -right-1 text-[10px]"
            >
              ✨
            </motion.div>
          </motion.div>
          <div className="flex flex-col gap-0.5">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors leading-none">
              Forever<span className="italic font-normal text-amber-600">Vows</span>
            </span>
            <span className="hidden sm:block text-[9px] tracking-[0.25em] text-stone-400 uppercase font-sans font-medium leading-none">
              Digital Invitations
            </span>
          </div>
        </Link>

        {/* ───────── Desktop nav ───────── */}
        <nav className="hidden lg:flex items-center gap-1 bg-stone-50/70 border border-stone-200/60 !px-2 !py-1.5 rounded-full shadow-inner">
          {navLinks.map((link) => {
            const isActive = activeId === link.id
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative text-xs tracking-wide uppercase font-medium !px-4 !py-2 rounded-full transition-colors duration-200',
                  isActive ? 'text-amber-800' : 'text-stone-600 hover:text-amber-800'
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute inset-0 rounded-full bg-white shadow-sm border border-amber-100"
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* ───────── Desktop actions ───────── */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs tracking-wider uppercase font-semibold text-stone-700 hover:text-amber-700 transition-colors !px-4 !py-2.5"
          >
            Sign In
          </Link>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/register"
              className="relative group inline-flex items-center gap-2 overflow-hidden bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-white text-xs font-semibold uppercase tracking-wider !px-6 !py-3 rounded-full shadow-md hover:shadow-gold transition-shadow duration-200"
            >
              {/* Shine sweep on hover */}
              <span className="absolute inset-y-0 -left-full w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] group-hover:left-[150%] transition-all duration-700" />
              <Sparkles className="relative w-3.5 h-3.5" />
              <span className="relative">Create Invitation</span>
              <ArrowRight className="relative w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* ───────── Mobile / tablet trigger (below lg) ───────── */}
        <div className="flex items-center gap-2.5 lg:hidden">
          <Link
            href="/register"
            className="text-xs bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold !px-4 !py-2 rounded-full shadow-sm active:scale-95 transition-transform"
          >
            Create
          </Link>
          <button
            className="!p-2.5 text-stone-700 rounded-xl hover:bg-stone-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={menuOpen ? 'close' : 'open'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="block"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* ───────── Mobile drawer ───────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-amber-100/60 overflow-hidden max-h-[calc(100vh-4.5rem)] overflow-y-auto"
          >
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="visible"
              className="max-w-7xl mx-auto !px-5 sm:!px-8 !pt-4 !pb-8 flex flex-col gap-6"
            >
              <nav className="flex flex-col">
                {navLinks.map((link) => {
                  const isActive = activeId === link.id
                  return (
                    <motion.div key={link.href} variants={itemVariants}>
                      <Link
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          'group flex items-center justify-between !py-4 border-b border-stone-100 font-serif text-lg transition-colors',
                          isActive ? 'text-amber-700' : 'text-stone-800 hover:text-amber-700'
                        )}
                      >
                        <span>{link.label}</span>
                        <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                      </Link>
                    </motion.div>
                  )
                })}
              </nav>

              <motion.div variants={itemVariants} className="flex flex-col gap-3">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center !py-3.5 text-sm font-medium text-stone-700 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors"
                >
                  Sign In to Dashboard
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center !py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-sm font-semibold rounded-xl shadow-gold flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Free Invitation</span>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll progress bar */}
      <motion.div
        style={{ scaleX: progress, transformOrigin: 'left' }}
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-amber-400 to-rose-400"
        aria-hidden="true"
      />
    </motion.header>
  )
}