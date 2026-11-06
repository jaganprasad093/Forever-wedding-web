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
} from 'lucide-react'
import { WeddingData, MusicItem } from '@/types/wedding'
import { formatDate, formatTime, getCountdown } from '@/lib/utils'
import RSVPForm from '@/components/rsvp/RSVPForm'
import WeddingMusicPlayer from './WeddingMusicPlayer'

type Photo = NonNullable<WeddingData['gallery']>[number]
type WeddingEvent = NonNullable<WeddingData['events']>[number]
type Lang = 'EN' | 'ML'

const ease = [0.22, 1, 0.36, 1] as const

/* Palette: rose + wine for warmth, champagne gold as the one "precious" accent */
const ROSE = 'var(--primary, #9f1239)'
const ROSE_SOFT = 'var(--accent, #fb7185)'
const WINE = '#4c0519'
const WINE_DEEP = '#33061a'
const GOLD = '#b8893b'
const GOLD_LIGHT = '#f5d28a'
const GOLD_GRADIENT = `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`

// Demo family lines (replace with real fields when your data model has them)
const GROOM_PARENTS = 'Mr. Pavithran & Mrs. Mridhula'
const BRIDE_PARENTS = 'Mr. Pradeepan & Mrs. Rethi'

const SECTION_PAD: React.CSSProperties = {
  padding: 'clamp(4.5rem, 10vw, 8rem) clamp(1.25rem, 5vw, 3rem)',
}

/* ───────────────────────── Copy (EN / ML) ───────────────────────── */

const T: Record<Lang, Record<string, string>> = {
  EN: {
    invite: 'You are invited to be a part of our special moment',
    son: 'Son of',
    daughter: 'Daughter of',
    scroll: 'Scroll',
    scratchTitle: 'Scratch to reveal the date',
    scratchHint: 'Use your finger or mouse to scratch the foil off the heart',
    scratchCue: 'Scratch here',
    keepGoing: 'Keep going…',
    revealedHint: 'Save the date',
    save: 'Add to calendar',
    saved: 'Added to your calendar',
    reveal: 'Reveal without scratching',
    countdown: 'Counting down to our forever',
    story: 'Our love story',
    schedule: 'Celebration schedule',
    scheduleSub: 'Every moment crafted with love and blessings',
    gallery: 'Moments captured',
    gallerySub: 'Glimpses of smiles, laughter, and endless love',
    wishes: 'Send your warm wishes',
    wishesSub: 'Leave a blessing or love note for {couple}',
    wishPlaceholder: 'Write your wishes...',
    namePlaceholder: 'Your name (optional)',
    send: 'Send message',
    thanks: 'Thank you for your blessings!',
    cant: "We can't wait to celebrate with you!",
    rsvp: 'RSVP',
    rsvpSub: 'Please let us know if you can make it',
    map: 'View map',
    footer: 'Create your own wedding invitation on',
    days: 'Days',
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds',
    began: 'The celebration has begun!',
  },
  ML: {
    invite: 'ഞങ്ങളുടെ ഈ സുന്ദര നിമിഷത്തിൽ പങ്കുചേരാൻ നിങ്ങളെ ക്ഷണിക്കുന്നു',
    son: 'മകൻ',
    daughter: 'മകൾ',
    scroll: 'താഴേക്ക്',
    scratchTitle: 'ചുരണ്ടി തീയതി അറിയൂ',
    scratchHint: 'വിരൽ കൊണ്ട് ഹൃദയത്തിലെ ഫോയിൽ ചുരണ്ടി മാറ്റൂ',
    scratchCue: 'ഇവിടെ ചുരണ്ടൂ',
    keepGoing: 'തുടരൂ…',
    revealedHint: 'തീയതി കുറിച്ചുവെക്കൂ',
    save: 'കലണ്ടറിൽ ചേർക്കുക',
    saved: 'കലണ്ടറിൽ ചേർത്തു',
    reveal: 'ചുരണ്ടാതെ കാണുക',
    countdown: 'ഞങ്ങളുടെ ഒന്നിക്കലിലേക്കുള്ള കാത്തിരിപ്പ്',
    story: 'ഞങ്ങളുടെ പ്രണയകഥ',
    schedule: 'ആഘോഷ പരിപാടികൾ',
    scheduleSub: 'സ്നേഹത്തോടും അനുഗ്രഹത്തോടും ഒരുക്കിയ ഓരോ നിമിഷവും',
    gallery: 'പകർത്തിയ നിമിഷങ്ങൾ',
    gallerySub: 'പുഞ്ചിരിയുടെയും ചിരിയുടെയും അനന്തമായ സ്നേഹത്തിന്റെയും നേർക്കാഴ്ചകൾ',
    wishes: 'നിങ്ങളുടെ ആശംസകൾ നേരൂ',
    wishesSub: '{couple} ദമ്പതികൾക്ക് ഒരു അനുഗ്രഹമോ സ്നേഹക്കുറിപ്പോ നൽകൂ',
    wishPlaceholder: 'നിങ്ങളുടെ ആശംസകൾ എഴുതൂ...',
    namePlaceholder: 'നിങ്ങളുടെ പേര് (ഓപ്ഷണൽ)',
    send: 'അയക്കുക',
    thanks: 'നിങ്ങളുടെ അനുഗ്രഹങ്ങൾക്ക് നന്ദി!',
    cant: 'നിങ്ങളോടൊപ്പം ആഘോഷിക്കാൻ ഞങ്ങൾ കാത്തിരിക്കുന്നു!',
    rsvp: 'RSVP',
    rsvpSub: 'നിങ്ങൾക്ക് വരാൻ കഴിയുമോ എന്ന് ഞങ്ങളെ അറിയിക്കൂ',
    map: 'മാപ്പ്',
    footer: 'നിങ്ങളുടെ സ്വന്തം വിവാഹ ക്ഷണക്കത്ത് ഒരുക്കൂ:',
    days: 'ദിവസം',
    hours: 'മണിക്കൂർ',
    minutes: 'മിനിറ്റ്',
    seconds: 'സെക്കൻഡ്',
    began: 'ആഘോഷം തുടങ്ങിക്കഴിഞ്ഞു!',
  },
}

/* ───────────────────────── Shared bits ───────────────────────── */

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.5 } },
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

function Section({
  children,
  max = '64rem',
  bg,
  className = '',
}: {
  children: React.ReactNode
  max?: string
  bg?: string
  className?: string
}) {
  return (
    <section className={`relative ${className}`} style={{ ...SECTION_PAD, background: bg }}>
      <div style={{ width: '100%', maxWidth: max, marginInline: 'auto' }}>{children}</div>
    </section>
  )
}

