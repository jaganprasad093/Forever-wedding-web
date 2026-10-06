'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  Users
} from 'lucide-react'

// Floating particles & romantic motifs
const floatingDecorations = [
  { icon: '✨', top: '12%', left: '8%', size: 'text-xl', delay: 0, duration: 4.5 },
  { icon: '🌸', top: '18%', right: '10%', size: 'text-2xl', delay: 1.2, duration: 5.5 },
  { icon: '💍', top: '55%', left: '5%', size: 'text-2xl', delay: 0.7, duration: 6 },
  { icon: '🕊️', top: '68%', right: '7%', size: 'text-xl', delay: 2, duration: 5.2 },
  { icon: '🌹', top: '38%', right: '14%', size: 'text-2xl', delay: 1.8, duration: 4.8 },
  { icon: '🌿', top: '42%', left: '12%', size: 'text-xl', delay: 2.5, duration: 6.2 },
]

// Theme presets for the interactive hero preview
const heroThemes = [
  {
    id: 'kerala',
    name: 'Kerala Traditional',
    tag: 'Traditional',
    bg: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50/80',
    border: 'border-amber-300/80',
    textColor: 'text-amber-950',
    subColor: 'text-amber-800',
    goldAccent: 'text-amber-600',
    sealBg: 'bg-gradient-to-br from-amber-600 to-yellow-600',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    musicTrack: 'Mangalyam Thanthunanena (Instrumental)',
    venue: 'Thrissur, Kerala',
  },
  {
    id: 'royal',
    name: 'Royal Midnight Gold',
    tag: 'Luxury',
    bg: 'bg-gradient-to-br from-stone-950 via-stone-900 to-neutral-900',
    border: 'border-amber-500/60',
    textColor: 'text-white',
    subColor: 'text-stone-300',
    goldAccent: 'text-amber-400',
    sealBg: 'bg-gradient-to-br from-amber-500 to-amber-700',
    badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-600/50',
    musicTrack: 'Royal Symphony & Strings',
    venue: 'Taj Lake Palace, Udaipur',
  },
  {
    id: 'floral',
    name: 'Blush Floral Romance',
    tag: 'Romantic',
    bg: 'bg-gradient-to-br from-rose-50 via-pink-50/70 to-rose-100/60',
    border: 'border-rose-300/80',
    textColor: 'text-rose-950',
    subColor: 'text-rose-800',
    goldAccent: 'text-rose-600',
    sealBg: 'bg-gradient-to-br from-rose-500 to-pink-600',
    badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
    musicTrack: 'Can\'t Help Falling in Love (Acoustic Flute)',
    venue: 'The Leela Palace, Bengaluru',
  },
]

