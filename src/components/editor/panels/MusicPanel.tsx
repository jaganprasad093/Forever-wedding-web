'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Upload,
  Play,
  Pause,
  Trash2,
  Music,
  Loader2,
  Volume2,
  Video,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  type LucideIcon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { MusicItem, WeddingData } from '@/types/wedding'
import {
  extractAudioFromVideoFile,
  fetchYouTubeInfo,
  YouTubeVideoInfo,
} from '@/lib/audio-extractor'
import { cn } from '@/lib/utils'

/* ───────────────────────── constants & helpers ───────────────────────── */

const BUCKET = 'wedding-music'
const MAX_AUDIO_MB = 20
const MAX_VIDEO_MB = 200

const PRESET_MUSIC = [
  {
    id: 'preset-1',
    title: 'Canon in D',
    artist: 'Johann Pachelbel (Wedding Classic)',
    url: '/music/canon-in-d.mp3',
  },
  {
    id: 'preset-2',
    title: 'Air on the G String',
    artist: 'J.S. Bach (Romantic Strings)',
    url: '/music/air-on-g-string.mp3',
  },
  {
    id: 'preset-3',
    title: 'Brandenburg Concerto',
    artist: 'J.S. Bach (Celebration & Joy)',
    url: '/music/brandenburg-concerto.mp3',
  },
]

type MusicTab = 'youtube' | 'video' | 'audio' | 'presets'

const TABS: { id: MusicTab; label: string; icon: LucideIcon | 'youtube' }[] = [
  { id: 'youtube', label: 'YouTube', icon: 'youtube' },
  { id: 'video', label: 'From Video', icon: Video },
  { id: 'audio', label: 'Audio File', icon: Upload },
  { id: 'presets', label: 'Presets', icon: Sparkles },
]

interface MusicRow {
  id: string
  wedding_id: string
  title: string
  artist: string | null
  url: string
  path: string | null
  type: MusicItem['type']
}

const toItem = (d: MusicRow): MusicItem => ({
  id: d.id,
  weddingId: d.wedding_id,
  title: d.title,
  artist: d.artist,
  url: d.url,
  path: d.path,
  type: d.type as MusicItem['type'],
})

function parseYouTubeId(raw: string): string | null {
  const ID = /^[\w-]{11}$/
  try {
    const u = new URL(raw.trim())
    const host = u.hostname.replace(/^www\.|^m\./, '')
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0]
      return ID.test(id) ? id : null
    }
    if (host === 'youtube.com' || host === 'music.youtube.com') {
      if (u.pathname === '/watch') {
        const id = u.searchParams.get('v') || ''
        return ID.test(id) ? id : null
      }
      const m = u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})/)
      if (m) return m[1]
    }
  } catch {
    /* not a URL */
  }
  return null
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

/** Click-or-drop file target built on a real <label>, so it is keyboard and screen-reader friendly. */
function DropZone({
  accept,
  disabled,
  onFile,
  children,
}: {
  accept: string
  disabled?: boolean
  onFile: (file: File) => void
  children: React.ReactNode
}) {
  const [dragging, setDragging] = useState(false)
  return (
    <label
      onDragOver={(e) => {
        e.preventDefault()
        if (!disabled) setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file && !disabled) onFile(file)
      }}
      className={cn(
        'flex flex-col items-center justify-center gap-2.5 py-8 px-4 border-2 border-dashed rounded-2xl text-center transition-all focus-within:ring-2 focus-within:ring-[#8c6b48]/40',
        disabled ? 'cursor-wait opacity-80' : 'cursor-pointer',
        dragging
          ? 'border-[#8c6b48] bg-[#f7f2ea]'
          : 'border-stone-200 bg-stone-50/60 hover:border-[#8c6b48]/60 hover:bg-[#faf6f0]'
      )}
    >
      <input
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
          e.target.value = ''
        }}
      />
      {children}
    </label>
  )
}

/* ───────────────────────── component ───────────────────────── */

