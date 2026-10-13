'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { WeddingData } from '@/types/wedding'

export default function WeddingPreviewFrame({ wedding }: { wedding: WeddingData }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isIframeLoaded, setIsIframeLoaded] = useState(false)

  // Cache latest wedding state in sessionStorage for zero-flash initial render
  useEffect(() => {
    try {
      window.sessionStorage.setItem('forever_vows_preview_cache', JSON.stringify(wedding))
    } catch {
      // Ignore quota/access errors
    }
  }, [wedding])

  // Post latest wedding data to the iframe
  const sendWeddingUpdate = useCallback(() => {
    const iframe = iframeRef.current
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          type: 'UPDATE_WEDDING_DATA',
          wedding,
        },
        '*'
      )
    }
  }, [wedding])

  // Automatically send update whenever wedding data changes in the editor
  useEffect(() => {
    if (isIframeLoaded) {
      sendWeddingUpdate()
    }
  }, [wedding, isIframeLoaded, sendWeddingUpdate])

  // Listen for PREVIEW_FRAME_READY notification from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PREVIEW_FRAME_READY') {
        setIsIframeLoaded(true)
        sendWeddingUpdate()
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [sendWeddingUpdate])

  const handleIframeLoad = () => {
    setIsIframeLoaded(true)
    sendWeddingUpdate()
  }

  return (
    <div className="relative w-full h-full min-h-full bg-stone-900 overflow-hidden flex flex-col">
      <iframe
        ref={iframeRef}
        src="/preview/frame"
        title="Wedding Invitation Preview"
        className="w-full h-full flex-1 border-0 block bg-stone-900"
        allow="autoplay"
        onLoad={handleIframeLoad}
      />
    </div>
  )
}
