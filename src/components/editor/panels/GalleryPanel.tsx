'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
import { GalleryItem, WeddingData } from '@/types/wedding'

/**
 * Touch devices: action buttons are always visible.
 * Hover devices (mouse): revealed on hover or keyboard focus.
 * Uses the hover media query instead of the `sm:` breakpoint, so touch
 * tablets (which are wider than `sm`) don't lose the buttons.
 */
const REVEAL =
  'opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100'

const ACTION_BTN =
  'flex h-9 w-9 shrink-0 touch-manipulation items-center justify-center rounded-full bg-black/55 text-white shadow-md backdrop-blur-sm transition-all active:scale-95 focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-70'

export default function GalleryPanel({
  weddingId,
  initialPhotos,
  onUpdate,
}: {
  weddingId: string
  initialPhotos?: GalleryItem[]
  onUpdate?: (updates: Partial<WeddingData>) => void
}) {
  const [photos, setPhotos] = useState<GalleryItem[]>(initialPhotos || [])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [loading, setLoading] = useState(!initialPhotos || initialPhotos.length === 0)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [settingCoverId, setSettingCoverId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onUpdateRef = useRef(onUpdate)
  useEffect(() => {
    onUpdateRef.current = onUpdate
  }, [onUpdate])

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
          const mapped = data.map((p) => ({
            id: p.id,
            weddingId: p.wedding_id,
            url: p.url,
            path: p.path,
            isCover: p.is_cover,
            orderIndex: p.order_index,
          }))
          setPhotos(mapped)
          onUpdateRef.current?.({ gallery: mapped })
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
      setUploadProgress(0)
      setErrorMessage(null)
      const supabase = createClient()

      let failedCount = 0

      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i]
        const ext = file.name.split('.').pop() || 'jpg'
        const path = `${weddingId}/${Date.now()}-${i}.${ext}`

        try {
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
        } catch (err) {
          console.error('Unexpected upload failure', err)
          failedCount++
        } finally {
          // Progress now advances on failures too (it used to stall).
          setUploadProgress(((i + 1) / acceptedFiles.length) * 100)
        }
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
    disabled: uploading,
  })

  const deletePhoto = async (photo: GalleryItem) => {
    try {
      setDeletingId(photo.id)
      setErrorMessage(null)
      const supabase = createClient()
      await supabase.storage.from('wedding-images').remove([photo.path])
      await supabase.from('gallery').delete().eq('id', photo.id)
      setPhotos((prev) => {
        const next = prev.filter((p) => p.id !== photo.id)
        onUpdateRef.current?.({ gallery: next })
        return next
      })
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
      setPhotos((prev) => {
        const next = prev.map((p) => ({ ...p, isCover: p.id === photoId }))
        onUpdateRef.current?.({ gallery: next })
        return next
      })
    } catch (err) {
      console.error('Failed to set cover photo', err)
      setErrorMessage('Could not update cover photo. Please try again.')
    } finally {
      setSettingCoverId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-36 items-center justify-center" role="status" aria-label="Loading photos">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="w-full min-w-0 space-y-4">
      {/* Error alert (wraps instead of truncating, so the full message is readable on phones) */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start justify-between gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 sm:text-sm"
        >
          <div className="flex min-w-0 items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <span className="min-w-0 break-words">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="-m-1 flex h-8 w-8 shrink-0 items-center justify-center rounded text-red-500 transition-colors hover:text-red-700"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload dropzone */}
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-4 text-center transition-all duration-200 min-[420px]:p-5 sm:p-6 ${isDragActive
          ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400/30'
          : 'border-stone-300 bg-stone-50/50 hover:border-amber-400 hover:bg-amber-50/40'
          } ${uploading ? 'cursor-progress' : ''}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="space-y-3 py-2" role="status" aria-live="polite">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-amber-600" />
            <p className="text-xs font-medium text-stone-700 sm:text-sm">
              Uploading photos… {Math.round(uploadProgress)}%
            </p>
            <div className="mx-auto h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-stone-200">
              <div
                className="h-1.5 rounded-full bg-amber-600 transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="mb-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-amber-100/70 text-amber-700 sm:h-12 sm:w-12">
              <Upload className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-stone-800">
              {isDragActive ? 'Drop photos here' : 'Upload couple photos'}
            </p>
            {/* "Drag & drop" copy only where a mouse exists */}
            <p className="mt-0.5 text-xs text-stone-500">
              <span className="hidden [@media(hover:hover)]:inline">Drag and drop, or </span>
              <span className="[@media(hover:hover)]:hidden">Tap to </span>
              <span className="hidden [@media(hover:hover)]:inline">click to </span>
              choose photos
            </p>
            <p className="mt-0.5 text-[11px] text-stone-400 sm:text-xs">JPG, PNG, WEBP · Up to 10MB</p>
            <div className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-[#8c6b48] px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-[#795938] sm:text-sm">
              <Upload className="h-3.5 w-3.5" />
              <span>Choose photos</span>
            </div>
          </div>
        )}
      </div>

      {/* Photos grid */}
      {photos.length > 0 && (
        <div className="space-y-2.5 pt-1">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-0.5 text-xs text-stone-500">
            <span className="font-medium text-stone-700">Photos ({photos.length})</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-stone-400 sm:text-xs">
              <Star className="h-3 w-3" aria-hidden /> set cover
              <span aria-hidden>·</span>
              <Trash2 className="h-3 w-3" aria-hidden /> delete
            </span>
          </div>

          {/* auto-fill adapts to the panel's own width, not the viewport,
              so it works in a narrow sidebar and a full-width page alike */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,8.5rem),1fr))] gap-2.5 sm:gap-3">
            {photos.map((photo) => {
              const busy = deletingId === photo.id || settingCoverId === photo.id
              return (
                <div
                  key={photo.id}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-stone-200/80 bg-stone-100 shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt="Wedding gallery photo"
                    className="h-full w-full object-cover transition-transform duration-300 [@media(hover:hover)]:group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />

                  {/* Top scrim so buttons stay legible on light photos */}
                  <div
                    className={`pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/60 via-black/25 to-transparent transition-opacity ${REVEAL}`}
                  />

                  {/* Cover badge / set-cover button */}
                  <div className="absolute left-1.5 top-1.5 z-10 sm:left-2 sm:top-2">
                    {photo.isCover ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-1 text-[10px] font-semibold text-white shadow-md">
                        <Star className="h-2.5 w-2.5 fill-white" />
                        Cover
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          void setCover(photo.id)
                        }}
                        disabled={busy}
                        title="Set as cover photo"
                        aria-label="Set as cover photo"
                        className={`${ACTION_BTN} ${REVEAL} hover:bg-amber-500 focus-visible:ring-amber-400`}
                      >
                        {settingCoverId === photo.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Star className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Delete */}
                  <div className="absolute right-1.5 top-1.5 z-10 sm:right-2 sm:top-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        void deletePhoto(photo)
                      }}
                      disabled={busy}
                      title="Delete photo"
                      aria-label="Delete photo"
                      className={`${ACTION_BTN} ${REVEAL} hover:bg-red-600 focus-visible:ring-red-400`}
                    >
                      {deletingId === photo.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {deletingId === photo.id && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {photos.length === 0 && !uploading && (
        <div className="rounded-2xl border border-stone-100 bg-white px-4 py-8 text-center text-stone-400">
          <ImageIcon className="mx-auto mb-2 h-10 w-10 text-stone-300" />
          <p className="text-xs font-medium text-stone-600 sm:text-sm">No photos uploaded yet</p>
          <p className="mx-auto mt-0.5 max-w-xs text-[11px] text-stone-400 sm:text-xs">
            Add pictures to display your moments on your invitation
          </p>
        </div>
      )}
    </div>
  )
}