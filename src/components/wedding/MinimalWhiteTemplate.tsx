'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import {
  motion,
  AnimatePresence,
  MotionConfig,
} from 'framer-motion'
import {
  ArrowUpRight,
  X,
} from 'lucide-react'
import { WeddingData, MusicItem } from '@/types/wedding'
import { formatDate, formatTime, getCountdown } from '@/lib/utils'
import RSVPForm from '@/components/rsvp/RSVPForm'

type Photo = NonNullable<WeddingData['gallery']>[number]

/* ─── Countdown ─── */
function subscribeCountdown(callback: () => void) {
  const interval = setInterval(callback, 1000)
  return () => clearInterval(interval)
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
      <div className="py-4 text-center">
        <p className="font-serif text-2xl text-stone-900">
          The union has begun.
        </p>
      </div>
    )
  }

  const units = [
    { label: 'Days', val: timeLeft?.days },
    { label: 'Hours', val: timeLeft?.hours },
    { label: 'Mins', val: timeLeft?.minutes },
    { label: 'Secs', val: timeLeft?.seconds },
  ]

  return (
    <div className="grid grid-cols-4 divide-x divide-stone-200 border-y border-stone-200 max-w-2xl mx-auto py-6">
      {units.map((u) => (
        <div key={u.label} className="flex flex-col items-center justify-center px-2 sm:px-4">
          <span className="font-mono text-3xl sm:text-5xl font-light text-stone-900 tabular-nums">
            {u.val !== undefined ? String(u.val).padStart(2, '0') : '--'}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-stone-400 font-sans mt-2">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ─── Music Player ─── */
function EditorialMusicPlayer({ music }: { music?: MusicItem | null }) {
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
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggle}
        aria-label={playing ? 'Pause music' : 'Play music'}
        className="fixed top-6 right-6 z-50 h-11 px-4 rounded-full bg-stone-900 text-stone-100 text-xs font-mono uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-stone-800 transition-colors"
      >
        <span className={`w-2 h-2 rounded-full ${playing ? 'bg-emerald-400 animate-ping' : 'bg-stone-500'}`} />
        <span>{playing ? 'Sound / On' : 'Play Audio'}</span>
      </motion.button>
    </>
  )
}

/* ─── Gallery Lightbox ─── */
function EditorialGallery({ photos }: { photos: Photo[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {photos.map((p, idx) => (
          <motion.div
            key={p.id}
            whileHover={{ y: -4 }}
            onClick={() => setOpen(idx)}
            className="group cursor-pointer overflow-hidden bg-stone-100"
          >
            <div className="aspect-[3/4] overflow-hidden relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt=""
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                loading="lazy"
              />
            </div>
            <div className="pt-3 pb-1 flex items-center justify-between text-[11px] font-mono text-stone-500 uppercase tracking-wider">
              <span>Plate {String(idx + 1).padStart(2, '0')}</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                View Fullscreen ↗
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
            className="fixed inset-0 z-50 bg-stone-950/95 flex items-center justify-center p-4 sm:p-10"
          >
            <button
              onClick={() => setOpen(null)}
              className="absolute top-6 right-6 text-stone-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              src={photos[open].url}
              alt=""
              className="max-h-[85vh] max-w-[90vw] object-contain shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ──────────────────────────────────────────────────────────
   MAIN COMPONENT: MinimalWhiteTemplate
   Swiss Editorial Minimalism with high-contrast typography and clean lines
   ────────────────────────────────────────────────────────── */
export default function MinimalWhiteTemplate({ wedding }: { wedding: WeddingData }) {
  const groom = wedding.groomName || 'Jagan Roy'
  const bride = wedding.brideName || 'Anu Mehta'
  const couple = `${groom} & ${bride}`

  const coverPhoto = wedding.gallery?.find((g) => g.isCover) || wedding.gallery?.[0]

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen w-full bg-[#fafaf9] text-stone-900 font-sans selection:bg-stone-900 selection:text-stone-50 overflow-x-hidden relative">
        <EditorialMusicPlayer music={wedding.music} />

        {/* ───────── EDITORIAL MASTHEAD & HERO ───────── */}
        <section className="px-6 sm:px-12 pt-16 sm:pt-24 pb-16 max-w-7xl mx-auto border-b border-stone-200">
          {/* Top Magazine Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-stone-200 text-xs font-mono uppercase tracking-widest text-stone-500">
            <span>Special Invitation Monograph // Vol. XXIV</span>
            <span>{wedding.weddingDate ? formatDate(wedding.weddingDate) : 'Date Pending'}</span>
            <span>{wedding.venueName || 'Kerala, India'}</span>
          </div>

          {/* Hero Typographic Block */}
          <div className="py-16 sm:py-24">
            <p className="text-xs uppercase tracking-[0.3em] font-mono text-stone-400 mb-6">
              Cordially Invite You To The Nuptials Of
            </p>

            <h1 className="font-serif text-6xl sm:text-8xl lg:text-9xl font-light tracking-tight leading-[0.95] text-stone-950 mb-6">
              <span className="block">{groom}</span>
              <span className="block font-sans italic font-extralight text-stone-400 text-4xl sm:text-6xl my-2">
                and
              </span>
              <span className="block">{bride}</span>
            </h1>

            <div className="flex flex-wrap items-center gap-6 pt-8 text-xs font-mono uppercase tracking-wider text-stone-600">
              {wedding.weddingDate && (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-stone-900" />
                  {formatDate(wedding.weddingDate)}
                </span>
              )}
              {wedding.venueName && (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-stone-900" />
                  {wedding.venueName}
                </span>
              )}
            </div>
          </div>

          {/* Large Hero Imagery Plate */}
          {coverPhoto && (
            <div className="relative aspect-[16/9] sm:aspect-[21/9] overflow-hidden rounded-xl bg-stone-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverPhoto.url}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </section>

        {/* ───────── COUNTDOWN TICKER ───────── */}
        {wedding.weddingDate && (
          <section className="py-16 px-6 sm:px-12 bg-white">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-stone-400 mb-6">
                Countdown // Days to Union
              </p>
              <EditorialCountdown date={wedding.weddingDate} />
            </div>
          </section>
        )}

        {/* ───────── THE ESSAY (OUR STORY) ───────── */}
        {wedding.story && (
          <section className="py-24 px-6 sm:px-12 max-w-4xl mx-auto border-b border-stone-200">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-4">
                <span className="text-xs font-mono uppercase tracking-widest text-stone-400 block mb-2">
                  Chapter 01
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900">
                  The Story
                </h2>
              </div>
              <div className="md:col-span-8">
                <p className="font-serif text-xl sm:text-2xl leading-relaxed text-stone-800 italic">
                  &ldquo;{wedding.story}&rdquo;
                </p>
                <p className="mt-6 text-xs font-mono uppercase tracking-widest text-stone-500">
                  — {couple}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ───────── ITINERARY & PROGRAM ───────── */}
        {wedding.events && wedding.events.length > 0 && (
          <section className="py-24 px-6 sm:px-12 max-w-5xl mx-auto border-b border-stone-200">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-16">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-stone-400 block mb-2">
                  Chapter 02
                </span>
                <h2 className="font-serif text-4xl sm:text-5xl font-normal text-stone-900">
                  The Program
                </h2>
              </div>
              <p className="text-xs font-mono uppercase tracking-wider text-stone-500">
                Order of events &amp; timeline
              </p>
            </div>

            <div className="divide-y divide-stone-200 border-y border-stone-200">
              {wedding.events.map((ev, i) => (
                <div
                  key={ev.id}
                  className="py-8 flex flex-col md:flex-row md:items-baseline justify-between gap-6 group hover:bg-white transition-colors px-4"
                >
                  <div className="flex items-baseline gap-6 md:w-1/3">
                    <span className="font-mono text-sm text-stone-400">
                      /{String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-xs uppercase tracking-widest text-stone-500">
                      {ev.time ? formatTime(ev.time) : 'TBD'}
                    </span>
                  </div>

                  <div className="md:w-1/2">
                    <h3 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900 mb-1">
                      {ev.title}
                    </h3>
                    {ev.venue && (
                      <p className="text-xs text-stone-500 font-sans">{ev.venue}</p>
                    )}
                  </div>

                  <div className="md:w-1/6 flex md:justify-end">
                    {ev.mapsUrl && (
                      <a
                        href={ev.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-stone-900 hover:text-stone-600 transition-colors"
                      >
                        <span>Map</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ───────── GALLERY ───────── */}
        {wedding.gallery && wedding.gallery.length > 0 && (
          <section className="py-24 px-6 sm:px-12 max-w-7xl mx-auto border-b border-stone-200">
            <div className="flex items-baseline justify-between mb-16">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-stone-400 block mb-2">
                  Chapter 03
                </span>
                <h2 className="font-serif text-4xl sm:text-5xl font-normal text-stone-900">
                  Visual Plates
                </h2>
              </div>
              <span className="text-xs font-mono uppercase tracking-widest text-stone-400">
                {wedding.gallery.length} Archival Photographs
              </span>
            </div>

            <EditorialGallery photos={wedding.gallery} />
          </section>
        )}

        {/* ───────── RSVP ───────── */}
        <section className="py-24 px-6 sm:px-12 max-w-xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-mono uppercase tracking-widest text-stone-400 block mb-2">
              Confirmation
            </span>
            <h2 className="font-serif text-4xl font-normal text-stone-900">
              Will You Attend?
            </h2>
            <p className="text-xs font-mono uppercase tracking-wider text-stone-500 mt-2">
              Kindly respond at your earliest convenience
            </p>
          </div>

          <div className="p-8 sm:p-10 rounded-2xl bg-white border border-stone-200 shadow-sm">
            <RSVPForm
              weddingId={wedding.id}
              primaryColor="#1c1917"
              accentColor="#44403c"
            />
          </div>
        </section>

        {/* ───────── FOOTER ───────── */}
        <footer className="py-12 px-6 sm:px-12 border-t border-stone-200 bg-white">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono uppercase tracking-widest text-stone-400">
            <span>ForeverVows Editorial // {couple}</span>
            <span>All Rights Reserved</span>
          </div>
        </footer>
      </div>
    </MotionConfig>
  )
}
