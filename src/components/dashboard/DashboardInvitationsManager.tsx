'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Search, X, ChevronDown, SearchX, Sparkles, ArrowRight } from 'lucide-react'
import DashboardInvitationCard from './DashboardInvitationCard'

interface Wedding {
  id: string
  bride_name: string | null
  groom_name: string | null
  wedding_date: string | null
  wedding_time?: string | null
  venue_name?: string | null
  slug: string
  published: boolean
  template_id: string
  views: number
  created_at?: string
}

interface DashboardInvitationsManagerProps {
  weddings: Wedding[]
}

type FilterId = 'all' | 'published' | 'draft'
type SortId = 'newest' | 'views'

const templateShowcase = [
  {
    slug: 'kerala-traditional',
    title: 'Kerala Traditional',
    desc: 'Kasavu borders, temple gold accents & traditional melam vibes.',
    tag: 'Popular',
    accent: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  {
    slug: 'royal-gold',
    title: 'Royal Gold',
    desc: 'Opulent dark aesthetic with shimmering burnished gold foils.',
    tag: 'Luxury',
    accent: 'bg-stone-900 text-amber-300 border-amber-500/40',
  },
  {
    slug: 'floral-romantic',
    title: 'Floral Romantic',
    desc: 'Delicate botanical blooms, soft pastels and dreamy typography.',
    tag: 'Romantic',
    accent: 'bg-rose-100 text-rose-800 border-rose-300',
  },
  {
    slug: 'minimal-white',
    title: 'Minimal White',
    desc: 'Editorial typography, clean lines, and timeless modern grace.',
    tag: 'Modern',
    accent: 'bg-stone-100 text-stone-800 border-stone-300',
  },
]

const steps = [
  { title: 'Pick a Theme', text: 'Handcrafted wedding aesthetics tailored to traditions and modern elegance.' },
  { title: 'Personalize', text: 'Live editor with schedules, love story, photo gallery, maps, and audio songs.' },
  { title: 'Share & RSVP', text: 'Send your unique link on WhatsApp and collect guest attendance in real time.' },
]

/* ─── Animation variants ─────────────────────────────────────────────── */
const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
}
const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

const timeOf = (w: Wedding) => (w.created_at ? new Date(w.created_at).getTime() || 0 : 0)

