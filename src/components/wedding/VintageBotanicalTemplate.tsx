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
  Feather,
  Sparkles,
} from 'lucide-react'
import { WeddingData } from '@/types/wedding'
import { formatDate, formatTime, getCountdown } from '@/lib/utils'
import RSVPForm from '@/components/rsvp/RSVPForm'
import WeddingMusicPlayer from './WeddingMusicPlayer'

type Photo = NonNullable<WeddingData['gallery']>[number]
type WeddingEvent = NonNullable<WeddingData['events']>[number]

const ease = [0.22, 1, 0.36, 1] as const

const SAGE = '#3f6212'
const FOREST = '#14532d'
const PARCHMENT = '#faf7ee'

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

/* ───────────────────────── Botanical Leaves Wreath ───────────────────────── */
function BotanicalWreath() {
  return (
    <div className="relative mx-auto w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center" aria-hidden>
      <motion.svg
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
      >
        <circle cx="100" cy="100" r="88" fill="none" stroke="#4d7c0f" strokeWidth="1.2" strokeDasharray="3 4" strokeOpacity="0.6" />
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i / 16) * Math.PI * 2
          const x = 100 + Math.cos(a) * 88
          const y = 100 + Math.sin(a) * 88
          return (
            <ellipse
              key={i}
              cx={x}
              cy={y}
              rx="9"
              ry="4"
              fill={i % 2 === 0 ? '#65a30d' : '#84cc16'}
              fillOpacity="0.8"
              transform={`rotate(${(i * 360) / 16 + 45} ${x} ${y})`}
            />
          )
        })}
      </motion.svg>
      <div className="relative z-10 w-24 h-24 rounded-full border border-lime-800/30 bg-emerald-950/5 flex flex-col items-center justify-center text-center">
        <Feather className="w-6 h-6 text-emerald-800 !mb-1" />
        <span className="font-serif italic text-xs text-emerald-900 tracking-wider">Botanica</span>
      </div>
    </div>
  )
}

