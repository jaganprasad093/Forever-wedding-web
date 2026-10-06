import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import WeddingEditor from '@/components/editor/WeddingEditor'
import { WeddingData } from '@/types/wedding'

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
    events: (((wedding as any).events || []) as any[]).map((e: any) => ({
      id: e.id as string,
      weddingId: e.wedding_id as string,
      title: e.title as string,
      date: e.date as string | null,
      time: e.time as string | null,
      venue: e.venue as string | null,
      address: e.address as string | null,
      mapsUrl: e.maps_url as string | null,
      orderIndex: e.order_index as number,
    })),
    gallery: (((wedding as any).gallery || []) as any[]).map((g: any) => ({
      id: g.id as string,
      weddingId: g.wedding_id as string,
      url: g.url as string,
      path: g.path as string,
      isCover: g.is_cover as boolean,
      orderIndex: g.order_index as number,
    })),
    music: (wedding as any).music?.[0]
      ? {
          id: (wedding as any).music[0].id as string,
          weddingId: (wedding as any).music[0].wedding_id as string,
          title: (wedding as any).music[0].title as string,
          artist: (wedding as any).music[0].artist as string | null,
          url: (wedding as any).music[0].url as string,
          path: (wedding as any).music[0].path as string | null,
          type: (wedding as any).music[0].type as 'upload' | 'preset',
        }
      : null,
  }

  return <WeddingEditor initialWedding={weddingData} />
}
