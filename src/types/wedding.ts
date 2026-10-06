export interface WeddingTheme {
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  fontFamily: string
  accentColor: string
  preset?: string
}

export interface WeddingData {
  id: string
  userId: string
  templateId: string
  slug: string
  brideName: string | null
  groomName: string | null
  weddingDate: string | null
  weddingTime: string | null
  venueName: string | null
  venueAddress: string | null
  venueMapsUrl: string | null
  story: string | null
  theme: WeddingTheme
  published: boolean
  publishedAt: string | null
  views: number
  createdAt: string
  updatedAt: string
  // Relations
  events?: WeddingEvent[]
  gallery?: GalleryItem[]
  music?: MusicItem | null
  template?: Template
}

export interface WeddingEvent {
  id: string
  weddingId: string
  title: string
  date: string | null
  time: string | null
  venue: string | null
  address: string | null
  mapsUrl: string | null
  orderIndex: number
}

export interface GalleryItem {
  id: string
  weddingId: string
  url: string
  path: string
  isCover: boolean
  orderIndex: number
}

export interface MusicItem {
  id: string
  weddingId: string
  title: string
  artist: string | null
  url: string
  path: string | null
  type: 'upload' | 'preset'
}

export interface Template {
  id: string
  name: string
  slug: string
  category: TemplateCategory
  thumbnail: string
  description: string
  componentKey: string
  config: Record<string, unknown>
  active: boolean
}

export type TemplateCategory =
  | 'all'
  | 'minimal'
  | 'luxury'
  | 'floral'
  | 'traditional'
  | 'kerala'
  | 'modern'
  | 'royal'
  | 'elegant'

export interface RSVP {
  id: string
  weddingId: string
  guestName: string
  phone: string | null
  attending: boolean
  guestCount: number
  message: string | null
  createdAt: string
}

export interface Analytics {
  id: string
  weddingId: string
  eventType: 'view' | 'music_play' | 'rsvp'
  metadata: Record<string, unknown> | null
  createdAt: string
}

export interface ThemePreset {
  name: string
  label: string
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  accentColor: string
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    name: 'rose',
    label: 'Rose',
    primaryColor: '#e11d48',
    secondaryColor: '#f43f5e',
    backgroundColor: '#fff1f2',
    accentColor: '#fda4af',
  },
  {
    name: 'wine',
    label: 'Wine',
    primaryColor: '#7f1d1d',
    secondaryColor: '#991b1b',
    backgroundColor: '#fef2f2',
    accentColor: '#fca5a5',
  },
  {
    name: 'gold',
    label: 'Gold',
    primaryColor: '#92400e',
    secondaryColor: '#b45309',
    backgroundColor: '#fffbeb',
    accentColor: '#fcd34d',
  },
  {
    name: 'ivory',
    label: 'Ivory',
    primaryColor: '#78716c',
    secondaryColor: '#57534e',
    backgroundColor: '#fafaf9',
    accentColor: '#d4c5a9',
  },
  {
    name: 'sage',
    label: 'Sage',
    primaryColor: '#3f6212',
    secondaryColor: '#4d7c0f',
    backgroundColor: '#f7fee7',
    accentColor: '#a3e635',
  },
  {
    name: 'terracotta',
    label: 'Terracotta',
    primaryColor: '#9a3412',
    secondaryColor: '#c2410c',
    backgroundColor: '#fff7ed',
    accentColor: '#fdba74',
  },
  {
    name: 'midnight',
    label: 'Midnight',
    primaryColor: '#1e1b4b',
    secondaryColor: '#312e81',
    backgroundColor: '#eef2ff',
    accentColor: '#a5b4fc',
  },
]
