'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { WeddingData } from '@/types/wedding'

interface FormData {
  story: string
}

export default function StoryPanel({
  wedding,
  onUpdate,
}: {
  wedding: WeddingData
  onUpdate: (updates: Partial<WeddingData>) => void
}) {
  const { register, watch } = useForm<FormData>({
    defaultValues: {
      story: wedding.story || '',
    },
  })

  useEffect(() => {
    const sub = watch((data) => {
      onUpdate({ story: data.story || null })
    })
    return () => sub.unsubscribe()
  }, [watch, onUpdate])

  return (
    <div className="space-y-4">
      <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-rose-800 uppercase tracking-wider mb-3">Your Love Story</h4>
        <p className="text-xs text-rose-600 mb-3">Share how you met and your journey together. This will appear in the invitation.</p>
        <textarea
          {...register('story')}
          rows={8}
          placeholder="We first met in college, during a monsoon evening in Thrissur..."
          className="w-full px-3 py-2.5 text-sm bg-white border border-rose-200 rounded-lg text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all resize-none leading-relaxed"
        />
      </div>

      <div className="bg-stone-50 border border-stone-100 rounded-xl p-3">
        <p className="text-xs text-stone-400">
          ✨ Tip: Write in the third person for a more romantic feel. Guests love personal love stories!
        </p>
      </div>
    </div>
  )
}
