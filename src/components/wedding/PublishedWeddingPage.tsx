'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Music, Pause, Play, MapPin, Calendar, Clock, Heart, ChevronDown } from 'lucide-react'
import { WeddingData, MusicItem } from '@/types/wedding'
import { formatDate, formatTime, getCountdown } from '@/lib/utils'
import RSVPForm from '@/components/rsvp/RSVPForm'

function CountdownTimer({ weddingDate }: { weddingDate: string }) {
  const [timeLeft, setTimeLeft] = useState(getCountdown(weddingDate))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getCountdown(weddingDate))
    }, 1000)
    return () => clearInterval(interval)
  }, [weddingDate])

  if (timeLeft.isPast) {
    return (
      <div className="text-center py-8">
        <p className="font-serif text-2xl opacity-70">The celebration has begun! 🎉</p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-4 sm:gap-8">
      {[
        { value: timeLeft.days, label: 'Days' },
        { value: timeLeft.hours, label: 'Hours' },
        { value: timeLeft.minutes, label: 'Mins' },
        { value: timeLeft.seconds, label: 'Secs' },
      ].map(({ value, label }) => (
        <div key={label} className="text-center">
          <motion.div
            key={value}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="font-serif text-4xl sm:text-5xl font-medium mb-1"
          >
            {String(value).padStart(2, '0')}
          </motion.div>
          <p className="text-xs uppercase tracking-widest opacity-60">{label}</p>
        </div>
      ))}
    </div>
  )
}

function MusicPlayer({ music }: { music: MusicItem }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasInteracted && audioRef.current) {
        setHasInteracted(true)
        audioRef.current.volume = 0.5
        audioRef.current.play().then(() => setPlaying(true)).catch(() => {})
        document.removeEventListener('click', handleFirstInteraction)
        document.removeEventListener('touchstart', handleFirstInteraction)
      }
    }
    document.addEventListener('click', handleFirstInteraction, { once: true })
    document.addEventListener('touchstart', handleFirstInteraction, { once: true })
    return () => {
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('touchstart', handleFirstInteraction)
    }
  }, [hasInteracted])

  const toggle = () => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {})
    }
  }

  return (
    <>
      <audio ref={audioRef} src={music.url} loop />
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2 }}
        onClick={toggle}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-white shadow-2xl border border-stone-200 flex items-center justify-center text-stone-700 hover:scale-110 transition-transform"
        title={playing ? 'Pause music' : 'Play music'}
      >
        {playing ? <Pause className="w-5 h-5" /> : <Music className="w-5 h-5" />}
        {playing && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-amber-400"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>
    </>
  )
}

function Section({
  children,
  className = '',
  style,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={className}
      style={style}
    >
      {children}
    </motion.section>
  )
}

