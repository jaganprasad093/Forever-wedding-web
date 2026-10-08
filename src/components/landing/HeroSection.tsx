'use client'

import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowRight,
  Sparkles,
  Calendar,
  MapPin,
  CheckCircle2,
  Volume2,
  VolumeX,
  ChevronRight,
  Star,
  Share2,
  Users,
} from 'lucide-react'

// Floating particles & romantic motifs (large screens only)
const floatingDecorations = [
  { icon: '✨', top: '12%', left: '6%', size: 'text-xl', delay: 0, duration: 4.5 },
  { icon: '🌸', top: '18%', right: '8%', size: 'text-2xl', delay: 1.2, duration: 5.5 },
  { icon: '💍', top: '55%', left: '4%', size: 'text-2xl', delay: 0.7, duration: 6 },
  { icon: '🕊️', top: '68%', right: '5%', size: 'text-xl', delay: 2, duration: 5.2 },
  { icon: '🌹', top: '38%', right: '12%', size: 'text-2xl', delay: 1.8, duration: 4.8 },
  { icon: '🌿', top: '42%', left: '10%', size: 'text-xl', delay: 2.5, duration: 6.2 },
]

// Theme presets for the interactive hero preview
const heroThemes = [
  {
    id: 'kerala',
    name: 'Kerala Traditional',
    short: 'Kerala',
    bg: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50/80',
    border: 'border-amber-300/80',
    textColor: 'text-amber-950',
    subColor: 'text-amber-800',
    goldAccent: 'text-amber-600',
    sealBg: 'bg-gradient-to-br from-amber-600 to-yellow-600',
    musicTrack: 'Mangalyam Thanthunanena (Instrumental)',
    venue: 'Thrissur, Kerala',
  },
  {
    id: 'royal',
    name: 'Royal Midnight Gold',
    short: 'Royal',
    bg: 'bg-gradient-to-br from-stone-950 via-stone-900 to-neutral-900',
    border: 'border-amber-500/60',
    textColor: 'text-white',
    subColor: 'text-stone-300',
    goldAccent: 'text-amber-400',
    sealBg: 'bg-gradient-to-br from-amber-500 to-amber-700',
    musicTrack: 'Royal Symphony & Strings',
    venue: 'Taj Lake Palace, Udaipur',
  },
  {
    id: 'floral',
    name: 'Blush Floral Romance',
    short: 'Floral',
    bg: 'bg-gradient-to-br from-rose-50 via-pink-50/70 to-rose-100/60',
    border: 'border-rose-300/80',
    textColor: 'text-rose-950',
    subColor: 'text-rose-800',
    goldAccent: 'text-rose-600',
    sealBg: 'bg-gradient-to-br from-rose-500 to-pink-600',
    musicTrack: "Can't Help Falling in Love (Acoustic Flute)",
    venue: 'The Leela Palace, Bengaluru',
  },
]

