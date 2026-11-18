'use client'

import { WeddingData, THEME_PRESETS, WeddingTheme, Template } from '@/types/wedding'
import { TEMPLATES } from '@/data/templates'
import { LayoutTemplate, Check } from 'lucide-react'

const FONT_OPTIONS = [
  { value: 'cormorant', label: 'Cormorant Garamond (Elegant Serif)' },
  { value: 'inter', label: 'Inter (Modern Sans-Serif)' },
]

const PREVIEW_STYLES: Record<string, { bg: string; text: string; accent: string; rule: string }> = {
  'template-kerala-traditional': {
    bg: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100',
    text: 'text-amber-900',
    accent: 'border-amber-300',
    rule: 'bg-amber-700',
  },
  'template-royal-gold': {
    bg: 'bg-gradient-to-br from-stone-950 via-stone-900 to-stone-800',
    text: 'text-amber-400',
    accent: 'border-amber-600',
    rule: 'bg-amber-400',
  },
  'template-minimal-white': {
    bg: 'bg-gradient-to-br from-white via-stone-50 to-stone-100',
    text: 'text-stone-900',
    accent: 'border-stone-300',
    rule: 'bg-stone-700',
  },
  'template-floral-romantic': {
    bg: 'bg-gradient-to-br from-rose-50 via-pink-50 to-pink-100',
    text: 'text-rose-800',
    accent: 'border-rose-300',
    rule: 'bg-rose-600',
  },
  'template-celestial-starlight': {
    bg: 'bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900',
    text: 'text-cyan-200',
    accent: 'border-cyan-400',
    rule: 'bg-cyan-400',
  },
  'template-sunset-boho': {
    bg: 'bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200',
    text: 'text-amber-950',
    accent: 'border-amber-500',
    rule: 'bg-amber-600',
  },
  'template-vintage-botanical': {
    bg: 'bg-gradient-to-br from-[#faf7ee] via-emerald-50 to-[#ede8d8]',
    text: 'text-emerald-950',
    accent: 'border-emerald-600',
    rule: 'bg-emerald-700',
  },
  'template-rajputana-palace': {
    bg: 'bg-gradient-to-br from-[#2e0712] via-[#1c040b] to-[#120207]',
    text: 'text-amber-300',
    accent: 'border-amber-400',
    rule: 'bg-amber-500',
  },
  'template-ocean-breeze': {
    bg: 'bg-gradient-to-br from-cyan-50 via-teal-50 to-cyan-100',
    text: 'text-cyan-950',
    accent: 'border-cyan-400',
    rule: 'bg-cyan-600',
  },
}

const CATEGORY_COLORS: Record<string, string> = {
  kerala: 'bg-amber-100 text-amber-700',
  royal: 'bg-purple-100 text-purple-700',
  minimal: 'bg-stone-100 text-stone-700',
  floral: 'bg-rose-100 text-rose-700',
  luxury: 'bg-yellow-100 text-yellow-700',
  modern: 'bg-orange-100 text-orange-700',
  elegant: 'bg-teal-100 text-teal-700',
  traditional: 'bg-amber-100 text-amber-800',
}

function getActiveTemplate(wedding: WeddingData): Template {
  const tid = (wedding.templateId || '').toLowerCase()
  const slug = (wedding.slug || '').toLowerCase()

  const match = TEMPLATES.find((t) => {
    const id = t.id.toLowerCase()
    const s = t.slug.toLowerCase()
    return (
      (tid && (tid === id || tid === s || tid.includes(s) || id.includes(tid))) ||
      (slug && (slug === s || slug.includes(s)))
    )
  })

  return match || TEMPLATES[0]
}

