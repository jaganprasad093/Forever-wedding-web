'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Copy,
  Check,
  Download,
  QrCode,
  Link2,
  MessageCircle,
  Share2,
  Mail,
  Send,
  ExternalLink,
} from 'lucide-react'
import QRCode from 'qrcode'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  weddingUrl: string
  coupleName: string
  weddingDate?: string | null
}

type Tab = 'link' | 'qr' | 'social'

/* ─── Facebook SVG ───────────────────────────────────────────────────────── */
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

/* ─── X (Twitter) SVG ────────────────────────────────────────────────────── */
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

/* ─── Instagram SVG ──────────────────────────────────────────────────────── */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

/* ─── Telegram SVG ───────────────────────────────────────────────────────── */
function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  )
}

/* ─── Social share entries ───────────────────────────────────────────────── */
function buildShareOptions(url: string, coupleName: string, date?: string | null) {
  const text = `🎊 You're invited to celebrate the wedding of ${coupleName}!${date ? ` — ${date}` : ''}\n\nView the interactive invitation:`
  const encoded = encodeURIComponent(url)
  const encodedText = encodeURIComponent(text)

  return [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      sublabel: 'Share with contacts',
      icon: <WhatsAppIcon className="w-5 h-5" />,
      bg: 'bg-[#25D366]',
      hoverBg: 'hover:bg-[#1ebe59]',
      textColor: 'text-white',
      href: `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
      featured: true,
    },
    {
      id: 'telegram',
      label: 'Telegram',
      sublabel: 'Send via Telegram',
      icon: <TelegramIcon className="w-5 h-5" />,
      bg: 'bg-[#229ED9]',
      hoverBg: 'hover:bg-[#1a8bbf]',
      textColor: 'text-white',
      href: `https://t.me/share/url?url=${encoded}&text=${encodedText}`,
      featured: true,
    },
    {
      id: 'facebook',
      label: 'Facebook',
      sublabel: 'Post on timeline',
      icon: <FacebookIcon className="w-5 h-5" />,
      bg: 'bg-[#1877F2]',
      hoverBg: 'hover:bg-[#1565d8]',
      textColor: 'text-white',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      featured: false,
    },
    {
      id: 'twitter',
      label: 'X / Twitter',
      sublabel: 'Post on X',
      icon: <XIcon className="w-5 h-5" />,
      bg: 'bg-black',
      hoverBg: 'hover:bg-stone-800',
      textColor: 'text-white',
      href: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodeURIComponent(`${text}`)}`,
      featured: false,
    },
    {
      id: 'instagram',
      label: 'Instagram Story',
      sublabel: 'Share via link in bio',
      icon: <InstagramIcon className="w-5 h-5" />,
      bg: 'bg-gradient-to-br from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888]',
      hoverBg: '',
      textColor: 'text-white',
      href: null, // Instagram doesn't support direct sharing; copy link instead
      featured: false,
    },
    {
      id: 'email',
      label: 'Email',
      sublabel: 'Send via email',
      icon: <Mail className="w-5 h-5" />,
      bg: 'bg-stone-700',
      hoverBg: 'hover:bg-stone-800',
      textColor: 'text-white',
      href: `mailto:?subject=${encodeURIComponent(`Wedding Invitation — ${coupleName}`)}&body=${encodeURIComponent(`${text}\n${url}`)}`,
      featured: false,
    },
  ]
}

export default function ShareModal({
  isOpen,
  onClose,
  weddingUrl,
  coupleName,
  weddingDate,
}: ShareModalProps) {
  const [tab, setTab] = useState<Tab>('link')
  const [copied, setCopied] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [qrLoading, setQrLoading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  /* ── Generate QR on demand ── */
  const generateQR = useCallback(async () => {
    setQrLoading(true)
    try {
      const dataUrl = await QRCode.toDataURL(weddingUrl, {
        width: 320,
        margin: 2,
        color: { dark: '#1c1917', light: '#fffdf9' },
        errorCorrectionLevel: 'H',
      })
      setQrDataUrl(dataUrl)
    } catch (err) {
      console.error('QR generation failed', err)
    } finally {
      setQrLoading(false)
    }
  }, [weddingUrl])

  useEffect(() => {
    if (isOpen && tab === 'qr' && !qrDataUrl) {
      generateQR()
    }
  }, [isOpen, tab, qrDataUrl, generateQR])

  /* ── Reset state on close ── */
  useEffect(() => {
    if (!isOpen) {
      setCopied(false)
      setTab('link')
    }
  }, [isOpen])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(weddingUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      /* noop */
    }
  }

  const handleDownloadQR = () => {
    if (!qrDataUrl) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `${coupleName.replace(/\s+/g, '-').toLowerCase()}-qr-code.png`
    a.click()
  }

  const handleShare = (href: string | null, id: string) => {
    if (id === 'instagram') {
      // Instagram: just copy link with helpful toast
      handleCopy()
      return
    }
    if (href) window.open(href, '_blank', 'noopener,noreferrer')
  }

  const shareOptions = buildShareOptions(weddingUrl, coupleName, weddingDate)
  const featured = shareOptions.filter((s) => s.featured)
  const others = shareOptions.filter((s) => !s.featured)

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'link', label: 'Copy Link', icon: <Link2 className="w-4 h-4" /> },
    { id: 'qr', label: 'QR Code', icon: <QrCode className="w-4 h-4" /> },
    { id: 'social', label: 'Social', icon: <Share2 className="w-4 h-4" /> },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Share ${coupleName} invitation`}
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.18)] overflow-hidden border border-[#ece4d8]">
              {/* Header */}
              <div className="relative px-5 pt-5 pb-4 border-b border-stone-100 bg-gradient-to-br from-[#fbf8f4] to-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-lg font-medium text-stone-900 leading-snug">
                      Share Invitation
                    </h2>
                    <p className="text-xs text-stone-400 mt-0.5 truncate max-w-[260px]">
                      {coupleName}
                      {weddingDate ? ` · ${weddingDate}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="shrink-0 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Close share modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Pill tab bar */}
                <div className="flex gap-1 mt-4 p-1 bg-stone-100/70 rounded-xl">
                  {tabs.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTab(t.id)}
                      className={`relative flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition-colors duration-200 cursor-pointer ${
                        tab === t.id ? 'text-white' : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      {tab === t.id && (
                        <motion.span
                          layoutId="share-tab-pill"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#8c6b48] to-[#7a5b3b] shadow-sm"
                        />
                      )}
                      <span className="relative z-10">{t.icon}</span>
                      <span className="relative z-10">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab content */}
              <div className="px-5 py-5 min-h-[260px]">
                <AnimatePresence mode="wait">
                  {/* ── LINK TAB ── */}
                  {tab === 'link' && (
                    <motion.div
                      key="link"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {/* URL display */}
                      <div className="flex items-center gap-2 p-3 bg-[#faf7f2] border border-[#ece4d8] rounded-2xl">
                        <Link2 className="w-4 h-4 text-[#8c6b48] shrink-0" />
                        <span className="flex-1 text-xs text-stone-600 font-mono truncate">
                          {weddingUrl}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopy}
                          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            copied
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-[#8c6b48] hover:bg-[#7a5b3b] text-white'
                          }`}
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>

                      {/* Open in new tab */}
                      <a
                        href={weddingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2.5 border border-stone-200 hover:border-stone-300 rounded-xl text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open live invitation
                      </a>

                      {/* Quick WhatsApp from link tab */}
                      <div className="pt-1 border-t border-stone-100">
                        <p className="text-[11px] text-stone-400 mb-2.5">Quick share</p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              window.open(
                                `https://wa.me/?text=${encodeURIComponent(`🎊 You're invited to celebrate the wedding of ${coupleName}!\n\nView the interactive invitation:\n${weddingUrl}`)}`,
                                '_blank',
                                'noopener'
                              )
                            }
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#25D366] hover:bg-[#1ebe59] rounded-xl text-white text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <WhatsAppIcon className="w-4 h-4" />
                            WhatsApp
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              window.open(
                                `https://t.me/share/url?url=${encodeURIComponent(weddingUrl)}&text=${encodeURIComponent(`🎊 You're invited to celebrate the wedding of ${coupleName}!`)}`,
                                '_blank',
                                'noopener'
                              )
                            }
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#229ED9] hover:bg-[#1a8bbf] rounded-xl text-white text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <TelegramIcon className="w-4 h-4" />
                            Telegram
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              (window.location.href = `mailto:?subject=${encodeURIComponent(`Wedding Invitation — ${coupleName}`)}&body=${encodeURIComponent(`🎊 You're invited to celebrate the wedding of ${coupleName}!\n\nView the interactive invitation:\n${weddingUrl}`)}`)
                            }
                            className="flex items-center justify-center w-10 py-2.5 bg-stone-700 hover:bg-stone-800 rounded-xl text-white transition-colors cursor-pointer"
                            title="Share via Email"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ── QR TAB ── */}
                  {tab === 'qr' && (
                    <motion.div
                      key="qr"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col items-center gap-4"
                    >
                      {/* QR Display */}
                      <div className="relative w-52 h-52 rounded-2xl overflow-hidden bg-[#fffdf9] border-2 border-[#ece4d8] shadow-inner flex items-center justify-center">
                        {qrLoading && (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-2 border-[#8c6b48] border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs text-stone-400">Generating QR…</p>
                          </div>
                        )}
                        {!qrLoading && qrDataUrl && (
                          <motion.img
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            src={qrDataUrl}
                            alt={`QR code for ${coupleName} wedding invitation`}
                            className="w-full h-full object-contain p-2"
                          />
                        )}
                        {!qrLoading && !qrDataUrl && (
                          <button
                            type="button"
                            onClick={generateQR}
                            className="flex flex-col items-center gap-2 text-stone-400 hover:text-[#8c6b48] transition-colors cursor-pointer"
                          >
                            <QrCode className="w-10 h-10" />
                            <span className="text-xs">Tap to generate</span>
                          </button>
                        )}
                        {/* Corner accent */}
                        <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-[#8c6b48]/30 rounded-tl-sm pointer-events-none" />
                        <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-[#8c6b48]/30 rounded-tr-sm pointer-events-none" />
                        <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-[#8c6b48]/30 rounded-bl-sm pointer-events-none" />
                        <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-[#8c6b48]/30 rounded-br-sm pointer-events-none" />
                      </div>

                      <div className="text-center space-y-1">
                        <p className="text-sm font-medium text-stone-800">{coupleName}</p>
                        <p className="text-xs text-stone-400">Scan to view the wedding invitation</p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 w-full">
                        <button
                          type="button"
                          onClick={handleDownloadQR}
                          disabled={!qrDataUrl}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#8c6b48] hover:bg-[#7a5b3b] disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download PNG
                        </button>
                        <button
                          type="button"
                          onClick={handleCopy}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 border rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                            copied
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'border-stone-200 hover:border-stone-300 text-stone-600 hover:bg-stone-50'
                          }`}
                        >
                          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copied ? 'Link Copied!' : 'Copy Link'}
                        </button>
                      </div>

                      <p className="text-[11px] text-stone-400 text-center leading-relaxed">
                        Print or display this QR code on wedding invitations, table cards, or save-the-date cards.
                      </p>
                    </motion.div>
                  )}

                  {/* ── SOCIAL TAB ── */}
                  {tab === 'social' && (
                    <motion.div
                      key="social"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      {/* Featured (WhatsApp + Telegram) */}
                      <div className="grid grid-cols-2 gap-2">
                        {featured.map((s, i) => (
                          <motion.button
                            key={s.id}
                            type="button"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => handleShare(s.href, s.id)}
                            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl ${s.bg} ${s.hoverBg} ${s.textColor} text-sm font-semibold shadow-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]`}
                          >
                            {s.icon}
                            <div className="text-left">
                              <div className="text-[13px] font-semibold leading-none mb-0.5">{s.label}</div>
                              <div className="text-[10px] opacity-75 leading-none">{s.sublabel}</div>
                            </div>
                          </motion.button>
                        ))}
                      </div>

                      {/* Divider */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-px bg-stone-100" />
                        <span className="text-[10px] uppercase tracking-wider text-stone-400 font-medium">More platforms</span>
                        <div className="flex-1 h-px bg-stone-100" />
                      </div>

                      {/* Other platforms */}
                      <div className="grid grid-cols-2 gap-2">
                        {others.map((s, i) => (
                          <motion.button
                            key={s.id}
                            type="button"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                            onClick={() => handleShare(s.href, s.id)}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl ${s.bg} ${s.hoverBg} ${s.textColor} transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-sm`}
                          >
                            {s.icon}
                            <div className="text-left">
                              <div className="text-xs font-semibold leading-none mb-0.5">
                                {s.id === 'instagram' ? 'Copy Link' : s.label}
                              </div>
                              <div className="text-[10px] opacity-75 leading-none">
                                {s.id === 'instagram' ? 'Paste in bio/story' : s.sublabel}
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>

                      {/* Native share API if supported */}
                      {typeof navigator !== 'undefined' && 'share' in navigator && (
                        <motion.button
                          type="button"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          onClick={() =>
                            navigator.share({
                              title: `${coupleName} — Wedding Invitation`,
                              text: `You're invited to the wedding of ${coupleName}!`,
                              url: weddingUrl,
                            })
                          }
                          className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-stone-200 hover:border-[#8c6b48] hover:bg-[#faf7f2] rounded-xl text-xs font-medium text-stone-500 hover:text-[#8c6b48] transition-all cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          More apps (use system share sheet)
                        </motion.button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="px-5 pb-5">
                <p className="text-center text-[11px] text-stone-300 flex items-center justify-center gap-1.5">
                  <MessageCircle className="w-3 h-3" />
                  Sharing this link lets guests view and RSVP to your wedding
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