export default function HeroSection() {
  const reduceMotion = useReducedMotion()
  const [activeTheme, setActiveTheme] = useState(heroThemes[0])
  const [isPlayingMusic, setIsPlayingMusic] = useState(true)
  const [rsvpSimulated, setRsvpSimulated] = useState(false)

  // Countdown timer simulation
  const [countdown, setCountdown] = useState({
    days: 248,
    hours: 14,
    minutes: 36,
    seconds: 42,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        if (prev.days > 0) return { days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
        return prev
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const dividerColor = activeTheme.id === 'royal' ? 'bg-amber-500/40' : 'bg-amber-600/30'
  const tileBg = activeTheme.id === 'royal' ? 'bg-white/10 border-white/10' : 'bg-white/60 border-stone-200/50'

  return (
    <section className="relative min-h-[100svh] !pt-24 sm:!pt-32 lg:!pt-36 !pb-16 sm:!pb-24 lg:!pb-28 !px-4 min-[400px]:!px-5 sm:!px-8 lg:!px-12 overflow-hidden bg-radial-vignette flex flex-col justify-center">
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[420px] sm:w-[900px] h-[400px] bg-gradient-to-b from-amber-200/35 via-rose-100/25 to-transparent rounded-full blur-3xl -z-10" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-amber-300/20 rounded-full blur-3xl -z-10 animate-pulse-glow" />
        <div className="absolute bottom-10 -right-32 w-96 h-96 bg-rose-200/25 rounded-full blur-3xl -z-10 animate-pulse-glow" />
        <div className="absolute inset-0 bg-mandala-pattern opacity-40 -z-20" />
      </div>

      {/* Floating romantic elements (lg+, skipped if user prefers reduced motion) */}
      {!reduceMotion &&
        floatingDecorations.map((item, idx) => (
          <motion.div
            key={idx}
            className={`absolute ${item.size} select-none pointer-events-none hidden lg:block z-0`}
            style={{ top: item.top, left: item.left, right: item.right }}
            animate={{ y: [0, -18, 0], rotate: [-4, 6, -4] }}
            transition={{ duration: item.duration, repeat: Infinity, delay: item.delay, ease: 'easeInOut' }}
          >
            {item.icon}
          </motion.div>
        ))}

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {/* ───────── Intro ───────── */}
        <div className="text-center max-w-4xl xl:max-w-5xl mx-auto !mb-12 sm:!mb-20 lg:!mb-24">
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 !px-3.5 sm:!px-4 !py-2 rounded-full bg-white/90 backdrop-blur-md border border-amber-200/80 shadow-xs !mb-5 sm:!mb-8"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[10px] min-[400px]:text-[11px] sm:text-xs font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-amber-800">
              Digital Wedding Invitations
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-[2rem] min-[400px]:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-normal tracking-tight text-stone-900 leading-[1.12] sm:leading-[1.1] !mb-5 sm:!mb-8 text-balance"
          >
            Craft a Wedding Invitation{' '}
            <span className="italic font-normal block sm:inline text-amber-800">
              They&apos;ll Cherish
            </span>{' '}
            <span className="text-gold-shimmer font-medium">Forever.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[15px] sm:text-lg md:text-xl text-stone-600 max-w-2xl mx-auto font-sans leading-relaxed !mb-8 sm:!mb-12"
          >
            Elevate your love story with breathtaking music, an interactive itinerary,
            instant WhatsApp RSVP tracking, and Google Maps venue guidance — all
            beautifully personalized in under 5 minutes.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-sm sm:max-w-none mx-auto !mb-10 sm:!mb-14"
          >
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 sm:gap-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-white font-medium text-sm sm:text-base !px-5 sm:!px-9 !py-3.5 sm:!py-4 rounded-full shadow-lg shadow-amber-600/25 hover:shadow-xl hover:shadow-amber-600/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group"
            >
              <Sparkles className="hidden sm:block w-5 h-5 text-amber-200 shrink-0" />
              <span className="leading-tight">Create Your Invitation — Free</span>
              <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="#preview-card"
              className="inline-flex items-center justify-center gap-2 bg-white/90 hover:bg-white text-stone-800 border border-stone-200/80 hover:border-amber-300 font-medium text-sm sm:text-base !px-5 sm:!px-8 !py-3.5 sm:!py-4 rounded-full shadow-xs hover:shadow-md transition-all duration-300"
            >
              <span>Explore Interactive Demo</span>
              <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-2xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 !px-4 !py-4 sm:!px-5 sm:!py-5 rounded-2xl bg-white/60 backdrop-blur-md border border-amber-100/80 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {['👰‍♀️', '🤵‍♂️', '💍', '💐'].map((avatar, i) => (
                    <div
                      key={i}
                      className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-amber-100 border-2 border-white text-sm shadow-xs"
                    >
                      {avatar}
                    </div>
                  ))}
                </div>
                <div className="text-left text-xs">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="font-bold text-stone-800 ml-1.5">4.9/5</span>
                  </div>
                  <span className="text-stone-500 font-sans">10,000+ Happy Couples</span>
                </div>
              </div>

              <div className="h-px w-full sm:h-8 sm:w-px bg-stone-200" />

              <div className="flex flex-col items-start gap-1.5 text-xs text-stone-600 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instant WhatsApp Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Eco-Friendly Digital</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ───────── Interactive showcase ───────── */}
        <div id="preview-card" className="relative max-w-4xl mx-auto scroll-mt-20 sm:scroll-mt-24">
          {/* Floating notification pill (lg+) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="absolute top-14 -left-8 xl:-left-14 z-30 bg-white/95 backdrop-blur-md rounded-2xl !p-3.5 shadow-xl border border-emerald-200/80 hidden lg:flex items-center gap-3 animate-float-gentle"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-stone-800 flex items-center gap-2">
                Rahul &amp; Sneha
                <span className="text-[10px] bg-emerald-100 text-emerald-700 !px-1.5 !py-0.5 rounded font-medium">
                  Attending (+2)
                </span>
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">RSVP confirmed 2 mins ago</p>
            </div>
          </motion.div>

          {/* Floating share pill (lg+) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="absolute top-14 -right-8 xl:-right-14 z-30 bg-white/95 backdrop-blur-md rounded-2xl !p-3.5 shadow-xl border border-amber-200/80 hidden lg:flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-stone-800">forevervows.com/w/jagan-anu</p>
              <p className="text-[11px] text-amber-700 font-medium mt-0.5">Ready for WhatsApp 1-tap</p>
            </div>
          </motion.div>

          {/* Compact live chips for phones & tablets (the floating pills above are lg+) */}
          <div className="flex lg:hidden flex-wrap items-center justify-center gap-2 !mb-5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-white/90 border border-emerald-200/80 rounded-full !px-3 !py-1.5 shadow-xs">
              <Users className="w-3 h-3" /> Rahul &amp; Sneha RSVP&apos;d (+2)
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-700 bg-white/90 border border-amber-200/80 rounded-full !px-3 !py-1.5 shadow-xs">
              <Share2 className="w-3 h-3" /> WhatsApp 1-tap
            </span>
          </div>

          {/* Theme selector — 3 equal columns on phones, wrapping pills from sm */}
          <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-3 !mb-5 sm:!mb-8">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider hidden md:inline !mr-1">
              Preview Theme:
            </span>
            {heroThemes.map((theme) => {
              const isSelected = activeTheme.id === theme.id
              return (
                <button
                  key={theme.id}
                  onClick={() => setActiveTheme(theme)}
                  aria-pressed={isSelected}
                  className={`min-h-10 !px-3 sm:!px-4 !py-2 rounded-full text-xs font-medium transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${isSelected
                    ? 'bg-amber-800 text-white shadow-md sm:scale-105'
                    : 'bg-white/80 text-stone-600 hover:bg-white border border-stone-200/80'
                    }`}
                >
                  <span
                    className={`hidden min-[400px]:block w-2 h-2 rounded-full shrink-0 ${theme.id === 'royal' ? 'bg-amber-400' : theme.id === 'floral' ? 'bg-rose-400' : 'bg-amber-500'
                      }`}
                  />
                  <span className="sm:hidden">{theme.short}</span>
                  <span className="hidden sm:inline">{theme.name}</span>
                </button>
              )
            })}
          </div>

          {/* Invitation card */}
          <div
            className={`relative rounded-2xl sm:rounded-3xl !px-5 !py-9 min-[400px]:!px-6 sm:!px-10 sm:!py-14 md:!px-14 md:!py-16 border ${activeTheme.border} ${activeTheme.bg} shadow-2xl transition-colors duration-500 backdrop-blur-xl overflow-hidden`}
          >
            {/* Corner accents (smaller on phones so they never collide with text) */}
            <div className={`absolute top-3 left-3 sm:top-5 sm:left-5 w-5 sm:w-12 h-5 sm:h-12 border-t-2 border-l-2 ${activeTheme.goldAccent} opacity-40 rounded-tl-lg`} />
            <div className={`absolute top-3 right-3 sm:top-5 sm:right-5 w-5 sm:w-12 h-5 sm:h-12 border-t-2 border-r-2 ${activeTheme.goldAccent} opacity-40 rounded-tr-lg`} />
            <div className={`absolute bottom-3 left-3 sm:bottom-5 sm:left-5 w-5 sm:w-12 h-5 sm:h-12 border-b-2 border-l-2 ${activeTheme.goldAccent} opacity-40 rounded-bl-lg`} />
            <div className={`absolute bottom-3 right-3 sm:bottom-5 sm:right-5 w-5 sm:w-12 h-5 sm:h-12 border-b-2 border-r-2 ${activeTheme.goldAccent} opacity-40 rounded-br-lg`} />

            <div className="relative z-10 text-center max-w-2xl mx-auto flex flex-col items-center">
              {/* Monogram seal */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full ${activeTheme.sealBg} text-white flex items-center justify-center font-serif text-lg sm:text-2xl font-bold shadow-lg shadow-black/10 border-2 border-white/40 !mb-5 sm:!mb-6 cursor-pointer`}
              >
                J &amp; A
              </motion.div>

              <span className={`text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] sm:tracking-[0.35em] ${activeTheme.subColor} opacity-90 !mb-3 sm:!mb-4`}>
                Together with their families
              </span>

              <h2 className={`font-serif text-[2.25rem] min-[400px]:text-5xl sm:text-6xl md:text-7xl font-normal ${activeTheme.textColor} !mb-3 sm:!mb-5 tracking-tight leading-tight`}>
                Jagan <span className={`italic font-light ${activeTheme.goldAccent}`}>&amp;</span> Anu
              </h2>

              <p className={`text-[10px] min-[400px]:text-[11px] sm:text-sm font-medium ${activeTheme.subColor} !mb-6 sm:!mb-8 tracking-[0.12em] sm:tracking-widest uppercase leading-relaxed max-w-xs sm:max-w-md`}>
                Request the honour of your presence at their wedding celebration
              </p>

              {/* Ornate divider */}
              <div className="flex items-center justify-center gap-3 w-40 sm:w-48 max-w-full !mb-6 sm:!mb-10">
                <div className={`h-px flex-1 ${dividerColor}`} />
                <span className={`text-sm ${activeTheme.goldAccent}`}>❖</span>
                <div className={`h-px flex-1 ${dividerColor}`} />
              </div>

              {/* Key details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 w-full max-w-lg !mb-6 sm:!mb-10">
                <div className={`flex items-center gap-3 !p-3.5 sm:!p-4 rounded-2xl backdrop-blur-sm border text-left ${tileBg}`}>
                  <div className={`!p-2.5 rounded-xl bg-white/70 shadow-xs shrink-0 ${activeTheme.goldAccent}`}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[10px] uppercase font-bold tracking-wider ${activeTheme.subColor} !mb-1`}>
                      Date &amp; Auspicious Time
                    </p>
                    <p className={`text-xs sm:text-sm font-semibold leading-snug ${activeTheme.textColor}`}>
                      Saturday, Dec 12, 2026 • 10:30 AM
                    </p>
                  </div>
                </div>

                <div className={`flex items-center gap-3 !p-3.5 sm:!p-4 rounded-2xl backdrop-blur-sm border text-left ${tileBg}`}>
                  <div className={`!p-2.5 rounded-xl bg-white/70 shadow-xs shrink-0 ${activeTheme.goldAccent}`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[10px] uppercase font-bold tracking-wider ${activeTheme.subColor} !mb-1`}>
                      Wedding Venue
                    </p>
                    <p className={`text-xs sm:text-sm font-semibold leading-snug ${activeTheme.textColor}`}>
                      {activeTheme.venue}
                    </p>
                  </div>
                </div>
              </div>

              {/* Countdown */}
              <div className="w-full max-w-md !mb-6 sm:!mb-8">
                <p className={`text-[10px] uppercase tracking-widest font-bold ${activeTheme.subColor} !mb-3`}>
                  Countdown to the Big Day
                </p>
                <div className="grid grid-cols-4 gap-1.5 sm:gap-3 text-center">
                  {[
                    { label: 'Days', value: countdown.days },
                    { label: 'Hours', value: countdown.hours },
                    { label: 'Mins', value: countdown.minutes },
                    { label: 'Secs', value: countdown.seconds },
                  ].map((unit) => (
                    <div key={unit.label} className={`flex flex-col !py-2.5 sm:!py-4 rounded-xl border backdrop-blur-sm ${tileBg}`}>
                      <span className={`font-serif text-lg min-[400px]:text-xl sm:text-3xl font-bold tabular-nums leading-none ${activeTheme.textColor}`}>
                        {String(unit.value).padStart(2, '0')}
                      </span>
                      <span className={`text-[9px] sm:text-[10px] uppercase tracking-wider !mt-1.5 ${activeTheme.subColor}`}>
                        {unit.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Music player */}
              <div className={`w-full max-w-md rounded-full !pl-2.5 !pr-4 sm:!pl-3 sm:!pr-5 !py-2 sm:!py-2.5 border backdrop-blur-md flex items-center justify-between gap-3 sm:gap-4 !mb-6 sm:!mb-10 ${tileBg}`}>
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <button
                    onClick={() => setIsPlayingMusic(!isPlayingMusic)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer shrink-0 ${isPlayingMusic ? 'bg-amber-600' : 'bg-stone-500'
                      }`}
                    title={isPlayingMusic ? 'Pause Music' : 'Play Music'}
                    aria-label={isPlayingMusic ? 'Pause music' : 'Play music'}
                  >
                    {isPlayingMusic ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                  <div className="text-left min-w-0">
                    <p className={`text-[11px] sm:text-xs font-semibold truncate ${activeTheme.textColor}`}>
                      {activeTheme.musicTrack}
                    </p>
                    <p className={`text-[9px] sm:text-[10px] ${activeTheme.subColor}`}>Background Music Preview</p>
                  </div>
                </div>

                {/* Equalizer */}
                <div className="flex items-end gap-1 h-5 shrink-0">
                  {[1, 2, 3, 4, 5].map((bar) => {
                    const live = isPlayingMusic && !reduceMotion
                    return (
                      <motion.div
                        key={bar}
                        animate={live ? { height: [4, 18, 8, 20, 6][bar - 1] } : { height: 4 }}
                        transition={
                          live
                            ? { duration: 0.8, repeat: Infinity, repeatType: 'reverse', delay: bar * 0.15 }
                            : {}
                        }
                        className={`w-1 rounded-full ${activeTheme.id === 'royal' ? 'bg-amber-400' : 'bg-amber-600'}`}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
                <button
                  onClick={() => setRsvpSimulated(true)}
                  className={`!px-6 sm:!px-8 !py-3.5 rounded-full text-[11px] sm:text-xs font-semibold uppercase tracking-wider leading-snug transition-all duration-300 shadow-md cursor-pointer ${rsvpSimulated
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-700 hover:bg-amber-800 text-white hover:scale-105 active:scale-95'
                    }`}
                >
                  {rsvpSimulated ? "✓ RSVP Received! You're on the Guest List" : 'Simulate RSVP Response'}
                </button>

                <Link
                  href={`/templates/preview/${activeTheme.id === 'royal'
                    ? 'royal-gold'
                    : activeTheme.id === 'floral'
                      ? 'floral-romantic'
                      : 'kerala-traditional'
                    }`}
                  className="!px-6 sm:!px-7 !py-3.5 rounded-full text-[11px] sm:text-xs font-semibold uppercase tracking-wider bg-white/80 hover:bg-white text-stone-800 border border-stone-200/80 hover:border-amber-300 transition-all text-center"
                >
                  Full Screen Preview
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}