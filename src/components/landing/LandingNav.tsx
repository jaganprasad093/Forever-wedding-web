'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, Heart, Sparkles, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '#templates', label: 'Templates' },
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#testimonials', label: 'Love Stories' },
  { href: '#faq', label: 'FAQ' },
]

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'py-3 bg-white/80 backdrop-blur-md border-b border-amber-100/60 shadow-sm'
          : 'py-5 bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-[1.5px] shadow-sm group-hover:shadow-gold transition-all duration-300">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-amber-600 fill-amber-500 transition-transform duration-300 group-hover:scale-110" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-1 -right-1 text-[10px]"
            >
              ✨
            </motion.div>
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors">
              Forever<span className="italic font-normal text-amber-600">Vows</span>
            </span>
            <span className="text-[9px] tracking-[0.25em] -mt-1 text-stone-400 uppercase font-sans font-medium">
              Digital Invitations
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 bg-stone-50/70 border border-stone-200/60 px-4 py-1.5 rounded-full shadow-inner">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs tracking-wide uppercase font-medium text-stone-600 hover:text-amber-800 px-3 py-1.5 rounded-full hover:bg-white/80 transition-all duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA actions */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs tracking-wider uppercase font-semibold text-stone-700 hover:text-amber-700 transition-colors px-3 py-2"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="relative group inline-flex items-center gap-2 overflow-hidden bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-white text-xs font-semibold uppercase tracking-wider px-5 py-2.5 rounded-full shadow-md hover:shadow-gold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create Invitation</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 sm:hidden">
          <Link
            href="/register"
            className="text-xs bg-amber-600 text-white font-medium px-3.5 py-1.5 rounded-full shadow-sm"
          >
            Create
          </Link>
          <button
            className="p-2 text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Animated Dropdown Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-amber-100 shadow-xl overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-4">
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-base font-serif text-stone-800 hover:text-amber-700 py-2 border-b border-stone-100 flex items-center justify-between"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="w-4 h-4 text-stone-400" />
                  </Link>
                ))}
              </nav>

              <div className="pt-2 flex flex-col gap-3">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-medium text-stone-700 border border-stone-200 rounded-xl hover:bg-stone-50"
                >
                  Sign In to Dashboard
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-sm font-semibold rounded-xl shadow-gold flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Free Invitation</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
