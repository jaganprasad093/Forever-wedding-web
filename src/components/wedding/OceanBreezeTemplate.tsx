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
  CalendarPlus,
  Check,
  Compass,
  Sparkles,
} from 'lucide-react'
import { WeddingData } from '@/types/wedding'
import { formatDate, formatTime, getCountdown } from '@/lib/utils'
import RSVPForm from '@/components/rsvp/RSVPForm'
import WeddingMusicPlayer from './WeddingMusicPlayer'

type Photo = NonNullable<WeddingData['gallery']>[number]
type WeddingEvent = NonNullable<WeddingData['events']>[number]

const ease = [0.22, 1, 0.36, 1] as const

const OCEAN_BLUE = '#0e7490'
const AQUAMARINE = '#06b6d4'
const SAND_LIGHT = '#f0fdfa'

const SECTION_PAD: React.CSSProperties = {
  padding: 'clamp(5rem, 10vw, 8rem) clamp(1.25rem, 5vw, 3rem)',
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.35 } },
}

const wordRise: Variants = {
  hidden: { y: '115%', opacity: 0 },
  show: { y: '0%', opacity: 1, transition: { duration: 1.1, ease } },
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease } },
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

/* ───────────────────────── Animated SVG Ocean Waves ───────────────────────── */
function AnimatedOceanWaves() {
  const reduce = useReducedMotion()
  return (
    <div className="pointer-events-none absolute bottom-0 inset-x-0 overflow-hidden leading-none z-10" aria-hidden>
      <motion.svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="relative block w-[200%] h-16 sm:h-24 text-cyan-500/20"
        animate={reduce ? undefined : { x: ['0%', '-50%'] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      >
        <path
          d="M0,0 C150,90 350,-40 500,50 C650,140 900,-20 1200,40 L1200,120 L0,120 Z M1200,0 C1350,90 1550,-40 1700,50 C1850,140 2100,-20 2400,40 L2400,120 L1200,120 Z"
          fill="currentColor"
        />
      </motion.svg>
      <motion.svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="relative block w-[200%] h-12 sm:h-18 -mt-8 text-cyan-600/30"
        animate={reduce ? undefined : { x: ['-50%', '0%'] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
      >
        <path
          d="M0,20 C200,100 400,-20 600,60 C800,130 1000,0 1200,40 L1200,120 L0,120 Z M1200,20 C1400,100 1600,-20 1800,60 C2000,130 2200,0 2400,40 L2400,120 L1200,120 Z"
          fill="currentColor"
        />
      </motion.svg>
    </div>
  )
}

/* ───────────────────────── Floating Pearl Shimmer Bubbles ───────────────────────── */
function PearlBubbles() {
  const reduce = useReducedMotion()
  if (reduce) return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: 18 }).map((_, i) => {
        const size = 6 + (i % 4) * 5
        return (
          <motion.div
            key={i}
            className="absolute rounded-full border border-white/60"
            style={{
              left: `${(i * 23 + 7) % 96}%`,
              bottom: 0,
              width: size,
              height: size,
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(6,182,212,0.2) 70%, rgba(14,116,144,0.4))',
              boxShadow: '0 0 10px rgba(6, 182, 212, 0.4)',
            }}
            initial={{ y: '0vh', opacity: 0 }}
            animate={{
              y: ['0vh', '-95vh'],
              x: [0, (i % 2 === 0 ? 1 : -1) * 25, 0],
              opacity: [0, 0.85, 0],
            }}
            transition={{
              duration: 8 + (i % 4) * 2,
              delay: (i * 0.5) % 5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )
      })}
    </div>
  )
}

/* ───────────────────────── Message in a Bottle Reveal Card ───────────────────────── */
function BottleMessageReveal({ date, couple, venue }: { date?: string | null; couple: string; venue?: string | null }) {
  const [uncorked, setUncorked] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  const downloadCalendar = () => {
    if (!date) return
    const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const cleanDate = date.replace(/-/g, '')
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ForeverVows//OceanBreeze//EN',
      'BEGIN:VEVENT',
      `UID:ocean-${Date.now()}@forevervows`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${cleanDate}`,
      `SUMMARY:Coastal Wedding of ${couple}`,
      venue ? `LOCATION:${venue}` : '',
      'DESCRIPTION:Where the ocean breeze whispers eternal love.',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ocean-breeze-wedding.ics'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 3000)
  }

  return (
    <div className="relative mx-auto max-w-xl text-center select-none">
      {/* Sandy Beach Glass Card */}
      <div className="relative rounded-3xl border-2 border-cyan-400/40 bg-gradient-to-b from-[#f0fdfa]/95 via-[#e6fffa]/90 to-[#ccfbf1]/95 !p-8 sm:!p-12 shadow-2xl shadow-cyan-950/15 overflow-hidden">
        {/* Coastal Compass Emblem */}
        <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-cyan-600/30 bg-cyan-500/10 flex items-center justify-center !mb-5 shadow-inner">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
          >
            <Compass className="w-10 h-10 text-cyan-700 stroke-[1.5]" />
          </motion.div>
        </div>

        <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.35em] text-cyan-800 font-semibold !mb-2 block">
          Message In A Bottle // Save The Tide
        </span>

        <h3 className="font-serif text-3xl sm:text-4xl text-cyan-950 font-normal leading-tight !mb-2">
          {couple}
        </h3>

        {date && (
          <p className="font-serif italic text-xl text-cyan-800 !mb-5">
            {formatDate(date)}
          </p>
        )}

        <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-cyan-600 to-transparent mx-auto !mb-6" />

        {/* Uncork Bottle Button */}
        <div className="!my-5 flex flex-col items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setUncorked(!uncorked)}
            className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-cyan-500 bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-700 text-white font-sans text-xs uppercase tracking-widest font-semibold !px-7 !py-3 shadow-lg shadow-cyan-700/25"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>{uncorked ? 'Cork Message' : 'Uncork The Bottle'}</span>
          </motion.button>
        </div>

        <AnimatePresence>
          {uncorked && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: 15 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: 15 }}
              transition={{ duration: 0.5, ease }}
              className="overflow-hidden flex flex-col items-center gap-4 !pt-3"
            >
              <p className="font-serif italic text-base text-cyan-900 max-w-md mx-auto leading-relaxed">
                &ldquo;As steady as the tides, as boundless as the sea — we pledge our lives to one another.&rdquo;
              </p>
              {venue && (
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/50 bg-white/80 !px-4 !py-1.5 text-xs text-cyan-950 font-sans">
                  <MapPin className="w-3.5 h-3.5 text-cyan-700" />
                  <span>{venue}</span>
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={downloadCalendar}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-700 to-teal-800 text-white text-xs font-semibold uppercase tracking-wider !px-6 !py-3 rounded-full shadow-md cursor-pointer"
              >
                {downloaded ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
                    <span>Tide Marked on Calendar</span>
                  </>
                ) : (
                  <>
                    <CalendarPlus className="w-4 h-4" />
                    <span>Add to Calendar</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ───────────────────────── Ocean Ripple Countdown ───────────────────────── */
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

function OceanCountdown({ date }: { date: string }) {
  const currentSecond = useSyncExternalStore(
    subscribeCountdown,
    () => Math.floor(Date.now() / 1000),
    () => null
  )
  const timeLeft = currentSecond !== null ? getCountdown(date) : null

  if (timeLeft?.isPast) {
    return (
      <p className="text-center font-serif text-2xl sm:text-3xl italic text-cyan-900">
        The High Tide of Celebration Has Begun! 🌊
      </p>
    )
  }

  const units = [
    { label: 'Tidal Days', val: timeLeft?.days },
    { label: 'Hours', val: timeLeft?.hours },
    { label: 'Minutes', val: timeLeft?.minutes },
    { label: 'Seconds', val: timeLeft?.seconds },
  ]

  return (
    <div
      className="grid grid-cols-4 gap-2.5 sm:gap-6"
      style={{ width: '100%', maxWidth: '42rem', marginInline: 'auto' }}
      role="timer"
      aria-live="off"
    >
      {units.map((u, i) => (
        <motion.div
          key={u.label}
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.7, ease }}
          className="relative flex flex-col items-center gap-2 rounded-2xl border border-cyan-400/40 bg-white/80 backdrop-blur-sm !py-6 !px-2 shadow-sm text-center"
        >
          <span className="font-serif font-light text-[clamp(1.75rem,5.5vw,3.25rem)] text-cyan-950 leading-none tabular-nums flex">
            {u.val === undefined ? (
              <span>--</span>
            ) : (
              String(u.val)
                .padStart(2, '0')
                .split('')
                .map((ch, ci) => <FlipChar key={ci} char={ch} />)
            )}
          </span>
          <span className="font-mono text-[9px] sm:text-xs uppercase tracking-[0.2em] text-cyan-700 font-semibold">
            {u.label}
          </span>
        </motion.div>
      ))}
    </div>
  )
}

/* ───────────────────────── Nautical Waves Timeline ───────────────────────── */
function OceanEvents({ events }: { events: WeddingEvent[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 65%'] })
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 25 })

  return (
    <div ref={ref} className="relative">
      <div className="absolute bottom-2 left-5 top-2 w-px -translate-x-1/2 bg-cyan-700/20 sm:left-1/2" aria-hidden />
      <motion.div
        className="absolute bottom-2 left-5 top-2 w-0.5 origin-top -translate-x-1/2 rounded-full sm:left-1/2"
        style={{ scaleY, background: 'linear-gradient(to bottom, #06b6d4, #0e7490)' }}
        aria-hidden
      />

      <ul className="flex list-none flex-col gap-10 sm:gap-14" style={{ padding: 0 }}>
        {events.map((ev, i) => {
          const left = i % 2 === 0
          return (
            <li
              key={ev.id}
              className="relative grid grid-cols-[2.75rem_1fr] gap-x-0 sm:grid-cols-2 sm:gap-x-[clamp(3rem,8vw,6rem)]"
            >
              <span className="absolute left-5 top-8 z-10 -translate-x-1/2 sm:left-1/2" aria-hidden>
                <motion.span
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, margin: '-40% 0px' }}
                  transition={{ type: 'spring', stiffness: 350, damping: 14 }}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-cyan-400 bg-cyan-600 text-white shadow-md"
                >
                  <span className="text-xs">⚓</span>
                </motion.span>
              </span>

              <motion.article
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.9, ease }}
                whileHover={{ y: -4 }}
                className={`flex flex-col gap-5 rounded-3xl border border-cyan-400/30 bg-white/90 backdrop-blur-sm shadow-xl shadow-cyan-950/5 transition-all ${
                  left ? 'col-start-2 sm:col-start-1' : 'col-start-2'
                }`}
                style={{ padding: 'clamp(1.5rem, 3.5vw, 2.25rem)' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-700 font-semibold">
                      Course {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-medium text-cyan-950 leading-tight">
                      {ev.title}
                    </h3>
                  </div>
                  {ev.time && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-50 font-mono text-[11px] text-cyan-800 !px-3 !py-1 shrink-0 font-medium">
                      <Clock className="w-3 h-3 text-cyan-600" />
                      {formatTime(ev.time)}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2 font-sans text-sm text-stone-600">
                  {ev.date && (
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-cyan-700 shrink-0" />
                      {formatDate(ev.date)}
                    </p>
                  )}
                  {ev.venue && (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-cyan-700 shrink-0" />
                      {ev.venue}
                    </p>
                  )}
                  {ev.address && (
                    <p className="text-xs text-stone-500 pl-6 leading-relaxed">{ev.address}</p>
                  )}
                </div>

                {ev.mapsUrl && (
                  <a
                    href={ev.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-50 font-mono text-xs uppercase tracking-wider text-cyan-800 transition-colors hover:bg-cyan-700 hover:text-white !px-4 !py-2"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    Coastal Waypoint
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

/* ───────────────────────── Coastal Driftwood Gallery ───────────────────────── */
function OceanGallery({ photos }: { photos: Photo[] }) {
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {photos.map((p, idx) => (
          <motion.button
            key={p.id}
            type="button"
            onClick={() => {
              setDir(1)
              setOpen(idx)
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: (idx % 4) * 0.08, ease }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl border-2 border-cyan-300/40 bg-cyan-50 shadow-md cursor-zoom-in"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.url}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end !p-4">
              <span className="font-serif italic text-sm text-cyan-200">Seaside Memory {idx + 1}</span>
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
            className="fixed inset-0 z-[60] flex items-center justify-center bg-cyan-950/90 backdrop-blur-md !p-4 sm:!p-10"
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
              className="max-h-[85vh] max-w-full rounded-2xl border border-cyan-400/40 object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ───────────────────────── MAIN COMPONENT ───────────────────────── */
export default function OceanBreezeTemplate({ wedding }: { wedding: WeddingData }) {
  const groom = wedding.groomName || 'Jagan Prasad'
  const bride = wedding.brideName || 'Anu Nair'
  const couple = `${groom} & ${bride}`

  const theme = wedding.theme || {
    primaryColor: '#0e7490',
    secondaryColor: '#06b6d4',
    backgroundColor: '#f0fdfa',
    accentColor: '#38bdf8',
    fontFamily: 'cormorant',
  }

  const primary = theme.primaryColor || '#0e7490'
  const accent = theme.accentColor || '#38bdf8'
  const bg = theme.backgroundColor || '#f0fdfa'
  const coverPhoto = wedding.gallery?.find((g) => g.isCover) || wedding.gallery?.[0]

  const { scrollYProgress: pageProgress } = useScroll()
  const progress = useSpring(pageProgress, { stiffness: 120, damping: 28 })

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="relative min-h-screen w-full overflow-x-hidden font-serif selection:bg-cyan-600 selection:text-white text-stone-900"
        style={{ backgroundColor: bg }}
      >
        {/* Scroll Progress Bar */}
        <motion.div
          aria-hidden
          className="fixed inset-x-0 top-0 z-[55] h-[3px] origin-left"
          style={{ scaleX: progress, background: 'linear-gradient(to right, #06b6d4, #0e7490, #155e75)' }}
        />

        <WeddingMusicPlayer music={wedding.music} accent="#06b6d4" primary="#0e7490" />

        {/* ───────── HERO ───────── */}
        <section className="relative flex min-h-[100svh] flex-col items-center justify-center text-center overflow-hidden !px-5 !py-24 bg-gradient-to-b from-[#e6fffa] via-[#f0fdfa] to-[#ccfbf1]/50">
          <PearlBubbles />
          <AnimatedOceanWaves />

          <div className="relative z-10 flex flex-col items-center gap-7 max-w-4xl mx-auto">
            {/* Coastal Compass Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease }}
              className="relative w-20 h-20 rounded-full border border-cyan-400 bg-cyan-100/60 flex items-center justify-center shadow-md shadow-cyan-900/10"
            >
              <Compass className="w-10 h-10 text-cyan-700" />
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-600/30 bg-cyan-600/10 backdrop-blur-md !px-5 !py-1.5 text-xs font-mono uppercase tracking-[0.3em] text-cyan-800 font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              Coastal Nuptials
            </motion.div>

            <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col items-center gap-3">
              <h1 className="font-serif font-normal text-5xl sm:text-7xl lg:text-8xl tracking-tight text-cyan-950 leading-[1.05]">
                <Words text={groom} />
              </h1>
              <motion.span
                variants={fadeUp}
                className="font-serif italic text-3xl sm:text-5xl text-cyan-700 font-light !my-1"
              >
                &amp;
              </motion.span>
              <h1 className="font-serif font-normal text-5xl sm:text-7xl lg:text-8xl tracking-tight text-cyan-950 leading-[1.05]">
                <Words text={bride} />
              </h1>
            </motion.div>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="max-w-xl font-sans text-sm sm:text-base text-stone-700 font-light leading-relaxed text-balance"
            >
              Where the sea meets the shore and the horizon stretches infinitely, we invite you to anchor in our eternal love.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="flex flex-wrap items-center justify-center gap-3 font-sans text-xs uppercase tracking-widest text-cyan-950"
            >
              {wedding.weddingDate && (
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300 bg-white/80 backdrop-blur-md !px-5 !py-2.5 shadow-sm">
                  <Calendar className="w-4 h-4 text-cyan-700" />
                  {formatDate(wedding.weddingDate)}
                </span>
              )}
              {wedding.venueName && (
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300 bg-white/80 backdrop-blur-md !px-5 !py-2.5 shadow-sm">
                  <MapPin className="w-4 h-4 text-cyan-700" />
                  {wedding.venueName}
                </span>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 1.8 }}
            className="absolute bottom-6 z-20 flex flex-col items-center gap-1 text-cyan-800 font-mono text-[10px] uppercase tracking-[0.25em]"
          >
            <span>Sail Down</span>
            <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
              <ChevronDown className="w-4 h-4" />
            </motion.span>
          </motion.div>
        </section>

        {/* ───────── MESSAGE IN A BOTTLE ───────── */}
        <Section max="48rem">
          <Reveal>
            <BottleMessageReveal date={wedding.weddingDate} couple={couple} venue={wedding.venueName} />
          </Reveal>
        </Section>

        {/* ───────── COUNTDOWN ───────── */}
        {wedding.weddingDate && (
          <Section max="48rem" className="border-y border-cyan-500/20 bg-[#e6fffa]/40">
            <Reveal className="flex flex-col items-center gap-8 text-center">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-800 font-semibold">
                Until The High Tide of Forever
              </span>
              <OceanCountdown date={wedding.weddingDate} />
            </Reveal>
          </Section>
        )}

        {/* ───────── STORY ───────── */}
        {wedding.story && (
          <Section max="58rem">
            <Reveal className="flex flex-col items-center text-center gap-6">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-700 font-semibold">
                Tides &amp; Currents
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-cyan-950 font-normal">
                How Our Seas Met
              </h2>
              <div className="w-20 h-px bg-gradient-to-r from-transparent via-cyan-600 to-transparent !my-2" />
              <p className="font-serif text-xl sm:text-2xl text-stone-800 italic leading-relaxed max-w-2xl text-balance">
                &ldquo;{wedding.story}&rdquo;
              </p>
              <span className="font-mono text-xs uppercase tracking-widest text-cyan-700 font-semibold">— {couple}</span>
            </Reveal>
          </Section>
        )}

        {/* ───────── EVENTS ───────── */}
        {wedding.events && wedding.events.length > 0 && (
          <Section max="60rem" className="bg-gradient-to-b from-[#f0fdfa] via-[#e6fffa]/50 to-[#f0fdfa]">
            <Reveal className="flex flex-col items-center text-center gap-4 !mb-14">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-700 font-semibold">
                Voyage Itinerary
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-cyan-950 font-normal">
                Celebration Schedule
              </h2>
            </Reveal>
            <OceanEvents events={wedding.events} />
          </Section>
        )}

        {/* ───────── GALLERY ───────── */}
        {wedding.gallery && wedding.gallery.length > 0 && (
          <Section max="70rem">
            <Reveal className="flex flex-col items-center text-center gap-4 !mb-12">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-700 font-semibold">
                Coastal Glimpses
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-cyan-950 font-normal">
                Moments by the Shore
              </h2>
            </Reveal>
            <OceanGallery photos={wedding.gallery} />
          </Section>
        )}

        {/* ───────── RSVP ───────── */}
        <Section max="38rem">
          <Reveal className="flex flex-col items-center text-center gap-4 !mb-10">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-700 font-semibold">
              Presence &amp; Blessings
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-cyan-950 font-normal">
              Will You Sail With Us?
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-3xl border-2 border-cyan-400/40 bg-white !p-6 sm:!p-10 shadow-xl shadow-cyan-950/10">
              <RSVPForm weddingId={wedding.id} primaryColor="#0e7490" accentColor="#06b6d4" />
            </div>
          </Reveal>
        </Section>

        {/* ───────── FOOTER ───────── */}
        <footer className="border-t border-cyan-500/20 bg-[#e6fffa]/60 !py-12 text-center text-stone-600 text-xs font-mono">
          <p className="!mb-2">Carried by the gentle ocean breeze • {couple}</p>
          <p>
            Designed on{' '}
            <Link href="/" className="text-cyan-800 font-semibold underline underline-offset-4 hover:text-stone-900">
              ForeverVows
            </Link>
          </p>
        </footer>
      </div>
    </MotionConfig>
  )
}
