'use client'

import { Eye, Heart, Users, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react'

interface Wedding {
  id: string
  published: boolean
  views: number
}

interface RSVP {
  id: string
  attending: boolean
  guest_count?: number
}

interface DashboardStatsProps {
  weddings: Wedding[]
  rsvps?: RSVP[]
}

export default function DashboardStats({ weddings, rsvps = [] }: DashboardStatsProps) {
  const totalViews = weddings.reduce((sum, w) => sum + (w.views || 0), 0)
  const publishedCount = weddings.filter((w) => w.published).length
  const draftCount = weddings.length - publishedCount

  const totalRsvpCount = rsvps.length
  const attendingCount = rsvps.filter((r) => r.attending).length
  const totalGuests = rsvps
    .filter((r) => r.attending)
    .reduce((sum, r) => sum + (r.guest_count || 1), 0)

  const stats = [
    {
      label: 'Total Invitations',
      value: weddings.length,
      subtext: `${publishedCount} published · ${draftCount} draft`,
      icon: Heart,
      iconColor: 'text-[#8c6b48]',
      bgGlow: 'bg-[#f7f2ea]',
      accentBorder: 'group-hover:border-[#d6c4b0]',
    },
    {
      label: 'Published Status',
      value: publishedCount,
      subtext: publishedCount > 0 ? 'Accepting RSVPs' : 'No live links yet',
      icon: Sparkles,
      iconColor: 'text-amber-700',
      bgGlow: 'bg-amber-50/80',
      accentBorder: 'group-hover:border-amber-200',
      isLive: publishedCount > 0,
    },
    {
      label: 'Total Views',
      value: totalViews.toLocaleString(),
      subtext: weddings.length > 0
        ? `Avg ${Math.round(totalViews / weddings.length)} views / invite`
        : '0 views',
      icon: Eye,
      iconColor: 'text-blue-700',
      bgGlow: 'bg-blue-50/80',
      accentBorder: 'group-hover:border-blue-200',
    },
    {
      label: 'Attending Guests',
      value: totalGuests,
      subtext: totalRsvpCount > 0
        ? `${attendingCount} of ${totalRsvpCount} responses accepted`
        : 'Awaiting RSVPs',
      icon: Users,
      iconColor: 'text-emerald-700',
      bgGlow: 'bg-emerald-50/80',
      accentBorder: 'group-hover:border-emerald-200',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className={`group relative bg-white/90 backdrop-blur-xs rounded-2xl border border-[#ece4d8] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(140,107,72,0.06)] hover:-translate-y-0.5 transition-all duration-300 ${stat.accentBorder}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl ${stat.bgGlow} flex items-center justify-center transition-transform duration-200 group-hover:scale-105`}
              >
                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              {stat.isLive && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              )}
            </div>

            <p className="font-serif text-3xl font-medium text-stone-900 tracking-tight mb-1">
              {stat.value}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                {stat.label}
              </p>
            </div>
            <p className="text-[11px] text-stone-400 mt-1 truncate">
              {stat.subtext}
            </p>
          </div>
        )
      })}
    </div>
  )
}
