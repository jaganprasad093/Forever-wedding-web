'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Upload,
  Trash2,
  Star,
  Loader2,
  Image as ImageIcon,
  AlertCircle,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { GalleryItem } from '@/types/wedding'

export default function GalleryPanel({ weddingId }: { weddingId: string }) {
  const [photos, setPhotos] = useState<GalleryItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [settingCoverId, setSettingCoverId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    async function fetchPhotos() {
      const supabase = createClient()
      const { data } = await supabase
        .from('gallery')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('order_index', { ascending: true })

      if (!ignore) {
        if (data) {
          setPhotos(
            data.map((p) => ({
              id: p.id,
              weddingId: p.wedding_id,
              url: p.url,
              path: p.path,
              isCover: p.is_cover,
              orderIndex: p.order_index,
            }))
          )
        }
        setLoading(false)
      }
    }

    void fetchPhotos()
    return () => {
      ignore = true
    }
  }, [weddingId])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return
      setUploading(true)
      setErrorMessage(null)
      const supabase = createClient()

      let failedCount = 0

      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i]
        const ext = file.name.split('.').pop() || 'jpg'
        const path = `${weddingId}/${Date.now()}-${i}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('wedding-images')
          .upload(path, file, { upsert: true })

        if (uploadError) {
          console.error('Upload error', uploadError)
          failedCount++
          continue
        }

        const { data: urlData } = supabase.storage
          .from('wedding-images')
          .getPublicUrl(path)

        const { data: photoData, error: dbError } = await supabase
          .from('gallery')
          .insert({
            wedding_id: weddingId,
            url: urlData.publicUrl,
            path,
            is_cover: photos.length === 0 && i === 0,
            order_index: photos.length + i,
          })
          .select()
          .single()

        if (dbError || !photoData) {
          console.error('DB error', dbError)
          failedCount++
          continue
        }

        setPhotos((prev) => [
          ...prev,
          {
            id: photoData.id,
            weddingId: photoData.wedding_id,
            url: photoData.url,
            path: photoData.path,
            isCover: photoData.is_cover,
            orderIndex: photoData.order_index,
          },
        ])

        setUploadProgress(((i + 1) / acceptedFiles.length) * 100)
      }

      if (failedCount > 0) {
        setErrorMessage(
          `Failed to upload ${failedCount} photo(s). Please check your connection or file size.`
        )
      }

      setUploading(false)
      setUploadProgress(0)
    },
    [weddingId, photos.length]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    multiple: true,
  })

  const deletePhoto = async (photo: GalleryItem) => {
    try {
      setDeletingId(photo.id)
      setErrorMessage(null)
      const supabase = createClient()
      await supabase.storage.from('wedding-images').remove([photo.path])
      await supabase.from('gallery').delete().eq('id', photo.id)
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
    } catch (err) {
      console.error('Failed to delete photo', err)
      setErrorMessage('Could not delete photo. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const setCover = async (photoId: string) => {
    try {
      setSettingCoverId(photoId)
      setErrorMessage(null)
      const supabase = createClient()
      // Remove cover flag from all photos in this wedding
      await supabase.from('gallery').update({ is_cover: false }).eq('wedding_id', weddingId)
      // Set new cover
      await supabase.from('gallery').update({ is_cover: true }).eq('id', photoId)
      setPhotos((prev) => prev.map((p) => ({ ...p, isCover: p.id === photoId })))
    } catch (err) {
      console.error('Failed to set cover photo', err)
      setErrorMessage('Could not update cover photo. Please try again.')
    } finally {
      setSettingCoverId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-36">
        <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Error alert */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start justify-between gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700"
        >
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span className="truncate">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="p-1 text-red-500 hover:text-red-700 rounded transition-colors"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Upload dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-5 sm:p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400/30'
            : 'border-stone-300 hover:border-amber-400 hover:bg-amber-50/40 bg-stone-50/50'
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="space-y-3 py-2">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
            <p className="text-xs sm:text-sm font-medium text-stone-700">
              Uploading photos… {Math.round(uploadProgress)}%
            </p>
            <div className="w-full max-w-xs mx-auto bg-stone-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-600 h-1.5 rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-11 h-11 rounded-full bg-amber-100/70 text-amber-700 flex items-center justify-center mb-2.5">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-stone-800">
              {isDragActive ? 'Drop photos here' : 'Upload couple photos'}
            </p>
            <p className="text-[11px] sm:text-xs text-stone-400 mt-0.5">
              JPG, PNG, WEBP · Up to 10MB
            </p>
            {/* Dedicated clickable button for mobile & touch users */}
            <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#8c6b48] hover:bg-[#795938] text-white text-xs font-medium shadow-sm transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Choose Photos</span>
            </div>
          </div>
        )}
      </div>

      {/* Photos grid */}
      {photos.length > 0 && (
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-xs text-stone-500 px-0.5">
            <span className="font-medium text-stone-700">
              Photos ({photos.length})
            </span>
            <span className="text-[11px] text-stone-400">
              Tap ★ to set cover · 🗑 to delete
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative group aspect-square rounded-xl overflow-hidden bg-stone-100 border border-stone-200/80 shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt="Wedding gallery photo"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Top gradient shadow so buttons are clear against light or dark photos */}
                <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/60 via-black/25 to-transparent pointer-events-none opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" />

                {/* Cover badge / Set cover button (top left) */}
                <div className="absolute top-2 left-2 z-10">
                  {photo.isCover ? (
                    <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-md backdrop-blur-sm">
                      <Star className="w-2.5 h-2.5 fill-white" />
                      Cover
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setCover(photo.id)
                      }}
                      disabled={settingCoverId === photo.id || deletingId === photo.id}
                      title="Set as cover photo"
                      aria-label="Set as cover photo"
                      className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/50 hover:bg-amber-500 active:scale-95 text-white shadow-md backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      {settingCoverId === photo.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Star className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>

                {/* Delete button (top right - always visible on mobile/responsive, hover-revealed on desktop) */}
                <div className="absolute top-2 right-2 z-10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      deletePhoto(photo)
                    }}
                    disabled={deletingId === photo.id}
                    title="Delete photo"
                    aria-label="Delete photo"
                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/50 hover:bg-red-600 active:scale-95 text-white shadow-md backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    {deletingId === photo.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Deleting overlay indicator */}
                {deletingId === photo.id && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {photos.length === 0 && !uploading && (
        <div className="text-center py-8 text-stone-400 border border-stone-100 rounded-2xl bg-white">
          <ImageIcon className="w-10 h-10 mx-auto mb-2 text-stone-300" />
          <p className="text-xs font-medium text-stone-600">No photos uploaded yet</p>
          <p className="text-[11px] text-stone-400 mt-0.5">
            Add pictures to display your moments on your invitation
          </p>
        </div>
      )}
    </div>
  )
}
