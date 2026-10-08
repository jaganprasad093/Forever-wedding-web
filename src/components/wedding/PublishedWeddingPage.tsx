'use client'

import { Fragment, useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
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
  Music,
  MapPin,
  Calendar,
  Clock,
  Heart,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Navigation,
  X,
} from 'lucide-react'
import { WeddingData, MusicItem } from '@/types/wedding'
import { formatDate, formatTime, getCountdown } from '@/lib/utils'
import RSVPForm from '@/components/rsvp/RSVPForm'

type Photo = NonNullable<WeddingData['gallery']>[number]
type WeddingEvent = NonNullable<WeddingData['events']>[number]

const ease = [0.22, 1, 0.36, 1] as const


const SECTION_PAD: React.CSSProperties = {
  padding: 'clamp(4rem, 9vw, 7.5rem) clamp(1.25rem, 5vw, 3rem)',
}
const CARD_PAD: React.CSSProperties = { padding: 'clamp(1.5rem, 3.5vw, 2.5rem)' }
const PILL_PAD: React.CSSProperties = { padding: '0.5rem 1rem' }
const BTN_PAD: React.CSSProperties = { padding: '0.8rem 1.75rem' }

function Section({
  children,
  max = '64rem',
  bg,
  id,
}: {
  children: React.ReactNode
  max?: string
  bg?: string
  id?: string
}) {
  return (
    <section id={id} style={{ ...SECTION_PAD, backgroundColor: bg }}>
      <div style={{ width: '100%', maxWidth: max, marginInline: 'auto' }}>{children}</div>
    </section>
  )
}

/* ───────────────────────── Motion helpers ───────────────────────── */

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } },
}
const wordRise: Variants = {
  hidden: { y: '115%' },
  show: { y: '0%', transition: { duration: 1, ease } },
}
const fadeScale: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  show: { opacity: 0.7, scale: 1, transition: { duration: 0.8, ease } },
}
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
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
      transition={{ duration: 0.8, delay, ease }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}

// Words slide up from behind a mask.
function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(' ').map((word, i, arr) => (
        <Fragment key={i}>
          <span
            className="inline-block overflow-hidden align-bottom"
            style={{ paddingBlock: '0.12em', marginBlock: '-0.12em' }}
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

// Soft particles drifting upward (deterministic so SSR and client match).
function Particles({ color, symbol, count = 14 }: { color: string; symbol?: string; count?: number }) {
  const reduce = useReducedMotion()
  if (reduce) return null
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: count }).map((_, i) => {
        const size = 4 + (i % 4) * 3
        return (
          <motion.span
            key={i}
            className="absolute bottom-0 flex items-center justify-center"
            style={{
              left: `${(i * 53 + 11) % 100}%`,
              color,
              fontSize: symbol ? size * 3 : undefined,
              width: symbol ? undefined : size,
              height: symbol ? undefined : size,
              borderRadius: 9999,
              backgroundColor: symbol ? undefined : color,
            }}
            initial={{ y: '0vh', opacity: 0 }}
            animate={{
              y: ['0vh', '-85vh'],
              x: ['0px', '16px', '-12px', '0px'],
              opacity: [0, 0.7, 0],
            }}
            transition={{
              duration: 8 + (i % 5) * 1.8,
              delay: (i * 0.7) % 7,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {symbol}
          </motion.span>
        )
      })}
    </div>
  )
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  color,
}: {
  eyebrow: string
  title: string
  subtitle?: string
  color: string
}) {
  return (
    <Reveal
      className="flex flex-col items-center text-center gap-4"
      style={{ marginBottom: 'clamp(2.5rem, 6vw, 4.5rem)' }}
    >
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        <span
          className="h-px w-8 sm:w-14"
          style={{ background: `linear-gradient(to right, transparent, ${color})` }}
        />
        <span className="text-xs sm:text-sm uppercase tracking-[0.3em] opacity-70" style={{ color }}>
          {eyebrow}
        </span>
        <span
          className="h-px w-8 sm:w-14"
          style={{ background: `linear-gradient(to left, transparent, ${color})` }}
        />
      </div>
      <h2
        className="font-medium tracking-tight leading-[1.1] text-balance text-[clamp(2.25rem,5vw,3.75rem)]"
        style={{ color }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="opacity-70 text-base sm:text-lg leading-relaxed max-w-md text-balance">{subtitle}</p>
      )}
    </Reveal>
  )
}

