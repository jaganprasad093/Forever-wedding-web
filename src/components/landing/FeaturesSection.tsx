'use client'

import { useRef, useState, useEffect, type ReactNode } from 'react'
import { motion, useInView, animate } from 'framer-motion'
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
  Navigation,
} from 'lucide-react'

/* ─── Animation variants ─────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: 'easeOut' as const },
  }),
}

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, delay: 0.15 + i * 0.12, ease: 'easeOut' as const },
  }),
}

/* ─── Small helpers ──────────────────────────────────────────────────── */
function CountUp({ to, active }: { to: number; active: boolean }) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!active) return
    const controls = animate(0, to, {
      duration: 1.6,
      delay: 0.5,
      ease: 'easeOut',
      onUpdate: (v) => setValue(Math.round(v)),
    })
    return () => controls.stop()
  }, [active, to])
  return <>{value}</>
}

function FeatureCard({
  index,
  inView,
  className,
  children,
}: {
  index: number
  inView: boolean
  className: string
  children: ReactNode
}) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      whileHover={{ y: -6 }}
      className={`${className} group rounded-3xl bg-white !p-6 sm:!p-8 lg:!p-9 border border-amber-100 shadow-sm hover:shadow-xl hover:shadow-amber-900/5 hover:border-amber-200 transition-[box-shadow,border-color] duration-300 flex flex-col justify-between gap-8`}
    >
      {children}
    </motion.div>
  )
}

