'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import {
  motion,
  AnimatePresence,
  MotionConfig,
  useReducedMotion,
} from 'framer-motion'
import {
  MapPin,
  Calendar,
  Clock,
  Heart,
  ChevronDown,
  Navigation,
  X,
  Volume2,
  Globe,
  Sparkles,
  Send,
  CalendarPlus,
  Check,
} from 'lucide-react'
import { WeddingData, MusicItem } from '@/types/wedding'
import { formatDate, formatTime, getCountdown } from '@/lib/utils'
import RSVPForm from '@/components/rsvp/RSVPForm'

type Photo = NonNullable<WeddingData['gallery']>[number]

/* ─── Floating Petals & Flying Birds Particles ─── */
function RomanticFloatingParticles() {
  const reduce = useReducedMotion()
  if (reduce) return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-10" aria-hidden>
      {/* Floating Rose Petals */}
      {Array.from({ length: 18 }).map((_, i) => {
        const left = (i * 17 + 5) % 95
        const size = 10 + (i % 4) * 4
        const duration = 9 + (i % 5) * 2.5
        const delay = (i * 0.8) % 6

        return (
          <motion.div
            key={`petal-${i}`}
            className="absolute -top-10 opacity-70"
            style={{
              left: `${left}%`,
              width: size,
              height: size * 1.3,
              borderRadius: '60% 40% 60% 40% / 70% 50% 50% 30%',
              background: 'linear-gradient(135deg, #fbcfe8, #f43f5e, #be185d)',
              filter: 'blur(0.2px)',
            }}
            initial={{ y: '-5vh', rotate: 0, opacity: 0 }}
            animate={{
              y: ['0vh', '110vh'],
              x: [0, (i % 2 === 0 ? 1 : -1) * 35, 0],
              rotate: [0, 180, 360],
              opacity: [0, 0.8, 0.8, 0],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )
      })}

      {/* Subtle Flying Doves / Birds Silhouette across horizon */}
      {[0, 1, 2].map((bird) => (
        <motion.div
          key={`bird-${bird}`}
          className="absolute text-rose-200/40 text-xs pointer-events-none"
          style={{ top: `${25 + bird * 12}%` }}
          initial={{ x: '-10vw', y: 0, opacity: 0 }}
          animate={{
            x: ['-10vw', '110vw'],
            y: [0, -15, 0, 15, 0],
            opacity: [0, 0.6, 0.6, 0],
          }}
          transition={{
            duration: 22 + bird * 6,
            delay: bird * 5,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <span className="inline-block transform -scale-x-100 font-serif">🕊</span>
        </motion.div>
      ))}
    </div>
  )
}

/* ─── Interactive Scratch To Reveal Card ─── */
function ScratchToRevealCard({
  date,
  couple,
  venue,
}: {
  date?: string | null
  couple: string
  venue?: string | null
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const width = 280
    const height = 250
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)

    // Draw Heart shape clipping with Glitter Metallic Foil
    function drawHeartMask() {
      if (!ctx) return
      ctx.save()
      ctx.beginPath()
      const topCurveHeight = height * 0.3
      ctx.moveTo(width / 2, height * 0.28)
      // top left curve
      ctx.bezierCurveTo(width / 2, 0, 0, 0, 0, topCurveHeight)
      // bottom left curve
      ctx.bezierCurveTo(0, height * 0.65, width / 2, height * 0.85, width / 2, height)
      // bottom right curve
      ctx.bezierCurveTo(width / 2, height * 0.85, width, height * 0.65, width, topCurveHeight)
      // top right curve
      ctx.bezierCurveTo(width, 0, width / 2, 0, width / 2, height * 0.28)
      ctx.closePath()
      ctx.clip()

      // Rose-gold glitter gradient
      const grad = ctx.createLinearGradient(0, 0, width, height)
      grad.addColorStop(0, '#f472b6')
      grad.addColorStop(0.3, '#fbcfe8')
      grad.addColorStop(0.5, '#ec4899')
      grad.addColorStop(0.7, '#f472b6')
      grad.addColorStop(1, '#db2777')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)

      // Add sparkling glitter noise
      for (let i = 0; i < 900; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const radius = Math.random() * 1.5
        ctx.fillStyle = Math.random() > 0.4 ? 'rgba(255,255,255,0.85)' : 'rgba(251,207,232,0.9)'
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      }

      // Instruction text on heart
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 13px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'center'
      ctx.shadowColor = 'rgba(157, 23, 77, 0.6)'
      ctx.shadowBlur = 6
      ctx.fillText('✨ SCRATCH HERE ✨', width / 2, height * 0.5)
      ctx.restore()
    }

    drawHeartMask()
  }, [])

  const checkScratch = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || isRevealed) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      let transparentPixels = 0
      const totalSample = imgData.data.length / 4

      for (let i = 3; i < imgData.data.length; i += 16) {
        if (imgData.data[i] === 0) transparentPixels++
      }

      const percent = (transparentPixels / (totalSample / 4)) * 100

      if (percent > 38 && !isRevealed) {
        setIsRevealed(true)
      }
    } catch {
      // fallback
    }
  }, [isRevealed])

  const scratch = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || isRevealed) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    const x = clientX - rect.left
    const y = clientY - rect.top

    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, 22, 0, Math.PI * 2)
    ctx.fill()

    checkScratch()
  }

  const handleInstantReveal = () => {
    setIsRevealed(true)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  const handleSaveDate = () => {
    if (!date) return
    const calText = `Wedding of ${couple}\nDate: ${formatDate(date)}\nVenue: ${venue || ''}`
    navigator.clipboard?.writeText(calText).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <section className="relative py-20 px-4 sm:px-6 overflow-hidden bg-gradient-to-b from-[#fdf2f8]/60 via-[#fff1f2] to-[#fdf2f8]">
      <div className="max-w-xl mx-auto text-center flex flex-col items-center">
        {/* Heart eyebrow */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="h-px w-10 bg-rose-300" />
          <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-300" />
          <span className="h-px w-10 bg-rose-300" />
        </div>

        <h2 className="font-serif italic text-3xl sm:text-5xl text-rose-900 mb-2">
          Scratch to Reveal
        </h2>

        <div className="flex items-center justify-center gap-2 mb-8">
          <Heart className="w-2.5 h-2.5 text-rose-400 fill-rose-400" />
        </div>

        {/* Scratch container with heart frame */}
        <div className="relative w-[280px] h-[250px] mb-8 select-none flex items-center justify-center">
          {/* Revealed Secret Content */}
          <div className="absolute inset-0 rounded-3xl bg-white shadow-xl shadow-rose-200/50 border border-rose-200 flex flex-col items-center justify-center p-6 text-center">
            <span className="text-[10px] font-bold tracking-[0.25em] text-rose-500 uppercase mb-1">
              Save The Date
            </span>
            <p className="font-serif text-2xl font-normal text-rose-950 mb-1 leading-tight">
              {couple}
            </p>
            {date && (
              <p className="font-serif italic text-rose-800 text-lg font-medium mb-1">
                {formatDate(date)}
              </p>
            )}
            {venue && (
              <p className="text-xs text-rose-600/80 font-sans line-clamp-1">{venue}</p>
            )}
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-rose-700 font-semibold bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              <Sparkles className="w-3 h-3 text-rose-500" />
              <span>We can&apos;t wait to celebrate!</span>
            </div>
          </div>

          {/* Scratchable Canvas overlay */}
          <canvas
            ref={canvasRef}
            onMouseMove={scratch}
            onTouchMove={scratch}
            onClick={scratch}
            className={`absolute inset-0 cursor-pointer touch-none transition-opacity duration-700 ${
              isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={handleSaveDate}
            className="inline-flex items-center gap-2 bg-[#9f1239] hover:bg-[#881337] text-white px-7 py-3 rounded-full text-xs font-semibold uppercase tracking-widest shadow-lg shadow-rose-900/20 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Date Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <CalendarPlus className="w-4 h-4" />
                <span>Save The Date</span>
              </>
            )}
          </motion.button>

          {!isRevealed && (
            <button
              type="button"
              onClick={handleInstantReveal}
              className="text-xs text-rose-700 hover:text-rose-900 underline underline-offset-4 font-medium transition-colors"
            >
              Reveal without scratching
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

/* ─── Guestbook Wishes Section (from screenshot 3) ─── */
function GuestbookWishesSection({ couple }: { couple: string }) {
  const [message, setMessage] = useState('')
  const [wishes, setWishes] = useState<string[]>([
    'Wishing you both endless love, laughter, and joy in this beautiful new chapter! 💕',
    'So thrilled to celebrate your special day! Congratulations to the beautiful couple! 🥂',
  ])
  const [sent, setSent] = useState(false)

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setWishes([message.trim(), ...wishes])
    setMessage('')
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <section className="py-20 px-4 sm:px-6 bg-white/70 backdrop-blur-sm border-t border-b border-rose-100">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="h-px w-8 bg-rose-200" />
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span className="h-px w-8 bg-rose-200" />
          </div>
          <h2 className="font-serif italic text-3xl sm:text-4xl text-rose-950">
            Send Your Warm Wishes
          </h2>
          <p className="text-xs sm:text-sm text-rose-700/80 font-sans mt-1">
            Leave a blessing or love note for {couple}
          </p>
        </div>

        <form onSubmit={handleSend} className="space-y-3 mb-8">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Write your wishes..."
            className="w-full rounded-2xl border border-rose-200 bg-rose-50/40 p-4 text-sm text-rose-950 placeholder-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/50 transition-all resize-none shadow-inner"
          />
          <div className="flex items-center justify-between">
            {sent ? (
              <span className="text-xs text-rose-700 font-medium inline-flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600 animate-pulse" />
                Thank you for your blessings!
              </span>
            ) : <span />}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!message.trim()}
              className="inline-flex items-center gap-2 bg-[#9f1239] hover:bg-[#881337] disabled:opacity-50 text-white px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-colors shadow-md shadow-rose-900/15 cursor-pointer ml-auto"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Message</span>
            </motion.button>
          </div>
        </form>

        {/* List of recent wishes */}
        <div className="space-y-3">
          {wishes.map((w, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100 text-xs sm:text-sm text-rose-900 leading-relaxed font-sans italic flex items-start gap-2.5"
            >
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-300 shrink-0 mt-0.5" />
              <span>{w}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Romantic Countdown Clock ─── */
function subscribeCountdown(callback: () => void) {
  const interval = setInterval(callback, 1000)
  return () => clearInterval(interval)
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
      <div className="text-center py-6">
        <p className="font-serif italic text-2xl text-rose-900">
          The celebration has begun! 🥂
        </p>
      </div>
    )
  }

  const units = [
    { label: 'Days', val: timeLeft?.days },
    { label: 'Hours', val: timeLeft?.hours },
    { label: 'Minutes', val: timeLeft?.minutes },
    { label: 'Seconds', val: timeLeft?.seconds },
  ]

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-lg mx-auto">
      {units.map((u) => (
        <div
          key={u.label}
          className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white/90 border border-rose-200/80 shadow-md shadow-rose-200/30"
        >
          <span className="font-serif text-2xl sm:text-4xl font-medium text-rose-950 tabular-nums">
            {u.val !== undefined ? String(u.val).padStart(2, '0') : '--'}
          </span>
          <span className="text-[10px] sm:text-xs uppercase tracking-wider text-rose-600/70 font-semibold mt-1">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ─── Floating Music Player (Red/Crimson Circle like screenshot) ─── */
function RomanticMusicPlayer({ music }: { music?: MusicItem | null }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const cleanup = () => {
      document.removeEventListener('click', start)
      document.removeEventListener('touchstart', start)
    }
    function start() {
      const a = audioRef.current
      if (a) {
        a.volume = 0.5
        a.play().catch(() => {})
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
    if (a.paused) a.play().catch(() => {})
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
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggle}
        aria-label={playing ? 'Pause music' : 'Play music'}
        className="fixed top-4 right-4 z-50 w-11 h-11 rounded-full bg-[#9f1239] text-white shadow-xl shadow-rose-950/25 border border-rose-300/40 flex items-center justify-center cursor-pointer transition-transform"
      >
        {playing ? (
          <span className="flex items-end gap-0.5 h-3.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1 bg-white rounded-full"
                animate={{ height: [3, 14, 5, 12, 3] }}
                transition={{ duration: 0.9 + i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
          </span>
        ) : (
          <Volume2 className="w-5 h-5 text-white" />
        )}
      </motion.button>
    </>
  )
}

/* ─── Gallery Lightbox Modal ─── */
function RomanticGallery({ photos }: { photos: Photo[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
        {photos.map((p, idx) => (
          <motion.div
            key={p.id}
            whileHover={{ y: -4, rotate: (idx % 2 === 0 ? 1 : -1) }}
            onClick={() => setOpen(idx)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white p-2 shadow-md hover:shadow-xl transition-all border border-rose-100"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-xl bg-rose-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt={`Wedding moment ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="p-2 text-center">
              <span className="font-serif italic text-xs text-rose-800">
                Forever In Love
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-50 bg-rose-950/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <button
              onClick={() => setOpen(null)}
              className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full bg-white/10"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={photos[open].url}
              alt=""
              className="max-h-[85vh] max-w-[90vw] rounded-2xl shadow-2xl object-contain border-4 border-white/20"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ──────────────────────────────────────────────────────────
   MAIN COMPONENT: FloralRomanticTemplate
   Directly matching the romantic curtain & blush aesthetic in user screenshots
   ────────────────────────────────────────────────────────── */
export default function FloralRomanticTemplate({ wedding }: { wedding: WeddingData }) {
  const [lang, setLang] = useState<'EN' | 'ML'>('ML')

  const groom = wedding.groomName || 'Nandagopan'
  const bride = wedding.brideName || 'Nidhisree'
  const couple = `${groom} & ${bride}`

  const coverPhoto = wedding.gallery?.find((g) => g.isCover) || wedding.gallery?.[0]

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen w-full bg-[#fdf2f8] text-[#881337] selection:bg-rose-200 selection:text-rose-900 font-serif overflow-x-hidden relative">
        {/* Ambient floating music button */}
        <RomanticMusicPlayer music={wedding.music} />

        {/* Floating Language Switcher (matching user screenshot) */}
        <div className="fixed bottom-4 left-4 z-40">
          <button
            type="button"
            onClick={() => setLang(lang === 'EN' ? 'ML' : 'EN')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-rose-200 text-rose-900 text-xs font-sans font-medium shadow-md shadow-rose-950/10 hover:bg-white transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-rose-600" />
            <span>{lang === 'ML' ? 'Malayalam' : 'English'}</span>
          </button>
        </div>

        {/* ───────── HERO SECTION (Curtain Arch & Romantic Text) ───────── */}
        <section className="relative min-h-[100svh] flex flex-col items-center justify-between overflow-hidden px-4 py-16 sm:py-20 text-center">
          {/* Background: Cover photo with soft romantic curtain overlay */}
          <div className="absolute inset-0 z-0">
            {coverPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverPhoto.url}
                alt=""
                className="w-full h-full object-cover scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-[#fce7f3] via-[#fda4af]/40 to-[#fff1f2]" />
            )}
            {/* Sheer Draped Curtain Framing Illusion (SVG Gradient) */}
            <div className="absolute inset-0 bg-gradient-to-b from-stone-900/60 via-rose-950/40 to-stone-900/75" />
            {/* Dreamy soft curtain drapes on left and right */}
            <div className="absolute inset-y-0 left-0 w-24 sm:w-48 bg-gradient-to-r from-rose-950/60 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-24 sm:w-48 bg-gradient-to-l from-rose-950/60 to-transparent pointer-events-none" />
          </div>

          {/* Floating Rose Petals & Birds */}
          <RomanticFloatingParticles />

          {/* Top Heart Motif */}
          <div className="relative z-20 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white mb-4"
            >
              <Heart className="w-4 h-4 fill-white text-white" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-white/95 text-lg sm:text-2xl italic font-serif tracking-wide drop-shadow-md"
            >
              You are invited to be a part of our special moment....
            </motion.p>

            <div className="flex items-center justify-center gap-3 my-3">
              <span className="h-px w-12 bg-white/40" />
              <Heart className="w-2.5 h-2.5 fill-white/80 text-white/80" />
              <span className="h-px w-12 bg-white/40" />
            </div>
          </div>

          {/* Center: Groom & Bride with Parent Lineage (Exactly like user screenshot!) */}
          <div className="relative z-20 my-auto py-6 max-w-2xl mx-auto flex flex-col items-center">
            {/* Groom */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="flex flex-col items-center mb-3"
            >
              <h1 className="font-serif italic text-5xl sm:text-7xl lg:text-8xl text-amber-300 drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] font-normal tracking-wide">
                {groom}
              </h1>
              <p className="font-serif italic text-white/90 text-sm sm:text-base tracking-wider mt-1 drop-shadow-sm">
                Son of Mr. Pavithran &amp; Mrs. Mridhula
              </p>
            </motion.div>

            {/* Romantic '&' */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="my-1"
            >
              <span className="font-serif italic text-3xl sm:text-5xl text-amber-300/90 font-light drop-shadow-md">
                &amp;
              </span>
            </motion.div>

            {/* Bride */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-col items-center mt-1"
            >
              <h1 className="font-serif italic text-5xl sm:text-7xl lg:text-8xl text-amber-300 drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] font-normal tracking-wide">
                {bride}
              </h1>
              <p className="font-serif italic text-white/90 text-sm sm:text-base tracking-wider mt-1 drop-shadow-sm">
                Daughter of Mr. Pradeepan &amp; Mrs. Rethi
              </p>
            </motion.div>
          </div>

          {/* Bottom Cue: SCROLL with chevron down */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="relative z-20 flex flex-col items-center text-white/80"
          >
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-sans font-light drop-shadow">
              SCROLL
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown className="w-4 h-4 text-white drop-shadow" />
            </motion.div>
          </motion.div>
        </section>

        {/* ───────── SCRATCH TO REVEAL (Interactive Card from Screenshot 2) ───────── */}
        <ScratchToRevealCard
          date={wedding.weddingDate}
          couple={couple}
          venue={wedding.venueName}
        />

        {/* ───────── COUNTDOWN SECTION ───────── */}
        {wedding.weddingDate && (
          <section className="py-14 px-4 sm:px-6 bg-[#fff1f2]/80 border-b border-rose-200/60">
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-xs uppercase tracking-[0.25em] text-rose-700 font-sans font-semibold mb-4">
                Counting down to our forever
              </p>
              <RomanticCountdown date={wedding.weddingDate} />
            </div>
          </section>
        )}

        {/* ───────── OUR STORY / HOW WE MET ───────── */}
        {wedding.story && (
          <section className="py-24 px-4 sm:px-6 max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="h-px w-10 bg-rose-300" />
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-400" />
              <span className="h-px w-10 bg-rose-300" />
            </div>
            <h2 className="font-serif italic text-3xl sm:text-5xl text-rose-950 mb-8">
              Our Love Story
            </h2>
            <div className="relative p-8 sm:p-12 rounded-3xl bg-white/80 border border-rose-200/80 shadow-xl shadow-rose-200/40">
              <span className="text-6xl text-rose-300/40 font-serif select-none absolute top-4 left-6 leading-none">
                &ldquo;
              </span>
              <p className="relative z-10 text-base sm:text-xl text-rose-900 leading-relaxed font-serif italic">
                {wedding.story}
              </p>
              <div className="mt-8 flex items-center justify-center gap-2">
                <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                <span className="text-xs uppercase tracking-widest text-rose-600 font-sans">
                  {couple}
                </span>
                <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
              </div>
            </div>
          </section>
        )}

        {/* ───────── WEDDING EVENTS TIMELINE ───────── */}
        {wedding.events && wedding.events.length > 0 && (
          <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-[#fdf2f8] via-[#fff1f2] to-[#fdf2f8]">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-14">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="h-px w-8 bg-rose-300" />
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-400" />
                  <span className="h-px w-8 bg-rose-300" />
                </div>
                <h2 className="font-serif italic text-3xl sm:text-5xl text-rose-950">
                  Celebration Schedule
                </h2>
                <p className="text-xs sm:text-sm text-rose-700/80 font-sans mt-2">
                  Every moment crafted with love and blessings
                </p>
              </div>

              <div className="space-y-6">
                {wedding.events.map((ev, i) => (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 sm:p-8 rounded-3xl bg-white/90 border border-rose-200/90 shadow-lg shadow-rose-200/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                  >
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-semibold uppercase tracking-wider font-sans">
                        <Clock className="w-3 h-3" />
                        <span>{ev.time ? formatTime(ev.time) : 'Celebration'}</span>
                      </div>
                      <h3 className="font-serif text-2xl sm:text-3xl font-medium text-rose-950">
                        {ev.title}
                      </h3>
                      {ev.date && (
                        <p className="text-xs sm:text-sm text-rose-700 font-sans flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-rose-500" />
                          <span>{formatDate(ev.date)}</span>
                        </p>
                      )}
                      {ev.venue && (
                        <p className="text-xs text-rose-600 font-sans flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          <span>{ev.venue}</span>
                        </p>
                      )}
                    </div>

                    {ev.mapsUrl && (
                      <a
                        href={ev.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-rose-300 text-rose-800 hover:bg-rose-50 text-xs font-semibold uppercase tracking-wider font-sans transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>View Map</span>
                      </a>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ───────── PHOTO GALLERY ───────── */}
        {wedding.gallery && wedding.gallery.length > 0 && (
          <section className="py-24 px-4 sm:px-6">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="h-px w-8 bg-rose-300" />
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-400" />
                <span className="h-px w-8 bg-rose-300" />
              </div>
              <h2 className="font-serif italic text-3xl sm:text-5xl text-rose-950">
                Moments Captured
              </h2>
              <p className="text-xs sm:text-sm text-rose-700/80 font-sans mt-2">
                Glimpses of smiles, laughter, and endless love
              </p>
            </div>

            <RomanticGallery photos={wedding.gallery} />
          </section>
        )}

        {/* ───────── GUESTBOOK WISHES (From Screenshot 3) ───────── */}
        <GuestbookWishesSection couple={couple} />

        {/* ───────── WE CAN'T WAIT TO CELEBRATE BANNER (From Screenshot 3) ───────── */}
        <section className="py-24 px-4 sm:px-6 text-center bg-gradient-to-b from-[#fdf2f8] to-[#fff1f2]">
          <div className="max-w-xl mx-auto flex flex-col items-center">
            {/* Wavy separator lines */}
            <div className="w-48 h-2 border-t-2 border-dotted border-rose-300 mb-6" />

            <h2 className="font-serif italic text-3xl sm:text-5xl text-[#9f1239] leading-tight mb-4 drop-shadow-sm">
              We can&apos;t wait to celebrate with you!
            </h2>

            <p className="font-serif italic text-2xl sm:text-3xl text-rose-800/90 mb-6">
              {couple}
            </p>

            <div className="w-48 h-2 border-b-2 border-dotted border-rose-300 mt-2" />
          </div>
        </section>

        {/* ───────── RSVP SECTION ───────── */}
        <section className="py-20 px-4 sm:px-6 max-w-xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="h-px w-8 bg-rose-300" />
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-400" />
              <span className="h-px w-8 bg-rose-300" />
            </div>
            <h2 className="font-serif italic text-3xl sm:text-4xl text-rose-950">
              RSVP
            </h2>
            <p className="text-xs sm:text-sm text-rose-700 font-sans mt-1">
              Please let us know if you can make it
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-rose-200 shadow-xl shadow-rose-200/50">
            <RSVPForm
              weddingId={wedding.id}
              primaryColor="#9f1239"
              accentColor="#f43f5e"
            />
          </div>
        </section>

        {/* ───────── FOOTER BRANDING ───────── */}
        <footer className="py-8 px-4 text-center border-t border-rose-200/70 bg-white/60">
          <p className="font-serif italic text-rose-900 text-sm mb-1">{couple}</p>
          <p className="text-xs text-rose-500/80 font-sans">
            Create your own wedding invitation on{' '}
            <Link href="/" className="underline hover:text-rose-700">
              ForeverVows
            </Link>
          </p>
        </footer>
      </div>
    </MotionConfig>
  )
}
