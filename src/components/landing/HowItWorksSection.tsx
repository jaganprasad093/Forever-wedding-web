'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import {
  Sparkles,
  Palette,
  FileEdit,
  Music,
  Share2,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react'

const steps = [
  {
    step: '01',
    icon: Palette,
    title: 'Choose a Design Aesthetic',
    time: '30 seconds',
    description: 'Select from Kerala traditional, royal luxury, romantic floral, or minimal editorial layouts tailored for modern Indian & global weddings.',
    highlight: 'Instant live preview on mobile',
  },
  {
    step: '02',
    icon: FileEdit,
    title: 'Add Love Story & Events',
    time: '2 minutes',
    description: 'Enter your names, auspicious dates, multiple ceremony timings (Haldi, Sangeet, Muhurtham), and Google Maps venue coordinates.',
    highlight: 'Auto-generates Google Calendar links',
  },
  {
    step: '03',
    icon: Music,
    title: 'Set Atmosphere & Photos',
    time: '1 minute',
    description: 'Upload high-resolution couple photographs, engagement highlights, and choose an enchanting instrumental background soundtrack.',
    highlight: 'Autoplay audio support',
  },
  {
    step: '04',
    icon: Share2,
    title: 'Send on WhatsApp & Track',
    time: 'Instant',
    description: 'Get your customized link (forevervows.com/w/your-names) and share with one tap. Watch guest RSVPs roll into your private live dashboard.',
    highlight: 'No app download for guests',
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

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, delay: 0.3 + i * 0.14, ease: 'easeOut' as const },
  }),
}

export default function HowItWorksSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const state = isInView ? 'visible' : 'hidden'

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="relative overflow-hidden bg-gradient-to-b from-stone-50/70 via-amber-50/40 to-stone-50/60 !py-20 sm:!py-28 lg:!py-32 !px-5 sm:!px-8 lg:!px-12"
    >
      {/* Soft background glows */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 -left-40 w-96 h-96 bg-amber-200/25 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1.1, 1, 1.1], opacity: [1, 0.7, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-20 -right-40 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* ───────── Header ───────── */}
        <div className="text-center max-w-3xl mx-auto !mb-14 sm:!mb-20">
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate={state}
            className="inline-flex items-center gap-2 !px-4 !py-1.5 rounded-full bg-amber-100/70 border border-amber-200 text-amber-800 text-[11px] sm:text-xs font-semibold uppercase tracking-widest !mb-6"
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="inline-flex"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            </motion.span>
            Effortless Creation
          </motion.div>

          <motion.h2
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate={state}
            className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-stone-900 leading-[1.15] !mb-5 sm:!mb-6"
          >
            From Start to Shared in{' '}
            <span className="italic text-amber-800 font-normal">Under 5 Minutes</span>
          </motion.h2>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-amber-400 to-transparent !mb-5 sm:!mb-6"
          />

          <motion.p
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate={state}
            className="text-stone-600 text-base sm:text-lg font-sans max-w-2xl mx-auto leading-relaxed !px-2"
          >
            No technical skills or design software needed. Our streamlined creator takes you from blank canvas to published luxury invitation seamlessly.
          </motion.p>
        </div>

        {/* ───────── Steps ───────── */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8 !mb-16 sm:!mb-20">
          {/* Connector line (desktop only) draws left → right behind the cards */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.4, delay: 0.5, ease: 'easeInOut' }}
            style={{ transformOrigin: 'left' }}
            className="hidden lg:block absolute top-[3.75rem] left-[12%] right-[12%] h-px bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 z-0"
            aria-hidden="true"
          />

          {steps.map((item, idx) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.step}
                custom={idx}
                variants={cardVariants}
                initial="hidden"
                animate={state}
                whileHover={{ y: -8 }}
                className="relative z-10 rounded-3xl bg-white !p-6 sm:!p-7 lg:!p-8 border border-amber-100/80 shadow-xs hover:shadow-xl hover:shadow-amber-900/5 hover:border-amber-200 transition-[box-shadow,border-color] duration-300 flex flex-col justify-between gap-6"
              >
                <div>
                  {/* Step header */}
                  <div className="flex items-center justify-between !mb-6">
                    <motion.div
                      whileHover={{ rotate: -8, scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shadow-xs"
                    >
                      <Icon className="w-6 h-6" />
                    </motion.div>
                    <span className="font-serif text-3xl sm:text-4xl font-bold text-amber-200/90 leading-none">
                      {item.step}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50/80 !px-3 !py-1 rounded-full !mb-4">
                    <Clock className="w-3 h-3" />
                    <span>Takes ~{item.time}</span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-medium text-stone-900 !mb-3 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-stone-600 text-sm font-sans leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="!pt-4 border-t border-stone-100 flex items-center gap-2 text-[11px] sm:text-xs font-medium text-emerald-700">
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ type: 'spring', delay: 0.9 + idx * 0.14 }}
                    className="inline-flex shrink-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </motion.span>
                  <span>{item.highlight}</span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* ───────── CTA banner ───────── */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.9, ease: 'easeOut' }}
          className="relative rounded-3xl bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white !px-6 !py-10 sm:!px-12 sm:!py-14 lg:!px-16 overflow-hidden shadow-2xl border border-amber-500/30"
        >
          {/* Drifting glows */}
          <motion.div
            animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"
          />
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-0 left-0 w-60 h-60 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"
          />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 text-center lg:text-left">
            <div className="max-w-2xl">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-amber-400 !mb-4 block">
                ✦ Ready to celebrate your love story? ✦
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-[1.15] !mb-4">
                Create Your Personalized Wedding Invitation Now
              </h3>
              <p className="text-stone-300 text-sm sm:text-base font-sans leading-relaxed">
                Join over 10,000+ couples who delighted their guests with an unforgettable digital invitation experience.
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="shrink-0 w-full sm:w-auto"
            >
              <Link
                href="/register"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950 font-semibold text-xs sm:text-sm uppercase tracking-wider !px-8 sm:!px-10 !py-4 rounded-full shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/40 transition-shadow duration-300"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Free — Instant Setup</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}