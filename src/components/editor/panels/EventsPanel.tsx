'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { WeddingEvent } from '@/types/wedding'

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.string().optional(),
  time: z.string().optional(),
  venue: z.string().optional(),
  address: z.string().optional(),
  maps_url: z.string().optional(),
})
type EventFormData = z.infer<typeof eventSchema>

const EVENT_PRESETS = [
  'Wedding Ceremony',
  'Reception',
  'Engagement',
  'Mehendi',
  'Haldi',
  'Sangeet',
  'Muhurtham',
  'Sadya',
]

export default function EventsPanel({ weddingId }: { weddingId: string }) {
  const [events, setEvents] = useState<WeddingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [addingEvent, setAddingEvent] = useState(false)
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null)

  useEffect(() => {
    loadEvents()
  }, [weddingId])

  const loadEvents = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('order_index', { ascending: true })
    
    if (data) {
      setEvents(data.map((e) => ({
        id: e.id,
        weddingId: e.wedding_id,
        title: e.title,
        date: e.date,
        time: e.time,
        venue: e.venue,
        address: e.address,
        mapsUrl: e.maps_url,
        orderIndex: e.order_index,
      })))
    }
    setLoading(false)
  }

  const addEvent = async (title: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('events')
      .insert({
        wedding_id: weddingId,
        title,
        order_index: events.length,
      })
      .select()
      .single()
    
    if (data && !error) {
      const newEvent: WeddingEvent = {
        id: data.id,
        weddingId: data.wedding_id,
        title: data.title,
        date: data.date,
        time: data.time,
        venue: data.venue,
        address: data.address,
        mapsUrl: data.maps_url,
        orderIndex: data.order_index,
      }
      setEvents((prev) => [...prev, newEvent])
      setExpandedEventId(data.id)
    }
    setAddingEvent(false)
  }

  const updateEvent = async (id: string, updates: Partial<WeddingEvent>) => {
    const supabase = createClient()
    await supabase.from('events').update({
      title: updates.title,
      date: updates.date,
      time: updates.time,
      venue: updates.venue,
      address: updates.address,
      maps_url: updates.mapsUrl,
    }).eq('id', id)
    setEvents((prev) => prev.map((e) => e.id === id ? { ...e, ...updates } : e))
  }

  const deleteEvent = async (id: string) => {
    const supabase = createClient()
    await supabase.from('events').delete().eq('id', id)
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  const inputClass = 'w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all'

  if (loading) {
    return <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="space-y-3">
      {/* Events list */}
      {events.map((event) => (
        <div key={event.id} className="bg-white border border-stone-100 rounded-xl overflow-hidden shadow-sm">
          <div
            className="flex items-center gap-2 p-3 cursor-pointer hover:bg-stone-50 transition-colors"
            onClick={() => setExpandedEventId(expandedEventId === event.id ? null : event.id)}
          >
            <GripVertical className="w-4 h-4 text-stone-300" />
            <span className="flex-1 text-sm font-medium text-stone-700">{event.title}</span>
            {event.date && <span className="text-xs text-stone-400">{event.date}</span>}
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); deleteEvent(event.id) }}
                className="p-1 hover:text-red-500 text-stone-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              {expandedEventId === event.id ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
            </div>
          </div>
          
          {expandedEventId === event.id && (
            <div className="p-3 pt-0 border-t border-stone-100 space-y-2">
              <input
                value={event.title}
                onChange={(e) => updateEvent(event.id, { title: e.target.value })}
                placeholder="Event title"
                className={inputClass}
              />
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={event.date || ''} onChange={(e) => updateEvent(event.id, { date: e.target.value })} className={inputClass} />
                <input type="time" value={event.time || ''} onChange={(e) => updateEvent(event.id, { time: e.target.value })} className={inputClass} />
              </div>
              <input value={event.venue || ''} onChange={(e) => updateEvent(event.id, { venue: e.target.value })} placeholder="Venue name" className={inputClass} />
              <textarea value={event.address || ''} onChange={(e) => updateEvent(event.id, { address: e.target.value })} placeholder="Address" rows={2} className={inputClass + ' resize-none'} />
              <input value={event.mapsUrl || ''} onChange={(e) => updateEvent(event.id, { mapsUrl: e.target.value })} placeholder="Google Maps URL" className={inputClass} />
            </div>
          )}
        </div>
      ))}

      {/* Add event */}
      {addingEvent ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-xs font-medium text-amber-800 mb-2">Choose event type:</p>
          <div className="flex flex-wrap gap-2">
            {EVENT_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => addEvent(preset)}
                className="text-xs px-3 py-1.5 bg-white border border-amber-200 rounded-full hover:bg-amber-100 text-amber-700 transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
          <button
            onClick={() => setAddingEvent(false)}
            className="mt-2 text-xs text-stone-400 hover:text-stone-600"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAddingEvent(true)}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-stone-200 rounded-xl text-sm text-stone-500 hover:border-amber-400 hover:text-amber-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      )}
    </div>
  )
}
