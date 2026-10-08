'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Sparkles, ArrowRight, ArrowUp } from 'lucide-react'

/* ─── Animation variants ─────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: 'easeOut' as const },
  }),
}

const viewport = { once: true, margin: '-60px' }

// Shared link style: padding keeps a comfortable tap target, hover nudges right
const linkClass =
  'inline-block !py-1 text-sm text-stone-400 hover:text-amber-300 hover:translate-x-1 transition-all duration-200'

const templateLinks = [
  { href: '/templates/preview/kerala-traditional', label: 'Kerala Traditional' },
  { href: '/templates/preview/royal-gold', label: 'Royal Midnight Gold' },
  { href: '/templates/preview/floral-romantic', label: 'Floral Romance' },
  { href: '/templates/preview/minimal-white', label: 'Minimal Editorial' },
]

const exploreLinks = [
  { href: '/#features', label: 'Features & RSVP' },
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/#testimonials', label: 'Love Stories' },
  { href: '/#faq', label: 'FAQ & Help' },
]

const accountLinks = [
  { href: '/login', label: 'Sign In to Dashboard' },
  { href: '/dashboard', label: 'RSVP Manager' },
]

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-white text-xs uppercase tracking-widest font-semibold !mb-5">
      {children}
    </h4>
  )
}

export default function LandingFooter() {
  return (
    <footer className="relative overflow-hidden bg-stone-950 text-stone-400 border-t border-stone-800 !pt-16 sm:!pt-20 lg:!pt-24 !pb-8 sm:!pb-10 !px-5 sm:!px-8 lg:!px-12">
      {/* Top gold hairline */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-1/2 max-w-md bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

      {/* Ambient glows */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1.1, 1, 1.1], opacity: [1, 0.6, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-32 right-1/4 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-12 lg:gap-x-10 !mb-14 sm:!mb-16">
          {/* Brand */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            className="col-span-2 sm:col-span-3 lg:col-span-2 flex flex-col items-start gap-5"
          >
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: -10, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-gold"
              >
                <Heart className="w-4 h-4 text-white fill-white" />
              </motion.div>
              <span className="font-serif text-2xl text-white font-medium">
                Forever<span className="italic text-amber-400 font-normal">Vows</span>
              </span>
            </Link>

            <p className="text-stone-400 text-sm leading-relaxed max-w-sm">
              The modern way to announce your celebration. Exquisite digital wedding invitations with background music, RSVP tracking, love story timeline, and Google Maps venue guidance.
            </p>

            <div className="inline-flex items-center gap-2 !px-4 !py-2 rounded-full bg-stone-900 border border-stone-800 text-xs text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>100% Eco-friendly &amp; Carbon Neutral</span>
            </div>
          </motion.div>

          {/* Templates */}
          <motion.div custom={1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}>
            <ColumnTitle>Designer Themes</ColumnTitle>
            <ul className="flex flex-col gap-1.5">
              {templateLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass}>{l.label}</Link>
                </li>
              ))}
              <li className="!pt-2">
                <Link
                  href="/templates"
                  className="group inline-flex items-center gap-1.5 !py-1 text-sm text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                >
                  <span>View All Templates</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Explore */}
          <motion.div custom={2} variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewport}>
            <ColumnTitle>Explore</ColumnTitle>
            <ul className="flex flex-col gap-1.5">
              {exploreLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Get started */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            className="col-span-2 sm:col-span-1"
          >
            <ColumnTitle>Get Started</ColumnTitle>
            <ul className="flex flex-col gap-1.5">
              <li>
                <Link
                  href="/register"
                  className="inline-block !py-1 text-sm font-semibold text-white hover:text-amber-300 hover:translate-x-1 transition-all duration-200"
                >
                  Create Free Invitation
                </Link>
              </li>
              {accountLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          className="!pt-8 border-t border-stone-900 flex flex-col-reverse sm:flex-row items-center justify-between gap-6 text-xs text-stone-500"
        >
          <p className="text-center sm:text-left leading-relaxed">
            © {new Date().getFullYear()} ForeverVows. Made with love for couples worldwide.
          </p>

          <div className="flex items-center gap-5 sm:gap-6">
            <Link href="/privacy" className="hover:text-stone-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-stone-300 transition-colors">
              Terms of Service
            </Link>
            <motion.button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.92 }}
              aria-label="Back to top"
              className="w-9 h-9 rounded-full border border-stone-800 bg-stone-900 text-stone-400 hover:text-amber-300 hover:border-amber-500/50 flex items-center justify-center cursor-pointer transition-colors"
            >
              <ArrowUp className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}