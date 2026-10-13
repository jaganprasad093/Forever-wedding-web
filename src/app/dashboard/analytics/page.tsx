import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Eye, Music, Users, TrendingUp, ArrowLeft, ExternalLink } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: weddings } = await supabase
    .from('weddings')
    .select('id, bride_name, groom_name, slug, views, published')
    .eq('user_id', user.id)

  const weddingIds = weddings?.map((w) => w.id) || []

  const { data: analytics } = await supabase
    .from('analytics')
    .select('event_type, wedding_id, created_at')
    .in('wedding_id', weddingIds)

  const { data: rsvps } = await supabase
    .from('rsvps')
    .select('wedding_id, attending, guest_count')
    .in('wedding_id', weddingIds)

  const totalViews = weddings?.reduce((s, w) => s + (w.views || 0), 0) || 0
  const musicPlays = analytics?.filter((a) => a.event_type === 'music_play').length || 0
  const totalRSVPs = rsvps?.length || 0
  const totalGuests = rsvps?.filter((r) => r.attending).reduce((s, r) => s + (r.guest_count || 1), 0) || 0

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#d8c8b4] bg-[#fbf8f4] text-[#856543] text-xs font-medium tracking-wider uppercase mb-3">
          <span>✦</span>
          <span>Performance Overview</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 tracking-tight mb-2">
          Analytics & Insights
        </h1>
        <p className="text-stone-500 text-sm">
          Track guest engagement, page visits, music interactions, and RSVP velocity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Views', value: totalViews.toLocaleString(), icon: Eye, color: 'text-blue-700 bg-blue-50/80' },
          { label: 'Music Plays', value: musicPlays.toLocaleString(), icon: Music, color: 'text-purple-700 bg-purple-50/80' },
          { label: 'Total RSVPs', value: totalRSVPs.toLocaleString(), icon: TrendingUp, color: 'text-amber-700 bg-amber-50/80' },
          { label: 'Confirmed Guests', value: totalGuests.toLocaleString(), icon: Users, color: 'text-emerald-700 bg-emerald-50/80' },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-white/95 backdrop-blur-xs rounded-2xl border border-[#ece4d8] shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-5 hover:shadow-[0_8px_24px_rgba(140,107,72,0.06)] transition-all"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="font-serif text-3xl font-medium text-stone-900 tracking-tight mb-0.5">
                {stat.value}
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                {stat.label}
              </p>
            </div>
          )
        })}
      </div>

      {/* Per-invitation breakdown */}
      {weddings && weddings.length > 0 ? (
        <div className="bg-white/95 backdrop-blur-xs rounded-3xl border border-[#ece4d8] shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#ece4d8] bg-[#faf7f2]/50">
            <h2 className="font-serif text-lg font-medium text-stone-900">
              Breakdown by Invitation
            </h2>
          </div>
          <div className="divide-y divide-stone-100">
            {weddings.map((wedding) => {
              const weddingRSVPs = rsvps?.filter((r) => r.wedding_id === wedding.id) || []
              const attending = weddingRSVPs.filter((r) => r.attending).length
              const coupleName =
                [wedding.groom_name, wedding.bride_name].filter(Boolean).join(' & ') || 'Untitled Invitation'

              return (
                <div
                  key={wedding.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 hover:bg-[#faf8f5]/60 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-serif text-base font-medium text-stone-900 truncate">
                      {coupleName}
                    </p>
                    <Link
                      href={`/w/${wedding.slug}`}
                      target="_blank"
                      className="text-xs text-stone-400 hover:text-[#8c6b48] inline-flex items-center gap-1 mt-0.5"
                    >
                      <span>/w/{wedding.slug}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-stone-800">{wedding.views || 0}</p>
                      <p className="text-[11px] text-stone-400">Views</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-stone-800">{weddingRSVPs.length}</p>
                      <p className="text-[11px] text-stone-400">RSVPs</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-emerald-700">{attending}</p>
                      <p className="text-[11px] text-stone-400">Attending</p>
                    </div>
                    <div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          wedding.published
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {wedding.published ? 'Live' : 'Draft'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#ece4d8] p-10 text-center">
          <p className="text-sm font-medium text-stone-700">No invitations created yet.</p>
          <Link
            href="/templates"
            className="inline-block mt-3 text-xs font-semibold text-[#8c6b48] hover:underline"
          >
            Create your first invitation →
          </Link>
        </div>
      )}
    </div>
  )
}
