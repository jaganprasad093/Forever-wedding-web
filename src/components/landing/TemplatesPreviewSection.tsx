'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Sparkles, Eye, Heart } from 'lucide-react'

const templateList = [
  {
    name: 'Kerala Traditional',
    tagline: 'Timeless cultural heritage with kasavu gold and temple motifs',
    category: 'Traditional',
    badge: 'Most Popular',
    slug: 'kerala-traditional',
    previewTheme: {
      bg: 'bg-gradient-to-br from-[#fefbf3] via-[#fff9e6] to-[#fdedc9]',
      border: 'border-amber-300',
      accent: 'text-amber-800',
      subAccent: 'text-amber-700',
      seal: 'bg-amber-700 text-amber-100',
      colors: ['#fffbeb', '#fde68a', '#d97706', '#78350f'],
    },
    sampleBride: 'Anu Nair',
    sampleGroom: 'Jagan Prasad',
    date: 'December 12, 2026',
    venue: 'Thrissur, Kerala',
  },
  {
    name: 'Royal Midnight Gold',
    tagline: 'Cinematic luxury with deep obsidian and shimmering gold foil',
    category: 'Royal',
    badge: 'Luxury Edition',
    slug: 'royal-gold',
    previewTheme: {
      bg: 'bg-gradient-to-br from-stone-950 via-stone-900 to-neutral-950',
      border: 'border-amber-500/50',
      accent: 'text-amber-400',
      subAccent: 'text-amber-200/70',
      seal: 'bg-amber-500 text-stone-950 font-bold',
      colors: ['#0c0a09', '#1c1917', '#fbbf24', '#f59e0b'],
    },
    sampleBride: 'Anu Sharma',
    sampleGroom: 'Jagan Singhania',
    date: 'January 18, 2027',
    venue: 'Udaipur, Rajasthan',
  },
  {
    name: 'Floral Romance',
    tagline: 'Delicate botanical blooms, soft pastels, and dreamy typography',
    category: 'Floral',
    badge: 'Garden Favorite',
    slug: 'floral-romantic',
    previewTheme: {
      bg: 'bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100/70',
      border: 'border-rose-200',
      accent: 'text-rose-900',
      subAccent: 'text-rose-700',
      seal: 'bg-rose-600 text-rose-50',
      colors: ['#fff1f2', '#fecdd3', '#f43f5e', '#881337'],
    },
    sampleBride: 'Anu D\'Souza',
    sampleGroom: 'Jagan Matthew',
    date: 'February 14, 2027',
    venue: 'Candolim, Goa',
  },
  {
    name: 'Minimal Editorial',
    tagline: 'Contemporary Swiss minimalism with airy whitespace and serif flair',
    category: 'Minimal',
    badge: 'Modern & Chic',
    slug: 'minimal-white',
    previewTheme: {
      bg: 'bg-gradient-to-br from-stone-50 via-white to-stone-100',
      border: 'border-stone-300',
      accent: 'text-stone-900',
      subAccent: 'text-stone-600',
      seal: 'bg-stone-900 text-stone-100',
      colors: ['#ffffff', '#f5f5f4', '#78716c', '#1c1917'],
    },
    sampleBride: 'Anu Mehta',
    sampleGroom: 'Jagan Roy',
    date: 'March 22, 2027',
    venue: 'Alibaug, Maharashtra',
  },
]

const categories = ['All', 'Traditional', 'Royal', 'Floral', 'Minimal']

