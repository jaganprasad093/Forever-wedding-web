import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { WeddingData } from '@/types/wedding'
import PublishedWeddingPage from '@/components/wedding/PublishedWeddingPage'

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
    return { title: 'Wedding Invitation | ForeverVows' }
  }

  const coupleName = [wedding.groom_name, wedding.bride_name].filter(Boolean).join(' & ')
  const galleryItems = ((wedding as any).gallery || []) as { url: string; is_cover: boolean }[]
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
  } catch {}
  try {
    await supabase.from('analytics').insert({
      wedding_id: wedding.id,
      event_type: 'view',
    })
  } catch {}

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
    events: (((wedding as any).events || []) as any[])
      .sort((a: any, b: any) => ((a.order_index as number) || 0) - ((b.order_index as number) || 0))
      .map((e: any) => ({
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
    gallery: (((wedding as any).gallery || []) as any[])
      .sort((a: any, b: any) => ((a.order_index as number) || 0) - ((b.order_index as number) || 0))
      .map((g: any) => ({
        id: g.id as string,
        weddingId: g.wedding_id as string,
        url: g.url as string,
        path: g.path as string,
        isCover: g.is_cover as boolean,
        orderIndex: (g.order_index as number) || 0,
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

  return <PublishedWeddingPage wedding={weddingData} />
}
