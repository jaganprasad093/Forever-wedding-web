'use client'

import { WeddingData } from '@/types/wedding'
import PublishedWeddingPage from '@/components/wedding/PublishedWeddingPage'

export default function WeddingPreviewFrame({ wedding }: { wedding: WeddingData }) {
  return (
    <div className="relative w-full min-h-screen bg-stone-900 overflow-x-hidden [contain:paint]">
      <PublishedWeddingPage wedding={wedding} />
    </div>
  )
}
