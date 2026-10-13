'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Edit3,
  Eye,
  ExternalLink,
  Copy,
  Check,
  Share2,
  MoreVertical,
  Trash2,
  Calendar,
  MapPin,
  Sparkles,
  Users,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

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
}

const templateThemeMap: Record<
  string,
  {
    name: string
    cardBg: string
    textColor: string
    accentColor: string
    tagBg: string
    fontStyle: string
  }
> = {
  'template-kerala-traditional': {
    name: 'Kerala Traditional',
    cardBg: 'from-[#fbf4e6] via-[#f7ebd4] to-[#f2dfbe]',
    textColor: 'text-[#6e461b]',
    accentColor: 'text-[#9c6a32]',
    tagBg: 'bg-[#ebd8b7]/70 text-[#684119] border-[#d8be92]',
    fontStyle: 'font-serif',
  },
  'template-royal-gold': {
    name: 'Royal Gold',
    cardBg: 'from-[#1e1b18] via-[#29241f] to-[#1a1714]',
    textColor: 'text-[#f5e6cf]',
    accentColor: 'text-[#d4af37]',
    tagBg: 'bg-[#3b332b]/80 text-[#e4c995] border-[#5a4e3f]',
    fontStyle: 'font-serif tracking-wider',
  },
  'template-minimal-white': {
    name: 'Minimal White',
    cardBg: 'from-[#ffffff] via-[#fcfbfa] to-[#f4f2ee]',
    textColor: 'text-stone-900',
    accentColor: 'text-stone-500',
    tagBg: 'bg-stone-100 text-stone-700 border-stone-200',
    fontStyle: 'font-sans font-light tracking-widest uppercase',
  },
  'template-floral-romantic': {
    name: 'Floral Romantic',
    cardBg: 'from-[#fef7f7] via-[#fceeee] to-[#fae1e3]',
    textColor: 'text-[#7d3b48]',
    accentColor: 'text-[#ab5667]',
    tagBg: 'bg-[#f7d6dc]/70 text-[#7a3240] border-[#eec2cb]',
    fontStyle: 'font-serif italic',
  },
}

