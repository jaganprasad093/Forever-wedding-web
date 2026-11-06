'use client'

import { WeddingData, THEME_PRESETS, WeddingTheme, Template } from '@/types/wedding'
import { TEMPLATES } from '@/data/templates'
import { LayoutTemplate, Check } from 'lucide-react'

const FONT_OPTIONS = [
  { value: 'cormorant', label: 'Cormorant Garamond (Elegant Serif)' },
  { value: 'inter', label: 'Inter (Modern Sans-Serif)' },
]

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

export default function ThemePanel({
  wedding,
  onUpdate,
}: {
  wedding: WeddingData
  onUpdate: (updates: Partial<WeddingData>) => void
}) {
  const activeTemplate = getActiveTemplate(wedding)

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

        {/* Templates list with clear names and style accents */}
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATES.map((tmpl) => {
            const isSelected = activeTemplate.id === tmpl.id
            const defaultTheme = (tmpl.config as { defaultTheme?: WeddingTheme })?.defaultTheme

            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => handleSelectTemplate(tmpl)}
                className={`relative p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-[#8c6b48] bg-amber-50/60 shadow-sm ring-1 ring-[#8c6b48]'
                    : 'border-stone-200 hover:border-amber-300 bg-white hover:bg-stone-50/80'
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <p className="text-xs font-bold text-stone-900 leading-tight">{tmpl.name}</p>
                  {isSelected && (
                    <span className="shrink-0 w-4 h-4 rounded-full bg-[#8c6b48] text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mt-2.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs shrink-0"
                    style={{ backgroundColor: defaultTheme?.primaryColor || '#8c6b48' }}
                    title="Primary color"
                  />
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs shrink-0"
                    style={{ backgroundColor: defaultTheme?.accentColor || '#fcd34d' }}
                    title="Accent color"
                  />
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs shrink-0"
                    style={{ backgroundColor: defaultTheme?.backgroundColor || '#ffffff' }}
                    title="Background color"
                  />
                  <span className="text-[9px] uppercase tracking-wider text-stone-400 font-semibold ml-auto truncate">
                    {tmpl.category}
                  </span>
                </div>
              </button>
            )
          })}
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
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
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
              className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all text-left ${
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
