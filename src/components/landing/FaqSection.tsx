'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react'
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

/* ─── Animation variants ─────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: 'easeOut' as const },
  }),
}

export default function FaqSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <section
      id="faq"
      ref={ref}
      className="relative overflow-hidden bg-stone-50/50 !py-20 sm:!py-28 lg:!py-32 !px-5 sm:!px-8 lg:!px-12"
    >
      {/* Soft background glows */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-20 -left-32 w-80 h-80 bg-amber-200/25 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1.1, 1, 1.1], opacity: [1, 0.7, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-20 -right-32 w-80 h-80 bg-rose-200/20 rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative z-10 max-w-3xl lg:max-w-4xl mx-auto">
        {/* ───────── Header ───────── */}
        <div className="text-center !mb-12 sm:!mb-16">
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="inline-flex items-center gap-2 !px-4 !py-1.5 rounded-full bg-amber-100/70 border border-amber-200 text-amber-800 text-[11px] sm:text-xs font-semibold uppercase tracking-widest !mb-6"
          >
            <motion.span
              animate={{ rotate: [0, 14, -14, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            </motion.span>
            Frequently Asked Questions
          </motion.div>

          <motion.h2
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="font-serif text-3xl sm:text-5xl font-normal text-stone-900 leading-[1.15] !mb-5"
          >
            Everything You Need To{' '}
            <span className="italic text-amber-800 font-normal">Know</span>
          </motion.h2>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-amber-400 to-transparent !mb-5"
          />

          <motion.p
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="text-stone-600 text-base sm:text-lg font-sans max-w-xl mx-auto leading-relaxed !px-2"
          >
            Have questions about digital invitations? Here are answers to what couples ask us most.
          </motion.p>
        </div>

        {/* ───────── Accordion ───────── */}
        <div className="flex flex-col gap-3 sm:gap-4 !mb-12 sm:!mb-14">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx

            return (
              <motion.div
                key={idx}
                custom={idx}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: (i: number) => ({
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5, delay: 0.3 + i * 0.08, ease: 'easeOut' as const },
                  }),
                }}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                className={`rounded-2xl bg-white border overflow-hidden transition-[border-color,box-shadow] duration-300 ${isOpen
                  ? 'border-amber-300/80 shadow-lg shadow-amber-900/5'
                  : 'border-stone-200/80 shadow-xs hover:border-amber-200 hover:shadow-md'
                  }`}
              >
                <button
                  onClick={() => toggle(idx)}
                  id={`faq-btn-${idx}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${idx}`}
                  className="w-full !px-5 !py-5 sm:!px-7 sm:!py-6 text-left flex items-center justify-between gap-4 sm:gap-5 cursor-pointer hover:bg-amber-50/30 transition-colors"
                >
                  <span className="flex items-center gap-3.5 sm:gap-5 min-w-0">
                    <span
                      className={`hidden sm:block font-serif text-sm tabular-nums transition-colors duration-300 ${isOpen ? 'text-amber-600' : 'text-stone-300'
                        }`}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="font-serif text-base sm:text-xl font-medium text-stone-900 leading-snug">
                      {faq.question}
                    </span>
                  </span>

                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${isOpen ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-500'
                      }`}
                  >
                    <ChevronDown className="w-4 h-4" />
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
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                    >
                      <motion.div
                        initial={{ y: -8 }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.35, delay: 0.05 }}
                        className="!mx-5 sm:!mx-7 !pt-4 !pb-6 sm:!pb-7 text-stone-600 text-sm sm:text-base leading-relaxed sm:leading-7 font-sans border-t border-stone-100 sm:!pl-9"
                      >
                        {faq.answer}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {/* ───────── Support callout ───────── */}
        <motion.div
          custom={0}
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.9, ease: 'easeOut' } },
          }}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="rounded-2xl bg-white border border-stone-200/80 shadow-xs !p-6 sm:!px-8 sm:!py-7 flex flex-col sm:flex-row items-center sm:justify-between gap-5 sm:gap-6 text-center sm:text-left"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0"
            >
              <MessageCircle className="w-5 h-5" />
            </motion.div>
            <div>
              <p className="text-sm sm:text-base font-semibold text-stone-900 !mb-1">Still have a question?</p>
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                We are here to help you make your wedding invitation seamless.
              </p>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto shrink-0">
            <Link
              href="/register"
              className="block text-center text-xs uppercase tracking-wider font-semibold bg-stone-900 text-white hover:bg-stone-800 !px-7 !py-3.5 rounded-full transition-colors"
            >
              Get In Touch
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}