function MaskWords({ text }: { text: string }) {
  return (
    <>
      {text.split(' ').map((word, i, arr) => (
        <Fragment key={i}>
          <span
            className="inline-block overflow-hidden align-bottom"
            style={{ paddingBlock: '0.16em', marginBlock: '-0.16em', paddingInline: '0.06em' }}
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

function HeartDivider({ light = false, gold = false }: { light?: boolean; gold?: boolean }) {
  const line = light ? 'rgba(255,255,255,0.45)' : gold ? GOLD : '#fda4af'
  const fill = light ? '#fff' : gold ? GOLD : ROSE_SOFT
  return (
    <div className="flex items-center justify-center gap-3" aria-hidden>
      <motion.span
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease }}
        className="h-px w-10 origin-right sm:w-14"
        style={{ backgroundColor: line }}
      />
      <Heart className="h-3.5 w-3.5" style={{ color: fill, fill }} />
      <motion.span
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease }}
        className="h-px w-10 origin-left sm:w-14"
        style={{ backgroundColor: line }}
      />
    </div>
  )
}

function Heading({
  title,
  subtitle,
  dark = false,
}: {
  title: string
  subtitle?: string
  dark?: boolean
}) {
  return (
    <Reveal
      className="flex flex-col items-center gap-4 text-center"
      style={{ marginBottom: 'clamp(2.5rem, 6vw, 4.5rem)' }}
    >
      <HeartDivider gold />
      <h2
        className="font-serif font-normal italic leading-[1.1] tracking-wide text-balance text-[clamp(2rem,5.5vw,3.5rem)]"
        style={{ color: dark ? '#fde9c4' : WINE }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`max-w-md font-sans text-sm leading-relaxed text-balance sm:text-base ${dark ? 'text-rose-200/80' : 'text-rose-700/80'
            }`}
        >
          {subtitle}
        </p>
      )}
    </Reveal>
  )
}

// Shared heart-shaped clip path (objectBoundingBox units).
function HeartClipDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
      <defs>
        <clipPath id="heart-clip" clipPathUnits="objectBoundingBox">
          <path d="M0.5,0.94 C0.08,0.62 0,0.42 0,0.27 C0,0.11 0.12,0 0.27,0 C0.37,0 0.46,0.06 0.5,0.15 C0.54,0.06 0.63,0 0.73,0 C0.88,0 1,0.11 1,0.27 C1,0.42 0.92,0.62 0.5,0.94Z" />
        </clipPath>
      </defs>
    </svg>
  )
}

function HeartBurst({ count = 12 }: { count?: number }) {
  const reduce = useReducedMotion()
  if (reduce) return null
  return (
    <span className="pointer-events-none absolute left-1/2 top-1/2 z-30" aria-hidden>
      {Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2
        const d = 80 + (i % 3) * 34
        return (
          <motion.span
            key={i}
            className="absolute block text-base"
            style={{ color: i % 3 === 0 ? GOLD : i % 2 ? '#f43f5e' : '#fb7185' }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
            animate={{ x: Math.cos(a) * d, y: Math.sin(a) * d - 20, opacity: 0, scale: 1.1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          >
            ♥
          </motion.span>
        )
      })}
    </span>
  )
}

/* ───────────────────────── Floral garland ───────────────────────── */

function Blossom({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      {Array.from({ length: 5 }).map((_, i) => {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2
        return (
          <circle
            key={i}
            cx={cx + Math.cos(a) * r * 0.62}
            cy={cy + Math.sin(a) * r * 0.62}
            r={r * 0.58}
            fill={i % 2 ? '#fb7185' : '#f43f5e'}
            fillOpacity="0.92"
          />
        )
      })}
      <circle cx={cx} cy={cy} r={r * 0.34} fill="#fde68a" />
    </g>
  )
}

function FloralCorner({ flip = false, delay = 0 }: { flip?: boolean; delay?: number }) {
  const leaves = [
    { x: 26, y: 18, a: 25 },
    { x: 58, y: 40, a: 50 },
    { x: 88, y: 66, a: 60 },
    { x: 116, y: 100, a: 70 },
    { x: 140, y: 146, a: 80 },
    { x: 162, y: 190, a: 85 },
    { x: 44, y: 34, a: -20 },
    { x: 104, y: 84, a: 20 },
    { x: 150, y: 128, a: 30 },
  ]
  return (
    <div
      className={`pointer-events-none absolute top-0 z-20 ${flip ? 'right-0 -scale-x-100' : 'left-0'}`}
      style={{ width: 'clamp(8rem, 24vw, 17rem)' }}
      aria-hidden
    >
      <motion.svg
        viewBox="0 0 240 240"
        className="h-auto w-full overflow-visible"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1, rotate: [0, 1.6, -1.2, 0] }}
        transition={{
          opacity: { duration: 1.2, delay },
          scale: { duration: 1.4, delay, ease },
          rotate: { duration: 8, delay: delay + 1.4, repeat: Infinity, ease: 'easeInOut' },
        }}
        style={{ transformOrigin: '0% 0%' }}
      >
        <motion.path
          d="M0 10 C60 18 112 50 150 112 S 210 196 232 236"
          fill="none"
          stroke="#4d7c0f"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay, ease }}
        />
        {leaves.map((l, i) => (
          <motion.ellipse
            key={i}
            cx={l.x}
            cy={l.y}
            rx="15"
            ry="6"
            fill={i % 2 ? '#65a30d' : '#4d7c0f'}
            fillOpacity="0.85"
            transform={`rotate(${l.a} ${l.x} ${l.y})`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.6 + i * 0.08, type: 'spring', stiffness: 200, damping: 14 }}
            style={{ transformOrigin: `${l.x}px ${l.y}px` }}
          />
        ))}
        {[
          { x: 70, y: 36, r: 18 },
          { x: 118, y: 74, r: 22 },
          { x: 152, y: 124, r: 16 },
          { x: 192, y: 178, r: 20 },
          { x: 24, y: 8, r: 12 },
        ].map((f, i) => (
          <motion.g
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 1 + i * 0.15, type: 'spring', stiffness: 160, damping: 12 }}
            style={{ transformOrigin: `${f.x}px ${f.y}px` }}
          >
            <Blossom cx={f.x} cy={f.y} r={f.r} />
          </motion.g>
        ))}
      </motion.svg>
    </div>
  )
}

/* ───────────────────────── Falling petals ───────────────────────── */

