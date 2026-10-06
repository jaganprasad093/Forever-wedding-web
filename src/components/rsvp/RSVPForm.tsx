'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, Loader2, Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const rsvpSchema = z.object({
  guestName: z.string().min(2, 'Please enter your name'),
  phone: z.string().optional(),
  attending: z.enum(['yes', 'no']),
  guestCount: z.number().min(1).max(10).optional(),
  message: z.string().optional(),
})
type RSVPFormData = z.infer<typeof rsvpSchema>

export default function RSVPForm({
  weddingId,
  primaryColor,
  accentColor,
}: {
  weddingId: string
  primaryColor: string
  accentColor: string
}) {
  const [submitted, setSubmitted] = useState(false)
  const [attending, setAttending] = useState<'yes' | 'no' | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RSVPFormData>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: { guestCount: 1 },
  })

  const onSubmit = async (data: RSVPFormData) => {
    const supabase = createClient()
    await supabase.from('rsvps').insert({
      wedding_id: weddingId,
      guest_name: data.guestName,
      phone: data.phone || null,
      attending: data.attending === 'yes',
      guest_count: data.guestCount || 1,
      message: data.message || null,
    })

    // Track analytics
    await supabase.from('analytics').insert({
      wedding_id: weddingId,
      event_type: 'rsvp',
      metadata: { attending: data.attending === 'yes' },
    })

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="text-center py-10">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: `${accentColor}30` }}
        >
          <CheckCircle2 className="w-8 h-8" style={{ color: primaryColor }} />
        </div>
        <h3 className="text-xl font-medium mb-2" style={{ color: primaryColor }}>
          {attending === 'yes' ? 'Joyfully Accepted! 🎉' : 'Response Received'}
        </h3>
        <p className="text-sm opacity-60" style={{ color: primaryColor }}>
          {attending === 'yes'
            ? "We're so excited to celebrate with you!"
            : 'Thank you for letting us know. You will be missed!'}
        </p>
      </div>
    )
  }

  const inputClass = `w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2`

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Attending choice */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            setAttending('yes')
            setValue('attending', 'yes')
          }}
          className={`py-4 rounded-2xl border-2 text-sm font-medium transition-all ${
            attending === 'yes' ? 'border-current bg-current/10' : 'border-current/20 hover:border-current/40'
          }`}
          style={{ color: primaryColor, borderColor: attending === 'yes' ? primaryColor : `${primaryColor}30` }}
        >
          <Heart className="w-5 h-5 mx-auto mb-1" style={{ fill: attending === 'yes' ? primaryColor : 'transparent' }} />
          Joyfully Accept
        </button>
        <button
          type="button"
          onClick={() => {
            setAttending('no')
            setValue('attending', 'no')
          }}
          className={`py-4 rounded-2xl border-2 text-sm font-medium transition-all ${
            attending === 'no' ? 'border-current bg-current/10' : 'border-current/20 hover:border-current/40'
          }`}
          style={{ color: primaryColor, borderColor: attending === 'no' ? primaryColor : `${primaryColor}30` }}
        >
          <span className="block text-lg mb-1">🙏</span>
          Regretfully Decline
        </button>
      </div>
      {errors.attending && <p className="text-xs text-red-600">Please select an option</p>}

      {/* Name */}
      <div>
        <input
          {...register('guestName')}
          placeholder="Your full name"
          className={inputClass}
          style={{
            borderColor: `${primaryColor}30`,
            color: primaryColor,
            backgroundColor: `${primaryColor}05`,
          }}
        />
        {errors.guestName && <p className="text-xs text-red-500 mt-1">{errors.guestName.message}</p>}
      </div>

      {/* Phone */}
      <input
        {...register('phone')}
        placeholder="Phone number (optional)"
        type="tel"
        className={inputClass}
        style={{
          borderColor: `${primaryColor}30`,
          color: primaryColor,
          backgroundColor: `${primaryColor}05`,
        }}
      />

      {/* Guest count */}
      {attending === 'yes' && (
        <div>
          <label className="block text-xs mb-1.5 opacity-60" style={{ color: primaryColor }}>
            Number of guests (including yourself)
          </label>
          <select
            {...register('guestCount', { valueAsNumber: true })}
            className={inputClass}
            style={{
              borderColor: `${primaryColor}30`,
              color: primaryColor,
              backgroundColor: `${primaryColor}05`,
            }}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      )}

      {/* Message */}
      <textarea
        {...register('message')}
        placeholder="Send a blessing or message (optional)"
        rows={3}
        className={inputClass + ' resize-none'}
        style={{
          borderColor: `${primaryColor}30`,
          color: primaryColor,
          backgroundColor: `${primaryColor}05`,
        }}
      />

      <button
        type="submit"
        disabled={isSubmitting || !attending}
        className="w-full py-4 rounded-2xl text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: primaryColor, color: accentColor }}
      >
        {isSubmitting ? (
          <><Loader2 className="w-4 h-4 animate-spin" />Sending...</>
        ) : (
          'Confirm RSVP'
        )}
      </button>
    </form>
  )
}