function Divider({ color }: { color: string }) {
  return (
    <div
      className="flex items-center justify-center gap-4"
      style={{ width: '100%', maxWidth: '24rem', marginInline: 'auto', paddingInline: '1rem' }}
      aria-hidden
    >
      <motion.span
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease }}
        className="h-px flex-1 origin-right opacity-30"
        style={{ backgroundColor: color }}
      />
      <motion.span
        animate={{ scale: [1, 1.25, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Heart className="w-4 h-4 opacity-50" style={{ color, fill: color }} />
      </motion.span>
      <motion.span
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease }}
        className="h-px flex-1 origin-left opacity-30"
        style={{ backgroundColor: color }}
      />
    </div>
  )
}

/* ───────────────────────── Countdown ───────────────────────── */

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

function subscribeCountdown(callback: () => void) {
  const interval = setInterval(callback, 1000)
  return () => clearInterval(interval)
}

function getCountdownSnapshot() {
  return Math.floor(Date.now() / 1000)
}

function getServerCountdownSnapshot() {
  return null
}

function CountdownTimer({ weddingDate, primary }: { weddingDate: string; primary: string }) {
  const currentSecond = useSyncExternalStore(
    subscribeCountdown,
    getCountdownSnapshot,
    getServerCountdownSnapshot
  )

  const timeLeft = currentSecond !== null ? getCountdown(weddingDate) : null

  if (timeLeft?.isPast) {
    return (
      <div className="text-center" style={{ padding: '1.5rem 0' }}>
        <motion.p
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="font-serif text-2xl sm:text-3xl"
        >
          The celebration has begun! 🎉
        </motion.p>
      </div>
    )
  }

  const units = [
    { value: timeLeft?.days, label: 'Days' },
    { value: timeLeft?.hours, label: 'Hours' },
    { value: timeLeft?.minutes, label: 'Mins' },
    { value: timeLeft?.seconds, label: 'Secs' },
  ]

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4 lg:gap-6" role="timer" aria-live="off">
      {units.map(({ value, label }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.6, ease }}
          className="flex flex-col items-center gap-3 rounded-2xl text-center border"
          style={{
            backgroundColor: `${primary}0d`,
            borderColor: `${primary}1f`,
            padding: 'clamp(1rem, 2.5vw, 1.75rem) 0.25rem',
          }}
        >
          <div className="font-serif text-[clamp(1.875rem,5vw,3.5rem)] font-medium tabular-nums leading-none flex justify-center">
            {value === undefined ? (
              <span className="opacity-30">––</span>
            ) : (
              String(value)
                .padStart(2, '0')
                .split('')
                .map((ch, ci) => <FlipChar key={ci} char={ch} />)
            )}
          </div>
          <p className="text-[0.625rem] sm:text-xs uppercase tracking-[0.2em] opacity-60">{label}</p>
        </motion.div>
      ))}
    </div>
  )
}

/* ───────────────────────── Music ───────────────────────── */