function RomanticFloatingParticles() {
  const reduce = useReducedMotion()
  if (reduce) return null
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden>
      {Array.from({ length: 10 }).map((_, i) => {
        const left = (i * 23 + 7) % 96
        const size = 10 + (i % 4) * 4
        return (
          <motion.div
            key={i}
            className="absolute -top-10"
            style={{
              left: `${left}%`,
              width: size,
              height: size * 1.3,
              borderRadius: '60% 40% 60% 40% / 70% 50% 50% 30%',
              background: 'linear-gradient(135deg, #fbcfe8, #f43f5e, #be185d)',
              opacity: 0.7,
            }}
            initial={{ y: '-5vh', opacity: 0 }}
            animate={{
              y: ['0vh', '110vh'],
              x: [0, (i % 2 === 0 ? 1 : -1) * 40, 0],
              rotate: [0, 180, 360],
              opacity: [0, 0.8, 0.8, 0],
            }}
            transition={{
              duration: 11 + (i % 5) * 2.5,
              delay: 1.5 + ((i * 1.1) % 7),
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )
      })}
    </div>
  )
}

/* ───────────────────────── Date helpers ───────────────────────── */

function ymdFromDate(input: string) {
  const isoDay = /^\d{4}-\d{2}-\d{2}$/.test(input)
  const d = new Date(isoDay ? `${input}T00:00:00Z` : input)
  if (isNaN(d.getTime())) return null
  const get = isoDay
    ? { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate() }
    : { y: d.getFullYear(), m: d.getMonth(), d: d.getDate() }
  const pad = (n: number) => String(n).padStart(2, '0')
  const start = new Date(Date.UTC(get.y, get.m, get.d))
  const next = new Date(Date.UTC(get.y, get.m, get.d + 1))
  const fmt = (x: Date) => `${x.getUTCFullYear()}${pad(x.getUTCMonth() + 1)}${pad(x.getUTCDate())}`
  return { start: fmt(start), end: fmt(next) }
}

function dateParts(d?: string | null) {
  if (!d) return null
  const isoDay = /^\d{4}-\d{2}-\d{2}$/.test(d)
  const dt = new Date(isoDay ? `${d}T00:00:00Z` : d)
  if (isNaN(dt.getTime())) return null
  const timeZone = isoDay ? 'UTC' : undefined
  const f = (o: Intl.DateTimeFormatOptions) => dt.toLocaleDateString('en-US', { ...o, timeZone })
  return {
    day: f({ day: '2-digit' }),
    month: f({ month: 'short' }),
    monthLong: f({ month: 'long' }),
    year: f({ year: 'numeric' }),
    weekday: f({ weekday: 'long' }),
  }
}

function downloadIcs(couple: string, date: string, venue?: string | null) {
  const ymd = ymdFromDate(date)
  if (!ymd) return false
  const esc = (s: string) => s.replace(/([,;\\])/g, '\\$1')
  const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedora//Wedding//EN',
    'BEGIN:VEVENT',
    `UID:${ymd.start}-${Math.random().toString(36).slice(2)}@Wedora`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${ymd.start}`,
    `DTEND;VALUE=DATE:${ymd.end}`,
    `SUMMARY:${esc(`Wedding of ${couple}`)}`,
    venue ? `LOCATION:${esc(venue)}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean)
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'wedding.ics'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return true
}

/* ───────────────────────── Scratch to reveal ─────────────────────────
   Rose-gold foil heart: embossed pattern, sheen, grain, gold rim, foil dust
   while scratching, live progress, auto-reveal at 50%, haptics, and a
   no-scratch fallback. Pointer coordinates are scaled so it stays accurate
   when the card shrinks on narrow screens.
   ──────────────────────────────────────────────────────────────────── */

const SCRATCH_W = 300
const SCRATCH_H = 272
const REVEAL_AT = 0.5
const HEART_SVG_PATH =
  'M50,94 C8,62 0,42 0,27 C0,11 12,0 27,0 C37,0 46,6 50,15 C54,6 63,0 73,0 C88,0 100,11 100,27 C100,42 92,62 50,94Z'

function drawHeartPath(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.beginPath()
  ctx.moveTo(0.5 * w, 0.94 * h)
  ctx.bezierCurveTo(0.08 * w, 0.62 * h, 0, 0.42 * h, 0, 0.27 * h)
  ctx.bezierCurveTo(0, 0.11 * h, 0.12 * w, 0, 0.27 * w, 0)
  ctx.bezierCurveTo(0.37 * w, 0, 0.46 * w, 0.06 * h, 0.5 * w, 0.15 * h)
  ctx.bezierCurveTo(0.54 * w, 0.06 * h, 0.63 * w, 0, 0.73 * w, 0)
  ctx.bezierCurveTo(0.88 * w, 0, w, 0.11 * h, w, 0.27 * h)
  ctx.bezierCurveTo(w, 0.42 * h, 0.92 * w, 0.62 * h, 0.5 * w, 0.94 * h)
  ctx.closePath()
}

function paintFoil(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save()
  drawHeartPath(ctx, w, h)
  ctx.clip()

  // rose-gold base
  const base = ctx.createLinearGradient(0, 0, w, h)
  base.addColorStop(0, '#e8b4a2')
  base.addColorStop(0.28, '#f8e0d3')
  base.addColorStop(0.5, '#d9998a')
  base.addColorStop(0.74, '#f4d2c2')
  base.addColorStop(1, '#b9776a')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, w, h)

  // embossed heart lattice
  ctx.font = '15px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let y = 14, row = 0; y < h; y += 24, row++) {
    for (let x = row % 2 ? 13 : 0; x < w + 26; x += 26) {
      ctx.fillStyle = 'rgba(255,255,255,0.28)'
      ctx.fillText('♥', x + 0.8, y + 0.8)
      ctx.fillStyle = 'rgba(122,40,52,0.22)'
      ctx.fillText('♥', x, y)
    }
  }

  // diagonal sheen
  const sheen = ctx.createLinearGradient(0, h * 0.1, w, h * 0.7)
  sheen.addColorStop(0, 'rgba(255,255,255,0)')
  sheen.addColorStop(0.42, 'rgba(255,255,255,0)')
  sheen.addColorStop(0.5, 'rgba(255,255,255,0.55)')
  sheen.addColorStop(0.58, 'rgba(255,255,255,0)')
  sheen.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = sheen
  ctx.fillRect(0, 0, w, h)

  // grain
  for (let i = 0; i < 1400; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.5)' : 'rgba(120,50,50,0.18)'
    ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1)
  }
  ctx.restore()
}

type Dust = { x: number; y: number; vx: number; vy: number; life: number; s: number; c: string }

