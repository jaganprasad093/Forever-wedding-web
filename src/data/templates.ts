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
  {
    id: 'template-celestial-starlight',
    name: 'Celestial Starlight',
    slug: 'celestial-starlight',
    category: 'luxury',
    thumbnail: '/templates/celestial-starlight/thumbnail.jpg',
    description:
      'Cosmic midnight indigo, glowing starlight constellations, interactive moon phase, and shooting stars for a celestial union.',
    componentKey: 'CelestialStarlight',
    config: {
      defaultTheme: {
        primaryColor: '#0f172a',
        secondaryColor: '#38bdf8',
        backgroundColor: '#030712',
        accentColor: '#facc15',
        fontFamily: 'cormorant',
      },
    },
    active: true,
  },
  {
    id: 'template-sunset-boho',
    name: 'Sunset Boho',
    slug: 'sunset-boho',
    category: 'modern',
    thumbnail: '/templates/sunset-boho/thumbnail.jpg',
    description:
      'Warm terracotta, desert sand, swaying pampas grass, and wax-sealed save-the-date envelope in golden hour light.',
    componentKey: 'SunsetBoho',
    config: {
      defaultTheme: {
        primaryColor: '#9a3412',
        secondaryColor: '#f59e0b',
        backgroundColor: '#fffbeb',
        accentColor: '#fdba74',
        fontFamily: 'cormorant',
      },
    },
    active: true,
  },
  {
    id: 'template-vintage-botanical',
    name: 'Vintage Botanical',
    slug: 'vintage-botanical',
    category: 'floral',
    thumbnail: '/templates/vintage-botanical/thumbnail.jpg',
    description:
      'Antique parchment, eucalyptus leaves, herbarium plates, and vintage pocket watch countdown for an enchanted garden wedding.',
    componentKey: 'VintageBotanical',
    config: {
      defaultTheme: {
        primaryColor: '#14532d',
        secondaryColor: '#3f6212',
        backgroundColor: '#faf7ee',
        accentColor: '#84cc16',
        fontFamily: 'cormorant',
      },
    },
    active: true,
  },
  {
    id: 'template-rajputana-palace',
    name: 'Rajputana Palace',
    slug: 'rajputana-palace',
    category: 'royal',
    thumbnail: '/templates/rajputana-palace/thumbnail.jpg',
    description:
      'Regal ruby velvet, marigold flower showers, Jharokha window reveals, and opulent royal darbar heritage.',
    componentKey: 'RajputanaPalace',
    config: {
      defaultTheme: {
        primaryColor: '#881337',
        secondaryColor: '#f59e0b',
        backgroundColor: '#1c040b',
        accentColor: '#fbbf24',
        fontFamily: 'cormorant',
      },
    },
    active: true,
  },
  {
    id: 'template-ocean-breeze',
    name: 'Ocean Breeze',
    slug: 'ocean-breeze',
    category: 'elegant',
    thumbnail: '/templates/ocean-breeze/thumbnail.jpg',
    description:
      'Coastal aquamarine, animated sea waves, pearl shimmer bubbles, and interactive message-in-a-bottle for a seaside celebration.',
    componentKey: 'OceanBreeze',
    config: {
      defaultTheme: {
        primaryColor: '#0e7490',
        secondaryColor: '#06b6d4',
        backgroundColor: '#f0fdfa',
        accentColor: '#38bdf8',
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
