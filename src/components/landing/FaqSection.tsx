'use client'

import { useState } from 'react'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'

const faqs = [
  {
    question: 'How do my wedding guests receive and view the invitation?',
    answer:
      'You receive your own unique, personalized link (such as forevervows.com/w/jagan-anu) and a custom QR code. You can share this link on WhatsApp, Instagram, iMessage, or email. When guests tap the link, it opens instantly in their browser with background music and full animations — no app download or login required.',
  },
  {
    question: 'Can guests RSVP directly and choose their meal preferences?',
    answer:
      'Yes! Each invitation comes with an integrated digital RSVP system. Guests simply submit their attendance status, party member names, dietary requirements (Veg, Non-Veg, Jain, Vegan), and personal wishes. All submissions appear immediately in your private live dashboard.',
  },
  {
    question: 'Can I add our custom couple song or favorite background music?',
    answer:
      'Absolutely. You can choose from our curated library of romantic melodies (classical flute, shehnai, violin, acoustic guitar) or upload your own audio file (MP3/M4A) to play automatically when guests open your card.',
  },
  {
    question: 'Can I edit the wedding date, events, or venue after sharing the link?',
    answer:
      'Yes, you can edit your wedding details at any time from your dashboard! Any updates you make (e.g. changing ceremony timing or updating venue directions) will reflect immediately for all guests who open your link.',
  },
  {
    question: 'Is ForeverVows mobile friendly?',
    answer:
      '100%. Every single template is designed mobile-first and tested on all modern iPhones and Android devices, as well as tablets and desktop screens. It looks flawless regardless of device size.',
  },
  {
    question: 'Can I protect our invitation with a private passcode?',
    answer:
      'Yes. If you prefer to keep your wedding details, family pictures, and venue coordinates private to invited guests only, you can easily enable a 4-digit passcode in your settings.',
  },
]

/*
  Layout note: centring, padding and widths use flex/gap and inline styles
  instead of mx-auto / p-* / m-* classes, so the section stays correct even
  if a global `* { margin: 0; padding: 0 }` reset overrides Tailwind v4
  utilities (the likely reason `mx-auto` had no effect before).
*/

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: 'easeOut' as const },
}

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <MotionConfig reducedMotion="user">
      <section
        id="faq"
        className="w-full bg-stone-50/60"
        style={{ padding: 'clamp(4rem, 9vw, 7rem) clamp(1.25rem, 5vw, 3rem)' }}
      >
        <div
          className="flex flex-col gap-10 sm:gap-14"
          style={{ width: '100%', maxWidth: '48rem', marginInline: 'auto' }}
        >
          {/* Header */}
          <motion.header {...fadeUp} className="flex flex-col items-center gap-4 text-center">
            <h2 className="font-serif font-normal text-stone-900 leading-[1.15] text-balance text-[clamp(2rem,5vw,3rem)]">
              Everything you need to <span className="italic text-amber-800">know</span>
            </h2>
            <p className="max-w-lg text-base sm:text-lg leading-relaxed text-stone-600 text-balance">
              Answers to what couples ask us most about digital invitations.
            </p>
          </motion.header>

          {/* Accordion */}
          <motion.ul {...fadeUp} className="flex flex-col gap-3 list-none" style={{ padding: 0 }}>
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx
              return (
                <li
                  key={faq.question}
                  className={`overflow-hidden rounded-2xl border bg-white transition-[border-color,box-shadow] duration-300 ${isOpen
                    ? 'border-amber-300 shadow-lg shadow-amber-900/5'
                    : 'border-stone-200 hover:border-amber-200'
                    }`}
                >
                  <button
                    type="button"
                    id={`faq-btn-${idx}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${idx}`}
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="flex w-full min-h-[3.5rem] items-center justify-between gap-4 text-left cursor-pointer"
                    style={{ padding: 'clamp(1rem, 2.5vw, 1.5rem)' }}
                  >
                    <span className="font-serif text-lg sm:text-xl font-medium leading-snug text-stone-900">
                      {faq.question}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${isOpen ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-500'
                        }`}
                      aria-hidden
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-panel-${idx}`}
                        role="region"
                        aria-labelledby={`faq-btn-${idx}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <p
                          className="text-sm sm:text-base leading-relaxed sm:leading-7 text-stone-600"
                          style={{ padding: '0 clamp(1rem, 2.5vw, 1.5rem) clamp(1.25rem, 2.5vw, 1.75rem)' }}
                        >
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              )
            })}
          </motion.ul>

          {/* Support */}
          <motion.div {...fadeUp} className="flex flex-col items-center gap-4 text-center">
            <p className="text-stone-600">Still have a question?</p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-stone-900 text-sm font-semibold text-white transition-colors hover:bg-stone-800"
              style={{ padding: '0.85rem 1.75rem', minHeight: '2.75rem' }}
            >
              Get in touch
            </Link>
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  )
}