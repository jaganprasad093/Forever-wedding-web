'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, MotionConfig, animate, useInView, useReducedMotion } from 'framer-motion'
import { Star, MapPin } from 'lucide-react'

const testimonials = [
  {
    couple: 'Ananya & Siddharth',
    location: 'Kochi & Bangalore',
    date: 'Married Nov 2025',
    template: 'Kerala Traditional',
    quote:
      'Our guests were genuinely spellbound. When our relatives opened the WhatsApp link and heard our favorite shehnai flute melody playing while browsing our story, we received dozens of calls asking who designed it!',
    rating: 5,
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
    avatar: 'from-rose-400 to-rose-600',
  },
]

const stats = [
  { to: 10000, decimals: 0, suffix: '+', label: 'Invitations created' },
  { to: 1.2, decimals: 1, suffix: 'M+', label: 'Guest pageviews worldwide' },
  { to: 99.4, decimals: 1, suffix: '%', label: 'RSVP confirmation rate' },
  { to: 15000, decimals: 0, suffix: '+', label: 'Paper cards saved' },
]

/*
  Layout note: centring, padding and widths use flex/grid `gap` and inline
  styles instead of mx-auto / p-* / m-* classes, so the section stays correct
  even if a global `* { margin: 0; padding: 0 }` reset overrides Tailwind v4
  utilities (the likely reason `mx-auto` had no effect before).
*/

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, delay, ease: 'easeOut' as const },
})

function CountUp({
  to,
  decimals,
  suffix,
  active,
}: {
  to: number
  decimals: number
  suffix: string
  active: boolean
}) {
  const reduce = useReducedMotion()
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active || reduce) return

    const controls = animate(0, to, {
      duration: 1.6,
      ease: 'easeOut',
      onUpdate: setValue,
    })
    return () => controls.stop()
  }, [active, to, reduce])

  const displayValue = reduce ? to : value

  return (
    <>
      {displayValue.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
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
  const statsRef = useRef<HTMLDivElement>(null)
  const statsInView = useInView(statsRef, { once: true, margin: '-60px' })

  return (
    <MotionConfig reducedMotion="user">
      <section
        id="testimonials"
        className="w-full bg-white scroll-mt-16"
        style={{ padding: 'clamp(4rem, 9vw, 7rem) clamp(1.25rem, 5vw, 3rem)' }}
      >
        <div
          className="flex flex-col gap-12 sm:gap-16"
          style={{ width: '100%', maxWidth: '72rem', marginInline: 'auto' }}
        >
          {/* Header */}
          <motion.header {...fadeUp()} className="flex flex-col items-center gap-4 text-center">
            <h2 className="font-serif font-normal text-stone-900 leading-[1.15] text-balance text-[clamp(2rem,5vw,3.5rem)]">
              Cherished love <span className="italic text-amber-800">stories</span>
            </h2>
            <p className="max-w-xl text-base sm:text-lg leading-relaxed text-stone-600 text-balance">
              See how couples made their wedding announcements unforgettable for family and friends worldwide.
            </p>
          </motion.header>

          {/* Testimonials */}
          <ul
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-8 list-none"
            style={{ padding: 0 }}
          >
            {testimonials.map((item, idx) => (
              <motion.li
                key={item.couple}
                {...fadeUp(idx * 0.1)}
                className={`flex flex-col justify-between gap-6 rounded-3xl border border-stone-200 bg-stone-50/70 transition-[border-color,box-shadow] duration-300 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-900/5 ${idx === 2 ? 'md:col-span-2 lg:col-span-1' : ''
                  }`}
                style={{ padding: 'clamp(1.5rem, 3vw, 2.25rem)' }}
              >
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-1" aria-label={`${item.rating} out of 5 stars`}>
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <blockquote className="text-base leading-relaxed sm:leading-7 text-stone-700">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                </div>

                <div className="flex items-center gap-4 border-t border-stone-200" style={{ paddingTop: '1.25rem' }}>
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${item.avatar} font-serif text-sm font-bold text-white ring-2 ring-white`}
                  >
                    {initials(item.couple)}
                  </div>
                  <div className="flex min-w-0 flex-col gap-1">
                    <p className="font-serif text-lg font-bold leading-snug text-stone-900">{item.couple}</p>
                    <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-stone-500">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                      <span>{item.location}</span>
                      <span aria-hidden className="text-stone-300">
                        •
                      </span>
                      <span>{item.date}</span>
                    </p>
                    <p className="text-xs font-medium text-amber-700">{item.template}</p>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>

          {/* Stats */}
          <motion.div
            ref={statsRef}
            {...fadeUp()}
            className="rounded-3xl border border-amber-200/70 bg-amber-50/60"
            style={{ padding: 'clamp(1.75rem, 4vw, 3rem) clamp(1rem, 3vw, 2.5rem)' }}
          >
            <dl className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-9 text-center">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`flex flex-col items-center gap-2 ${i > 0 ? 'lg:border-l lg:border-amber-200/70' : ''
                    }`}
                  style={{ padding: '0 0.5rem' }}
                >
                  <dd className="order-1 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-none tabular-nums text-amber-800">
                    <CountUp to={stat.to} decimals={stat.decimals} suffix={stat.suffix} active={statsInView} />
                  </dd>
                  <dt className="order-2 max-w-[11rem] text-xs sm:text-sm font-medium leading-snug text-stone-600">
                    {stat.label}
                  </dt>
                </div>
              ))}
            </dl>
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  )
}