'use client'

import { motion } from 'framer-motion'
import { WeddingData } from '@/types/wedding'
import { formatDate, formatTime } from '@/lib/utils'
import { MapPin, Clock, Calendar, Heart } from 'lucide-react'

export default function WeddingPreviewFrame({ wedding }: { wedding: WeddingData }) {
  const theme = wedding.theme
  const primaryColor = theme.primaryColor || '#92400e'
  const backgroundColor = theme.backgroundColor || '#fffbeb'
  const accentColor = theme.accentColor || '#fcd34d'

  const coupleName = [wedding.groomName, wedding.brideName].filter(Boolean)
  const hasCouple = coupleName.length > 0

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor, fontFamily: theme.fontFamily === 'inter' ? 'Inter, sans-serif' : 'Cormorant Garamond, serif' }}
    >
      {/* Hero */}
      <div
        className="relative flex flex-col items-center justify-center py-16 px-6 text-center"
        style={{ backgroundColor: primaryColor }}
      >
        {/* Ornament */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l border-t opacity-30" style={{ borderColor: accentColor }} />
        <div className="absolute top-4 right-4 w-8 h-8 border-r border-t opacity-30" style={{ borderColor: accentColor }} />

        <p className="text-xs uppercase tracking-[0.3em] mb-4 opacity-60" style={{ color: accentColor }}>
          Wedding Invitation
        </p>

        {hasCouple ? (
          <>
            <motion.h1
              key={wedding.groomName}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-4xl font-medium mb-1"
              style={{ color: accentColor }}
            >
              {wedding.groomName || 'Groom'}
            </motion.h1>
            <p className="text-2xl opacity-60 mb-1" style={{ color: accentColor }}>&amp;</p>
            <motion.h1
              key={wedding.brideName}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-4xl font-medium mb-6"
              style={{ color: accentColor }}
            >
              {wedding.brideName || 'Bride'}
            </motion.h1>
          </>
        ) : (
          <div className="mb-6">
            <p className="text-2xl opacity-40" style={{ color: accentColor }}>
              Groom &amp; Bride
            </p>
          </div>
        )}

        <div className="w-12 h-px opacity-40 mb-4" style={{ backgroundColor: accentColor }} />

        {wedding.weddingDate && (
          <p className="text-sm opacity-70 mb-1" style={{ color: accentColor }}>
            {formatDate(wedding.weddingDate)}
          </p>
        )}
        {wedding.weddingTime && (
          <p className="text-xs opacity-50" style={{ color: accentColor }}>
            {formatTime(wedding.weddingTime)}
          </p>
        )}

        <div className="absolute bottom-4 left-4 w-8 h-8 border-l border-b opacity-30" style={{ borderColor: accentColor }} />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r border-b opacity-30" style={{ borderColor: accentColor }} />
      </div>

      {/* Details sections */}
      <div className="px-6 py-8 space-y-6">
        {/* Venue */}
        {(wedding.venueName || wedding.venueAddress) && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MapPin className="w-4 h-4" style={{ color: primaryColor }} />
              <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: primaryColor }}>
                Venue
              </h2>
            </div>
            {wedding.venueName && (
              <p className="text-base font-medium" style={{ color: primaryColor }}>{wedding.venueName}</p>
            )}
            {wedding.venueAddress && (
              <p className="text-xs opacity-60 mt-1" style={{ color: primaryColor }}>{wedding.venueAddress}</p>
            )}
          </div>
        )}

        {/* Story */}
        {wedding.story && (
          <div
            className="rounded-xl p-4 border"
            style={{ borderColor: `${accentColor}50`, backgroundColor: `${accentColor}10` }}
          >
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-2 text-center" style={{ color: primaryColor }}>
              Our Story
            </h2>
            <p className="text-xs leading-relaxed text-center opacity-80 line-clamp-3" style={{ color: primaryColor }}>
              {wedding.story}
            </p>
          </div>
        )}

        {/* Events */}
        {wedding.events && wedding.events.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-3 text-center" style={{ color: primaryColor }}>
              Events
            </h2>
            <div className="space-y-2">
              {wedding.events.slice(0, 2).map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: `${accentColor}15` }}>
                  <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: primaryColor }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: primaryColor }}>{event.title}</p>
                    {event.date && <p className="text-xs opacity-60" style={{ color: primaryColor }}>{formatDate(event.date)}</p>}
                    {event.venue && <p className="text-xs opacity-50" style={{ color: primaryColor }}>{event.venue}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-4 border-t" style={{ borderColor: `${accentColor}40` }}>
          <Heart className="w-4 h-4 mx-auto mb-1" style={{ color: primaryColor, fill: primaryColor, opacity: 0.4 }} />
          <p className="text-xs opacity-40" style={{ color: primaryColor }}>
            With love & joy
          </p>
        </div>
      </div>
    </div>
  )
}
