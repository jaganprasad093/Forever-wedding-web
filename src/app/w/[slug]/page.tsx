import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MusicItem, WeddingData } from '@/types/wedding'
import PublishedWeddingPage from '@/components/wedding/PublishedWeddingPage'
import { Database } from '@/types/supabase'

type DbEvent = Database['public']['Tables']['events']['Row']
type DbGallery = Database['public']['Tables']['gallery']['Row']
type DbMusic = Database['public']['Tables']['music']['Row']

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('*, gallery(url, is_cover)')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!wedding) {
    return { title: 'Wedding Invitation | Wedora' }
  }

  const coupleName = [wedding.groom_name, wedding.bride_name].filter(Boolean).join(' & ')
  const galleryItems = ((wedding.gallery || []) as unknown) as Array<{ url: string; is_cover: boolean }>
  const coverPhoto = galleryItems.find((g) => g.is_cover) || galleryItems[0]

  return {
    title: `${coupleName} — Wedding Invitation`,
    description: wedding.venue_name
      ? `Join us for the wedding of ${coupleName} at ${wedding.venue_name}`
      : `You are invited to the wedding of ${coupleName}`,
    openGraph: {
      title: `${coupleName} — Wedding Invitation`,
      description: `You're invited! View the beautiful digital wedding invitation of ${coupleName}.`,
      images: coverPhoto ? [{ url: coverPhoto.url }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${coupleName} — Wedding Invitation`,
    },
  }
}

export default async function WeddingPublicPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('*, events(*), gallery(*), music(*)')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!wedding) notFound()

  // Track view
  try {
    await supabase.rpc('increment_views', { wedding_id: wedding.id })
  } catch { }
  try {
    await supabase.from('analytics').insert({
      wedding_id: wedding.id,
      event_type: 'view',
    })
  } catch { }

  const rawEvents = ((wedding.events || []) as unknown) as DbEvent[]
  const rawGallery = ((wedding.gallery || []) as unknown) as DbGallery[]
  const rawMusic = ((wedding.music || []) as unknown) as DbMusic[]
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
      rsvpEnabled: true,
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
        orderIndex: e.order_index ?? 0,
      })),
    gallery: rawGallery
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
      .map((g) => ({
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
        type: currentMusic.type as MusicItem['type'],
      }
      : null,
  }

  return <PublishedWeddingPage wedding={weddingData} />
}
