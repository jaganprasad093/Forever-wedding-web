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
  Music,
  MapPin,
  Calendar,
  Clock,
  Crown,
  Sparkles,
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

const ease = [0.22, 1, 0.36, 1] as const


const SECTION_PAD: React.CSSProperties = {
  padding: 'clamp(4.5rem, 10vw, 8rem) clamp(1.25rem, 5vw, 3rem)',
}

// Subtle diamond lattice used as a background texture.
const LATTICE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Cpath d='M28 4 52 28 28 52 4 28Z' fill='none' stroke='%23d97706' stroke-opacity='0.09'/%3E%3C/svg%3E\")"

// Gold foil text (vertical gradient) and its shimmering horizontal variant.
const FOIL: React.CSSProperties = {
  backgroundImage: 'linear-gradient(180deg, #fef3c7 0%, #fcd34d 45%, #d97706 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
}
const FOIL_SHIMMER: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(100deg, #b45309 0%, #fde68a 22%, #f59e0b 45%, #fff7d6 55%, #f59e0b 68%, #b45309 100%)',
  backgroundSize: '200% 100%',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
}

function Section({
  children,
  max = '64rem',
  bg,
  lattice = false,
}: {
  children: React.ReactNode
  max?: string
  bg?: string
  lattice?: boolean
}) {
  return (
    <section
      className="relative"
      style={{
        ...SECTION_PAD,
        backgroundColor: bg,
        backgroundImage: lattice ? LATTICE : undefined,
      }}
    >
      <div style={{ width: '100%', maxWidth: max, marginInline: 'auto' }}>{children}</div>
    </section>
  )
}

/* ───────────────────────── Motion helpers ───────────────────────── */

const heroStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 1.1 } },
}
const wordRise: Variants = {
  hidden: { y: '115%' },
  show: { y: '0%', transition: { duration: 1.1, ease } },
}
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
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

// Words rise from behind a mask; each word is gold foil with a slow shimmer.
function FoilWords({ text }: { text: string }) {
  const reduce = useReducedMotion()
  return (
    <>
      {text.split(' ').map((word, i, arr) => (
        <Fragment key={i}>
          <span
            className="inline-block overflow-hidden align-bottom"
            style={{ paddingBlock: '0.14em', marginBlock: '-0.14em', paddingInline: '0.04em' }}
          >
            <motion.span variants={wordRise} className="inline-block">
              <motion.span
                className="inline-block"
                style={FOIL_SHIMMER}
                animate={reduce ? undefined : { backgroundPosition: ['0% 50%', '-200% 50%'] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
              >
                {word}
              </motion.span>
            </motion.span>
          </span>
          {i < arr.length - 1 && ' '}
        </Fragment>
      ))}
    </>
  )
}

/* ───────────────────────── Royal ornaments ───────────────────────── */

function OrnamentDivider({ icon: Icon = Crown }: { icon?: typeof Crown }) {
  return (
    <div
      className="flex items-center justify-center gap-3"
      style={{ width: '100%', maxWidth: '17rem' }}
      aria-hidden
    >
      <motion.span
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease }}
        className="h-px flex-1 origin-right"
        style={{ background: 'linear-gradient(to left, #d97706, transparent)' }}
      />
      <span className="h-1.5 w-1.5 rotate-45 bg-amber-500" />
      <Icon className="h-4 w-4 text-amber-400" />
      <span className="h-1.5 w-1.5 rotate-45 bg-amber-500" />
      <motion.span
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease }}
        className="h-px flex-1 origin-left"
        style={{ background: 'linear-gradient(to right, #d97706, transparent)' }}
      />
    </div>
  )
}

// Filigree corner that draws itself in.
function Corner({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 40 40" className={`absolute h-8 w-8 sm:h-10 sm:w-10 text-amber-400/80 ${className}`} fill="none" aria-hidden>
      <motion.path
        d="M2 38V14C2 7 7 2 14 2H38"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease }}
      />
      <motion.circle
        cx="14"
        cy="14"
        r="2.2"
        fill="currentColor"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.9, type: 'spring', stiffness: 300, damping: 14 }}
        style={{ transformOrigin: '14px 14px' }}
      />
    </svg>
  )
}

