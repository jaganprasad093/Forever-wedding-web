'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useInView, animate } from 'framer-motion'
import { Heart, Star, Quote, MapPin, CheckCircle2 } from 'lucide-react'

const testimonials = [
  {
    couple: 'Ananya & Siddharth',
    location: 'Kochi & Bangalore',
    date: 'Married Nov 2025',
    template: 'Kerala Traditional',
    quote:
      'Our guests were genuinely spellbound. When our relatives opened the WhatsApp link and heard our favorite shehnai flute melody playing while browsing our story, we received dozens of calls asking who designed it!',
    rating: 5,
    highlight: 'Elderly relatives found it so effortless to open',
    avatar: 'from-amber-500 to-amber-700',
  },
  {
    couple: 'Meera & Rohan',
    location: 'Taj Lake Palace, Udaipur',
    date: 'Married Jan 2026',
    template: 'Royal Midnight Gold',
    quote:
      'The RSVP feature alone saved us at least 25 hours of follow-up calls. Seeing our dietary preferences and party sizes sync live on our dashboard was an absolute lifesaver for our catering headcount.',
    rating: 5,
    highlight: 'RSVP headcount management was seamless',
    avatar: 'from-stone-700 to-stone-900',
  },
  {
    couple: 'Pooja & Kevin',
    location: 'Goa & London',
    date: 'Married Dec 2025',
    template: 'Floral Romance',
    quote:
      'Having guests fly in from across 8 different countries meant maps and multi-event timings were critical. The 1-click Google Calendar sync and venue navigation meant zero guests got lost.',
    rating: 5,
    highlight: 'Perfect for NRI & international wedding guests',
    avatar: 'from-rose-400 to-rose-600',
  },
]

const stats = [
  { to: 10000, decimals: 0, suffix: '+', label: 'Digital Invitations Created' },
  { to: 1.2, decimals: 1, suffix: 'M+', label: 'Guest Pageviews Worldwide' },
  { to: 99.4, decimals: 1, suffix: '%', label: 'RSVP Confirmation Rate' },
  { to: 15000, decimals: 0, suffix: '+', label: 'Trees & Paper Cards Saved' },
]

/* ─── Animation variants ─────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: 'easeOut' as const },
  }),
}

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, delay: 0.3 + i * 0.15, ease: 'easeOut' as const },
  }),
}

/* ─── Count-up number ────────────────────────────────────────────────── */
function CountUp({
  to,
  decimals,
  suffix,
  active,
  delay = 0,
}: {
  to: number
  decimals: number
  suffix: string
  active: boolean
  delay?: number
}) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!active) return
    const controls = animate(0, to, {
      duration: 1.8,
      delay,
      ease: 'easeOut',
      onUpdate: (v) => setValue(v),
    })
    return () => controls.stop()
  }, [active, to, delay])

  const text = value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return (
    <>
      {text}
      {suffix}
    </>
  )
}

const initials = (couple: string) =>
  couple
    .split('&')
    .map((n) => n.trim()[0])
    .join('')

