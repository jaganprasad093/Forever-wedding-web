import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import WeddingEditor from '@/components/editor/WeddingEditor'
import { WeddingData } from '@/types/wedding'
import { Database } from '@/types/supabase'

type DbEvent = Database['public']['Tables']['events']['Row']
type DbGallery = Database['public']['Tables']['gallery']['Row']
type DbMusic = Database['public']['Tables']['music']['Row']

export const dynamic = 'force-dynamic'

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: wedding } = await supabase
    .from('weddings')
    .select('*, events(*), gallery(*), music(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!wedding) notFound()

  const rawEvents = (wedding.events || []) as unknown as DbEvent[]
  const rawGallery = (wedding.gallery || []) as unknown as DbGallery[]
  const rawMusic = (wedding.music || []) as unknown as DbMusic[]
  const currentMusic = rawMusic[0]

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
    theme: ((wedding.theme as unknown) as WeddingData['theme']) || {
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
    events: rawEvents.map((e) => ({
      id: e.id,
      weddingId: e.wedding_id,
      title: e.title,
      date: e.date,
      time: e.time,
      venue: e.venue,
      address: e.address,
      mapsUrl: e.maps_url,
      orderIndex: e.order_index ?? 0,
    })),
    gallery: rawGallery.map((g) => ({
      id: g.id,
      weddingId: g.wedding_id,
      url: g.url,
      path: g.path,
      isCover: g.is_cover,
      orderIndex: g.order_index ?? 0,
    })),
    music: currentMusic
      ? {
          id: currentMusic.id,
          weddingId: currentMusic.wedding_id,
          title: currentMusic.title,
          artist: currentMusic.artist,
          url: currentMusic.url,
          path: currentMusic.path,
          type: currentMusic.type,
        }
      : null,
  }

  return <WeddingEditor initialWedding={weddingData} />
}
