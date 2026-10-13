'use client'

import { useState, useEffect, useRef } from 'react'
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
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { MusicItem, WeddingData } from '@/types/wedding'
import {
  extractAudioFromVideoFile,
  fetchYouTubeInfo,
  YouTubeVideoInfo,
} from '@/lib/audio-extractor'

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

const PRESET_MUSIC = [
  {
    id: 'preset-1',
    title: 'Soft Gentle Piano',
    artist: 'Classical Romance',
    url: 'https://actions.google.com/sounds/v1/ambiences/soft_gentle_piano.ogg',
    category: 'Romantic Piano',
  },
  {
    id: 'preset-2',
    title: 'Romantic Wedding Bells',
    artist: 'Traditional Bells',
    url: 'https://actions.google.com/sounds/v1/holidays/romantic_bells.ogg',
    category: 'Traditional',
  },
  {
    id: 'preset-3',
    title: 'Gentle Acoustic Flow',
    artist: 'Acoustic Melody',
    url: 'https://actions.google.com/sounds/v1/ambiences/meadow_morning.ogg',
    category: 'Peaceful',
  },
]

type MusicTab = 'audio' | 'video' | 'youtube' | 'presets'

export default function MusicPanel({
  weddingId,
  onUpdate,
}: {
  weddingId: string
  onUpdate?: (updates: Partial<WeddingData>) => void
}) {
  const [music, setMusic] = useState<MusicItem | null>(null)
  const [activeTab, setActiveTab] = useState<MusicTab>('video')
  const [uploading, setUploading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(true)

  // YouTube tab state
  const [ytUrl, setYtUrl] = useState('')
  const [ytLoading, setYtLoading] = useState(false)
  const [ytInfo, setYtInfo] = useState<YouTubeVideoInfo | null>(null)
  const [ytError, setYtError] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    let ignore = false
    const loadMusic = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('music')
        .select('*')
        .eq('wedding_id', weddingId)
        .single()

      if (!ignore && data) {
        const item: MusicItem = {
          id: data.id,
          weddingId: data.wedding_id,
          title: data.title,
          artist: data.artist,
          url: data.url,
          path: data.path,
          type: data.type,
        }
        setMusic(item)
        onUpdate?.({ music: item })
      }
      if (!ignore) setLoading(false)
    }

    loadMusic()
    return () => {
      ignore = true
    }
  }, [weddingId, onUpdate])

  // Direct Audio File Upload (MP3, WAV, AAC)
  const handleAudioUpload = async (file: File) => {
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|m4a|aac|ogg)$/i)) {
      alert('Please upload a valid audio file (MP3, WAV, AAC, M4A, OGG)')
      return
    }
    setUploading(true)
    setStatusMessage('Uploading audio...')

    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() || 'mp3'
      const path = `${weddingId}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('wedding-music')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('wedding-music').getPublicUrl(path)

      if (music) {
        if (music.path) {
          await supabase.storage.from('wedding-music').remove([music.path])
        }
        await supabase.from('music').delete().eq('id', music.id)
      }

      const { data: musicData, error: dbError } = await supabase
        .from('music')
        .insert({
          wedding_id: weddingId,
          title: file.name.replace(/\.[^/.]+$/, ''),
          artist: 'Uploaded Audio',
          url: urlData.publicUrl,
          path,
          type: 'upload',
        })
        .select()
        .single()

      if (dbError) throw dbError

      if (musicData) {
        const item: MusicItem = {
          id: musicData.id,
          weddingId: musicData.wedding_id,
          title: musicData.title,
          artist: musicData.artist,
          url: musicData.url,
          path: musicData.path,
          type: musicData.type,
        }
        setMusic(item)
        onUpdate?.({ music: item })
      }
    } catch (err) {
      console.error('Audio upload failed:', err)
      alert('Failed to upload audio. Please try again.')
    } finally {
      setUploading(false)
      setStatusMessage(null)
    }
  }

  // Video File Upload & Audio Extraction (MP4, WebM, MOV)
  const handleVideoUpload = async (file: File) => {
    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|mkv|avi|m4v)$/i)) {
      alert('Please select a video file (MP4, WebM, MOV)')
      return
    }

    setUploading(true)
    setStatusMessage('Reading video file...')

    try {
      // Extract audio directly in browser via Web Audio API
      const { blob } = await extractAudioFromVideoFile(file, (msg) => {
        setStatusMessage(msg)
      })

      setStatusMessage('Uploading extracted audio track...')
      const supabase = createClient()
      const path = `${weddingId}/${Date.now()}-extracted.wav`

      const { error: uploadError } = await supabase.storage
        .from('wedding-music')
        .upload(path, blob, {
          contentType: 'audio/wav',
          upsert: true,
        })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('wedding-music').getPublicUrl(path)

      if (music) {
        if (music.path) {
          await supabase.storage.from('wedding-music').remove([music.path])
        }
        await supabase.from('music').delete().eq('id', music.id)
      }

      const cleanTitle = file.name.replace(/\.[^/.]+$/, '')
      const { data: musicData, error: dbError } = await supabase
        .from('music')
        .insert({
          wedding_id: weddingId,
          title: cleanTitle,
          artist: 'Extracted from Video',
          url: urlData.publicUrl,
          path,
          type: 'upload',
        })
        .select()
        .single()

      if (dbError) throw dbError

      if (musicData) {
        const item: MusicItem = {
          id: musicData.id,
          weddingId: musicData.wedding_id,
          title: musicData.title,
          artist: musicData.artist,
          url: musicData.url,
          path: musicData.path,
          type: musicData.type,
        }
        setMusic(item)
        onUpdate?.({ music: item })
      }
    } catch (err) {
      console.error('Failed to extract audio from video:', err)
      alert(
        'Could not extract audio track from this video file. Ensure the video contains an audio track or try converting it to MP3.'
      )
    } finally {
      setUploading(false)
      setStatusMessage(null)
    }
  }

  // YouTube Info lookup
  const handleCheckYouTube = async () => {
    if (!ytUrl.trim()) return
    setYtLoading(true)
    setYtError(null)

    try {
      const info = await fetchYouTubeInfo(ytUrl.trim())
      if (!info) {
        setYtError('Invalid YouTube URL. Please provide a standard YouTube video or Shorts link.')
      } else {
        setYtInfo(info)
      }
    } catch {
      setYtError('Unable to fetch video details from YouTube.')
    } finally {
      setYtLoading(false)
    }
  }

  // Select Preset Song
  const handleSelectPreset = async (preset: (typeof PRESET_MUSIC)[0]) => {
    setUploading(true)
    setStatusMessage('Applying preset...')
    try {
      const supabase = createClient()
      if (music) {
        if (music.path) {
          await supabase.storage.from('wedding-music').remove([music.path])
        }
        await supabase.from('music').delete().eq('id', music.id)
      }

      const { data: musicData, error: dbError } = await supabase
        .from('music')
        .insert({
          wedding_id: weddingId,
          title: preset.title,
          artist: preset.artist,
          url: preset.url,
          path: null,
          type: 'preset',
        })
        .select()
        .single()

      if (dbError) throw dbError

      if (musicData) {
        const item: MusicItem = {
          id: musicData.id,
          weddingId: musicData.wedding_id,
          title: musicData.title,
          artist: musicData.artist,
          url: musicData.url,
          path: musicData.path,
          type: musicData.type,
        }
        setMusic(item)
        onUpdate?.({ music: item })
      }
    } catch (err) {
      console.error('Failed to apply preset:', err)
    } finally {
      setUploading(false)
      setStatusMessage(null)
    }
  }

  const removeMusic = async () => {
    if (!music) return
    const supabase = createClient()
    if (music.path) {
      await supabase.storage.from('wedding-music').remove([music.path])
    }
    await supabase.from('music').delete().eq('id', music.id)
    setMusic(null)
    setPlaying(false)
    if (audioRef.current) audioRef.current.pause()
    onUpdate?.({ music: null })
  }

  const togglePlay = () => {
    if (!music?.url || !audioRef.current) return
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setPlaying(!playing)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {music && (
        <audio
          ref={audioRef}
          src={music.url}
          onEnded={() => setPlaying(false)}
          onPause={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
        />
      )}

      {/* ── Active Background Music Card ── */}
      {music ? (
        <div className="bg-gradient-to-br from-amber-50 via-white to-amber-50/50 border border-amber-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center shadow-sm text-white">
              <Music className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Active Music
                </span>
                {music.type === 'upload' && (
                  <span className="text-[10px] text-stone-400">Custom Upload</span>
                )}
              </div>
              <p className="text-sm font-semibold text-stone-800 truncate mt-0.5">
                {music.title}
              </p>
              {music.artist && <p className="text-xs text-stone-500 truncate">{music.artist}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-amber-100">
            <button
              onClick={togglePlay}
              className="flex items-center gap-1.5 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-xl text-xs font-medium shadow-sm transition-all"
            >
              {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {playing ? 'Pause' : 'Play Preview'}
            </button>
            <button
              onClick={removeMusic}
              className="flex items-center gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl text-xs font-medium transition-colors border border-red-200 ml-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-5 text-stone-400 bg-stone-50 rounded-2xl border border-stone-200/70">
          <Volume2 className="w-9 h-9 mx-auto mb-1.5 opacity-40 text-stone-400" />
          <p className="text-xs font-medium text-stone-600">No background music added yet</p>
          <p className="text-[11px] text-stone-400 mt-0.5">
            Choose an option below to add a romantic soundtrack
          </p>
        </div>
      )}

      {/* ── Mode Selection Tabs ── */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-stone-100/80 rounded-xl text-xs font-medium text-stone-600">
        <button
          onClick={() => setActiveTab('video')}
          className={`py-2 px-1 rounded-lg flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
            activeTab === 'video'
              ? 'bg-white text-amber-900 shadow-sm font-semibold'
              : 'hover:text-stone-900'
          }`}
        >
          <Video className="w-3.5 h-3.5 text-amber-600" />
          <span>Video to Audio</span>
        </button>
        <button
          onClick={() => setActiveTab('youtube')}
          className={`py-2 px-1 rounded-lg flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
            activeTab === 'youtube'
              ? 'bg-white text-amber-900 shadow-sm font-semibold'
              : 'hover:text-stone-900'
          }`}
        >
          <YoutubeIcon className="w-3.5 h-3.5 text-red-600" />
          <span>YouTube</span>
        </button>
        <button
          onClick={() => setActiveTab('audio')}
          className={`py-2 px-1 rounded-lg flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
            activeTab === 'audio'
              ? 'bg-white text-amber-900 shadow-sm font-semibold'
              : 'hover:text-stone-900'
          }`}
        >
          <Upload className="w-3.5 h-3.5 text-amber-600" />
          <span>Audio File</span>
        </button>
        <button
          onClick={() => setActiveTab('presets')}
          className={`py-2 px-1 rounded-lg flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
            activeTab === 'presets'
              ? 'bg-white text-amber-900 shadow-sm font-semibold'
              : 'hover:text-stone-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Presets</span>
        </button>
      </div>

      {/* ── Tab 1: Video to Audio Extractor (Requested Feature) ── */}
      {activeTab === 'video' && (
        <div className="space-y-3">
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900">
            <p className="font-semibold flex items-center gap-1.5 mb-1">
              <Video className="w-4 h-4 text-amber-700" />
              Upload YouTube Video or Screen Clip
            </p>
            <p className="text-stone-600 leading-relaxed text-[11px]">
              Upload any downloaded YouTube video, phone screen recording, or clip (.mp4, .webm,
              .mov). ForeverVows will <strong>extract only the audio track</strong> directly in your
              browser with 100% fidelity and set it as your invitation&apos;s background music!
            </p>
          </div>

          <div className="relative">
            <input
              type="file"
              accept="video/*,.mp4,.webm,.mov,.mkv"
              onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              disabled={uploading}
            />
            <div className="flex flex-col items-center justify-center gap-2 py-8 px-4 border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/20 hover:bg-amber-50/60 rounded-2xl text-center transition-all cursor-pointer">
              {uploading ? (
                <>
                  <Loader2 className="w-7 h-7 text-amber-600 animate-spin" />
                  <p className="text-xs font-semibold text-stone-800">
                    {statusMessage || 'Extracting audio track from video...'}
                  </p>
                  <p className="text-[10px] text-stone-400">
                    Decoding video audio track into high-fidelity music...
                  </p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-800 shadow-sm">
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-stone-800">
                      Drop YouTube Video Clip Here
                    </p>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      or click to browse (.mp4, .webm, .mov)
                    </p>
                  </div>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-medium">
                    ⚡ Instant Audio Track Extractor
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: YouTube URL Info & Conversion ── */}
      {activeTab === 'youtube' && (
        <div className="space-y-3">
          <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800">
              <YoutubeIcon className="w-4 h-4 text-red-600" />
              <span>YouTube Video Song Finder</span>
            </div>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Paste a link to any YouTube song or wedding music video to inspect its title and details.
            </p>

            <div className="flex gap-2">
              <input
                type="url"
                value={ytUrl}
                onChange={(e) => setYtUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                onClick={handleCheckYouTube}
                disabled={ytLoading || !ytUrl.trim()}
                className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
              >
                {ytLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Look Up'}
              </button>
            </div>

            {ytError && <p className="text-xs text-red-600">{ytError}</p>}

            {/* Video preview card */}
            {ytInfo && (
              <div className="bg-white border border-stone-200 rounded-xl p-3 space-y-3 mt-3">
                <div className="flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ytInfo.thumbnailUrl}
                    alt={ytInfo.title}
                    className="w-24 h-16 object-cover rounded-lg bg-stone-100 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-stone-800 line-clamp-2">
                      {ytInfo.title}
                    </p>
                    <p className="text-[11px] text-stone-500 mt-0.5">{ytInfo.author}</p>
                    <a
                      href={ytInfo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-amber-700 hover:underline mt-1"
                    >
                      <span>Open on YouTube</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-[11px] text-amber-900 space-y-1.5">
                  <p className="font-medium flex items-center gap-1 text-amber-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                    Song Identified!
                  </p>
                  <p className="text-stone-600">
                    To use this YouTube video&apos;s audio in your invitation:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-stone-600 pl-1">
                    <li>Download the clip or audio using your browser or screen recorder.</li>
                    <li>
                      Switch to the <strong>&ldquo;Video to Audio&rdquo;</strong> tab above and drop the file.
                    </li>
                  </ol>
                  <button
                    onClick={() => setActiveTab('video')}
                    className="w-full mt-2 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    Go to Video Audio Extractor →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab 3: Standard Audio File Upload ── */}
      {activeTab === 'audio' && (
        <div className="space-y-3">
          <div className="relative">
            <input
              type="file"
              accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
              onChange={(e) => e.target.files?.[0] && handleAudioUpload(e.target.files[0])}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              disabled={uploading}
            />
            <div className="flex flex-col items-center justify-center gap-2 py-8 px-4 border-2 border-dashed border-stone-200 hover:border-amber-400 bg-stone-50/50 hover:bg-amber-50/40 rounded-2xl text-center transition-all cursor-pointer">
              {uploading ? (
                <>
                  <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
                  <p className="text-xs font-semibold text-stone-800">
                    {statusMessage || 'Uploading audio file...'}
                  </p>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-800">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-stone-800">
                      Upload Audio File (MP3, WAV, AAC, M4A)
                    </p>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Max 20MB. Clear wedding songs or instrumentals recommended.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 4: Pre-curated Presets ── */}
      {activeTab === 'presets' && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">
            Royalty-Free Wedding Tunes
          </p>
          {PRESET_MUSIC.map((preset) => (
            <div
              key={preset.id}
              className="flex items-center justify-between p-3 bg-stone-50 hover:bg-amber-50/60 border border-stone-200/80 rounded-xl transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-stone-800 truncate">{preset.title}</p>
                <p className="text-[11px] text-stone-500 truncate">{preset.artist}</p>
              </div>
              <button
                onClick={() => handleSelectPreset(preset)}
                disabled={uploading}
                className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-medium transition-colors ml-3"
              >
                Use Song
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Floating Player Explainer */}
      <div className="bg-stone-50 border border-stone-100 rounded-xl p-3">
        <p className="text-[11px] text-stone-500 leading-relaxed">
          🎵 When guests open your invitation, a subtle floating music button appears. Guests can
          mute, play, or adjust volume at any time. Music plays seamlessly without opening YouTube.
        </p>
      </div>
    </div>
  )
}
