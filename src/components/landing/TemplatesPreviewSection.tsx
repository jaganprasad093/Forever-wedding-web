'use client'

import { useRef, useState } from 'react'
import {
  motion,
  AnimatePresence,
  useInView,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Sparkles, Heart, Music, Users, MapPin, ChevronsRight } from 'lucide-react'

const templateList = [
  {
    name: 'Kerala Traditional',
    tagline: 'Timeless cultural heritage with kasavu gold and temple motifs',
    category: 'Traditional',
    badge: 'Most Popular',
    slug: 'kerala-traditional',
    motif: '❖',
    previewTheme: {
      bg: 'bg-gradient-to-br from-[#fefbf3] via-[#fff9e6] to-[#fdedc9]',
      border: 'border-amber-300',
      accent: 'text-amber-800',
      subAccent: 'text-amber-700',
      seal: 'bg-amber-700 text-amber-100',
      frame: 'border-amber-400/50',
    },
    accents: ['#b45309', '#9f1239', '#166534', '#a16207'],
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
    motif: '✦',
    previewTheme: {
      bg: 'bg-gradient-to-br from-stone-950 via-stone-900 to-neutral-950',
      border: 'border-amber-500/50',
      accent: 'text-amber-400',
      subAccent: 'text-amber-200/70',
      seal: 'bg-amber-500 text-stone-950 font-bold',
      frame: 'border-amber-500/40',
    },
    accents: ['#fbbf24', '#fda4af', '#e7e5e4', '#fcd9a8'],
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
    motif: '✿',
    previewTheme: {
      bg: 'bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100/70',
      border: 'border-rose-200',
      accent: 'text-rose-900',
      subAccent: 'text-rose-700',
      seal: 'bg-rose-600 text-rose-50',
      frame: 'border-rose-300/60',
    },
    accents: ['#e11d48', '#7c3aed', '#4d7c0f', '#ea580c'],
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
    motif: '—',
    previewTheme: {
      bg: 'bg-gradient-to-br from-stone-50 via-white to-stone-100',
      border: 'border-stone-300',
      accent: 'text-stone-900',
      subAccent: 'text-stone-600',
      seal: 'bg-stone-900 text-stone-100',
      frame: 'border-stone-300',
    },
    accents: ['#1c1917', '#1e3a8a', '#14532d', '#9a3412'],
    sampleBride: 'Anu Mehta',
    sampleGroom: 'Jagan Roy',
    date: 'March 22, 2027',
    venue: 'Alibaug, Maharashtra',
  },
]

type Template = (typeof templateList)[number]

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

