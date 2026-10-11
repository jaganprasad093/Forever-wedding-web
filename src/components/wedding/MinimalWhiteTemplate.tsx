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
  type MotionValue,
  type Variants,
} from 'framer-motion'
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { WeddingData, MusicItem } from '@/types/wedding'
import { formatDate, formatTime, getCountdown } from '@/lib/utils'
import RSVPForm from '@/components/rsvp/RSVPForm'

type Photo = NonNullable<WeddingData['gallery']>[number]
type WeddingEvent = NonNullable<WeddingData['events']>[number]

const ease = [0.22, 1, 0.36, 1] as const

const INK = '#1c1917'
const GOLD = '#b08d57' // champagne gold: the one "royal" accent

const GUTTER = 'clamp(1.25rem, 5vw, 3.5rem)'

function Wrap({
  children,
  max = '80rem',
  style,
}: {
  children: React.ReactNode
  max?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: max,
        marginInline: 'auto',
        paddingInline: GUTTER,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function Block({
  children,
  bg,
  max,
  noBorder = false,
}: {
  children: React.ReactNode
  bg?: string
  max?: string
  noBorder?: boolean
}) {
  return (
    <section
      className={noBorder ? '' : 'border-b border-stone-200'}
      style={{ backgroundColor: bg, paddingBlock: 'clamp(4.5rem, 10vw, 8rem)' }}
    >
      <Wrap max={max}>{children}</Wrap>
    </section>
  )
}

/* ───────────────────────── Motion helpers ───────────────────────── */

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
}
const wordRise: Variants = {
  hidden: { y: '115%' },
  show: { y: '0%', transition: { duration: 1.1, ease } },
}
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease } },
}

function Reveal({
  children,
  delay = 0,
  y = 24,
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

// A hairline that draws itself from the left.
function Rule({ color = '#d6d3d1', origin = 'left' }: { color?: string; origin?: 'left' | 'right' }) {
  return (
    <motion.div
      aria-hidden
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, ease }}
      className="h-px w-full"
      style={{ backgroundColor: color, transformOrigin: origin }}
    />
  )
}

// Words slide up from behind a mask.
function MaskWords({ text }: { text: string }) {
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

function Chapter({ no, title, aside }: { no: string; title: string; aside?: string }) {
  return (
    <Reveal style={{ marginBottom: 'clamp(2.5rem, 6vw, 5rem)' }}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.3em]" style={{ color: GOLD }}>
            Chapter {no}
          </span>
          <h2
            className="font-serif font-light leading-none tracking-tight text-balance text-[clamp(2.5rem,6vw,4.5rem)]"
            style={{ color: INK }}
          >
            {title}
          </h2>
        </div>
        {aside && (
          <p className="font-mono text-xs uppercase tracking-wider text-stone-500">{aside}</p>
        )}
      </div>
    </Reveal>
  )
}

/* ───────────────────────── Date helpers ───────────────────────── */

function dateParts(d?: string | null) {
  if (!d) return null
  const isoDay = /^\d{4}-\d{2}-\d{2}$/.test(d)
  const dt = new Date(isoDay ? `${d}T00:00:00Z` : d)
  if (isNaN(dt.getTime())) return null
  const timeZone = isoDay ? 'UTC' : undefined
  return {
    day: dt.toLocaleDateString('en-US', { day: '2-digit', timeZone }),
    month: dt.toLocaleDateString('en-US', { month: 'short', timeZone }),
    year: dt.toLocaleDateString('en-US', { year: 'numeric', timeZone }),
  }
}

