'use client'

import { useRef, useState } from 'react'
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ImagePlus,
  X,
  Loader2,
  Sparkles,
} from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { WeddingData, SpecialProgram } from '@/types/wedding'

// ── Preset catalogue ───────────────────────────────────────────────────────────
const PRESETS: { type: SpecialProgram['type']; icon: string; title: string; hint: string }[] = [
  { type: 'dress_code',    icon: '👗', title: 'Dress Code',       hint: 'e.g. Black tie, Cocktail attire…' },
  { type: 'gift_registry', icon: '🎁', title: 'Gift Registry',    hint: 'Share your registry link or details…' },
  { type: 'note',          icon: '📝', title: 'Note to Guests',   hint: 'A message you want guests to know…' },
  { type: 'food',          icon: '🍽️', title: 'Food & Drinks',    hint: 'Menu details, dietary options…' },
  { type: 'transport',     icon: '🚌', title: 'Transportation',   hint: 'Shuttle times, parking info…' },
  { type: 'hashtag',       icon: '#️⃣', title: 'Wedding Hashtag',  hint: '#YourHashtagHere' },
  { type: 'custom',        icon: '✨', title: 'Custom',           hint: 'Write anything for your guests…' },
]

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

const inputClass =
  'w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-800 ' +
  'placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 transition-all'

