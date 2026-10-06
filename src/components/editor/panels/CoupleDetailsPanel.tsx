'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { WeddingData } from '@/types/wedding'
import { useEffect } from 'react'

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
    </div>
  )
}