export default function HeroSection() {
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
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 }
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return { ...prev, days: Math.max(0, prev.days - 1), hours: 23, minutes: 59, seconds: 59 }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-radial-vignette flex flex-col justify-center">
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[400px] bg-gradient-to-b from-amber-200/35 via-rose-100/25 to-transparent rounded-full blur-3xl -z-10" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-amber-300/20 rounded-full blur-3xl -z-10 animate-pulse-glow" />
        <div className="absolute bottom-10 -right-32 w-96 h-96 bg-rose-200/25 rounded-full blur-3xl -z-10 animate-pulse-glow" />
        <div className="absolute inset-0 bg-mandala-pattern opacity-40 -z-20" />
      </div>

      {/* Floating romantic elements with smooth CSS/Framer floating */}
      {floatingDecorations.map((item, idx) => (
        <motion.div
          key={idx}
          className={`absolute ${item.size} select-none pointer-events-none hidden md:block z-0`}
          style={{ top: item.top, left: item.left, right: item.right }}
          animate={{
            y: [0, -18, 0],
            rotate: [-4, 6, -4],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            delay: item.delay,
            ease: 'easeInOut',
          }}
        >
          {item.icon}
        </motion.div>
      ))}

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {/* Top Header Intro */}
        <div className="text-center max-w-4xl mx-auto mb-12 sm:mb-16">
          {/* Eyebrow Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-amber-200/80 shadow-xs mb-6"
          >
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-semibold tracking-wider uppercase text-amber-900">
              The Next-Gen Digital Wedding Invitation
            </span>
          </motion.div>

          {/* Main Hero Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight text-stone-900 leading-[1.08] mb-6"
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
            className="text-base sm:text-lg md:text-xl text-stone-600 max-w-2xl mx-auto font-sans leading-relaxed mb-8"
          >
            Elevate your love story with breathtaking music, interactive itinerary, 
            instant WhatsApp RSVP tracking, and Google Maps venue guidance. 
            All beautifully personalized in under 5 minutes.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 mb-10"
          >
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-white font-medium text-base px-8 py-4 rounded-full shadow-lg shadow-amber-600/25 hover:shadow-xl hover:shadow-amber-600/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group"
            >
              <Sparkles className="w-5 h-5 text-amber-200" />
              <span>Create Your Invitation — Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="#preview-card"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/90 hover:bg-white text-stone-800 border border-stone-200/80 hover:border-amber-300 font-medium text-base px-7 py-4 rounded-full shadow-xs hover:shadow-md transition-all duration-300"
            >
              <span>Explore Interactive Demo</span>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </a>
          </motion.div>

          {/* Social Proof & Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-2 border-t border-amber-100/60 max-w-xl mx-auto"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2 overflow-hidden">
                {['👰‍♀️', '🤵‍♂️', '💍', '💐'].map((avatar, i) => (
                  <div
                    key={i}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 border-2 border-white text-sm shadow-xs"
                  >
                    {avatar}
                  </div>
                ))}
              </div>
              <div className="text-left text-xs">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="font-bold text-stone-800 ml-1">4.9/5</span>
                </div>
                <span className="text-stone-500 font-sans">10,000+ Happy Couples</span>
              </div>
            </div>

            <div className="h-4 w-px bg-stone-300 hidden sm:block" />

            <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Instant WhatsApp Delivery</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>100% Eco-Friendly Digital</span>
            </div>
          </motion.div>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE WEDDING INVITATION SHOWCASE (LIVE DEMO) */}
        {/* ========================================================================= */}
        <div id="preview-card" className="relative max-w-4xl mx-auto">
          {/* Floating Live Notification Pill */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="absolute -top-6 -left-2 sm:-left-6 z-30 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-emerald-200/80 hidden sm:flex items-center gap-3 animate-float-gentle"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-stone-800 flex items-center gap-1">
                Rahul &amp; Sneha
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded font-medium">
                  Attending (+2)
                </span>
              </p>
              <p className="text-[11px] text-stone-400">RSVP confirmed 2 mins ago</p>
            </div>
          </motion.div>

          {/* Floating Share Link Pill */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="absolute -top-4 -right-2 sm:-right-6 z-30 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-amber-200/80 hidden sm:flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-stone-800">forevervows.com/w/jagan-anu</p>
              <p className="text-[11px] text-amber-700 font-medium">Ready for WhatsApp 1-tap</p>
            </div>
          </motion.div>

          {/* Theme Selector Tab Bar */}
          <div className="flex items-center justify-center gap-2 mb-4 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider hidden sm:inline mr-2">
              Preview Theme:
            </span>
            {heroThemes.map((theme) => {
              const isSelected = activeTheme.id === theme.id
              return (
                <button
                  key={theme.id}
                  onClick={() => setActiveTheme(theme)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-800 text-white shadow-md scale-105'
                      : 'bg-white/80 text-stone-600 hover:bg-white border border-stone-200/80'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      theme.id === 'royal'
                        ? 'bg-amber-400'
                        : theme.id === 'floral'
                        ? 'bg-rose-400'
                        : 'bg-amber-500'
                    }`}
                  />
                  <span>{theme.name}</span>
                </button>
              )
            })}
          </div>

          {/* The Luxury Card Mockup Frame */}
          <motion.div
            layout
            transition={{ duration: 0.4 }}
            className={`relative rounded-3xl p-6 sm:p-10 md:p-12 border ${activeTheme.border} ${activeTheme.bg} shadow-2xl transition-all duration-500 backdrop-blur-xl overflow-hidden`}
          >
            {/* Corner Decorative Accents */}
            <div className={`absolute top-4 left-4 w-8 sm:w-12 h-8 sm:h-12 border-t-2 border-l-2 ${activeTheme.goldAccent} opacity-40 rounded-tl-lg`} />
            <div className={`absolute top-4 right-4 w-8 sm:w-12 h-8 sm:h-12 border-t-2 border-r-2 ${activeTheme.goldAccent} opacity-40 rounded-tr-lg`} />
            <div className={`absolute bottom-4 left-4 w-8 sm:w-12 h-8 sm:h-12 border-b-2 border-l-2 ${activeTheme.goldAccent} opacity-40 rounded-bl-lg`} />
            <div className={`absolute bottom-4 right-4 w-8 sm:w-12 h-8 sm:h-12 border-b-2 border-r-2 ${activeTheme.goldAccent} opacity-40 rounded-br-lg`} />

            {/* Inner Content Container */}
            <div className="relative z-10 text-center max-w-2xl mx-auto flex flex-col items-center">
              {/* Monogram Seal */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full ${activeTheme.sealBg} text-white flex items-center justify-center font-serif text-xl sm:text-2xl font-bold shadow-lg shadow-black/10 border-2 border-white/40 mb-4 cursor-pointer`}
              >
                J &amp; A
              </motion.div>

              <span className={`text-[11px] sm:text-xs font-semibold uppercase tracking-[0.35em] ${activeTheme.subColor} opacity-90 mb-2`}>
                TOGETHER WITH THEIR FAMILIES
              </span>

              {/* Couple Names */}
              <h2 className={`font-serif text-4xl sm:text-6xl md:text-7xl font-normal ${activeTheme.textColor} mb-2 tracking-tight`}>
                Jagan <span className={`italic font-light ${activeTheme.goldAccent}`}>&amp;</span> Anu
              </h2>

              <p className={`text-xs sm:text-sm font-medium ${activeTheme.subColor} mb-6 tracking-widest uppercase`}>
                Request the honour of your presence at their wedding celebration
              </p>

              {/* Ornate Divider */}
              <div className="flex items-center justify-center gap-3 w-48 max-w-full mb-6">
                <div className={`h-px flex-1 ${activeTheme.id === 'royal' ? 'bg-amber-500/40' : 'bg-amber-600/30'}`} />
                <span className={`text-sm ${activeTheme.goldAccent}`}>❖</span>
                <div className={`h-px flex-1 ${activeTheme.id === 'royal' ? 'bg-amber-500/40' : 'bg-amber-600/30'}`} />
              </div>

              {/* Key Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-lg mb-8">
                <div className="flex items-center justify-center sm:justify-start gap-2.5 p-3 rounded-2xl bg-white/40 dark:bg-black/20 backdrop-blur-sm border border-stone-200/30 text-left">
                  <div className={`p-2 rounded-xl bg-white/70 shadow-xs ${activeTheme.goldAccent}`}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-[10px] uppercase font-bold tracking-wider ${activeTheme.subColor}`}>
                      Date &amp; Auspicious Time
                    </p>
                    <p className={`text-xs sm:text-sm font-semibold ${activeTheme.textColor}`}>
                      Saturday, Dec 12, 2026 • 10:30 AM
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-2.5 p-3 rounded-2xl bg-white/40 dark:bg-black/20 backdrop-blur-sm border border-stone-200/30 text-left">
                  <div className={`p-2 rounded-xl bg-white/70 shadow-xs ${activeTheme.goldAccent}`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-[10px] uppercase font-bold tracking-wider ${activeTheme.subColor}`}>
                      Wedding Venue
                    </p>
                    <p className={`text-xs sm:text-sm font-semibold ${activeTheme.textColor}`}>
                      {activeTheme.venue}
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Countdown Display */}
              <div className="w-full max-w-md bg-white/50 dark:bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-stone-200/40 mb-6">
                <p className={`text-[10px] uppercase tracking-widest font-bold ${activeTheme.subColor} mb-2`}>
                  Countdown to the Big Day
                </p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: 'Days', value: countdown.days },
                    { label: 'Hours', value: countdown.hours },
                    { label: 'Mins', value: countdown.minutes },
                    { label: 'Secs', value: countdown.seconds },
                  ].map((unit) => (
                    <div key={unit.label} className="flex flex-col">
                      <span className={`font-serif text-xl sm:text-2xl font-bold ${activeTheme.textColor}`}>
                        {String(unit.value).padStart(2, '0')}
                      </span>
                      <span className={`text-[10px] uppercase ${activeTheme.subColor}`}>
                        {unit.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Music Player Interactive Demo Bar */}
              <div className="w-full max-w-md bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-full px-4 py-2 border border-stone-200/50 flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2 overflow-hidden">
                  <button
                    onClick={() => setIsPlayingMusic(!isPlayingMusic)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer ${
                      isPlayingMusic ? 'bg-amber-600' : 'bg-stone-500'
                    }`}
                    title={isPlayingMusic ? 'Pause Music' : 'Play Music'}
                  >
                    {isPlayingMusic ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  </button>
                  <div className="text-left truncate">
                    <p className={`text-[11px] font-semibold truncate ${activeTheme.textColor}`}>
                      {activeTheme.musicTrack}
                    </p>
                    <p className={`text-[9px] ${activeTheme.subColor}`}>Background Music Preview</p>
                  </div>
                </div>

                {/* Animated Equalizer Wave */}
                <div className="flex items-end gap-1 h-5 px-1 shrink-0">
                  {[1, 2, 3, 4, 5].map((bar) => (
                    <motion.div
                      key={bar}
                      animate={
                        isPlayingMusic
                          ? { height: [4, 18, 8, 20, 6][bar - 1] }
                          : { height: 4 }
                      }
                      transition={
                        isPlayingMusic
                          ? {
                              duration: 0.8,
                              repeat: Infinity,
                              repeatType: 'reverse',
                              delay: bar * 0.15,
                            }
                          : {}
                      }
                      className={`w-1 rounded-full ${activeTheme.id === 'royal' ? 'bg-amber-400' : 'bg-amber-600'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Interactive RSVP Action Simulation Button */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setRsvpSimulated(true)}
                  className={`w-full sm:w-auto px-8 py-3 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 shadow-md cursor-pointer ${
                    rsvpSimulated
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-700 hover:bg-amber-800 text-white hover:scale-105 active:scale-95'
                  }`}
                >
                  {rsvpSimulated ? '✓ RSVP Received! You\'re on the Guest List' : 'Simulate RSVP Response'}
                </button>

                <Link
                  href={`/templates/preview/${
                    activeTheme.id === 'royal'
                      ? 'royal-gold'
                      : activeTheme.id === 'floral'
                      ? 'floral-romantic'
                      : 'kerala-traditional'
                  }`}
                  className="w-full sm:w-auto px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/80 hover:bg-white text-stone-800 border border-stone-200/80 hover:border-amber-300 transition-all text-center"
                >
                  Full Screen Preview
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
