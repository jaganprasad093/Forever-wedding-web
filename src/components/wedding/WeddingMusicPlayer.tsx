'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Music } from 'lucide-react'
import { motion } from 'framer-motion'
import { MusicItem } from '@/types/wedding'
import { extractYouTubeVideoId } from '@/lib/audio-extractor'

const DEFAULT_AUDIO_URL = '/music/canon-in-d.mp3'

interface WeddingMusicPlayerProps {
  music?: MusicItem | null
  accent?: string
  primary?: string
  className?: string
}

export default function WeddingMusicPlayer({
  music,
  accent = '#c5a059',
  primary = '#1c1917',
  className = '',
}: WeddingMusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [playing, setPlaying] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  const rawUrl = music?.url || DEFAULT_AUDIO_URL
  const youtubeId = extractYouTubeVideoId(rawUrl)
  const isYouTube = Boolean(music?.type === 'youtube' || youtubeId)

  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  // Send command to YouTube iframe
  const sendYouTubeCommand = useCallback((func: string, args: unknown[] = []) => {
    if (!iframeRef.current?.contentWindow) return
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({
        event: 'command',
        func,
        args,
      }),
      '*'
    )
  }, [])

  const startPlayback = useCallback(() => {
    if (isYouTube) {
      sendYouTubeCommand('unMute')
      sendYouTubeCommand('setVolume', [70])
      sendYouTubeCommand('playVideo')
      setPlaying(true)
    } else {
      const audio = audioRef.current
      if (audio) {
        audio.volume = 0.6
        audio
          .play()
          .then(() => setPlaying(true))
          .catch(() => {
            // Browsers may still reject autoplay until explicit gesture
          })
      }
    }
  }, [isYouTube, sendYouTubeCommand])

  const pausePlayback = useCallback(() => {
    if (isYouTube) {
      sendYouTubeCommand('pauseVideo')
      setPlaying(false)
    } else {
      const audio = audioRef.current
      if (audio) {
        audio.pause()
        setPlaying(false)
      }
    }
  }, [isYouTube, sendYouTubeCommand])

  const toggle = useCallback(() => {
    setHasInteracted(true)
    if (playing) {
      pausePlayback()
    } else {
      startPlayback()
    }
  }, [playing, pausePlayback, startPlayback])

  // Try autoplay on first user interaction (touch, click, scroll)
  useEffect(() => {
    if (hasInteracted) return

    const handleFirstInteraction = () => {
      setHasInteracted(true)
      startPlayback()
      cleanup()
    }

    const cleanup = () => {
      window.removeEventListener('click', handleFirstInteraction)
      window.removeEventListener('touchstart', handleFirstInteraction)
      window.removeEventListener('scroll', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
    }

    window.addEventListener('click', handleFirstInteraction, { passive: true })
    window.addEventListener('touchstart', handleFirstInteraction, { passive: true })
    window.addEventListener('scroll', handleFirstInteraction, { passive: true })
    window.addEventListener('keydown', handleFirstInteraction, { passive: true })

    return cleanup
  }, [hasInteracted, startPlayback])

  // Handle YouTube iframe load
  const handleIframeLoad = () => {
    if (hasInteracted && playing) {
      sendYouTubeCommand('unMute')
      sendYouTubeCommand('setVolume', [70])
      sendYouTubeCommand('playVideo')
    }
  }

  const ytEmbedUrl = youtubeId
    ? `https://www.youtube-nocookie.com/embed/${youtubeId}?enablejsapi=1&autoplay=0&loop=1&playlist=${youtubeId}&controls=0${
        origin ? `&origin=${encodeURIComponent(origin)}` : ''
      }`
    : ''

  return (
    <>
      {isYouTube && youtubeId ? (
        <iframe
          ref={iframeRef}
          src={ytEmbedUrl}
          title={music?.title || 'Wedding Background Music'}
          allow="autoplay; encrypted-media"
          onLoad={handleIframeLoad}
          className="fixed bottom-0 right-0 h-10 w-10 opacity-[0.001] pointer-events-none z-[-1]"
          tabIndex={-1}
          aria-hidden="true"
        />
      ) : (
        <audio
          ref={audioRef}
          src={rawUrl}
          loop
          preload="auto"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />
      )}

      <motion.button
        type="button"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 18 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={toggle}
        aria-label={playing ? 'Pause wedding music' : 'Play wedding music'}
        aria-pressed={playing}
        className={`fixed z-50 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-white/95 backdrop-blur shadow-2xl border transition-all ${className}`}
        style={{
          right: 'max(1rem, env(safe-area-inset-right))',
          bottom: 'max(1.25rem, env(safe-area-inset-bottom))',
          color: primary,
          borderColor: `${accent}80`,
        }}
      >
        {playing ? (
          <span className="flex items-end gap-[3px] h-4" aria-hidden>
            {[0, 1, 2, 3].map((b) => (
              <motion.span
                key={b}
                className="w-[3px] rounded-full"
                style={{ backgroundColor: primary }}
                animate={{ height: [4, 16, 7, 14, 4] }}
                transition={{
                  duration: 1 + b * 0.15,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: b * 0.1,
                }}
              />
            ))}
          </span>
        ) : (
          <Music className="w-5 h-5" />
        )}

        {playing && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: accent }}
            animate={{ scale: [1, 1.5], opacity: [0.7, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
      </motion.button>
    </>
  )
}
