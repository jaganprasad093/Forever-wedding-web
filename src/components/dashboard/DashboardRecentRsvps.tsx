'use client'

import Link from 'next/link'
import { Users, CheckCircle2, XCircle, ArrowRight, MessageSquare } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface RSVPItem {
  id: string
  wedding_id: string
  guest_name: string
  phone?: string | null
  attending: boolean
  guest_count?: number
  message?: string | null
  created_at: string
  weddingCoupleName?: string
}

interface DashboardRecentRsvpsProps {
  rsvps: RSVPItem[]
}

export default function DashboardRecentRsvps({ rsvps }: DashboardRecentRsvpsProps) {
  if (!rsvps || rsvps.length === 0) return null

  const displayList = rsvps.slice(0, 5)

  return (
    <div className="bg-white/90 backdrop-blur-xs rounded-3xl border border-[#ece4d8] shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 mb-10">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-medium text-stone-900 leading-none">
              Recent RSVP Responses
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Latest guest confirmations across your active invitations
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/rsvp"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8c6b48] hover:text-[#6e4e2c] transition-colors"
        >
          <span>View all ({rsvps.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-stone-100">
        {displayList.map((rsvp) => (
          <div
            key={rsvp.id}
            className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  rsvp.attending
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-rose-50 text-rose-500'
                }`}
              >
                {rsvp.attending ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-stone-900 truncate">
                    {rsvp.guest_name}
                  </p>
                  {rsvp.attending && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-medium">
                      +{rsvp.guest_count || 1} {rsvp.guest_count === 1 ? 'guest' : 'guests'}
                    </span>
                  )}
                  {rsvp.weddingCoupleName && (
                    <span className="text-[11px] text-stone-400 truncate">
                      • {rsvp.weddingCoupleName}
                    </span>
                  )}
                </div>
                {rsvp.message && (
                  <p className="text-xs text-stone-500 italic mt-0.5 truncate flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-stone-400 flex-shrink-0" />
                    &ldquo;{rsvp.message}&rdquo;
                  </p>
                )}
              </div>
            </div>

            <div className="text-left sm:text-right flex-shrink-0">
              <span className="text-[11px] text-stone-400">
                {formatDate(rsvp.created_at)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