/* ───────────────────────── Floating Eucalyptus Leaves ───────────────────────── */
function FloatingLeaves() {
  const reduce = useReducedMotion()
  if (reduce) return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: 14 }).map((_, i) => {
        const size = 12 + (i % 3) * 6
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${(i * 29 + 11) % 96}%`,
              top: '-5vh',
              width: size,
              height: size * 1.6,
              borderRadius: '60% 0 60% 0',
              backgroundColor: i % 2 === 0 ? '#4d7c0f' : '#65a30d',
              opacity: 0.35,
            }}
            animate={{
              y: ['0vh', '110vh'],
              x: [0, (i % 2 === 0 ? 1 : -1) * 30, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 12 + (i % 4) * 3,
              delay: (i * 0.7) % 7,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )
      })}
    </div>
  )
}

/* ───────────────────────── Folded Herbarium Letter Reveal ───────────────────────── */
function HerbariumKeepsake({ date, couple, venue }: { date?: string | null; couple: string; venue?: string | null }) {
  const [downloaded, setDownloaded] = useState(false)

  const downloadCalendar = () => {
    if (!date) return
    const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const cleanDate = date.replace(/-/g, '')
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ForeverVows//Botanical//EN',
      'BEGIN:VEVENT',
      `UID:botanical-${Date.now()}@forevervows`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${cleanDate}`,
      `SUMMARY:Botanical Wedding of ${couple}`,
      venue ? `LOCATION:${venue}` : '',
      'DESCRIPTION:Surrounded by lush flora, eternal vows are spoken.',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'vintage-botanical-wedding.ics'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 3000)
  }

  return (
    <div className="relative mx-auto max-w-xl text-center">
      {/* Antique Herbarium Folder */}
      <div className="relative rounded-3xl border-2 border-[#15803d]/30 bg-gradient-to-br from-[#faf8f2] via-[#f7f5ed] to-[#ede8d8] !p-8 sm:!p-12 shadow-2xl shadow-emerald-950/10 overflow-hidden">
        {/* Specimen Stamp */}
        <div className="inline-flex items-center gap-2 border border-emerald-800/40 bg-emerald-900/5 !px-3.5 !py-1 text-[10px] font-mono uppercase tracking-[0.25em] text-emerald-900 !mb-4 rounded-sm">
          <span>Herbarium Specimen No. 1226</span>
        </div>

        <h3 className="font-serif italic text-3xl sm:text-4xl text-emerald-950 font-normal leading-tight !mb-2">
          {couple}
        </h3>

        {date && (
          <p className="font-serif text-lg text-emerald-800 tracking-wider !mb-5">
            {formatDate(date)}
          </p>
        )}

        <div className="w-16 h-px bg-emerald-700/30 mx-auto !mb-6" />

        <p className="font-serif italic text-base text-stone-700 max-w-md mx-auto leading-relaxed !mb-7 text-balance">
          &ldquo;Like the ivy that clings to ancient stone, true love deepens through seasons and sunlight.&rdquo;
        </p>

        {venue && (
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-700/30 bg-white/70 !px-4 !py-1.5 text-xs text-emerald-900 font-sans !mb-6">
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            <span>{venue}</span>
          </div>
        )}

        <div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={downloadCalendar}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-800 to-green-900 text-white text-xs font-semibold uppercase tracking-wider !px-7 !py-3.5 rounded-full shadow-lg shadow-emerald-950/20 hover:shadow-xl cursor-pointer"
          >
            {downloaded ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Marked on Your Calendar</span>
              </>
            ) : (
              <>
                <CalendarPlus className="w-4 h-4" />
                <span>Add to Calendar</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────── Vintage Pocket Watch Countdown ───────────────────────── */
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

function BotanicalCountdown({ date }: { date: string }) {
  const currentSecond = useSyncExternalStore(
    subscribeCountdown,
    () => Math.floor(Date.now() / 1000),
    () => null
  )
  const timeLeft = currentSecond !== null ? getCountdown(date) : null

  if (timeLeft?.isPast) {
    return (
      <p className="text-center font-serif text-2xl sm:text-3xl italic text-emerald-900">
        The garden celebration has begun! 🌿
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
          className="relative flex flex-col items-center gap-2 rounded-2xl border border-emerald-800/25 bg-white/80 backdrop-blur-sm !py-6 !px-2 shadow-sm text-center"
        >
          <span className="font-serif font-light text-[clamp(1.75rem,5.5vw,3.25rem)] text-emerald-950 leading-none tabular-nums flex">
            {u.val === undefined ? (
              <span>--</span>
            ) : (
              String(u.val)
                .padStart(2, '0')
                .split('')
                .map((ch, ci) => <FlipChar key={ci} char={ch} />)
            )}
          </span>
          <span className="font-mono text-[9px] sm:text-xs uppercase tracking-[0.2em] text-emerald-800 font-semibold">
            {u.label}
          </span>
        </motion.div>
      ))}
    </div>
  )
}

