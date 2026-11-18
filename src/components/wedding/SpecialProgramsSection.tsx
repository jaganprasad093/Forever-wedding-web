'use client'

import Image from 'next/image'
import { SpecialProgram } from '@/types/wedding'

interface Props {
  programs: SpecialProgram[]
  /**
   * Accent colour matched to the template's primary colour.
   * Falls back to warm amber that suits every template background.
   */
  accentColor?: string
  /** Light or dark background context — tweaks text colours. */
  variant?: 'light' | 'dark'
}

export default function SpecialProgramsSection({
  programs,
  accentColor = '#b45309',
  variant = 'light',
}: Props) {
  if (!programs || programs.length === 0) return null

  const isDark = variant === 'dark'

  const headingColor    = isDark ? '#f5f0eb'                : '#3b2a1a'
  const cardBg          = isDark ? 'rgba(255,255,255,0.08)'  : 'rgba(255,255,255,0.90)'
  const cardBorder      = isDark ? 'rgba(255,255,255,0.14)'  : 'rgba(0,0,0,0.07)'
  const titleColor      = isDark ? '#f5f0eb'                : '#2d1f10'
  const descColor       = isDark ? 'rgba(245,240,235,0.70)' : 'rgba(59,42,26,0.60)'
  const tagBg           = isDark ? 'rgba(255,255,255,0.12)' : accentColor + '18'
  const tagColor        = isDark ? '#f5e9d8'                : accentColor

  return (
    <section
      style={{
        padding: 'clamp(4rem, 9vw, 7rem) clamp(1.25rem, 5vw, 3rem)',
        background: isDark ? 'rgba(0,0,0,0.20)' : 'rgba(248,245,240,0.60)',
      }}
    >
      {/* ── Heading ── */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        {/* Top ornament line */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ flex: 1, maxWidth: '4rem', height: '1px', background: accentColor, opacity: 0.5 }} />
          <span style={{ fontSize: '1.1rem', opacity: 0.8 }}>✦</span>
          <div style={{ flex: 1, maxWidth: '4rem', height: '1px', background: accentColor, opacity: 0.5 }} />
        </div>

        <h2
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
            fontWeight: 400,
            letterSpacing: '0.07em',
            color: headingColor,
            margin: '0 0 0.5rem',
            lineHeight: 1.2,
          }}
        >
          A Few Things to Know
        </h2>
        <p
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(0.8rem, 1.5vw, 0.95rem)',
            color: descColor,
            margin: 0,
            fontStyle: 'italic',
            letterSpacing: '0.03em',
          }}
        >
          We want your day to be as perfect as ours
        </p>

        {/* Bottom ornament line */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginTop: '1.25rem',
          }}
        >
          <div style={{ flex: 1, maxWidth: '4rem', height: '1px', background: accentColor, opacity: 0.5 }} />
          <span style={{ fontSize: '1.1rem', opacity: 0.8 }}>✦</span>
          <div style={{ flex: 1, maxWidth: '4rem', height: '1px', background: accentColor, opacity: 0.5 }} />
        </div>
      </div>

      {/* ── Cards grid ── */}
      <div
        style={{
          maxWidth: '64rem',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {programs.map((program) => {
          const hasImage = !!program.imageUrl

          return hasImage ? (
            /* ── Image card (tall) ── */
            <div
              key={program.id}
              style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: '1.25rem',
                overflow: 'hidden',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: isDark
                  ? '0 4px 24px rgba(0,0,0,0.3)'
                  : '0 4px 20px rgba(0,0,0,0.07)',
              }}
            >
              {/* Cover image */}
              <div style={{ position: 'relative', width: '100%', paddingTop: '62%' }}>
                <Image
                  src={program.imageUrl!}
                  alt={program.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, 320px"
                  unoptimized
                />
                {/* Gradient overlay at bottom so title is readable */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)',
                  }}
                />
                {/* Icon badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '0.75rem',
                    left: '0.75rem',
                    width: '2.25rem',
                    height: '2.25rem',
                    borderRadius: '0.6rem',
                    background: 'rgba(255,255,255,0.90)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    backdropFilter: 'blur(4px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}
                >
                  {program.icon}
                </div>
              </div>

              {/* Text body */}
              <div style={{ padding: '1.25rem 1.25rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {/* Type tag */}
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: tagColor,
                    background: tagBg,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '99px',
                    alignSelf: 'flex-start',
                  }}
                >
                  {program.title}
                </span>

                {program.description && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.85rem',
                      lineHeight: 1.65,
                      color: descColor,
                      fontFamily: 'Georgia, serif',
                    }}
                  >
                    {program.description}
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* ── No-image card (compact horizontal) ── */
            <div
              key={program.id}
              style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: '1.25rem',
                padding: '1.4rem 1.25rem',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                boxShadow: isDark
                  ? '0 4px 24px rgba(0,0,0,0.3)'
                  : '0 4px 20px rgba(0,0,0,0.07)',
              }}
            >
              {/* Icon circle + title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '0.9rem',
                    background: tagBg,
                    border: `1.5px solid ${accentColor}28`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    flexShrink: 0,
                  }}
                >
                  {program.icon}
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: 'Georgia, serif',
                      fontSize: '1rem',
                      fontWeight: 600,
                      letterSpacing: '0.02em',
                      color: titleColor,
                      lineHeight: 1.2,
                    }}
                  >
                    {program.title}
                  </p>
                  {!program.description && (
                    <p
                      style={{
                        margin: '0.2rem 0 0',
                        fontSize: '0.7rem',
                        color: descColor,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        fontWeight: 500,
                      }}
                    >
                      {program.type.replace(/_/g, ' ')}
                    </p>
                  )}
                </div>
              </div>

              {/* Divider */}
              {program.description && (
                <div
                  style={{
                    height: '1px',
                    background: `linear-gradient(to right, ${accentColor}40, transparent)`,
                  }}
                />
              )}

              {/* Description */}
              {program.description && (
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.85rem',
                    lineHeight: 1.7,
                    color: descColor,
                    fontFamily: 'Georgia, serif',
                  }}
                >
                  {program.description}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