function CornerSet({ inset = '0.4rem' }: { inset?: string }) {
  return (
    <div className="pointer-events-none absolute" style={{ inset }} aria-hidden>
      <Corner className="left-0 top-0" />
      <Corner className="right-0 top-0 rotate-90" />
      <Corner className="bottom-0 right-0 rotate-180" />
      <Corner className="bottom-0 left-0 -rotate-90" />
    </div>
  )
}

// Double-bordered royal frame with filigree corners.
function Frame({
  children,
  padding = 'clamp(1.75rem, 5vw, 3.5rem)',
  className = '',
}: {
  children: React.ReactNode
  padding?: string
  className?: string
}) {
  return (
    <div
      className={`relative rounded-3xl ${className}`}
      style={{
        padding,
        background: 'linear-gradient(160deg, rgba(28,25,23,0.92), rgba(12,10,9,0.98))',
        border: '1px solid rgba(217,119,6,0.4)',
        boxShadow: '0 30px 80px -30px rgba(217,119,6,0.25), inset 0 0 60px rgba(217,119,6,0.05)',
      }}
    >
      <div
        className="pointer-events-none absolute rounded-[1.2rem]"
        style={{ inset: '0.5rem', border: '1px solid rgba(251,191,36,0.15)' }}
        aria-hidden
      />
      <CornerSet inset="0.35rem" />
      <div className="relative">{children}</div>
    </div>
  )
}

function RoyalHeading({
  eyebrow,
  title,
  subtitle,
  icon,
}: {
  eyebrow: string
  title: string
  subtitle?: string
  icon?: typeof Crown
}) {
  return (
    <Reveal
      className="flex flex-col items-center gap-4 text-center"
      style={{ marginBottom: 'clamp(2.5rem, 6vw, 4.5rem)' }}
    >
      <p className="font-sans text-[0.7rem] sm:text-xs uppercase tracking-[0.4em] text-amber-400/80">
        {eyebrow}
      </p>
      <h2
        className="font-normal tracking-wide leading-[1.1] text-balance text-[clamp(2rem,5vw,3.5rem)]"
        style={FOIL}
      >
        {title}
      </h2>
      <OrnamentDivider icon={icon} />
      {subtitle && (
        <p className="font-sans text-sm sm:text-base leading-relaxed text-amber-100/60 max-w-md text-balance">
          {subtitle}
        </p>
      )}
    </Reveal>
  )
}

/* ─── Shimmering gold dust ─── */
function GoldDustParticles() {
  const reduce = useReducedMotion()
  if (reduce) return null
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: 20 }).map((_, i) => {
        const size = 3 + (i % 3) * 2
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${(i * 47 + 7) % 100}%`,
              bottom: 0,
              width: size,
              height: size,
              background: 'radial-gradient(circle, #fde047 10%, #d97706 80%, transparent 100%)',
              boxShadow: '0 0 8px rgba(251,191,36,0.8)',
            }}
            initial={{ y: '0vh', opacity: 0 }}
            animate={{
              y: ['0vh', '-90vh'],
              x: ['0px', `${(i % 2 === 0 ? 1 : -1) * 20}px`, '0px'],
              opacity: [0, 0.9, 0],
            }}
            transition={{
              duration: 7 + (i % 4) * 2,
              delay: 1.5 + ((i * 0.5) % 5),
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )
      })}
    </div>
  )
}

/* ─── Opening curtains ─── */
function Curtains() {
  const [done, setDone] = useState(false)
  if (done) return null
  const folds =
    'repeating-linear-gradient(90deg, rgba(0,0,0,0.38) 0 22px, rgba(255,255,255,0.05) 22px 44px)'
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute inset-y-0 left-0 w-1/2"
        style={{
          background: `${folds}, linear-gradient(90deg, #1a0409, #3b0a14 70%, #5a0f1e)`,
          borderRight: '3px solid #d97706',
          boxShadow: '10px 0 40px rgba(0,0,0,0.6)',
        }}
        initial={{ x: '0%' }}
        animate={{ x: '-102%' }}
        transition={{ duration: 1.9, delay: 0.45, ease: [0.76, 0, 0.24, 1] }}
        onAnimationComplete={() => setDone(true)}
      />
      <motion.div
        className="absolute inset-y-0 right-0 w-1/2"
        style={{
          background: `${folds}, linear-gradient(270deg, #1a0409, #3b0a14 70%, #5a0f1e)`,
          borderLeft: '3px solid #d97706',
          boxShadow: '-10px 0 40px rgba(0,0,0,0.6)',
        }}
        initial={{ x: '0%' }}
        animate={{ x: '102%' }}
        transition={{ duration: 1.9, delay: 0.45, ease: [0.76, 0, 0.24, 1] }}
      />
    </div>
  )
}

