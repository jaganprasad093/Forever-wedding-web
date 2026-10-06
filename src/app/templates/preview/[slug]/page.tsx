import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Heart, Sparkles } from 'lucide-react'
import { getTemplateBySlug, TEMPLATES } from '@/data/templates'
import PublishedWeddingPage from '@/components/wedding/PublishedWeddingPage'
import { WeddingData, WeddingTheme } from '@/types/wedding'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return TEMPLATES.map((t) => ({
    slug: t.slug,
  }))
}

export default async function TemplatePreviewPage({ params }: Props) {
  const { slug } = await params
  const template = getTemplateBySlug(slug)

  if (!template) {
    notFound()
  }

  const defaultTheme = (template.config as { defaultTheme?: WeddingTheme })?.defaultTheme || {
    primaryColor: '#92400e',
    secondaryColor: '#b45309',
    backgroundColor: '#fffbeb',
    accentColor: '#fcd34d',
    fontFamily: 'cormorant',
  }

  const sampleWedding: WeddingData = {
    id: `demo-${template.id}`,
    userId: 'demo-user',
    templateId: template.id,
    slug: template.slug,
    brideName: 'Anu',
    groomName: 'Jagan',
    weddingDate: '2026-12-12',
    weddingTime: '10:30',
    venueName: 'The Grand Palace Pavilion',
    venueAddress: 'Kovalam Beach Road, Thiruvananthapuram, Kerala 695527',
    venueMapsUrl: 'https://maps.google.com',
    story:
      'We first crossed paths on a sunny afternoon in Cochin. What began with a shared cup of spiced chai turned into midnight conversations about art, dreams, and our deep love for coastal sunsets. Five years of laughter, travels, and countless memories later, we are overjoyed to embark on forever together.',
    theme: defaultTheme,
    published: true,
    publishedAt: new Date().toISOString(),
    views: 1248,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    events: [
      {
        id: 'event-1',
        weddingId: `demo-${template.id}`,
        title: 'Traditional Muhurtham Ceremony',
        date: '2026-12-12',
        time: '10:30 AM',
        venue: 'Main Temple Hall',
        address: 'Kovalam Beach Road, Thiruvananthapuram',
        mapsUrl: 'https://maps.google.com',
        orderIndex: 0,
      },
      {
        id: 'event-2',
        weddingId: `demo-${template.id}`,
        title: 'Sadhya & Grand Feast',
        date: '2026-12-12',
        time: '01:00 PM',
        venue: 'Lotus Dining Pavilion',
        address: 'Kovalam Beach Road, Thiruvananthapuram',
        mapsUrl: 'https://maps.google.com',
        orderIndex: 1,
      },
      {
        id: 'event-3',
        weddingId: `demo-${template.id}`,
        title: 'Evening Sunset Reception & Music',
        date: '2026-12-12',
        time: '06:30 PM',
        venue: 'Grand Seaside Lawn',
        address: 'Kovalam Beach Road, Thiruvananthapuram',
        mapsUrl: 'https://maps.google.com',
        orderIndex: 2,
      },
    ],
    gallery: [
      {
        id: 'g-1',
        weddingId: `demo-${template.id}`,
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
        path: 'demo/1.jpg',
        isCover: true,
        orderIndex: 0,
      },
      {
        id: 'g-2',
        weddingId: `demo-${template.id}`,
        url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&q=80',
        path: 'demo/2.jpg',
        isCover: false,
        orderIndex: 1,
      },
      {
        id: 'g-3',
        weddingId: `demo-${template.id}`,
        url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=80',
        path: 'demo/3.jpg',
        isCover: false,
        orderIndex: 2,
      },
      {
        id: 'g-4',
        weddingId: `demo-${template.id}`,
        url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&q=80',
        path: 'demo/4.jpg',
        isCover: false,
        orderIndex: 3,
      },
    ],
    music: {
      id: 'm-1',
      weddingId: `demo-${template.id}`,
      title: 'Romantic Strings & Sitar Melodies',
      artist: 'ForeverVows Classics',
      url: 'https://actions.google.com/sounds/v1/ambiences/soft_gentle_piano.ogg',
      path: null,
      type: 'preset',
    },
  }

  return (
    <div className="relative">
      {/* Top Demo Banner */}
      <header className="sticky top-0 z-50 bg-stone-900/90 backdrop-blur-md text-white border-b border-stone-800 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Link
            href="/templates"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-stone-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Templates</span>
          </Link>
          <span className="text-stone-600">|</span>
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Previewing:</span>
            <span className="text-white font-semibold">{template.name}</span>
          </div>
        </div>

        <Link
          href={`/register?template=${template.slug}`}
          className="flex items-center gap-2 bg-gradient-gold text-white text-xs sm:text-sm font-medium px-4 py-2 rounded-full shadow-gold hover:shadow-lg transition-transform hover:scale-105"
        >
          <Heart className="w-3.5 h-3.5 fill-white" />
          <span>Use This Template</span>
        </Link>
      </header>

      {/* Render the full live wedding page */}
      <PublishedWeddingPage wedding={sampleWedding} />
    </div>
  )
}
