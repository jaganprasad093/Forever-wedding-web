import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit3 } from 'lucide-react'
import PublishedWeddingPage from '@/components/wedding/PublishedWeddingPage'
import { WeddingData } from '@/types/wedding'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

interface DbEvent {
  id: string
  wedding_id: string
  title: string
  date: string | null
  time: string | null
  venue: string | null
  address: string | null
  maps_url: string | null
  order_index: number | null
}

interface DbGallery {
  id: string
  wedding_id: string
  url: string
  path: string
  is_cover: boolean
  order_index: number | null
}

interface DbMusic {
  id: string
  wedding_id: string
  title: string
  artist: string | null
  url: string
  path: string | null
  type: 'upload' | 'preset'
}

export default async function WeddingPreviewPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: wedding, error } = await supabase
    .from('weddings')
    .select('*, events(*), gallery(*), music(*)')
    .eq('id', id)
    .single()

  if (error || !wedding) {
    if (!user) redirect('/login')
    notFound()
  }

  const rawEvents = (wedding.events || []) as unknown as DbEvent[]
  const rawGallery = (wedding.gallery || []) as unknown as DbGallery[]
  const rawMusic = (wedding.music || []) as unknown as DbMusic[]

  const weddingData: WeddingData = {
    id: wedding.id,
    userId: wedding.user_id,
    templateId: wedding.template_id,
    slug: wedding.slug,
    brideName: wedding.bride_name,
    groomName: wedding.groom_name,
    weddingDate: wedding.wedding_date,
    weddingTime: wedding.wedding_time,
    venueName: wedding.venue_name,
    venueAddress: wedding.venue_address,
    venueMapsUrl: wedding.venue_maps_url,
    story: wedding.story,
    theme: (wedding.theme as unknown as WeddingData['theme']) || {
      primaryColor: '#92400e',
      secondaryColor: '#b45309',
      backgroundColor: '#fffbeb',
      accentColor: '#fcd34d',
      fontFamily: 'cormorant',
    },
    published: wedding.published,
    publishedAt: wedding.published_at,
    views: wedding.views,
    createdAt: wedding.created_at,
    updatedAt: wedding.updated_at,
    events: rawEvents
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
      .map((e) => ({
        id: e.id,
        weddingId: e.wedding_id,
        title: e.title,
        date: e.date,
        time: e.time,
        venue: e.venue,
        address: e.address,
        mapsUrl: e.maps_url,
        orderIndex: e.order_index || 0,
      })),
    gallery: rawGallery
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
      .map((g) => ({
        id: g.id,
        weddingId: g.wedding_id,
        url: g.url,
        path: g.path,
        isCover: g.is_cover,
        orderIndex: g.order_index || 0,
      })),
    music: rawMusic[0]
      ? {
          id: rawMusic[0].id,
          weddingId: rawMusic[0].wedding_id,
          title: rawMusic[0].title,
          artist: rawMusic[0].artist,
          url: rawMusic[0].url,
          path: rawMusic[0].path,
          type: rawMusic[0].type,
        }
      : null,
  }

  const isOwner = user && user.id === wedding.user_id

  return (
    <div className="relative min-h-screen">
      {/* Top Preview Banner */}
      <aside
        aria-label="Preview notification bar"
        className="fixed top-0 inset-x-0 z-50 bg-stone-900/90 backdrop-blur-md text-white border-b border-amber-500/20 px-4 py-2.5 shadow-lg flex items-center justify-between"
      >
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-medium text-amber-200">Preview Mode:</span>
          <span className="text-stone-300 hidden sm:inline">
            {wedding.published ? 'Published Invitation' : 'Draft — not yet published'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isOwner && (
            <Link
              href={`/editor/${wedding.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-700 hover:bg-amber-600 text-white text-xs font-medium rounded-lg transition-colors shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Back to Editor</span>
            </Link>
          )}

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-stone-300 hover:text-white text-xs font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </div>
      </aside>

      {/* Main Invitation */}
      <main className="pt-10">
        <PublishedWeddingPage wedding={weddingData} />
      </main>
    </div>
  )
}
