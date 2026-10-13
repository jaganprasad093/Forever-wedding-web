'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search,
  Plus,
  SlidersHorizontal,
  Sparkles,
  ArrowRight,
  Layers,
  Heart,
  Calendar,
  Share2,
} from 'lucide-react'
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

export default function DashboardInvitationsManager({
  weddings,
}: DashboardInvitationsManagerProps) {
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'views'>('newest')

  const publishedCount = useMemo(
    () => weddings.filter((w) => w.published).length,
    [weddings]
  )
  const draftCount = weddings.length - publishedCount

  const filteredWeddings = useMemo(() => {
    return weddings
      .filter((w) => {
        if (filter === 'published') return w.published
        if (filter === 'draft') return !w.published
        return true
      })
      .filter((w) => {
        if (!searchQuery.trim()) return true
        const query = searchQuery.toLowerCase()
        const couple = `${w.groom_name || ''} ${w.bride_name || ''} ${w.slug || ''}`.toLowerCase()
        return couple.includes(query)
      })
      .sort((a, b) => {
        if (sortBy === 'views') {
          return (b.views || 0) - (a.views || 0)
        }
        return (
          new Date(b.created_at || '').getTime() -
          new Date(a.created_at || '').getTime()
        )
      })
  }, [weddings, filter, searchQuery, sortBy])

  // Empty state when user has 0 invitations created
  if (weddings.length === 0) {
    return (
      <div className="bg-white/95 backdrop-blur-xs rounded-3xl border border-[#ece4d8] shadow-[0_8px_32px_rgba(0,0,0,0.03)] p-8 sm:p-12 text-center overflow-hidden relative">
        <div className="max-w-xl mx-auto">
          {/* Ornamental Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#d8c8b4] bg-[#fbf8f4] text-[#856543] text-xs font-medium tracking-wider uppercase mb-5">
            <span>✦</span>
            <span>Begin Your Wedding Story</span>
          </div>

          <h3 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 mb-3 tracking-tight">
            Create Your First Interactive Invitation
          </h3>
          <p className="text-stone-500 text-sm sm:text-base leading-relaxed mb-8">
            Select a designer template, personalize your celebration details, add background music,
            and share with your guests in minutes.
          </p>

          <Link
            href="/templates"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-[#8c6b48] via-[#81613f] to-[#6e4f30] hover:from-[#7e5e3c] hover:to-[#5e4226] text-white text-sm font-medium rounded-2xl shadow-lg shadow-[#8c6b48]/25 hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>Choose a Luxury Template</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* 3 Step Guide */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 pt-10 border-t border-stone-100 text-left">
            <div className="p-4 rounded-2xl bg-[#faf7f2]/80 border border-[#ede5da]">
              <div className="w-8 h-8 rounded-xl bg-[#8c6b48]/10 text-[#8c6b48] flex items-center justify-center font-serif font-bold text-sm mb-3">
                1
              </div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-800 mb-1">
                Pick a Theme
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Handcrafted wedding aesthetics tailored to traditions and modern elegance.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#faf7f2]/80 border border-[#ede5da]">
              <div className="w-8 h-8 rounded-xl bg-[#8c6b48]/10 text-[#8c6b48] flex items-center justify-center font-serif font-bold text-sm mb-3">
                2
              </div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-800 mb-1">
                Personalize
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Live editor with schedules, love story, photo gallery, maps, and audio songs.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#faf7f2]/80 border border-[#ede5da]">
              <div className="w-8 h-8 rounded-xl bg-[#8c6b48]/10 text-[#8c6b48] flex items-center justify-center font-serif font-bold text-sm mb-3">
                3
              </div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-800 mb-1">
                Share & RSVP
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Send your unique link on WhatsApp and collect guest attendance in real time.
              </p>
            </div>
          </div>

          {/* Quick template pick chips */}
          <div className="mt-8 pt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-4">
              Explore Available Templates
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {templateShowcase.map((t) => (
                <Link
                  key={t.slug}
                  href={`/create?template=${t.slug}`}
                  className="p-3 rounded-2xl border border-stone-200/80 hover:border-[#8c6b48] bg-white hover:bg-[#faf7f2] transition-all text-left group"
                >
                  <span
                    className={`inline-block text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border mb-1.5 font-medium ${t.accent}`}
                  >
                    {t.tag}
                  </span>
                  <p className="text-xs font-medium text-stone-800 group-hover:text-[#8c6b48] truncate">
                    {t.title}
                  </p>
                  <p className="text-[10px] text-stone-400 line-clamp-2 mt-1">
                    {t.desc}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Toolbar: Filters, Search, Sort ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-[#ece4d8]">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-[#8c6b48] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            All ({weddings.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('published')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              filter === 'published'
                ? 'bg-[#8c6b48] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            Published ({publishedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('draft')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              filter === 'draft'
                ? 'bg-[#8c6b48] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            Drafts ({draftCount})
          </button>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-56">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search couple or slug..."
              className="w-full h-9 pl-8 pr-3 bg-stone-50 hover:bg-stone-100/80 focus:bg-white border border-stone-200/90 rounded-xl text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-[#8c6b48] transition-all"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'views')}
            className="h-9 px-2.5 bg-stone-50 border border-stone-200/90 rounded-xl text-xs text-stone-700 focus:outline-none focus:border-[#8c6b48] cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="views">Most Views</option>
          </select>
        </div>
      </div>

      {/* ── Invitations Grid ── */}
      {filteredWeddings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWeddings.map((wedding) => (
            <DashboardInvitationCard key={wedding.id} wedding={wedding} />
          ))}
        </div>
      ) : (
        <div className="p-10 text-center bg-white rounded-3xl border border-stone-200/80">
          <p className="text-sm font-medium text-stone-700">No matching invitations found</p>
          <p className="text-xs text-stone-400 mt-1">
            Try adjusting your search query or switching the filter tab.
          </p>
          <button
            type="button"
            onClick={() => {
              setFilter('all')
              setSearchQuery('')
            }}
            className="mt-4 px-4 py-2 bg-stone-100 hover:bg-stone-200/80 text-stone-700 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
