'use client'

import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import Link from 'next/link'
import {
  motion,
  AnimatePresence,
  MotionConfig,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from 'framer-motion'
import {
  MapPin,
  Calendar,
  Clock,
  Heart,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Navigation,
  X,
  Send,
  CalendarPlus,
  Check,
  Star,
  Moon,
  Sparkles,
} from 'lucide-react'
import { WeddingData, MusicItem } from '@/types/wedding'
import { formatDate, formatTime, getCountdown } from '@/lib/utils'
import RSVPForm from '@/components/rsvp/RSVPForm'
import WeddingMusicPlayer from './WeddingMusicPlayer'

type Photo = NonNullable<WeddingData['gallery']>[number]
type WeddingEvent = NonNullable<WeddingData['events']>[number]

const ease = [0.22, 1, 0.36, 1] as const

const GOLD = '#facc15'
const CYAN_GLOW = '#38bdf8'
const NAVY_BG = '#030712'

const SECTION_PAD: React.CSSProperties = {
  padding: 'clamp(5rem, 11vw, 8.5rem) clamp(1.25rem, 5vw, 3rem)',
}

/* ───────────────────────── Motion helpers ───────────────────────── */
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.4 } },
}

const wordRise: Variants = {
  hidden: { y: '115%', opacity: 0 },
  show: { y: '0%', opacity: 1, transition: { duration: 1.1, ease } },
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease } },
}

function Reveal({
  children,
  delay = 0,
  y = 28,
  className = '',
  style,
}: {
  children: React.ReactNode
  delay?: number
  y?: number
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.9, delay, ease }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}

function Section({
  children,
  max = '64rem',
  className = '',
  style,
}: {
  children: React.ReactNode
  max?: string
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <section className={`relative ${className}`} style={{ ...SECTION_PAD, ...style }}>
      <div style={{ width: '100%', maxWidth: max, marginInline: 'auto' }}>{children}</div>
    </section>
  )
}

function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(' ').map((word, i, arr) => (
        <Fragment key={i}>
          <span
            className="inline-block overflow-hidden align-bottom"
            style={{ paddingBlock: '0.14em', marginBlock: '-0.14em', paddingInline: '0.04em' }}
          >
            <motion.span variants={wordRise} className="inline-block">
              {word}
            </motion.span>
          </span>
          {i < arr.length - 1 && ' '}
        </Fragment>
      ))}
    </>
  )
}

