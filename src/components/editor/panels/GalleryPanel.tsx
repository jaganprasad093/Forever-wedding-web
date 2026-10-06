'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Trash2, Star, Loader2, Image as ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { GalleryItem } from '@/types/wedding'

export default function GalleryPanel({ weddingId }: { weddingId: string }) {
  const [photos, setPhotos] = useState<GalleryItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPhotos()
  }, [weddingId])

  const loadPhotos = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('gallery')
      .select('*')
      .eq('wedding_id', weddingId)
      .order('order_index', { ascending: true })

    if (data) {
      setPhotos(data.map((p) => ({
        id: p.id,
        weddingId: p.wedding_id,
        url: p.url,
        path: p.path,
        isCover: p.is_cover,
        orderIndex: p.order_index,
      })))
    }
    setLoading(false)
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true)
    const supabase = createClient()

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i]
      const ext = file.name.split('.').pop()
      const path = `${weddingId}/${Date.now()}-${i}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('wedding-images')
        .upload(path, file, { upsert: true })

      if (uploadError) continue

      const { data: urlData } = supabase.storage
        .from('wedding-images')
        .getPublicUrl(path)

      const { data: photoData } = await supabase
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

      if (photoData) {
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
      }

      setUploadProgress(((i + 1) / acceptedFiles.length) * 100)
    }

    setUploading(false)
    setUploadProgress(0)
  }, [weddingId, photos.length])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    multiple: true,
  })

  const deletePhoto = async (photo: GalleryItem) => {
    const supabase = createClient()
    await supabase.storage.from('wedding-images').remove([photo.path])
    await supabase.from('gallery').delete().eq('id', photo.id)
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
  }

  const setCover = async (photoId: string) => {
    const supabase = createClient()
    // Remove cover from all
    await supabase.from('gallery').update({ is_cover: false }).eq('wedding_id', weddingId)
    // Set new cover
    await supabase.from('gallery').update({ is_cover: true }).eq('id', photoId)
    setPhotos((prev) => prev.map((p) => ({ ...p, isCover: p.id === photoId })))
  }

  if (loading) {
    return <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="space-y-4">
      {/* Upload zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-amber-500 bg-amber-50'
            : 'border-stone-200 hover:border-amber-400 hover:bg-amber-50/50'
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="space-y-2">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
            <p className="text-sm text-stone-600">Uploading... {Math.round(uploadProgress)}%</p>
            <div className="w-full bg-stone-200 rounded-full h-1.5">
              <div
                className="bg-amber-500 h-1.5 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-stone-700">
              {isDragActive ? 'Drop photos here' : 'Upload couple photos'}
            </p>
            <p className="text-xs text-stone-400 mt-1">
              Drag & drop or click · JPG, PNG, WEBP
            </p>
          </>
        )}
      </div>

      {/* Photos grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden bg-stone-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt="Gallery"
                className="w-full h-full object-cover"
              />
              {photo.isCover && (
                <div className="absolute top-1 left-1 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 fill-white" />
                  Cover
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                {!photo.isCover && (
                  <button
                    onClick={() => setCover(photo.id)}
                    className="p-1.5 bg-white/90 rounded-full text-amber-600"
                    title="Set as cover"
                  >
                    <Star className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={() => deletePhoto(photo)}
                  className="p-1.5 bg-white/90 rounded-full text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {photos.length === 0 && !uploading && (
        <div className="text-center py-6 text-stone-400">
          <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-xs">No photos uploaded yet</p>
        </div>
      )}
    </div>
  )
}