export default function TemplatesPreviewSection() {
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredTemplates = selectedCategory === 'All' 
    ? templateList 
    : templateList.filter(t => t.category.toLowerCase() === selectedCategory.toLowerCase())

  return (
    <section id="templates" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-white relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100/70 border border-amber-200 text-amber-800 text-xs font-semibold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Curated Designer Themes
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-stone-900 leading-tight mb-4">
            Choose Your <span className="italic text-amber-800 font-normal">Aesthetic</span>
          </h2>

          <p className="text-stone-600 text-base sm:text-lg font-sans max-w-2xl mx-auto leading-relaxed mb-8">
            Every template is meticulously crafted with high-definition animations, 
            mobile responsiveness, and personalized color palettes.
          </p>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-700 text-white shadow-md shadow-amber-700/20 scale-105'
                    : 'bg-stone-100 hover:bg-stone-200/80 text-stone-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Template Cards Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-14">
          <AnimatePresence>
            {filteredTemplates.map((template, idx) => {
              const { previewTheme } = template

              return (
                <motion.div
                  key={template.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="group rounded-3xl bg-white border border-stone-200/70 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Top Card Preview Box */}
                  <div className={`relative ${previewTheme.bg} p-6 sm:p-7 min-h-[300px] flex flex-col items-center justify-between border-b ${previewTheme.border} overflow-hidden`}>
                    
                    {/* Badge */}
                    <div className="w-full flex items-center justify-between z-10">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-xs text-stone-800 border border-stone-200/50">
                        {template.badge}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-white/80 flex items-center justify-center text-amber-700">
                        <Heart className="w-3.5 h-3.5 fill-amber-700" />
                      </div>
                    </div>

                    {/* Miniature Invitation Layout */}
                    <div className="text-center my-4 z-10 w-full">
                      {/* Monogram Seal */}
                      <div className={`w-10 h-10 mx-auto rounded-full ${previewTheme.seal} flex items-center justify-center text-xs font-serif font-bold mb-3 shadow-xs`}>
                        {template.sampleGroom[0]} &amp; {template.sampleBride[0]}
                      </div>

                      <p className={`text-[9px] uppercase tracking-[0.25em] font-semibold ${previewTheme.subAccent} mb-1 opacity-80`}>
                        INVITATION
                      </p>

                      <h4 className={`font-serif text-2xl font-normal ${previewTheme.accent} leading-tight mb-1`}>
                        {template.sampleGroom.split(' ')[0]} &amp; {template.sampleBride.split(' ')[0]}
                      </h4>

                      <p className={`text-[10px] ${previewTheme.subAccent} tracking-wider font-medium opacity-75`}>
                        {template.date}
                      </p>
                      <p className={`text-[9px] ${previewTheme.subAccent} opacity-60 mt-0.5`}>
                        {template.venue}
                      </p>
                    </div>

                    {/* Color Swatches */}
                    <div className="flex items-center gap-1.5 z-10">
                      {previewTheme.colors.map((color, i) => (
                        <span
                          key={i}
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    {/* Hover Overlay with Action Buttons */}
                    <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2.5 p-4 z-20">
                      <Link
                        href={`/templates/preview/${template.slug}`}
                        className="w-full text-center py-2.5 px-4 bg-white text-stone-900 text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md hover:bg-amber-50 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Live Preview</span>
                      </Link>

                      <Link
                        href={`/register?template=${template.slug}`}
                        className="w-full text-center py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-gold hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Use This Template</span>
                      </Link>
                    </div>
                  </div>

                  {/* Card Info Footer */}
                  <div className="p-5 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <h3 className="font-serif text-lg font-medium text-stone-900">
                          {template.name}
                        </h3>
                        <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md">
                          {template.category}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 font-sans leading-relaxed line-clamp-2">
                        {template.tagline}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                      <Link
                        href={`/templates/preview/${template.slug}`}
                        className="text-xs text-amber-800 font-semibold hover:text-amber-900 flex items-center gap-1 group-hover:gap-1.5 transition-all"
                      >
                        <span>Preview Theme</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <span className="text-[10px] text-stone-400 font-medium">Free to customize</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>

        {/* View All CTA */}
        <div className="text-center">
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-amber-800 hover:text-amber-900 border-b-2 border-amber-300 hover:border-amber-600 pb-1 transition-all"
          >
            <span>Browse Full Gallery &amp; Color Variations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
