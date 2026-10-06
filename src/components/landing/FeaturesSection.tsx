'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { 
  Users, 
  Music, 
  MapPin, 
  Calendar, 
  Share2, 
  Sparkles, 
  Check, 
  QrCode, 
  Smartphone, 
  Navigation 
} from 'lucide-react'

export default function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="features" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-stone-50/60 relative overflow-hidden" ref={ref}>
      {/* Decorative background radial glows */}
      <div className="absolute top-1/4 -right-40 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-40 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100/70 border border-amber-200 text-amber-800 text-xs font-semibold uppercase tracking-widest mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Designed For Modern Couples
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-stone-900 leading-tight mb-4"
          >
            Everything You Need For An{' '}
            <span className="italic text-amber-800 font-normal">Unforgettable</span> Celebration
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-stone-600 text-base sm:text-lg font-sans max-w-2xl mx-auto leading-relaxed"
          >
            Far beyond a static PDF. Deliver a cinematic, interactive wedding website
            that excites your guests and eliminates wedding planning chaos.
          </motion.p>
        </div>

        {/* ========================================================================= */}
        {/* BENTO GRID OF FEATURES */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          
          {/* Bento Item 1: Real-time RSVP & Guest Manager (Span 2 cols on lg) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="md:col-span-2 lg:col-span-2 rounded-3xl bg-white p-6 sm:p-8 border border-amber-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                  Live Sync
                </span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900 mb-2">
                Automated RSVP &amp; Meal Preferences
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-6 font-sans">
                Say goodbye to scattered WhatsApp replies. Guests confirm their attendance, party size, dietary choices, and leave sweet blessings directly on your invitation.
              </p>
            </div>

            {/* Interactive RSVP Mockup Panel */}
            <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200/60">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-2">
                <span>Guest Confirmations</span>
                <span className="text-emerald-700 font-bold">164 Confirmed / 190 Invited</span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden mb-4">
                <div className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full w-[86%]" />
              </div>

              {/* Guest Rows */}
              <div className="space-y-2">
                {[
                  { name: 'Dr. Ramesh & Family', count: '+3 Guests', veg: 'Vegetarian', time: 'Just now' },
                  { name: 'Ananya Sharma', count: '+1 Guest', veg: 'Vegan', time: '12m ago' },
                  { name: 'Karthik & Priya', count: '+2 Guests', veg: 'Standard', time: '1h ago' },
                ].map((g, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white px-3.5 py-2 rounded-xl border border-stone-200/70 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-[10px]">
                        {g.name[0]}
                      </div>
                      <div>
                        <span className="font-medium text-stone-800">{g.name}</span>
                        <span className="text-[10px] text-stone-400 ml-1.5">{g.count}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md">
                        {g.veg}
                      </span>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Bento Item 2: Background Music Experience (Span 1 or 2 on md) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:col-span-1 lg:col-span-2 rounded-3xl bg-white p-6 sm:p-8 border border-amber-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center mb-4">
                <Music className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900 mb-2">
                Cinematic Background Music
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-6 font-sans">
                Set an unforgettable romantic atmosphere from the moment guests open your link. Choose from classical shehnai, acoustic guitar, gentle piano, or upload your couple song.
              </p>
            </div>

            {/* Audio Wave Visualizer Card */}
            <div className="bg-gradient-to-br from-rose-50/80 to-amber-50/60 rounded-2xl p-5 border border-rose-200/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md">
                  <Music className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-800">Wedding Shehnai &amp; Strings (Acoustic)</p>
                  <p className="text-[11px] text-stone-500">Auto-plays smoothly on first tap</p>
                </div>
              </div>
              {/* Sound waves graphic */}
              <div className="flex items-end justify-between gap-1 h-12 bg-white/70 backdrop-blur-xs rounded-xl p-3 border border-rose-100">
                {[12, 24, 38, 18, 44, 28, 36, 16, 42, 30, 22, 34, 18, 28, 40, 20, 32, 14, 26, 38].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [h * 0.4, h, h * 0.5] }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      delay: i * 0.05,
                      ease: 'easeInOut',
                    }}
                    className="w-1.5 bg-gradient-to-t from-rose-500 to-amber-500 rounded-full"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Bento Item 3: 1-Click WhatsApp & QR Sharing */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="md:col-span-1 lg:col-span-2 rounded-3xl bg-white p-6 sm:p-8 border border-amber-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900 mb-2">
                1-Click WhatsApp &amp; QR Code Sharing
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-6 font-sans">
                Distribute your invitation across WhatsApp family groups, Instagram, or printed physical cards with personalized QR codes. No app download required for guests.
              </p>
            </div>

            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/70 flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl shadow-xs border border-stone-200 shrink-0">
                <QrCode className="w-12 h-12 text-stone-800" />
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-stone-800">Scan to Open Invitation</p>
                <p className="text-stone-500 text-[11px]">Print directly on thank-you cards, gifts, or venue signboards.</p>
                <div className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium pt-1">
                  <Smartphone className="w-3 h-3" />
                  <span>Works on iPhone &amp; Android instantly</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bento Item 4: Interactive Venue & Google Maps Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="md:col-span-2 lg:col-span-2 rounded-3xl bg-white p-6 sm:p-8 border border-amber-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
                <Navigation className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900 mb-2">
                Interactive Itinerary &amp; Navigation
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-6 font-sans">
                Never worry about lost guests. Provide 1-click Google Maps driving navigation, Uber ride links, and Apple/Google Calendar reminders for every ceremony.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/70 flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-stone-800">Add to Calendar</p>
                  <p className="text-[11px] text-stone-500">Google Calendar &amp; iCal sync</p>
                </div>
              </div>
              <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/70 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-stone-800">1-Tap Directions</p>
                  <p className="text-[11px] text-stone-500">Google Maps / Apple Maps</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
