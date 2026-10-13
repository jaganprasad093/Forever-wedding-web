'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Heart,
  ChevronLeft,
  Eye,
  Pencil,
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
  AlertCircle,
  type LucideIcon,
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

type EditorPanel = 'couple' | 'story' | 'events' | 'gallery' | 'music' | 'theme'
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'
type DeviceMode = 'mobile' | 'tablet' | 'desktop'

const editorPanels: { id: EditorPanel; label: string; icon: LucideIcon }[] = [
  { id: 'couple', label: 'Couple', icon: User2 },
  { id: 'story', label: 'Story', icon: BookOpen },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'gallery', label: 'Gallery', icon: Images },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'theme', label: 'Theme', icon: Palette },
]

const devices: { id: DeviceMode; label: string; icon: LucideIcon; width: number | null }[] = [
  { id: 'mobile', label: 'Mobile', icon: Smartphone, width: 390 },
  { id: 'tablet', label: 'Tablet', icon: Tablet, width: 820 },
  { id: 'desktop', label: 'Desktop', icon: Monitor, width: null },
]

const SAVE_DELAY_MS = 1200

function slugify(value: string | null | undefined, fallback: string) {
  const s = (value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
  return s || fallback
}

interface WeddingEditorProps {
  initialWedding: WeddingData
}

export default function WeddingEditor({ initialWedding }: WeddingEditorProps) {
  const router = useRouter()
  const [wedding, setWedding] = useState<WeddingData>(initialWedding)
  const [activePanel, setActivePanel] = useState<EditorPanel>('couple')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)
  // On small screens this switches between "edit" and "preview" views
  const [previewMode, setPreviewMode] = useState(false)
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('mobile')

  // Always holds the newest data so debounced saves never use stale state
  const latestRef = useRef<WeddingData>(initialWedding)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dirtyRef = useRef(false)

  const saveChanges = useCallback(async (data: WeddingData) => {
    dirtyRef.current = false
    setSaveStatus('saving')
    const supabase = createClient()
    const { error } = await supabase
      .from('weddings')
      .update({
        bride_name: data.brideName,
        groom_name: data.groomName,
        wedding_date: data.weddingDate,
        wedding_time: data.weddingTime,
        venue_name: data.venueName,
        venue_address: data.venueAddress,
        venue_maps_url: data.venueMapsUrl,
        story: data.story,
        theme: data.theme as unknown as Json,
        slug: data.slug,
        template_id: data.templateId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.id)

    if (error) {
      dirtyRef.current = true
      setSaveStatus('error')
      return
    }
    setSaveStatus('saved')
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    savedTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2000)
  }, [])

  const updateWedding = useCallback(
    (updates: Partial<WeddingData>) => {
      latestRef.current = { ...latestRef.current, ...updates }
      setWedding(latestRef.current)
      dirtyRef.current = true

      // Proper debounce: only the last edit within the window triggers a save
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => saveChanges(latestRef.current), SAVE_DELAY_MS)
    },
    [saveChanges]
  )

  // Flush any pending edit when leaving the editor, and warn on tab close
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
      if (dirtyRef.current) void saveChanges(latestRef.current)
    }
  }, [saveChanges])

  const handlePublish = async () => {
    setPublishing(true)
    setPublishError(null)

    // Make sure the latest edits are stored before publishing
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    if (dirtyRef.current) await saveChanges(latestRef.current)

    const current = latestRef.current
    let slug = current.slug
    if (!slug || slug.includes(current.templateId)) {
      const bride = slugify(current.brideName, 'bride')
      const groom = slugify(current.groomName, 'groom')
      slug = `${groom}-${bride}`
    }

    const supabase = createClient()
    const { error } = await supabase
      .from('weddings')
      .update({
        published: true,
        published_at: new Date().toISOString(),
        slug,
      })
      .eq('id', current.id)

    if (error) {
      setPublishError(
        error.code === '23505'
          ? 'That link is already taken. Change your names or the slug and try again.'
          : 'Could not publish. Please try again.'
      )
    } else {
      latestRef.current = { ...current, published: true, slug }
      setWedding(latestRef.current)
      router.refresh()
    }
    setPublishing(false)
  }

  const handleUnpublish = async () => {
    if (!window.confirm('Unpublish this invitation? Guests will no longer be able to open the link.')) {
      return
    }
    const supabase = createClient()
    const { error } = await supabase
      .from('weddings')
      .update({ published: false })
      .eq('id', latestRef.current.id)
    if (error) {
      setPublishError('Could not unpublish. Please try again.')
      return
    }
    latestRef.current = { ...latestRef.current, published: false }
    setWedding(latestRef.current)
    router.refresh()
  }

  const coupleName =
    [wedding.groomName, wedding.brideName].filter(Boolean).join(' & ') || 'Your Invitation'
  const activeLabel = editorPanels.find((p) => p.id === activePanel)?.label
  const activeDevice = devices.find((d) => d.id === deviceMode)!

  return (
    <div className="h-dvh flex flex-col bg-[#faf8f5] overflow-hidden text-stone-900">
      {/* ── Top bar ── */}
      <header className="h-14 bg-white/95 backdrop-blur border-b border-stone-200 flex items-center justify-between gap-2 px-3 sm:px-4 z-30 shrink-0">
        {/* Left: back + title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <Link
            href="/dashboard"
            aria-label="Back to dashboard"
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-500 hover:text-stone-800 shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#8c6b48] to-[#6c4f31] flex items-center justify-center shrink-0 shadow-sm">
              <Heart className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <div className="min-w-0">
              <p className="font-serif text-base font-semibold text-stone-800 truncate leading-tight">
                {coupleName}
              </p>
              <p className="text-[10px] text-stone-400 leading-none hidden sm:block">
                {wedding.published ? 'Published' : 'Draft'}
              </p>
            </div>
          </div>
        </div>

        {/* Center: save status */}
        <div
          className="flex items-center justify-center min-w-[2rem] sm:min-w-[5.5rem] text-xs"
          role="status"
          aria-live="polite"
        >
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1.5 text-stone-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="hidden sm:inline">Saving…</span>
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1.5 text-emerald-600">
              <Check className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Saved</span>
            </span>
          )}
          {saveStatus === 'error' && (
            <button
              onClick={() => saveChanges(latestRef.current)}
              className="flex items-center gap-1.5 text-red-600 hover:text-red-700"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Save failed · Retry</span>
            </button>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 flex-1">
          {/* Edit / Preview switch — only needed below lg, where only one pane fits */}
          <button
            onClick={() => setPreviewMode((p) => !p)}
            className={cn(
              'lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              previewMode ? 'bg-amber-100 text-amber-800' : 'text-stone-600 hover:bg-stone-100'
            )}
            aria-pressed={previewMode}
          >
            {previewMode ? <Pencil className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="hidden sm:inline">{previewMode ? 'Edit' : 'Preview'}</span>
          </button>

          {wedding.published ? (
            <>
              <Link
                href={`/w/${wedding.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">Live</span>
              </Link>
              <button
                onClick={handleUnpublish}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <Lock className="w-4 h-4" />
                <span className="hidden md:inline">Unpublish</span>
              </button>
            </>
          ) : (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="flex items-center gap-1.5 bg-gradient-to-r from-[#8c6b48] to-[#795938] hover:from-[#7e5f3e] hover:to-[#6c4f31] text-white px-3 sm:px-4 py-1.5 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {publishing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Globe className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{publishing ? 'Publishing…' : 'Publish'}</span>
            </button>
          )}
        </div>
      </header>

      {publishError && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 bg-red-50 border-b border-red-200 px-4 py-2 text-xs text-red-700"
        >
          <span className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {publishError}
          </span>
          <button onClick={() => setPublishError(null)} className="font-medium hover:underline shrink-0">
            Dismiss
          </button>
        </div>
      )}

      {/* ── Body ── */}
      <div className="flex-1 flex min-h-0">
        {/* Icon rail — desktop */}
        <nav
          aria-label="Editor sections"
          className="hidden lg:flex flex-col w-[72px] bg-white border-r border-stone-200 py-3 gap-1 items-center shrink-0"
        >
          {editorPanels.map((panel) => {
            const Icon = panel.icon
            const active = activePanel === panel.id
            return (
              <button
                key={panel.id}
                onClick={() => setActivePanel(panel.id)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex flex-col items-center gap-1 py-2 rounded-xl w-14 transition-colors',
                  active
                    ? 'bg-[#f7f2ea] text-[#704e2e]'
                    : 'text-stone-400 hover:text-stone-700 hover:bg-stone-50'
                )}
                title={panel.label}
              >
                {active && (
                  <span className="absolute -left-[9px] top-2 bottom-2 w-1 bg-[#8c6b48] rounded-r-full" />
                )}
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{panel.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Editing panel */}
        <section
          className={cn(
            'bg-white border-r border-stone-200 min-h-0 flex-col shrink-0',
            'w-full lg:w-80 xl:w-96',
            previewMode ? 'hidden lg:flex' : 'flex'
          )}
        >
          {/* Mobile / tablet section tabs */}
          <div className="lg:hidden border-b border-stone-100 px-3 py-2.5 shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
              {editorPanels.map((panel) => {
                const Icon = panel.icon
                const active = activePanel === panel.id
                return (
                  <button
                    key={panel.id}
                    onClick={() => setActivePanel(panel.id)}
                    aria-pressed={active}
                    className={cn(
                      'shrink-0 flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-full transition-colors',
                      active
                        ? 'bg-[#8c6b48] text-white shadow-sm'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {panel.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="p-4 sm:p-5 max-w-2xl mx-auto lg:max-w-none">
              <div className="hidden lg:flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
                <h2 className="font-serif text-lg font-semibold text-stone-800">{activeLabel}</h2>
              </div>

              {activePanel === 'couple' && (
                <CoupleDetailsPanel wedding={wedding} onUpdate={updateWedding} />
              )}
              {activePanel === 'story' && <StoryPanel wedding={wedding} onUpdate={updateWedding} />}
              {activePanel === 'events' && <EventsPanel weddingId={wedding.id} />}
              {activePanel === 'gallery' && <GalleryPanel weddingId={wedding.id} />}
              {activePanel === 'music' && (
                <MusicPanel weddingId={wedding.id} onUpdate={updateWedding} />
              )}
              {activePanel === 'theme' && <ThemePanel wedding={wedding} onUpdate={updateWedding} />}
            </div>
          </div>
        </section>

        {/* Live preview (view only) */}
        <section
          aria-label="Live preview"
          className={cn(
            'flex-1 min-w-0 min-h-0 flex-col bg-stone-100/80',
            previewMode ? 'flex' : 'hidden lg:flex'
          )}
        >
          {/* Preview toolbar */}
          <div className="h-12 bg-white border-b border-stone-200/80 px-3 sm:px-4 flex items-center justify-between gap-3 shrink-0">
            <div
              role="group"
              aria-label="Preview width"
              className="flex items-center gap-0.5 bg-stone-100 p-0.5 rounded-lg"
            >
              {devices.map((d) => {
                const Icon = d.icon
                const active = deviceMode === d.id
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDeviceMode(d.id)}
                    aria-pressed={active}
                    title={d.width ? `${d.label} (${d.width}px)` : `${d.label} (full width)`}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                      active
                        ? 'bg-white text-stone-900 shadow-sm font-semibold'
                        : 'text-stone-500 hover:text-stone-800'
                    )}
                  >
                    <Icon className={cn('w-3.5 h-3.5', active && 'text-[#8c6b48]')} />
                    <span className="hidden sm:inline">{d.label}</span>
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-3 min-w-0">
              <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200/80 text-[11px] font-mono text-stone-500">
                {activeDevice.width ? `${activeDevice.width}px` : 'Full width'}
              </span>
              {wedding.published && wedding.slug ? (
                <Link
                  href={`/w/${wedding.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-[#8c6b48] hover:text-[#6c4f31] font-medium hover:underline whitespace-nowrap"
                >
                  <span>Open full page</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              ) : (
                <span className="text-[11px] text-stone-400 whitespace-nowrap">Preview only</span>
              )}
            </div>
          </div>

          {/* Preview canvas — plain frame, no device mockups */}
          <div className="flex-1 min-h-0 overflow-hidden p-3 sm:p-5">
            <div
              className="mx-auto h-full w-full rounded-xl sm:rounded-2xl border border-stone-200 bg-white shadow-xl shadow-stone-900/5 overflow-hidden transition-[max-width] duration-300 ease-out"
              style={{ maxWidth: activeDevice.width ? `${activeDevice.width}px` : '100%' }}
            >
              <div className="relative h-full w-full bg-stone-50">
                <WeddingPreviewFrame wedding={wedding} />
              </div>
              
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}