export default function MusicPanel({
  weddingId,
  onUpdate,
}: {
  weddingId: string
  onUpdate?: (updates: Partial<WeddingData>) => void
}) {
  const [music, setMusic] = useState<MusicItem | null>(null)
  const [activeTab, setActiveTab] = useState<MusicTab>('youtube')
  const [busy, setBusy] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [ytUrl, setYtUrl] = useState('')
  const [ytLoading, setYtLoading] = useState(false)
  const [ytInfo, setYtInfo] = useState<(YouTubeVideoInfo & { videoId: string }) | null>(null)
  const [ytError, setYtError] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const previewRef = useRef<HTMLAudioElement | null>(null)

  // Keep the latest onUpdate in a ref so the loader effect only runs once per wedding
  const onUpdateRef = useRef(onUpdate)
  useEffect(() => {
    onUpdateRef.current = onUpdate
  }, [onUpdate])

  const isYouTube = music?.type === 'youtube'
  const youtubeId = isYouTube && music ? parseYouTubeId(music.url) : null

  /* ── load existing track ── */
  useEffect(() => {
    let ignore = false
    ;(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('music')
        .select('*')
        .eq('wedding_id', weddingId)
        .maybeSingle()

      if (ignore) return
      if (data) {
        const item = toItem(data as MusicRow)
        setMusic(item)
        onUpdateRef.current?.({ music: item })
      }
      setLoading(false)
    })()
    return () => {
      ignore = true
    }
  }, [weddingId])

  // Stop any sound when the panel unmounts
  useEffect(() => {
    const audio = audioRef.current
    const preview = previewRef.current
    return () => {
      audio?.pause()
      preview?.pause()
    }
  }, [])

  const stopPreview = useCallback(() => {
    previewRef.current?.pause()
    previewRef.current = null
    setPreviewId(null)
  }, [])

  /* ── single place that replaces the wedding's track ── */
  const saveTrack = useCallback(
    async (track: {
      title: string
      artist: string | null
      url: string
      path: string | null
      type: MusicItem['type']
    }) => {
      const supabase = createClient()
      const previous = music

      // Insert the new row first so a failure never leaves the wedding without music
      const { data, error: dbError } = await supabase
        .from('music')
        .insert({ wedding_id: weddingId, ...track })
        .select()
        .single()
      if (dbError || !data) throw dbError ?? new Error('Insert failed')

      if (previous) {
        await supabase.from('music').delete().eq('id', previous.id)
        if (previous.path) await supabase.storage.from(BUCKET).remove([previous.path])
      }

      const item = toItem(data as MusicRow)
      audioRef.current?.pause()
      setPlaying(false)
      setMusic(item)
      onUpdateRef.current?.({ music: item })
    },
    [music, weddingId]
  )

  const run = useCallback(
    async (message: string, task: () => Promise<void>, failure: string) => {
      stopPreview()
      setBusy(true)
      setError(null)
      setStatusMessage(message)
      try {
        await task()
      } catch (err: unknown) {
        console.error(failure, err)
        const dbErr = err as { code?: string; message?: string } | null
        if (dbErr?.message?.includes('music_type_check')) {
          setError(
            'Database error: The "music_type_check" constraint in Supabase needs to be updated to allow YouTube links. Please execute the updated migration in your Supabase SQL Editor.'
          )
        } else {
          setError(failure)
        }
      } finally {
        setBusy(false)
        setStatusMessage(null)
      }
    },
    [stopPreview]
  )

  /* ── handlers ── */
  const handleAudioUpload = (file: File) => {
    if (!file.type.startsWith('audio/') && !/\.(mp3|wav|m4a|aac|ogg)$/i.test(file.name)) {
      setError('Please choose an audio file (MP3, WAV, AAC, M4A or OGG).')
      return
    }
    if (file.size > MAX_AUDIO_MB * 1024 * 1024) {
      setError(`That file is too large. Audio can be up to ${MAX_AUDIO_MB} MB.`)
      return
    }
    run(
      'Uploading audio…',
      async () => {
        const supabase = createClient()
        const ext = file.name.split('.').pop() || 'mp3'
        const path = `${weddingId}/${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { upsert: true })
        if (upErr) throw upErr
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
        await saveTrack({
          title: file.name.replace(/\.[^/.]+$/, ''),
          artist: 'Uploaded Audio',
          url: urlData.publicUrl,
          path,
          type: 'upload',
        })
      },
      'Failed to upload audio. Please try again.'
    )
  }

  const handleVideoUpload = (file: File) => {
    if (!file.type.startsWith('video/') && !/\.(mp4|webm|mov|mkv|avi|m4v)$/i.test(file.name)) {
      setError('Please choose a video file (MP4, WebM or MOV).')
      return
    }
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      setError(`That video is too large. Please use a clip under ${MAX_VIDEO_MB} MB.`)
      return
    }
    run(
      'Reading video file…',
      async () => {
        const { blob } = await extractAudioFromVideoFile(file, (msg) => setStatusMessage(msg))
        setStatusMessage('Uploading extracted audio…')
        const supabase = createClient()
        const path = `${weddingId}/${Date.now()}-extracted.wav`
        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, blob, { contentType: 'audio/wav', upsert: true })
        if (upErr) throw upErr
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
        await saveTrack({
          title: file.name.replace(/\.[^/.]+$/, ''),
          artist: 'Extracted from Video',
          url: urlData.publicUrl,
          path,
          type: 'upload',
        })
      },
      'Could not read an audio track from this video. Make sure it has sound, or convert it to MP3 first.'
    )
  }

  const handleLookUpYouTube = async () => {
    const url = ytUrl.trim()
    if (!url) return
    setYtError(null)
    setYtInfo(null)

    const videoId = parseYouTubeId(url)
    if (!videoId) {
      setYtError('That doesn’t look like a YouTube video link. Try a youtube.com/watch, youtu.be or Shorts link.')
      return
    }

    setYtLoading(true)
    try {
      const info = await fetchYouTubeInfo(url)
      if (!info) setYtError('We couldn’t find that video. It may be private or removed.')
      else setYtInfo({ ...info, videoId })
    } catch {
      setYtError('Unable to fetch video details from YouTube right now.')
    } finally {
      setYtLoading(false)
    }
  }

  const handleUseYouTube = () => {
    if (!ytInfo) return
    run(
      'Adding YouTube song…',
      async () => {
        await saveTrack({
          title: ytInfo.title,
          artist: ytInfo.author,
          url: `https://www.youtube.com/watch?v=${ytInfo.videoId}`,
          path: null,
          type: 'youtube',
        })
        setYtUrl('')
        setYtInfo(null)
      },
      'Failed to add the YouTube song. Please try again.'
    )
  }

  const handleSelectPreset = (preset: (typeof PRESET_MUSIC)[number]) =>
    run(
      'Applying preset…',
      () =>
        saveTrack({
          title: preset.title,
          artist: preset.artist,
          url: preset.url,
          path: null,
          type: 'preset',
        }),
      'Failed to apply that preset. Please try again.'
    )

  const togglePresetPreview = (preset: (typeof PRESET_MUSIC)[number]) => {
    if (previewId === preset.id) {
      stopPreview()
      return
    }
    stopPreview()
    audioRef.current?.pause()
    const a = new Audio(preset.url)
    a.onended = () => setPreviewId(null)
    a.play().catch(() => setError('Could not play that preview.'))
    previewRef.current = a
    setPreviewId(preset.id)
  }

  const removeMusic = async () => {
    if (!music) return
    if (!window.confirm('Remove the background music from this invitation?')) return
    setError(null)
    try {
      const supabase = createClient()
      await supabase.from('music').delete().eq('id', music.id)
      if (music.path) await supabase.storage.from(BUCKET).remove([music.path])
      audioRef.current?.pause()
      setMusic(null)
      setPlaying(false)
      onUpdateRef.current?.({ music: null })
    } catch (err) {
      console.error(err)
      setError('Could not remove the music. Please try again.')
    }
  }

  const togglePlay = async () => {
    const el = audioRef.current
    if (!el) return
    stopPreview()
    try {
      if (el.paused) await el.play()
      else el.pause()
    } catch {
      setError('Could not play this track.')
    }
  }

  /* ── render ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32" role="status" aria-label="Loading music">
        <Loader2 className="w-6 h-6 text-[#8c6b48] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {music && !isYouTube && (
        <audio
          ref={audioRef}
          src={music.url}
          preload="metadata"
          onEnded={() => setPlaying(false)}
          onPause={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
        />
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
          <p className="flex-1 leading-relaxed">{error}</p>
          <button onClick={() => setError(null)} aria-label="Dismiss" className="shrink-0 hover:text-red-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Current track ── */}
      {music ? (
        <div className="rounded-2xl border border-[#ece5db] bg-gradient-to-br from-[#faf6f0] via-white to-[#faf6f0] p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-[#8c6b48] to-[#6c4f31] text-white flex items-center justify-center shadow-sm">
              {isYouTube ? <YoutubeIcon className="w-5 h-5" /> : <Music className="w-5 h-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#f1e6d6] text-[#704e2e]">
                  Now playing on invite
                </span>
                <span className="text-[10px] text-stone-400">
                  {isYouTube ? 'YouTube' : music.type === 'upload' ? 'Custom upload' : 'Preset'}
                </span>
              </div>
              <p className="text-sm font-semibold text-stone-800 truncate mt-1">{music.title}</p>
              {music.artist && <p className="text-xs text-stone-500 truncate">{music.artist}</p>}
            </div>
          </div>

          {isYouTube && youtubeId && (
            <div className="aspect-video w-full overflow-hidden rounded-xl border border-stone-200 bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                title={music.title}
                allow="encrypted-media; picture-in-picture"
                allowFullScreen
                loading="lazy"
                className="h-full w-full"
              />
            </div>
          )}

          <div className="flex items-center gap-2 pt-3 border-t border-[#f1eae0]">
            {!isYouTube && (
              <button
                onClick={togglePlay}
                className="flex items-center gap-1.5 bg-[#8c6b48] hover:bg-[#795938] text-white px-4 py-2 rounded-xl text-xs font-medium shadow-sm transition-colors"
              >
                {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                {playing ? 'Pause' : 'Play preview'}
              </button>
            )}
            <button
              onClick={removeMusic}
              className="ml-auto flex items-center gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl text-xs font-medium transition-colors border border-red-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 px-4 rounded-2xl border border-dashed border-stone-200 bg-stone-50/70">
          <Volume2 className="w-9 h-9 mx-auto mb-2 text-stone-300" />
          <p className="text-xs font-semibold text-stone-600">No background music yet</p>
          <p className="text-[11px] text-stone-400 mt-0.5">
            Pick a song below to set the mood for your guests.
          </p>
        </div>
      )}

      {/* ── Tabs ── */}
      <div
        role="tablist"
        aria-label="Music source"
        className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-stone-100/80 rounded-xl"
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all',
                active ? 'bg-white text-[#704e2e] shadow-sm font-semibold' : 'text-stone-500 hover:text-stone-800'
              )}
            >
              {Icon === 'youtube' ? (
                <YoutubeIcon className="w-3.5 h-3.5 text-red-600" />
              ) : (
                <Icon className="w-3.5 h-3.5 text-[#8c6b48]" />
              )}
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── YouTube ── */}
      {activeTab === 'youtube' && (
        <div role="tabpanel" className="space-y-3">
          <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3.5 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800">
              <YoutubeIcon className="w-4 h-4 text-red-600" />
              Add a song from YouTube
            </div>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Paste a link to any song. It plays on your invitation through YouTube’s official
              player, so nothing is downloaded or copied.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleLookUpYouTube()
              }}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="url"
                value={ytUrl}
                onChange={(e) => {
                  setYtUrl(e.target.value)
                  setYtError(null)
                }}
                placeholder="https://www.youtube.com/watch?v=…"
                aria-label="YouTube link"
                className="min-w-0 flex-1 px-3 py-2.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8c6b48]/40 focus:border-[#8c6b48]"
              />
              <button
                type="submit"
                disabled={ytLoading || !ytUrl.trim()}
                className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                {ytLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Look up'}
              </button>
            </form>

            {ytError && <p className="text-xs text-red-600">{ytError}</p>}

            {ytInfo && (
              <div className="bg-white border border-stone-200 rounded-xl p-3 space-y-3">
                <div className="flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ytInfo.thumbnailUrl}
                    alt=""
                    className="w-24 h-[68px] object-cover rounded-lg bg-stone-100 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-stone-800 line-clamp-2">{ytInfo.title}</p>
                    <p className="text-[11px] text-stone-500 mt-0.5 truncate">{ytInfo.author}</p>
                    <a
                      href={ytInfo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-[#8c6b48] hover:underline mt-1"
                    >
                      Open on YouTube
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
                <button
                  onClick={handleUseYouTube}
                  disabled={busy}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-[#8c6b48] hover:bg-[#795938] disabled:opacity-60 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  {busy ? statusMessage || 'Adding…' : 'Use as background music'}
                </button>
              </div>
            )}
          </div>

          <p className="text-[11px] text-stone-400 leading-relaxed px-1">
            Tip: the song must allow embedding, and guests need an internet connection. For a file
            that works offline, use the Audio File or From Video tab with music you own.
          </p>
        </div>
      )}

      {/* ── Video → audio ── */}
      {activeTab === 'video' && (
        <div role="tabpanel" className="space-y-3">
          <div className="rounded-xl border border-[#ece5db] bg-[#faf6f0] p-3.5">
            <p className="text-xs font-semibold text-[#704e2e] flex items-center gap-1.5 mb-1">
              <Video className="w-4 h-4" />
              Use the sound from a video clip
            </p>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Upload a clip you own, such as a phone recording or a pre-wedding video. We pull out
              just the audio in your browser and use it as your music. Clips up to {MAX_VIDEO_MB} MB.
            </p>
          </div>

          <DropZone accept="video/*,.mp4,.webm,.mov,.mkv" disabled={busy} onFile={handleVideoUpload}>
            {busy ? (
              <>
                <Loader2 className="w-7 h-7 text-[#8c6b48] animate-spin" />
                <p className="text-xs font-semibold text-stone-800" role="status">
                  {statusMessage || 'Extracting audio…'}
                </p>
                <p className="text-[11px] text-stone-400">This can take a moment for longer clips.</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-[#f1e6d6] text-[#704e2e] flex items-center justify-center">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-800">Drop a video here</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">or tap to browse (.mp4, .webm, .mov)</p>
                </div>
              </>
            )}
          </DropZone>
        </div>
      )}

      {/* ── Audio file ── */}
      {activeTab === 'audio' && (
        <div role="tabpanel">
          <DropZone accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg" disabled={busy} onFile={handleAudioUpload}>
            {busy ? (
              <>
                <Loader2 className="w-6 h-6 text-[#8c6b48] animate-spin" />
                <p className="text-xs font-semibold text-stone-800" role="status">
                  {statusMessage || 'Uploading…'}
                </p>
              </>
            ) : (
              <>
                <div className="w-11 h-11 rounded-full bg-[#f1e6d6] text-[#704e2e] flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-800">Upload an audio file</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">MP3, WAV, AAC, M4A or OGG · up to {MAX_AUDIO_MB} MB</p>
                </div>
              </>
            )}
          </DropZone>
        </div>
      )}

      {/* ── Presets ── */}
      {activeTab === 'presets' && (
        <div role="tabpanel" className="space-y-2">
          <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
            Royalty-free tunes
          </p>
          {PRESET_MUSIC.map((preset) => {
            const isCurrent = music?.url === preset.url
            const previewing = previewId === preset.id
            return (
              <div
                key={preset.id}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-xl border transition-colors',
                  isCurrent ? 'bg-[#f7f2ea] border-[#e4d6c0]' : 'bg-stone-50 border-stone-200/80 hover:bg-[#faf6f0]'
                )}
              >
                <button
                  onClick={() => togglePresetPreview(preset)}
                  aria-label={previewing ? `Pause ${preset.title}` : `Preview ${preset.title}`}
                  className="w-9 h-9 shrink-0 rounded-full bg-white border border-stone-200 text-[#8c6b48] flex items-center justify-center hover:bg-[#f7f2ea] transition-colors"
                >
                  {previewing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-stone-800 truncate">{preset.title}</p>
                  <p className="text-[11px] text-stone-500 truncate">{preset.artist}</p>
                </div>
                {isCurrent ? (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    In use
                  </span>
                ) : (
                  <button
                    onClick={() => handleSelectPreset(preset)}
                    disabled={busy}
                    className="px-3 py-1.5 bg-[#8c6b48] hover:bg-[#795938] disabled:opacity-60 text-white rounded-lg text-xs font-medium transition-colors shrink-0"
                  >
                    Use
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="rounded-xl border border-stone-100 bg-stone-50 p-3">
        <p className="text-[11px] text-stone-500 leading-relaxed">
          🎵 Guests see a small music button on your invitation, so they can play, pause or mute at
          any time. Browsers only start sound after a tap, so music begins when a guest interacts.
        </p>
      </div>
    </div>
  )
}