/* ───────────────────────── Countdown ───────────────────────── */

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
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="inline-block"
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function EditorialCountdown({ date }: { date: string }) {
  const currentSecond = useSyncExternalStore(
    subscribeCountdown,
    () => Math.floor(Date.now() / 1000),
    () => null
  )
  const timeLeft = currentSecond !== null ? getCountdown(date) : null

  if (timeLeft?.isPast) {
    return (
      <p className="text-center font-serif text-3xl sm:text-5xl font-light italic" style={{ color: INK }}>
        The union has begun.
      </p>
    )
  }

  const units = [
    { label: 'Days', val: timeLeft?.days },
    { label: 'Hours', val: timeLeft?.hours },
    { label: 'Minutes', val: timeLeft?.minutes },
    { label: 'Seconds', val: timeLeft?.seconds },
  ]
  const pct = timeLeft ? (timeLeft.seconds / 60) * 100 : 0

  return (
    <div style={{ width: '100%', maxWidth: '60rem', marginInline: 'auto' }} role="timer" aria-live="off">
      <div className="grid grid-cols-4 border-t border-stone-200">
        {units.map((u, i) => (
          <motion.div
            key={u.label}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.9, ease }}
            className={`flex flex-col items-center gap-3 ${i > 0 ? 'border-l border-stone-200' : ''}`}
            style={{ padding: 'clamp(1.5rem, 4vw, 3rem) 0.25rem' }}
          >
            <span
              className="flex font-serif font-light leading-none tabular-nums text-[clamp(2.25rem,8vw,6rem)]"
              style={{ color: INK }}
            >
              {u.val === undefined ? (
                <span className="text-stone-300">--</span>
              ) : (
                String(u.val)
                  .padStart(2, '0')
                  .split('')
                  .map((ch, ci) => <FlipChar key={ci} char={ch} />)
              )}
            </span>
            <span className="font-mono text-[0.6rem] sm:text-xs uppercase tracking-[0.2em] text-stone-400">
              {u.label}
            </span>
          </motion.div>
        ))}
      </div>
      {/* Gold hairline fills with each minute's seconds */}
      <div className="relative h-[2px] w-full bg-stone-200">
        <div
          className="absolute left-0 top-0 h-[2px]"
          style={{ width: `${pct}%`, backgroundColor: GOLD, transition: 'width 1s linear' }}
        />
      </div>
    </div>
  )
}

/* ───────────────────────── Marquee ───────────────────────── */

