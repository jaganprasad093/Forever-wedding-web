'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Heart, ArrowRight, ArrowLeft, Eye, AlertCircle, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { TEMPLATES, TEMPLATE_CATEGORIES } from '@/data/templates'
import { Template, TemplateCategory } from '@/types/wedding'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

/* ─── Animation variants ─────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: 'easeOut' as const },
  }),
}

const previewStyles: Record<string, { bg: string; text: string; accent: string; rule: string }> = {
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
}

const categoryColors: Record<string, string> = {
  kerala: 'bg-amber-100 text-amber-700',
  royal: 'bg-purple-100 text-purple-700',
  minimal: 'bg-stone-100 text-stone-700',
  floral: 'bg-rose-100 text-rose-700',
  luxury: 'bg-yellow-100 text-yellow-700',
}

function TemplateCard({
  template,
  onUse,
  index,
  reduceMotion,
}: {
  template: Template
  onUse: (template: Template) => void
  index: number
  reduceMotion: boolean
}) {
  const style = previewStyles[template.id] || {
    bg: 'bg-amber-50',
    text: 'text-stone-800',
    accent: 'border-amber-200',
    rule: 'bg-stone-700',
  }
  const categoryColor = categoryColors[template.category] || 'bg-stone-100 text-stone-700'

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: (index % 3) * 0.1, duration: 0.55, ease: 'easeOut' }}
      whileHover={{ y: -8 }}
      className="group flex flex-col bg-white rounded-3xl border border-stone-100 shadow-card hover:shadow-card-hover hover:border-amber-200 transition-[box-shadow,border-color] duration-300 overflow-hidden"
    >
      {/* Preview */}
      <div className={`${style.bg} relative overflow-hidden min-h-[300px] sm:min-h-[320px] flex items-center justify-center !px-8 !py-12`}>
        {/* Inner frame */}
        <div className={`absolute inset-3 rounded-2xl border ${style.accent} opacity-40 pointer-events-none`} />

        {/* Ornamental corners */}
        <div className={`absolute top-5 left-5 w-10 h-10 border-l-2 border-t-2 ${style.accent} opacity-40 rounded-tl-lg`} />
        <div className={`absolute top-5 right-5 w-10 h-10 border-r-2 border-t-2 ${style.accent} opacity-40 rounded-tr-lg`} />
        <div className={`absolute bottom-5 left-5 w-10 h-10 border-l-2 border-b-2 ${style.accent} opacity-40 rounded-bl-lg`} />
        <div className={`absolute bottom-5 right-5 w-10 h-10 border-r-2 border-b-2 ${style.accent} opacity-40 rounded-br-lg`} />

        {/* Shine sweep */}
        <div className="absolute inset-y-0 -left-full w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-20deg] group-hover:left-[150%] transition-all duration-1000 pointer-events-none" />

        {/* Mini invitation (gently floating) */}
        <motion.div
          animate={reduceMotion ? {} : { y: [0, -5, 0] }}
          transition={{ duration: 4 + (index % 3) * 0.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.2 }}
          className="relative flex flex-col items-center text-center"
        >
          <p className={`text-[10px] font-medium ${style.text} opacity-60 uppercase tracking-[0.3em] !mb-4`}>
            Wedding Invitation
          </p>
          <div className={`w-16 h-px ${style.rule} opacity-30 !mb-5`} />
          <h3 className={`font-serif text-3xl sm:text-4xl font-medium ${style.text} leading-tight`}>Jagan</h3>
          <p className={`font-serif text-xl ${style.text} opacity-60 !my-1.5`}>&amp;</p>
          <h3 className={`font-serif text-3xl sm:text-4xl font-medium ${style.text} leading-tight !mb-5`}>Anu</h3>
          <div className={`w-16 h-px ${style.rule} opacity-30 !mb-4`} />
          <p className={`text-xs ${style.text} opacity-60 tracking-wider`}>12 December 2026</p>
          <p className={`text-xs ${style.text} opacity-50 !mt-1`}>Thrissur, Kerala</p>
        </motion.div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 justify-between gap-5 !p-5 sm:!p-6">
        <div>
          <div className="flex items-start justify-between gap-3 !mb-2">
            <h4 className="font-serif text-lg sm:text-xl font-medium text-stone-900 leading-snug">
              {template.name}
            </h4>
            <span className={`text-[11px] font-semibold !px-2.5 !py-1 rounded-full ${categoryColor} capitalize shrink-0`}>
              {template.category}
            </span>
          </div>
          <p className="text-sm text-stone-500 leading-relaxed line-clamp-2">{template.description}</p>
        </div>

        {/* Always visible so touch devices (no hover) can use them */}
        <div className="flex items-center justify-between gap-3 !pt-4 border-t border-stone-100">
          <Link
            href={`/templates/preview/${template.slug}`}
            className="group/link inline-flex items-center gap-2 text-sm font-semibold text-amber-800 hover:text-amber-900 !py-2"
          >
            <Eye className="w-4 h-4" />
            <span>Preview</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
          </Link>
          <motion.button
            type="button"
            onClick={() => onUse(template)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white !px-5 !py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-md shadow-amber-700/20 cursor-pointer transition-colors"
          >
            <Heart className="w-3.5 h-3.5" />
            Use Template
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default function TemplatesPage() {
  const router = useRouter()
  const reduceMotion = useReducedMotion() ?? false
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('all')
  const [creating, setCreating] = useState(false)
  const [creatingName, setCreatingName] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Auto-dismiss the error toast
  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(null), 5000)
    return () => clearTimeout(t)
  }, [error])

  const filteredTemplates =
    activeCategory === 'all'
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.category === activeCategory)

  const countFor = (id: string) =>
    id === 'all' ? TEMPLATES.length : TEMPLATES.filter((t) => t.category === id).length

  const handleUseTemplate = async (template: Template) => {
    setError(null)
    setCreatingName(template.name)
    setCreating(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push(`/register?template=${template.slug}`)
        return
      }

      // Generate a unique slug
      const baseSlug = `${template.slug}-${Date.now().toString(36)}`

      const { data: wedding, error: insertError } = await supabase
        .from('weddings')
        .insert({
          user_id: user.id,
          template_id: template.id,
          slug: baseSlug,
          theme: (template.config as { defaultTheme?: Record<string, string> })?.defaultTheme || {},
          published: false,
          views: 0,
        })
        .select()
        .single()

      if (insertError) throw insertError

      router.push(`/editor/${wedding.id}`)
    } catch (err) {
      console.error('Error creating wedding:', err)
      setError("We couldn't create your invitation. Please try again.")
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* ───────── Header ───────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900 text-white !pt-20 sm:!pt-24 !pb-16 sm:!pb-20 !px-5 sm:!px-8">
        <motion.div
          animate={reduceMotion ? {} : { scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-24 -right-24 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={reduceMotion ? {} : { scale: [1.1, 1, 1.1], opacity: [0.9, 0.5, 0.9] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-28 -left-24 w-96 h-96 bg-rose-400/15 rounded-full blur-3xl pointer-events-none"
        />

        <div
          className="relative max-w-5xl mx-auto text-center flex flex-col items-center"
          style={{ width: '100%', marginInline: 'auto' }}
        >
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="!mb-8">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-xs font-medium text-amber-200/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to ForeverVows</span>
            </Link>
          </motion.div>

          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 !px-4 !py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm text-[11px] sm:text-xs font-semibold text-amber-200 uppercase tracking-[0.25em] !mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Premium Templates
          </motion.div>

          <motion.h1
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium leading-[1.12] !mb-5 text-center text-balance"
          >
            Find Your Perfect <span className="italic text-amber-300">Template</span>
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
            className="h-px w-24 bg-gradient-to-r from-transparent via-amber-300 to-transparent !mb-5"
            style={{ marginInline: 'auto' }}
          />

          <motion.p
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-white/75 text-base sm:text-lg max-w-xl leading-relaxed text-center text-balance"
            style={{ marginInline: 'auto' }}
          >
            Professionally designed wedding invitation templates for every style and culture.
          </motion.p>
        </div>
      </div>

      {/* ───────── Sticky category filter ───────── */}
      <div className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-stone-100 shadow-sm">
        <div className="max-w-6xl mx-auto !px-5 sm:!px-8" style={{ width: '100%', marginInline: 'auto' }}>
          <div
            role="tablist"
            className="flex items-center gap-1.5 !py-3 overflow-x-auto justify-start sm:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ width: '100%', marginInline: 'auto' }}
          >
            {TEMPLATE_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    'relative shrink-0 inline-flex items-center gap-2 !px-4 sm:!px-5 !py-2.5 rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer',
                    isActive ? 'text-white' : 'text-stone-600 hover:text-amber-800'
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="templates-page-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-700 to-amber-600 shadow-md shadow-amber-700/25"
                    />
                  )}
                  <span className="relative z-10">{cat.label}</span>
                  <span
                    className={cn(
                      'relative z-10 text-[10px] font-semibold !px-1.5 rounded-full min-w-5 text-center',
                      isActive ? 'bg-white/25 text-white' : 'bg-stone-100 text-stone-500'
                    )}
                  >
                    {countFor(cat.id)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ───────── Templates grid ───────── */}
      <div className="max-w-6xl mx-auto !px-5 sm:!px-8 !py-10 sm:!py-14 lg:!py-16" style={{ width: '100%', marginInline: 'auto' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {filteredTemplates.length > 0 ? (
              <div
                className={`grid gap-6 sm:gap-7 lg:gap-8 mx-auto ${
                  filteredTemplates.length === 1
                    ? 'grid-cols-1 max-w-md'
                    : filteredTemplates.length === 2
                      ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl'
                      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-md sm:max-w-none'
                }`}
                style={{ width: '100%', marginInline: 'auto' }}
              >
                {filteredTemplates.map((template, i) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onUse={handleUseTemplate}
                    index={i}
                    reduceMotion={reduceMotion}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center !py-20">
                <p className="font-serif text-2xl text-stone-800 !mb-2">Nothing here yet</p>
                <p className="text-stone-500 !mb-6">No templates found in this category.</p>
                <button
                  onClick={() => setActiveCategory('all' as TemplateCategory)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-amber-800 hover:text-amber-900 cursor-pointer"
                >
                  View all templates <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ───────── Error toast ───────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2.5rem)] max-w-md flex items-center gap-3 bg-white border border-red-200 text-red-700 text-sm font-medium !px-4 !py-3.5 rounded-xl shadow-xl"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───────── Loading overlay ───────── */}
      <AnimatePresence>
        {creating && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 flex items-center justify-center !px-5"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white rounded-3xl !px-8 !py-9 sm:!px-10 text-center shadow-2xl w-full max-w-sm"
            >
              <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto !mb-5" />
              <p className="font-serif text-xl text-stone-900">Creating your invitation…</p>
              {creatingName && (
                <p className="text-sm text-amber-800 font-medium !mt-1">{creatingName}</p>
              )}
              <p className="text-sm text-stone-500 !mt-2">Setting up your workspace</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}