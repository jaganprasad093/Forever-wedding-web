'use client'

import { WeddingData, THEME_PRESETS, WeddingTheme } from '@/types/wedding'

const FONT_OPTIONS = [
  { value: 'cormorant', label: 'Cormorant Garamond (Elegant)' },
  { value: 'inter', label: 'Inter (Modern)' },
]

export default function ThemePanel({
  wedding,
  onUpdate,
}: {
  wedding: WeddingData
  onUpdate: (updates: Partial<WeddingData>) => void
}) {
  const theme = wedding.theme

  const updateTheme = (updates: Partial<WeddingTheme>) => {
    onUpdate({ theme: { ...theme, ...updates } })
  }

  return (
    <div className="space-y-4">
      {/* Color presets */}
      <div className="bg-stone-50 border border-stone-100 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-stone-600 uppercase tracking-wider mb-3">Color Palette</h4>
        <div className="grid grid-cols-4 gap-2">
          {THEME_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => updateTheme({
                primaryColor: preset.primaryColor,
                secondaryColor: preset.secondaryColor,
                backgroundColor: preset.backgroundColor,
                accentColor: preset.accentColor,
                preset: preset.name,
              })}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                theme.preset === preset.name
                  ? 'ring-2 ring-amber-500 bg-amber-50'
                  : 'hover:bg-stone-100'
              }`}
            >
              <div
                className="w-8 h-8 rounded-full border border-stone-200"
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
                value={theme[key as keyof WeddingTheme] as string || '#000000'}
                onChange={(e) => updateTheme({ [key]: e.target.value })}
                className="w-8 h-8 rounded-lg border border-stone-200 cursor-pointer p-0.5"
              />
              <span className="text-xs text-stone-400 font-mono">
                {(theme[key as keyof WeddingTheme] as string) || '#000000'}
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
              onClick={() => updateTheme({ fontFamily: font.value })}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all text-left ${
                theme.fontFamily === font.value
                  ? 'border-amber-500 bg-amber-50 text-amber-700'
                  : 'border-stone-200 hover:border-amber-300 text-stone-700'
              }`}
            >
              <span className="text-xs font-medium">{font.label}</span>
              {theme.fontFamily === font.value && (
                <div className="w-1.5 h-1.5 bg-amber-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