/* ─── Royal crest with turning ring ─── */
function RoyalCrest() {
  const reduce = useReducedMotion()
  return (
    <div className="relative flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center">
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute inset-0 text-amber-400"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
        aria-hidden
      >
        <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeOpacity="0.5" strokeDasharray="1 4" />
        <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeOpacity="0.3" />
        {Array.from({ length: 12 }).map((_, i) => (
          <path
            key={i}
            d="M50 3 L52.5 8 L50 13 L47.5 8 Z"
            fill="currentColor"
            fillOpacity="0.8"
            transform={`rotate(${i * 30} 50 50)`}
          />
        ))}
      </motion.svg>
      <div
        className="relative flex h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem] items-center justify-center rounded-full"
        style={{
          background: 'radial-gradient(circle at 30% 30%, #292524, #0c0a09)',
          border: '2px solid rgba(251,191,36,0.8)',
          boxShadow: '0 0 40px rgba(217,119,6,0.35), inset 0 0 20px rgba(217,119,6,0.15)',
        }}
      >
        <Crown className="h-7 w-7 sm:h-8 sm:w-8 text-amber-400" />
      </div>
    </div>
  )
}

/* ─── Countdown ─── */
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

function RoyalCountdown({ date }: { date: string }) {
  const currentSecond = useSyncExternalStore(
    subscribeCountdown,
    () => Math.floor(Date.now() / 1000),
    () => null
  )
  const timeLeft = currentSecond !== null ? getCountdown(date) : null

  if (timeLeft?.isPast) {
    return (
      <p className="text-center font-serif text-2xl sm:text-3xl text-amber-300">
        The Royal Festivities Have Commenced ⚜️
      </p>
    )
  }

  const units = [
    { label: 'Days', val: timeLeft?.days },
    { label: 'Hours', val: timeLeft?.hours },
    { label: 'Minutes', val: timeLeft?.minutes },
    { label: 'Seconds', val: timeLeft?.seconds },
  ]

  return (
    <div
      className="grid grid-cols-4 gap-2 sm:gap-5"
      style={{ width: '100%', maxWidth: '40rem', marginInline: 'auto' }}
      role="timer"
      aria-live="off"
    >
      {units.map((u, i) => (
        <motion.div
          key={u.label}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.12, duration: 0.8, ease }}
          className="relative flex flex-col items-center gap-2 text-center"
          style={{
            padding: 'clamp(1.25rem, 4vw, 2.25rem) 0.25rem clamp(0.9rem, 2.5vw, 1.5rem)',
            borderRadius: '999px 999px 1rem 1rem',
            background: 'linear-gradient(180deg, rgba(41,37,36,0.9), rgba(12,10,9,0.98))',
            border: '1px solid rgba(217,119,6,0.55)',
            boxShadow: '0 20px 50px -20px rgba(217,119,6,0.35), inset 0 0 24px rgba(217,119,6,0.08)',
          }}
        >
          <span
            className="font-serif font-medium tabular-nums leading-none text-[clamp(1.5rem,5.5vw,3.25rem)] flex"
            style={FOIL}
          >
            {u.val === undefined ? (
              <span>--</span>
            ) : (
              String(u.val)
                .padStart(2, '0')
                .split('')
                .map((ch, ci) => <FlipChar key={ci} char={ch} />)
            )}
          </span>
          <span className="font-sans text-[0.55rem] sm:text-[0.7rem] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-amber-400/80">
            {u.label}
          </span>
        </motion.div>
      ))}
    </div>
  )
}

