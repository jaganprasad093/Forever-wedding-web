import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users, Check, X, MessageSquare } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function RSVPDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: weddings } = await supabase
    .from('weddings')
    .select('id, bride_name, groom_name, slug')
    .eq('user_id', user.id)

  const weddingIds = weddings?.map((w) => w.id) || []
  
  const { data: rsvps } = await supabase
    .from('rsvps')
    .select('*')
    .in('wedding_id', weddingIds)
    .order('created_at', { ascending: false })

  const attending = rsvps?.filter((r) => r.attending) || []
  const notAttending = rsvps?.filter((r) => !r.attending) || []
  const totalGuests = attending.reduce((sum, r) => sum + (r.guest_count || 1), 0)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-stone-800 mb-1">RSVPs</h1>
        <p className="text-stone-500">Guest responses to your wedding invitations.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Responses', value: rsvps?.length || 0, icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Attending', value: attending.length, icon: Check, color: 'text-green-600 bg-green-50' },
          { label: 'Not Attending', value: notAttending.length, icon: X, color: 'text-red-600 bg-red-50' },
          { label: 'Total Guests', value: totalGuests, icon: Users, color: 'text-amber-600 bg-amber-50' },
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

      {/* RSVP list */}
      {rsvps && rsvps.length > 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-card overflow-hidden">
          <div className="px-5 py-3 border-b border-stone-100">
            <h2 className="font-semibold text-stone-800 text-sm">Guest List</h2>
          </div>
          <div className="divide-y divide-stone-100">
            {rsvps.map((rsvp) => {
              const wedding = weddings?.find((w) => w.id === rsvp.wedding_id)
              return (
                <div key={rsvp.id} className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${rsvp.attending ? 'bg-green-500' : 'bg-stone-300'}`}>
                    {rsvp.guest_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-stone-800 truncate">{rsvp.guest_name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rsvp.attending ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'}`}>
                        {rsvp.attending ? `Attending (${rsvp.guest_count || 1})` : 'Declined'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {rsvp.phone && <p className="text-xs text-stone-400">{rsvp.phone}</p>}
                      {wedding && (
                        <p className="text-xs text-stone-400">
                          for {[wedding.groom_name, wedding.bride_name].filter(Boolean).join(' & ')}
                        </p>
                      )}
                    </div>
                    {rsvp.message && (
                      <p className="text-xs text-stone-400 italic mt-0.5 truncate">&ldquo;{rsvp.message}&rdquo;</p>
                    )}
                  </div>
                  <p className="text-xs text-stone-400 flex-shrink-0">{formatDate(rsvp.created_at)}</p>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-stone-100 shadow-card">
          <MessageSquare className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="font-semibold text-stone-700 mb-1">No RSVPs yet</h3>
          <p className="text-sm text-stone-400">Publish your invitation and share it to start collecting responses.</p>
        </div>
      )}
    </div>
  )
}