export default function TestimonialsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const state = isInView ? 'visible' : 'hidden'

  return (
    <section
      id="testimonials"
      ref={ref}
      className="relative overflow-hidden bg-white !py-20 sm:!py-28 lg:!py-32 !px-5 sm:!px-8 lg:!px-12 scroll-mt-16"
    >
      {/* Ambient background glows */}
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-rose-100/40 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1.1, 1, 1.1], opacity: [1, 0.7, 1] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-10 -right-40 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* ───────── Header ───────── */}
        <div className="text-center max-w-3xl mx-auto !mb-14 sm:!mb-20">
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate={state}
            className="inline-flex items-center gap-2 !px-4 !py-1.5 rounded-full bg-rose-100/70 border border-rose-200 text-rose-800 text-[11px] sm:text-xs font-semibold uppercase tracking-widest !mb-6"
          >
            <motion.span
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex"
            >
              <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
            </motion.span>
            Loved by 10,000+ Couples
          </motion.div>

          <motion.h2
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate={state}
            className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-stone-900 leading-[1.15] !mb-5 sm:!mb-6"
          >
            Cherished Love <span className="italic text-amber-800 font-normal">Stories</span>
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
            className="text-stone-600 text-base sm:text-lg font-sans max-w-2xl mx-auto leading-relaxed !px-2"
          >
            Discover how couples made their wedding announcements unforgettable for family and friends worldwide.
          </motion.p>
        </div>

        {/* ───────── Testimonial cards ───────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 !mb-14 sm:!mb-20">
          {testimonials.map((item, idx) => (
            <motion.div
              key={item.couple}
              custom={idx}
              variants={cardVariants}
              initial="hidden"
              animate={state}
              whileHover={{ y: -8 }}
              className={`group relative overflow-hidden rounded-3xl bg-stone-50/80 !p-6 sm:!p-8 lg:!p-9 border border-stone-200/80 hover:border-amber-200 hover:bg-white hover:shadow-2xl hover:shadow-amber-900/10 transition-[background-color,border-color,box-shadow] duration-300 flex flex-col justify-between gap-7 ${idx === 2 ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
            >
              {/* Oversized watermark quote */}
              <Quote className="absolute -top-2 -right-2 w-28 h-28 text-amber-200/30 group-hover:text-amber-200/60 group-hover:rotate-6 transition-all duration-500 pointer-events-none" />

              <div className="relative">
                {/* Stars */}
                <div className="flex items-center gap-1 !mb-6">
                  {[...Array(item.rating)].map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0, rotate: -40 }}
                      animate={isInView ? { scale: 1, rotate: 0 } : {}}
                      transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.7 + idx * 0.15 + i * 0.07 }}
                      className="inline-flex"
                    >
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    </motion.span>
                  ))}
                </div>

                <p className="text-stone-700 font-sans text-sm sm:text-base leading-relaxed sm:leading-7 italic !mb-6">
                  &ldquo;{item.quote}&rdquo;
                </p>

                {/* Highlight chip */}
                <div className="inline-flex items-start gap-2 text-[11px] sm:text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 !px-3 !py-2 rounded-xl leading-snug">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-px" />
                  <span>{item.highlight}</span>
                </div>
              </div>

              {/* Couple footer */}
              <div className="relative !pt-5 border-t border-stone-200/70 flex items-center gap-4">
                <motion.div
                  whileHover={{ rotate: -8, scale: 1.08 }}
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${item.avatar} text-white font-serif font-bold text-sm flex items-center justify-center shadow-md ring-2 ring-white shrink-0`}
                >
                  {initials(item.couple)}
                </motion.div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 !mb-1">
                    <h4 className="font-serif text-lg font-bold text-stone-900 leading-snug">
                      {item.couple}
                    </h4>
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 !px-2.5 !py-0.5 rounded-full border border-amber-200 whitespace-nowrap">
                      {item.template}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-stone-500">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{item.location}</span>
                    <span className="text-stone-300">•</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ───────── Impact stats strip ───────── */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.9, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-amber-50/70 to-rose-50/60 border border-amber-200/70 !px-5 !py-9 sm:!px-10 sm:!py-12 shadow-xs"
        >
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -15, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-16 -right-16 w-64 h-64 bg-amber-200/30 rounded-full blur-3xl pointer-events-none"
          />

          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-y-9 gap-x-4 text-center">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`flex flex-col items-center gap-2 !px-2 ${i > 0 ? 'lg:border-l lg:border-amber-200/70' : ''
                  }`}
              >
                <span className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-800 tabular-nums leading-none">
                  <CountUp
                    to={stat.to}
                    decimals={stat.decimals}
                    suffix={stat.suffix}
                    active={isInView}
                    delay={1 + i * 0.1}
                  />
                </span>
                <span className="text-xs sm:text-sm text-stone-600 font-medium leading-snug max-w-[11rem]">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}