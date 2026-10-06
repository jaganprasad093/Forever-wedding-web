import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardNav from '@/components/dashboard/DashboardNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

  return (
    <div className="min-h-screen bg-stone-50">
      <DashboardNav
        userName={profile?.name || null}
        userEmail={user.email || null}
      />
      {/* Main content — offset for sidebar */}
      <div className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        {children}
      </div>
    </div>
  )
}