function MusicPlayer({ music, accent, primary }: { music: MusicItem; accent: string; primary: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  // Browsers block autoplay, so start on the first tap or click.
  useEffect(() => {
    const cleanup = () => {
      document.removeEventListener('click', start)
      document.removeEventListener('touchstart', start)
    }
    function start() {
      const a = audioRef.current
      if (a) {
        a.volume = 0.5
        a.play().catch(() => { })
      }
      cleanup()
    }
    document.addEventListener('click', start)
    document.addEventListener('touchstart', start)
    return cleanup
  }, [])

  const toggle = () => {
    const a = audioRef.current
    if (!a) return
    if (a.paused) a.play().catch(() => { })
    else a.pause()
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={music.url}
        loop
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <motion.button
        type="button"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, type: 'spring', stiffness: 260, damping: 18 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={toggle}
        aria-label={playing ? 'Pause music' : 'Play music'}
        aria-pressed={playing}
        className="fixed z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/95 backdrop-blur shadow-2xl border flex items-center justify-center"
        style={{
          right: 'max(1rem, env(safe-area-inset-right))',
          bottom: 'max(1.25rem, env(safe-area-inset-bottom))',
          color: primary,
          borderColor: `${accent}80`,
        }}
      >
        {playing ? (
          <span className="flex items-end gap-[3px] h-4" aria-hidden>
            {[0, 1, 2, 3].map((b) => (
              <motion.span
                key={b}
                className="w-[3px] rounded-full"
                style={{ backgroundColor: primary }}
                animate={{ height: [4, 16, 7, 14, 4] }}
                transition={{ duration: 1 + b * 0.15, repeat: Infinity, ease: 'easeInOut', delay: b * 0.1 }}
              />
            ))}
          </span>
        ) : (
          <Music className="w-5 h-5" />
        )}
        {playing && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: accent }}
            animate={{ scale: [1, 1.5], opacity: [0.7, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
      </motion.button>
    </>
  )
}

/* ───────────────────────── Events timeline ───────────────────────── */

function dateParts(d?: string | null) {
  if (!d) return null
  const isoDay = /^\d{4}-\d{2}-\d{2}$/.test(d)
  const dt = new Date(isoDay ? `${d}T00:00:00Z` : d)
  if (isNaN(dt.getTime())) return null
  const timeZone = isoDay ? 'UTC' : undefined
  return {
    day: dt.toLocaleDateString('en-US', { day: '2-digit', timeZone }),
    month: dt.toLocaleDateString('en-US', { month: 'short', timeZone }),
  }
}

function EventsTimeline({
  events,
  primary,
  secondary,
  accent,
  bg,
}: {
  events: WeddingEvent[]
  primary: string
  secondary: string
  accent: string
  bg: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 65%'] })
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 25 })

  return (
    <div ref={ref} className="relative">
      {/* Rail: left on phones, centred from sm up */}
      <div
        className="absolute left-5 sm:left-1/2 top-2 bottom-2 w-px -translate-x-1/2 opacity-20"
        style={{ backgroundColor: primary }}
        aria-hidden
      />
      <motion.div
        className="absolute left-5 sm:left-1/2 top-2 bottom-2 w-0.5 -translate-x-1/2 origin-top rounded-full"
        style={{ scaleY, background: `linear-gradient(${accent}, ${secondary})` }}
        aria-hidden
      />

      <ul className="flex flex-col gap-8 sm:gap-14 list-none">
        {events.map((event, i) => {
          const parts = dateParts(event.date)
          const leftSide = i % 2 === 0
          return (
            <li
              key={event.id}
              className="relative grid grid-cols-[2.75rem_1fr] sm:grid-cols-2 gap-x-0 sm:gap-x-[clamp(3rem,8vw,6rem)]"
            >
              {/* Timeline dot */}
              <span
                className="absolute left-5 sm:left-1/2 top-9 -translate-x-1/2 z-10 flex h-4 w-4 items-center justify-center rounded-full border-2"
                style={{ backgroundColor: bg, borderColor: secondary }}
                aria-hidden
              >
                <motion.span
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, margin: '-40% 0px' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: secondary }}
                />
              </span>

              <motion.article
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.8, ease }}
                whileHover={{ y: -4 }}
                className={`flex flex-col gap-5 rounded-3xl border bg-white/80 backdrop-blur-sm shadow-lg shadow-black/5 hover:shadow-xl transition-shadow ${leftSide ? 'col-start-2 sm:col-start-1' : 'col-start-2'
                  }`}
                style={{ borderColor: `${accent}55`, ...CARD_PAD }}
              >
                <div className="flex items-start gap-4">
                  {parts && (
                    <div
                      className="shrink-0 w-16 rounded-2xl flex flex-col items-center gap-1 text-center"
                      style={{ backgroundColor: primary, color: accent, padding: '0.6rem 0' }}
                    >
                      <p className="font-serif text-2xl font-medium leading-none">{parts.day}</p>
                      <p className="text-[0.625rem] uppercase tracking-widest opacity-80">{parts.month}</p>
                    </div>
                  )}
                  <div className="min-w-0 flex flex-col gap-1.5">
                    <h3 className="text-2xl sm:text-[1.65rem] font-medium leading-tight" style={{ color: primary }}>
                      {event.title}
                    </h3>
                    {event.time && (
                      <p className="flex items-center gap-1.5 text-sm opacity-70">
                        <Clock className="w-4 h-4 shrink-0" />
                        {formatTime(event.time)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-sm sm:text-[0.95rem] opacity-80">
                  {event.date && (
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 shrink-0" style={{ color: secondary }} />
                      {formatDate(event.date)}
                    </p>
                  )}
                  {event.venue && (
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 shrink-0" style={{ color: secondary }} />
                      {event.venue}
                    </p>
                  )}
                  {event.address && (
                    <p className="text-xs leading-relaxed opacity-70" style={{ paddingLeft: '1.5rem' }}>
                      {event.address}
                    </p>
                  )}
                </div>

                {event.mapsUrl && (
                  <a
                    href={event.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="self-start inline-flex items-center gap-2 rounded-full border text-xs font-medium transition-colors hover:text-white"
                    style={{ borderColor: secondary, color: secondary, ...PILL_PAD }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = secondary
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    View on Google Maps
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

/* ───────────────────────── Gallery + lightbox ───────────────────────── */

function Gallery({ photos }: { photos: Photo[] }) {
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
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, go])

  const featured = photos.length >= 3
  const slide: Variants = {
    enter: (d: number) => ({ opacity: 0, x: d * 60 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d * -60 }),
  }

  return (
    <>
      <div
        className={`grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 lg:gap-5 ${featured ? 'auto-rows-[9.5rem] sm:auto-rows-[13rem] md:auto-rows-[15rem] lg:auto-rows-[17rem] grid-flow-dense' : ''
          }`}
      >
        {photos.map((photo, i) => (
          <motion.button
            key={photo.id}
            type="button"
            onClick={() => {
              setDir(1)
              setOpen(i)
            }}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: (i % 3) * 0.08, ease }}
            aria-label={`Open photo ${i + 1}`}
            className={`group relative block w-full overflow-hidden rounded-2xl sm:rounded-3xl cursor-zoom-in shadow-md ${featured && i === 0 ? 'col-span-2 row-span-2' : featured ? 'h-full' : 'aspect-square'
              }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt={`Wedding photo ${i + 1}`}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center"
            style={{ padding: 'clamp(1rem, 4vw, 2.5rem)' }}
            onClick={() => setOpen(null)}
          >
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Close"
              className="absolute right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              style={{ top: 'max(1rem, env(safe-area-inset-top))' }}
            >
              <X className="w-5 h-5" />
            </button>

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={(e) => {
                    e.stopPropagation()
                    go(-1)
                  }}
                  className="absolute left-2 sm:left-6 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={(e) => {
                    e.stopPropagation()
                    go(1)
                  }}
                  className="absolute right-2 sm:right-6 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <AnimatePresence mode="wait" custom={dir} initial={false}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <motion.img
                key={open}
                src={photos[open].url}
                alt={`Wedding photo ${open + 1}`}
                custom={dir}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeOut' }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.3}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -80) go(1)
                  else if (info.offset.x > 80) go(-1)
                }}
                onClick={(e) => e.stopPropagation()}
                className="max-h-[85svh] max-w-full rounded-xl object-contain shadow-2xl select-none"
                draggable={false}
              />
            </AnimatePresence>

            <p
              className="absolute left-1/2 -translate-x-1/2 text-xs tracking-widest text-white/70"
              style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
            >
              {open + 1} / {photos.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ───────────────────────── Page ───────────────────────── */

export default function PublishedWeddingPage({ wedding }: { wedding: WeddingData }) {
  const theme = wedding.theme
  const primary = theme.primaryColor || '#92400e'
  const bg = theme.backgroundColor || '#fffbeb'
  const accent = theme.accentColor || '#fcd34d'
  const secondary = theme.secondaryColor || '#b45309'

  const coverPhoto = wedding.gallery?.find((g) => g.isCover) || wedding.gallery?.[0]
  const coupleName = [wedding.groomName, wedding.brideName].filter(Boolean).join(' & ')

  /* Page progress bar */
  const { scrollYProgress: pageProgress } = useScroll()
  const progress = useSpring(pageProgress, { stiffness: 120, damping: 28 })

  /* Hero parallax */
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const photoY = useTransform(heroProgress, [0, 1], ['0%', '18%'])
  const contentY = useTransform(heroProgress, [0, 1], ['0%', '-12%'])
  const contentOpacity = useTransform(heroProgress, [0, 0.7], [1, 0])

  const corners = [
    { pos: 'top-4 left-4 sm:top-8 sm:left-8', b: 'border-t-2 border-l-2 rounded-tl-xl', o: 'top left' },
    { pos: 'top-4 right-4 sm:top-8 sm:right-8', b: 'border-t-2 border-r-2 rounded-tr-xl', o: 'top right' },
    { pos: 'bottom-4 left-4 sm:bottom-8 sm:left-8', b: 'border-b-2 border-l-2 rounded-bl-xl', o: 'bottom left' },
    { pos: 'bottom-4 right-4 sm:bottom-8 sm:right-8', b: 'border-b-2 border-r-2 rounded-br-xl', o: 'bottom right' },
  ]

  const heroPill: React.CSSProperties = {
    color: accent,
    borderColor: `${accent}55`,
    backgroundColor: 'rgba(255,255,255,0.08)',
    ...PILL_PAD,
    padding: '0.55rem 1.1rem',
  }

  return (
    <MotionConfig reducedMotion="user">
      <div
        style={{
          backgroundColor: bg,
          fontFamily: theme.fontFamily === 'inter' ? 'Inter, sans-serif' : '"Cormorant Garamond", serif',
          color: primary,
        }}
        className="min-h-screen w-full overflow-x-hidden"
      >
        {/* Scroll progress */}
        <motion.div
          aria-hidden
          className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left"
          style={{ scaleX: progress, background: `linear-gradient(to right, ${accent}, ${secondary})` }}
        />

        {wedding.music && <MusicPlayer music={wedding.music} accent={accent} primary={primary} />}

        {/* ───────── HERO ───────── */}
        <section
          ref={heroRef}
          className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden"
          style={{
            backgroundColor: primary,
            padding: 'clamp(5rem, 12vh, 7rem) 1.5rem clamp(8rem, 18vh, 10rem)',
          }}
        >
          {coverPhoto && (
            <motion.div className="absolute inset-x-0 -top-[10%] -bottom-[10%]" style={{ y: photoY }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <motion.img
                src={coverPhoto.url}
                alt=""
                className="h-full w-full object-cover"
                initial={{ scale: 1.15 }}
                animate={{ scale: 1.04 }}
                transition={{ duration: 18, ease: 'easeOut' }}
              />
            </motion.div>
          )}
          <div
            className="absolute inset-0"
            style={{
              background: coverPhoto
                ? 'linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.7))'
                : `radial-gradient(ellipse at 50% 35%, ${accent}26, transparent 65%)`,
            }}
          />
          <motion.div
            aria-hidden
            className="absolute left-1/2 top-1/3 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full blur-3xl"
            style={{ backgroundColor: accent, opacity: 0.12 }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          />

          <Particles color={accent} count={14} />

          {corners.map((c, i) => (
            <motion.div
              key={i}
              aria-hidden
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.5 }}
              transition={{ delay: 0.3 + i * 0.12, duration: 0.8, ease }}
              style={{ borderColor: accent, transformOrigin: c.o }}
              className={`absolute ${c.pos} h-10 w-10 sm:h-16 sm:w-16 ${c.b}`}
            />
          ))}

          <motion.div
            style={{ y: contentY, opacity: contentOpacity }}
            className="relative z-10 text-center w-full"
          // keeps the hero content centred and readable on any screen
          >
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="flex flex-col items-center gap-7 sm:gap-9"
              style={{ width: '100%', maxWidth: '64rem', marginInline: 'auto' }}
            >
              <motion.p
                variants={fadeUp}
                className="text-xs sm:text-sm uppercase tracking-[0.4em] opacity-80"
                style={{ color: accent }}
              >
                Together with their families
              </motion.p>

              <h1
                className="font-medium leading-[0.95] tracking-tight text-[clamp(3.25rem,11vw,8rem)]"
                style={{ color: accent, textShadow: coverPhoto ? '0 2px 30px rgba(0,0,0,0.35)' : undefined }}
              >
                <span className="block">
                  <Words text={wedding.groomName || 'Groom'} />
                </span>
                <motion.span
                  variants={fadeScale}
                  className="block italic font-light text-[0.38em]"
                  style={{ paddingBlock: '0.25em' }}
                >
                  &amp;
                </motion.span>
                <span className="block">
                  <Words text={wedding.brideName || 'Bride'} />
                </span>
              </h1>

              <motion.div
                variants={{
                  hidden: { scaleX: 0, opacity: 0 },
                  show: { scaleX: 1, opacity: 0.5, transition: { duration: 0.9, ease } },
                }}
                className="h-px w-24 sm:w-32"
                style={{ backgroundColor: accent }}
              />

              <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-3">
                {wedding.weddingDate && (
                  <span
                    className="inline-flex items-center gap-2 rounded-full border text-sm sm:text-base backdrop-blur-md"
                    style={heroPill}
                  >
                    <Calendar className="w-4 h-4" />
                    {formatDate(wedding.weddingDate)}
                  </span>
                )}
                {wedding.venueName && (
                  <span
                    className="inline-flex items-center gap-2 rounded-full border text-sm sm:text-base backdrop-blur-md"
                    style={heroPill}
                  >
                    <MapPin className="w-4 h-4" />
                    {wedding.venueName}
                  </span>
                )}
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Scroll cue */}
          <motion.div
            style={{ color: accent, opacity: contentOpacity }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 2 }}
            className="absolute bottom-24 sm:bottom-28 z-10 flex flex-col items-center gap-1"
            aria-hidden
          >
            <span className="text-[0.625rem] uppercase tracking-[0.3em]">Scroll</span>
            <motion.span animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
              <ChevronDown className="w-5 h-5" />
            </motion.span>
          </motion.div>
        </section>

        {/* ───────── COUNTDOWN (overlaps hero) ───────── */}
        {wedding.weddingDate && (
          <section
            className="relative z-20"
            style={{
              marginTop: 'calc(-1 * clamp(4.5rem, 9vw, 6.5rem))',
              padding: '0 clamp(1rem, 5vw, 3rem)',
            }}
          >
            <Reveal style={{ width: '100%', maxWidth: '50rem', marginInline: 'auto' }}>
              <div
                className="flex flex-col gap-5 sm:gap-6 rounded-[2rem] border bg-white/90 backdrop-blur-xl shadow-2xl shadow-black/15"
                style={{ borderColor: `${accent}66`, ...CARD_PAD }}
              >
                <p className="text-center text-xs sm:text-sm uppercase tracking-[0.3em] opacity-60">
                  Counting down to the big day
                </p>
                <CountdownTimer weddingDate={wedding.weddingDate} primary={primary} />
              </div>
            </Reveal>
          </section>
        )}

        {/* ───────── OUR STORY ───────── */}
        {wedding.story && (
          <Section max="44rem">
            <div className="text-center">
              <SectionHeading eyebrow="Our Story" title="How We Met" color={secondary} />
              <Reveal delay={0.1} className="relative flex flex-col items-center gap-10">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 select-none font-serif text-[9rem] leading-none opacity-10"
                  style={{ color: secondary }}
                >
                  &ldquo;
                </span>
                <p className="relative text-lg sm:text-xl lg:text-2xl leading-[1.8] italic opacity-80 text-balance">
                  {wedding.story}
                </p>
                {coupleName && <Divider color={primary} />}
              </Reveal>
            </div>
          </Section>
        )}

        {/* ───────── EVENTS ───────── */}
        {wedding.events && wedding.events.length > 0 && (
          <Section max="60rem" bg={`${accent}18`}>
            <SectionHeading eyebrow="Celebrations" title="Wedding Events" color={secondary} />
            <EventsTimeline
              events={wedding.events}
              primary={primary}
              secondary={secondary}
              accent={accent}
              bg={bg}
            />
          </Section>
        )}

        {/* ───────── GALLERY ───────── */}
        {wedding.gallery && wedding.gallery.length > 0 && (
          <Section max="68rem">
            <SectionHeading eyebrow="Moments" title="Our Gallery" color={secondary} />
            <Gallery photos={wedding.gallery} />
          </Section>
        )}

        {/* ───────── VENUE ───────── */}
        {(wedding.venueName || wedding.venueAddress) && (
          <Section max="38rem" bg={`${primary}0d`}>
            <SectionHeading eyebrow="Venue" title="Where We Celebrate" color={secondary} />
            <Reveal>
              <div
                className="flex flex-col items-center gap-5 rounded-[2rem] border bg-white/80 backdrop-blur-sm text-center shadow-xl shadow-black/5"
                style={{ borderColor: `${accent}66`, padding: 'clamp(2rem, 5vw, 3rem)' }}
              >
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: `${accent}55` }}
                    animate={{ scale: [1, 1.7], opacity: [0.6, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
                  />
                  <span
                    className="relative flex h-16 w-16 items-center justify-center rounded-full"
                    style={{ backgroundColor: primary, color: accent }}
                  >
                    <MapPin className="w-7 h-7" />
                  </span>
                </div>
                {wedding.venueName && (
                  <h3
                    className="font-medium leading-tight text-balance text-[clamp(1.75rem,4vw,2.5rem)]"
                    style={{ color: primary }}
                  >
                    {wedding.venueName}
                  </h3>
                )}
                {wedding.venueAddress && (
                  <p className="opacity-70 text-base sm:text-lg leading-relaxed max-w-sm text-balance">
                    {wedding.venueAddress}
                  </p>
                )}
                {wedding.venueMapsUrl && (
                  <motion.a
                    href={wedding.venueMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="mt-1 inline-flex items-center gap-2 rounded-full text-sm sm:text-base font-medium shadow-lg"
                    style={{ backgroundColor: primary, color: accent, ...BTN_PAD }}
                  >
                    <Navigation className="w-4 h-4" />
                    Get Directions
                  </motion.a>
                )}
              </div>
            </Reveal>
          </Section>
        )}

        {/* ───────── RSVP ───────── */}
        <Section max="36rem">
          <SectionHeading
            eyebrow="RSVP"
            title="Will You Join Us?"
            subtitle="We would be honoured by your presence. Please confirm your attendance."
            color={secondary}
          />
          <Reveal delay={0.1}>
            <div
              className="rounded-[2rem] border bg-white/85 backdrop-blur-sm shadow-2xl shadow-black/10"
              style={{ borderColor: `${accent}66`, ...CARD_PAD }}
            >
              <RSVPForm weddingId={wedding.id} primaryColor={primary} accentColor={accent} />
            </div>
          </Reveal>
        </Section>

        {/* ───────── THANK YOU ───────── */}
        <section
          className="relative overflow-hidden text-center"
          style={{ ...SECTION_PAD, backgroundColor: primary }}
        >
          <Particles color={accent} symbol="♥" count={10} />
          <div
            className="relative z-10 flex flex-col items-center gap-6"
            style={{ width: '100%', maxWidth: '32rem', marginInline: 'auto' }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            >
              <motion.span
                className="inline-block"
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Heart className="w-12 h-12" style={{ color: accent, fill: accent, opacity: 0.8 }} />
              </motion.span>
            </motion.div>
            <Reveal delay={0.1}>
              <h2
                className="font-medium tracking-tight text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.1]"
                style={{ color: accent }}
              >
                Thank You
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="opacity-80 text-base sm:text-lg leading-relaxed text-balance" style={{ color: accent }}>
                Your love and blessings mean the world to us. We look forward to celebrating with you.
              </p>
            </Reveal>
            {coupleName && (
              <Reveal delay={0.3}>
                <p className="text-xl sm:text-2xl italic opacity-70" style={{ color: accent }}>
                  — {coupleName}
                </p>
              </Reveal>
            )}
          </div>
        </section>

        {/* Branding */}
        <footer
          className="bg-stone-900 text-center"
          style={{ padding: '1.25rem 1.5rem max(1.25rem, env(safe-area-inset-bottom))' }}
        >
          <p className="text-xs text-stone-500">
            Made with ❤️ by{' '}
            <Link href="/" className="text-amber-400 hover:underline">
              ForeverVows
            </Link>
          </p>
        </footer>
      </div>
    </MotionConfig>
  )
}