function ScratchToRevealCard({
  date,
  couple,
  venue,
  t,
}: {
  date?: string | null
  couple: string
  venue?: string | null
  t: Record<string, string>
}) {
  const W = SCRATCH_W
  const H = SCRATCH_H
  const reduce = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fxRef = useRef<HTMLCanvasElement>(null)
  const baseline = useRef(0)
  const last = useRef<{ x: number; y: number } | null>(null)
  const lastCheck = useRef(0)
  const dust = useRef<Dust[]>([])
  const raf = useRef(0)
  const [revealed, setRevealed] = useState(false)
  const [touched, setTouched] = useState(false)
  const [progress, setProgress] = useState(0)
  const [added, setAdded] = useState(false)

  const countOpaque = () => {
    const c = canvasRef.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx) return 0
    const data = ctx.getImageData(0, 0, c.width, c.height).data
    let n = 0
    for (let i = 3; i < data.length; i += 32) if (data[i] > 20) n++
    return n
  }

  useEffect(() => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const canvas = canvasRef.current
    const fx = fxRef.current
    if (!canvas || !fx) return
    for (const c of [canvas, fx]) {
      c.width = W * dpr
      c.height = H * dpr
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)
    paintFoil(ctx, W, H)
    baseline.current = countOpaque()
    return () => cancelAnimationFrame(raf.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const finish = useCallback(() => {
    setProgress(1)
    setRevealed(true)
    if (typeof navigator !== 'undefined') navigator.vibrate?.([14, 40, 22])
  }, [])

  const update = () => {
    if (revealed || !baseline.current) return
    const cleared = Math.max(0, 1 - countOpaque() / baseline.current)
    setProgress(Math.min(1, cleared / REVEAL_AT))
    if (cleared >= REVEAL_AT) finish()
  }

  const tick = () => {
    const c = fxRef.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx) {
      raf.current = 0
      return
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, c.width, c.height)
    const s = c.width / W
    ctx.scale(s, s)
    dust.current = dust.current.filter((p) => p.life > 0)
    for (const p of dust.current) {
      p.vy += 0.13
      p.x += p.vx
      p.y += p.vy
      p.life -= 0.026
      ctx.globalAlpha = Math.max(p.life, 0)
      ctx.fillStyle = p.c
      ctx.fillRect(p.x, p.y, p.s, p.s)
    }
    ctx.globalAlpha = 1
    raf.current = dust.current.length ? requestAnimationFrame(tick) : 0
  }

  const scratchAt = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || revealed) return
    if (e.type === 'pointermove' && e.buttons === 0 && e.pointerType === 'mouse') return
    const rect = canvas.getBoundingClientRect()
    const x = ((e.clientX - rect.left) * W) / rect.width
    const y = ((e.clientY - rect.top) * H) / rect.height

    ctx.globalCompositeOperation = 'destination-out'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 46
    ctx.beginPath()
    if (last.current) {
      ctx.moveTo(last.current.x, last.current.y)
      ctx.lineTo(x, y)
      ctx.stroke()
    } else {
      ctx.arc(x, y, 23, 0, Math.PI * 2)
      ctx.fill()
    }
    last.current = { x, y }
    if (!touched) setTouched(true)

    if (!reduce) {
      for (let i = 0; i < 3; i++) {
        dust.current.push({
          x: x + (Math.random() - 0.5) * 22,
          y: y + (Math.random() - 0.5) * 22,
          vx: (Math.random() - 0.5) * 1.8,
          vy: -Math.random() * 1.4,
          life: 1,
          s: 1 + Math.random() * 2.4,
          c: ['#f8e0d3', '#e8b4a2', '#d9998a', '#f5d28a'][i % 4],
        })
      }
      if (!raf.current) raf.current = requestAnimationFrame(tick)
    }

    const now = performance.now()
    if (now - lastCheck.current > 150) {
      lastCheck.current = now
      update()
    }
  }

  const endStroke = () => {
    last.current = null
    update()
  }

  const parts = dateParts(date)
  const showHint = !touched && !revealed

  return (
    <Section
      max="40rem"
      bg="radial-gradient(ellipse at 50% 30%, #fff1f2 0%, #fdf2f8 55%, #fff8f6 100%)"
    >
      <Heading title={t.scratchTitle} subtitle={t.scratchHint} />

      <Reveal className="flex flex-col items-center gap-7">
        <div
          className="relative select-none"
          style={{ width: 'min(100%, 300px)', aspectRatio: `${W} / ${H}` }}
        >
          {/* ambient glow */}
          <motion.div
            aria-hidden
            className="absolute rounded-full bg-rose-300/40 blur-3xl"
            style={{ inset: '8%' }}
            animate={revealed ? { scale: 1.3, opacity: 0.9 } : { scale: [1, 1.12, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: revealed ? 1.2 : 3.4, repeat: revealed ? 0 : Infinity, ease: 'easeInOut' }}
          />

          <motion.div
            className="absolute inset-0"
            style={{ filter: 'drop-shadow(0 24px 26px rgba(159,18,57,0.28))' }}
            animate={showHint && !reduce ? { scale: [1, 1.035, 1] } : { scale: revealed ? [1, 1.06, 1] : 1 }}
            transition={{ duration: showHint ? 2.4 : 0.7, repeat: showHint ? Infinity : 0, ease: 'easeInOut' }}
          >
            {/* what's underneath */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center text-center"
              style={{
                clipPath: 'url(#heart-clip)',
                background: 'linear-gradient(165deg, #ffffff 0%, #fff1f2 62%, #ffe4e6 100%)',
                paddingBottom: '14%',
              }}
            >
              {parts ? (
                <>
                  <span className="font-sans text-xs font-medium tracking-wide text-rose-500">
                    {parts.weekday}
                  </span>
                  <span
                    className="font-serif font-medium leading-none"
                    style={{ fontSize: 'clamp(4rem, 22vw, 5.5rem)', color: WINE }}
                  >
                    {parts.day}
                  </span>
                  <span className="font-serif text-lg italic" style={{ color: ROSE }}>
                    {parts.monthLong} {parts.year}
                  </span>
                </>
              ) : (
                <span
                  className="font-serif text-xl italic text-balance"
                  style={{ color: WINE, maxWidth: '55%' }}
                >
                  {couple}
                </span>
              )}
            </div>

            {/* foil */}
            <canvas
              ref={canvasRef}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId)
                last.current = null
                scratchAt(e)
              }}
              onPointerMove={scratchAt}
              onPointerUp={endStroke}
              onPointerCancel={endStroke}
              onPointerLeave={() => {
                last.current = null
              }}
              aria-label="Scratch card: scratch to reveal the wedding date"
              className={`absolute inset-0 h-full w-full cursor-pointer touch-none transition-opacity duration-700 ${revealed ? 'pointer-events-none opacity-0' : 'opacity-100'
                }`}
              style={{ cursor: 'grab' }}
            />

            {/* embossed cue on the foil */}
            <AnimatePresence>
              {showHint && (
                <motion.span
                  aria-hidden
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="pointer-events-none absolute inset-0 flex items-center justify-center pb-[10%] font-serif text-2xl italic"
                  style={{
                    color: 'rgba(122,40,52,0.85)',
                    textShadow: '0 1px 0 rgba(255,255,255,0.7)',
                  }}
                >
                  {t.scratchCue}
                </motion.span>
              )}
            </AnimatePresence>

            {/* gold rim */}
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
              aria-hidden
            >
              <defs>
                <linearGradient id="rim-gold" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fbe6b0" />
                  <stop offset="50%" stopColor={GOLD} />
                  <stop offset="100%" stopColor="#f5d28a" />
                </linearGradient>
              </defs>
              <path
                d={HEART_SVG_PATH}
                fill="none"
                stroke="url(#rim-gold)"
                strokeWidth="2.5"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </motion.div>

          {/* foil dust */}
          <canvas
            ref={fxRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 h-full w-full"
          />

          {/* idle guide: a little coin shows what to do */}
          <AnimatePresence>
            {showHint && !reduce && (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-[38%] z-20 h-9 w-9 -ml-[18px] rounded-full border border-white/70 shadow-lg"
                style={{ background: GOLD_GRADIENT }}
                initial={{ opacity: 0, x: -50, y: 0 }}
                animate={{ opacity: [0, 1, 1, 1, 0], x: [-55, 45, -35, 50, -55], y: [-6, 14, 40, 60, -6] }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
              />
            )}
          </AnimatePresence>

          {revealed && <HeartBurst count={18} />}
        </div>

        {/* status line: progress while scratching, couple + venue once revealed */}
        <div className="flex min-h-[4.25rem] flex-col items-center justify-start gap-3" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            {revealed ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-2"
              >
                <p className="font-serif text-xl italic" style={{ color: WINE }}>
                  {t.revealedHint}
                </p>
                {venue && (
                  <p
                    className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white font-sans text-xs font-semibold text-rose-700"
                    style={{ padding: '0.45rem 1rem' }}
                  >
                    <MapPin className="h-3.5 w-3.5 text-rose-500" />
                    {venue}
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div key="progress" exit={{ opacity: 0 }} className="flex flex-col items-center gap-2">
                <div className="h-1 w-40 overflow-hidden rounded-full bg-rose-200/70">
                  <motion.div
                    className="h-full origin-left rounded-full"
                    style={{ background: GOLD_GRADIENT }}
                    animate={{ scaleX: progress }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="h-4 font-sans text-xs text-rose-600/80">{progress > 0.05 ? t.keepGoing : ''}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
          {date && parts && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => {
                if (downloadIcs(couple, date, venue)) {
                  setAdded(true)
                  setTimeout(() => setAdded(false), 2800)
                }
              }}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full font-sans text-sm font-semibold text-white shadow-lg shadow-rose-900/20 transition-colors hover:bg-[#881337]"
              style={{ padding: '0.8rem 1.6rem', backgroundColor: ROSE }}
            >
              {added ? (
                <>
                  <Check className="h-4 w-4 text-emerald-300" />
                  <span>{t.saved}</span>
                </>
              ) : (
                <>
                  <CalendarPlus className="h-4 w-4" />
                  <span>{t.save}</span>
                </>
              )}
            </motion.button>
          )}
          {!revealed && (
            <button
              type="button"
              onClick={() => {
                const c = canvasRef.current
                c?.getContext('2d')?.clearRect(0, 0, c.width, c.height)
                finish()
              }}
              className="cursor-pointer font-sans text-xs font-medium text-rose-700 underline underline-offset-4 transition-colors hover:text-rose-900"
            >
              {t.reveal}
            </button>
          )}
        </div>
      </Reveal>
    </Section>
  )
}

/* ───────────────────────── Countdown rings (dark wine band) ───────────────────────── */

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

function Ring({
  value,
  max,
  label,
  id,
  index,
}: {
  value?: number
  max: number
  label: string
  id: string
  index: number
}) {
  const r = 44
  const c = 2 * Math.PI * r
  const pct = value === undefined ? 0 : Math.min(1, value / max)
  const [prevValue, setPrevValue] = useState<number | undefined>(value)
  const [jumpedUp, setJumpedUp] = useState(false)

  if (value !== prevValue) {
    setJumpedUp(value !== undefined && prevValue !== undefined && value > prevValue)
    setPrevValue(value)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.12, duration: 0.8, ease }}
      className="flex flex-col items-center gap-3"
    >
      <div className="relative aspect-square w-full">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
          <defs>
            <linearGradient id={`ring-${id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={GOLD_LIGHT} />
              <stop offset="100%" stopColor={GOLD} />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r={r} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" strokeWidth="2.5" />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={`url(#ring-${id})`}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
            style={{ transition: jumpedUp ? 'none' : 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="flex font-serif font-medium tabular-nums leading-none text-[clamp(1.25rem,5vw,2.5rem)]"
            style={{ color: '#fde9c4' }}
          >
            {value === undefined ? (
              <span className="text-rose-300/60">--</span>
            ) : (
              String(value)
                .padStart(2, '0')
                .split('')
                .map((ch, ci) => <FlipChar key={ci} char={ch} />)
            )}
          </span>
        </div>
      </div>
      <span className="font-sans text-xs font-medium text-rose-200/80 sm:text-sm">{label}</span>
    </motion.div>
  )
}

function RomanticCountdown({ date, t }: { date: string; t: Record<string, string> }) {
  const currentSecond = useSyncExternalStore(
    subscribeCountdown,
    () => Math.floor(Date.now() / 1000),
    () => null,
  )
  const timeLeft = currentSecond !== null ? getCountdown(date) : null

  if (timeLeft?.isPast) {
    return (
      <p className="text-center font-serif text-2xl italic sm:text-3xl" style={{ color: '#fde9c4' }}>
        {t.began} 🥂
      </p>
    )
  }

  return (
    <div
      className="grid grid-cols-4 gap-2 sm:gap-6"
      style={{ width: '100%', maxWidth: '38rem', marginInline: 'auto' }}
      role="timer"
      aria-live="off"
    >
      <Ring value={timeLeft?.days} max={365} label={t.days} id="d" index={0} />
      <Ring value={timeLeft?.hours} max={24} label={t.hours} id="h" index={1} />
      <Ring value={timeLeft?.minutes} max={60} label={t.minutes} id="m" index={2} />
      <Ring value={timeLeft?.seconds} max={60} label={t.seconds} id="s" index={3} />
    </div>
  )
}

/* ───────────────────────── Story ───────────────────────── */

function HeartPhoto({ photo, couple }: { photo?: Photo; couple: string }) {
  return (
    <div className="relative mx-auto" style={{ width: '100%', maxWidth: '22rem', marginInline: 'auto' }}>
      <motion.div
        aria-hidden
        className="absolute"
        style={{ inset: '-8%' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      >
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2
          return (
            <Heart
              key={i}
              className="absolute h-3 w-3"
              style={{
                left: `${50 + Math.cos(a) * 50}%`,
                top: `${50 + Math.sin(a) * 50}%`,
                color: i % 2 ? GOLD : '#fda4af',
                fill: i % 2 ? GOLD : '#fda4af',
                transform: 'translate(-50%, -50%)',
              }}
            />
          )
        })}
      </motion.div>

      <motion.div
        className="relative aspect-square w-full"
        style={{ filter: 'drop-shadow(0 28px 32px rgba(190,18,60,0.28))' }}
        initial={{ opacity: 0, scale: 0.7 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease }}
      >
        <motion.div
          className="h-full w-full"
          style={{ clipPath: 'url(#heart-clip)' }}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo.url} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-300 to-rose-500">
              <span className="font-serif text-5xl italic text-white">{couple[0]}</span>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

/* ───────────────────────── Events ───────────────────────── */

function RomanticEvents({ events, t }: { events: WeddingEvent[]; t: Record<string, string> }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 65%'] })
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 25 })

  return (
    <div ref={ref} className="relative">
      <div className="absolute bottom-2 left-5 top-2 w-px -translate-x-1/2 bg-rose-200 sm:left-1/2" aria-hidden />
      <motion.div
        className="absolute bottom-2 left-5 top-2 w-0.5 origin-top -translate-x-1/2 rounded-full sm:left-1/2"
        style={{ scaleY, background: `linear-gradient(${GOLD_LIGHT}, ${GOLD})` }}
        aria-hidden
      />

      <ul className="flex list-none flex-col gap-8 sm:gap-14" style={{ padding: 0 }}>
        {events.map((ev, i) => {
          const parts = dateParts(ev.date)
          const left = i % 2 === 0
          return (
            <li
              key={ev.id}
              className="relative grid grid-cols-[2.75rem_1fr] gap-x-0 sm:grid-cols-2 sm:gap-x-[clamp(3rem,8vw,6rem)]"
            >
              <span className="absolute left-5 top-9 z-10 -translate-x-1/2 sm:left-1/2" aria-hidden>
                <motion.span
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, margin: '-40% 0px' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 12 }}
                  className="flex h-7 w-7 items-center justify-center rounded-full border bg-white shadow-md"
                  style={{ borderColor: GOLD }}
                >
                  <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                </motion.span>
              </span>

              <motion.article
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.9, ease }}
                className={`flex flex-col gap-5 rounded-3xl border border-rose-200/90 bg-white/90 shadow-lg shadow-rose-200/30 ${left ? 'col-start-2 sm:col-start-1' : 'col-start-2'
                  }`}
                style={{ padding: 'clamp(1.35rem, 3.5vw, 2rem)' }}
              >
                <div className="flex items-start gap-4">
                  {parts && (
                    <div
                      className="flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-full text-center text-white shadow-md"
                      style={{ background: 'linear-gradient(135deg, #fb7185, #9f1239)' }}
                    >
                      <span className="font-serif text-2xl leading-none">{parts.day}</span>
                      <span className="font-sans text-[0.65rem] opacity-90">{parts.month}</span>
                    </div>
                  )}
                  <div className="flex min-w-0 flex-col gap-2">
                    <h3 className="font-serif text-2xl font-medium leading-tight text-rose-950 sm:text-[1.7rem]">
                      {ev.title}
                    </h3>
                    <span
                      className="inline-flex w-fit items-center gap-1.5 rounded-full bg-rose-100 font-sans text-xs font-semibold text-rose-800"
                      style={{ padding: '0.3rem 0.75rem' }}
                    >
                      <Clock className="h-3 w-3" />
                      {ev.time ? formatTime(ev.time) : 'Celebration'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 font-sans text-sm text-rose-700">
                  {ev.date && (
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 shrink-0 text-rose-500" />
                      {formatDate(ev.date)}
                    </p>
                  )}
                  {ev.venue && (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-rose-500" />
                      {ev.venue}
                    </p>
                  )}
                </div>

                {ev.mapsUrl && (
                  <a
                    href={ev.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-rose-300 font-sans text-sm font-semibold text-rose-800 transition-colors hover:bg-rose-600 hover:text-white"
                    style={{ padding: '0.6rem 1.15rem' }}
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    {t.map}
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

/* ───────────────────────── Gallery (polaroids) ───────────────────────── */

const CAPTIONS = ['Forever in love', 'Our happy place', 'Every moment', 'Together always', 'Pure joy', 'Our little forever']
const TILTS = [-3, 2, -1.5, 3, -2.5, 1.5]

function RomanticGallery({ photos }: { photos: Photo[] }) {
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
        className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-4"
        style={{ paddingBottom: '1rem' }}
      >
        {photos.map((p, idx) => {
          const tilt = TILTS[idx % TILTS.length]
          return (
            <motion.button
              key={p.id}
              type="button"
              onClick={() => {
                setDir(1)
                setOpen(idx)
              }}
              initial={{ opacity: 0, y: 50, rotate: 0 }}
              whileInView={{ opacity: 1, y: 0, rotate: tilt }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.9, delay: (idx % 4) * 0.1, ease }}
              whileHover={{ rotate: 0, scale: 1.04, y: -6, zIndex: 5 }}
              aria-label={`Open photo ${idx + 1}`}
              className="group relative block w-full cursor-zoom-in bg-white text-center shadow-lg shadow-rose-300/40"
              style={{ padding: '0.55rem 0.55rem 1.1rem', borderRadius: '0.35rem' }}
            >
              <span
                aria-hidden
                className="absolute left-1/2 top-0 h-5 w-16 -translate-x-1/2 -translate-y-1/2 rotate-[-4deg]"
                style={{ background: 'rgba(245,210,138,0.6)' }}
              />
              <span className="block aspect-[4/5] w-full overflow-hidden bg-rose-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt={`Wedding moment ${idx + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </span>
              <span
                className="block font-serif text-sm italic text-rose-800"
                style={{ paddingTop: '0.7rem' }}
              >
                {CAPTIONS[idx % CAPTIONS.length]}
              </span>
            </motion.button>
          )
        })}
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
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-rose-950/90 backdrop-blur-md"
            style={{ padding: 'clamp(1rem, 4vw, 2.5rem)' }}
          >
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Close"
              className="absolute right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
              style={{ top: 'max(1rem, env(safe-area-inset-top))' }}
            >
              <X className="h-6 w-6" />
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
                  className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={(e) => {
                    e.stopPropagation()
                    go(1)
                  }}
                  className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
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
                className="max-h-[85svh] max-w-full select-none rounded-2xl border-4 border-white/20 object-contain shadow-2xl"
                draggable={false}
              />
            </AnimatePresence>
            <p
              className="absolute left-1/2 -translate-x-1/2 font-sans text-xs tracking-[0.3em] text-white/70"
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

/* ───────────────────────── Guestbook ───────────────────────── */

type Wish = { id: number; name: string; text: string }

function GuestbookWishes({ couple, t }: { couple: string; t: Record<string, string> }) {
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [wishes, setWishes] = useState<Wish[]>([
    { id: 1, name: 'Anjali', text: 'Wishing you both endless love, laughter, and joy in this beautiful new chapter! 💕' },
    { id: 2, name: 'Rahul & Family', text: 'So thrilled to celebrate your special day! Congratulations to the beautiful couple! 🥂' },
  ])
  const [sent, setSent] = useState(0)
  const MAX = 240

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    const text = message.trim()
    if (!text) return
    setWishes((w) => [{ id: Date.now(), name: name.trim() || 'A well-wisher', text }, ...w])
    setMessage('')
    setSent((n) => n + 1)
  }

  const field: React.CSSProperties = { padding: '0.85rem 1.1rem' }

  return (
    <Section max="40rem" bg="rgba(255,255,255,0.7)" className="border-y border-rose-100">
      <Heading title={t.wishes} subtitle={t.wishesSub.replace('{couple}', couple)} />

      <Reveal className="flex flex-col gap-10">
        <form onSubmit={handleSend} className="relative flex flex-col gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.namePlaceholder}
            maxLength={40}
            className="w-full rounded-full border border-rose-200 bg-rose-50/40 font-sans text-sm text-rose-950 placeholder-rose-400 outline-none transition-all focus:ring-2 focus:ring-rose-400/50"
            style={field}
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, MAX))}
            rows={4}
            placeholder={t.wishPlaceholder}
            className="w-full resize-none rounded-3xl border border-rose-200 bg-rose-50/40 font-sans text-sm text-rose-950 placeholder-rose-400 shadow-inner outline-none transition-all focus:ring-2 focus:ring-rose-400/50"
            style={{ padding: '1rem 1.1rem' }}
          />
          <div className="flex items-center justify-between gap-4">
            <span className="font-sans text-xs text-rose-400">
              {message.length}/{MAX}
            </span>
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={!message.trim()}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full font-sans text-sm font-semibold text-white shadow-md shadow-rose-900/15 transition-colors hover:bg-[#881337] disabled:cursor-not-allowed disabled:opacity-50"
                style={{ padding: '0.75rem 1.6rem', backgroundColor: ROSE }}
              >
                <Send className="h-3.5 w-3.5" />
                {t.send}
              </motion.button>
              {sent > 0 && <HeartBurst key={sent} count={10} />}
            </div>
          </div>
          <AnimatePresence>
            {sent > 0 && (
              <motion.p
                key={sent}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-rose-700"
              >
                <Heart className="h-3.5 w-3.5 animate-pulse fill-rose-600 text-rose-600" />
                {t.thanks}
              </motion.p>
            )}
          </AnimatePresence>
        </form>

        <ul className="flex list-none flex-col gap-3" style={{ padding: 0 }}>
          <AnimatePresence initial={false}>
            {wishes.map((w) => (
              <motion.li
                key={w.id}
                layout
                initial={{ opacity: 0, y: -16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease }}
                className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/70"
                style={{ padding: '1rem 1.15rem' }}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-serif text-sm text-white"
                  style={{ background: 'linear-gradient(135deg, #fb7185, #9f1239)' }}
                  aria-hidden
                >
                  {w.name[0]?.toUpperCase()}
                </span>
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="font-sans text-xs font-semibold text-rose-800">{w.name}</p>
                  <p className="font-sans text-sm italic leading-relaxed text-rose-900">{w.text}</p>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </Reveal>
    </Section>
  )
}

/* ───────────────────────── Music + language ───────────────────────── */
function RomanticMusicPlayer({ music }: { music?: MusicItem | null }) {
  return <WeddingMusicPlayer music={music} accent="#fb7185" primary="#9f1239" />
}

function LanguageSwitch({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  const options: { id: Lang; label: string }[] = [
    { id: 'EN', label: 'English' },
    { id: 'ML', label: 'മലയാളം' },
  ]
  return (
    <div
      className="fixed z-40 flex items-center rounded-full border border-rose-200 bg-white/90 shadow-md shadow-rose-950/10 backdrop-blur-md"
      style={{
        left: 'max(1rem, env(safe-area-inset-left))',
        bottom: 'max(1rem, env(safe-area-inset-bottom))',
        padding: '0.2rem',
      }}
      role="group"
      aria-label="Language"
    >
      {options.map((o) => {
        const active = lang === o.id
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            aria-pressed={active}
            className={`relative cursor-pointer rounded-full font-sans text-xs font-medium transition-colors ${active ? 'text-white' : 'text-rose-800'
              }`}
            style={{ padding: '0.45rem 0.9rem' }}
          >
            {active && (
              <motion.span
                layoutId="lang-pill"
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: ROSE }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────
   MAIN COMPONENT: FloralRomanticTemplate
   Blush + wine, champagne-gold accents, blooming garlands
   ────────────────────────────────────────────────────────── */
export default function FloralRomanticTemplate({ wedding }: { wedding: WeddingData }) {
  const [lang, setLang] = useState<Lang>('EN')
  const t = T[lang]

  const groom = wedding.groomName || 'Nandagopan'
  const bride = wedding.brideName || 'Nidhisree'
  const couple = `${groom} & ${bride}`

  const theme = wedding.theme || {
    primaryColor: '#9f1239',
    secondaryColor: '#f43f5e',
    backgroundColor: '#fdf2f8',
    accentColor: '#fb7185',
    fontFamily: 'cormorant',
  }
  const primary = theme.primaryColor || '#9f1239'
  const secondary = theme.secondaryColor || '#f43f5e'
  const accent = theme.accentColor || '#fb7185'
  const bg = theme.backgroundColor || '#fdf2f8'
  const fontFamily = theme.fontFamily === 'inter' ? 'Inter, sans-serif' : '"Cormorant Garamond", serif'

  const coverPhoto = wedding.gallery?.find((g) => g.isCover) || wedding.gallery?.[0]

  const parentsLine = (kind: 'son' | 'daughter', parents: string) =>
    lang === 'EN' ? `${kind === 'son' ? t.son : t.daughter} ${parents}` : `${parents} ദമ്പതികളുടെ ${t[kind]}`

  /* Page progress + hero parallax */
  const { scrollYProgress: pageProgress } = useScroll()
  const progress = useSpring(pageProgress, { stiffness: 120, damping: 28 })

  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const photoY = useTransform(heroProgress, [0, 1], ['0%', '16%'])
  const contentY = useTransform(heroProgress, [0, 1], ['0%', '-10%'])
  const contentOpacity = useTransform(heroProgress, [0, 0.7], [1, 0])

  const nameStyle: React.CSSProperties = { textShadow: '0 4px 20px rgba(0,0,0,0.55)', color: '#f7e1ae' }

  return (
    <MotionConfig reducedMotion="user">
      <HeartClipDefs />
      <div
        className="relative min-h-screen w-full overflow-x-hidden font-serif selection:bg-rose-200 selection:text-rose-900"
        style={{
          ['--primary' as string]: primary,
          ['--secondary' as string]: secondary,
          ['--accent' as string]: accent,
          ['--bg' as string]: bg,
          backgroundColor: bg,
          fontFamily,
          color: primary,
        }}
      >
        {/* Scroll progress */}
        <motion.div
          aria-hidden
          className="fixed inset-x-0 top-0 z-[55] h-[3px] origin-left"
          style={{ scaleX: progress, background: `linear-gradient(to right, ${GOLD_LIGHT}, ${GOLD}, ${primary})` }}
        />

        <RomanticMusicPlayer music={wedding.music} />
        <LanguageSwitch lang={lang} onChange={setLang} />

        {/* ───────── HERO ───────── */}
        <section
          ref={heroRef}
          className="relative flex min-h-[100svh] flex-col items-center justify-between overflow-hidden text-center"
          style={{ padding: 'clamp(4.5rem, 10vh, 6rem) 1.25rem clamp(3rem, 8vh, 5rem)' }}
        >
          <div className="absolute inset-0 z-0">
            {coverPhoto ? (
              <motion.div className="absolute inset-x-0 -bottom-[8%] -top-[8%]" style={{ y: photoY }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <motion.img
                  src={coverPhoto.url}
                  alt=""
                  className="h-full w-full object-cover"
                  initial={{ scale: 1.18 }}
                  animate={{ scale: 1.04 }}
                  transition={{ duration: 20, ease: 'easeOut' }}
                />
              </motion.div>
            ) : (
              <div className="h-full w-full bg-gradient-to-b from-[#fce7f3] via-[#fda4af]/60 to-[#fff1f2]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-stone-900/60 via-rose-950/40 to-stone-900/80" />
            <div
              className="absolute inset-0"
              style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(244,114,182,0.2), transparent 60%)' }}
            />
          </div>

          <FloralCorner delay={0.4} />
          <FloralCorner flip delay={0.7} />
          <RomanticFloatingParticles />

          <motion.div
            style={{ y: contentY, opacity: contentOpacity }}
            className="relative z-20 flex w-full flex-1 flex-col items-center justify-between gap-8"
          >
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="flex w-full flex-1 flex-col items-center justify-between gap-8"
              style={{ maxWidth: '56rem', marginInline: 'auto' }}
            >
              <motion.div variants={fadeUp} className="flex flex-col items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-sm">
                  <Heart className="h-4 w-4 fill-white text-white" />
                </span>
                <p className="max-w-xl font-serif text-lg italic tracking-wide text-white/95 drop-shadow-md text-balance sm:text-2xl">
                  {t.invite}
                </p>
                <HeartDivider light />
              </motion.div>

              <div className="flex flex-col items-center gap-3">
                <div className="flex flex-col items-center gap-2">
                  <h1
                    className="font-serif font-normal italic leading-[1.05] tracking-wide text-[clamp(2.75rem,10vw,6.5rem)]"
                    style={nameStyle}
                  >
                    <MaskWords text={groom} />
                  </h1>
                  <motion.p
                    variants={fadeUp}
                    className="font-serif text-sm italic tracking-wider text-white/90 drop-shadow sm:text-base"
                  >
                    {parentsLine('son', GROOM_PARENTS)}
                  </motion.p>
                </div>

                <motion.span
                  variants={{
                    hidden: { opacity: 0, scale: 0.5, rotate: -20 },
                    show: { opacity: 0.95, scale: 1, rotate: 0, transition: { duration: 0.9, ease } },
                  }}
                  className="font-serif text-4xl font-light italic drop-shadow-md sm:text-6xl"
                  style={{ paddingBlock: '0.1em', color: '#f7e1ae' }}
                  aria-label="and"
                >
                  &amp;
                </motion.span>

                <div className="flex flex-col items-center gap-2">
                  <h1
                    className="font-serif font-normal italic leading-[1.05] tracking-wide text-[clamp(2.75rem,10vw,6.5rem)]"
                    style={nameStyle}
                  >
                    <MaskWords text={bride} />
                  </h1>
                  <motion.p
                    variants={fadeUp}
                    className="font-serif text-sm italic tracking-wider text-white/90 drop-shadow sm:text-base"
                  >
                    {parentsLine('daughter', BRIDE_PARENTS)}
                  </motion.p>
                </div>
              </div>

              <motion.div variants={fadeUp} className="flex flex-col items-center gap-6">
                <div className="flex flex-wrap items-center justify-center gap-3 font-sans text-sm tracking-wide text-white/95">
                  {wedding.weddingDate && (
                    <span
                      className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 backdrop-blur-md"
                      style={{ padding: '0.55rem 1.1rem' }}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(wedding.weddingDate)}
                    </span>
                  )}
                  {wedding.venueName && (
                    <span
                      className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 backdrop-blur-md"
                      style={{ padding: '0.55rem 1.1rem' }}
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      {wedding.venueName}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-center text-white/80">
                  <span className="font-sans text-xs font-light tracking-[0.2em] drop-shadow">{t.scroll}</span>
                  <motion.span
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <ChevronDown className="h-4 w-4 text-white drop-shadow" />
                  </motion.span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* ───────── SCRATCH TO REVEAL ───────── */}
        <ScratchToRevealCard date={wedding.weddingDate} couple={couple} venue={wedding.venueName} t={t} />

        {/* ───────── COUNTDOWN ───────── */}
        {wedding.weddingDate && (
          <Section max="48rem" bg={`linear-gradient(160deg, ${WINE}, ${WINE_DEEP})`}>
            <Reveal className="flex flex-col items-center gap-10 text-center">
              <h2 className="font-serif text-2xl italic text-balance sm:text-3xl" style={{ color: '#fde9c4' }}>
                {t.countdown}
              </h2>
              <RomanticCountdown date={wedding.weddingDate} t={t} />
            </Reveal>
          </Section>
        )}

        {/* ───────── STORY ───────── */}
        {wedding.story && (
          <Section max="68rem">
            <Heading title={t.story} />
            <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16">
              <HeartPhoto photo={coverPhoto} couple={couple} />
              <Reveal delay={0.1}>
                <div
                  className="relative flex flex-col gap-6 rounded-3xl border border-rose-200/80 bg-white/85 text-center shadow-xl shadow-rose-200/40 md:text-left"
                  style={{ padding: 'clamp(1.75rem, 4vw, 3rem)' }}
                >
                  <span
                    aria-hidden
                    className="select-none font-serif text-6xl leading-[0.5]"
                    style={{ color: GOLD, opacity: 0.6 }}
                  >
                    &ldquo;
                  </span>
                  <p className="font-serif text-lg italic leading-relaxed text-rose-900 sm:text-xl lg:text-[1.35rem]">
                    {wedding.story}
                  </p>
                  <div className="flex items-center justify-center gap-2 md:justify-start">
                    <Heart className="h-3 w-3" style={{ color: GOLD, fill: GOLD }} />
                    <span className="font-sans text-sm text-rose-600">{couple}</span>
                    <Heart className="h-3 w-3" style={{ color: GOLD, fill: GOLD }} />
                  </div>
                </div>
              </Reveal>
            </div>
          </Section>
        )}

        {/* ───────── EVENTS ───────── */}
        {wedding.events && wedding.events.length > 0 && (
          <Section max="60rem" bg="linear-gradient(to bottom, #fdf2f8, #fff1f2, #fdf2f8)">
            <Heading title={t.schedule} subtitle={t.scheduleSub} />
            <RomanticEvents events={wedding.events} t={t} />
          </Section>
        )}

        {/* ───────── GALLERY ───────── */}
        {wedding.gallery && wedding.gallery.length > 0 && (
          <Section max="70rem">
            <Heading title={t.gallery} subtitle={t.gallerySub} />
            <RomanticGallery photos={wedding.gallery} />
          </Section>
        )}

        {/* ───────── GUESTBOOK ───────── */}
        <GuestbookWishes couple={couple} t={t} />

        {/* ───────── CELEBRATE BANNER ───────── */}
        <Section max="44rem" bg="linear-gradient(to bottom, #fdf2f8, #fff1f2)" className="overflow-hidden">
          <div className="relative flex flex-col items-center gap-6 text-center">
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute bottom-0 text-rose-300"
                  style={{ left: `${(i * 13 + 6) % 96}%`, fontSize: 12 + (i % 3) * 6 }}
                  animate={{ y: [0, -260], opacity: [0, 0.8, 0] }}
                  transition={{ duration: 6 + (i % 4), delay: i * 0.7, repeat: Infinity, ease: 'easeOut' }}
                >
                  ♥
                </motion.span>
              ))}
            </div>

            <Reveal className="relative flex flex-col items-center gap-6">
              <h2
                className="font-serif font-normal italic leading-[1.1] text-balance text-[clamp(2rem,6vw,3.75rem)]"
                style={{ color: ROSE }}
              >
                {t.cant}
              </h2>
              <svg viewBox="0 0 200 20" className="h-5 w-48" style={{ color: GOLD }} fill="none" aria-hidden>
                <motion.path
                  d="M5 12 C 40 2, 70 22, 105 12 S 170 2, 195 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.6, ease }}
                />
              </svg>
              <p className="font-serif text-2xl italic text-rose-800/90 sm:text-3xl">{couple}</p>
            </Reveal>
          </div>
        </Section>

        {/* ───────── RSVP ───────── */}
        {wedding.theme?.rsvpEnabled !== false && (
          <Section max="36rem">
            <Heading title={t.rsvp} subtitle={t.rsvpSub} />
            <Reveal delay={0.1}>
              <div
                className="relative rounded-3xl border border-rose-200 bg-white shadow-xl shadow-rose-200/50"
                style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)' }}
              >
                <RSVPForm weddingId={wedding.id} primaryColor={primary} accentColor={accent} />
              </div>
            </Reveal>
          </Section>
        )}

        {/* ───────── FOOTER ───────── */}
        <footer
          className="flex flex-col items-center gap-2 border-t border-rose-200/70 bg-white/60 text-center"
          style={{ padding: '2.5rem 1.25rem max(2.5rem, calc(env(safe-area-inset-bottom) + 3.5rem))' }}
        >
          <HeartDivider gold />
          <p className="font-serif text-lg italic text-rose-900">{couple}</p>
          <p className="font-sans text-xs text-rose-500/80">
            {t.footer}{' '}
            <Link href="/" className="underline hover:text-rose-700">
              Wedora
            </Link>
          </p>
        </footer>
      </div>
    </MotionConfig>
  )
}