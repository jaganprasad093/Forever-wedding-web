import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Eye, Music, Users, TrendingUp } from 'lucide-react'

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-stone-800 mb-1">Analytics</h1>
        <p className="text-stone-500">Track engagement with your wedding invitations.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Views', value: totalViews.toLocaleString(), icon: Eye, color: 'text-blue-600 bg-blue-50' },
          { label: 'Music Plays', value: musicPlays.toLocaleString(), icon: Music, color: 'text-violet-600 bg-violet-50' },
          { label: 'RSVPs', value: totalRSVPs.toLocaleString(), icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
          { label: 'Guests', value: totalGuests.toLocaleString(), icon: Users, color: 'text-green-600 bg-green-50' },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-stone-100 shadow-card p-4">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="font-serif text-2xl font-semibold text-stone-800 mb-0.5">{stat.value}</p>
              <p className="text-xs text-stone-500">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Per-invitation breakdown */}
      {weddings && weddings.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-card overflow-hidden">
          <div className="px-5 py-3 border-b border-stone-100">
            <h2 className="font-semibold text-stone-800 text-sm">Per Invitation</h2>
          </div>
          <div className="divide-y divide-stone-100">
            {weddings.map((wedding) => {
              const weddingRSVPs = rsvps?.filter((r) => r.wedding_id === wedding.id) || []
              const attending = weddingRSVPs.filter((r) => r.attending).length
              const coupleName = [wedding.groom_name, wedding.bride_name].filter(Boolean).join(' & ') || 'Untitled'

              return (
                <div key={wedding.id} className="flex items-center gap-4 px-5 py-3 hover:bg-stone-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{coupleName}</p>
                    <p className="text-xs text-stone-400">/w/{wedding.slug}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-stone-700">{wedding.views || 0}</p>
                      <p className="text-xs text-stone-400">Views</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-stone-700">{weddingRSVPs.length}</p>
                      <p className="text-xs text-stone-400">RSVPs</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-stone-700">{attending}</p>
                      <p className="text-xs text-stone-400">Attending</p>
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full font-medium ${wedding.published ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                    {wedding.published ? 'Live' : 'Draft'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