export default function PublishedWeddingPage({ wedding }: { wedding: WeddingData }) {
  const theme = wedding.theme
  const primary = theme.primaryColor || '#92400e'
  const bg = theme.backgroundColor || '#fffbeb'
  const accent = theme.accentColor || '#fcd34d'
  const secondary = theme.secondaryColor || '#b45309'

  const coverPhoto = wedding.gallery?.find((g) => g.isCover) || wedding.gallery?.[0]
  const coupleName = [wedding.groomName, wedding.brideName].filter(Boolean).join(' & ')

  return (
    <div
      style={{
        backgroundColor: bg,
        fontFamily: theme.fontFamily === 'inter' ? 'Inter, sans-serif' : '"Cormorant Garamond", serif',
        color: primary,
      }}
      className="min-h-screen"
    >
      {/* Music Player */}
      {wedding.music && <MusicPlayer music={wedding.music} />}

      {/* ── HERO ── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{ backgroundColor: primary }}
      >
        {/* Cover photo */}
        {coverPhoto && (
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverPhoto.url} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50" />
          </div>
        )}

        {/* Corner ornaments */}
        {[
          'top-6 left-6',
          'top-6 right-6',
          'bottom-6 left-6',
          'bottom-6 right-6',
        ].map((pos, i) => (
          <div
            key={i}
            className={`absolute ${pos} w-12 h-12 border-2 opacity-40`}
            style={{
              borderColor: accent,
              borderTopColor: i < 2 ? accent : 'transparent',
              borderBottomColor: i >= 2 ? accent : 'transparent',
              borderLeftColor: i % 2 === 0 ? accent : 'transparent',
              borderRightColor: i % 2 !== 0 ? accent : 'transparent',
            }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="relative z-10 text-center px-6"
        >
          <p className="text-xs uppercase tracking-[0.4em] mb-6 opacity-70" style={{ color: accent }}>
            Together with their families
          </p>
          <h1
            className="text-5xl sm:text-7xl md:text-8xl font-medium mb-6 leading-none"
            style={{ color: accent }}
          >
            {wedding.groomName || 'Groom'}
            <br />
            <span className="text-3xl sm:text-4xl opacity-60">&amp;</span>
            <br />
            {wedding.brideName || 'Bride'}
          </h1>
          <div className="w-16 h-px mx-auto mb-6 opacity-40" style={{ backgroundColor: accent }} />
          {wedding.weddingDate && (
            <p className="text-lg sm:text-xl opacity-80 mb-2" style={{ color: accent }}>
              {formatDate(wedding.weddingDate)}
            </p>
          )}
          {wedding.venueName && (
            <p className="text-sm opacity-60" style={{ color: accent }}>
              {wedding.venueName}
            </p>
          )}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 z-10 opacity-60"
          style={{ color: accent }}
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* ── COUNTDOWN ── */}
      {wedding.weddingDate && (
        <Section className="py-16 px-6 text-center">
          <p className="text-xs uppercase tracking-[0.3em] opacity-50 mb-6">Counting Down</p>
          <CountdownTimer weddingDate={wedding.weddingDate} />
        </Section>
      )}

      {/* Divider */}
      <div className="flex items-center gap-4 px-8 opacity-20">
        <div className="flex-1 h-px" style={{ backgroundColor: primary }} />
        <Heart className="w-4 h-4" style={{ color: primary, fill: primary }} />
        <div className="flex-1 h-px" style={{ backgroundColor: primary }} />
      </div>

      {/* ── OUR STORY ── */}
      {wedding.story && (
        <Section className="py-16 px-6 max-w-2xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.3em] opacity-50 mb-4">Our Story</p>
          <h2 className="text-3xl sm:text-4xl font-medium mb-6" style={{ color: secondary }}>
            How We Met
          </h2>
          <p className="text-base leading-relaxed opacity-70 italic">
            &ldquo;{wedding.story}&rdquo;
          </p>
        </Section>
      )}

      {/* ── EVENTS ── */}
      {wedding.events && wedding.events.length > 0 && (
        <Section
          className="py-16 px-6"
          style={{ backgroundColor: `${accent}15` }}
        >
          <div className="max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-[0.3em] opacity-50 mb-2 text-center">Celebrations</p>
            <h2 className="text-3xl sm:text-4xl font-medium mb-10 text-center" style={{ color: secondary }}>
              Wedding Events
            </h2>
            <div className="space-y-4">
              {wedding.events.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border"
                  style={{ borderColor: `${accent}40` }}
                >
                  <h3 className="text-xl font-medium mb-2" style={{ color: primary }}>
                    {event.title}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-sm opacity-70">
                    {event.date && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {formatDate(event.date)}
                      </div>
                    )}
                    {event.time && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {formatTime(event.time)}
                      </div>
                    )}
                    {event.venue && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {event.venue}
                      </div>
                    )}
                  </div>
                  {event.address && (
                    <p className="text-xs mt-2 opacity-50">{event.address}</p>
                  )}
                  {event.mapsUrl && (
                    <a
                      href={event.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs underline underline-offset-2 hover:opacity-80 transition-opacity"
                      style={{ color: secondary }}
                    >
                      <MapPin className="w-3 h-3" />
                      View on Google Maps
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* ── GALLERY ── */}
      {wedding.gallery && wedding.gallery.length > 0 && (
        <Section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-[0.3em] opacity-50 mb-2 text-center">Moments</p>
            <h2 className="text-3xl sm:text-4xl font-medium mb-8 text-center" style={{ color: secondary }}>
              Our Gallery
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {wedding.gallery.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={`relative overflow-hidden rounded-xl ${
                    i === 0 ? 'col-span-2 sm:col-span-1 row-span-2' : ''
                  }`}
                  style={{ aspectRatio: i === 0 ? '3/4' : '1/1' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={`Wedding photo ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* ── VENUE ── */}
      {(wedding.venueName || wedding.venueAddress) && (
        <Section
          className="py-16 px-6 text-center"
          style={{ backgroundColor: `${primary}10` }}
        >
          <p className="text-xs uppercase tracking-[0.3em] opacity-50 mb-2">Venue</p>
          <MapPin className="w-8 h-8 mx-auto mb-4 opacity-40" style={{ color: primary }} />
          {wedding.venueName && (
            <h2 className="text-2xl sm:text-3xl font-medium mb-2" style={{ color: primary }}>
              {wedding.venueName}
            </h2>
          )}
          {wedding.venueAddress && (
            <p className="opacity-60 text-sm max-w-xs mx-auto mb-4">{wedding.venueAddress}</p>
          )}
          {wedding.venueMapsUrl && (
            <a
              href={wedding.venueMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border transition-all hover:shadow-md"
              style={{ borderColor: primary, color: primary }}
            >
              <MapPin className="w-4 h-4" />
              Get Directions
            </a>
          )}
        </Section>
      )}

      {/* ── RSVP ── */}
      <Section className="py-16 px-6">
        <div className="max-w-lg mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] opacity-50 mb-2 text-center">RSVP</p>
          <h2 className="text-3xl sm:text-4xl font-medium mb-3 text-center" style={{ color: secondary }}>
            Will You Join Us?
          </h2>
          <p className="text-center opacity-60 text-sm mb-8">
            We would be honoured by your presence. Please confirm your attendance.
          </p>
          <RSVPForm weddingId={wedding.id} primaryColor={primary} accentColor={accent} />
        </div>
      </Section>

      {/* ── THANK YOU ── */}
      <Section
        className="py-20 px-6 text-center"
        style={{ backgroundColor: primary }}
      >
        <Heart
          className="w-10 h-10 mx-auto mb-4"
          style={{ color: accent, fill: accent, opacity: 0.6 }}
        />
        <h2 className="text-3xl sm:text-4xl font-medium mb-3" style={{ color: accent }}>
          Thank You
        </h2>
        <p className="opacity-70 max-w-xs mx-auto text-sm leading-relaxed" style={{ color: accent }}>
          Your love and blessings mean the world to us. We look forward to celebrating with you.
        </p>
        <p className="mt-8 opacity-40 text-xs" style={{ color: accent }}>
          — {coupleName}
        </p>
      </Section>

      {/* Branding */}
      <div className="py-4 text-center bg-stone-900">
        <p className="text-xs text-stone-500">
          Made with ❤️ by{' '}
          <a href="/" className="text-amber-400 hover:underline">
            ForeverVows
          </a>
        </p>
      </div>
    </div>
  )
}
