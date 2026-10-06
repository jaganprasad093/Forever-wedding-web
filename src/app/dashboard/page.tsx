import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Plus,
  Eye,
  Edit3,
  MoreHorizontal,
  Layers,
  Calendar,
  Globe,
  Lock,
  Copy,
  Share2,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import DashboardInvitationCard from '@/components/dashboard/DashboardInvitationCard'
import DashboardStats from '@/components/dashboard/DashboardStats'

export const dynamic = 'force-dynamic'

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

  const displayName = profile?.name?.split(' ')[0] || user.email?.split('@')[0] || 'there'

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-stone-800 mb-1">
          Welcome back, {displayName} 👋
        </h1>
        <p className="text-stone-500">
          {weddings && weddings.length > 0
            ? 'Manage your wedding invitations below.'
            : 'Create your beautiful wedding invitation.'}
        </p>
      </div>

      {/* Stats */}
      {weddings && weddings.length > 0 && (
        <DashboardStats weddings={weddings} />
      )}

      {/* Create new button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-stone-800">
          My Invitations
          {weddings && weddings.length > 0 && (
            <span className="ml-2 text-sm font-normal text-stone-400">
              ({weddings.length})
            </span>
          )}
        </h2>
        <Link
          href="/templates"
          className="flex items-center gap-2 bg-gradient-gold text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-gold hover:shadow-lg hover:scale-105 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          New Invitation
        </Link>
      </div>

      {/* Invitations grid */}
      {weddings && weddings.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {weddings.map((wedding) => (
            <DashboardInvitationCard key={wedding.id} wedding={wedding} />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="text-center py-20 bg-white rounded-2xl border border-stone-100 shadow-card">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Layers className="w-10 h-10 text-amber-500" />
          </div>
          <h3 className="font-serif text-2xl font-medium text-stone-800 mb-2">
            No invitations yet
          </h3>
          <p className="text-stone-500 text-sm mb-6 max-w-xs mx-auto">
            Create your first beautiful digital wedding invitation in minutes.
          </p>
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 bg-gradient-gold text-white px-6 py-3 rounded-xl font-medium shadow-gold hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Explore Templates
          </Link>
        </div>
      )}
    </div>
  )
}
