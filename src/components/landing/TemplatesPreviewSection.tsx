'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
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
      frame: 'border-amber-400/50',
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
      frame: 'border-amber-500/40',
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
      frame: 'border-rose-300/60',
      colors: ['#fff1f2', '#fecdd3', '#f43f5e', '#881337'],
    },
    sampleBride: "Anu D'Souza",
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
      frame: 'border-stone-300',
      colors: ['#ffffff', '#f5f5f4', '#78716c', '#1c1917'],
    },
    sampleBride: 'Anu Mehta',
    sampleGroom: 'Jagan Roy',
    date: 'March 22, 2027',
    venue: 'Alibaug, Maharashtra',
  },
]

const categories = ['All', 'Traditional', 'Royal', 'Floral', 'Minimal']

/* ─── Animation variants ─────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: 'easeOut' as const },
  }),
}

export default function TemplatesPreviewSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const state = isInView ? 'visible' : 'hidden'
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredTemplates =
    selectedCategory === 'All'
      ? templateList
      : templateList.filter((t) => t.category.toLowerCase() === selectedCategory.toLowerCase())

  return (
    <section
      id="templates"
      ref={ref}
      className="relative overflow-hidden bg-white !py-20 sm:!py-28 lg:!py-32 !px-5 sm:!px-8 lg:!px-12 scroll-mt-16"
    >
      {/* Soft background glows */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 -right-40 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1.1, 1, 1.1], opacity: [1, 0.7, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-20 -left-40 w-96 h-96 bg-rose-100/50 rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* ───────── Header ───────── */}
        <div className="text-center max-w-3xl mx-auto !mb-12 sm:!mb-16">
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate={state}
            className="inline-flex items-center gap-2 !px-4 !py-1.5 rounded-full bg-amber-100/70 border border-amber-200 text-amber-800 text-[11px] sm:text-xs font-semibold uppercase tracking-widest !mb-6"
          >
            <motion.span
              animate={{ rotate: [0, 18, -18, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            </motion.span>
            Curated Designer Themes
          </motion.div>

          <motion.h2
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate={state}
            className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-stone-900 leading-[1.15] !mb-5 sm:!mb-6"
          >
            Choose Your <span className="italic text-amber-800 font-normal">Aesthetic</span>
          </motion.h2>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-amber-400 to-transparent !mb-5 sm:!mb-6"
          />

          <motion.p
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate={state}
            className="text-stone-600 text-base sm:text-lg font-sans max-w-2xl mx-auto leading-relaxed !mb-8 sm:!mb-10 !px-2"
          >
            Every template is meticulously crafted with high-definition animations,
            mobile responsiveness, and personalized color palettes.
          </motion.p>

          {/* Category tabs with sliding active pill */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate={state}
            className="inline-flex max-w-full overflow-x-auto items-center gap-1 !p-1.5 rounded-full bg-stone-100/80 border border-stone-200/60"
            role="tablist"
          >
            {categories.map((cat) => {
              const isActive = selectedCategory === cat
              return (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSelectedCategory(cat)}
                  className={`relative shrink-0 !px-4 sm:!px-5 !py-2 rounded-full text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-colors duration-200 cursor-pointer ${isActive ? 'text-white' : 'text-stone-600 hover:text-amber-800'
                    }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="template-cat-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-700 to-amber-600 shadow-md shadow-amber-700/25"
                    />
                  )}
                  <span className="relative z-10">{cat}</span>
                </button>
              )
            })}
          </motion.div>
        </div>

        {/* ───────── Template cards ───────── */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 lg:gap-8 !mb-14 sm:!mb-16 max-w-sm sm:max-w-none mx-auto"
        >
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((template, idx) => {
              const { previewTheme } = template

              return (
                <motion.div
                  key={template.slug}
                  layout
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.5, delay: 0.25 + idx * 0.1, ease: 'easeOut' }}
                  whileHover={{ y: -8 }}
                  className="group rounded-3xl bg-white border border-stone-200/70 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-amber-900/10 hover:border-amber-200 transition-[box-shadow,border-color] duration-300 flex flex-col"
                >
                  {/* Preview box */}
                  <div
                    className={`relative ${previewTheme.bg} !px-5 !py-6 sm:!px-6 sm:!py-7 min-h-[320px] flex flex-col items-center justify-between gap-4 border-b ${previewTheme.border} overflow-hidden`}
                  >
                    {/* Inner decorative frame */}
                    <div className={`absolute inset-3 rounded-2xl border ${previewTheme.frame} pointer-events-none`} />

                    {/* Shine sweep on hover */}
                    <div className="absolute inset-y-0 -left-full w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-20deg] group-hover:left-[150%] transition-all duration-1000 pointer-events-none z-10" />

                    {/* Badge row */}
                    <div className="relative w-full flex items-center justify-between !px-1 z-10">
                      <span className="text-[10px] font-bold uppercase tracking-wider !px-3 !py-1 rounded-full bg-white/85 backdrop-blur-xs text-stone-800 border border-stone-200/50">
                        {template.badge}
                      </span>
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-8 h-8 rounded-full bg-white/85 flex items-center justify-center text-amber-700 shadow-xs"
                      >
                        <Heart className="w-3.5 h-3.5 fill-amber-700" />
                      </motion.div>
                    </div>

                    {/* Mini invitation (gently floating) */}
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 4 + idx * 0.4, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.3 }}
                      className="relative text-center z-10 w-full"
                    >
                      <motion.div
                        whileHover={{ rotate: 12, scale: 1.1 }}
                        className={`w-12 h-12 mx-auto rounded-full ${previewTheme.seal} flex items-center justify-center text-xs font-serif font-bold !mb-4 shadow-md`}
                      >
                        {template.sampleGroom[0]} &amp; {template.sampleBride[0]}
                      </motion.div>

                      <p className={`text-[9px] uppercase tracking-[0.3em] font-semibold ${previewTheme.subAccent} !mb-2 opacity-80`}>
                        Invitation
                      </p>

                      <h4 className={`font-serif text-2xl sm:text-[26px] font-normal ${previewTheme.accent} leading-tight !mb-2`}>
                        {template.sampleGroom.split(' ')[0]} &amp; {template.sampleBride.split(' ')[0]}
                      </h4>

                      <p className={`text-[10px] ${previewTheme.subAccent} tracking-wider font-medium opacity-80`}>
                        {template.date}
                      </p>
                      <p className={`text-[10px] ${previewTheme.subAccent} opacity-60 !mt-1`}>
                        {template.venue}
                      </p>
                    </motion.div>

                    {/* Colour swatches */}
                    <div className="relative flex items-center gap-2 z-10">
                      {previewTheme.colors.map((color, i) => (
                        <motion.span
                          key={i}
                          whileHover={{ scale: 1.35, y: -2 }}
                          className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    {/* Hover overlay (pointer devices) */}
                    <div className="absolute inset-0 bg-stone-900/65 backdrop-blur-xs opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 !p-6 z-20">
                      <Link
                        href={`/templates/preview/${template.slug}`}
                        className="w-full text-center !py-3 !px-4 bg-white text-stone-900 text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md hover:bg-amber-50 translate-y-3 group-hover:translate-y-0 group-focus-within:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Live Preview</span>
                      </Link>

                      <Link
                        href={`/register?template=${template.slug}`}
                        className="w-full text-center !py-3 !px-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-gold hover:opacity-95 translate-y-3 group-hover:translate-y-0 group-focus-within:translate-y-0 transition-all duration-300 delay-75 flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Use This Template</span>
                      </Link>
                    </div>
                  </div>

                  {/* Info footer */}
                  <div className="!p-5 sm:!p-6 flex flex-col justify-between flex-1 gap-5">
                    <div>
                      <div className="flex items-start justify-between gap-3 !mb-2">
                        <h3 className="font-serif text-lg sm:text-xl font-medium text-stone-900 leading-snug">
                          {template.name}
                        </h3>
                        <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 !px-2.5 !py-1 rounded-md shrink-0">
                          {template.category}
                        </span>
                      </div>
                      <p className="text-xs sm:text-[13px] text-stone-500 font-sans leading-relaxed line-clamp-2">
                        {template.tagline}
                      </p>
                    </div>

                    {/* Always-visible actions so touch devices (no hover) can still use a template */}
                    <div className="!pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
                      <Link
                        href={`/templates/preview/${template.slug}`}
                        className="text-xs text-amber-800 font-semibold hover:text-amber-900 inline-flex items-center gap-1.5 group/link"
                      >
                        <span>Preview</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                      <Link
                        href={`/register?template=${template.slug}`}
                        className="text-[11px] font-semibold uppercase tracking-wider text-white bg-stone-900 hover:bg-amber-700 !px-4 !py-2 rounded-full transition-colors"
                      >
                        Use Template
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>

        {/* ───────── View all CTA ───────── */}
        <motion.div
          custom={0}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.9 } },
          }}
          initial="hidden"
          animate={state}
          className="text-center"
        >
          <Link
            href="/templates"
            className="group inline-flex items-center gap-2.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-amber-800 hover:text-amber-900 border-b-2 border-amber-300 hover:border-amber-600 !pb-1.5 transition-colors"
          >
            <span>Browse Full Gallery &amp; Color Variations</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}