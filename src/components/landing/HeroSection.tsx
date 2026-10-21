'use client'

import { useState, useEffect } from 'react'
import {
  motion,
  AnimatePresence,
  animate,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from 'framer-motion'
import Link from 'next/link'
import {
  ArrowRight,
  Calendar,
  MapPin,
  CheckCircle2,
  Volume2,
  VolumeX,
  ChevronRight,
  ChevronDown,
  Star,
  Share2,
  Users,
} from 'lucide-react'

// Floating motifs (lg+)
const floatingDecorations = [
  { icon: '✨', top: '12%', left: '6%', size: 'text-xl', delay: 0, duration: 4.5 },
  { icon: '🌸', top: '18%', right: '8%', size: 'text-2xl', delay: 1.2, duration: 5.5 },
  { icon: '💍', top: '55%', left: '4%', size: 'text-2xl', delay: 0.7, duration: 6 },
  { icon: '🕊️', top: '68%', right: '5%', size: 'text-xl', delay: 2, duration: 5.2 },
  { icon: '🌹', top: '38%', right: '12%', size: 'text-2xl', delay: 1.8, duration: 4.8 },
  { icon: '🌿', top: '42%', left: '10%', size: 'text-xl', delay: 2.5, duration: 6.2 },
]

// Falling petals (md+) — fixed values so server and client render identically
const petals = [
  { left: '8%', delay: 0, duration: 14, size: 'text-sm' },
  { left: '22%', delay: 3, duration: 17, size: 'text-base' },
  { left: '41%', delay: 6, duration: 15, size: 'text-sm' },
  { left: '58%', delay: 1.5, duration: 18, size: 'text-base' },
  { left: '74%', delay: 8, duration: 16, size: 'text-sm' },
  { left: '90%', delay: 4.5, duration: 19, size: 'text-base' },
]

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

// Rotating live-RSVP notifications
const rsvps = [
  { name: 'Rahul & Sneha', note: 'Attending (+2)', time: '2 mins ago' },
  { name: 'Dr. Ramesh & Family', note: 'Attending (+3)', time: 'just now' },
  { name: 'Ananya Sharma', note: 'Attending (+1)', time: '5 mins ago' },
  { name: 'Karthik & Priya', note: 'Attending (+2)', time: '12 mins ago' },
]

const headlineSegments = [
  { text: 'Craft a Wedding Invitation', cls: '' },
  { text: "They'll Cherish", cls: 'italic font-normal block sm:inline text-amber-800' },
]

/* ─── Variants ───────────────────────────────────────────────────────── */
const headContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } }
const wordVariant = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: 'easeOut' as const } },
}

/* ─── Helpers ────────────────────────────────────────────────────────── */
function CountUp({ to, suffix = '', delay = 0 }: { to: number; suffix?: string; delay?: number }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    const c = animate(0, to, { duration: 2, delay, ease: 'easeOut', onUpdate: (n) => setV(Math.round(n)) })
    return () => c.stop()
  }, [to, delay])
  return <>{v.toLocaleString('en-US')}{suffix}</>
}

