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
  Sun,
  Sparkles,
} from 'lucide-react'
import { WeddingData } from '@/types/wedding'
import { formatDate, formatTime, getCountdown } from '@/lib/utils'
import RSVPForm from '@/components/rsvp/RSVPForm'
import WeddingMusicPlayer from './WeddingMusicPlayer'

type Photo = NonNullable<WeddingData['gallery']>[number]
type WeddingEvent = NonNullable<WeddingData['events']>[number]

const ease = [0.22, 1, 0.36, 1] as const

const TERRACOTTA = '#9a3412'
const GOLDEN_SAND = '#f59e0b'
const WARM_CREAM = '#fffbeb'

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

/* ───────────────────────── Swaying Pampas Grass Illustration ───────────────────────── */
function SwayingPampas({ flip = false }: { flip?: boolean }) {
  const reduce = useReducedMotion()
  return (
    <div
      className={`pointer-events-none absolute bottom-0 z-10 ${
        flip ? 'right-0 -scale-x-100' : 'left-0'
      } opacity-75`}
      style={{ width: 'clamp(9rem, 24vw, 18rem)' }}
      aria-hidden
    >
      <motion.svg
        viewBox="0 0 200 320"
        className="h-auto w-full overflow-visible"
        animate={
          reduce
            ? undefined
            : {
                rotate: [0, flip ? -2.5 : 2.5, 0],
              }
        }
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: 'bottom center' }}
      >
        {/* Stems */}
        <path d="M40 320 Q60 180 120 40" fill="none" stroke="#d97706" strokeWidth="2.5" />
        <path d="M70 320 Q90 190 160 80" fill="none" stroke="#b45309" strokeWidth="2" />
        <path d="M20 320 Q40 210 80 120" fill="none" stroke="#ea580c" strokeWidth="1.8" />

        {/* Fluffy pampas plumes */}
        {Array.from({ length: 18 }).map((_, i) => (
          <ellipse
            key={i}
            cx={100 + (i % 6) * 10}
            cy={50 + i * 11}
            rx="22"
            ry="6"
            fill={i % 2 === 0 ? '#fde68a' : '#fed7aa'}
            fillOpacity="0.85"
            transform={`rotate(${25 + (i % 5) * 6} ${100 + (i % 6) * 10} ${50 + i * 11})`}
          />
        ))}
      </motion.svg>
    </div>
  )
}

