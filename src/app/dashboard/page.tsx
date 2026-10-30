import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Plus,
  Sparkles,
  BarChart3,
  Users,
  Layers,
  ArrowUpRight,
} from 'lucide-react'
import DashboardStats from '@/components/dashboard/DashboardStats'
import DashboardInvitationsManager from '@/components/dashboard/DashboardInvitationsManager'
import DashboardRecentRsvps from '@/components/dashboard/DashboardRecentRsvps'

export const dynamic = 'force-dynamic'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single()

  const { data: weddings } = await supabase
    .from('weddings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const weddingList = weddings || []
  const weddingIds = weddingList.map((w) => w.id)

  const { data: rawRsvps } =
    weddingIds.length > 0
      ? await supabase
          .from('rsvps')
          .select('*')
          .in('wedding_id', weddingIds)
          .order('created_at', { ascending: false })
      : { data: [] }

  const weddingMap = new Map(
    weddingList.map((w) => [
      w.id,
      [w.groom_name, w.bride_name].filter(Boolean).join(' & ') || 'Wedding Invitation',
    ])
  )

  const enrichedRsvps = (rawRsvps || []).map((r) => ({
    ...r,
    weddingCoupleName: weddingMap.get(r.wedding_id),
  }))

  const displayName = profile?.name?.split(' ')[0] || user.email?.split('@')[0] || 'there'
  const greeting = getGreeting()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full">
      {/* ── Top Hero Greeting Banner ── */}
      <div className="mb-8 sm:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#ece4d8]">
        <div>
          {/* Subtle luxury brand tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#d8c8b4] bg-[#fbf8f4] text-[#856543] text-xs font-medium tracking-wider uppercase mb-3">
            <span>✦</span>
            <span>Wedding Studio Dashboard</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-900 tracking-tight leading-tight">
            {greeting}, {displayName}
          </h1>

          <p className="text-stone-500 text-sm sm:text-base mt-2 max-w-xl">
            {weddingList.length > 0
              ? 'Manage your luxury invitations, view live guest responses, and share your celebration.'
              : 'Create and customize your beautiful digital wedding invitation in minutes.'}
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#faf7f2] border border-[#d8c8b4] text-stone-700 hover:text-stone-900 text-xs sm:text-sm font-medium rounded-xl shadow-xs transition-all duration-200"
          >
            <Layers className="w-4 h-4 text-[#8c6b48]" />
            <span>Browse Templates</span>
          </Link>

          <Link
            href="/templates"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#8c6b48] via-[#81613f] to-[#6e4f30] hover:from-[#7e5e3c] hover:to-[#5e4226] text-white text-xs sm:text-sm font-medium rounded-xl shadow-md shadow-[#8c6b48]/20 hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>New Invitation</span>
          </Link>
        </div>
      </div>

      {/* ── KPI Stats Cards ── */}
      {weddingList.length > 0 && (
        <DashboardStats weddings={weddingList} rsvps={rawRsvps || []} />
      )}

      {/* ── Recent RSVPs (If any responses exist) ── */}
      {enrichedRsvps.length > 0 && (
        <DashboardRecentRsvps rsvps={enrichedRsvps} />
      )}

      {/* ── Invitations Manager (Filter tabs, search, sort, cards) ── */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-serif text-2xl font-normal text-stone-900 tracking-tight">
              My Invitations
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Live websites and draft designs created by you
            </p>
          </div>
        </div>

        <DashboardInvitationsManager weddings={weddingList} />
      </section>

      {/* ── Quick Tips / Best Practices Banner ── */}
      {weddingList.length > 0 && (
        <div className="bg-gradient-to-br from-[#faf6f0] via-[#f7f1e6] to-[#f4ebe0] rounded-3xl border border-[#e5d8c6] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-[#8c6b48] text-xs font-semibold uppercase tracking-wider mb-1.5">
              {/* <Sparkles className="w-3.5 h-3.5" /> */}
              <span>Pro Tip for Couples</span>
            </div>
            <h3 className="font-serif text-xl font-normal text-stone-900 mb-1">
              Share directly to WhatsApp with your guest list
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Once published, click the WhatsApp button on your invitation card to generate a custom
              invitation message with your direct link.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/rsvp"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8c6b48] hover:text-[#6e4e2c] bg-white px-4 py-2.5 rounded-xl border border-[#d8c8b4] shadow-xs hover:bg-[#faf7f2] transition-all"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Manage RSVPs</span>
            </Link>
            <Link
              href="/dashboard/analytics"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white px-4 py-2.5 rounded-xl border border-[#d8c8b4] shadow-xs hover:bg-[#faf7f2] transition-all"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
