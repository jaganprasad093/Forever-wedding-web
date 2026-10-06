'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Heart, Star, Quote, MapPin } from 'lucide-react'

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
  },
]

export default function TestimonialsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="testimonials" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden" ref={ref}>
      {/* Decorative ambient background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-rose-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-100/70 border border-rose-200 text-rose-800 text-xs font-semibold uppercase tracking-widest mb-4">
            <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
            Loved by 10,000+ Couples
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-stone-900 leading-tight mb-4">
            Cherished Love <span className="italic text-amber-800 font-normal">Stories</span>
          </h2>

          <p className="text-stone-600 text-base sm:text-lg font-sans max-w-2xl mx-auto leading-relaxed">
            Discover how couples made their wedding announcements unforgettable for family and friends worldwide.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-16">
          {testimonials.map((item, idx) => (
            <motion.div
              key={item.couple}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="rounded-3xl bg-stone-50/80 p-7 sm:p-8 border border-stone-200/80 hover:border-amber-200 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Rating stars & Quote Icon */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex text-amber-400">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-amber-300/80" />
                </div>

                <p className="text-stone-700 font-sans text-sm sm:text-base leading-relaxed mb-6 italic">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-stone-200/60">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-serif text-lg font-bold text-stone-900">
                    {item.couple}
                  </h4>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {item.template}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-stone-500">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>{item.location}</span>
                  <span>•</span>
                  <span>{item.date}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Global Impact Counter Strip */}
        <div className="rounded-3xl bg-amber-50/70 border border-amber-200/70 p-6 sm:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { number: '10,000+', label: 'Digital Invitations Created' },
              { number: '1.2M+', label: 'Guest Pageviews Worldwide' },
              { number: '99.4%', label: 'RSVP Confirmation Rate' },
              { number: '15,000+', label: 'Trees & Paper Cards Saved' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col">
                <span className="font-serif text-3xl sm:text-4xl font-bold text-amber-800">
                  {stat.number}
                </span>
                <span className="text-xs sm:text-sm text-stone-600 font-medium mt-1">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