export default function DashboardInvitationCard({ wedding }: { wedding: Wedding }) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/w/${wedding.slug}`
  const coupleName =
    [wedding.groom_name, wedding.bride_name].filter(Boolean).join(' & ') || 'Our Wedding'

  const theme = templateThemeMap[wedding.template_id] || {
    name: 'Custom Template',
    cardBg: 'from-[#faf5ee] via-[#f4ebe0] to-[#ecdfd0]',
    textColor: 'text-stone-800',
    accentColor: 'text-[#8c6b48]',
    tagBg: 'bg-[#ece2d4] text-stone-700 border-[#dccfbd]',
    fontStyle: 'font-serif',
  }

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  const handleShareWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation()
    const message = encodeURIComponent(
      `You are cordially invited to celebrate the wedding of ${coupleName} 💍\n\nView the interactive invitation:\n${publicUrl}`
    )
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete the invitation for "${coupleName}"? This action cannot be undone.`
      )
    ) {
      return
    }

    setDeleting(true)
    try {
      const supabase = createClient()
      await supabase.from('weddings').delete().eq('id', wedding.id)
      router.refresh()
    } catch {
      setDeleting(false)
    }
  }

  return (
    <div className="group bg-white rounded-3xl border border-[#ece4d8] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(140,107,72,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* ── Top Invitation Preview Visual ── */}
      <div
        className={`relative h-48 bg-gradient-to-br ${theme.cardBg} p-5 flex flex-col justify-between overflow-hidden border-b border-[#ece4d8]/70`}
      >
        {/* Subtle decorative ornament watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
          <div className="w-40 h-40 rounded-full border border-current" />
        </div>

        {/* Top Badges */}
        <div className="relative z-10 flex items-center justify-between">
          <span
            className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border backdrop-blur-xs ${theme.tagBg}`}
          >
            {theme.name}
          </span>

          <div className="flex items-center gap-2">
            {wedding.published ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/90 text-white shadow-xs backdrop-blur-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-stone-900/40 text-white backdrop-blur-xs">
                Draft
              </span>
            )}
          </div>
        </div>

        {/* Center Invitation Typography */}
        <div className="relative z-10 text-center my-auto py-2">
          <p
            className={`text-[10px] tracking-[0.25em] uppercase font-medium mb-1.5 opacity-60 ${theme.textColor}`}
          >
            The Wedding of
          </p>
          <h3
            className={`text-xl sm:text-2xl font-normal leading-tight px-3 truncate ${theme.fontStyle} ${theme.textColor}`}
          >
            {coupleName}
          </h3>
          {wedding.wedding_date && (
            <p
              className={`text-xs mt-1.5 opacity-75 font-sans font-medium flex items-center justify-center gap-1.5 ${theme.textColor}`}
            >
              <Calendar className="w-3 h-3 opacity-70" />
              <span>{formatDate(wedding.wedding_date)}</span>
            </p>
          )}
        </div>

        {/* Bottom preview strip: Views count */}
        <div className="relative z-10 flex items-center justify-between text-[11px] font-medium opacity-70">
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>{wedding.views || 0} views</span>
          </div>
          {wedding.venue_name && (
            <div className="flex items-center gap-1 truncate max-w-[160px]">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{wedding.venue_name}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Card Body & Actions ── */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Couple Title and More Menu */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <h4 className="font-serif text-lg font-medium text-stone-900 leading-snug truncate">
                {coupleName}
              </h4>
              <p className="text-xs text-stone-400 mt-0.5">
                Slug:{' '}
                <span className="font-mono text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded text-[11px]">
                  /w/{wedding.slug}
                </span>
              </p>
            </div>

            {/* Menu Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1.5 hover:bg-stone-100 rounded-xl text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                aria-label="More options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-[#ece4d8] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] py-1.5 z-20 overflow-hidden"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <Link
                    href={`/editor/${wedding.id}`}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-[#faf7f2] hover:text-[#704e2e] transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-stone-400" />
                    <span>Edit Content</span>
                  </Link>

                  <Link
                    href={`/preview/${wedding.id}`}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-[#faf7f2] hover:text-[#704e2e] transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-stone-400" />
                    <span>Preview Full Page</span>
                  </Link>

                  <Link
                    href="/dashboard/rsvp"
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-[#faf7f2] hover:text-[#704e2e] transition-colors"
                  >
                    <Users className="w-3.5 h-3.5 text-stone-400" />
                    <span>View RSVPs</span>
                  </Link>

                  {wedding.published && (
                    <Link
                      href={`/w/${wedding.slug}`}
                      target="_blank"
                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-[#faf7f2] hover:text-[#704e2e] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                      <span>Open Live Site</span>
                    </Link>
                  )}

                  <div className="h-px bg-stone-100 my-1" />

                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>{deleting ? 'Deleting...' : 'Delete Invitation'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Bottom Action Strip ── */}
        <div className="pt-3 border-t border-stone-100 mt-2 space-y-2.5">
          {/* Primary edit and preview buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/editor/${wedding.id}`}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#8c6b48] hover:bg-[#7a5c3d] text-white text-xs font-medium rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </Link>

            <Link
              href={`/preview/${wedding.id}`}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#faf7f2] hover:bg-[#f3eae0] border border-[#e5dcce] text-stone-700 hover:text-stone-900 text-xs font-medium rounded-xl transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-stone-500" />
              <span>Preview</span>
            </Link>
          </div>

          {/* Published quick sharing buttons */}
          {wedding.published ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200/80 rounded-xl text-[11px] font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                title="Copy public invitation link"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-400" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="flex items-center justify-center gap-1 py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-xl text-[11px] font-medium text-emerald-700 transition-colors cursor-pointer"
                title="Share via WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>

              <Link
                href={`/w/${wedding.slug}`}
                target="_blank"
                className="p-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200/80 rounded-xl text-stone-500 hover:text-stone-800 transition-colors"
                title="Open live link"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between px-2 py-1.5 bg-amber-50/70 border border-amber-200/60 rounded-xl">
              <span className="text-[11px] text-amber-800">
                Draft not yet published
              </span>
              <Link
                href={`/editor/${wedding.id}`}
                className="text-[11px] font-semibold text-[#8c6b48] hover:underline"
              >
                Publish now →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
