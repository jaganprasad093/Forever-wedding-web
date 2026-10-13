import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, Check, X, MessageSquare, ArrowLeft, Phone, Calendar } from 'lucide-react'
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
  
  const { data: rsvps } = weddingIds.length > 0
    ? await supabase
        .from('rsvps')
        .select('*')
        .in('wedding_id', weddingIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  const attending = rsvps?.filter((r) => r.attending) || []
  const notAttending = rsvps?.filter((r) => !r.attending) || []
  const totalGuests = attending.reduce((sum, r) => sum + (r.guest_count || 1), 0)

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
          <span>Guest Management</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 tracking-tight mb-2">
          RSVP Responses
        </h1>
        <p className="text-stone-500 text-sm">
          Review attending guests, headcounts, dietary notes, and personal messages.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Responses', value: rsvps?.length || 0, icon: Users, color: 'text-blue-700 bg-blue-50/80' },
          { label: 'Attending', value: attending.length, icon: Check, color: 'text-emerald-700 bg-emerald-50/80' },
          { label: 'Declined', value: notAttending.length, icon: X, color: 'text-rose-700 bg-rose-50/80' },
          { label: 'Confirmed Guests', value: totalGuests, icon: Users, color: 'text-amber-700 bg-amber-50/80' },
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

      {/* RSVP list */}
      {rsvps && rsvps.length > 0 ? (
        <div className="bg-white/95 backdrop-blur-xs rounded-3xl border border-[#ece4d8] shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#ece4d8] bg-[#faf7f2]/50 flex items-center justify-between">
            <h2 className="font-serif text-lg font-medium text-stone-900">
              Guest List & Responses
            </h2>
            <span className="text-xs text-stone-400 font-mono">
              {rsvps.length} {rsvps.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          <div className="divide-y divide-stone-100">
            {rsvps.map((rsvp) => {
              const wedding = weddings?.find((w) => w.id === rsvp.wedding_id)
              const coupleName = wedding
                ? [wedding.groom_name, wedding.bride_name].filter(Boolean).join(' & ')
                : null

              return (
                <div
                  key={rsvp.id}
                  className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 px-6 py-4 hover:bg-[#faf8f5]/60 transition-colors"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-serif font-bold flex-shrink-0 shadow-xs ${
                        rsvp.attending
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                          : 'bg-rose-50 text-rose-700 border border-rose-200/80'
                      }`}
                    >
                      {rsvp.guest_name?.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-serif text-base font-medium text-stone-900 truncate">
                          {rsvp.guest_name}
                        </p>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            rsvp.attending
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : 'bg-rose-50 text-rose-600 border border-rose-200/60'
                          }`}
                        >
                          {rsvp.attending
                            ? `Attending (${rsvp.guest_count || 1} ${
                                rsvp.guest_count === 1 ? 'guest' : 'guests'
                              })`
                            : 'Declined'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-stone-400 mt-1 flex-wrap">
                        {rsvp.phone && (
                          <span className="flex items-center gap-1 text-stone-500">
                            <Phone className="w-3 h-3" />
                            {rsvp.phone}
                          </span>
                        )}
                        {coupleName && (
                          <span>Invitation: <strong className="font-medium text-stone-600">{coupleName}</strong></span>
                        )}
                      </div>

                      {rsvp.message && (
                        <div className="mt-2 text-xs text-stone-600 bg-stone-50 border border-stone-200/60 rounded-xl px-3 py-2 flex items-start gap-1.5 italic">
                          <MessageSquare className="w-3.5 h-3.5 text-stone-400 mt-0.5 flex-shrink-0" />
                          <span>&ldquo;{rsvp.message}&rdquo;</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="text-[11px] text-stone-400 flex-shrink-0 sm:text-right">
                    {formatDate(rsvp.created_at)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white/95 rounded-3xl border border-[#ece4d8] shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-[#8c6b48] flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-2xl font-normal text-stone-800 mb-2">
            No RSVPs received yet
          </h3>
          <p className="text-sm text-stone-500 max-w-sm mx-auto mb-6">
            Publish your wedding invitation and share your unique link on WhatsApp to collect guest attendance.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8c6b48] hover:bg-[#7e5f3e] text-white text-xs font-medium rounded-xl shadow-xs transition-all"
          >
            <span>Go to My Invitations</span>
          </Link>
        </div>
      )}
    </div>
  )
}
