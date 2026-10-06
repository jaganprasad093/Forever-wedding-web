import { Template, TemplateCategory } from '@/types/wedding'

export const TEMPLATES: Template[] = [
  {
    id: 'template-kerala-traditional',
    name: 'Kerala Traditional',
    slug: 'kerala-traditional',
    category: 'kerala',
    thumbnail: '/templates/kerala-traditional/thumbnail.jpg',
    description:
      'Elegant Kerala wedding aesthetic with ivory, gold, and traditional borders. Inspired by the rich cultural heritage of Kerala weddings.',
    componentKey: 'KeralaTraditional',
    config: {
      defaultTheme: {
        primaryColor: '#92400e',
        secondaryColor: '#b45309',
        backgroundColor: '#fffbeb',
        accentColor: '#fcd34d',
        fontFamily: 'cormorant',
      },
    },
    active: true,
  },
  {
    id: 'template-royal-gold',
    name: 'Royal Gold',
    slug: 'royal-gold',
    category: 'royal',
    thumbnail: '/templates/royal-gold/thumbnail.jpg',
    description:
      'Dark, cinematic luxury with gold accents and premium typography. A statement wedding invitation for the modern royals.',
    componentKey: 'RoyalGold',
    config: {
      defaultTheme: {
        primaryColor: '#d97706',
        secondaryColor: '#f59e0b',
        backgroundColor: '#0c0a09',
        accentColor: '#fbbf24',
        fontFamily: 'cormorant',
      },
    },
    active: true,
  },
  {
    id: 'template-minimal-white',
    name: 'Minimal White',
    slug: 'minimal-white',
    category: 'minimal',
    thumbnail: '/templates/minimal-white/thumbnail.jpg',
    description:
      'Clean, editorial minimalism with lots of whitespace and bold typography. Understated elegance for the modern couple.',
    componentKey: 'MinimalWhite',
    config: {
      defaultTheme: {
        primaryColor: '#1c1917',
        secondaryColor: '#292524',
        backgroundColor: '#fafaf9',
        accentColor: '#a8a29e',
        fontFamily: 'inter',
      },
    },
    active: true,
  },
  {
    id: 'template-floral-romantic',
    name: 'Floral Romantic',
    slug: 'floral-romantic',
    category: 'floral',
    thumbnail: '/templates/floral-romantic/thumbnail.jpg',
    description:
      'Soft pastels, gentle florals, and romantic typography. The perfect invitation for a garden wedding or spring celebration.',
    componentKey: 'FloralRomantic',
    config: {
      defaultTheme: {
        primaryColor: '#9d174d',
        secondaryColor: '#be185d',
        backgroundColor: '#fdf2f8',
        accentColor: '#f9a8d4',
        fontFamily: 'cormorant',
      },
    },
    active: true,
  },
]

export const TEMPLATE_CATEGORIES: { id: TemplateCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'luxury', label: 'Luxury' },
  { id: 'floral', label: 'Floral' },
  { id: 'traditional', label: 'Traditional' },
  { id: 'kerala', label: 'Kerala' },
  { id: 'modern', label: 'Modern' },
  { id: 'royal', label: 'Royal' },
  { id: 'elegant', label: 'Elegant' },
]

export function getTemplateById(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id)
}

export function getTemplateBySlug(slug: string): Template | undefined {
  return TEMPLATES.find((t) => t.slug === slug)
}

export function getTemplatesByCategory(
  category: TemplateCategory
): Template[] {
  if (category === 'all') return TEMPLATES
  return TEMPLATES.filter((t) => t.category === category)
}