/* ─── Single template card (owns its colour + tilt state) ────────────── */
function TemplateCard({
  template,
  idx,
  inView,
  reduceMotion,
}: {
  template: Template
  idx: number
  inView: boolean
  reduceMotion: boolean
}) {
  const { previewTheme } = template
  const [accentIdx, setAccentIdx] = useState<number | null>(null)
  const accent = accentIdx === null ? undefined : template.accents[accentIdx]

  // Pointer-driven 3D tilt (mouse only)
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const springX = useSpring(rx, { stiffness: 150, damping: 16 })
  const springY = useSpring(ry, { stiffness: 150, damping: 16 })

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.5, delay: 0.25 + idx * 0.1, ease: 'easeOut' }}
      whileHover={{ y: -8 }}
      className="group shrink-0 w-[82%] min-[480px]:w-[58%] sm:w-auto snap-center rounded-3xl bg-white border border-stone-200/70 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-amber-900/10 hover:border-amber-200 transition-[box-shadow,border-color] duration-300 flex flex-col"
    >
      {/* Preview */}
      <div
        onPointerMove={(e) => {
          if (reduceMotion || e.pointerType !== 'mouse') return
          const r = e.currentTarget.getBoundingClientRect()
          ry.set(((e.clientX - r.left) / r.width - 0.5) * 14)
          rx.set(-((e.clientY - r.top) / r.height - 0.5) * 14)
        }}
        onPointerLeave={() => {
          rx.set(0)
          ry.set(0)
        }}
        className={`relative ${previewTheme.bg} !px-5 !py-6 sm:!px-6 sm:!py-7 min-h-[340px] flex flex-col items-center justify-between gap-4 border-b ${previewTheme.border} overflow-hidden`}
      >
        {/* Inner frame */}
        <div className={`absolute inset-3 rounded-2xl border ${previewTheme.frame} pointer-events-none`} />

        {/* Corner motifs */}
        {['top-5 left-5', 'top-5 right-5', 'bottom-5 left-5', 'bottom-5 right-5'].map((pos) => (
          <span
            key={pos}
            className={`absolute ${pos} text-[10px] ${previewTheme.subAccent} opacity-40 pointer-events-none`}
            aria-hidden="true"
          >
            {template.motif}
          </span>
        ))}

        {/* Shine sweep on hover */}
        <div className="absolute inset-y-0 -left-full w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-20deg] group-hover:left-[150%] transition-all duration-1000 pointer-events-none z-10" />

        {/* Badge row */}
        <div className="relative w-full flex items-center justify-between !px-2 !pt-1 z-10">
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

        {/* Mini invitation: tilt wrapper → floating wrapper */}
        <motion.div
          style={{ rotateX: springX, rotateY: springY, transformPerspective: 700 }}
          className="relative z-10 w-full"
        >
          <motion.div
            animate={reduceMotion ? {} : { y: [0, -5, 0] }}
            transition={{ duration: 4 + idx * 0.4, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.3 }}
            className="text-center"
          >
            <motion.div
              whileHover={{ rotate: 12, scale: 1.1 }}
              style={accent ? { backgroundColor: accent } : undefined}
              className={`w-12 h-12 mx-auto rounded-full ${previewTheme.seal} flex items-center justify-center text-xs font-serif font-bold !mb-4 shadow-md transition-colors duration-300`}
            >
              {template.sampleGroom[0]} &amp; {template.sampleBride[0]}
            </motion.div>

            <p className={`text-[9px] uppercase tracking-[0.3em] font-semibold ${previewTheme.subAccent} !mb-2 opacity-80`}>
              Invitation
            </p>

            <h4
              style={accent ? { color: accent } : undefined}
              className={`font-serif text-2xl sm:text-[26px] font-normal ${previewTheme.accent} leading-tight !mb-2 transition-colors duration-300`}
            >
              {template.sampleGroom.split(' ')[0]} &amp; {template.sampleBride.split(' ')[0]}
            </h4>

            <p className={`text-[10px] ${previewTheme.subAccent} tracking-wider font-medium opacity-80`}>
              {template.date}
            </p>
            <p className={`text-[10px] ${previewTheme.subAccent} opacity-60 !mt-1`}>{template.venue}</p>
          </motion.div>
        </motion.div>

        {/* Interactive colour swatches */}
        <div className="relative z-10 flex flex-col items-center gap-1.5 !pb-1">
          <div className="flex items-center gap-2.5">
            {template.accents.map((color, i) => {
              const selected = accentIdx === i
              return (
                <motion.button
                  key={color}
                  type="button"
                  onClick={() => setAccentIdx(selected ? null : i)}
                  whileHover={{ scale: 1.25, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={`Try accent colour ${i + 1} on ${template.name}`}
                  aria-pressed={selected}
                  className={`w-5 h-5 rounded-full border-2 shadow-xs cursor-pointer transition-shadow ${selected ? 'border-white ring-2 ring-offset-1 ring-stone-400/70' : 'border-white/90'
                    }`}
                  style={{ backgroundColor: color }}
                />
              )
            })}
          </div>
          <span className={`text-[9px] uppercase tracking-widest ${previewTheme.subAccent} opacity-60`}>
            Tap a colour to try it
          </span>
        </div>
      </div>

      {/* Info */}
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
          <p className="text-xs sm:text-[13px] text-stone-500 font-sans leading-relaxed line-clamp-2 !mb-4">
            {template.tagline}
          </p>

          {/* What's included */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { icon: Music, label: 'Music' },
              { icon: Users, label: 'RSVP' },
              { icon: MapPin, label: 'Maps' },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 text-[10px] font-medium text-stone-600 bg-stone-100 !px-2.5 !py-1 rounded-full"
              >
                <Icon className="w-3 h-3 text-amber-700" />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="!pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
          <Link
            href={`/templates/preview/${template.slug}`}
            className="group/link text-xs text-amber-800 font-semibold hover:text-amber-900 inline-flex items-center gap-1.5 !py-2"
          >
            <span>Live Preview</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
          </Link>
          <Link
            href={`/register?template=${template.slug}`}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-white bg-stone-900 hover:bg-amber-700 !px-4 !py-2.5 rounded-full transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            Use Template
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default function TemplatesPreviewSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const reduceMotion = useReducedMotion() ?? false
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

      <div className="relative z-10 max-w-7xl mx-auto" style={{ width: '100%', marginInline: 'auto' }}>
        {/* ───────── Header ───────── */}
        <div
          className="flex flex-col items-center text-center max-w-3xl mx-auto !mb-10 sm:!mb-14"
          style={{ width: '100%', marginInline: 'auto' }}
        >
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate={state}
            className="inline-flex items-center gap-2 !px-4 !py-1.5 rounded-full bg-amber-100/70 border border-amber-200 text-amber-800 text-[11px] sm:text-xs font-semibold uppercase tracking-widest !mb-6"
          >
            <motion.span
              animate={reduceMotion ? {} : { rotate: [0, 18, -18, 0] }}
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
            className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-stone-900 leading-[1.15] !mb-5 sm:!mb-6 text-center text-balance"
          >
            Choose Your <span className="italic text-amber-800 font-normal">Aesthetic</span>
          </motion.h2>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className="h-px w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent !mb-5 sm:!mb-6"
            style={{ marginInline: 'auto' }}
          />

          <motion.p
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate={state}
            className="text-stone-600 text-base sm:text-lg font-sans max-w-2xl leading-relaxed !mb-8 sm:!mb-10 !px-2 text-center text-balance"
            style={{ marginInline: 'auto' }}
          >
            Every template is crafted with high-definition animations, mobile responsiveness,
            and colour palettes you can make your own — try a swatch on any card.
          </motion.p>

          {/* Category tabs with sliding pill */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate={state}
            className="inline-flex max-w-full overflow-x-auto items-center gap-1 !p-1.5 rounded-full bg-stone-100/80 border border-stone-200/60 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                  className={`relative shrink-0 !px-4 sm:!px-5 !py-2.5 rounded-full text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-colors duration-200 cursor-pointer ${isActive ? 'text-white' : 'text-stone-600 hover:text-amber-800'
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

          <p className="text-xs text-stone-400 !mt-4 text-center" aria-live="polite">
            Showing {filteredTemplates.length} of {templateList.length} themes
          </p>
        </div>

        {/* ───────── Cards: swipe carousel on phones, grid from sm ───────── */}
        <motion.div
          layout
          className={`flex sm:grid gap-5 sm:gap-7 lg:gap-8 overflow-x-auto sm:overflow-visible snap-x snap-mandatory sm:snap-none -mx-5 sm:mx-0 !px-5 sm:!px-0 !pt-3 !pb-6 sm:!pt-0 sm:!pb-0 !mb-4 sm:!mb-16 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            filteredTemplates.length === 1
              ? 'justify-center sm:grid-cols-1 sm:max-w-md'
              : filteredTemplates.length === 2
                ? 'sm:grid-cols-2 sm:max-w-3xl'
                : 'sm:grid-cols-2 lg:grid-cols-4'
          }`}
          style={{ width: '100%', marginInline: 'auto' }}
        >
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((template, idx) => (
              <TemplateCard
                key={template.slug}
                template={template}
                idx={idx}
                inView={isInView}
                reduceMotion={reduceMotion}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Swipe hint (phones only) */}
        {filteredTemplates.length > 1 && (
          <p className="sm:hidden flex items-center justify-center gap-1.5 text-[11px] uppercase tracking-widest text-stone-400 !mb-10">
            Swipe to explore <ChevronsRight className="w-3.5 h-3.5" />
          </p>
        )}

        {/* ───────── View all CTA ───────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="flex justify-center text-center"
          style={{ width: '100%', marginInline: 'auto' }}
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