/* ───────────────────────── Floating Golden Dust Motes ───────────────────────── */
function DesertDustMotes() {
  const reduce = useReducedMotion()
  if (reduce) return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: 20 }).map((_, i) => {
        const size = 3 + (i % 4) * 2
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${(i * 31 + 9) % 100}%`,
              bottom: 0,
              width: size,
              height: size,
              backgroundColor: i % 2 === 0 ? '#f59e0b' : '#fdba74',
              boxShadow: '0 0 10px rgba(245, 158, 11, 0.6)',
            }}
            initial={{ y: '0vh', opacity: 0 }}
            animate={{
              y: ['0vh', '-90vh'],
              x: ['0px', `${(i % 2 === 0 ? 1 : -1) * 35}px`, '0px'],
              opacity: [0, 0.75, 0],
            }}
            transition={{
              duration: 9 + (i % 4) * 2,
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

/* ───────────────────────── Interactive Wax-Sealed Save the Date ───────────────────────── */
function WaxSealedEnvelope({ date, couple, venue }: { date?: string | null; couple: string; venue?: string | null }) {
  const [opened, setOpened] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  const downloadCalendar = () => {
    if (!date) return
    const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const cleanDate = date.replace(/-/g, '')
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ForeverVows//Boho//EN',
      'BEGIN:VEVENT',
      `UID:boho-${Date.now()}@forevervows`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${cleanDate}`,
      `SUMMARY:Sunset Celebration of ${couple}`,
      venue ? `LOCATION:${venue}` : '',
      'DESCRIPTION:Celebrating our forever in bohemian sunset warmth.',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sunset-boho-wedding.ics'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 3000)
  }

  return (
    <div className="relative mx-auto max-w-lg select-none text-center">
      {/* Terracotta Arch Container */}
      <div className="relative rounded-t-[10rem] rounded-b-3xl border-2 border-[#d97706]/40 bg-gradient-to-b from-[#faf5ee] via-[#fffdf9] to-[#fcf6ee] !p-8 sm:!p-12 shadow-2xl shadow-amber-950/15 overflow-hidden">
        {/* Sunburst Header */}
        <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center !mb-5">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0"
          >
            <Sun className="w-full h-full text-amber-500/30 stroke-1" />
          </motion.div>
          <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-lg shadow-amber-700/30">
            <Heart className="w-7 h-7 fill-white/90 text-white" />
          </div>
        </div>

        <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.35em] text-[#9a3412] font-semibold !mb-2 block">
          Save Our Sunset
        </span>
        <h3 className="font-serif text-3xl sm:text-4xl text-stone-900 font-normal leading-tight !mb-3">
          {couple}
        </h3>

        {date && (
          <p className="font-serif italic text-xl text-amber-800 !mb-6">
            {formatDate(date)}
          </p>
        )}

        {/* Interactive Wax Seal Button */}
        <div className="!my-6 flex flex-col items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setOpened(!opened)}
            className="relative cursor-pointer group"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#b91c1c] via-[#991b1b] to-[#7f1d1d] shadow-xl shadow-red-950/40 border-2 border-amber-300/40 flex flex-col items-center justify-center text-amber-100">
              <span className="font-serif italic text-lg font-bold leading-none">
                {opened ? 'Open' : 'Seal'}
              </span>
              <span className="text-[9px] uppercase tracking-widest opacity-80 mt-1">
                {opened ? 'Click to Close' : 'Tap to Break'}
              </span>
            </div>
            {!opened && (
              <motion.span
                animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-2 border-red-500"
              />
            )}
          </motion.button>
        </div>

        <AnimatePresence>
          {opened && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: 15 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: 15 }}
              transition={{ duration: 0.5, ease }}
              className="overflow-hidden flex flex-col items-center gap-4 !pt-2"
            >
              {venue && (
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-50 !px-4 !py-1.5 text-xs text-amber-900 font-sans">
                  <MapPin className="w-3.5 h-3.5 text-amber-700" />
                  <span>{venue}</span>
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={downloadCalendar}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#9a3412] to-[#c2410c] text-white text-xs font-semibold uppercase tracking-wider !px-6 !py-3 rounded-full shadow-md shadow-amber-900/25 hover:shadow-lg cursor-pointer"
              >
                {downloaded ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Calendar Updated!</span>
                  </>
                ) : (
                  <>
                    <CalendarPlus className="w-4 h-4" />
                    <span>Download to Calendar</span>
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

/* ───────────────────────── Sun Dial Countdown ───────────────────────── */
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

function SunDialCountdown({ date }: { date: string }) {
  const currentSecond = useSyncExternalStore(
    subscribeCountdown,
    () => Math.floor(Date.now() / 1000),
    () => null
  )
  const timeLeft = currentSecond !== null ? getCountdown(date) : null

  if (timeLeft?.isPast) {
    return (
      <p className="text-center font-serif text-2xl sm:text-3xl italic text-[#9a3412]">
        The Golden Hour has arrived! 🌅
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
          className="relative flex flex-col items-center gap-2 rounded-t-[3rem] rounded-b-2xl border border-amber-300/80 bg-gradient-to-b from-[#fef3c7]/60 to-[#fffbeb] !py-6 !px-2 shadow-md shadow-amber-900/5 text-center"
        >
          <span className="font-serif font-light text-[clamp(1.75rem,5.5vw,3.25rem)] text-stone-900 leading-none tabular-nums flex">
            {u.val === undefined ? (
              <span>--</span>
            ) : (
              String(u.val)
                .padStart(2, '0')
                .split('')
                .map((ch, ci) => <FlipChar key={ci} char={ch} />)
            )}
          </span>
          <span className="font-mono text-[9px] sm:text-xs uppercase tracking-[0.2em] text-[#9a3412] font-semibold">
            {u.label}
          </span>
        </motion.div>
      ))}
    </div>
  )
}

/* ───────────────────────── Boho Arched Timeline ───────────────────────── */
function BohoEvents({ events }: { events: WeddingEvent[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 65%'] })
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 25 })

  return (
    <div ref={ref} className="relative">
      <div className="absolute bottom-2 left-5 top-2 w-px -translate-x-1/2 bg-amber-300 sm:left-1/2" aria-hidden />
      <motion.div
        className="absolute bottom-2 left-5 top-2 w-0.5 origin-top -translate-x-1/2 rounded-full sm:left-1/2"
        style={{ scaleY, background: 'linear-gradient(to bottom, #f59e0b, #9a3412)' }}
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
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-amber-600 bg-amber-100 text-amber-800 shadow-md"
                >
                  <Sun className="h-3.5 w-3.5 text-amber-700" />
                </motion.span>
              </span>

              <motion.article
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.9, ease }}
                whileHover={{ y: -4 }}
                className={`flex flex-col gap-5 rounded-3xl border border-amber-200/90 bg-white/95 backdrop-blur-sm shadow-xl shadow-amber-900/10 transition-all ${
                  left ? 'col-start-2 sm:col-start-1' : 'col-start-2'
                }`}
                style={{ padding: 'clamp(1.5rem, 3.5vw, 2.25rem)' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#9a3412] font-semibold">
                      Ritual {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900 leading-tight">
                      {ev.title}
                    </h3>
                  </div>
                  {ev.time && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-50 font-mono text-[11px] text-amber-900 !px-3 !py-1 shrink-0 font-medium">
                      <Clock className="w-3 h-3 text-amber-700" />
                      {formatTime(ev.time)}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2 font-sans text-sm text-stone-600">
                  {ev.date && (
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[#9a3412] shrink-0" />
                      {formatDate(ev.date)}
                    </p>
                  )}
                  {ev.venue && (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#9a3412] shrink-0" />
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
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-600/40 bg-amber-50 font-mono text-xs uppercase tracking-wider text-amber-900 transition-colors hover:bg-amber-600 hover:text-white !px-4 !py-2"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    View Map
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

/* ───────────────────────── Boho Gallery with Arched Frames ───────────────────────── */
function BohoGallery({ photos }: { photos: Photo[] }) {
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
            className="group relative aspect-[3/4] w-full overflow-hidden rounded-t-[5rem] rounded-b-2xl border-2 border-amber-200/80 bg-amber-100/40 shadow-lg cursor-zoom-in"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.url}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end !p-4">
              <span className="font-serif italic text-sm text-amber-200">Golden Memory {idx + 1}</span>
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
            className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-950/90 backdrop-blur-md !p-4 sm:!p-10"
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
              className="max-h-[85vh] max-w-full rounded-3xl border border-amber-300/40 object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ───────────────────────── MAIN COMPONENT ───────────────────────── */
export default function SunsetBohoTemplate({ wedding }: { wedding: WeddingData }) {
  const groom = wedding.groomName || 'Jagan Prasad'
  const bride = wedding.brideName || 'Anu Mehta'
  const couple = `${groom} & ${bride}`

  const theme = wedding.theme || {
    primaryColor: '#9a3412',
    secondaryColor: '#f59e0b',
    backgroundColor: '#fffbeb',
    accentColor: '#fdba74',
    fontFamily: 'cormorant',
  }

  const primary = theme.primaryColor || '#9a3412'
  const accent = theme.accentColor || '#fdba74'
  const bg = theme.backgroundColor || '#fffbeb'
  const coverPhoto = wedding.gallery?.find((g) => g.isCover) || wedding.gallery?.[0]

  const { scrollYProgress: pageProgress } = useScroll()
  const progress = useSpring(pageProgress, { stiffness: 120, damping: 28 })

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="relative min-h-screen w-full overflow-x-hidden font-serif selection:bg-amber-500 selection:text-white text-stone-900"
        style={{ backgroundColor: bg }}
      >
        {/* Scroll Progress Bar */}
        <motion.div
          aria-hidden
          className="fixed inset-x-0 top-0 z-[55] h-[3px] origin-left"
          style={{ scaleX: progress, background: 'linear-gradient(to right, #ea580c, #f59e0b, #b45309)' }}
        />

        <WeddingMusicPlayer music={wedding.music} accent="#f59e0b" primary="#9a3412" />

        {/* ───────── HERO ───────── */}
        <section className="relative flex min-h-[100svh] flex-col items-center justify-center text-center overflow-hidden !px-5 !py-24 bg-gradient-to-b from-[#fef3c7] via-[#fffbeb] to-[#fdedc9]">
          <DesertDustMotes />
          <SwayingPampas />
          <SwayingPampas flip />

          <div className="relative z-10 flex flex-col items-center gap-7 max-w-4xl mx-auto">
            {/* Boho Sun Motif */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease }}
              className="relative w-20 h-20 flex items-center justify-center"
            >
              <Sun className="w-16 h-16 text-amber-600 animate-spin" style={{ animationDuration: '40s' }} />
              <Heart className="absolute w-6 h-6 text-amber-700 fill-amber-700" />
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="inline-flex items-center gap-2 rounded-full border border-amber-600/30 bg-amber-600/10 backdrop-blur-md !px-5 !py-1.5 text-xs font-mono uppercase tracking-[0.3em] text-[#9a3412] font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Golden Hour Nuptials
            </motion.div>

            <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col items-center gap-3">
              <h1 className="font-serif font-normal text-5xl sm:text-7xl lg:text-8xl tracking-tight text-stone-900 leading-[1.05]">
                <Words text={groom} />
              </h1>
              <motion.span
                variants={fadeUp}
                className="font-serif italic text-3xl sm:text-5xl text-amber-700 font-light !my-1"
              >
                &amp;
              </motion.span>
              <h1 className="font-serif font-normal text-5xl sm:text-7xl lg:text-8xl tracking-tight text-stone-900 leading-[1.05]">
                <Words text={bride} />
              </h1>
            </motion.div>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="max-w-xl font-sans text-sm sm:text-base text-stone-700 font-light leading-relaxed text-balance"
            >
              Warm breezes, golden light, and endless horizons. Come celebrate the vows that will bind our hearts forever.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="flex flex-wrap items-center justify-center gap-3 font-sans text-xs uppercase tracking-widest text-amber-950"
            >
              {wedding.weddingDate && (
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-400 bg-white/80 backdrop-blur-md !px-5 !py-2.5 shadow-sm">
                  <Calendar className="w-4 h-4 text-[#9a3412]" />
                  {formatDate(wedding.weddingDate)}
                </span>
              )}
              {wedding.venueName && (
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-400 bg-white/80 backdrop-blur-md !px-5 !py-2.5 shadow-sm">
                  <MapPin className="w-4 h-4 text-[#9a3412]" />
                  {wedding.venueName}
                </span>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 1.8 }}
            className="absolute bottom-6 z-10 flex flex-col items-center gap-1 text-[#9a3412] font-mono text-[10px] uppercase tracking-[0.25em]"
          >
            <span>Breathe &amp; Scroll</span>
            <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
              <ChevronDown className="w-4 h-4" />
            </motion.span>
          </motion.div>
        </section>

        {/* ───────── WAX SEAL SAVE THE DATE ───────── */}
        <Section max="48rem">
          <Reveal>
            <WaxSealedEnvelope date={wedding.weddingDate} couple={couple} venue={wedding.venueName} />
          </Reveal>
        </Section>

        {/* ───────── COUNTDOWN ───────── */}
        {wedding.weddingDate && (
          <Section max="48rem" className="border-y border-amber-300/40 bg-[#fef9f0]">
            <Reveal className="flex flex-col items-center gap-8 text-center">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#9a3412] font-semibold">
                Until Golden Hour Begins
              </span>
              <SunDialCountdown date={wedding.weddingDate} />
            </Reveal>
          </Section>
        )}

        {/* ───────── STORY ───────── */}
        {wedding.story && (
          <Section max="58rem">
            <Reveal className="flex flex-col items-center text-center gap-6">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#9a3412] font-semibold">
                Our Bohemian Story
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-stone-900 font-normal">
                Under the Desert Sun
              </h2>
              <div className="w-20 h-px bg-gradient-to-r from-transparent via-[#9a3412] to-transparent !my-2" />
              <p className="font-serif text-xl sm:text-2xl text-stone-800 italic leading-relaxed max-w-2xl text-balance">
                &ldquo;{wedding.story}&rdquo;
              </p>
              <span className="font-mono text-xs uppercase tracking-widest text-[#9a3412] font-semibold">— {couple}</span>
            </Reveal>
          </Section>
        )}

        {/* ───────── EVENTS ───────── */}
        {wedding.events && wedding.events.length > 0 && (
          <Section max="60rem" className="bg-gradient-to-b from-[#fffbeb] via-[#fef3c7]/40 to-[#fffbeb]">
            <Reveal className="flex flex-col items-center text-center gap-4 !mb-14">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#9a3412] font-semibold">
                Rituals &amp; Revelry
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-stone-900 font-normal">
                Celebration Schedule
              </h2>
            </Reveal>
            <BohoEvents events={wedding.events} />
          </Section>
        )}

        {/* ───────── GALLERY ───────── */}
        {wedding.gallery && wedding.gallery.length > 0 && (
          <Section max="70rem">
            <Reveal className="flex flex-col items-center text-center gap-4 !mb-12">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#9a3412] font-semibold">
                Arched Keepsakes
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-stone-900 font-normal">
                Our Gallery of Light
              </h2>
            </Reveal>
            <BohoGallery photos={wedding.gallery} />
          </Section>
        )}

        {/* ───────── RSVP ───────── */}
        <Section max="38rem">
          <Reveal className="flex flex-col items-center text-center gap-4 !mb-10">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#9a3412] font-semibold">
              Presence &amp; Blessings
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-stone-900 font-normal">
              Will You Grace Our Day?
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-3xl border-2 border-amber-300/60 bg-white !p-6 sm:!p-10 shadow-2xl shadow-amber-950/10">
              <RSVPForm weddingId={wedding.id} primaryColor="#9a3412" accentColor="#f59e0b" />
            </div>
          </Reveal>
        </Section>

        {/* ───────── FOOTER ───────── */}
        <footer className="border-t border-amber-300/40 bg-[#faf5ee] !py-12 text-center text-stone-600 text-xs font-mono">
          <p className="!mb-2">Wrapped in sunset warmth and heartfelt gratitude • {couple}</p>
          <p>
            Designed with love on{' '}
            <Link href="/" className="text-[#9a3412] font-semibold underline underline-offset-4 hover:text-stone-900">
              ForeverVows
            </Link>
          </p>
        </footer>
      </div>
    </MotionConfig>
  )
}