/* ───────────────────────── Botanical Vine Timeline ───────────────────────── */
function BotanicalEvents({ events }: { events: WeddingEvent[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 65%'] })
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 25 })

  return (
    <div ref={ref} className="relative">
      <div className="absolute bottom-2 left-5 top-2 w-px -translate-x-1/2 bg-emerald-800/20 sm:left-1/2" aria-hidden />
      <motion.div
        className="absolute bottom-2 left-5 top-2 w-0.5 origin-top -translate-x-1/2 rounded-full sm:left-1/2"
        style={{ scaleY, background: 'linear-gradient(to bottom, #84cc16, #15803d)' }}
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
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-700 bg-white text-emerald-800 shadow-md"
                >
                  <span className="text-xs">🌿</span>
                </motion.span>
              </span>

              <motion.article
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.9, ease }}
                whileHover={{ y: -4 }}
                className={`flex flex-col gap-5 rounded-3xl border border-emerald-700/25 bg-white/90 backdrop-blur-sm shadow-xl shadow-emerald-950/5 transition-all ${
                  left ? 'col-start-2 sm:col-start-1' : 'col-start-2'
                }`}
                style={{ padding: 'clamp(1.5rem, 3.5vw, 2.25rem)' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-800 font-semibold">
                      Chapter {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-medium text-emerald-950 leading-tight">
                      {ev.title}
                    </h3>
                  </div>
                  {ev.time && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-700/30 bg-emerald-50 font-mono text-[11px] text-emerald-800 !px-3 !py-1 shrink-0 font-medium">
                      <Clock className="w-3 h-3 text-emerald-700" />
                      {formatTime(ev.time)}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2 font-sans text-sm text-stone-600">
                  {ev.date && (
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-emerald-700 shrink-0" />
                      {formatDate(ev.date)}
                    </p>
                  )}
                  {ev.venue && (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-emerald-700 shrink-0" />
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
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-700/40 bg-emerald-50 font-mono text-xs uppercase tracking-wider text-emerald-900 transition-colors hover:bg-emerald-800 hover:text-white !px-4 !py-2"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    Garden Directions
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

/* ───────────────────────── Botanical Photo Gallery ───────────────────────── */
function BotanicalGallery({ photos }: { photos: Photo[] }) {
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
            className="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl border-2 border-emerald-800/20 bg-stone-100 shadow-md cursor-zoom-in"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.url}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end !p-4">
              <span className="font-serif italic text-sm text-lime-200">Plate {idx + 1} — Herbarium</span>
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
              className="max-h-[85vh] max-w-full rounded-2xl border border-emerald-600/40 object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ───────────────────────── MAIN COMPONENT ───────────────────────── */
export default function VintageBotanicalTemplate({ wedding }: { wedding: WeddingData }) {
  const groom = wedding.groomName || 'Jagan Prasad'
  const bride = wedding.brideName || 'Anu Nair'
  const couple = `${groom} & ${bride}`

  const theme = wedding.theme || {
    primaryColor: '#14532d',
    secondaryColor: '#3f6212',
    backgroundColor: '#faf7ee',
    accentColor: '#84cc16',
    fontFamily: 'cormorant',
  }

  const primary = theme.primaryColor || '#14532d'
  const accent = theme.accentColor || '#84cc16'
  const bg = theme.backgroundColor || '#faf7ee'
  const coverPhoto = wedding.gallery?.find((g) => g.isCover) || wedding.gallery?.[0]

  const { scrollYProgress: pageProgress } = useScroll()
  const progress = useSpring(pageProgress, { stiffness: 120, damping: 28 })

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="relative min-h-screen w-full overflow-x-hidden font-serif selection:bg-emerald-700 selection:text-white text-stone-900"
        style={{ backgroundColor: bg }}
      >
        {/* Scroll Progress Bar */}
        <motion.div
          aria-hidden
          className="fixed inset-x-0 top-0 z-[55] h-[3px] origin-left"
          style={{ scaleX: progress, background: 'linear-gradient(to right, #84cc16, #15803d, #14532d)' }}
        />

        <WeddingMusicPlayer music={wedding.music} accent="#84cc16" primary="#14532d" />

        {/* ───────── HERO ───────── */}
        <section className="relative flex min-h-[100svh] flex-col items-center justify-center text-center overflow-hidden !px-5 !py-24 bg-gradient-to-b from-[#f7f5ed] via-[#faf7ee] to-[#ede8d8]/50">
          <FloatingLeaves />

          <div className="relative z-10 flex flex-col items-center gap-7 max-w-4xl mx-auto">
            <BotanicalWreath />

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-800/30 bg-emerald-800/10 backdrop-blur-md !px-5 !py-1.5 text-xs font-mono uppercase tracking-[0.3em] text-emerald-900 font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              An Enchanted Union
            </motion.div>

            <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col items-center gap-3">
              <h1 className="font-serif font-normal text-5xl sm:text-7xl lg:text-8xl tracking-tight text-emerald-950 leading-[1.05]">
                <Words text={groom} />
              </h1>
              <motion.span
                variants={fadeUp}
                className="font-serif italic text-3xl sm:text-5xl text-emerald-800 font-light !my-1"
              >
                &amp;
              </motion.span>
              <h1 className="font-serif font-normal text-5xl sm:text-7xl lg:text-8xl tracking-tight text-emerald-950 leading-[1.05]">
                <Words text={bride} />
              </h1>
            </motion.div>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="max-w-xl font-sans text-sm sm:text-base text-stone-700 font-light leading-relaxed text-balance"
            >
              Together with their families, invite you to share in the joy and blessings of their wedding celebration.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="flex flex-wrap items-center justify-center gap-3 font-sans text-xs uppercase tracking-widest text-emerald-950"
            >
              {wedding.weddingDate && (
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-700/40 bg-white/80 backdrop-blur-md !px-5 !py-2.5 shadow-sm">
                  <Calendar className="w-4 h-4 text-emerald-800" />
                  {formatDate(wedding.weddingDate)}
                </span>
              )}
              {wedding.venueName && (
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-700/40 bg-white/80 backdrop-blur-md !px-5 !py-2.5 shadow-sm">
                  <MapPin className="w-4 h-4 text-emerald-800" />
                  {wedding.venueName}
                </span>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 1.8 }}
            className="absolute bottom-6 z-10 flex flex-col items-center gap-1 text-emerald-800 font-mono text-[10px] uppercase tracking-[0.25em]"
          >
            <span>Scroll Down</span>
            <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
              <ChevronDown className="w-4 h-4" />
            </motion.span>
          </motion.div>
        </section>

        {/* ───────── HERBARIUM KEEPSAKE ───────── */}
        <Section max="48rem">
          <Reveal>
            <HerbariumKeepsake date={wedding.weddingDate} couple={couple} venue={wedding.venueName} />
          </Reveal>
        </Section>

        {/* ───────── COUNTDOWN ───────── */}
        {wedding.weddingDate && (
          <Section max="48rem" className="border-y border-emerald-800/15 bg-[#f6f3e8]">
            <Reveal className="flex flex-col items-center gap-8 text-center">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-900 font-semibold">
                Until Our Vows Bloom
              </span>
              <BotanicalCountdown date={wedding.weddingDate} />
            </Reveal>
          </Section>
        )}

        {/* ───────── STORY ───────── */}
        {wedding.story && (
          <Section max="58rem">
            <Reveal className="flex flex-col items-center text-center gap-6">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-800 font-semibold">
                Roots &amp; Petals
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-emerald-950 font-normal">
                How Our Love Blossomed
              </h2>
              <div className="w-20 h-px bg-gradient-to-r from-transparent via-emerald-800 to-transparent !my-2" />
              <p className="font-serif text-xl sm:text-2xl text-stone-800 italic leading-relaxed max-w-2xl text-balance">
                &ldquo;{wedding.story}&rdquo;
              </p>
              <span className="font-mono text-xs uppercase tracking-widest text-emerald-800 font-semibold">— {couple}</span>
            </Reveal>
          </Section>
        )}

        {/* ───────── EVENTS ───────── */}
        {wedding.events && wedding.events.length > 0 && (
          <Section max="60rem" className="bg-gradient-to-b from-[#faf7ee] via-[#f7f5ed] to-[#faf7ee]">
            <Reveal className="flex flex-col items-center text-center gap-4 !mb-14">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-800 font-semibold">
                Order of Solemnization
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-emerald-950 font-normal">
                Celebration Schedule
              </h2>
            </Reveal>
            <BotanicalEvents events={wedding.events} />
          </Section>
        )}

        {/* ───────── GALLERY ───────── */}
        {wedding.gallery && wedding.gallery.length > 0 && (
          <Section max="70rem">
            <Reveal className="flex flex-col items-center text-center gap-4 !mb-12">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-800 font-semibold">
                Herbarium Gallery
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-emerald-950 font-normal">
                Cherished Moments
              </h2>
            </Reveal>
            <BotanicalGallery photos={wedding.gallery} />
          </Section>
        )}

        {/* ───────── RSVP ───────── */}
        <Section max="38rem">
          <Reveal className="flex flex-col items-center text-center gap-4 !mb-10">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-800 font-semibold">
              Presence &amp; Blessings
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-emerald-950 font-normal">
              Kindly Respond
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-3xl border-2 border-emerald-800/30 bg-white !p-6 sm:!p-10 shadow-xl shadow-emerald-950/10">
              <RSVPForm weddingId={wedding.id} primaryColor="#15803d" accentColor="#4d7c0f" />
            </div>
          </Reveal>
        </Section>

        {/* ───────── FOOTER ───────── */}
        <footer className="border-t border-emerald-800/20 bg-[#f7f5ed] !py-12 text-center text-stone-600 text-xs font-mono">
          <p className="!mb-2">Growing in love and cherished blessings • {couple}</p>
          <p>
            Designed on{' '}
            <Link href="/" className="text-emerald-800 font-semibold underline underline-offset-4 hover:text-stone-900">
              ForeverVows
            </Link>
          </p>
        </footer>
      </div>
    </MotionConfig>
  )
}
