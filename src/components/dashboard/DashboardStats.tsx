'use client'

import { Eye, Heart, Users } from 'lucide-react'

interface Wedding {
  id: string
  published: boolean
  views: number
}

export default function DashboardStats({ weddings }: { weddings: Wedding[] }) {
  const totalViews = weddings.reduce((sum, w) => sum + (w.views || 0), 0)
  const publishedCount = weddings.filter((w) => w.published).length

  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {[
        {
          label: 'Invitations',
          value: weddings.length,
          icon: Heart,
          color: 'text-rose-600 bg-rose-50',
        },
        {
          label: 'Published',
          value: publishedCount,
          icon: Users,
          color: 'text-green-600 bg-green-50',
        },
        {
          label: 'Total Views',
          value: totalViews.toLocaleString(),
          icon: Eye,
          color: 'text-blue-600 bg-blue-50',
        },
      ].map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-stone-100 shadow-card p-4"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="font-serif text-2xl font-semibold text-stone-800 mb-0.5">
              {stat.value}
            </p>
            <p className="text-xs text-stone-500">{stat.label}</p>
          </div>
        )
      })}
    </div>
  )
}