export default function DashboardInvitationsManager({ weddings }: DashboardInvitationsManagerProps) {
  const reduceMotion = useReducedMotion()
  const [filter, setFilter] = useState<FilterId>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortId>('newest')

  const publishedCount = useMemo(() => weddings.filter((w) => w.published).length, [weddings])
  const draftCount = weddings.length - publishedCount

  const filteredWeddings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return weddings
      .filter((w) => {
        if (filter === 'published') return w.published
        if (filter === 'draft') return !w.published
        return true
      })
      .filter((w) => {
        if (!query) return true
        const haystack = `${w.groom_name || ''} ${w.bride_name || ''} ${w.slug || ''} ${w.venue_name || ''}`.toLowerCase()
        return haystack.includes(query)
      })
      .sort((a, b) => (sortBy === 'views' ? (b.views || 0) - (a.views || 0) : timeOf(b) - timeOf(a)))
  }, [weddings, filter, searchQuery, sortBy])

  const filters: { id: FilterId; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: weddings.length },
    { id: 'published', label: 'Published', count: publishedCount },
    { id: 'draft', label: 'Drafts', count: draftCount },
  ]

  /* ───────────────────── Empty state: no invitations yet ───────────────────── */
  if (weddings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden bg-white/95 backdrop-blur-xs rounded-3xl border border-[#ece4d8] shadow-[0_8px_32px_rgba(0,0,0,0.03)] !px-5 !py-10 sm:!px-12 sm:!py-14 text-center"
      >
        {/* Ambient glows */}
        <motion.div
          animate={reduceMotion ? {} : { scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-24 -right-20 w-72 h-72 bg-[#f3eae0] rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={reduceMotion ? {} : { scale: [1.1, 1, 1.1], opacity: [0.9, 0.5, 0.9] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-24 -left-20 w-72 h-72 bg-rose-100/60 rounded-full blur-3xl pointer-events-none"
        />

        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="relative max-w-2xl mx-auto"
        >
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2.5 !px-4 !py-1.5 rounded-full border border-[#d8c8b4] bg-[#fbf8f4] text-[#856543] text-[11px] sm:text-xs font-medium tracking-wider uppercase !mb-6"
          >
            <motion.span
              animate={reduceMotion ? {} : { rotate: [0, 180, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="inline-block"
            >
              ✦
            </motion.span>
            <span>Begin Your Wedding Story</span>
          </motion.div>

          <motion.h3
            variants={item}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-900 !mb-4 tracking-tight leading-[1.15] text-balance"
          >
            Create Your First Interactive Invitation
          </motion.h3>

          <motion.p
            variants={item}
            className="text-stone-500 text-sm sm:text-base leading-relaxed !mb-8 sm:!mb-10 max-w-xl mx-auto"
          >
            Select a designer template, personalize your celebration details, add background music,
            and share with your guests in minutes.
          </motion.p>

          <motion.div variants={item} className="max-w-sm sm:max-w-none mx-auto">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-flex w-full sm:w-auto">
              <Link
                href="/templates"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 !px-7 !py-4 bg-gradient-to-r from-[#8c6b48] via-[#81613f] to-[#6e4f30] hover:from-[#7e5e3c] hover:to-[#5e4226] text-white text-sm font-medium rounded-2xl shadow-lg shadow-[#8c6b48]/25 hover:shadow-xl transition-shadow duration-200"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Choose a Luxury Template</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          {/* 3-step guide */}
          <motion.ol
            variants={container}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 !mt-12 !pt-10 border-t border-stone-100 text-left"
          >
            {steps.map((s, i) => (
              <motion.li
                key={s.title}
                variants={item}
                whileHover={reduceMotion ? undefined : { y: -4 }}
                className="flex sm:block gap-4 !p-4 sm:!p-5 rounded-2xl bg-[#faf7f2]/80 border border-[#ede5da] hover:border-[#d8c8b4] hover:shadow-md transition-[border-color,box-shadow] duration-200"
              >
                <span className="w-9 h-9 rounded-xl bg-[#8c6b48]/10 text-[#8c6b48] flex items-center justify-center font-serif font-bold text-sm shrink-0 sm:!mb-4">
                  {i + 1}
                </span>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-800 !mb-1.5">{s.title}</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">{s.text}</p>
                </div>
              </motion.li>
            ))}
          </motion.ol>

          {/* Template quick picks */}
          <div className="!mt-10 sm:!mt-12">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 !mb-5">
              Explore Available Templates
            </p>
            <motion.div variants={container} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {templateShowcase.map((t) => (
                <motion.div key={t.slug} variants={item} whileHover={reduceMotion ? undefined : { y: -5 }}>
                  <Link
                    href={`/create?template=${t.slug}`}
                    className="group block h-full !p-3.5 sm:!p-4 rounded-2xl border border-stone-200/80 hover:border-[#8c6b48] bg-white hover:bg-[#faf7f2] hover:shadow-md text-left transition-[border-color,background-color,box-shadow] duration-200"
                  >
                    <span
                      className={`inline-block text-[9px] uppercase tracking-wider !px-2.5 !py-0.5 rounded-full border !mb-2 font-medium ${t.accent}`}
                    >
                      {t.tag}
                    </span>
                    <p className="text-xs sm:text-[13px] font-medium text-stone-800 group-hover:text-[#8c6b48] truncate transition-colors">
                      {t.title}
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-stone-400 line-clamp-2 !mt-1 leading-relaxed">
                      {t.desc}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  /* ───────────────────────────── Main view ───────────────────────────── */
  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {/* ── Toolbar: filters, search, sort ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 bg-white/85 backdrop-blur-xs !p-3 sm:!p-3.5 rounded-2xl border border-[#ece4d8] shadow-xs"
      >
        {/* Segmented filter with sliding pill */}
        <div
          role="tablist"
          className="flex items-center gap-1 !p-1 rounded-xl bg-stone-100/70 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden self-stretch lg:self-auto"
        >
          {filters.map((f) => {
            const isActive = filter === f.id
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setFilter(f.id)}
                className={`relative flex-1 lg:flex-none shrink-0 inline-flex items-center justify-center gap-2 !px-4 !py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors duration-200 cursor-pointer ${isActive ? 'text-white' : 'text-stone-600 hover:text-stone-900'
                  }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="dash-filter-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#8c6b48] to-[#7a5b3b] shadow-sm"
                  />
                )}
                <span className="relative z-10">{f.label}</span>
                <span
                  className={`relative z-10 text-[10px] font-semibold min-w-5 !px-1.5 rounded-full text-center ${isActive ? 'bg-white/25 text-white' : 'bg-white text-stone-500'
                    }`}
                >
                  {f.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search + sort */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative sm:w-64 lg:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search couple, venue or link…"
              aria-label="Search invitations"
              className="w-full h-11 sm:h-10 !pl-10 !pr-9 bg-stone-50 hover:bg-stone-100/80 focus:bg-white border border-stone-200/90 rounded-xl text-[16px] sm:text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-[#8c6b48] focus:ring-2 focus:ring-[#8c6b48]/15 transition-all"
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-stone-200/80 hover:bg-stone-300 text-stone-600 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortId)}
              aria-label="Sort invitations"
              className="appearance-none w-full h-11 sm:h-10 !pl-3.5 !pr-9 bg-stone-50 hover:bg-stone-100/80 border border-stone-200/90 rounded-xl text-[16px] sm:text-sm text-stone-700 focus:outline-none focus:border-[#8c6b48] focus:ring-2 focus:ring-[#8c6b48]/15 cursor-pointer transition-all"
            >
              <option value="newest">Newest first</option>
              <option value="views">Most views</option>
            </select>
            <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </motion.div>

      {/* Result count */}
      <p className="text-xs text-stone-400 !px-1" aria-live="polite">
        Showing {filteredWeddings.length} of {weddings.length}{' '}
        {weddings.length === 1 ? 'invitation' : 'invitations'}
      </p>

      {/* ── Invitations grid ── */}
      {filteredWeddings.length > 0 ? (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredWeddings.map((wedding, i) => (
              <motion.div
                key={wedding.id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.45, delay: Math.min(i, 5) * 0.06, ease: 'easeOut' }}
                whileHover={reduceMotion ? undefined : { y: -6 }}
              >
                <DashboardInvitationCard wedding={wedding} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="!px-6 !py-14 sm:!py-16 text-center bg-white rounded-3xl border border-stone-200/80"
        >
          <div className="w-14 h-14 rounded-full bg-[#faf7f2] border border-[#ece4d8] text-[#8c6b48] flex items-center justify-center mx-auto !mb-5">
            <SearchX className="w-6 h-6" />
          </div>
          <p className="font-serif text-xl sm:text-2xl text-stone-800 !mb-2">No matching invitations found</p>
          <p className="text-sm text-stone-400 max-w-sm mx-auto leading-relaxed">
            Try adjusting your search query or switching the filter tab.
          </p>
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              setFilter('all')
              setSearchQuery('')
            }}
            className="!mt-6 !px-5 !py-2.5 bg-[#8c6b48] hover:bg-[#7e5f3e] text-white rounded-xl text-sm font-medium shadow-sm transition-colors cursor-pointer"
          >
            Clear filters
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}