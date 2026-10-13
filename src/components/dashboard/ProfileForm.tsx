'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Check, User } from 'lucide-react'

interface ProfileFormProps {
  userId: string
  initialName: string
  email: string
}

export default function ProfileForm({
  userId,
  initialName,
  email,
}: ProfileFormProps) {
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          name: name.trim(),
          updated_at: new Date().toISOString(),
        })

      if (updateError) throw updateError

      setSuccess(true)
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update profile'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200/80 rounded-xl text-xs text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      <div>
        <label
          htmlFor="profile-name"
          className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2"
        >
          Full Name / Couple Name
        </label>
        <div className="relative">
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rachel & Ross"
            className="w-full h-11 px-4 pl-10 bg-white border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#8c6b48] focus:ring-1 focus:ring-[#8c6b48]/20 transition-all"
          />
          <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
        <p className="text-xs text-stone-400 mt-1.5">
          This name appears in your greetings and dashboard header.
        </p>
      </div>

      <div>
        <label
          htmlFor="profile-email"
          className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2"
        >
          Email Address
        </label>
        <input
          id="profile-email"
          type="email"
          value={email}
          disabled
          className="w-full h-11 px-4 bg-stone-100 border border-stone-200 rounded-xl text-sm text-stone-500 cursor-not-allowed"
        />
        <p className="text-xs text-stone-400 mt-1.5">
          Email address managed by your authentication account.
        </p>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#8c6b48] hover:bg-[#7a5c3d] active:bg-[#6c4f31] text-white rounded-xl text-sm font-medium transition-all shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  )
}
