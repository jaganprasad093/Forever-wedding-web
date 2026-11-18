'use client'

import { useState, useEffect, useRef } from 'react'
import { Reorder, useDragControls } from 'framer-motion'
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  ImagePlus,
  X,
  Loader2,
  Calendar,
} from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { WeddingEvent, WeddingData } from '@/types/wedding'
import { Database } from '@/types/supabase'

type EventUpdatePayload = Database['public']['Tables']['events']['Update']

// ── Presets ───────────────────────────────────────────────────────────────────
const EVENT_PRESETS = [
  { label: 'Wedding Ceremony', icon: '💍' },
  { label: 'Reception',        icon: '🎉' },
  { label: 'Engagement',       icon: '💖' },
  { label: 'Mehendi',          icon: '🌿' },
  { label: 'Haldi',            icon: '🌼' },
  { label: 'Sangeet',          icon: '🎶' },
  { label: 'Muhurtham',        icon: '🪔' },
  { label: 'Sadya',            icon: '🍃' },
]

const inputClass =
  'w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg ' +
  'text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 ' +
  'focus:ring-amber-500/50 focus:border-amber-400 transition-all'

// ── Drag handle used inside Reorder.Item ─────────────────────────────────────
function DragHandle({ controls }: { controls: ReturnType<typeof useDragControls> }) {
  return (
    <div
      onPointerDown={(e) => {
        e.preventDefault()
        controls.start(e)
      }}
      className="cursor-grab active:cursor-grabbing touch-none p-1 text-stone-300 hover:text-amber-500 transition-colors"
      aria-label="Drag to reorder"
    >
      <GripVertical className="w-4 h-4" />
    </div>
  )
}

// ── Per-event image uploader ──────────────────────────────────────────────────
function EventImageUploader({
  weddingId,
  event,
  onUploaded,
  onRemoved,
}: {
  weddingId: string
  event: WeddingEvent
  onUploaded: (url: string, path: string) => void
  onRemoved: () => void
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setUploading(true)
    setError(null)
    const supabase = createClient()
    const ext  = file.name.split('.').pop() ?? 'jpg'
    const path = `${weddingId}/events/${event.id}-${Date.now()}.${ext}`

    const { error: upErr } = await supabase.storage
      .from('wedding-images')
      .upload(path, file, { upsert: true })

    if (upErr) {
      setError('Upload failed — please try again.')
      setUploading(false)
      return
    }

    // Remove old image from storage
    if (event.imagePath && event.imagePath !== path) {
      await supabase.storage.from('wedding-images').remove([event.imagePath])
    }

    const { data: urlData } = supabase.storage.from('wedding-images').getPublicUrl(path)
    onUploaded(urlData.publicUrl, path)
    setUploading(false)
  }

  async function handleRemove() {
    if (!event.imagePath) return
    const supabase = createClient()
    await supabase.storage.from('wedding-images').remove([event.imagePath])
    onRemoved()
  }

  if (event.imageUrl) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-stone-200 group">
        <Image
          src={event.imageUrl}
          alt={event.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 400px"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 text-xs font-medium bg-white/90 text-stone-800 px-3 py-1.5 rounded-full hover:bg-white transition-colors shadow"
          >
            <ImagePlus className="w-3.5 h-3.5" />
            Replace
          </button>
          <button
            type="button"
            onClick={handleRemove}
            className="flex items-center gap-1.5 text-xs font-medium bg-red-500/90 text-white px-3 py-1.5 rounded-full hover:bg-red-500 transition-colors shadow"
          >
            <X className="w-3.5 h-3.5" />
            Remove
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="w-full flex flex-col items-center justify-center gap-1.5 py-5 border-2 border-dashed border-stone-200 rounded-xl text-stone-400 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50/40 transition-all disabled:opacity-60"
      >
        {uploading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs">Uploading…</span>
          </>
        ) : (
          <>
            <ImagePlus className="w-5 h-5" />
            <span className="text-xs font-medium">Add event photo</span>
            <span className="text-[10px] text-stone-400">JPG · PNG · WEBP · max 5 MB</span>
          </>
        )}
      </button>
      {error && <p className="mt-1 text-[10px] text-red-500">{error}</p>}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) void handleFile(f)
          e.target.value = ''
        }}
      />
    </div>
  )
}

