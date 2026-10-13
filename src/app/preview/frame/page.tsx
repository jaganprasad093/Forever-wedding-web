'use client'

import { useEffect, useSyncExternalStore } from 'react'
import PublishedWeddingPage from '@/components/wedding/PublishedWeddingPage'
import { WeddingData } from '@/types/wedding'

const emptySubscribe = () => () => {}

let currentWedding: WeddingData | null = null
const listeners = new Set<() => void>()

function subscribeWedding(callback: () => void) {
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
  }
}

function getWeddingSnapshot(): WeddingData | null {
  if (currentWedding) return currentWedding
  try {
    const cached = window.sessionStorage.getItem('forever_vows_preview_cache')
    if (cached) {
      currentWedding = JSON.parse(cached)
      return currentWedding
    }
  } catch {
    // Ignore sessionStorage parsing errors
  }
  return null
}

function getServerWeddingSnapshot(): WeddingData | null {
  return null
}

export default function PreviewFramePage() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  const wedding = useSyncExternalStore(
    subscribeWedding,
    getWeddingSnapshot,
    getServerWeddingSnapshot
  )

  useEffect(() => {
    // Notify parent editor that the preview iframe is mounted and ready
    try {
      window.parent?.postMessage({ type: 'PREVIEW_FRAME_READY' }, '*')
    } catch {
      // Ignore cross-origin error if any
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'UPDATE_WEDDING_DATA' && event.data.wedding) {
        currentWedding = event.data.wedding
        listeners.forEach((listener) => listener())
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Prevent link clicks inside preview from navigating the iframe away
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest('a')
      if (anchor) {
        const href = anchor.getAttribute('href')
        // Allow external direction links (e.g. google maps) to open in new tab
        if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
          anchor.setAttribute('target', '_blank')
          anchor.setAttribute('rel', 'noopener noreferrer')
        } else if (href && (href.startsWith('/') || href.startsWith('#'))) {
          // Prevent internal navigation inside the preview frame
          e.preventDefault()
        }
      }
    }

    document.addEventListener('click', handleClick, { capture: true })
    return () => document.removeEventListener('click', handleClick, { capture: true })
  }, [])

  if (!isMounted || !wedding) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center text-amber-200/80 p-6 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin mb-3" />
        <p className="text-xs tracking-widest uppercase font-sans">Connecting Live Preview...</p>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full bg-stone-900 overflow-x-hidden">
      <PublishedWeddingPage wedding={wedding} />
    </div>
  )
}
