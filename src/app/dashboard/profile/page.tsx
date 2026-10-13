import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Mail, Calendar, ShieldCheck, Heart } from 'lucide-react'
import ProfileForm from '@/components/dashboard/ProfileForm'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const displayName = profile?.name || user.email?.split('@')[0] || 'User'

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 text-[#8c6b48] text-xs font-medium tracking-widest uppercase mb-1.5">
          <span>✦</span>
          <span>Account Settings</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 tracking-tight">
          Your Profile
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Manage your personal information and account preferences.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden divide-y divide-stone-100">
        {/* User Identity Banner */}
        <div className="p-6 sm:p-8 bg-gradient-to-br from-[#faf6f0] via-[#f7f2ea]/70 to-[#faf6f0] flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8c6b48] to-[#6c4f31] flex items-center justify-center text-white text-2xl font-serif font-bold shadow-md shadow-[#8c6b48]/20 flex-shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-medium text-stone-900 truncate">
              {displayName}
            </h2>
            <p className="text-sm text-stone-500 truncate flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-stone-400" />
              {user.email}
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-medium mt-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Account</span>
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <div className="p-6 sm:p-8">
          <ProfileForm
            userId={user.id}
            initialName={profile?.name || ''}
            email={user.email || ''}
          />
        </div>
      </div>
    </div>
  )
}