// Digit that slides when its value changes
function Digit({ value }: { value: string }) {
  return (
    <span className="relative inline-block h-[1em] overflow-hidden align-middle">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

const burstEmoji = ['✨', '💛', '🌸', '🎉', '✨', '💍', '🌹', '🎊', '✨', '💛', '🌸', '🎉']

export default function HeroSection() {
  const reduceMotion = useReducedMotion()
  const [activeTheme, setActiveTheme] = useState(heroThemes[0])
  const [isPlayingMusic, setIsPlayingMusic] = useState(true)
  const [rsvpSimulated, setRsvpSimulated] = useState(false)
  const [burst, setBurst] = useState(0)
  const [rsvpIdx, setRsvpIdx] = useState(0)

  const [countdown, setCountdown] = useState({ days: 248, hours: 14, minutes: 36, seconds: 42 })

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

  // Cycle the live RSVP notification
  useEffect(() => {
    const t = setInterval(() => setRsvpIdx((i) => (i + 1) % rsvps.length), 4500)
    return () => clearInterval(t)
  }, [])

  // Scroll parallax for ambient layers
  const { scrollY } = useScroll()
  const glowUp = useTransform(scrollY, [0, 700], [0, -120])
  const glowDown = useTransform(scrollY, [0, 700], [0, 90])

  // Mouse tilt for the invitation card
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const tiltX = useSpring(rx, { stiffness: 120, damping: 18 })
  const tiltY = useSpring(ry, { stiffness: 120, damping: 18 })

  const dividerColor = activeTheme.id === 'royal' ? 'bg-amber-500/40' : 'bg-amber-600/30'
  const tileBg = activeTheme.id === 'royal' ? 'bg-white/10 border-white/10' : 'bg-white/60 border-stone-200/50'
  const rsvp = rsvps[rsvpIdx]
  const previewSlug =
    activeTheme.id === 'royal' ? 'royal-gold' : activeTheme.id === 'floral' ? 'floral-romantic' : 'kerala-traditional'

  const handleRsvp = () => {
    setRsvpSimulated(true)
    setBurst((b) => b + 1)
  }

  return (
    <section className="relative min-h-[100svh] !pt-24 sm:!pt-32 lg:!pt-36 !pb-16 sm:!pb-24 lg:!pb-28 !px-4 min-[400px]:!px-5 sm:!px-8 lg:!px-12 overflow-hidden bg-radial-vignette flex flex-col justify-center">
      {/* Ambient background (blobs have scroll parallax) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[420px] sm:w-[900px] h-[400px] bg-gradient-to-b from-amber-200/35 via-rose-100/25 to-transparent rounded-full blur-3xl -z-10" />
        <motion.div
          style={reduceMotion ? undefined : { y: glowUp }}
          className="absolute top-1/3 -left-32 w-80 h-80 bg-amber-300/25 rounded-full blur-3xl -z-10 animate-pulse-glow"
        />
        <motion.div
          style={reduceMotion ? undefined : { y: glowDown }}
          className="absolute bottom-10 -right-32 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl -z-10 animate-pulse-glow"
        />
        <div className="absolute inset-0 bg-mandala-pattern opacity-40 -z-20" />
      </div>

      {/* Falling petals (md+) */}
      {!reduceMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block z-0" aria-hidden="true">
          {petals.map((p, i) => (
            <motion.span
              key={i}
              className={`absolute -top-8 ${p.size} opacity-60 select-none`}
              style={{ left: p.left }}
              animate={{ y: ['0vh', '110vh'], x: [0, 30, -20, 25, 0], rotate: [0, 120, 240, 360] }}
              transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
            >
              🌸
            </motion.span>
          ))}
        </div>
      )}

      {/* Floating motifs (lg+) with gentle parallax */}
      {!reduceMotion && (
        <motion.div style={{ y: glowDown }} className="absolute inset-0 pointer-events-none hidden lg:block z-0" aria-hidden="true">
          {floatingDecorations.map((item, idx) => (
            <motion.div
              key={idx}
              className={`absolute ${item.size} select-none`}
              style={{ top: item.top, left: item.left, right: item.right }}
              animate={{ y: [0, -18, 0], rotate: [-4, 6, -4] }}
              transition={{ duration: item.duration, repeat: Infinity, delay: item.delay, ease: 'easeInOut' }}
            >
              {item.icon}
            </motion.div>
          ))}
        </motion.div>
      )}

      <div className="relative z-10 max-w-7xl !mx-auto w-full">
        {/* ───────── Intro ───────── */}
        <div className="flex flex-col items-center text-center max-w-4xl xl:max-w-5xl !mx-auto w-full !mb-12 sm:!mb-20 lg:!mb-24">
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative inline-flex items-center gap-2 !px-3.5 sm:!px-4 !py-2 rounded-full bg-white/90 backdrop-blur-md border border-amber-200/80 shadow-xs !mb-5 sm:!mb-8 overflow-hidden"
          >
            {!reduceMotion && (
              <motion.span
                aria-hidden="true"
                animate={{ left: ['-60%', '160%'] }}
                transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 3.5, ease: 'easeInOut' }}
                className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-amber-200/60 to-transparent skew-x-[-20deg]"
              />
            )}
            <span className="relative text-[10px] min-[400px]:text-[11px] sm:text-xs font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-amber-800">
              Digital Wedding Invitations
            </span>
          </motion.div>

          {/* Headline — word-by-word reveal */}
          <motion.h1
            variants={headContainer}
            initial="hidden"
            animate="visible"
            aria-label="Craft a Wedding Invitation They'll Cherish Forever."
            className="font-serif text-[2rem] min-[400px]:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-normal tracking-tight text-stone-900 leading-[1.12] sm:leading-[1.1] !mb-5 sm:!mb-8 text-balance text-center"
          >
            {headlineSegments.map((seg) => (
              <span key={seg.text} className={seg.cls} aria-hidden="true">
                {seg.text.split(' ').map((w, i) => (
                  <motion.span key={i} variants={wordVariant} className="inline-block !mr-[0.25em]">
                    {w}
                  </motion.span>
                ))}
              </span>
            ))}
            {/* Gold word keeps its gradient on the animated element itself */}
            <motion.span variants={wordVariant} className="inline-block text-gold-shimmer font-medium" aria-hidden="true">
              Forever.
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="text-[15px] sm:text-lg md:text-xl text-stone-600 max-w-2xl !mx-auto font-sans leading-relaxed !mb-8 sm:!mb-12 text-center text-balance"
          >
            Elevate your love story with breathtaking music, an interactive itinerary,
            instant WhatsApp RSVP tracking, and Google Maps venue guidance — all
            beautifully personalized in under 5 minutes.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.05 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-sm sm:max-w-none !mx-auto !mb-10 sm:!mb-14"
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              animate={reduceMotion ? undefined : { boxShadow: ['0 0 0 0 rgba(217,119,6,0.35)', '0 0 0 14px rgba(217,119,6,0)'] }}
              transition={{ boxShadow: { duration: 2, repeat: Infinity, ease: 'easeOut' } }}
              className="rounded-full flex"
            >
              <Link
                href="/register"
                className="group relative overflow-hidden flex-1 inline-flex items-center justify-center gap-2 sm:gap-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-white font-medium text-sm sm:text-base !px-5 sm:!px-9 !py-3.5 sm:!py-4 rounded-full shadow-lg shadow-amber-600/25"
              >
                <span className="absolute inset-y-0 -left-full w-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-[-20deg] group-hover:left-[150%] transition-all duration-700" />
                <span className="relative leading-tight">Create Your Invitation — Free</span>
                <ArrowRight className="relative w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

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
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="max-w-2xl w-full !mx-auto"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 !px-4 !py-4 sm:!px-5 sm:!py-5 rounded-2xl bg-white/60 backdrop-blur-md border border-amber-100/80 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {['👰‍♀️', '🤵‍♂️', '💍', '💐'].map((avatar, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0, x: -10 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      transition={{ type: 'spring', delay: 1.4 + i * 0.1 }}
                      whileHover={{ y: -4, zIndex: 10 }}
                      className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-amber-100 border-2 border-white text-sm shadow-xs"
                    >
                      {avatar}
                    </motion.div>
                  ))}
                </div>
                <div className="text-left text-xs">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <motion.span
                        key={i}
                        initial={{ scale: 0, rotate: -40 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 1.6 + i * 0.07 }}
                        className="inline-flex"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      </motion.span>
                    ))}
                    <span className="font-bold text-stone-800 ml-1.5">4.9/5</span>
                  </div>
                  <span className="text-stone-500 font-sans">
                    <CountUp to={10000} suffix="+" delay={1.4} /> Happy Couples
                  </span>
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

          {/* Scroll cue */}
          <motion.a
            href="#preview-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            aria-label="Scroll to interactive demo"
            className="hidden sm:flex flex-col items-center gap-1 !mt-10 text-[10px] uppercase tracking-[0.3em] text-stone-400 hover:text-amber-700 transition-colors"
          >
            <span>Scroll</span>
            <motion.span animate={reduceMotion ? {} : { y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
              <ChevronDown className="w-4 h-4" />
            </motion.span>
          </motion.a>
        </div>

        {/* ───────── Interactive showcase ───────── */}
        <motion.div
          id="preview-card"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative max-w-4xl w-full !mx-auto scroll-mt-20 sm:scroll-mt-24"
        >
          {/* Rotating live RSVP pill (lg+) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="absolute top-14 -left-8 xl:-left-14 z-30 bg-white/95 backdrop-blur-md rounded-2xl !p-3.5 shadow-xl border border-emerald-200/80 hidden lg:flex items-center gap-3 animate-float-gentle w-64"
          >
            <div className="relative w-10 h-10 shrink-0 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
              <Users className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={rsvpIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="text-left min-w-0"
              >
                <p className="text-xs font-semibold text-stone-800 truncate">{rsvp.name}</p>
                <p className="text-[11px] text-stone-400 !mt-0.5">
                  <span className="text-emerald-700 font-medium">{rsvp.note}</span> · {rsvp.time}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Share pill (lg+) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="absolute top-14 -right-8 xl:-right-14 z-30 bg-white/95 backdrop-blur-md rounded-2xl !p-3.5 shadow-xl border border-amber-200/80 hidden lg:flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-stone-800">forevervows.com/w/jagan-anu</p>
              <p className="text-[11px] text-amber-700 font-medium !mt-0.5">Ready for WhatsApp 1-tap</p>
            </div>
          </motion.div>

          {/* Compact chips (phones & tablets) */}
          <div className="flex lg:hidden flex-wrap items-center justify-center gap-2 !mb-5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-white/90 border border-emerald-200/80 rounded-full !px-3 !py-1.5 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              {rsvp.name} RSVP&apos;d
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-700 bg-white/90 border border-amber-200/80 rounded-full !px-3 !py-1.5 shadow-xs">
              <Share2 className="w-3 h-3" /> WhatsApp 1-tap
            </span>
          </div>

          {/* Theme selector with sliding highlight */}
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
                  className={`relative min-h-10 !px-3 sm:!px-4 !py-2 rounded-full text-xs font-medium transition-colors duration-300 flex items-center justify-center gap-2 cursor-pointer ${isSelected ? 'text-white' : 'bg-white/80 text-stone-600 hover:bg-white border border-stone-200/80'
                    }`}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="hero-theme-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="absolute inset-0 rounded-full bg-amber-800 shadow-md"
                    />
                  )}
                  <span
                    className={`relative hidden min-[400px]:block w-2 h-2 rounded-full shrink-0 ${theme.id === 'royal' ? 'bg-amber-400' : theme.id === 'floral' ? 'bg-rose-400' : 'bg-amber-500'
                      }`}
                  />
                  <span className="relative sm:hidden">{theme.short}</span>
                  <span className="relative hidden sm:inline">{theme.name}</span>
                </button>
              )
            })}
          </div>

          {/* Invitation card (mouse tilt) */}
          <motion.div
            style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 1400 }}
            onPointerMove={(e) => {
              if (reduceMotion || e.pointerType !== 'mouse') return
              const r = e.currentTarget.getBoundingClientRect()
              ry.set(((e.clientX - r.left) / r.width - 0.5) * 6)
              rx.set(-((e.clientY - r.top) / r.height - 0.5) * 6)
            }}
            onPointerLeave={() => {
              rx.set(0)
              ry.set(0)
            }}
          >
            <div
              className={`relative rounded-2xl sm:rounded-3xl !px-5 !py-9 min-[400px]:!px-6 sm:!px-10 sm:!py-14 md:!px-14 md:!py-16 border ${activeTheme.border} ${activeTheme.bg} shadow-2xl transition-colors duration-500 backdrop-blur-xl overflow-hidden`}
            >
              {/* Corner accents */}
              <div className={`absolute top-3 left-3 sm:top-5 sm:left-5 w-5 sm:w-12 h-5 sm:h-12 border-t-2 border-l-2 ${activeTheme.goldAccent} opacity-40 rounded-tl-lg`} />
              <div className={`absolute top-3 right-3 sm:top-5 sm:right-5 w-5 sm:w-12 h-5 sm:h-12 border-t-2 border-r-2 ${activeTheme.goldAccent} opacity-40 rounded-tr-lg`} />
              <div className={`absolute bottom-3 left-3 sm:bottom-5 sm:left-5 w-5 sm:w-12 h-5 sm:h-12 border-b-2 border-l-2 ${activeTheme.goldAccent} opacity-40 rounded-bl-lg`} />
              <div className={`absolute bottom-3 right-3 sm:bottom-5 sm:right-5 w-5 sm:w-12 h-5 sm:h-12 border-b-2 border-r-2 ${activeTheme.goldAccent} opacity-40 rounded-br-lg`} />

              {/* Slow light sweep across the card */}
              {!reduceMotion && (
                <motion.div
                  aria-hidden="true"
                  animate={{ left: ['-60%', '160%'] }}
                  transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
                  className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] pointer-events-none z-0"
                />
              )}

              {/* Theme content crossfades on switch */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTheme.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="relative z-10 text-center max-w-2xl !mx-auto w-full flex flex-col items-center"
                >
                  {/* Monogram seal (gently pulsing halo) */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    animate={reduceMotion ? undefined : { boxShadow: ['0 0 0 0 rgba(251,191,36,0.4)', '0 0 0 16px rgba(251,191,36,0)'] }}
                    transition={{ boxShadow: { duration: 2.4, repeat: Infinity, ease: 'easeOut' } }}
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

                  {/* Divider draws outward */}
                  <div className="flex items-center justify-center gap-3 w-40 sm:w-48 max-w-full !mx-auto !mb-6 sm:!mb-10">
                    <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, delay: 0.2 }} style={{ transformOrigin: 'right' }} className={`h-px flex-1 ${dividerColor}`} />
                    <span className={`text-sm ${activeTheme.goldAccent}`}>❖</span>
                    <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, delay: 0.2 }} style={{ transformOrigin: 'left' }} className={`h-px flex-1 ${dividerColor}`} />
                  </div>

                  {/* Key details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 w-full max-w-lg !mx-auto !mb-6 sm:!mb-10">
                    {[
                      { Icon: Calendar, label: 'Date & Auspicious Time', value: 'Saturday, Dec 12, 2026 • 10:30 AM' },
                      { Icon: MapPin, label: 'Wedding Venue', value: activeTheme.venue },
                    ].map(({ Icon, label, value }, i) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 + i * 0.1 }}
                        whileHover={reduceMotion ? undefined : { y: -3 }}
                        className={`flex items-center gap-3 !p-3.5 sm:!p-4 rounded-2xl backdrop-blur-sm border text-left ${tileBg}`}
                      >
                        <div className={`!p-2.5 rounded-xl bg-white/70 shadow-xs shrink-0 ${activeTheme.goldAccent}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-[10px] uppercase font-bold tracking-wider ${activeTheme.subColor} !mb-1`}>{label}</p>
                          <p className={`text-xs sm:text-sm font-semibold leading-snug ${activeTheme.textColor}`}>{value}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Countdown with sliding digits */}
                  <div className="w-full max-w-md !mx-auto !mb-6 sm:!mb-8">
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
                        <div key={unit.label} className={`flex flex-col items-center !py-2.5 sm:!py-4 rounded-xl border backdrop-blur-sm ${tileBg}`}>
                          <span className={`font-serif text-lg min-[400px]:text-xl sm:text-3xl font-bold tabular-nums leading-none ${activeTheme.textColor}`}>
                            <Digit value={String(unit.value).padStart(2, '0')} />
                          </span>
                          <span className={`text-[9px] sm:text-[10px] uppercase tracking-wider !mt-1.5 ${activeTheme.subColor}`}>
                            {unit.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Music player */}
                  <div className={`w-full max-w-md !mx-auto rounded-full !pl-2.5 !pr-4 sm:!pl-3 sm:!pr-5 !py-2 sm:!py-2.5 border backdrop-blur-md flex items-center justify-between gap-3 sm:gap-4 !mb-6 sm:!mb-10 ${tileBg}`}>
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <motion.button
                        whileTap={{ scale: 0.88 }}
                        onClick={() => setIsPlayingMusic(!isPlayingMusic)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer shrink-0 ${isPlayingMusic ? 'bg-amber-600' : 'bg-stone-500'}`}
                        title={isPlayingMusic ? 'Pause Music' : 'Play Music'}
                        aria-label={isPlayingMusic ? 'Pause music' : 'Play music'}
                      >
                        {isPlayingMusic ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      </motion.button>
                      <div className="text-left min-w-0">
                        <p className={`text-[11px] sm:text-xs font-semibold truncate ${activeTheme.textColor}`}>{activeTheme.musicTrack}</p>
                        <p className={`text-[9px] sm:text-[10px] ${activeTheme.subColor}`}>Background Music Preview</p>
                      </div>
                    </div>

                    <div className="flex items-end gap-1 h-5 shrink-0">
                      {[1, 2, 3, 4, 5].map((bar) => {
                        const live = isPlayingMusic && !reduceMotion
                        return (
                          <motion.div
                            key={bar}
                            animate={live ? { height: [4, 18, 8, 20, 6][bar - 1] } : { height: 4 }}
                            transition={live ? { duration: 0.8, repeat: Infinity, repeatType: 'reverse', delay: bar * 0.15 } : {}}
                            className={`w-1 rounded-full ${activeTheme.id === 'royal' ? 'bg-amber-400' : 'bg-amber-600'}`}
                          />
                        )
                      })}
                    </div>
                  </div>

                  {/* Actions (RSVP triggers a confetti burst) */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto !mx-auto">
                    <div className="relative flex">
                      <motion.button
                        whileHover={reduceMotion ? undefined : { scale: 1.04 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRsvp}
                        className={`flex-1 !px-6 sm:!px-8 !py-3.5 rounded-full text-[11px] sm:text-xs font-semibold uppercase tracking-wider leading-snug transition-colors duration-300 shadow-md cursor-pointer ${rsvpSimulated ? 'bg-emerald-600 text-white' : 'bg-amber-700 hover:bg-amber-800 text-white'
                          }`}
                      >
                        {rsvpSimulated ? "✓ RSVP Received! You're on the Guest List" : 'Simulate RSVP Response'}
                      </motion.button>

                      {burst > 0 && !reduceMotion && (
                        <span key={burst} className="pointer-events-none absolute left-1/2 top-1/2" aria-hidden="true">
                          {burstEmoji.map((e, i) => {
                            const angle = (i / burstEmoji.length) * Math.PI * 2
                            return (
                              <motion.span
                                key={i}
                                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                                animate={{ x: Math.cos(angle) * 90, y: Math.sin(angle) * 70 - 20, opacity: 0, scale: 0.5, rotate: 180 }}
                                transition={{ duration: 0.9, ease: 'easeOut' }}
                                className="absolute text-base"
                              >
                                {e}
                              </motion.span>
                            )
                          })}
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/templates/preview/${previewSlug}`}
                      className="!px-6 sm:!px-7 !py-3.5 rounded-full text-[11px] sm:text-xs font-semibold uppercase tracking-wider bg-white/80 hover:bg-white text-stone-800 border border-stone-200/80 hover:border-amber-300 transition-all text-center"
                    >
                      Full Screen Preview
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}