// ── Single draggable event card ───────────────────────────────────────────────
function EventCard({
  event,
  weddingId,
  expandedId,
  onToggle,
  onUpdate,
  onDelete,
  onImageUploaded,
  onImageRemoved,
}: {
  event: WeddingEvent
  weddingId: string
  expandedId: string | null
  onToggle: (id: string) => void
  onUpdate: (id: string, patch: Partial<WeddingEvent>) => void
  onDelete: (id: string) => void
  onImageUploaded: (id: string, url: string, path: string) => void
  onImageRemoved: (id: string) => void
}) {
  const controls = useDragControls()
  const isOpen   = expandedId === event.id

  return (
    <Reorder.Item
      value={event}
      dragListener={false}
      dragControls={controls}
      className="bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      style={{ listStyle: 'none' }}
    >
      {/* ── Card header ── */}
      <div
        className="flex items-center gap-2 px-3 py-3 cursor-pointer select-none group"
        onClick={() => onToggle(event.id)}
      >
        <DragHandle controls={controls} />

        {/* Thumbnail or calendar icon */}
        <div className="relative shrink-0 w-10 h-10 rounded-xl overflow-hidden bg-stone-100 flex items-center justify-center">
          {event.imageUrl ? (
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover"
              sizes="40px"
              unoptimized
            />
          ) : (
            <Calendar className="w-4.5 h-4.5 text-stone-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-stone-800 truncate">
            {event.title || 'Untitled'}
          </p>
          {event.date && (
            <p className="text-[11px] text-stone-400 mt-0.5">{event.date}</p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(event.id) }}
            className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-stone-300 transition-colors"
            aria-label="Delete event"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <div className="p-1.5 text-stone-300 group-hover:text-stone-500 transition-colors">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* ── Expanded fields ── */}
      {isOpen && (
        <div className="px-3.5 pb-4 pt-0 border-t border-stone-100 space-y-3">

          {/* Image */}
          <div className="pt-3">
            <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-widest mb-1.5">
              Event Photo <span className="font-normal normal-case text-stone-400">(optional)</span>
            </label>
            <EventImageUploader
              weddingId={weddingId}
              event={event}
              onUploaded={(url, path) => onImageUploaded(event.id, url, path)}
              onRemoved={() => onImageRemoved(event.id)}
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-widest mb-1.5">
              Event Name
            </label>
            <input
              value={event.title}
              onChange={(e) => onUpdate(event.id, { title: e.target.value })}
              placeholder="Event title"
              className={inputClass}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </div>

          {/* Date + Time */}
          <div>
            <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-widest mb-1.5">
              Date &amp; Time
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={event.date || ''}
                onChange={(e) => onUpdate(event.id, { date: e.target.value })}
                className={inputClass}
              />
              <input
                type="time"
                value={event.time || ''}
                onChange={(e) => onUpdate(event.id, { time: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-widest mb-1.5">
              Venue
            </label>
            <input
              value={event.venue || ''}
              onChange={(e) => onUpdate(event.id, { venue: e.target.value })}
              placeholder="Venue name"
              className={inputClass}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            <textarea
              value={event.address || ''}
              onChange={(e) => onUpdate(event.id, { address: e.target.value })}
              placeholder="Address"
              rows={2}
              className={inputClass + ' resize-none mt-2'}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            <input
              value={event.mapsUrl || ''}
              onChange={(e) => onUpdate(event.id, { mapsUrl: e.target.value })}
              placeholder="Google Maps URL"
              className={inputClass + ' mt-2'}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </div>
        </div>
      )}
    </Reorder.Item>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────
export default function EventsPanel({
  weddingId,
  initialEvents,
  initialTheme,
  onUpdate,
}: {
  weddingId: string
  initialEvents?: WeddingEvent[]
  /** Pass wedding.theme so we can read/write eventImages */
  initialTheme?: WeddingData['theme']
  onUpdate?: (updates: Partial<WeddingData>) => void
}) {
  const [events, setEvents]           = useState<WeddingEvent[]>(initialEvents || [])
  const [theme, setTheme]             = useState(initialTheme)
  const [loading, setLoading]         = useState(!initialEvents || initialEvents.length === 0)
  const [addingEvent, setAddingEvent] = useState(false)
  const [expandedId, setExpandedId]   = useState<string | null>(null)

  const onUpdateRef       = useRef(onUpdate)
  const themeRef          = useRef(theme)
  const eventsRef         = useRef(events)
  const pendingUpdatesRef = useRef<Record<string, Partial<WeddingEvent>>>({})
  const saveTimerRef      = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  useEffect(() => { onUpdateRef.current = onUpdate }, [onUpdate])
  useEffect(() => { themeRef.current = theme }, [theme])
  useEffect(() => { eventsRef.current = events }, [events])

  // ── Flush pending DB updates on unmount ─────────────────────────────────────
  useEffect(() => {
    return () => {
      const supabase = createClient()
      const entries = Object.entries(pendingUpdatesRef.current)
      if (entries.length > 0) {
        entries.forEach(([id, updates]) => {
          const dbPayload: EventUpdatePayload = {}
          if (updates.title !== undefined) dbPayload.title = updates.title
          if (updates.date !== undefined) dbPayload.date = updates.date
          if (updates.time !== undefined) dbPayload.time = updates.time
          if (updates.venue !== undefined) dbPayload.venue = updates.venue
          if (updates.address !== undefined) dbPayload.address = updates.address
          if (updates.mapsUrl !== undefined) dbPayload.maps_url = updates.mapsUrl
          if (Object.keys(dbPayload).length > 0) {
            void supabase.from('events').update(dbPayload).eq('id', id)
          }
        })
      }
      Object.values(saveTimerRef.current).forEach(clearTimeout)
    }
  }, [])

  // ── Merge eventImages from theme into events ────────────────────────────────
  function mergeImages(evts: WeddingEvent[], themeData?: WeddingData['theme']): WeddingEvent[] {
    const map = themeData?.eventImages ?? {}
    return evts.map((e) => ({
      ...e,
      imageUrl:  map[e.id]?.url  ?? null,
      imagePath: map[e.id]?.path ?? null,
    }))
  }

  // ── Load from DB ────────────────────────────────────────────────────────────
  useEffect(() => {
    let ignore = false
    async function fetchEvents() {
      const supabase = createClient()
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('order_index', { ascending: true })

      if (!ignore && data) {
        const mapped: WeddingEvent[] = data.map((e) => ({
          id:         e.id,
          weddingId:  e.wedding_id,
          title:      e.title,
          date:       e.date,
          time:       e.time,
          venue:      e.venue,
          address:    e.address,
          mapsUrl:    e.maps_url,
          orderIndex: e.order_index,
        }))
        const withImages = mergeImages(mapped, themeRef.current)
        eventsRef.current = withImages
        setEvents(withImages)
        onUpdateRef.current?.({ events: withImages })
        setLoading(false)
      }
    }
    void fetchEvents()
    return () => { ignore = true }
  }, [weddingId])

  // ── Publish combined update ─────────────────────────────────────────────────
  function publish(nextEvents: WeddingEvent[], nextTheme: WeddingData['theme']) {
    onUpdateRef.current?.({ events: nextEvents, theme: nextTheme })
  }

  // ── Add event ───────────────────────────────────────────────────────────────
  async function addEvent(title: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('events')
      .insert({ wedding_id: weddingId, title, order_index: eventsRef.current.length })
      .select()
      .single()

    if (data && !error) {
      const newEvent: WeddingEvent = {
        id: data.id, weddingId: data.wedding_id, title: data.title,
        date: data.date, time: data.time, venue: data.venue,
        address: data.address, mapsUrl: data.maps_url, orderIndex: data.order_index,
        imageUrl: null, imagePath: null,
      }
      const next = [...eventsRef.current, newEvent]
      eventsRef.current = next
      setEvents(next)
      publish(next, themeRef.current!)
      setExpandedId(data.id)
    }
    setAddingEvent(false)
  }

  // ── Debounced DB save for event updates ───────────────────────────────────────
  const scheduleDbSave = (id: string, patch: Partial<WeddingEvent>) => {
    pendingUpdatesRef.current[id] = {
      ...pendingUpdatesRef.current[id],
      ...patch,
    }

    if (saveTimerRef.current[id]) {
      clearTimeout(saveTimerRef.current[id])
    }

    saveTimerRef.current[id] = setTimeout(async () => {
      const updates = pendingUpdatesRef.current[id]
      delete pendingUpdatesRef.current[id]
      delete saveTimerRef.current[id]
      if (!updates) return

      const supabase = createClient()
      const dbPayload: EventUpdatePayload = {}
      if (updates.title !== undefined) dbPayload.title = updates.title
      if (updates.date !== undefined) dbPayload.date = updates.date
      if (updates.time !== undefined) dbPayload.time = updates.time
      if (updates.venue !== undefined) dbPayload.venue = updates.venue
      if (updates.address !== undefined) dbPayload.address = updates.address
      if (updates.mapsUrl !== undefined) dbPayload.maps_url = updates.mapsUrl

      if (Object.keys(dbPayload).length > 0) {
        await supabase.from('events').update(dbPayload).eq('id', id)
      }
    }, 600)
  }

  // ── Update event field (instant UI + debounced DB) ──────────────────────────
  function updateEvent(id: string, patch: Partial<WeddingEvent>) {
    // 1. Immediately update local state & preview without waiting for network
    const next = eventsRef.current.map((e) => (e.id === id ? { ...e, ...patch } : e))
    eventsRef.current = next
    setEvents(next)
    publish(next, themeRef.current!)

    // 2. Schedule debounced DB write
    scheduleDbSave(id, patch)
  }

  // ── Delete event ────────────────────────────────────────────────────────────
  async function deleteEvent(id: string) {
    if (saveTimerRef.current[id]) {
      clearTimeout(saveTimerRef.current[id])
      delete saveTimerRef.current[id]
    }
    delete pendingUpdatesRef.current[id]

    const next = eventsRef.current.filter((e) => e.id !== id)
    eventsRef.current = next
    setEvents(next)
    publish(next, themeRef.current!)
    if (expandedId === id) setExpandedId(null)

    const supabase = createClient()
    await supabase.from('events').delete().eq('id', id)
  }

  // ── Drag reorder ────────────────────────────────────────────────────────────
  async function handleReorder(next: WeddingEvent[]) {
    const reindexed = next.map((e, i) => ({ ...e, orderIndex: i }))
    eventsRef.current = reindexed
    setEvents(reindexed)
    publish(reindexed, themeRef.current!)

    // Persist new order_index values to DB
    const supabase = createClient()
    await Promise.all(
      reindexed.map((e) =>
        supabase.from('events').update({ order_index: e.orderIndex }).eq('id', e.id)
      )
    )
  }

  // ── Image uploaded for an event ─────────────────────────────────────────────
  function handleImageUploaded(id: string, url: string, path: string) {
    const nextImages = {
      ...(themeRef.current?.eventImages ?? {}),
      [id]: { url, path },
    }
    const nextTheme = { ...themeRef.current!, eventImages: nextImages }
    themeRef.current = nextTheme
    setTheme(nextTheme)

    const next = eventsRef.current.map((e) =>
      e.id === id ? { ...e, imageUrl: url, imagePath: path } : e
    )
    eventsRef.current = next
    setEvents(next)
    publish(next, nextTheme)
  }

  // ── Image removed ───────────────────────────────────────────────────────────
  function handleImageRemoved(id: string) {
    const nextImages = { ...(themeRef.current?.eventImages ?? {}) }
    delete nextImages[id]
    const nextTheme = { ...themeRef.current!, eventImages: nextImages }
    themeRef.current = nextTheme
    setTheme(nextTheme)

    const next = eventsRef.current.map((e) =>
      e.id === id ? { ...e, imageUrl: null, imagePath: null } : e
    )
    eventsRef.current = next
    setEvents(next)
    publish(next, nextTheme)
  }

  // ── Loading spinner ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Reorder hint */}
      {events.length > 1 && (
        <p className="flex items-center gap-1.5 text-[11px] text-stone-400 px-1">
          <GripVertical className="w-3.5 h-3.5" />
          Drag the grip to reorder events
        </p>
      )}

      {/* Draggable list */}
      <Reorder.Group
        axis="y"
        values={events}
        onReorder={handleReorder}
        className="space-y-3"
        style={{ listStyle: 'none', padding: 0, margin: 0 }}
      >
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            weddingId={weddingId}
            expandedId={expandedId}
            onToggle={(id) => setExpandedId(expandedId === id ? null : id)}
            onUpdate={updateEvent}
            onDelete={deleteEvent}
            onImageUploaded={handleImageUploaded}
            onImageRemoved={handleImageRemoved}
          />
        ))}
      </Reorder.Group>

      {/* Add event */}
      {addingEvent ? (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-xs font-semibold text-amber-900 mb-3">Choose event type:</p>
          <div className="grid grid-cols-2 gap-2">
            {EVENT_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => void addEvent(preset.label)}
                className="flex items-center gap-2 text-xs px-3 py-2.5 bg-white border border-amber-200/80 rounded-xl hover:bg-amber-50 hover:border-amber-300 text-stone-700 transition-all shadow-sm text-left"
              >
                <span className="text-base shrink-0">{preset.icon}</span>
                <span className="font-medium leading-tight">{preset.label}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setAddingEvent(false)}
            className="mt-3 text-xs text-stone-400 hover:text-stone-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAddingEvent(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-stone-200 rounded-2xl text-sm font-medium text-stone-400 hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50/40 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      )}
    </div>
  )
}
