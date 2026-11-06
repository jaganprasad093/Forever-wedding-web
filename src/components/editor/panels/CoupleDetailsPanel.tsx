'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { WeddingData } from '@/types/wedding'
import { useEffect } from 'react'
import { Users } from 'lucide-react'

const schema = z.object({
  brideName: z.string().optional(),
  groomName: z.string().optional(),
  weddingDate: z.string().optional(),
  weddingTime: z.string().optional(),
  venueName: z.string().optional(),
  venueAddress: z.string().optional(),
  venueMapsUrl: z.string().url().optional().or(z.literal('')),
  slug: z.string().min(3, 'URL must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens').optional(),
})

type FormData = z.infer<typeof schema>

export default function CoupleDetailsPanel({
  wedding,
  onUpdate,
}: {
  wedding: WeddingData
  onUpdate: (updates: Partial<WeddingData>) => void
}) {
  const { register, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      brideName: wedding.brideName || '',
      groomName: wedding.groomName || '',
      weddingDate: wedding.weddingDate || '',
      weddingTime: wedding.weddingTime || '',
      venueName: wedding.venueName || '',
      venueAddress: wedding.venueAddress || '',
      venueMapsUrl: wedding.venueMapsUrl || '',
      slug: wedding.slug || '',
    },
  })

  const values = watch()

  useEffect(() => {
    const sub = watch((data) => {
      onUpdate({
        brideName: data.brideName || null,
        groomName: data.groomName || null,
        weddingDate: data.weddingDate || null,
        weddingTime: data.weddingTime || null,
        venueName: data.venueName || null,
        venueAddress: data.venueAddress || null,
        venueMapsUrl: data.venueMapsUrl || null,
        slug: data.slug || wedding.slug,
      })
    })
    return () => sub.unsubscribe()
  }, [watch, onUpdate, wedding.slug])

  const inputClass =
    'w-full px-3 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:bg-white transition-all'

  return (
    <div className="space-y-4">
      {/* Couple names */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-3">
        <h4 className="text-xs font-semibold text-amber-800 uppercase tracking-wider">The Couple</h4>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Groom&apos;s Name</label>
          <input {...register('groomName')} className={inputClass} placeholder="e.g. Jagan" />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Bride&apos;s Name</label>
          <input {...register('brideName')} className={inputClass} placeholder="e.g. Anu" />
        </div>
      </div>

      {/* Date & Time */}
      <div className="bg-stone-50 border border-stone-100 rounded-xl p-4 space-y-3">
        <h4 className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Wedding Date</h4>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Date</label>
          <input type="date" {...register('weddingDate')} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Time</label>
          <input type="time" {...register('weddingTime')} className={inputClass} />
        </div>
      </div>

      {/* Venue */}
      <div className="bg-stone-50 border border-stone-100 rounded-xl p-4 space-y-3">
        <h4 className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Venue</h4>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Venue Name</label>
          <input {...register('venueName')} className={inputClass} placeholder="e.g. Thrissur Town Hall" />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Address</label>
          <textarea {...register('venueAddress')} className={inputClass + ' resize-none'} rows={2} placeholder="Full address..." />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Google Maps URL</label>
          <input {...register('venueMapsUrl')} className={inputClass} placeholder="https://maps.google.com/..." />
          {errors.venueMapsUrl && <p className="text-xs text-red-600 mt-1">{errors.venueMapsUrl.message}</p>}
        </div>
      </div>

      {/* Invitation URL */}
      <div className="bg-stone-50 border border-stone-100 rounded-xl p-4 space-y-2">
        <h4 className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Invitation URL</h4>
        <p className="text-xs text-stone-400">Customize your unique wedding URL</p>
        <div className="flex items-center gap-1">
          <span className="text-xs text-stone-400 flex-shrink-0">/w/</span>
          <input {...register('slug')} className={inputClass + ' flex-1'} placeholder="jagan-anu" />
        </div>
        {errors.slug && <p className="text-xs text-red-600">{errors.slug.message}</p>}
      </div>

      {/* RSVP Toggle */}
      <div className="bg-stone-50 border border-stone-100 rounded-xl p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#8c6b48]/10 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-[#8c6b48]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-stone-800 leading-tight">RSVP Section</p>
              <p className="text-xs text-stone-400 mt-0.5 leading-snug">
                {wedding.theme?.rsvpEnabled !== false
                  ? 'Guests can confirm attendance'
                  : 'Hidden from your invitation'}
              </p>
            </div>
          </div>
          {/* Toggle switch */}
          <button
            type="button"
            role="switch"
            aria-checked={wedding.theme?.rsvpEnabled !== false}
            onClick={() => {
              const current = wedding.theme?.rsvpEnabled !== false
              onUpdate({
                theme: {
                  primaryColor: wedding.theme?.primaryColor || '#92400e',
                  secondaryColor: wedding.theme?.secondaryColor || '#b45309',
                  backgroundColor: wedding.theme?.backgroundColor || '#fffbeb',
                  accentColor: wedding.theme?.accentColor || '#fcd34d',
                  fontFamily: wedding.theme?.fontFamily || 'cormorant',
                  preset: wedding.theme?.preset,
                  rsvpEnabled: !current,
                },
              })
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full border-2 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8c6b48] focus-visible:ring-offset-1 cursor-pointer shrink-0 ${
              wedding.theme?.rsvpEnabled !== false
                ? 'bg-[#8c6b48] border-[#7a5b3b]'
                : 'bg-stone-200 border-stone-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                wedding.theme?.rsvpEnabled !== false ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