function IconBadge({ tone, children }: { tone: string; children: ReactNode }) {
  return (
    <motion.div
      whileHover={{ rotate: -8, scale: 1.1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-xs ${tone}`}
    >
      {children}
    </motion.div>
  )
}

const guests = [
  { name: 'Dr. Ramesh & Family', count: '+3 Guests', veg: 'Vegetarian' },
  { name: 'Ananya Sharma', count: '+1 Guest', veg: 'Vegan' },
  { name: 'Karthik & Priya', count: '+2 Guests', veg: 'Standard' },
]

const waveHeights = [12, 24, 38, 18, 44, 28, 36, 16, 42, 30, 22, 34, 18, 28, 40, 20, 32, 14, 26, 38]

export default function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      id="features"
      ref={ref}
      className="relative overflow-hidden bg-stone-50/60 !py-20 sm:!py-28 lg:!py-32 !px-5 sm:!px-8 lg:!px-12"
    >
      {/* Decorative glows (slow breathing) */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 -right-40 w-96 h-96 bg-amber-200/25 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1.1, 1, 1.1], opacity: [1, 0.7, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-10 -left-40 w-96 h-96 bg-rose-200/25 rounded-full blur-3xl pointer-events-none"
      />

      <div className="max-w-7xl mx-auto relative z-10" style={{ width: '100%', marginInline: 'auto' }}>
        {/* ───────── Header ───────── */}
        <div
          className="flex flex-col items-center text-center max-w-3xl mx-auto !mb-14 sm:!mb-20"
          style={{ width: '100%', marginInline: 'auto' }}
        >
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="inline-flex items-center gap-2 !px-4 !py-1.5 rounded-full bg-amber-100/70 border border-amber-200 text-amber-800 text-[11px] sm:text-xs font-semibold uppercase tracking-widest !mb-6"
          >
            <motion.span
              animate={{ rotate: [0, 18, -18, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            </motion.span>
            Designed For Modern Couples
          </motion.div>

          <motion.h2
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-stone-900 leading-[1.15] !mb-5 sm:!mb-6 text-center text-balance"
          >
            Everything You Need For An{' '}
            <span className="italic text-amber-800 font-normal">Unforgettable</span> Celebration
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
            animate={isInView ? 'visible' : 'hidden'}
            className="text-stone-600 text-base sm:text-lg font-sans max-w-2xl leading-relaxed !px-2 text-center text-balance"
            style={{ marginInline: 'auto' }}
          >
            Far beyond a static PDF. Deliver a cinematic, interactive wedding website
            that excites your guests and eliminates wedding planning chaos.
          </motion.p>
        </div>

        {/* ───────── Bento grid ───────── */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8"
          style={{ width: '100%', marginInline: 'auto' }}
        >

          {/* 1 · RSVP */}
          <FeatureCard index={0} inView={isInView} className="md:col-span-2 lg:col-span-2">
            <div>
              <div className="flex items-center justify-between !mb-5">
                <IconBadge tone="bg-amber-100 text-amber-800">
                  <Users className="w-6 h-6" />
                </IconBadge>
                <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 !px-3 !py-1.5 rounded-full border border-emerald-200">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  Live Sync
                </span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900 !mb-3 leading-snug">
                Automated RSVP &amp; Meal Preferences
              </h3>
              <p className="text-stone-600 text-sm sm:text-[15px] leading-relaxed font-sans">
                Say goodbye to scattered WhatsApp replies. Guests confirm their attendance, party size, dietary choices, and leave sweet blessings directly on your invitation.
              </p>
            </div>

            <div className="bg-stone-50 rounded-2xl !p-4 sm:!p-5 border border-stone-200/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-semibold text-stone-700 !mb-3">
                <span>Guest Confirmations</span>
                <span className="text-emerald-700 font-bold">
                  <CountUp to={164} active={isInView} /> Confirmed / 190 Invited
                </span>
              </div>
              <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden !mb-5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: '86%' } : {}}
                  transition={{ duration: 1.6, delay: 0.5, ease: 'easeOut' }}
                  className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full"
                />
              </div>

              <div className="flex flex-col gap-2.5">
                {guests.map((g, idx) => (
                  <motion.div
                    key={g.name}
                    initial={{ opacity: 0, x: -24 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.9 + idx * 0.15 }}
                    className="flex items-center justify-between gap-3 bg-white !px-3.5 !py-2.5 rounded-xl border border-stone-200/70 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-[11px] shrink-0">
                        {g.name[0]}
                      </div>
                      <div className="min-w-0 truncate">
                        <span className="font-medium text-stone-800">{g.name}</span>
                        <span className="text-[10px] text-stone-400 ml-1.5 hidden sm:inline">{g.count}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] bg-stone-100 text-stone-600 !px-2 !py-0.5 rounded-md">
                        {g.veg}
                      </span>
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={isInView ? { scale: 1 } : {}}
                        transition={{ type: 'spring', delay: 1.2 + idx * 0.15 }}
                        className="inline-flex"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      </motion.span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </FeatureCard>

          {/* 2 · Music */}
          <FeatureCard index={1} inView={isInView} className="md:col-span-1 lg:col-span-2">
            <div>
              <div className="!mb-5">
                <IconBadge tone="bg-rose-100 text-rose-800">
                  <Music className="w-6 h-6" />
                </IconBadge>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900 !mb-3 leading-snug">
                Cinematic Background Music
              </h3>
              <p className="text-stone-600 text-sm sm:text-[15px] leading-relaxed font-sans">
                Set an unforgettable romantic atmosphere from the moment guests open your link. Choose from classical shehnai, acoustic guitar, gentle piano, or upload your couple song.
              </p>
            </div>

            <div className="bg-gradient-to-br from-rose-50/80 to-amber-50/60 rounded-2xl !p-4 sm:!p-5 border border-rose-200/50">
              <div className="flex items-center gap-3.5 !mb-4">
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-11 h-11 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md shrink-0"
                >
                  <Music className="w-5 h-5" />
                </motion.div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-stone-800 truncate">Wedding Shehnai &amp; Strings (Acoustic)</p>
                  <p className="text-[11px] text-stone-500 !mt-0.5">Auto-plays smoothly on first tap</p>
                </div>
              </div>
              {/* Equalizer: heights animated as % so they stay inside the box */}
              <div className="flex items-end justify-between gap-[3px] h-16 bg-white/70 backdrop-blur-xs rounded-xl !p-3 border border-rose-100">
                {waveHeights.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: `${h * 0.4}%` }}
                    animate={{ height: [`${h * 0.4}%`, `${h}%`, `${h * 0.5}%`] }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      delay: i * 0.05,
                      ease: 'easeInOut',
                    }}
                    className="flex-1 max-w-[6px] bg-gradient-to-t from-rose-500 to-amber-500 rounded-full"
                  />
                ))}
              </div>
            </div>
          </FeatureCard>

          {/* 3 · WhatsApp & QR */}
          <FeatureCard index={2} inView={isInView} className="md:col-span-1 lg:col-span-2">
            <div>
              <div className="!mb-5">
                <IconBadge tone="bg-emerald-100 text-emerald-800">
                  <Share2 className="w-6 h-6" />
                </IconBadge>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900 !mb-3 leading-snug">
                1-Click WhatsApp &amp; QR Code Sharing
              </h3>
              <p className="text-stone-600 text-sm sm:text-[15px] leading-relaxed font-sans">
                Distribute your invitation across WhatsApp family groups, Instagram, or printed physical cards with personalized QR codes. No app download required for guests.
              </p>
            </div>

            <div className="bg-stone-50 rounded-2xl !p-4 sm:!p-5 border border-stone-200/70 flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center md:items-start lg:items-center gap-4 sm:gap-5">
              <div className="relative !p-3.5 bg-white rounded-xl shadow-xs border border-stone-200 shrink-0 overflow-hidden">
                <QrCode className="w-12 h-12 text-stone-800" />
                {/* Scanning line */}
                <motion.div
                  animate={{ top: ['10%', '85%'] }}
                  transition={{ duration: 1.8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                  className="absolute left-0 right-0 h-0.5 bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                />
              </div>
              <div className="flex flex-col gap-1.5 text-xs">
                <p className="font-semibold text-stone-800">Scan to Open Invitation</p>
                <p className="text-stone-500 text-[11px] leading-relaxed">
                  Print directly on thank-you cards, gifts, or venue signboards.
                </p>
                <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium !pt-1">
                  <Smartphone className="w-3 h-3" />
                  <span>Works on iPhone &amp; Android instantly</span>
                </div>
              </div>
            </div>
          </FeatureCard>

          {/* 4 · Itinerary & navigation */}
          <FeatureCard index={3} inView={isInView} className="md:col-span-2 lg:col-span-2">
            <div>
              <div className="!mb-5">
                <IconBadge tone="bg-amber-100 text-amber-800">
                  <Navigation className="w-6 h-6" />
                </IconBadge>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900 !mb-3 leading-snug">
                Interactive Itinerary &amp; Navigation
              </h3>
              <p className="text-stone-600 text-sm sm:text-[15px] leading-relaxed font-sans">
                Never worry about lost guests. Provide 1-click Google Maps driving navigation, Uber ride links, and Apple/Google Calendar reminders for every ceremony.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <motion.div
                whileHover={{ y: -3, scale: 1.02 }}
                className="bg-amber-50/70 !p-4 rounded-xl border border-amber-200/70 flex items-start gap-3 cursor-default"
              >
                <Calendar className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-stone-800">Add to Calendar</p>
                  <p className="text-[11px] text-stone-500 !mt-0.5">Google Calendar &amp; iCal sync</p>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ y: -3, scale: 1.02 }}
                className="bg-amber-50/70 !p-4 rounded-xl border border-amber-200/70 flex items-start gap-3 cursor-default"
              >
                <motion.span
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-flex shrink-0 mt-0.5"
                >
                  <MapPin className="w-4 h-4 text-amber-700" />
                </motion.span>
                <div>
                  <p className="text-xs font-semibold text-stone-800">1-Tap Directions</p>
                  <p className="text-[11px] text-stone-500 !mt-0.5">Google Maps / Apple Maps</p>
                </div>
              </motion.div>
            </div>
          </FeatureCard>

        </div>
      </div>
    </section>
  )
}