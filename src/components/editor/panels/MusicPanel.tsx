'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, Play, Pause, Trash2, Music, Loader2, Volume2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { MusicItem } from '@/types/wedding'

const PRESET_MUSIC = [
  { id: 'preset-1', title: 'Wedding Bells', artist: 'Classical', url: '', category: 'Instrumental' },
  { id: 'preset-2', title: 'Canon in D', artist: 'Pachelbel', url: '', category: 'Romantic' },
  { id: 'preset-3', title: 'A Thousand Years', artist: 'Christina Perri', url: '', category: 'English' },
]

export default function MusicPanel({ weddingId }: { weddingId: string }) {
  const [music, setMusic] = useState<MusicItem | null>(null)
  const [uploading, setUploading] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    loadMusic()
  }, [weddingId])

  const loadMusic = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('music')
      .select('*')
      .eq('wedding_id', weddingId)
      .single()

    if (data) {
      setMusic({
        id: data.id,
        weddingId: data.wedding_id,
        title: data.title,
        artist: data.artist,
        url: data.url,
        path: data.path,
        type: data.type,
      })
    }
    setLoading(false)
  }

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('audio/')) return
    setUploading(true)

    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${weddingId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('wedding-music')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage.from('wedding-music').getPublicUrl(path)

    // Remove existing music
    if (music) {
      await supabase.from('music').delete().eq('id', music.id)
    }

    const { data: musicData } = await supabase
      .from('music')
      .insert({
        wedding_id: weddingId,
        title: file.name.replace(/\.[^/.]+$/, ''),
        url: urlData.publicUrl,
        path,
        type: 'upload',
      })
      .select()
      .single()

    if (musicData) {
      setMusic({
        id: musicData.id,
        weddingId: musicData.wedding_id,
        title: musicData.title,
        artist: musicData.artist,
        url: musicData.url,
        path: musicData.path,
        type: musicData.type,
      })
    }
    setUploading(false)
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
    return <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="space-y-4">
      {music && (
        <audio ref={audioRef} src={music.url} onEnded={() => setPlaying(false)} />
      )}

      {/* Current music */}
      {music ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <Music className="w-5 h-5 text-amber-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-800 truncate">{music.title}</p>
              {music.artist && <p className="text-xs text-stone-500">{music.artist}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="flex items-center gap-1.5 bg-amber-700 text-white px-4 py-2 rounded-full text-xs font-medium hover:bg-amber-800 transition-colors"
            >
              {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {playing ? 'Pause' : 'Play Preview'}
            </button>
            <button
              onClick={removeMusic}
              className="flex items-center gap-1.5 text-red-600 px-3 py-2 rounded-full text-xs font-medium hover:bg-red-50 transition-colors border border-red-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-stone-400 bg-stone-50 rounded-xl border border-stone-100">
          <Volume2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-xs">No music selected</p>
        </div>
      )}

      {/* Upload */}
      <div className="relative">
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          className="absolute inset-0 opacity-0 cursor-pointer"
          disabled={uploading}
        />
        <div className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-stone-200 rounded-xl text-sm text-stone-500 hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50/50 transition-all cursor-pointer">
          {uploading ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Uploading...</>
          ) : (
            <><Upload className="w-4 h-4" />Upload Custom Music (MP3, AAC)</>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="bg-stone-50 border border-stone-100 rounded-xl p-3">
        <p className="text-xs text-stone-500">
          🎵 Music will play automatically when guests open your invitation (respects browser autoplay policies). A floating music button allows guests to pause/resume.
        </p>
      </div>
    </div>
  )
}
