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
  Volume2,
  Send,
  CalendarPlus,
  Check,
  Sparkles,
} from 'lucide-react'
import { WeddingData, MusicItem } from '@/types/wedding'
import { formatDate, formatTime, getCountdown } from '@/lib/utils'
import RSVPForm from '@/components/rsvp/RSVPForm'

type Photo = NonNullable<WeddingData['gallery']>[number]
type WeddingEvent = NonNullable<WeddingData['events']>[number]
type Lang = 'EN' | 'ML'

const ease = [0.22, 1, 0.36, 1] as const

const ROSE = '#9f1239'
const ROSE_SOFT = '#fb7185'

// Demo family lines (replace with real fields when your data model has them)
const GROOM_PARENTS = 'Mr. Pavithran & Mrs. Mridhula'
const BRIDE_PARENTS = 'Mr. Pradeepan & Mrs. Rethi'


const SECTION_PAD: React.CSSProperties = {
  padding: 'clamp(4.5rem, 10vw, 8rem) clamp(1.25rem, 5vw, 3rem)',
}

/* ───────────────────────── Copy (EN / ML) ───────────────────────── */

const T: Record<Lang, Record<string, string>> = {
  EN: {
    invite: 'You are invited to be a part of our special moment....',
    son: 'Son of',
    daughter: 'Daughter of',
    scroll: 'Scroll',
    scratchTitle: 'Scratch to Reveal',
    scratchHint: 'Scratch the heart to discover our date',
    save: 'Add to Calendar',
    saved: 'Added to your calendar!',
    reveal: 'Reveal without scratching',
    countdown: 'Counting down to our forever',
    story: 'Our Love Story',
    schedule: 'Celebration Schedule',
    scheduleSub: 'Every moment crafted with love and blessings',
    gallery: 'Moments Captured',
    gallerySub: 'Glimpses of smiles, laughter, and endless love',
    wishes: 'Send Your Warm Wishes',
    wishesSub: 'Leave a blessing or love note for {couple}',
    wishPlaceholder: 'Write your wishes...',
    namePlaceholder: 'Your name (optional)',
    send: 'Send Message',
    thanks: 'Thank you for your blessings!',
    cant: "We can't wait to celebrate with you!",
    rsvp: 'RSVP',
    rsvpSub: 'Please let us know if you can make it',
    map: 'View Map',
    footer: 'Create your own wedding invitation on',
  },
  ML: {
    invite: 'ഞങ്ങളുടെ ഈ സുന്ദര നിമിഷത്തിൽ പങ്കുചേരാൻ നിങ്ങളെ ക്ഷണിക്കുന്നു....',
    son: 'മകൻ',
    daughter: 'മകൾ',
    scroll: 'താഴേക്ക്',
    scratchTitle: 'ചുരണ്ടി നോക്കൂ',
    scratchHint: 'ഹൃദയം ചുരണ്ടി ഞങ്ങളുടെ തീയതി അറിയൂ',
    save: 'കലണ്ടറിൽ ചേർക്കുക',
    saved: 'കലണ്ടറിൽ ചേർത്തു!',
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

function HeartDivider({ light = false }: { light?: boolean }) {
  const line = light ? 'rgba(255,255,255,0.45)' : '#fda4af'
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
      <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
        <Heart
          className="h-3.5 w-3.5"
          style={{ color: light ? '#fff' : ROSE_SOFT, fill: light ? '#fff' : ROSE_SOFT }}
        />
      </motion.span>
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

function Heading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Reveal
      className="flex flex-col items-center gap-4 text-center"
      style={{ marginBottom: 'clamp(2.5rem, 6vw, 4.5rem)' }}
    >
      <HeartDivider />
      <h2
        className="font-serif font-normal italic leading-[1.1] tracking-wide text-balance text-[clamp(2rem,5.5vw,3.75rem)]"
        style={{ color: '#4c0519' }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="max-w-md font-sans text-sm leading-relaxed text-rose-700/80 sm:text-base text-balance">
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
        const d = 70 + (i % 3) * 28
        return (
          <motion.span
            key={i}
            className="absolute block text-base"
            style={{ color: i % 2 ? '#f43f5e' : '#fb7185' }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
            animate={{ x: Math.cos(a) * d, y: Math.sin(a) * d - 20, opacity: 0, scale: 1.1 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
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

/* ───────────────────────── Petals & doves ───────────────────────── */

function RomanticFloatingParticles() {
  const reduce = useReducedMotion()
  if (reduce) return null
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden>
      {Array.from({ length: 16 }).map((_, i) => {
        const left = (i * 17 + 5) % 96
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
              opacity: 0.75,
            }}
            initial={{ y: '-5vh', opacity: 0 }}
            animate={{
              y: ['0vh', '110vh'],
              x: [0, (i % 2 === 0 ? 1 : -1) * 40, 0],
              rotate: [0, 180, 360],
              rotateX: [0, 160, 0],
              opacity: [0, 0.8, 0.8, 0],
            }}
            transition={{
              duration: 10 + (i % 5) * 2.5,
              delay: 1.5 + ((i * 0.8) % 6),
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )
      })}
      {[0, 1].map((bird) => (
        <motion.span
          key={bird}
          className="absolute -scale-x-100 text-sm text-white/40"
          style={{ top: `${24 + bird * 14}%` }}
          initial={{ x: '-10vw', opacity: 0 }}
          animate={{
            x: ['-10vw', '110vw'],
            y: [0, -14, 0, 14, 0],
            opacity: [0, 0.6, 0.6, 0],
          }}
          transition={{ duration: 26 + bird * 8, delay: 3 + bird * 9, repeat: Infinity, ease: 'linear' }}
        >
          🕊
        </motion.span>
      ))}
    </div>
  )
}

/* ───────────────────────── Scratch to reveal ───────────────────────── */

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

function downloadIcs(couple: string, date: string, venue?: string | null) {
  const ymd = ymdFromDate(date)
  if (!ymd) return false
  const esc = (s: string) => s.replace(/([,;\\])/g, '\\$1')
  const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ForeverVows//Wedding//EN',
    'BEGIN:VEVENT',
    `UID:${ymd.start}-${Math.random().toString(36).slice(2)}@forevervows`,
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
  const W = 280
  const H = 250
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const initialOpaque = useRef(0)
  const last = useRef<{ x: number; y: number } | null>(null)
  const moves = useRef(0)
  const [revealed, setRevealed] = useState(false)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = W * dpr // resetting width also resets the transform
    canvas.height = H * dpr
    canvas.style.width = `${W}px`
    canvas.style.height = `${H}px`
    ctx.scale(dpr, dpr)

    ctx.save()
    drawHeartPath(ctx, W, H)
    ctx.clip()
    const grad = ctx.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, '#f472b6')
    grad.addColorStop(0.3, '#fbcfe8')
    grad.addColorStop(0.5, '#ec4899')
    grad.addColorStop(0.7, '#f472b6')
    grad.addColorStop(1, '#db2777')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = Math.random() > 0.4 ? 'rgba(255,255,255,0.85)' : 'rgba(251,207,232,0.9)'
      ctx.beginPath()
      ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.shadowColor = 'rgba(157, 23, 77, 0.6)'
    ctx.shadowBlur = 6
    ctx.fillText('✨ SCRATCH HERE ✨', W / 2, H * 0.48)
    ctx.restore()

    // Baseline: how much of the canvas is actually covered by the heart.
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    let n = 0
    for (let i = 3; i < data.length; i += 32) if (data[i] > 20) n++
    initialOpaque.current = n
  }, [])

  const checkReveal = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || revealed || initialOpaque.current === 0) return
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    let n = 0
    for (let i = 3; i < data.length; i += 32) if (data[i] > 20) n++
    if (1 - n / initialOpaque.current > 0.45) setRevealed(true)
  }, [revealed])

  const scratchAt = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || revealed) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    ctx.globalCompositeOperation = 'destination-out'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 44
    ctx.beginPath()
    if (last.current) {
      ctx.moveTo(last.current.x, last.current.y)
      ctx.lineTo(x, y)
      ctx.stroke()
    } else {
      ctx.arc(x, y, 22, 0, Math.PI * 2)
      ctx.fill()
    }
    last.current = { x, y }
    moves.current += 1
    if (moves.current % 12 === 0) checkReveal()
  }

  const endStroke = () => {
    last.current = null
    checkReveal()
  }

  const parts = date ? ymdFromDate(date) : null

  return (
    <Section
      max="40rem"
      bg="linear-gradient(to bottom, rgba(253,242,248,0.6), #fff1f2 50%, #fdf2f8)"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <Heading title={t.scratchTitle} subtitle={t.scratchHint} />
      </div>

      <Reveal className="flex flex-col items-center gap-8">
        {/* Heart */}
        <div className="relative select-none" style={{ width: W, height: H, maxWidth: '100%' }}>
          <motion.div
            aria-hidden
            className="absolute rounded-full bg-rose-300/40 blur-3xl"
            style={{ inset: '10%' }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-0"
            style={{ filter: 'drop-shadow(0 22px 28px rgba(190,18,60,0.25))' }}
            animate={{ scale: [1, 1.03, 1, 1.05, 1] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Secret content, heart-shaped */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center"
              style={{
                clipPath: 'url(#heart-clip)',
                background: 'linear-gradient(160deg, #ffffff, #fff1f2 60%, #ffe4e6)',
                paddingTop: '16%',
              }}
            >
              <span className="font-sans text-[0.55rem] font-bold uppercase tracking-[0.25em] text-rose-500">
                Save The Date
              </span>
              <p
                className="font-serif italic leading-tight text-rose-950 text-balance"
                style={{ maxWidth: '58%', fontSize: '1.2rem' }}
              >
                {couple}
              </p>
              {date && (
                <p className="font-serif text-base italic text-rose-800">{formatDate(date)}</p>
              )}
            </div>

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
              aria-label="Scratch card"
              className={`absolute inset-0 cursor-pointer touch-none transition-opacity duration-700 ${revealed ? 'pointer-events-none opacity-0' : 'opacity-100'
                }`}
            />
          </motion.div>
          {revealed && <HeartBurst />}
        </div>

        <AnimatePresence>
          {revealed && venue && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white font-sans text-xs font-semibold text-rose-700"
              style={{ padding: '0.45rem 1rem' }}
            >
              <MapPin className="h-3.5 w-3.5 text-rose-500" />
              {venue}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
          {date && parts && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => {
                if (downloadIcs(couple, date, venue)) {
                  setAdded(true)
                  setTimeout(() => setAdded(false), 2800)
                }
              }}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full font-sans text-xs font-semibold uppercase tracking-widest text-white shadow-lg shadow-rose-900/20 transition-colors hover:bg-[#881337]"
              style={{ padding: '0.85rem 1.75rem', backgroundColor: ROSE }}
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
                const canvas = canvasRef.current
                canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
                setRevealed(true)
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

/* ───────────────────────── Countdown rings ───────────────────────── */

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
  index,
}: {
  value?: number
  max: number
  label: string
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
      className="flex flex-col items-center gap-2"
    >
      <div className="relative aspect-square w-full">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
          <defs>
            <linearGradient id={`ring-${label}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#9f1239" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r={r} fill="rgba(255,255,255,0.85)" stroke="#fecdd3" strokeWidth="3" />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={`url(#ring-${label})`}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
            style={{ transition: jumpedUp ? 'none' : 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="flex font-serif font-medium tabular-nums leading-none text-[clamp(1.25rem,5vw,2.5rem)]"
            style={{ color: '#4c0519' }}
          >
            {value === undefined ? (
              <span className="text-rose-300">--</span>
            ) : (
              String(value)
                .padStart(2, '0')
                .split('')
                .map((ch, ci) => <FlipChar key={ci} char={ch} />)
            )}
          </span>
        </div>
      </div>
      <span className="font-sans text-[0.6rem] font-semibold uppercase tracking-wider text-rose-600/80 sm:text-xs">
        {label}
      </span>
    </motion.div>
  )
}

function RomanticCountdown({ date }: { date: string }) {
  const currentSecond = useSyncExternalStore(
    subscribeCountdown,
    () => Math.floor(Date.now() / 1000),
    () => null
  )
  const timeLeft = currentSecond !== null ? getCountdown(date) : null

  if (timeLeft?.isPast) {
    return (
      <p className="text-center font-serif text-2xl italic text-rose-900 sm:text-3xl">
        The celebration has begun! 🥂
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
      <Ring value={timeLeft?.days} max={365} label="Days" index={0} />
      <Ring value={timeLeft?.hours} max={24} label="Hours" index={1} />
      <Ring value={timeLeft?.minutes} max={60} label="Minutes" index={2} />
      <Ring value={timeLeft?.seconds} max={60} label="Seconds" index={3} />
    </div>
  )
}

/* ───────────────────────── Story ───────────────────────── */

function HeartPhoto({ photo, couple }: { photo?: Photo; couple: string }) {
  return (
    <div className="relative mx-auto" style={{ width: '100%', maxWidth: '22rem', marginInline: 'auto' }}>
      {/* Orbiting hearts */}
      <motion.div
        aria-hidden
        className="absolute"
        style={{ inset: '-8%' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      >
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2
          return (
            <Heart
              key={i}
              className="absolute h-3 w-3 text-rose-300"
              style={{
                left: `${50 + Math.cos(a) * 50}%`,
                top: `${50 + Math.sin(a) * 50}%`,
                fill: i % 2 ? '#fda4af' : '#fb7185',
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
          animate={{ scale: [1, 1.035, 1, 1.05, 1] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
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

function RomanticEvents({ events, t }: { events: WeddingEvent[]; t: Record<string, string> }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 65%'] })
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 25 })

  return (
    <div ref={ref} className="relative">
      <div className="absolute bottom-2 left-5 top-2 w-px -translate-x-1/2 bg-rose-200 sm:left-1/2" aria-hidden />
      <motion.div
        className="absolute bottom-2 left-5 top-2 w-0.5 origin-top -translate-x-1/2 rounded-full sm:left-1/2"
        style={{ scaleY, background: 'linear-gradient(#fda4af, #9f1239)' }}
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
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-rose-200 bg-white shadow-md"
                >
                  <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                </motion.span>
              </span>

              <motion.article
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.9, ease }}
                whileHover={{ y: -4 }}
                className={`flex flex-col gap-5 rounded-3xl border border-rose-200/90 bg-white/90 shadow-lg shadow-rose-200/30 transition-shadow hover:shadow-xl hover:shadow-rose-300/40 ${left ? 'col-start-2 sm:col-start-1' : 'col-start-2'
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
                      <span className="font-sans text-[0.6rem] uppercase tracking-widest opacity-90">
                        {parts.month}
                      </span>
                    </div>
                  )}
                  <div className="flex min-w-0 flex-col gap-2">
                    <h3 className="font-serif text-2xl font-medium leading-tight text-rose-950 sm:text-[1.7rem]">
                      {ev.title}
                    </h3>
                    <span
                      className="inline-flex w-fit items-center gap-1.5 rounded-full bg-rose-100 font-sans text-[0.65rem] font-semibold uppercase tracking-wider text-rose-800"
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
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-rose-300 font-sans text-xs font-semibold uppercase tracking-wider text-rose-800 transition-colors hover:bg-rose-600 hover:text-white"
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
              whileHover={{ rotate: 0, scale: 1.05, y: -8, zIndex: 5 }}
              aria-label={`Open photo ${idx + 1}`}
              className="group relative block w-full cursor-zoom-in bg-white text-center shadow-lg shadow-rose-300/40"
              style={{ padding: '0.55rem 0.55rem 1.1rem', borderRadius: '0.35rem' }}
            >
              {/* washi tape */}
              <span
                aria-hidden
                className="absolute left-1/2 top-0 h-5 w-16 -translate-x-1/2 -translate-y-1/2 rotate-[-4deg] bg-rose-200/70"
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
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                type="submit"
                disabled={!message.trim()}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full font-sans text-xs font-semibold tracking-wider text-white shadow-md shadow-rose-900/15 transition-colors hover:bg-[#881337] disabled:cursor-not-allowed disabled:opacity-50"
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
        transition={{ delay: 1.5, type: 'spring', stiffness: 260, damping: 18 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggle}
        aria-label={playing ? 'Pause music' : 'Play music'}
        aria-pressed={playing}
        className="fixed z-50 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-rose-300/40 text-white shadow-xl shadow-rose-950/25 sm:h-12 sm:w-12"
        style={{
          top: 'max(1rem, env(safe-area-inset-top))',
          right: 'max(1rem, env(safe-area-inset-right))',
          backgroundColor: ROSE,
        }}
      >
        {playing ? (
          <span className="flex h-3.5 items-end gap-0.5" aria-hidden>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1 rounded-full bg-white"
                animate={{ height: [3, 14, 5, 12, 3] }}
                transition={{ duration: 0.9 + i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
          </span>
        ) : (
          <Volume2 className="h-5 w-5" />
        )}
        {playing && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full border-2 border-rose-300"
            animate={{ scale: [1, 1.5], opacity: [0.7, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
      </motion.button>
    </>
  )
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
   Blush curtains, blooming garlands, heart motifs
   ────────────────────────────────────────────────────────── */
export default function FloralRomanticTemplate({ wedding }: { wedding: WeddingData }) {
  const [lang, setLang] = useState<Lang>('EN')
  const t = T[lang]

  const groom = wedding.groomName || 'Nandagopan'
  const bride = wedding.brideName || 'Nidhisree'
  const couple = `${groom} & ${bride}`

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

  const sheer = (side: 'l' | 'r'): React.CSSProperties => ({
    background: `repeating-linear-gradient(90deg, rgba(255,255,255,0.10) 0 14px, rgba(244,114,182,0.14) 14px 28px), linear-gradient(${side === 'l' ? '90deg' : '270deg'
      }, rgba(136,19,55,0.55), rgba(136,19,55,0.15) 60%, transparent)`,
  })

  return (
    <MotionConfig reducedMotion="user">
      <HeartClipDefs />
      <div className="relative min-h-screen w-full overflow-x-hidden bg-[#fdf2f8] font-serif text-[#881337] selection:bg-rose-200 selection:text-rose-900">
        {/* Scroll progress */}
        <motion.div
          aria-hidden
          className="fixed inset-x-0 top-0 z-[55] h-[3px] origin-left"
          style={{ scaleX: progress, background: 'linear-gradient(to right, #fda4af, #f43f5e, #9f1239)' }}
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
            <div className="absolute inset-0 bg-gradient-to-b from-stone-900/60 via-rose-950/40 to-stone-900/75" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 45%, rgba(244,114,182,0.22), transparent 60%)',
              }}
            />
          </div>

          {/* Sheer curtains sweep in from the sides */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[26%] sm:w-[20%]"
            style={sheer('l')}
            initial={{ x: '-100%' }}
            animate={{ x: '0%', skewX: [0, 0.8, 0] }}
            transition={{
              x: { duration: 1.8, ease },
              skewX: { duration: 7, delay: 2, repeat: Infinity, ease: 'easeInOut' },
            }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[26%] sm:w-[20%]"
            style={sheer('r')}
            initial={{ x: '100%' }}
            animate={{ x: '0%', skewX: [0, -0.8, 0] }}
            transition={{
              x: { duration: 1.8, ease },
              skewX: { duration: 7, delay: 2, repeat: Infinity, ease: 'easeInOut' },
            }}
          />

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
              {/* Invite line */}
              <motion.div variants={fadeUp} className="flex flex-col items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-sm">
                  <Heart className="h-4 w-4 fill-white text-white" />
                </span>
                <p className="max-w-xl font-serif text-lg italic tracking-wide text-white/95 drop-shadow-md text-balance sm:text-2xl">
                  {t.invite}
                </p>
                <HeartDivider light />
              </motion.div>

              {/* Names */}
              <div className="flex flex-col items-center gap-3">
                <div className="flex flex-col items-center gap-2">
                  <h1
                    className="font-serif font-normal italic leading-[1.05] tracking-wide text-amber-300 text-[clamp(2.75rem,10vw,6.5rem)]"
                    style={{ textShadow: '0 4px 20px rgba(0,0,0,0.55)' }}
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
                  className="font-serif text-4xl font-light italic text-amber-300 drop-shadow-md sm:text-6xl"
                  style={{ paddingBlock: '0.1em' }}
                  aria-label="and"
                >
                  &amp;
                </motion.span>

                <div className="flex flex-col items-center gap-2">
                  <h1
                    className="font-serif font-normal italic leading-[1.05] tracking-wide text-amber-300 text-[clamp(2.75rem,10vw,6.5rem)]"
                    style={{ textShadow: '0 4px 20px rgba(0,0,0,0.55)' }}
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

              {/* Date / venue + scroll cue */}
              <motion.div variants={fadeUp} className="flex flex-col items-center gap-6">
                <div className="flex flex-wrap items-center justify-center gap-3 font-sans text-xs uppercase tracking-widest text-white/95 sm:text-sm">
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
                  <span className="font-sans text-[0.65rem] font-light uppercase tracking-[0.3em] drop-shadow sm:text-xs">
                    {t.scroll}
                  </span>
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
        <ScratchToRevealCard
          date={wedding.weddingDate}
          couple={couple}
          venue={wedding.venueName}
          t={t}
        />

        {/* ───────── COUNTDOWN ───────── */}
        {wedding.weddingDate && (
          <Section max="48rem" bg="rgba(255,241,242,0.85)" className="border-b border-rose-200/60">
            <Reveal className="flex flex-col items-center gap-10 text-center">
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-rose-700">
                {t.countdown}
              </p>
              <RomanticCountdown date={wedding.weddingDate} />
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
                    className="select-none font-serif text-6xl leading-[0.5] text-rose-300/70"
                  >
                    &ldquo;
                  </span>
                  <p className="font-serif text-lg italic leading-relaxed text-rose-900 sm:text-xl lg:text-[1.35rem]">
                    {wedding.story}
                  </p>
                  <div className="flex items-center justify-center gap-2 md:justify-start">
                    <Heart className="h-3 w-3 fill-rose-400 text-rose-400" />
                    <span className="font-sans text-xs uppercase tracking-widest text-rose-600">{couple}</span>
                    <Heart className="h-3 w-3 fill-rose-400 text-rose-400" />
                  </div>
                </div>
              </Reveal>
            </div>
          </Section>
        )}

        {/* ───────── EVENTS ───────── */}
        {wedding.events && wedding.events.length > 0 && (
          <Section
            max="60rem"
            bg="linear-gradient(to bottom, #fdf2f8, #fff1f2, #fdf2f8)"
          >
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
            {/* rising hearts */}
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
              <Sparkles className="h-6 w-6 text-rose-400" />
              <h2
                className="font-serif font-normal italic leading-[1.1] text-balance text-[clamp(2rem,6vw,3.75rem)]"
                style={{ color: ROSE }}
              >
                {t.cant}
              </h2>
              <svg viewBox="0 0 200 20" className="h-5 w-48 text-rose-400" fill="none" aria-hidden>
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
        <Section max="36rem">
          <Heading title={t.rsvp} subtitle={t.rsvpSub} />
          <Reveal delay={0.1}>
            <div
              className="relative rounded-3xl border border-rose-200 bg-white shadow-xl shadow-rose-200/50"
              style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)' }}
            >
              <RSVPForm weddingId={wedding.id} primaryColor={ROSE} accentColor="#f43f5e" />
            </div>
          </Reveal>
        </Section>

        {/* ───────── FOOTER ───────── */}
        <footer
          className="flex flex-col items-center gap-2 border-t border-rose-200/70 bg-white/60 text-center"
          style={{ padding: '2.5rem 1.25rem max(2.5rem, calc(env(safe-area-inset-bottom) + 3.5rem))' }}
        >
          <HeartDivider />
          <p className="font-serif text-lg italic text-rose-900">{couple}</p>
          <p className="font-sans text-xs text-rose-500/80">
            {t.footer}{' '}
            <Link href="/" className="underline hover:text-rose-700">
              ForeverVows
            </Link>
          </p>
        </footer>
      </div>
    </MotionConfig>
  )
}