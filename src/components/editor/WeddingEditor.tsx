'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Heart,
  ChevronLeft,
  Eye,
  Globe,
  Save,
  Check,
  Loader2,
  User2,
  Calendar,
  BookOpen,
  MapPin,
  Images,
  Music,
  Palette,
  Lock,
} from 'lucide-react'
import { WeddingData, WeddingTheme } from '@/types/wedding'
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
              <MusicPanel weddingId={wedding.id} />
            )}
            {activePanel === 'theme' && (
              <ThemePanel wedding={wedding} onUpdate={updateWedding} />
            )}
          </div>
        </div>

        {/* Preview */}
        <div className={cn(
          'flex-1 overflow-hidden bg-stone-100',
          !previewMode && 'hidden lg:block'
        )}>
          <div className="h-full flex items-start justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden my-4">
              <WeddingPreviewFrame wedding={wedding} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
