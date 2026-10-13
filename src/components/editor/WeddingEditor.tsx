'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Heart,
  ChevronLeft,
  Eye,
  Globe,
  Check,
  Loader2,
  User2,
  Calendar,
  BookOpen,
  Images,
  Music,
  Palette,
  Lock,
  Smartphone,
  Tablet,
  Monitor,
  ExternalLink,
} from 'lucide-react'
import { WeddingData } from '@/types/wedding'
import { Json } from '@/types/supabase'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import CoupleDetailsPanel from './panels/CoupleDetailsPanel'
import EventsPanel from './panels/EventsPanel'
import GalleryPanel from './panels/GalleryPanel'
import MusicPanel from './panels/MusicPanel'
import ThemePanel from './panels/ThemePanel'
import StoryPanel from './panels/StoryPanel'
import WeddingPreviewFrame from './WeddingPreviewFrame'

type EditorPanel =
  | 'couple'
  | 'date-venue'
  | 'story'
  | 'events'
  | 'gallery'
  | 'music'
  | 'theme'

const editorPanels = [
  { id: 'couple' as EditorPanel, label: 'Couple', icon: User2 },
  { id: 'story' as EditorPanel, label: 'Story', icon: BookOpen },
  { id: 'events' as EditorPanel, label: 'Events', icon: Calendar },
  { id: 'gallery' as EditorPanel, label: 'Gallery', icon: Images },
  { id: 'music' as EditorPanel, label: 'Music', icon: Music },
  { id: 'theme' as EditorPanel, label: 'Theme', icon: Palette },
]

interface WeddingEditorProps {
  initialWedding: WeddingData
}

