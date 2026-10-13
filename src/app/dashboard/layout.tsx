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
    <div className="min-h-screen bg-[#faf8f5] relative text-stone-900 selection:bg-[#ebdcc9] selection:text-[#5c4028]">
      {/* Ambient background glows */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-gradient-to-b from-[#f3e9dc]/60 via-[#faf5ee]/30 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="absolute top-1/3 left-1/3 w-[600px] h-[400px] bg-gradient-to-tr from-[#f6ede2]/40 via-[#fdfbf9]/20 to-transparent rounded-full blur-3xl opacity-60" />
      </div>

      <DashboardNav
        userName={profile?.name || null}
        userEmail={user.email || null}
      />

      {/* Main content — offset for sidebar */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen flex flex-col">
        {children}
      </main>
    </div>
  )
}
