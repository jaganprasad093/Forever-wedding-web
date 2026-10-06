'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <section id="faq" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-stone-50/50 relative">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100/70 border border-amber-200 text-amber-800 text-xs font-semibold uppercase tracking-widest mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            Frequently Asked Questions
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-stone-900 leading-tight mb-4">
            Everything You Need To <span className="italic text-amber-800 font-normal">Know</span>
          </h2>

          <p className="text-stone-600 text-base sm:text-lg font-sans max-w-xl mx-auto">
            Have questions about digital invitations? Here are answers to what couples ask us most.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4 mb-14">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx

            return (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-stone-200/80 overflow-hidden shadow-xs transition-all duration-200"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-amber-50/30 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif text-lg sm:text-xl font-medium text-stone-900">
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="px-5 sm:px-6 pb-6 text-stone-600 text-sm sm:text-base leading-relaxed font-sans border-t border-stone-100 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        {/* Support Callout */}
        <div className="text-center p-6 rounded-2xl bg-white border border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-900">Still have a question?</p>
              <p className="text-xs text-stone-500">We are here to help you make your wedding invitation seamless.</p>
            </div>
          </div>
          <Link
            href="/register"
            className="text-xs uppercase tracking-wider font-semibold bg-stone-900 text-white hover:bg-stone-800 px-5 py-2.5 rounded-full transition-colors shrink-0"
          >
            Get In Touch
          </Link>
        </div>
      </div>
    </section>
  )
}