export default function WeddingEditor({ initialWedding }: WeddingEditorProps) {
  const router = useRouter()
  const [wedding, setWedding] = useState<WeddingData>(initialWedding)
  const [activePanel, setActivePanel] = useState<EditorPanel>('couple')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [publishing, setPublishing] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile')

  // Auto-save debounce
  const saveChanges = useCallback(
    async (updatedWedding: WeddingData) => {
      setSaveStatus('saving')
      const supabase = createClient()
      const { error } = await supabase
        .from('weddings')
        .update({
          bride_name: updatedWedding.brideName,
          groom_name: updatedWedding.groomName,
          wedding_date: updatedWedding.weddingDate,
          wedding_time: updatedWedding.weddingTime,
          venue_name: updatedWedding.venueName,
          venue_address: updatedWedding.venueAddress,
          venue_maps_url: updatedWedding.venueMapsUrl,
          story: updatedWedding.story,
          theme: updatedWedding.theme as unknown as Json,
          slug: updatedWedding.slug,
          template_id: updatedWedding.templateId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', updatedWedding.id)

      if (error) {
        setSaveStatus('error')
      } else {
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      }
    },
    []
  )

  const updateWedding = useCallback(
    (updates: Partial<WeddingData>) => {
      const updated = { ...wedding, ...updates }
      setWedding(updated)
      // Debounced save
      const timer = setTimeout(() => saveChanges(updated), 1200)
      return () => clearTimeout(timer)
    },
    [wedding, saveChanges]
  )

  const handlePublish = async () => {
    setPublishing(true)
    const supabase = createClient()

    // Generate a clean slug if not set
    let slug = wedding.slug
    if (!slug || slug.includes(wedding.templateId)) {
      const bride = wedding.brideName?.toLowerCase().replace(/\s+/g, '-') || 'bride'
      const groom = wedding.groomName?.toLowerCase().replace(/\s+/g, '-') || 'groom'
      slug = `${groom}-${bride}`
    }

    const { error } = await supabase
      .from('weddings')
      .update({
        published: true,
        published_at: new Date().toISOString(),
        slug,
      })
      .eq('id', wedding.id)

    if (!error) {
      setWedding((prev) => ({ ...prev, published: true, slug }))
      router.refresh()
    }
    setPublishing(false)
  }

  const handleUnpublish = async () => {
    const supabase = createClient()
    await supabase.from('weddings').update({ published: false }).eq('id', wedding.id)
    setWedding((prev) => ({ ...prev, published: false }))
    router.refresh()
  }

  const coupleName = [wedding.groomName, wedding.brideName].filter(Boolean).join(' & ') || 'Your Invitation'

  return (
    <div className="h-screen flex flex-col bg-stone-100 overflow-hidden">
      {/* Editor top bar */}
      <div className="h-14 bg-white border-b border-stone-200 flex items-center justify-between px-4 z-30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-500">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-gold rounded-full flex items-center justify-center">
              <Heart className="w-3 h-3 text-white fill-white" />
            </div>
            <span className="font-serif text-base font-semibold text-stone-800 hidden sm:block">
              {coupleName}
            </span>
          </div>
        </div>

        {/* Save status */}
        <div className="flex items-center gap-2 text-sm">
          {saveStatus === 'saving' && (
            <div className="flex items-center gap-1.5 text-stone-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="text-xs hidden sm:block">Saving...</span>
            </div>
          )}
          {saveStatus === 'saved' && (
            <div className="flex items-center gap-1.5 text-green-600">
              <Check className="w-3.5 h-3.5" />
              <span className="text-xs hidden sm:block">Saved</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <span className="text-xs text-red-600">Save failed</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              previewMode
                ? 'bg-amber-100 text-amber-700'
                : 'text-stone-600 hover:bg-stone-100'
            )}
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:block">Preview</span>
          </button>

          {wedding.published ? (
            <div className="flex items-center gap-2">
              <Link
                href={`/w/${wedding.slug}`}
                target="_blank"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:block">Live</span>
              </Link>
              <button
                onClick={handleUnpublish}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <Lock className="w-4 h-4" />
                <span className="hidden sm:block">Unpublish</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="flex items-center gap-1.5 bg-gradient-gold text-white px-4 py-1.5 rounded-lg text-sm font-medium shadow-gold hover:shadow-lg transition-all disabled:opacity-70"
            >
              {publishing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Globe className="w-4 h-4" />
              )}
              <span className="hidden sm:block">
                {publishing ? 'Publishing...' : 'Publish'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Editor body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel nav — desktop */}
        <div className="hidden lg:flex flex-col w-16 bg-white border-r border-stone-200 py-3 gap-1 items-center">
          {editorPanels.map((panel) => {
            const Icon = panel.icon
            return (
              <button
                key={panel.id}
                onClick={() => setActivePanel(panel.id)}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-xl w-12 transition-all',
                  activePanel === panel.id
                    ? 'bg-amber-50 text-amber-700'
                    : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
                )}
                title={panel.label}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{panel.label}</span>
              </button>
            )
          })}
        </div>

        {/* Left panel content */}
        <div className={cn(
          'bg-white border-r border-stone-200 overflow-y-auto flex-shrink-0 transition-all duration-300',
          previewMode ? 'w-0 overflow-hidden' : 'w-full lg:w-72 xl:w-80'
        )}>
          <div className="p-4">
            {/* Mobile panel tabs */}
            <div className="lg:hidden flex items-center gap-1 mb-4 overflow-x-auto no-scrollbar pb-1">
              {editorPanels.map((panel) => (
                <button
                  key={panel.id}
                  onClick={() => setActivePanel(panel.id)}
                  className={cn(
                    'flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-all',
                    activePanel === panel.id
                      ? 'bg-amber-700 text-white'
                      : 'bg-stone-100 text-stone-600'
                  )}
                >
                  {panel.label}
                </button>
              ))}
            </div>

            {/* Active panel */}
            <div className="hidden lg:block mb-3">
              <h3 className="font-semibold text-stone-800 text-sm">
                {editorPanels.find((p) => p.id === activePanel)?.label}
              </h3>
            </div>

            {activePanel === 'couple' && (
              <CoupleDetailsPanel wedding={wedding} onUpdate={updateWedding} />
            )}
            {activePanel === 'story' && (
              <StoryPanel wedding={wedding} onUpdate={updateWedding} />
            )}
            {activePanel === 'events' && (
              <EventsPanel weddingId={wedding.id} />
            )}
            {activePanel === 'gallery' && (
              <GalleryPanel weddingId={wedding.id} />
            )}
            {activePanel === 'music' && (
              <MusicPanel weddingId={wedding.id} onUpdate={updateWedding} />
            )}
            {activePanel === 'theme' && (
              <ThemePanel wedding={wedding} onUpdate={updateWedding} />
            )}
          </div>
        </div>

        {/* Preview Container */}
        <div
          className={cn(
            'flex-1 flex flex-col overflow-hidden bg-stone-100',
            !previewMode ? 'hidden lg:flex' : 'flex'
          )}
        >
          {/* Preview Controls Bar */}
          <div className="h-10 bg-white/90 backdrop-blur border-b border-stone-200/80 px-4 flex items-center justify-between flex-shrink-0 z-20">
            <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg text-stone-600">
              <button
                type="button"
                onClick={() => setDeviceMode('mobile')}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                  deviceMode === 'mobile'
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                )}
                title="Mobile View (390px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode('tablet')}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                  deviceMode === 'tablet'
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                )}
                title="Tablet View (768px)"
              >
                <Tablet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tablet</span>
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode('desktop')}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                  deviceMode === 'desktop'
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                )}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-stone-400 font-medium hidden sm:inline">
                Selected Template Preview
              </span>
              {wedding.slug && (
                <Link
                  href={`/w/${wedding.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-amber-700 hover:text-amber-800 font-medium hover:underline"
                >
                  <span>Open Full Page</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>

          {/* Preview Frame */}
          <div className="flex-1 overflow-hidden p-3 sm:p-5 flex items-center justify-center bg-stone-100/70">
            {deviceMode === 'mobile' ? (
              /* Mobile Phone Mockup */
              <div className="w-[390px] max-w-full h-[780px] max-h-full rounded-[2.85rem] border-[10px] border-stone-900 bg-stone-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden transition-all duration-300 ring-1 ring-white/10 shrink-0">
                {/* Dynamic Island / Notch */}
                <div className="w-full pt-2 pb-1.5 flex justify-center items-center bg-stone-950 shrink-0 select-none">
                  <div className="w-24 h-4 bg-stone-900 rounded-full flex items-center justify-center gap-2 px-2 shadow-inner">
                    <div className="w-2 h-2 rounded-full bg-stone-800" />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-950/60" />
                  </div>
                </div>

                {/* Inner Phone Screen */}
                <div className="flex-1 w-full overflow-hidden bg-stone-900 relative">
                  <WeddingPreviewFrame wedding={wedding} />
                </div>

                {/* Home Indicator */}
                <div className="w-full py-1.5 flex justify-center items-center bg-stone-950 shrink-0 select-none">
                  <div className="w-32 h-1 bg-stone-700 rounded-full" />
                </div>
              </div>
            ) : deviceMode === 'tablet' ? (
              /* Tablet Mockup */
              <div className="w-[768px] max-w-full h-full max-h-[820px] rounded-3xl border-[8px] border-stone-800 bg-stone-900 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ring-1 ring-white/10 shrink-0">
                <div className="w-full py-1.5 flex justify-center items-center bg-stone-800 shrink-0 select-none">
                  <div className="w-2 h-2 rounded-full bg-stone-700" />
                </div>
                <div className="flex-1 w-full overflow-hidden bg-stone-900 relative">
                  <WeddingPreviewFrame wedding={wedding} />
                </div>
              </div>
            ) : (
              /* Desktop Browser Window Mockup */
              <div className="w-full max-w-5xl h-full max-h-[840px] rounded-2xl border border-stone-200/90 bg-white shadow-2xl flex flex-col overflow-hidden transition-all duration-300">
                {/* Browser Header Bar */}
                <div className="h-9 bg-stone-100 border-b border-stone-200/80 px-4 flex items-center gap-3 shrink-0 select-none">
                  {/* Traffic lights */}
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] border border-[#1aab29]" />
                  </div>
                  {/* Address bar */}
                  <div className="flex-1 max-w-sm mx-auto bg-white border border-stone-200 rounded-md py-0.5 px-3 text-[11px] text-stone-500 font-mono flex items-center justify-center gap-1 truncate shadow-2xs">
                    <span className="text-stone-300">https://</span>
                    <span className="text-stone-700 font-medium">forevervows.com/w/{wedding.slug || 'invitation'}</span>
                  </div>
                </div>
                {/* Browser Viewport */}
                <div className="flex-1 w-full overflow-hidden bg-stone-900 relative">
                  <WeddingPreviewFrame wedding={wedding} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