function MiniTemplateCard({
  template,
  isSelected,
  onSelect,
  groom,
  bride,
}: {
  template: Template
  isSelected: boolean
  onSelect: () => void
  groom: string
  bride: string
}) {
  const style = PREVIEW_STYLES[template.id] || {
    bg: 'bg-amber-50',
    text: 'text-stone-800',
    accent: 'border-amber-200',
    rule: 'bg-stone-700',
  }
  const categoryBadge = CATEGORY_COLORS[template.category] || 'bg-stone-100 text-stone-700'

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative flex flex-col rounded-2xl border text-left transition-all duration-200 overflow-hidden bg-white cursor-pointer ${
        isSelected
          ? 'border-[#8c6b48] shadow-md ring-2 ring-[#8c6b48]'
          : 'border-stone-200 hover:border-amber-400 hover:shadow-sm'
      }`}
    >
      {/* Mini preview canvas styled like templates page */}
      <div
        className={`${style.bg} relative w-full h-28 flex flex-col items-center justify-center p-3 overflow-hidden select-none`}
      >
        {/* Subtle inner border frame */}
        <div className={`absolute inset-1.5 rounded-xl border ${style.accent} opacity-40 pointer-events-none`} />

        {/* Ornamental corners */}
        <div className={`absolute top-2.5 left-2.5 w-2 h-2 border-l border-t ${style.accent} opacity-50`} />
        <div className={`absolute top-2.5 right-2.5 w-2 h-2 border-r border-t ${style.accent} opacity-50`} />
        <div className={`absolute bottom-2.5 left-2.5 w-2 h-2 border-l border-b ${style.accent} opacity-50`} />
        <div className={`absolute bottom-2.5 right-2.5 w-2 h-2 border-r border-b ${style.accent} opacity-50`} />

        {/* Selected badge */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#8c6b48] text-white flex items-center justify-center shadow-md z-10">
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
        )}

        {/* Mini invitation content */}
        <div className="relative flex flex-col items-center text-center max-w-[90%]">
          <p className={`text-[7px] font-medium ${style.text} opacity-60 uppercase tracking-[0.2em] mb-1 line-clamp-1`}>
            Invitation
          </p>
          <div className={`w-8 h-px ${style.rule} opacity-30 mb-1.5`} />
          <h5 className={`font-serif text-sm font-semibold ${style.text} leading-tight truncate max-w-full`}>
            {groom}
          </h5>
          <p className={`font-serif text-[10px] ${style.text} opacity-60 my-0.5 leading-none`}>
            &amp;
          </p>
          <h5 className={`font-serif text-sm font-semibold ${style.text} leading-tight truncate max-w-full mb-1.5`}>
            {bride}
          </h5>
          <div className={`w-8 h-px ${style.rule} opacity-30`} />
        </div>
      </div>

      {/* Card details (name + category badge, NO color dots) */}
      <div className="p-2.5 flex items-center justify-between gap-1.5 bg-white border-t border-stone-100">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-stone-900 truncate leading-tight group-hover:text-[#8c6b48] transition-colors">
            {template.name}
          </p>
        </div>
        <span
          className={`shrink-0 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${categoryBadge}`}
        >
          {template.category}
        </span>
      </div>
    </button>
  )
}

export default function ThemePanel({
  wedding,
  onUpdate,
}: {
  wedding: WeddingData
  onUpdate: (updates: Partial<WeddingData>) => void
}) {
  const activeTemplate = getActiveTemplate(wedding)
  const groom = wedding.groomName || 'Aryan'
  const bride = wedding.brideName || 'Tara'

  const currentTheme: WeddingTheme = {
    primaryColor: wedding.theme?.primaryColor || '#92400e',
    secondaryColor: wedding.theme?.secondaryColor || '#b45309',
    backgroundColor: wedding.theme?.backgroundColor || '#fffbeb',
    accentColor: wedding.theme?.accentColor || '#fcd34d',
    fontFamily: wedding.theme?.fontFamily || 'cormorant',
    preset: wedding.theme?.preset,
    rsvpEnabled: wedding.theme?.rsvpEnabled !== false,
  }

  const updateTheme = (updates: Partial<WeddingTheme>) => {
    onUpdate({ theme: { ...currentTheme, ...updates } })
  }

  const isPresetActive = (presetName: string) => {
    if (currentTheme.preset) {
      return currentTheme.preset.toLowerCase() === presetName.toLowerCase()
    }
    const preset = THEME_PRESETS.find((p) => p.name === presetName)
    if (!preset) return false
    return (
      currentTheme.primaryColor.toLowerCase() === preset.primaryColor.toLowerCase() &&
      currentTheme.accentColor.toLowerCase() === preset.accentColor.toLowerCase()
    )
  }

  const handleSelectTemplate = (tmpl: Template) => {
    const defaultTheme = (tmpl.config as { defaultTheme?: WeddingTheme })?.defaultTheme
    onUpdate({
      templateId: tmpl.id,
      theme: defaultTheme ? { ...defaultTheme } : currentTheme,
    })
  }

  return (
    <div className="space-y-4">
      {/* ── Template Switcher ── */}
      <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-[#8c6b48]" />
            <h4 className="text-xs font-semibold text-stone-800 uppercase tracking-wider">
              Invitation Template
            </h4>
          </div>
          <span className="text-[10px] text-stone-400 font-medium">Switch anytime</span>
        </div>

        {/* Current template banner showing active template name */}
        <div className="p-3 bg-white border border-[#8c6b48]/30 rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[10px] font-semibold text-[#8c6b48] uppercase tracking-wider">
              Active Template
            </p>
            <p className="text-sm font-bold text-stone-900 mt-0.5">{activeTemplate.name}</p>
          </div>
          <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-[#8c6b48]/10 text-[#704e2e] border border-[#8c6b48]/20">
            {activeTemplate.category}
          </span>
        </div>

        {/* Templates list rendered as small visual preview cards like on /templates */}
        <div className="grid grid-cols-2 gap-2.5">
          {TEMPLATES.map((tmpl) => (
            <MiniTemplateCard
              key={tmpl.id}
              template={tmpl}
              isSelected={activeTemplate.id === tmpl.id}
              onSelect={() => handleSelectTemplate(tmpl)}
              groom={groom}
              bride={bride}
            />
          ))}
        </div>
      </div>

      {/* Color presets */}
      <div className="bg-stone-50 border border-stone-100 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-stone-600 uppercase tracking-wider mb-3">Color Palette</h4>
        <div className="grid grid-cols-4 gap-2">
          {THEME_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => updateTheme({
                primaryColor: preset.primaryColor,
                secondaryColor: preset.secondaryColor,
                backgroundColor: preset.backgroundColor,
                accentColor: preset.accentColor,
                preset: preset.name,
              })}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer ${
                isPresetActive(preset.name)
                  ? 'ring-2 ring-amber-500 bg-amber-50 shadow-sm'
                  : 'hover:bg-stone-100'
              }`}
            >
              <div
                className="w-8 h-8 rounded-full border border-stone-200 shadow-sm"
                style={{ background: `linear-gradient(135deg, ${preset.primaryColor}, ${preset.accentColor})` }}
              />
              <span className="text-[10px] text-stone-600 font-medium">{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom colors */}
      <div className="bg-stone-50 border border-stone-100 rounded-xl p-4 space-y-3">
        <h4 className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Custom Colors</h4>
        {[
          { key: 'primaryColor', label: 'Primary Color' },
          { key: 'secondaryColor', label: 'Secondary Color' },
          { key: 'backgroundColor', label: 'Background Color' },
          { key: 'accentColor', label: 'Accent Color' },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <label className="text-xs text-stone-600">{label}</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={(currentTheme[key as keyof WeddingTheme] as string) || '#000000'}
                onChange={(e) => updateTheme({ [key]: e.target.value, preset: undefined })}
                className="w-8 h-8 rounded-lg border border-stone-200 cursor-pointer p-0.5"
              />
              <span className="text-xs text-stone-400 font-mono">
                {(currentTheme[key as keyof WeddingTheme] as string) || '#000000'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Font */}
      <div className="bg-stone-50 border border-stone-100 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-stone-600 uppercase tracking-wider mb-3">Typography</h4>
        <div className="space-y-2">
          {FONT_OPTIONS.map((font) => (
            <button
              key={font.value}
              type="button"
              onClick={() => updateTheme({ fontFamily: font.value })}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all text-left cursor-pointer ${
                currentTheme.fontFamily === font.value
                  ? 'border-amber-500 bg-amber-50 text-amber-700'
                  : 'border-stone-200 hover:border-amber-300 text-stone-700'
              }`}
            >
              <span className="text-xs font-medium">{font.label}</span>
              {currentTheme.fontFamily === font.value && (
                <div className="w-1.5 h-1.5 bg-amber-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
