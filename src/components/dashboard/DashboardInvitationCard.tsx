'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Edit3, Eye, Globe, Lock, MoreHorizontal, Trash2, Copy, Share2, ExternalLink } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface Wedding {
  id: string
  bride_name: string | null
  groom_name: string | null
  wedding_date: string | null
  slug: string
  published: boolean
  template_id: string
  views: number
}

export default function DashboardInvitationCard({ wedding }: { wedding: Wedding }) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [copying, setCopying] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const publicUrl = `${window?.location?.origin || ''}/w/${wedding.slug}`
  const coupleName = [wedding.groom_name, wedding.bride_name].filter(Boolean).join(' & ') || 'Unnamed Invitation'

  const copyLink = async () => {
    setCopying(true)
    await navigator.clipboard.writeText(publicUrl)
    setTimeout(() => setCopying(false), 1500)
  }

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(
      `You're invited to the wedding of ${coupleName} 💍\n\nView the invitation:\n${publicUrl}`
    )
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  const deleteInvitation = async () => {
    if (!confirm('Are you sure you want to delete this invitation? This cannot be undone.')) return
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('weddings').delete().eq('id', wedding.id)
    router.refresh()
  }

  // Template color themes
  const templateColors: Record<string, string> = {
    'template-kerala-traditional': 'from-amber-100 to-yellow-50',
    'template-royal-gold': 'from-stone-800 to-stone-900',
    'template-minimal-white': 'from-stone-50 to-white',
    'template-floral-romantic': 'from-rose-50 to-pink-100',
  }

  const templateTextColors: Record<string, string> = {
    'template-kerala-traditional': 'text-amber-800',
    'template-royal-gold': 'text-amber-400',
    'template-minimal-white': 'text-stone-800',
    'template-floral-romantic': 'text-rose-700',
  }

  const bgClass = templateColors[wedding.template_id] || 'from-amber-50 to-orange-50'
  const textClass = templateTextColors[wedding.template_id] || 'text-stone-700'

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
      {/* Template preview */}
      <div className={`bg-gradient-to-br ${bgClass} h-44 flex flex-col items-center justify-center relative`}>
        <p className={`text-xs font-medium ${textClass} opacity-50 uppercase tracking-widest mb-2`}>Wedding Invitation</p>
        <h3 className={`font-serif text-2xl font-medium ${textClass} mb-1 text-center px-4`}>
          {coupleName}
        </h3>
        {wedding.wedding_date && (
          <p className={`text-xs ${textClass} opacity-50 mt-1`}>{formatDate(wedding.wedding_date)}</p>
        )}

        {/* Hover overlay with quick actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <Link
            href={`/editor/${wedding.id}`}
            className="bg-white text-stone-800 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-amber-50 flex items-center gap-1"
          >
            <Edit3 className="w-3 h-3" />
            Edit
          </Link>
          <Link
            href={`/preview/${wedding.id}`}
            className="bg-white text-stone-800 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-amber-50 flex items-center gap-1"
          >
            <Eye className="w-3 h-3" />
            Preview
          </Link>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-medium text-stone-800 text-sm">{coupleName}</h4>
            {wedding.wedding_date && (
              <p className="text-xs text-stone-400 mt-0.5">{formatDate(wedding.wedding_date)}</p>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-stone-500" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-stone-100 rounded-xl shadow-card-hover z-10 w-44 overflow-hidden">
                <Link href={`/editor/${wedding.id}`} className="flex items-center gap-2 px-3 py-2 text-sm text-stone-600 hover:bg-stone-50">
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Invitation
                </Link>
                <Link href={`/preview/${wedding.id}`} className="flex items-center gap-2 px-3 py-2 text-sm text-stone-600 hover:bg-stone-50">
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </Link>
                {wedding.published && (
                  <>
                    <Link href={`/w/${wedding.slug}`} target="_blank" className="flex items-center gap-2 px-3 py-2 text-sm text-stone-600 hover:bg-stone-50">
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Live
                    </Link>
                    <button onClick={copyLink} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-600 hover:bg-stone-50">
                      <Copy className="w-3.5 h-3.5" />
                      {copying ? 'Copied!' : 'Copy Link'}
                    </button>
                    <button onClick={shareViaWhatsApp} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-600 hover:bg-stone-50">
                      <Share2 className="w-3.5 h-3.5" />
                      Share on WhatsApp
                    </button>
                  </>
                )}
                <div className="border-t border-stone-100" />
                <button
                  onClick={deleteInvitation}
                  disabled={deleting}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status + views */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {wedding.published ? (
              <>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span className="text-xs text-green-700 font-medium">Published</span>
              </>
            ) : (
              <>
                <div className="w-1.5 h-1.5 bg-stone-400 rounded-full" />
                <span className="text-xs text-stone-500 font-medium">Draft</span>
              </>
            )}
          </div>
          {wedding.views > 0 && (
            <span className="text-xs text-stone-400">{wedding.views} views</span>
          )}
        </div>

        {/* Share section (published only) */}
        {wedding.published && (
          <div className="mt-3 pt-3 border-t border-stone-100">
            <p className="text-xs text-stone-400 mb-2">Your invitation is live 🎉</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5">
                <p className="text-xs text-stone-500 truncate">/w/{wedding.slug}</p>
              </div>
              <button onClick={copyLink} className="p-1.5 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors">
                <Copy className="w-3.5 h-3.5 text-amber-700" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
