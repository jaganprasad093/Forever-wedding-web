'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ArrowRight, Eye, X } from 'lucide-react'
import Link from 'next/link'
import { TEMPLATES, TEMPLATE_CATEGORIES } from '@/data/templates'
import { Template, TemplateCategory } from '@/types/wedding'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { generateSlug } from '@/lib/utils'

function TemplateCard({
  template,
  onUse,
  index,
}: {
  template: Template
  onUse: (template: Template) => void
  index: number
}) {
  const previewStyles: Record<string, { bg: string; text: string; accent: string }> = {
    'template-kerala-traditional': {
      bg: 'bg-gradient-to-br from-amber-50 to-yellow-100',
      text: 'text-amber-900',
      accent: 'border-amber-300',
    },
    'template-royal-gold': {
      bg: 'bg-gradient-to-br from-stone-900 to-stone-800',
      text: 'text-amber-400',
      accent: 'border-amber-600',
    },
    'template-minimal-white': {
      bg: 'bg-white',
      text: 'text-stone-900',
      accent: 'border-stone-300',
    },
    'template-floral-romantic': {
      bg: 'bg-gradient-to-br from-rose-50 to-pink-100',
      text: 'text-rose-800',
      accent: 'border-rose-300',
    },
  }

  const style = previewStyles[template.id] || {
    bg: 'bg-amber-50',
    text: 'text-stone-800',
    accent: 'border-amber-200',
  }

  const categoryColors: Record<string, string> = {
    kerala: 'bg-amber-100 text-amber-700',
    royal: 'bg-purple-100 text-purple-700',
    minimal: 'bg-stone-100 text-stone-700',
    floral: 'bg-rose-100 text-rose-700',
    luxury: 'bg-yellow-100 text-yellow-700',
  }
  const categoryColor = categoryColors[template.category] || 'bg-stone-100 text-stone-700'

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group bg-white rounded-2xl border border-stone-100 shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-500 overflow-hidden cursor-pointer"
    >
      {/* Preview */}
      <div className={`${style.bg} h-72 relative overflow-hidden`}>
        {/* Ornamental corners */}
        <div className={`absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 ${style.accent} opacity-30`} />
        <div className={`absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 ${style.accent} opacity-30`} />
        <div className={`absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 ${style.accent} opacity-30`} />
        <div className={`absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 ${style.accent} opacity-30`} />

        <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
          <p className={`text-xs font-medium ${style.text} opacity-50 uppercase tracking-[0.3em] mb-3`}>
            Wedding Invitation
          </p>
          <div className={`w-16 h-px ${style.text === 'text-amber-400' ? 'bg-amber-400' : 'bg-current'} opacity-20 mb-4`} />
          <h3 className={`font-serif text-3xl font-medium ${style.text} mb-1 text-center`}>
            Jagan
          </h3>
          <p className={`font-serif text-xl ${style.text} opacity-50 mb-1`}>&amp;</p>
          <h3 className={`font-serif text-3xl font-medium ${style.text} mb-4 text-center`}>
            Anu
          </h3>
          <div className={`w-16 h-px ${style.text === 'text-amber-400' ? 'bg-amber-400' : 'bg-current'} opacity-20 mb-3`} />
          <p className={`text-xs ${style.text} opacity-40 tracking-wider`}>
            12 December 2026
          </p>
          <p className={`text-xs ${style.text} opacity-30 mt-1`}>Thrissur, Kerala</p>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3">
          <Link
            href={`/templates/preview/${template.slug}`}
            className="flex items-center gap-2 bg-white text-stone-800 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-amber-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Link>
          <button
            onClick={() => onUse(template)}
            className="flex items-center gap-2 bg-amber-600 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-amber-700 transition-colors"
          >
            <Heart className="w-4 h-4" />
            Use This Template
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-stone-800 text-sm">{template.name}</h4>
          <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{template.description}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${categoryColor} capitalize flex-shrink-0 ml-3`}>
          {template.category}
        </span>
      </div>
    </motion.div>
  )
}

export default function TemplatesPage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('all')
  const [creating, setCreating] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  const filteredTemplates =
    activeCategory === 'all'
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.category === activeCategory)

  const handleUseTemplate = async (template: Template) => {
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

      const { data: wedding, error } = await supabase
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

      if (error) throw error

      router.push(`/editor/${wedding.id}`)
    } catch (error) {
      console.error('Error creating wedding:', error)
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900 text-white pt-20 pb-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-medium text-amber-300 uppercase tracking-[0.3em] mb-3">
            Premium Templates
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-medium mb-4">
            Find Your Perfect{' '}
            <span className="italic text-amber-300">Template</span>
          </h1>
          <p className="text-white/70 max-w-xl mx-auto">
            Professionally designed wedding invitation templates for every style and culture.
          </p>
        </div>
      </div>

      {/* Category filters */}
      <div className="sticky top-0 z-20 bg-white border-b border-stone-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar">
            {TEMPLATE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                  activeCategory === cat.id
                    ? 'bg-amber-700 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-800 hover:bg-stone-100'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredTemplates.map((template, i) => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={handleUseTemplate}
                index={i}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-20">
            <p className="text-stone-500">No templates found in this category.</p>
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {creating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-medium text-stone-800">Creating your invitation...</p>
            <p className="text-sm text-stone-500 mt-1">Setting up your workspace</p>
          </div>
        </div>
      )}
    </div>
  )
}