/* ─── Music ─── */
function RoyalMusicPlayer({ music }: { music?: MusicItem | null }) {
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
        src={music?.url || 'https://actions.google.com/sounds/v1/ambiences/soft_gentle_piano.ogg'}
        loop
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <motion.button
        type="button"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2.4, type: 'spring', stiffness: 260, damping: 18 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggle}
        aria-label={playing ? 'Pause music' : 'Play music'}
        aria-pressed={playing}
        className="fixed z-50 flex h-12 w-12 sm:h-14 sm:w-14 cursor-pointer items-center justify-center rounded-full text-stone-950"
        style={{
          top: 'max(1rem, env(safe-area-inset-top))',
          right: 'max(1rem, env(safe-area-inset-right))',
          background: 'linear-gradient(135deg, #fbbf24, #d97706 55%, #b45309)',
          border: '1px solid rgba(253,230,138,0.8)',
          boxShadow: '0 10px 30px rgba(217,119,6,0.4)',
        }}
      >
        {playing ? (
          <span className="flex h-4 items-end gap-[3px]" aria-hidden>
            {[0, 1, 2, 3].map((b) => (
              <motion.span
                key={b}
                className="w-[3px] rounded-full bg-stone-950"
                animate={{ height: [4, 16, 7, 14, 4] }}
                transition={{ duration: 1 + b * 0.15, repeat: Infinity, ease: 'easeInOut', delay: b * 0.1 }}
              />
            ))}
          </span>
        ) : (
          <Music className="h-5 w-5" />
        )}
        {playing && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full border-2 border-amber-300"
            animate={{ scale: [1, 1.55], opacity: [0.7, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
      </motion.button>
    </>
  )
}

/* ─── Events ─── */
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

type WeddingEvent = NonNullable<WeddingData['events']>[number]

function RoyalEvents({ events }: { events: WeddingEvent[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 65%'] })
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 25 })

  return (
    <div ref={ref} className="relative">
      <div
        className="absolute left-5 sm:left-1/2 top-2 bottom-2 w-px -translate-x-1/2 bg-amber-500/20"
        aria-hidden
      />
      <motion.div
        className="absolute left-5 sm:left-1/2 top-2 bottom-2 w-0.5 -translate-x-1/2 origin-top rounded-full"
        style={{ scaleY, background: 'linear-gradient(#fde68a, #d97706)' }}
        aria-hidden
      />

      <ul className="flex flex-col gap-8 sm:gap-14 list-none" style={{ padding: 0 }}>
        {events.map((ev, i) => {
          const parts = dateParts(ev.date)
          const left = i % 2 === 0
          return (
            <li
              key={ev.id}
              className="relative grid grid-cols-[2.75rem_1fr] sm:grid-cols-2 gap-x-0 sm:gap-x-[clamp(3rem,8vw,6rem)]"
            >
              {/* Diamond node */}
              <span
                className="absolute left-5 sm:left-1/2 top-10 z-10 -translate-x-1/2"
                aria-hidden
              >
                <motion.span
                  initial={{ scale: 0, rotate: 0 }}
                  whileInView={{ scale: 1, rotate: 45 }}
                  viewport={{ once: true, margin: '-40% 0px' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 14 }}
                  className="block h-3.5 w-3.5 border border-amber-200 bg-amber-500"
                  style={{ boxShadow: '0 0 14px rgba(251,191,36,0.8)' }}
                />
              </span>

              <motion.article
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.9, ease }}
                whileHover={{ y: -4 }}
                className={`relative flex flex-col gap-5 rounded-3xl transition-shadow duration-300 hover:shadow-[0_25px_60px_-20px_rgba(217,119,6,0.45)] ${left ? 'col-start-2 sm:col-start-1' : 'col-start-2'
                  }`}
                style={{
                  padding: 'clamp(1.35rem, 3.5vw, 2rem)',
                  background: 'linear-gradient(160deg, rgba(28,25,23,0.95), rgba(12,10,9,0.98))',
                  border: '1px solid rgba(217,119,6,0.4)',
                }}
              >
                <div className="flex items-start gap-4">
                  {parts && (
                    <div
                      className="flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-full text-center"
                      style={{
                        border: '1px solid rgba(251,191,36,0.7)',
                        background: 'radial-gradient(circle at 30% 30%, rgba(217,119,6,0.25), rgba(12,10,9,0.9))',
                      }}
                    >
                      <span className="font-serif text-2xl leading-none text-amber-200">{parts.day}</span>
                      <span className="font-sans text-[0.6rem] uppercase tracking-widest text-amber-400">
                        {parts.month}
                      </span>
                    </div>
                  )}
                  <div className="flex min-w-0 flex-col gap-2">
                    <h3 className="font-serif text-2xl sm:text-[1.7rem] font-normal leading-tight text-amber-100">
                      {ev.title}
                    </h3>
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 font-sans text-[0.65rem] font-semibold uppercase tracking-widest text-amber-300"
                      style={{ padding: '0.3rem 0.75rem' }}
                    >
                      <Clock className="h-3 w-3 text-amber-400" />
                      {ev.time ? formatTime(ev.time) : 'Celebration'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 font-sans text-sm text-amber-100/70">
                  {ev.date && (
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 shrink-0 text-amber-400" />
                      {formatDate(ev.date)}
                    </p>
                  )}
                  {ev.venue && (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-amber-400" />
                      {ev.venue}
                    </p>
                  )}
                </div>

                {ev.mapsUrl && (
                  <a
                    href={ev.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-fit items-center gap-2 rounded-full font-sans text-xs font-bold uppercase tracking-wider text-stone-950 shadow-lg shadow-amber-500/20 transition-transform hover:scale-105"
                    style={{
                      padding: '0.65rem 1.25rem',
                      background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                    }}
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    Directions
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

/* ─── Gallery with arched portraits + lightbox ─── */
function RoyalGallery({ photos }: { photos: Photo[] }) {
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

  const slide: Variants = {
    enter: (d: number) => ({ opacity: 0, x: d * 60 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d * -60 }),
  }

  return (
    <>
      <div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-7"
        style={{ paddingBottom: 'clamp(0rem, 3vw, 2.5rem)' }}
      >
        {photos.map((p, idx) => (
          <div key={p.id} className={idx % 2 === 1 ? 'lg:translate-y-10' : ''}>
            <motion.button
              type="button"
              onClick={() => {
                setDir(1)
                setOpen(idx)
              }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.9, delay: (idx % 4) * 0.1, ease }}
              whileHover={{ y: -6 }}
              aria-label={`Open portrait ${idx + 1}`}
              className="group relative block w-full cursor-zoom-in overflow-hidden"
              style={{
                padding: '0.4rem',
                borderRadius: '999px 999px 1rem 1rem',
                background: 'linear-gradient(180deg, rgba(41,37,36,0.9), rgba(12,10,9,0.98))',
                border: '1px solid rgba(217,119,6,0.5)',
                boxShadow: '0 25px 50px -25px rgba(217,119,6,0.4)',
              }}
            >
              <span
                className="relative block aspect-[3/4] w-full overflow-hidden bg-stone-950"
                style={{ borderRadius: '999px 999px 0.75rem 0.75rem' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                {/* gold sheen sweep */}
                <span
                  className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:translate-x-[400%] transition-all duration-[1100ms]"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(253,230,138,0.35), transparent)' }}
                />
              </span>
            </motion.button>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Portrait viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-950/95 backdrop-blur-md"
            style={{ padding: 'clamp(1rem, 4vw, 2.5rem)' }}
          >
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Close"
              className="absolute right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-amber-300 transition-colors hover:bg-white/20 hover:text-white"
              style={{ top: 'max(1rem, env(safe-area-inset-top))' }}
            >
              <X className="h-5 w-5" />
            </button>

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous portrait"
                  onClick={(e) => {
                    e.stopPropagation()
                    go(-1)
                  }}
                  className="absolute left-2 sm:left-6 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-amber-300 transition-colors hover:bg-white/20"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  aria-label="Next portrait"
                  onClick={(e) => {
                    e.stopPropagation()
                    go(1)
                  }}
                  className="absolute right-2 sm:right-6 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-amber-300 transition-colors hover:bg-white/20"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <AnimatePresence mode="wait" custom={dir} initial={false}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <motion.img
                key={open}
                src={photos[open].url}
                alt=""
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
                className="max-h-[85svh] max-w-full select-none rounded-2xl border-2 border-amber-500/50 object-contain shadow-2xl"
                draggable={false}
              />
            </AnimatePresence>

            <p
              className="absolute left-1/2 -translate-x-1/2 font-sans text-xs tracking-[0.3em] text-amber-300/70"
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

/* ──────────────────────────────────────────────────────────
   MAIN COMPONENT: RoyalGoldTemplate
   Obsidian luxury, gold filigree, burgundy curtains
   ────────────────────────────────────────────────────────── */
export default function RoyalGoldTemplate({ wedding }: { wedding: WeddingData }) {
  const groom = wedding.groomName || 'Jagan Singhania'
  const bride = wedding.brideName || 'Anu Sharma'
  const couple = `${groom} & ${bride}`

  const coverPhoto = wedding.gallery?.find((g) => g.isCover) || wedding.gallery?.[0]

  /* Page progress bar */
  const { scrollYProgress: pageProgress } = useScroll()
  const progress = useSpring(pageProgress, { stiffness: 120, damping: 28 })

  /* Hero parallax */
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const photoY = useTransform(heroProgress, [0, 1], ['0%', '16%'])
  const contentY = useTransform(heroProgress, [0, 1], ['0%', '-10%'])
  const contentOpacity = useTransform(heroProgress, [0, 0.7], [1, 0])

  const heroPill: React.CSSProperties = {
    padding: '0.6rem 1.15rem',
    border: '1px solid rgba(217,119,6,0.45)',
    background: 'rgba(12,10,9,0.65)',
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen w-full overflow-x-hidden bg-[#0a0a0a] font-serif text-[#fef3c7] selection:bg-amber-500 selection:text-stone-950">
        {/* Scroll progress */}
        <motion.div
          aria-hidden
          className="fixed inset-x-0 top-0 z-[55] h-[3px] origin-left"
          style={{ scaleX: progress, background: 'linear-gradient(to right, #b45309, #fde68a, #d97706)' }}
        />

        <RoyalMusicPlayer music={wedding.music} />

        {/* ───────── HERO ───────── */}
        <section
          ref={heroRef}
          className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden text-center"
          style={{ padding: 'clamp(5rem, 12vh, 7rem) 1.5rem clamp(5rem, 12vh, 7rem)' }}
        >
          {/* Background */}
          <div className="absolute inset-0 z-0">
            {coverPhoto && (
              <motion.div className="absolute inset-x-0 -top-[8%] -bottom-[8%]" style={{ y: photoY }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <motion.img
                  src={coverPhoto.url}
                  alt=""
                  className="h-full w-full object-cover opacity-35"
                  initial={{ scale: 1.18 }}
                  animate={{ scale: 1.04 }}
                  transition={{ duration: 20, ease: 'easeOut' }}
                />
              </motion.div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-stone-950/85 via-stone-950/70 to-stone-950" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 40%, rgba(217,119,6,0.18), transparent 60%), radial-gradient(ellipse at 50% 110%, rgba(90,15,30,0.55), transparent 60%)',
              }}
            />
            <div className="absolute inset-0 opacity-70" style={{ backgroundImage: LATTICE }} />
          </div>

          <GoldDustParticles />

          {/* Inner double frame */}
          <div
            className="pointer-events-none absolute z-10 rounded-[1.5rem]"
            style={{ inset: 'clamp(0.6rem, 2vw, 1.5rem)', border: '1px solid rgba(217,119,6,0.3)' }}
            aria-hidden
          />
          <div className="pointer-events-none absolute z-10" style={{ inset: 'clamp(0.6rem, 2vw, 1.5rem)' }} aria-hidden>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 1 }}>
              <Corner className="left-0 top-0" />
              <Corner className="right-0 top-0 rotate-90" />
              <Corner className="bottom-0 right-0 rotate-180" />
              <Corner className="bottom-0 left-0 -rotate-90" />
            </motion.div>
          </div>

          <Curtains />

          <motion.div
            style={{ y: contentY, opacity: contentOpacity }}
            className="relative z-20 flex w-full flex-col items-center"
          >
            <motion.div
              variants={heroStagger}
              initial="hidden"
              animate="show"
              className="flex flex-col items-center gap-6 sm:gap-8"
              style={{ width: '100%', maxWidth: '60rem', marginInline: 'auto' }}
            >
              <motion.div variants={fadeUp} className="flex flex-col items-center gap-4">
                <RoyalCrest />
                <p className="font-sans text-[0.65rem] sm:text-xs font-semibold uppercase tracking-[0.4em] text-amber-300">
                  Royal Wedding Proclamation
                </p>
              </motion.div>

              <h1 className="flex flex-col items-center font-normal tracking-wide leading-[1.02] text-[clamp(3rem,10.5vw,7.5rem)]">
                <span className="block">
                  <FoilWords text={groom} />
                </span>
                <motion.span
                  variants={fadeUp}
                  className="flex items-center justify-center gap-4 text-amber-400"
                  style={{ paddingBlock: '0.15em' }}
                  aria-label="and"
                >
                  <span className="h-px w-12 sm:w-24 bg-gradient-to-r from-transparent to-amber-400" />
                  <span className="font-serif italic text-[0.4em]">&amp;</span>
                  <span className="h-px w-12 sm:w-24 bg-gradient-to-l from-transparent to-amber-400" />
                </motion.span>
                <span className="block">
                  <FoilWords text={bride} />
                </span>
              </h1>

              <motion.div
                variants={fadeUp}
                className="flex flex-wrap items-center justify-center gap-3 font-sans text-xs sm:text-sm uppercase tracking-widest text-amber-200/90"
              >
                {wedding.weddingDate && (
                  <span className="inline-flex items-center gap-2 rounded-full backdrop-blur-md" style={heroPill}>
                    <Calendar className="h-3.5 w-3.5 text-amber-400" />
                    {formatDate(wedding.weddingDate)}
                  </span>
                )}
                {wedding.venueName && (
                  <span className="inline-flex items-center gap-2 rounded-full backdrop-blur-md" style={heroPill}>
                    <MapPin className="h-3.5 w-3.5 text-amber-400" />
                    {wedding.venueName}
                  </span>
                )}
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Scroll cue */}
          <motion.div
            style={{ opacity: contentOpacity }}
            className="absolute bottom-6 sm:bottom-9 z-20 flex flex-col items-center gap-1 text-amber-400/80"
            aria-hidden
          >
            <span className="font-sans text-[0.6rem] uppercase tracking-[0.3em]">Scroll</span>
            <motion.span
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown className="h-4 w-4" />
            </motion.span>
          </motion.div>
        </section>

        {/* ───────── COUNTDOWN ───────── */}
        {wedding.weddingDate && (
          <Section max="52rem" bg="#0c0a09" lattice>
            <RoyalHeading
              eyebrow="Save the Date"
              title="Countdown to the Royal Union"
              icon={Sparkles}
            />
            <RoyalCountdown date={wedding.weddingDate} />
          </Section>
        )}

        {/* ───────── STORY ───────── */}
        {wedding.story && (
          <Section max="52rem">
            <RoyalHeading eyebrow="Our Story" title="The Royal Chronicle" />
            <Reveal delay={0.1}>
              <Frame>
                <div className="flex flex-col items-center gap-8 text-center">
                  <span
                    aria-hidden
                    className="select-none font-serif text-[5rem] leading-[0.6] text-amber-500/40"
                  >
                    &ldquo;
                  </span>
                  <p className="font-serif text-lg sm:text-xl lg:text-2xl italic leading-[1.8] text-amber-100/90 text-balance">
                    {wedding.story}
                  </p>
                  <p className="font-sans text-[0.65rem] sm:text-xs uppercase tracking-[0.3em] text-amber-400">
                    — The Houses of {groom.split(' ')[0]} &amp; {bride.split(' ')[0]} —
                  </p>
                </div>
              </Frame>
            </Reveal>
          </Section>
        )}

        {/* ───────── EVENTS ───────── */}
        {wedding.events && wedding.events.length > 0 && (
          <Section max="60rem" bg="#0c0a09" lattice>
            <RoyalHeading
              eyebrow="Imperial Program"
              title="Order of Ceremonies"
              subtitle="A day of rituals, feasting and celebration."
              icon={Sparkles}
            />
            <RoyalEvents events={wedding.events} />
          </Section>
        )}

        {/* ───────── GALLERY ───────── */}
        {wedding.gallery && wedding.gallery.length > 0 && (
          <Section max="70rem">
            <RoyalHeading eyebrow="Moments" title="Imperial Portraits" />
            <RoyalGallery photos={wedding.gallery} />
          </Section>
        )}

        {/* ───────── VENUE ───────── */}
        {(wedding.venueName || wedding.venueAddress) && (
          <Section max="40rem" bg="#0c0a09" lattice>
            <RoyalHeading eyebrow="The Venue" title="Where We Gather" />
            <Reveal>
              <Frame>
                <div className="flex flex-col items-center gap-5 text-center">
                  <div className="relative flex h-16 w-16 items-center justify-center">
                    <motion.span
                      aria-hidden
                      className="absolute inset-0 rounded-full bg-amber-400/30"
                      animate={{ scale: [1, 1.7], opacity: [0.6, 0] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
                    />
                    <span
                      className="relative flex h-16 w-16 items-center justify-center rounded-full text-stone-950"
                      style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}
                    >
                      <MapPin className="h-7 w-7" />
                    </span>
                  </div>
                  {wedding.venueName && (
                    <h3
                      className="font-normal leading-tight text-balance text-[clamp(1.75rem,4vw,2.5rem)]"
                      style={FOIL}
                    >
                      {wedding.venueName}
                    </h3>
                  )}
                  {wedding.venueAddress && (
                    <p className="max-w-sm font-sans text-sm sm:text-base leading-relaxed text-amber-100/70 text-balance">
                      {wedding.venueAddress}
                    </p>
                  )}
                  {wedding.venueMapsUrl && (
                    <motion.a
                      href={wedding.venueMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.96 }}
                      className="inline-flex items-center gap-2 rounded-full font-sans text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-950 shadow-lg shadow-amber-500/25"
                      style={{
                        padding: '0.85rem 1.75rem',
                        background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                      }}
                    >
                      <Navigation className="h-4 w-4" />
                      Get Directions
                    </motion.a>
                  )}
                </div>
              </Frame>
            </Reveal>
          </Section>
        )}

        {/* ───────── RSVP ───────── */}
        <Section max="38rem">
          <RoyalHeading
            eyebrow="RSVP"
            title="Request the Pleasure of Your Company"
            subtitle="Kindly confirm your attendance so we may welcome you in royal style."
          />
          <Reveal delay={0.1}>
            <Frame padding="clamp(1.5rem, 4vw, 2.5rem)">
              <RSVPForm weddingId={wedding.id} primaryColor="#d97706" accentColor="#fbbf24" />
            </Frame>
          </Reveal>
        </Section>

        {/* ───────── FOOTER ───────── */}
        <footer
          className="flex flex-col items-center gap-5 border-t border-amber-500/20 bg-stone-950 text-center"
          style={{ padding: 'clamp(3rem, 7vw, 5rem) 1.5rem max(1.5rem, env(safe-area-inset-bottom))' }}
        >
          <OrnamentDivider />
          <p
            className="font-normal tracking-wide text-[clamp(1.5rem,4vw,2.25rem)] text-balance"
            style={FOIL}
          >
            {couple}
          </p>
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-amber-400/80">
            Forever in Splendour
          </p>
          <p className="font-sans text-[0.7rem] text-stone-500">
            Crafted with{' '}
            <Link href="/" className="text-amber-400 hover:underline">
              ForeverVows
            </Link>
          </p>
        </footer>
      </div>
    </MotionConfig>
  )
}