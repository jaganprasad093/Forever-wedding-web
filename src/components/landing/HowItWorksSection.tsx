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
  CheckCircle2 
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

export default function HowItWorksSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="how-it-works" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-stone-50/70 via-amber-50/40 to-stone-50/60 relative overflow-hidden" ref={ref}>
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100/70 border border-amber-200 text-amber-800 text-xs font-semibold uppercase tracking-widest mb-4"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Effortless Creation
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-stone-900 leading-tight mb-4"
          >
            From Start to Shared in{' '}
            <span className="italic text-amber-800 font-normal">Under 5 Minutes</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-stone-600 text-base sm:text-lg font-sans max-w-2xl mx-auto leading-relaxed"
          >
            No technical skills or design software needed. Our streamlined creator takes you from blank canvas to published luxury invitation seamlessly.
          </motion.p>
        </div>

        {/* 4 Step Timeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-16 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
                className="relative rounded-3xl bg-white p-6 sm:p-7 border border-amber-100/80 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-serif text-3xl font-bold text-amber-200/90">
                      {item.step}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50/80 px-2.5 py-0.5 rounded-full mb-3">
                    <Clock className="w-3 h-3" />
                    <span>Takes ~{item.time}</span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-medium text-stone-900 mb-2.5">
                    {item.title}
                  </h3>

                  <p className="text-stone-600 text-xs sm:text-sm font-sans leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.highlight}</span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom Callout Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="relative rounded-3xl bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white p-8 sm:p-12 overflow-hidden shadow-2xl border border-amber-500/30"
        >
          {/* Background decorative glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-2 block">
                ✦ Ready to celebrate your love story? ✦
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight mb-3">
                Create Your Personalized Wedding Invitation Now
              </h3>
              <p className="text-stone-300 text-sm sm:text-base font-sans">
                Join over 10,000+ couples who delighted their guests with an unforgettable digital invitation experience.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full sm:w-auto">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950 font-semibold text-sm uppercase tracking-wider px-8 py-4 rounded-full shadow-lg shadow-amber-500/25 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Free — Instant Setup</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