/* ───────────────────────── Shooting Stars & Twinkling Cosmos ───────────────────────── */
function ShootingStars() {
  const reduce = useReducedMotion()
  if (reduce) return null

  const meteors = [
    { top: '12%', left: '78%', delay: 0.5, duration: 4.5 },
    { top: '28%', left: '88%', delay: 2.8, duration: 5.2 },
    { top: '6%', left: '42%', delay: 4.1, duration: 4.8 },
    { top: '45%', left: '95%', delay: 6.5, duration: 6 },
  ]

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {meteors.map((m, i) => (
        <motion.span
          key={i}
          className="absolute h-[2px] w-[90px] rotate-[-38deg] rounded-full bg-gradient-to-r from-transparent via-cyan-200 to-white"
          style={{
            top: m.top,
            left: m.left,
            boxShadow: '0 0 12px #38bdf8, 0 0 20px #ffffff',
          }}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
          animate={{
            opacity: [0, 1, 1, 0],
            x: [-20, -320],
            y: [15, 240],
            scale: [0.5, 1.2, 0.2],
          }}
          transition={{
            duration: 1.4,
            delay: m.delay,
            repeat: Infinity,
            repeatDelay: m.duration,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}

function Starfield() {
  const reduce = useReducedMotion()
  if (reduce) return null

  const stars = Array.from({ length: 48 }).map((_, i) => ({
    top: `${(i * 19 + 7) % 100}%`,
    left: `${(i * 37 + 13) % 100}%`,
    size: 1 + (i % 3) * 1.5,
    duration: 2.5 + (i % 5) * 0.9,
    delay: (i * 0.3) % 4,
    color: i % 4 === 0 ? '#38bdf8' : i % 3 === 0 ? '#fde047' : '#ffffff',
  }))

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {stars.map((s, idx) => (
        <motion.span
          key={idx}
          className="absolute rounded-full"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            backgroundColor: s.color,
            boxShadow: `0 0 ${s.size * 3}px ${s.color}`,
          }}
          animate={{
            opacity: [0.15, 0.95, 0.15],
            scale: [0.8, 1.4, 0.8],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

/* ───────────────────────── Celestial Constellation Diagram ───────────────────────── */
function ConstellationHeart() {
  const points = [
    { x: 120, y: 70 },
    { x: 170, y: 40 },
    { x: 230, y: 55 },
    { x: 250, y: 110 },
    { x: 200, y: 170 },
    { x: 120, y: 230 },
    { x: 40, y: 170 },
    { x: -10, y: 110 },
    { x: 10, y: 55 },
    { x: 70, y: 40 },
  ]
  const offsetPoints = points.map((p) => ({ x: p.x + 30, y: p.y + 10 }))

  return (
    <div className="relative mx-auto w-72 h-72 sm:w-80 sm:h-80" aria-hidden>
      {/* Outer rotating astrological ring */}
      <motion.svg
        viewBox="0 0 320 320"
        className="absolute inset-0 h-full w-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
      >
        <circle cx="160" cy="160" r="150" fill="none" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="1" strokeDasharray="3 6" />
        <circle cx="160" cy="160" r="142" fill="none" stroke="rgba(250, 204, 21, 0.25)" strokeWidth="0.8" />
        {Array.from({ length: 12 }).map((_, i) => (
          <g key={i} transform={`rotate(${i * 30} 160 160)`}>
            <line x1="160" y1="10" x2="160" y2="18" stroke="#facc15" strokeWidth="1.5" strokeOpacity="0.7" />
            <circle cx="160" cy="24" r="1.5" fill="#38bdf8" />
          </g>
        ))}
      </motion.svg>

      {/* Constellation lines */}
      <svg viewBox="0 0 320 320" className="absolute inset-0 h-full w-full">
        <motion.path
          d="M 150 80 L 200 50 L 260 65 L 280 120 L 230 180 L 150 240 L 70 180 L 20 120 L 40 65 L 100 50 Z"
          fill="none"
          stroke="url(#constellation-grad)"
          strokeWidth="1.6"
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3.5, ease: 'easeInOut' }}
        />
        {/* Star connectors */}
        <line x1="150" y1="80" x2="150" y2="240" stroke="rgba(250, 204, 21, 0.2)" strokeWidth="1" />
        <line x1="40" y1="65" x2="260" y2="65" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="1" />
        <defs>
          <linearGradient id="constellation-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>

        {offsetPoints.map((p, idx) => (
          <g key={idx}>
            <motion.circle
              cx={p.x}
              cy={p.y}
              r="4.5"
              fill="#fef08a"
              animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2 + (idx % 3), repeat: Infinity, delay: idx * 0.2 }}
              style={{ transformOrigin: `${p.x}px ${p.y}px`, filter: 'drop-shadow(0 0 6px #facc15)' }}
            />
            <circle cx={p.x} cy={p.y} r="8" fill="none" stroke="rgba(56,189,248,0.4)" strokeWidth="1" />
          </g>
        ))}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <Sparkles className="h-6 w-6 text-amber-300 animate-pulse !mb-1" />
        <span className="font-serif italic text-xl sm:text-2xl text-amber-100 tracking-wider">
          Written in the Stars
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-cyan-300/80 mt-1">
          Forever Constellation
        </span>
      </div>
    </div>
  )
}

/* ───────────────────────── Interactive Moon Phase Widget ───────────────────────── */
function MoonPhaseCard({ date, couple }: { date?: string | null; couple: string }) {
  const [downloaded, setDownloaded] = useState(false)

  const downloadCalendar = () => {
    if (!date) return
    const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const cleanDate = date.replace(/-/g, '')
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ForeverVows//Celestial//EN',
      'BEGIN:VEVENT',
      `UID:celestial-${Date.now()}@forevervows`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${cleanDate}`,
      `SUMMARY:Celestial Union of ${couple}`,
      'DESCRIPTION:Under a canopy of stars, celebrating eternal love.',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'celestial-wedding.ics'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 3000)
  }

  return (
    <div
      className="relative rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-950/90 via-indigo-950/70 to-slate-950/90 !p-8 sm:!p-12 text-center backdrop-blur-xl shadow-2xl shadow-cyan-950/50 overflow-hidden"
    >
      <div className="absolute -top-24 -left-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Glowing Moon Illustration */}
      <div className="relative mx-auto w-28 h-28 sm:w-32 sm:h-32 !mb-6">
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400/40 via-amber-200/30 to-purple-500/40 blur-xl"
        />
        <div className="relative h-full w-full rounded-full bg-gradient-to-br from-amber-100 via-amber-200 to-amber-400 p-1 shadow-[0_0_50px_rgba(251,191,36,0.45)]">
          <div className="h-full w-full rounded-full bg-slate-950 relative overflow-hidden flex items-center justify-center">
            {/* Moon craters texture */}
            <span className="absolute top-4 left-6 w-5 h-5 rounded-full bg-slate-900/80" />
            <span className="absolute bottom-5 right-7 w-7 h-7 rounded-full bg-slate-900/60" />
            <span className="absolute top-10 right-4 w-3 h-3 rounded-full bg-slate-900/70" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border border-cyan-300/20"
            />
            <Moon className="w-10 h-10 text-amber-200 fill-amber-200/80 relative z-10" />
          </div>
        </div>
      </div>

      <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 !px-4 !py-1 text-[11px] font-mono uppercase tracking-[0.25em] text-amber-300 !mb-3">
        <Sparkles className="w-3 h-3" />
        Auspicious Starlit Night
      </span>

      <h3 className="font-serif text-3xl sm:text-4xl text-white font-light !mb-3">
        The Cosmic Alignment
      </h3>
      <p className="max-w-md mx-auto text-sm sm:text-base text-cyan-100/70 font-sans leading-relaxed !mb-7 text-balance">
        On this sacred night, under the silver glow of the moon and a sky woven with shooting stars, two souls unite for eternity.
      </p>

      {date && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={downloadCalendar}
          className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-amber-300 text-slate-950 font-sans text-xs sm:text-sm font-semibold uppercase tracking-wider !px-7 !py-3.5 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow cursor-pointer"
        >
          {downloaded ? (
            <>
              <Check className="w-4 h-4 text-emerald-900 stroke-[3]" />
              <span>Added to Your Stars</span>
            </>
          ) : (
            <>
              <CalendarPlus className="w-4 h-4 text-slate-950" />
              <span>Add to Calendar</span>
            </>
          )}
        </motion.button>
      )}
    </div>
  )
}

/* ───────────────────────── Celestial Ring Countdown ───────────────────────── */
function subscribeCountdown(callback: () => void) {
  const interval = setInterval(callback, 1000)
  return () => clearInterval(interval)
}

function FlipChar({ char }: { char: string }) {
  return (
    <span className="relative inline-flex h-[1em] overflow-hidden leading-none">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={char}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="inline-block"
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function CelestialCountdown({ date }: { date: string }) {
  const currentSecond = useSyncExternalStore(
    subscribeCountdown,
    () => Math.floor(Date.now() / 1000),
    () => null
  )
  const timeLeft = currentSecond !== null ? getCountdown(date) : null

  if (timeLeft?.isPast) {
    return (
      <p className="text-center font-serif text-2xl sm:text-3xl italic text-amber-200">
        ✨ The stars have aligned — Our celebration is live! ✨
      </p>
    )
  }

  const units = [
    { label: 'Solar Days', val: timeLeft?.days },
    { label: 'Hours', val: timeLeft?.hours },
    { label: 'Minutes', val: timeLeft?.minutes },
    { label: 'Seconds', val: timeLeft?.seconds },
  ]

  return (
    <div
      className="grid grid-cols-4 gap-2.5 sm:gap-6"
      style={{ width: '100%', maxWidth: '44rem', marginInline: 'auto' }}
      role="timer"
      aria-live="off"
    >
      {units.map((u, i) => (
        <motion.div
          key={u.label}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.8, ease }}
          className="group relative flex flex-col items-center gap-2 rounded-2xl border border-cyan-500/25 bg-slate-900/60 !py-6 !px-2 backdrop-blur-md shadow-lg shadow-cyan-950/40 transition-transform hover:scale-[1.02]"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="font-serif font-light tabular-nums leading-none text-[clamp(1.75rem,6vw,3.5rem)] text-white flex drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]">
            {u.val === undefined ? (
              <span>--</span>
            ) : (
              String(u.val)
                .padStart(2, '0')
                .split('')
                .map((ch, ci) => <FlipChar key={ci} char={ch} />)
            )}
          </span>
          <span className="font-mono text-[9px] sm:text-xs uppercase tracking-[0.2em] text-cyan-300/80">
            {u.label}
          </span>
        </motion.div>
      ))}
    </div>
  )
}

/* ───────────────────────── Celestial Events Timeline ───────────────────────── */
function CelestialEvents({ events }: { events: WeddingEvent[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 65%'] })
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 25 })

  return (
    <div ref={ref} className="relative">
      <div className="absolute bottom-2 left-5 top-2 w-px -translate-x-1/2 bg-cyan-900/40 sm:left-1/2" aria-hidden />
      <motion.div
        className="absolute bottom-2 left-5 top-2 w-0.5 origin-top -translate-x-1/2 rounded-full sm:left-1/2"
        style={{ scaleY, background: 'linear-gradient(to bottom, #38bdf8, #facc15, #a855f7)' }}
        aria-hidden
      />

      <ul className="flex list-none flex-col gap-10 sm:gap-16" style={{ padding: 0 }}>
        {events.map((ev, i) => {
          const left = i % 2 === 0
          return (
            <li
              key={ev.id}
              className="relative grid grid-cols-[2.75rem_1fr] gap-x-0 sm:grid-cols-2 sm:gap-x-[clamp(3rem,8vw,6rem)]"
            >
              {/* Star Node */}
              <span className="absolute left-5 top-8 z-10 -translate-x-1/2 sm:left-1/2" aria-hidden>
                <motion.span
                  initial={{ scale: 0, rotate: -45 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true, margin: '-40% 0px' }}
                  transition={{ type: 'spring', stiffness: 350, damping: 14 }}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-300 bg-slate-950 text-amber-300 shadow-[0_0_15px_rgba(250,204,21,0.6)]"
                >
                  <Star className="h-3.5 w-3.5 fill-amber-300" />
                </motion.span>
              </span>

              <motion.article
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.9, ease }}
                whileHover={{ y: -4 }}
                className={`flex flex-col gap-5 rounded-3xl border border-cyan-500/20 bg-slate-900/70 backdrop-blur-xl shadow-xl shadow-cyan-950/30 transition-all hover:border-cyan-400/40 ${
                  left ? 'col-start-2 sm:col-start-1' : 'col-start-2'
                }`}
                style={{ padding: 'clamp(1.5rem, 3.5vw, 2.25rem)' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-300">
                      Phase {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-light text-white leading-tight">
                      {ev.title}
                    </h3>
                  </div>
                  {ev.time && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 font-mono text-[11px] text-cyan-200 !px-3 !py-1 shrink-0">
                      <Clock className="w-3 h-3 text-cyan-300" />
                      {formatTime(ev.time)}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2 font-sans text-sm text-cyan-100/75">
                  {ev.date && (
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-amber-300 shrink-0" />
                      {formatDate(ev.date)}
                    </p>
                  )}
                  {ev.venue && (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-amber-300 shrink-0" />
                      {ev.venue}
                    </p>
                  )}
                  {ev.address && (
                    <p className="text-xs text-cyan-200/50 pl-6 leading-relaxed">{ev.address}</p>
                  )}
                </div>

                {ev.mapsUrl && (
                  <a
                    href={ev.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/30 bg-white/5 font-mono text-xs uppercase tracking-wider text-cyan-200 transition-colors hover:bg-cyan-400 hover:text-slate-950 !px-4 !py-2"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    Stellar Coordinates
                  </a>
                )}
              </motion.article>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ───────────────────────── Starlight Gallery ───────────────────────── */
function CelestialGallery({ photos }: { photos: Photo[] }) {
  const [open, setOpen] = useState<number | null>(null)
  const [dir, setDir] = useState(1)

  const go = useCallback(
    (d: number) => {
      setDir(d)
      setOpen((i) => (i === null ? i : (i + d + photos.length) % photos.length))
    },
    [photos.length],
  )

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, go])

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {photos.map((p, idx) => (
          <motion.button
            key={p.id}
            type="button"
            onClick={() => {
              setDir(1)
              setOpen(idx)
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: (idx % 4) * 0.08, ease }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-900/60 shadow-lg cursor-zoom-in"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.url}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end !p-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-cyan-200 flex items-center gap-1.5">
                <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
                Fragment #{idx + 1}
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl !p-4 sm:!p-10"
          >
            <button
              type="button"
              onClick={() => setOpen(null)}
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    go(-1)
                  }}
                  className="absolute left-3 sm:left-6 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    go(1)
                  }}
                  className="absolute right-3 sm:right-6 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img
              key={open}
              src={photos[open].url}
              alt=""
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="max-h-[85vh] max-w-full rounded-2xl border border-cyan-500/30 object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ───────────────────────── MAIN COMPONENT ───────────────────────── */
export default function CelestialStarlightTemplate({ wedding }: { wedding: WeddingData }) {
  const groom = wedding.groomName || 'Jagan Prasad'
  const bride = wedding.brideName || 'Anu Nair'
  const couple = `${groom} & ${bride}`

  const theme = wedding.theme || {
    primaryColor: '#0f172a',
    secondaryColor: '#38bdf8',
    backgroundColor: '#030712',
    accentColor: '#facc15',
    fontFamily: 'cormorant',
  }

  const primary = theme.primaryColor || '#0f172a'
  const accent = theme.accentColor || '#facc15'
  const bg = theme.backgroundColor || '#030712'
  const coverPhoto = wedding.gallery?.find((g) => g.isCover) || wedding.gallery?.[0]

  /* Page progress */
  const { scrollYProgress: pageProgress } = useScroll()
  const progress = useSpring(pageProgress, { stiffness: 120, damping: 28 })

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="relative min-h-screen w-full overflow-x-hidden font-serif selection:bg-cyan-500 selection:text-slate-950 text-white"
        style={{ backgroundColor: bg }}
      >
        {/* Scroll Progress Bar */}
        <motion.div
          aria-hidden
          className="fixed inset-x-0 top-0 z-[55] h-[3px] origin-left"
          style={{ scaleX: progress, background: 'linear-gradient(to right, #38bdf8, #facc15, #a855f7)' }}
        />

        <WeddingMusicPlayer music={wedding.music} accent="#38bdf8" primary="#0f172a" />

        {/* ───────── HERO ───────── */}
        <section className="relative flex min-h-[100svh] flex-col items-center justify-center text-center overflow-hidden !px-5 !py-24">
          <div className="absolute inset-0 z-0">
            {coverPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverPhoto.url}
                alt=""
                className="h-full w-full object-cover opacity-25 filter blur-[1px] scale-105"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-b from-[#030712] via-[#090d1f] to-[#030712]" />
            )}
            <div className="absolute inset-0 bg-radial-[ellipse_at_center] from-indigo-950/50 via-slate-950/80 to-[#030712]" />
          </div>

          <Starfield />
          <ShootingStars />

          <div className="relative z-10 flex flex-col items-center gap-7 max-w-4xl mx-auto">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 backdrop-blur-md !px-5 !py-1.5 text-xs font-mono uppercase tracking-[0.3em] text-cyan-300"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Under the Stars and Skies
            </motion.div>

            <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col items-center gap-3">
              <h1 className="font-serif font-light text-5xl sm:text-7xl lg:text-8xl tracking-tight text-white leading-[1.05]">
                <Words text={groom} />
              </h1>
              <motion.span
                variants={fadeUp}
                className="font-serif italic text-3xl sm:text-5xl text-amber-300 font-light !my-1"
              >
                &amp;
              </motion.span>
              <h1 className="font-serif font-light text-5xl sm:text-7xl lg:text-8xl tracking-tight text-white leading-[1.05]">
                <Words text={bride} />
              </h1>
            </motion.div>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="max-w-xl font-sans text-sm sm:text-base text-cyan-100/70 font-light leading-relaxed text-balance"
            >
              Request the honour of your presence as their orbits intertwine in sacred matrimony.
            </motion.p>

            {/* Constellation Feature */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 1.2, ease }}
              className="!my-4"
            >
              <ConstellationHeart />
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="flex flex-wrap items-center justify-center gap-3 font-sans text-xs uppercase tracking-widest text-cyan-200"
            >
              {wedding.weddingDate && (
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-slate-900/70 backdrop-blur-md !px-5 !py-2.5">
                  <Calendar className="w-4 h-4 text-amber-300" />
                  {formatDate(wedding.weddingDate)}
                </span>
              )}
              {wedding.venueName && (
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-slate-900/70 backdrop-blur-md !px-5 !py-2.5">
                  <MapPin className="w-4 h-4 text-amber-300" />
                  {wedding.venueName}
                </span>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 1.8 }}
            className="absolute bottom-6 z-10 flex flex-col items-center gap-1 text-cyan-300/80 font-mono text-[10px] uppercase tracking-[0.25em]"
          >
            <span>Scroll Into Orbit</span>
            <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
              <ChevronDown className="w-4 h-4" />
            </motion.span>
          </motion.div>
        </section>

        {/* ───────── MOON PHASE & SAVE THE DATE ───────── */}
        <Section max="48rem">
          <Reveal>
            <MoonPhaseCard date={wedding.weddingDate} couple={couple} />
          </Reveal>
        </Section>

        {/* ───────── COUNTDOWN ───────── */}
        {wedding.weddingDate && (
          <Section max="50rem" className="border-y border-cyan-500/15 bg-slate-950/40">
            <Reveal className="flex flex-col items-center gap-8 text-center">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-400">
                Orbital Countdown // Time Until Conjunction
              </span>
              <CelestialCountdown date={wedding.weddingDate} />
            </Reveal>
          </Section>
        )}

        {/* ───────── LOVE STORY ───────── */}
        {wedding.story && (
          <Section max="60rem">
            <Reveal className="flex flex-col items-center text-center gap-6">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-amber-300">
                Chapter of Destiny
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-white font-light">
                How Our Orbits Crossed
              </h2>
              <div className="w-20 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent !my-2" />
              <p className="font-serif text-xl sm:text-2xl text-cyan-100/80 italic leading-relaxed max-w-2xl text-balance">
                &ldquo;{wedding.story}&rdquo;
              </p>
              <span className="font-mono text-xs uppercase tracking-widest text-cyan-300/60">— {couple}</span>
            </Reveal>
          </Section>
        )}

        {/* ───────── EVENTS TIMELINE ───────── */}
        {wedding.events && wedding.events.length > 0 && (
          <Section max="60rem" className="bg-gradient-to-b from-[#030712] via-slate-950 to-[#030712]">
            <Reveal className="flex flex-col items-center text-center gap-4 !mb-14">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-400">
                Celestial Itinerary
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-white font-light">
                Order of Celebrations
              </h2>
              <p className="text-sm sm:text-base text-cyan-100/60 max-w-md font-sans">
                Every sacred hour guided by starlight and devotion.
              </p>
            </Reveal>
            <CelestialEvents events={wedding.events} />
          </Section>
        )}

        {/* ───────── GALLERY ───────── */}
        {wedding.gallery && wedding.gallery.length > 0 && (
          <Section max="70rem">
            <Reveal className="flex flex-col items-center text-center gap-4 !mb-12">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-amber-300">
                Captured Constellations
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-white font-light">
                Memories in the Cosmos
              </h2>
            </Reveal>
            <CelestialGallery photos={wedding.gallery} />
          </Section>
        )}

        {/* ───────── RSVP ───────── */}
        <Section max="38rem">
          <Reveal className="flex flex-col items-center text-center gap-4 !mb-10">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-400">
              Confirm Your Seat
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-white font-light">
              Will You Celebrate With Us?
            </h2>
            <p className="text-sm text-cyan-100/60 font-sans max-w-md">
              Please let us know if you can join us under the stars.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-cyan-500/25 bg-slate-900/80 !p-6 sm:!p-10 backdrop-blur-xl shadow-2xl">
              <RSVPForm weddingId={wedding.id} primaryColor="#38bdf8" accentColor="#facc15" />
            </div>
          </Reveal>
        </Section>

        {/* ───────── FOOTER ───────── */}
        <footer className="border-t border-cyan-500/20 bg-slate-950/80 !py-12 text-center text-cyan-300/60 text-xs font-mono">
          <p className="!mb-2">Under the infinite canopy of love • {couple}</p>
          <p>
            Created with{' '}
            <Link href="/" className="text-amber-300 underline underline-offset-4 hover:text-white">
              ForeverVows
            </Link>
          </p>
        </footer>
      </div>
    </MotionConfig>
  )
}
