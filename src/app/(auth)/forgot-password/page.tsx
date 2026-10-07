'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type FormData = z.infer<typeof schema>

/* ─── Animation variants ─────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: 'easeOut' as const },
  }),
}

/* ─── Field component for consistent label + input + error ───────────── */
function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-stone-700 select-none">
        {label}
      </label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-600 font-medium"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(error.message)
      return
    }
    setSent(true)
  }

  const inputBase =
    'w-full h-11 !px-4 bg-white border border-stone-200 rounded-lg text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#8c6b48] focus:ring-1 focus:ring-[#8c6b48]/20 transition-colors'

  return (
    /* ── Page shell ── */
    <div className="relative min-h-screen w-full bg-[#faf7f2] flex flex-col justify-between selection:bg-[#ebdcc9] selection:text-[#5c4028]">
      {/* Decorative ambient background glows */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[720px] h-[480px] bg-gradient-to-b from-[#f3eae0]/80 via-[#f9f5ee]/40 to-transparent rounded-full blur-3xl opacity-70" />
      </div>

      {/* ── Fixed top bar: back link ── */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 sm:px-10 py-5 pointer-events-none">
        <Link
          href="/login"
          className="pointer-events-auto group inline-flex items-center gap-2 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors duration-200"
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-full border border-stone-200 bg-white/70 group-hover:border-[#cbb8a3] group-hover:bg-[#f8f3ed] transition-all duration-200">
            <ArrowLeft className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#8c6b48] group-hover:-translate-x-0.5 transition-all duration-200" />
          </span>

          <span>Back to Sign In</span>
        </Link>
      </header>

      {/* ── Scrollable center area ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-24 sm:pt-28 pb-12 w-full">

        {/* ── Ornament header ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
          className="flex flex-col items-center text-center gap-3.5 mb-10 sm:mb-12 px-4"
        >
          {/* Fine rule + star ornament */}
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-12 sm:w-16 bg-gradient-to-r from-transparent to-[#cbb8a3]" />
            <span className="text-[#a89078] text-[10px] sm:text-xs">✦</span>
            <div className="h-px w-12 sm:w-16 bg-gradient-to-l from-transparent to-[#cbb8a3]" />
          </div>

          {/* Pill badge */}
          <div className="inline-flex items-center gap-2.5 !px-5 !py-1 rounded-full border border-[#d8c8b4]/80 bg-[#f7f2ea]/90 text-[#856543] !text-xs sm:!text-sm font-medium tracking-[0.18em] uppercase shadow-xs">
            <span className="text-[9px] leading-none text-[#a07c57]">♦</span>
            <span>Account Recovery</span>
          </div>

          <p className="text-stone-500 text-sm leading-relaxed max-w-[360px]">
            We will send you instructions to safely recover and reset your password.
          </p>
        </motion.div>

        {/* ── Card ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="w-full max-w-[480px] !mt-2"
        >
          <div className="w-full bg-white/95 backdrop-blur-xs rounded-2xl sm:rounded-3xl border border-[#ede7de] shadow-[0_12px_44px_-10px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
            {/* Card inner padding */}
            <div className="!px-8 !py-9 sm:!px-10 sm:!py-8">

              {sent ? (
                /* ── Sent Confirmation State ── */
                <div className="text-center py-2">
                  <div className="w-16 h-16 bg-[#f7f2ea] border border-[#e5dacf] rounded-full flex items-center justify-center mx-auto mb-5 shadow-xs">
                    <CheckCircle2 className="w-8 h-8 text-[#8c6b48]" />
                  </div>

                  <h2 className="font-serif !text-xl sm:!text-2xl font-normal text-stone-900 tracking-tight !leading-tight mb-2.5">
                    Check your email
                  </h2>

                  <p className="text-stone-500 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
                    We&apos;ve sent a password reset link to your email address. Follow the instructions to create a new password.
                  </p>

                  <div className="flex flex-col gap-3">
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center w-full h-12 bg-[#8c6b48] hover:bg-[#7e5f3e] active:bg-[#6c4f31] text-white rounded-xl font-medium text-sm transition-all duration-200 shadow-[0_2px_8px_rgba(140,107,72,0.22)]"
                    >
                      Back to Sign In
                    </Link>

                    <button
                      type="button"
                      onClick={() => setSent(false)}
                      className="text-xs text-stone-500 hover:text-[#8c6b48] transition-colors mt-2"
                    >
                      Didn&apos;t receive the email? Try again
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Form State ── */
                <>
                  <div className="!mb-6">
                    <h1 className="font-serif !text-xl sm:!text-2xl font-normal text-stone-900 tracking-tight !leading-tight !mb-2 !px-1">
                      Forgot your password?
                    </h1>

                    <p className="text-stone-500 !text-xs sm:!text-sm !leading-5 !px-1 max-w-[360px]">
                      Enter the email associated with your account and we&apos;ll send you a recovery link.
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:gap-5" noValidate>

                    {/* Email */}
                    <Field label="Email address" error={errors.email?.message}>
                      <input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder="name@example.com"
                        autoComplete="email"
                        className={inputBase}
                      />
                    </Field>

                    {/* Error alert */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className="p-3.5 bg-red-50/90 border border-red-200/80 rounded-xl flex items-start gap-3 shadow-xs"
                      >
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <div className="text-xs sm:text-sm text-red-700 font-medium leading-relaxed">
                          {error}
                        </div>
                      </motion.div>
                    )}

                    {/* Submit */}
                    <motion.button
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      custom={2}
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.005 }}
                      whileTap={{ scale: 0.995 }}
                      className="w-full h-12 bg-[#8c6b48] hover:bg-[#7e5f3e] active:bg-[#6c4f31] text-white rounded-xl font-medium text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(140,107,72,0.22)] hover:shadow-[0_4px_14px_rgba(140,107,72,0.32)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending reset link…</span>
                        </>
                      ) : (
                        'Send Reset Link'
                      )}
                    </motion.button>
                  </form>

                  {/* Return to login link */}
                  <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    custom={3}
                    className="!mt-5 !pt-4 border-t border-stone-100 text-center"
                  >
                    <p className="text-sm text-stone-500">
                      Remember your password?{' '}
                      <Link
                        href="/login"
                        className="font-semibold text-stone-900 hover:text-[#8c6b48] underline underline-offset-4 decoration-stone-300 hover:decoration-[#8c6b48] transition-colors ml-1"
                      >
                        Sign in
                      </Link>
                    </p>
                  </motion.div>
                </>
              )}

            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={4}
          className="mt-10 sm:mt-12 text-center text-xs text-stone-400 tracking-wide translate-y-6"
        >
          © {new Date().getFullYear()} ForeverVows · All rights reserved.
        </motion.p>
      </main>
    </div>
  )
}