function Marquee({ items }: { items: string[] }) {
  const reduce = useReducedMotion()
  if (items.length === 0) return null
  const group = Array.from({ length: 4 }).flatMap(() => items)
  return (
    <div
      className="overflow-hidden border-b border-stone-200 bg-[#fafaf9]"
      style={{ paddingBlock: 'clamp(1.25rem, 3vw, 2.25rem)' }}
      aria-hidden
    >
      <motion.div
        className="flex w-max items-center"
        animate={reduce ? undefined : { x: ['0%', '-50%'] }}
        transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
      >
        {[0, 1].map((g) => (
          <div key={g} className="flex shrink-0 items-center">
            {group.map((t, i) => (
              <Fragment key={i}>
                <span
                  className="whitespace-nowrap font-serif font-light italic text-[clamp(2rem,6vw,4.5rem)]"
                  style={
                    i % 2 === 0
                      ? { color: INK }
                      : { color: 'transparent', WebkitTextStroke: `1px ${INK}` }
                  }
                >
                  {t}
                </span>
                <span
                  className="text-xl"
                  style={{ color: GOLD, paddingInline: 'clamp(1.5rem, 4vw, 2.75rem)' }}
                >
                  ✦
                </span>
              </Fragment>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

/* ───────────────────────── Story: words darken on scroll ───────────────────────── */

function ScrollWord({
  word,
  progress,
  range,
}: {
  word: string
  progress: MotionValue<number>
  range: [number, number]
}) {
  const opacity = useTransform(progress, range, [0.15, 1])
  return (
    <>
      <motion.span style={{ opacity }} className="inline-block">
        {word}
      </motion.span>{' '}
    </>
  )
}

function ScrollWords({ text }: { text: string }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 50%'] })
  const words = text.split(' ')

  return (
    <p
      ref={ref}
      className="font-serif font-light italic leading-[1.55] text-[clamp(1.4rem,3vw,2.25rem)]"
      style={{ color: INK }}
    >
      {reduce
        ? text
        : words.map((w, i) => (
          <ScrollWord
            key={i}
            word={w}
            progress={scrollYProgress}
            range={[i / words.length, Math.min(1, (i + 1.5) / words.length)]}
          />
        ))}
    </p>
  )
}

/* ───────────────────────── Music ───────────────────────── */

function EditorialMusicPlayer({ music }: { music?: MusicItem | null }) {
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
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.7, ease }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={toggle}
        aria-label={playing ? 'Pause music' : 'Play music'}
        aria-pressed={playing}
        className="fixed z-50 flex h-11 cursor-pointer items-center gap-3 rounded-full bg-stone-900 font-mono text-[0.65rem] uppercase tracking-widest text-stone-100 shadow-xl transition-colors hover:bg-stone-800"
        style={{
          top: 'max(1rem, env(safe-area-inset-top))',
          right: 'max(1rem, env(safe-area-inset-right))',
          padding: '0 1rem',
        }}
      >
        <span className="flex h-3.5 items-end gap-[3px]" aria-hidden>
          {[0, 1, 2, 3].map((b) => (
            <motion.span
              key={b}
              className="w-[2px] rounded-full"
              style={{ backgroundColor: playing ? GOLD : '#78716c' }}
              animate={playing ? { height: [3, 14, 6, 12, 3] } : { height: 3 }}
              transition={
                playing
                  ? { duration: 1 + b * 0.15, repeat: Infinity, ease: 'easeInOut', delay: b * 0.1 }
                  : { duration: 0.3 }
              }
            />
          ))}
        </span>
        <span className="hidden sm:inline">{playing ? 'Sound / On' : 'Play Audio'}</span>
      </motion.button>
    </>
  )
}

/* ───────────────────────── Gallery ───────────────────────── */

const RATIOS = ['3/4', '1/1', '4/5', '5/6', '3/4', '1/1']

function EditorialGallery({ photos }: { photos: Photo[] }) {
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
    enter: (d: number) => ({ opacity: 0, x: d * 50 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d * -50 }),
  }

  return (
    <>
      {/* Masonry columns: 1 → 2 → 3 */}
      <div className="columns-1 sm:columns-2 lg:columns-3" style={{ columnGap: 'clamp(1rem, 2.5vw, 2rem)' }}>
        {photos.map((p, idx) => (
          <motion.figure
            key={p.id}
            initial={{ clipPath: 'inset(100% 0 0 0)', opacity: 0.4 }}
            whileInView={{ clipPath: 'inset(0% 0 0 0)', opacity: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 1.2, ease }}
            style={{ breakInside: 'avoid', marginBottom: 'clamp(1.25rem, 3vw, 2.25rem)' }}
          >
            <button
              type="button"
              onClick={() => {
                setDir(1)
                setOpen(idx)
              }}
              aria-label={`Open plate ${idx + 1}`}
              className="group block w-full cursor-zoom-in text-left"
            >
              <span
                className="relative block w-full overflow-hidden bg-stone-100"
                style={{ aspectRatio: RATIOS[idx % RATIOS.length] }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover grayscale transition-all duration-[1200ms] ease-out group-hover:scale-105 group-hover:grayscale-0"
                />
                <span
                  className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100"
                  style={{ backgroundColor: GOLD }}
                />
              </span>
              <span
                className="flex items-center justify-between font-mono text-[0.65rem] uppercase tracking-wider text-stone-500"
                style={{ paddingTop: '0.75rem' }}
              >
                <span>Plate {String(idx + 1).padStart(2, '0')}</span>
                <span className="opacity-0 transition-opacity group-hover:opacity-100">View ↗</span>
              </span>
            </button>
          </motion.figure>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Photograph viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-950/95"
            style={{ padding: 'clamp(1rem, 4vw, 2.5rem)' }}
          >
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Close"
              className="absolute right-4 z-10 flex h-11 w-11 items-center justify-center text-stone-300 transition-colors hover:text-white"
              style={{ top: 'max(1rem, env(safe-area-inset-top))' }}
            >
              <X className="h-6 w-6" />
            </button>

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous photograph"
                  onClick={(e) => {
                    e.stopPropagation()
                    go(-1)
                  }}
                  className="absolute left-2 sm:left-6 z-10 flex h-11 w-11 items-center justify-center text-stone-300 transition-colors hover:text-white"
                >
                  <ChevronLeft className="h-7 w-7" />
                </button>
                <button
                  type="button"
                  aria-label="Next photograph"
                  onClick={(e) => {
                    e.stopPropagation()
                    go(1)
                  }}
                  className="absolute right-2 sm:right-6 z-10 flex h-11 w-11 items-center justify-center text-stone-300 transition-colors hover:text-white"
                >
                  <ChevronRight className="h-7 w-7" />
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
                className="max-h-[85svh] max-w-full select-none object-contain shadow-2xl"
                draggable={false}
              />
            </AnimatePresence>

            <p
              className="absolute left-1/2 -translate-x-1/2 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-stone-400"
              style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
            >
              Plate {String(open + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ───────────────────────── Program rows ───────────────────────── */

function ProgramRow({ ev, i }: { ev: WeddingEvent; i: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay: 0.05, ease }}
      className="group relative border-t border-stone-200 last:border-b"
    >
      {/* hover wash that sweeps in from the left */}
      <span
        aria-hidden
        className="absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-500 ease-out group-hover:scale-x-100"
      />
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-0.5 origin-top scale-y-0 transition-transform duration-500 group-hover:scale-y-100"
        style={{ backgroundColor: GOLD }}
      />

      <div
        className="relative grid grid-cols-1 items-baseline gap-4 md:grid-cols-[1fr_2fr_auto] md:gap-10"
        style={{ padding: 'clamp(1.5rem, 3vw, 2.5rem) clamp(0.5rem, 2vw, 1.5rem)' }}
      >
        <div className="flex items-baseline gap-5">
          <span className="font-mono text-sm" style={{ color: GOLD }}>
            /{String(i + 1).padStart(2, '0')}
          </span>
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs uppercase tracking-widest text-stone-600">
              {ev.time ? formatTime(ev.time) : 'TBD'}
            </span>
            {ev.date && (
              <span className="font-mono text-[0.65rem] uppercase tracking-wider text-stone-400">
                {formatDate(ev.date)}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 transition-transform duration-500 group-hover:translate-x-2">
          <h3
            className="font-serif font-light leading-tight text-[clamp(1.75rem,3.5vw,2.5rem)]"
            style={{ color: INK }}
          >
            {ev.title}
          </h3>
          {ev.venue && <p className="text-sm text-stone-500">{ev.venue}</p>}
        </div>

        <div className="flex md:justify-end">
          {ev.mapsUrl && (
            <a
              href={ev.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider transition-colors hover:text-stone-500"
              style={{ color: INK }}
            >
              <span>Map</span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          )}
        </div>
      </div>
    </motion.li>
  )
}

/* ──────────────────────────────────────────────────────────
   MAIN COMPONENT: MinimalWhiteTemplate
   Editorial ivory: Swiss typography with a champagne-gold accent
   ────────────────────────────────────────────────────────── */
export default function MinimalWhiteTemplate({ wedding }: { wedding: WeddingData }) {
  const groom = wedding.groomName || 'Jagan Roy'
  const bride = wedding.brideName || 'Anu Mehta'
  const couple = `${groom} & ${bride}`

  const coverPhoto = wedding.gallery?.find((g) => g.isCover) || wedding.gallery?.[0]
  const parts = dateParts(wedding.weddingDate)
  const shortDate = parts ? `${parts.day} ${parts.month} ${parts.year}`.toUpperCase() : null
  const reduce = useReducedMotion()

  /* Page progress */
  const { scrollYProgress: pageProgress } = useScroll()
  const progress = useSpring(pageProgress, { stiffness: 120, damping: 28 })

  /* Hero image parallax */
  const heroImgRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: imgProgress } = useScroll({
    target: heroImgRef,
    offset: ['start end', 'end start'],
  })
  const imgY = useTransform(imgProgress, [0, 1], ['-7%', '7%'])

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen w-full overflow-x-hidden bg-[#fafaf9] font-sans text-stone-900 selection:bg-stone-900 selection:text-stone-50">
        {/* Scroll progress */}
        <motion.div
          aria-hidden
          className="fixed inset-x-0 top-0 z-[55] h-[2px] origin-left"
          style={{ scaleX: progress, backgroundColor: GOLD }}
        />

        <EditorialMusicPlayer music={wedding.music} />

        {/* ───────── MASTHEAD & HERO ───────── */}
        <section
          className="border-b border-stone-200"
          style={{ paddingTop: 'clamp(5rem, 9vw, 7rem)', paddingBottom: 'clamp(3.5rem, 7vw, 6rem)' }}
        >
          <Wrap>
            <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col">
              {/* Masthead */}
              <motion.div variants={fadeUp} className="flex flex-col gap-3">
                <div className="flex flex-col justify-between gap-2 font-mono text-[0.65rem] sm:text-xs uppercase tracking-widest text-stone-500 sm:flex-row sm:items-center sm:gap-4">
                  <span>Invitation Monograph // Vol. XXIV</span>
                  <span>{wedding.weddingDate ? formatDate(wedding.weddingDate) : 'Date to be announced'}</span>
                  <span>{wedding.venueName || 'Kerala, India'}</span>
                </div>
                <motion.div
                  aria-hidden
                  variants={{
                    hidden: { scaleX: 0 },
                    show: { scaleX: 1, transition: { duration: 1.4, ease } },
                  }}
                  className="h-px w-full origin-left bg-stone-300"
                />
              </motion.div>

              {/* Title block */}
              <div
                className="flex flex-col gap-6"
                style={{ paddingBlock: 'clamp(3.5rem, 9vw, 7rem)' }}
              >
                <motion.p
                  variants={fadeUp}
                  className="font-mono text-[0.65rem] sm:text-xs uppercase tracking-[0.3em] text-stone-400"
                >
                  Cordially invite you to the nuptials of
                </motion.p>

                <h1
                  className="flex flex-col font-serif font-light leading-[0.92] tracking-tight text-[clamp(3.5rem,12.5vw,10.5rem)]"
                  style={{ color: INK }}
                >
                  <span className="block">
                    <MaskWords text={groom} />
                  </span>
                  <motion.span
                    variants={fadeUp}
                    className="flex items-center gap-4 self-start"
                    style={{ paddingBlock: '0.12em' }}
                    aria-label="and"
                  >
                    <span
                      className="h-px w-[clamp(3rem,10vw,8rem)]"
                      style={{ backgroundColor: GOLD }}
                    />
                    <span className="font-serif text-[0.3em] italic text-stone-400">and</span>
                  </motion.span>
                  <span className="block text-left sm:self-end sm:text-right">
                    <MaskWords text={bride} />
                  </span>
                </h1>

                <motion.div
                  variants={fadeUp}
                  className="flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-xs uppercase tracking-wider text-stone-600"
                >
                  {wedding.weddingDate && (
                    <span className="flex items-center gap-2.5">
                      <span className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: GOLD }} />
                      {formatDate(wedding.weddingDate)}
                    </span>
                  )}
                  {wedding.venueName && (
                    <span className="flex items-center gap-2.5">
                      <span className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: GOLD }} />
                      {wedding.venueName}
                    </span>
                  )}
                </motion.div>
              </div>
            </motion.div>

            {/* Hero plate with rotating date seal */}
            {coverPhoto && (
              <div className="relative">
                <motion.div
                  ref={heroImgRef}
                  initial={{ clipPath: 'inset(0 0 100% 0)' }}
                  animate={{ clipPath: 'inset(0 0 0% 0)' }}
                  transition={{ duration: 1.6, delay: 0.7, ease }}
                  className="relative aspect-[4/3] w-full overflow-hidden bg-stone-200 sm:aspect-[21/9]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <motion.img
                    src={coverPhoto.url}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ y: imgY, scale: 1.15 }}
                    initial={{ filter: 'grayscale(1)' }}
                    animate={{ filter: 'grayscale(0)' }}
                    transition={{ duration: 2.4, delay: 1.2, ease: 'easeOut' }}
                  />
                </motion.div>

                {/* Rotating seal */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.9, duration: 0.9, ease }}
                  className="absolute flex items-center justify-center rounded-full bg-[#fafaf9]"
                  style={{
                    right: 'clamp(0.75rem, 3vw, 2.5rem)',
                    bottom: 'calc(-1 * clamp(2.25rem, 6vw, 4.5rem))',
                    width: 'clamp(5.5rem, 14vw, 9rem)',
                    height: 'clamp(5.5rem, 14vw, 9rem)',
                    border: `1px solid ${GOLD}`,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
                  }}
                  aria-hidden
                >
                  <motion.svg
                    viewBox="0 0 120 120"
                    className="absolute inset-0 h-full w-full"
                    animate={reduce ? undefined : { rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                    style={{ color: INK }}
                  >
                    <defs>
                      <path id="seal-path" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" />
                    </defs>
                    <text
                      fontSize="8.5"
                      letterSpacing="3"
                      fill="currentColor"
                      style={{ fontFamily: 'ui-monospace, monospace', textTransform: 'uppercase' }}
                    >
                      <textPath href="#seal-path">
                        {shortDate ? `Save the date • ${shortDate} • ` : 'With love • Forever • Together • '}
                      </textPath>
                    </text>
                  </motion.svg>
                  <span className="font-serif text-[clamp(1rem,3vw,1.6rem)] italic" style={{ color: GOLD }}>
                    {groom[0]}&amp;{bride[0]}
                  </span>
                </motion.div>
              </div>
            )}
          </Wrap>
        </section>

        {/* ───────── MARQUEE ───────── */}
        <Marquee
          items={[couple, shortDate ?? '', wedding.venueName ?? ''].filter(Boolean) as string[]}
        />

        {/* ───────── COUNTDOWN ───────── */}
        {wedding.weddingDate && (
          <Block bg="#ffffff" max="72rem">
            <Reveal className="flex flex-col items-center gap-10 text-center sm:gap-14">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-stone-400">
                Countdown // Days to union
              </p>
              <EditorialCountdown date={wedding.weddingDate} />
            </Reveal>
          </Block>
        )}

        {/* ───────── STORY ───────── */}
        {wedding.story && (
          <Block max="72rem">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-16">
              <div className="md:col-span-4">
                <div className="md:sticky md:top-28">
                  <Chapter no="01" title="The Story" />
                </div>
              </div>
              <div className="flex flex-col gap-8 md:col-span-8">
                <span
                  aria-hidden
                  className="select-none font-serif text-[5rem] leading-[0.5]"
                  style={{ color: GOLD }}
                >
                  &ldquo;
                </span>
                <ScrollWords text={wedding.story} />
                <Reveal className="flex items-center gap-4">
                  <span className="h-px w-12" style={{ backgroundColor: GOLD }} />
                  <p className="font-mono text-xs uppercase tracking-widest text-stone-500">{couple}</p>
                </Reveal>
              </div>
            </div>
          </Block>
        )}

        {/* ───────── PROGRAM ───────── */}
        {wedding.events && wedding.events.length > 0 && (
          <Block max="68rem">
            <Chapter no="02" title="The Program" aside="Order of events & timeline" />
            <ul className="list-none" style={{ padding: 0 }}>
              {wedding.events.map((ev, i) => (
                <ProgramRow key={ev.id} ev={ev} i={i} />
              ))}
            </ul>
          </Block>
        )}

        {/* ───────── GALLERY ───────── */}
        {wedding.gallery && wedding.gallery.length > 0 && (
          <Block max="80rem">
            <Chapter
              no="03"
              title="Visual Plates"
              aside={`${wedding.gallery.length} archival photographs`}
            />
            <EditorialGallery photos={wedding.gallery} />
          </Block>
        )}

        {/* ───────── LOCATION ───────── */}
        {(wedding.venueName || wedding.venueAddress) && (
          <Block bg="#ffffff" max="72rem">
            <Chapter no="04" title="The Location" />
            <Reveal className="flex flex-col gap-6">
              <Rule color={GOLD} />
              {wedding.venueName && (
                <h3
                  className="font-serif font-light leading-[1.02] tracking-tight text-balance text-[clamp(2.5rem,8vw,6.5rem)]"
                  style={{ color: INK }}
                >
                  {wedding.venueName}
                </h3>
              )}
              <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                {wedding.venueAddress && (
                  <p className="max-w-md font-mono text-xs uppercase leading-relaxed tracking-wider text-stone-500">
                    {wedding.venueAddress}
                  </p>
                )}
                {wedding.venueMapsUrl && (
                  <motion.a
                    href={wedding.venueMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ x: 4 }}
                    className="group inline-flex w-fit items-center gap-2 border-b font-mono text-xs uppercase tracking-widest"
                    style={{ color: INK, borderColor: INK, paddingBottom: '0.35rem' }}
                  >
                    Get directions
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </motion.a>
                )}
              </div>
            </Reveal>
          </Block>
        )}

        {/* ───────── RSVP ───────── */}
        <Block max="44rem">
          <div className="flex flex-col items-center gap-3 text-center" style={{ marginBottom: 'clamp(2rem, 5vw, 3.5rem)' }}>
            <Reveal className="flex flex-col items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-[0.3em]" style={{ color: GOLD }}>
                Confirmation
              </span>
              <h2
                className="font-serif font-light leading-none tracking-tight text-[clamp(2.5rem,6vw,4.5rem)]"
                style={{ color: INK }}
              >
                Will you attend?
              </h2>
              <p className="font-mono text-xs uppercase tracking-wider text-stone-500">
                Kindly respond at your earliest convenience
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <div
              className="relative bg-white"
              style={{
                padding: 'clamp(1.75rem, 5vw, 3.25rem)',
                border: '1px solid #e7e5e4',
                boxShadow: '0 30px 80px -40px rgba(0,0,0,0.15)',
              }}
            >
              {/* Editorial crop marks */}
              {[
                'left-0 top-0 border-l border-t',
                'right-0 top-0 border-r border-t',
                'bottom-0 left-0 border-b border-l',
                'bottom-0 right-0 border-b border-r',
              ].map((c) => (
                <span
                  key={c}
                  aria-hidden
                  className={`pointer-events-none absolute h-5 w-5 ${c}`}
                  style={{ borderColor: GOLD, margin: '-1px' }}
                />
              ))}
              <RSVPForm weddingId={wedding.id} primaryColor="#1c1917" accentColor="#44403c" />
            </div>
          </Reveal>
        </Block>

        {/* ───────── FOOTER ───────── */}
        <footer className="overflow-hidden border-t border-stone-200 bg-white">
          <div
            className="flex flex-col items-center gap-8 text-center"
            style={{ padding: 'clamp(3.5rem, 8vw, 6rem) clamp(1.25rem, 5vw, 3.5rem) 1.5rem' }}
          >
            <Reveal>
              <p
                className="font-serif font-light italic leading-[1.05] tracking-tight text-balance text-[clamp(2.25rem,9vw,8rem)]"
                style={{ color: 'transparent', WebkitTextStroke: `1px ${INK}` }}
              >
                {couple}
              </p>
            </Reveal>
            <Rule color={GOLD} />
            <div className="flex w-full flex-col items-center justify-between gap-3 font-mono text-[0.65rem] sm:text-xs uppercase tracking-widest text-stone-400 sm:flex-row">
              <span>{shortDate ?? 'Forever'} {'//'} {wedding.venueName ?? 'With love'}</span>
              <span>
                Crafted with{' '}
                <Link href="/" className="text-stone-700 underline-offset-4 hover:underline">
                  ForeverVows
                </Link>
              </span>
            </div>
          </div>
          <div style={{ height: 'max(0.5rem, env(safe-area-inset-bottom))' }} />
        </footer>
      </div>
    </MotionConfig>
  )
}