// ── Per-card image uploader ────────────────────────────────────────────────────
function ImageUploader({
  weddingId,
  program,
  onUpdate,
}: {
  weddingId: string
  program: SpecialProgram
  onUpdate: (patch: Partial<SpecialProgram>) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setUploading(true)
    setError(null)
    const supabase = createClient()
    const ext  = file.name.split('.').pop() ?? 'jpg'
    const path = `${weddingId}/special/${program.id}-${Date.now()}.${ext}`

    const { error: upErr } = await supabase.storage
      .from('wedding-images')
      .upload(path, file, { upsert: true })

    if (upErr) {
      setError('Upload failed. Try again.')
      setUploading(false)
      return
    }

    // Delete old image if one existed
    if (program.imagePath && program.imagePath !== path) {
      await supabase.storage.from('wedding-images').remove([program.imagePath])
    }

    const { data: urlData } = supabase.storage.from('wedding-images').getPublicUrl(path)
    onUpdate({ imageUrl: urlData.publicUrl, imagePath: path })
    setUploading(false)
  }

  async function removeImage() {
    if (!program.imagePath) return
    const supabase = createClient()
    await supabase.storage.from('wedding-images').remove([program.imagePath])
    onUpdate({ imageUrl: null, imagePath: null })
  }

  if (program.imageUrl) {
    return (
      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-stone-200 group">
        <Image
          src={program.imageUrl}
          alt={program.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 400px"
          unoptimized
        />
        {/* Overlay actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 text-xs font-medium bg-white/90 text-stone-800 px-3 py-1.5 rounded-full hover:bg-white transition-colors"
          >
            <ImagePlus className="w-3.5 h-3.5" />
            Replace
          </button>
          <button
            type="button"
            onClick={removeImage}
            className="flex items-center gap-1.5 text-xs font-medium bg-red-500/90 text-white px-3 py-1.5 rounded-full hover:bg-red-500 transition-colors"
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
        className="w-full flex flex-col items-center justify-center gap-2 py-5 border-2 border-dashed border-stone-200 rounded-lg text-stone-400 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50/40 transition-all disabled:opacity-60"
      >
        {uploading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs">Uploading…</span>
          </>
        ) : (
          <>
            <ImagePlus className="w-5 h-5" />
            <span className="text-xs font-medium">Add an image</span>
            <span className="text-[10px] text-stone-400">JPG, PNG, WEBP · max 5 MB</span>
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

// ── Main panel ────────────────────────────────────────────────────────────────
export default function SpecialProgramsPanel({
  wedding,
  onUpdate,
}: {
  wedding: WeddingData
  onUpdate: (updates: Partial<WeddingData>) => void
}) {
  const programs: SpecialProgram[] = wedding.theme?.specialPrograms ?? []
  const [expandedId, setExpandedId]     = useState<string | null>(null)
  const [pickingPreset, setPickingPreset] = useState(false)

  function persist(next: SpecialProgram[]) {
    onUpdate({ theme: { ...wedding.theme, specialPrograms: next } })
  }

  function addProgram(preset: (typeof PRESETS)[number]) {
    const item: SpecialProgram = {
      id:          uid(),
      type:        preset.type,
      icon:        preset.icon,
      title:       preset.title,
      description: null,
      imageUrl:    null,
      imagePath:   null,
    }
    persist([...programs, item])
    setExpandedId(item.id)
    setPickingPreset(false)
  }

  function updateProgram(id: string, patch: Partial<SpecialProgram>) {
    persist(programs.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  function deleteProgram(id: string) {
    persist(programs.filter((p) => p.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  const hintForType = (type: SpecialProgram['type']) =>
    PRESETS.find((p) => p.type === type)?.hint ?? 'Details visible to guests…'

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3 p-3.5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-xl">
        <span className="text-2xl mt-0.5">✨</span>
        <div>
          <p className="text-xs font-semibold text-amber-900">Special Programs</p>
          <p className="text-[11px] text-amber-700 leading-relaxed mt-0.5">
            Dress code, gift registry, food preferences &amp; more — with optional photos.
            Updates preview in real time.
          </p>
        </div>
      </div>

      {/* Cards */}
      {programs.map((program) => {
        const isOpen = expandedId === program.id
        return (
          <div
            key={program.id}
            className="bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Card header */}
            <div
              className="flex items-center gap-3 p-3.5 cursor-pointer select-none group"
              onClick={() => setExpandedId(isOpen ? null : program.id)}
            >
              {/* Image thumbnail or emoji badge */}
              <div className="relative shrink-0 w-10 h-10 rounded-xl overflow-hidden bg-stone-100 flex items-center justify-center">
                {program.imageUrl ? (
                  <Image
                    src={program.imageUrl}
                    alt={program.title}
                    fill
                    className="object-cover"
                    sizes="40px"
                    unoptimized
                  />
                ) : (
                  <span className="text-xl">{program.icon}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-800 truncate">
                  {program.title || 'Untitled'}
                </p>
                {program.description && (
                  <p className="text-[11px] text-stone-400 truncate mt-0.5">
                    {program.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); deleteProgram(program.id) }}
                  className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-stone-300 transition-colors"
                  aria-label="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="p-1.5 text-stone-300 group-hover:text-stone-500 transition-colors">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </div>

            {/* Expanded editor */}
            {isOpen && (
              <div className="px-3.5 pb-4 pt-0 border-t border-stone-100 space-y-3">
                {/* Image uploader */}
                <div className="pt-3">
                  <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-widest mb-1.5">
                    Cover Image <span className="font-normal normal-case text-stone-400">(optional)</span>
                  </label>
                  <ImageUploader
                    weddingId={wedding.id}
                    program={program}
                    onUpdate={(patch) => updateProgram(program.id, patch)}
                  />
                </div>

                {/* Icon + Title row */}
                <div>
                  <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-widest mb-1.5">
                    Icon &amp; Title
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={program.icon}
                      onChange={(e) => updateProgram(program.id, { icon: e.target.value })}
                      placeholder="🎉"
                      className={inputClass + ' w-14 text-center text-lg'}
                      maxLength={4}
                      aria-label="Emoji icon"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                    />
                    <input
                      value={program.title}
                      onChange={(e) => updateProgram(program.id, { title: e.target.value })}
                      placeholder="Card title"
                      className={inputClass + ' flex-1'}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-widest mb-1.5">
                    Details
                  </label>
                  <textarea
                    value={program.description ?? ''}
                    onChange={(e) => updateProgram(program.id, { description: e.target.value || null })}
                    placeholder={hintForType(program.type)}
                    rows={3}
                    className={inputClass + ' resize-none'}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                  />
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Add / preset picker */}
      {pickingPreset ? (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-xs font-semibold text-amber-900 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Choose a type
          </p>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.type}
                type="button"
                onClick={() => addProgram(p)}
                className="flex items-center gap-2 text-xs px-3 py-2.5 bg-white border border-amber-200/80 rounded-xl hover:bg-amber-50 hover:border-amber-300 text-stone-700 transition-all text-left shadow-sm"
              >
                <span className="text-base shrink-0">{p.icon}</span>
                <span className="font-medium leading-tight">{p.title}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPickingPreset(false)}
            className="mt-3 text-xs text-stone-400 hover:text-stone-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPickingPreset(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-stone-200 rounded-2xl text-sm font-medium text-stone-400 hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50/40 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Special Program
        </button>
      )}
    </div>
  )
}
