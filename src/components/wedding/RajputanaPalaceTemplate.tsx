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
  Crown,
  Sparkles,
} from 'lucide-react'
import { WeddingData } from '@/types/wedding'
import { formatDate, formatTime, getCountdown } from '@/lib/utils'
import RSVPForm from '@/components/rsvp/RSVPForm'
import WeddingMusicPlayer from './WeddingMusicPlayer'

type Photo = NonNullable<WeddingData['gallery']>[number]
type WeddingEvent = NonNullable<WeddingData['events']>[number]

const ease = [0.22, 1, 0.36, 1] as const

const RUBY_CRIMSON = '#881337'
const MARIGOLD = '#f59e0b'
const PALACE_GOLD = '#fbbf24'

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

/* ───────────────────────── Marigold Petal Shower ───────────────────────── */
function MarigoldPetalShower() {
  const reduce = useReducedMotion()
  if (reduce) return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: 22 }).map((_, i) => {
        const size = 10 + (i % 4) * 4
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${(i * 17 + 5) % 96}%`,
              top: '-5vh',
              width: size,
              height: size * 1.2,
              borderRadius: '50% 50% 50% 10%',
              background: i % 2 === 0
                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                : 'linear-gradient(135deg, #fbbf24, #ea580c)',
              boxShadow: '0 0 8px rgba(245, 158, 11, 0.4)',
              opacity: 0.8,
            }}
            animate={{
              y: ['0vh', '110vh'],
              x: [0, (i % 2 === 0 ? 1 : -1) * 35, 0],
              rotate: [0, 240, 480],
            }}
            transition={{
              duration: 9 + (i % 5) * 2,
              delay: (i * 0.4) % 6,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )
      })}
    </div>
  )
}

/* ───────────────────────── Interactive Jharokha Arch Window ───────────────────────── */
function JharokhaWindowReveal({ date, couple, venue }: { date?: string | null; couple: string; venue?: string | null }) {
  const [open, setOpen] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  const downloadCalendar = () => {
    if (!date) return
    const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const cleanDate = date.replace(/-/g, '')
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ForeverVows//Rajputana//EN',
      'BEGIN:VEVENT',
      `UID:rajputana-${Date.now()}@forevervows`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${cleanDate}`,
      `SUMMARY:Royal Wedding of ${couple}`,
      venue ? `LOCATION:${venue}` : '',
      'DESCRIPTION:A grand celebration of royal heritage and eternal companionship.',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'rajputana-royal-wedding.ics'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 3000)
  }

  return (
    <div className="relative mx-auto max-w-lg select-none text-center">
      {/* Ornate Indian Palace Arch */}
      <div className="relative rounded-t-[12rem] rounded-b-3xl border-4 border-[#f59e0b] bg-gradient-to-b from-[#2a0812] via-[#3b0d1a] to-[#1e050c] !p-8 sm:!p-12 shadow-[0_20px_60px_rgba(136,19,55,0.4)] text-amber-100 overflow-hidden">
        {/* Ornate Gold Crown Crest */}
        <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-[#fbbf24] bg-amber-500/10 flex items-center justify-center !mb-5 shadow-[0_0_30px_rgba(251,191,36,0.3)]">
          <Crown className="w-10 h-10 text-amber-300" />
        </div>

        <span className="font-serif italic text-sm tracking-[0.3em] text-amber-300 uppercase !mb-2 block">
          Shubh Vivah // Royal Proclamation
        </span>

        <h3 className="font-serif text-3xl sm:text-4xl text-amber-100 font-normal leading-tight !mb-2">
          {couple}
        </h3>

        {date && (
          <p className="font-serif italic text-xl text-amber-400 !mb-5">
            {formatDate(date)}
          </p>
        )}

        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent mx-auto !mb-6" />

        {/* Jharokha Opening Button */}
        <div className="!my-5 flex flex-col items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(!open)}
            className="cursor-pointer inline-flex items-center gap-2 rounded-full border-2 border-amber-400/80 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-950 font-sans text-xs uppercase tracking-widest font-bold !px-7 !py-3 shadow-lg shadow-amber-500/20"
          >
            <Sparkles className="w-4 h-4 text-stone-950" />
            <span>{open ? 'Close Palace Gates' : 'Open Jharokha Window'}</span>
          </motion.button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: 15 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: 15 }}
              transition={{ duration: 0.5, ease }}
              className="overflow-hidden flex flex-col items-center gap-4 !pt-3"
            >
              {venue && (
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-950/60 !px-4 !py-1.5 text-xs text-amber-200 font-sans">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{venue}</span>
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={downloadCalendar}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-xs font-bold uppercase tracking-wider !px-6 !py-3 rounded-full shadow-md cursor-pointer"
              >
                {downloaded ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-950 stroke-[3]" />
                    <span>Added to Royal Calendar</span>
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

/* ───────────────────────── Royal Palace Countdown ───────────────────────── */
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

function PalaceCountdown({ date }: { date: string }) {
  const currentSecond = useSyncExternalStore(
    subscribeCountdown,
    () => Math.floor(Date.now() / 1000),
    () => null
  )
  const timeLeft = currentSecond !== null ? getCountdown(date) : null

  if (timeLeft?.isPast) {
    return (
      <p className="text-center font-serif text-2xl sm:text-3xl italic text-amber-300">
        The Grand Royal Baraat Has Arrived! 🥁🎺
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
          className="relative flex flex-col items-center gap-2 rounded-t-[3rem] rounded-b-xl border border-amber-500/40 bg-gradient-to-b from-[#3d0d1a] to-[#22060e] !py-6 !px-2 shadow-xl shadow-amber-950/30 text-center"
        >
          <span className="font-serif font-light text-[clamp(1.75rem,5.5vw,3.25rem)] text-amber-200 leading-none tabular-nums flex drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
            {u.val === undefined ? (
              <span>--</span>
            ) : (
              String(u.val)
                .padStart(2, '0')
                .split('')
                .map((ch, ci) => <FlipChar key={ci} char={ch} />)
            )}
          </span>
          <span className="font-mono text-[9px] sm:text-xs uppercase tracking-[0.2em] text-amber-400 font-semibold">
            {u.label}
          </span>
        </motion.div>
      ))}
    </div>
  )
}

/* ───────────────────────── Royal Darbar Timeline ───────────────────────── */
function RajputanaEvents({ events }: { events: WeddingEvent[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 65%'] })
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 25 })

  return (
    <div ref={ref} className="relative">
      <div className="absolute bottom-2 left-5 top-2 w-px -translate-x-1/2 bg-amber-500/30 sm:left-1/2" aria-hidden />
      <motion.div
        className="absolute bottom-2 left-5 top-2 w-0.5 origin-top -translate-x-1/2 rounded-full sm:left-1/2"
        style={{ scaleY, background: 'linear-gradient(to bottom, #fbbf24, #d97706, #991b1b)' }}
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
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-300 bg-amber-500 text-stone-950 shadow-md"
                >
                  <Crown className="h-3.5 w-3.5" />
                </motion.span>
              </span>

              <motion.article
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.9, ease }}
                whileHover={{ y: -4 }}
                className={`flex flex-col gap-5 rounded-3xl border border-amber-500/40 bg-gradient-to-br from-[#2f0914] to-[#1c040b] backdrop-blur-sm shadow-xl shadow-black/40 transition-all ${
                  left ? 'col-start-2 sm:col-start-1' : 'col-start-2'
                }`}
                style={{ padding: 'clamp(1.5rem, 3.5vw, 2.25rem)' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber-400 font-semibold">
                      Utsav {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-medium text-amber-100 leading-tight">
                      {ev.title}
                    </h3>
                  </div>
                  {ev.time && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 font-mono text-[11px] text-amber-300 !px-3 !py-1 shrink-0 font-medium">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {formatTime(ev.time)}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2 font-sans text-sm text-amber-100/70">
                  {ev.date && (
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-amber-400 shrink-0" />
                      {formatDate(ev.date)}
                    </p>
                  )}
                  {ev.venue && (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
                      {ev.venue}
                    </p>
                  )}
                  {ev.address && (
                    <p className="text-xs text-amber-200/50 pl-6 leading-relaxed">{ev.address}</p>
                  )}
                </div>

                {ev.mapsUrl && (
                  <a
                    href={ev.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-500/60 bg-amber-500/10 font-mono text-xs uppercase tracking-wider text-amber-200 transition-colors hover:bg-amber-500 hover:text-stone-950 !px-4 !py-2"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    Royal Direction
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

/* ───────────────────────── Jharokha Photo Gallery ───────────────────────── */
function RajputanaGallery({ photos }: { photos: Photo[] }) {
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
            className="group relative aspect-[3/4] w-full overflow-hidden rounded-t-[5rem] rounded-b-xl border-2 border-amber-500/50 bg-stone-900 shadow-xl cursor-zoom-in"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.url}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end !p-4">
              <span className="font-serif italic text-sm text-amber-300">Royal Portrait #{idx + 1}</span>
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
            className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-950/95 backdrop-blur-md !p-4 sm:!p-10"
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
              className="max-h-[85vh] max-w-full rounded-3xl border-2 border-amber-400/50 object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ───────────────────────── MAIN COMPONENT ───────────────────────── */
export default function RajputanaPalaceTemplate({ wedding }: { wedding: WeddingData }) {
  const groom = wedding.groomName || 'Jagan Prasad'
  const bride = wedding.brideName || 'Anu Singhania'
  const couple = `${groom} & ${bride}`

  const theme = wedding.theme || {
    primaryColor: '#881337',
    secondaryColor: '#f59e0b',
    backgroundColor: '#1c040b',
    accentColor: '#fbbf24',
    fontFamily: 'cormorant',
  }

  const primary = theme.primaryColor || '#881337'
  const accent = theme.accentColor || '#fbbf24'
  const bg = theme.backgroundColor || '#1c040b'
  const coverPhoto = wedding.gallery?.find((g) => g.isCover) || wedding.gallery?.[0]

  const { scrollYProgress: pageProgress } = useScroll()
  const progress = useSpring(pageProgress, { stiffness: 120, damping: 28 })

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="relative min-h-screen w-full overflow-x-hidden font-serif selection:bg-amber-500 selection:text-stone-950 text-white"
        style={{ backgroundColor: bg }}
      >
        {/* Scroll Progress Bar */}
        <motion.div
          aria-hidden
          className="fixed inset-x-0 top-0 z-[55] h-[3px] origin-left"
          style={{ scaleX: progress, background: 'linear-gradient(to right, #fbbf24, #f59e0b, #e11d48)' }}
        />

        <WeddingMusicPlayer music={wedding.music} accent="#fbbf24" primary="#881337" />

        {/* ───────── HERO ───────── */}
        <section className="relative flex min-h-[100svh] flex-col items-center justify-center text-center overflow-hidden !px-5 !py-24 bg-gradient-to-b from-[#2e0712] via-[#1c040b] to-[#120207]">
          <MarigoldPetalShower />

          <div className="relative z-10 flex flex-col items-center gap-7 max-w-4xl mx-auto">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease }}
              className="relative w-20 h-20 rounded-full border-2 border-amber-400 bg-amber-500/10 flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.35)]"
            >
              <Crown className="w-10 h-10 text-amber-300" />
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 backdrop-blur-md !px-5 !py-1.5 text-xs font-mono uppercase tracking-[0.3em] text-amber-300 font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Rajputana Grandeur
            </motion.div>

            <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col items-center gap-3">
              <h1 className="font-serif font-normal text-5xl sm:text-7xl lg:text-8xl tracking-tight text-amber-100 leading-[1.05]">
                <Words text={groom} />
              </h1>
              <motion.span
                variants={fadeUp}
                className="font-serif italic text-3xl sm:text-5xl text-amber-400 font-light !my-1"
              >
                &amp;
              </motion.span>
              <h1 className="font-serif font-normal text-5xl sm:text-7xl lg:text-8xl tracking-tight text-amber-100 leading-[1.05]">
                <Words text={bride} />
              </h1>
            </motion.div>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="max-w-xl font-sans text-sm sm:text-base text-amber-100/75 font-light leading-relaxed text-balance"
            >
              Together with their esteemed families, cordially invite you to celebrate the joyous royal union of two souls.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="flex flex-wrap items-center justify-center gap-3 font-sans text-xs uppercase tracking-widest text-amber-300"
            >
              {wedding.weddingDate && (
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-stone-900/80 backdrop-blur-md !px-5 !py-2.5 shadow-sm">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  {formatDate(wedding.weddingDate)}
                </span>
              )}
              {wedding.venueName && (
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-stone-900/80 backdrop-blur-md !px-5 !py-2.5 shadow-sm">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  {wedding.venueName}
                </span>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 1.8 }}
            className="absolute bottom-6 z-10 flex flex-col items-center gap-1 text-amber-300 font-mono text-[10px] uppercase tracking-[0.25em]"
          >
            <span>Enter the Palace</span>
            <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
              <ChevronDown className="w-4 h-4" />
            </motion.span>
          </motion.div>
        </section>

        {/* ───────── JHAROKHA WINDOW REVEAL ───────── */}
        <Section max="48rem">
          <Reveal>
            <JharokhaWindowReveal date={wedding.weddingDate} couple={couple} venue={wedding.venueName} />
          </Reveal>
        </Section>

        {/* ───────── COUNTDOWN ───────── */}
        {wedding.weddingDate && (
          <Section max="48rem" className="border-y border-amber-500/20 bg-[#160309]">
            <Reveal className="flex flex-col items-center gap-8 text-center">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-amber-400 font-semibold">
                Countdown to the Royal Baraat
              </span>
              <PalaceCountdown date={wedding.weddingDate} />
            </Reveal>
          </Section>
        )}

        {/* ───────── STORY ───────── */}
        {wedding.story && (
          <Section max="58rem">
            <Reveal className="flex flex-col items-center text-center gap-6">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-amber-400 font-semibold">
                A Royal Chronicle
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-amber-100 font-normal">
                How Our Fates Aligned
              </h2>
              <div className="w-20 h-px bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent !my-2" />
              <p className="font-serif text-xl sm:text-2xl text-amber-100/80 italic leading-relaxed max-w-2xl text-balance">
                &ldquo;{wedding.story}&rdquo;
              </p>
              <span className="font-mono text-xs uppercase tracking-widest text-amber-400 font-semibold">— {couple}</span>
            </Reveal>
          </Section>
        )}

        {/* ───────── EVENTS ───────── */}
        {wedding.events && wedding.events.length > 0 && (
          <Section max="60rem" className="bg-gradient-to-b from-[#1c040b] via-[#24060f] to-[#1c040b]">
            <Reveal className="flex flex-col items-center text-center gap-4 !mb-14">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-amber-400 font-semibold">
                Royal Darbar Itinerary
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-amber-100 font-normal">
                Schedule of Festivities
              </h2>
            </Reveal>
            <RajputanaEvents events={wedding.events} />
          </Section>
        )}

        {/* ───────── GALLERY ───────── */}
        {wedding.gallery && wedding.gallery.length > 0 && (
          <Section max="70rem">
            <Reveal className="flex flex-col items-center text-center gap-4 !mb-12">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-amber-400 font-semibold">
                Palace Portraits
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-amber-100 font-normal">
                Glimpses of Grandeur
              </h2>
            </Reveal>
            <RajputanaGallery photos={wedding.gallery} />
          </Section>
        )}

        {/* ───────── RSVP ───────── */}
        <Section max="38rem">
          <Reveal className="flex flex-col items-center text-center gap-4 !mb-10">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-amber-400 font-semibold">
              Presence &amp; Blessings
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-amber-100 font-normal">
              Confirm Your Attendance
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-3xl border-2 border-amber-500/40 bg-gradient-to-b from-[#2b0813] to-[#1a040b] !p-6 sm:!p-10 shadow-2xl">
              <RSVPForm weddingId={wedding.id} primaryColor="#fbbf24" accentColor="#f59e0b" />
            </div>
          </Reveal>
        </Section>

        {/* ───────── FOOTER ───────── */}
        <footer className="border-t border-amber-500/20 bg-[#120207] !py-12 text-center text-amber-200/60 text-xs font-mono">
          <p className="!mb-2">May eternal love and royal grace guide our journey • {couple}</p>
          <p>
            Crafted with prestige on{' '}
            <Link href="/" className="text-amber-400 font-semibold underline underline-offset-4 hover:text-white">
              ForeverVows
            </Link>
          </p>
        </footer>
      </div>
    </MotionConfig>
  )
}
