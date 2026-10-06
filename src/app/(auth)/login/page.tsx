'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

/* ─── Animation variants ─────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: 'easeOut' as const },
  }),
}

/* ─── Google SVG ─────────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  )
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
      <label className="text-sm font-medium text-stone-800 leading-none">{label}</label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-600"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}

/* ─── Main Content ───────────────────────────────────────────────────── */
function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password })
    if (error) { setAuthError(error.message); return }
    router.push(redirectTo)
    router.refresh()
  }

  const handleGoogleSignIn = async () => {
    try {
      setAuthError(null)
      setIsGoogleLoading(true)
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}` },
      })
      if (error) { setAuthError(error.message); setIsGoogleLoading(false) }
    } catch {
      setAuthError('Failed to initiate Google sign in. Please try again.')
      setIsGoogleLoading(false)
    }
  }

  const inputBase =
    'w-full px-4 py-3 bg-white border border-[#e5e0d8] rounded-xl text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#8c6b48]/20 focus:border-[#8c6b48] transition-all duration-150'

  return (
    /* ── Page shell ── */
    <div className="min-h-screen w-full bg-[#faf7f2] flex flex-col selection:bg-[#f3ebd8]">

      {/* ── Fixed top bar: back link ── */}
      <div className="fixed top-0 left-0 right-0 z-50 px-5 sm:px-8 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 transition-colors py-1.5 px-3 rounded-lg hover:bg-white/70 hover:shadow-xs backdrop-blur-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to ForeverVows</span>
        </Link>
      </div>

      {/* ── Scrollable center area ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-24 pb-12">

        {/* ── Ornament header ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
          className="flex flex-col items-center text-center mb-8 px-4"
        >
          {/* Fine rule + dot ornament */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="h-px w-10 bg-stone-300" />
            <div className="w-1.5 h-1.5 rounded-full border border-stone-400" />
            <div className="h-px w-10 bg-stone-300" />
          </div>

          {/* Welcome pill badge */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#d8c8b4] bg-[#f7f2ea] text-[#856543] text-[11px] font-medium tracking-[0.18em] uppercase mb-4 shadow-2xs">
            <span className="text-[9px] leading-none">♦</span>
            <span>Welcome to ForeverVows</span>
          </div>

          <p className="text-stone-600 text-sm leading-relaxed max-w-[320px]">
            A calm, premium space to sign in, personalize, and publish with confidence.
          </p>
        </motion.div>

        {/* ── Card ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="w-full max-w-[460px]"
        >
          <div className="w-full bg-white rounded-3xl border border-[#ede8e1] shadow-[0_4px_32px_rgba(0,0,0,0.06)] overflow-hidden">
            {/* Card inner padding */}
            <div className="p-8 sm:p-10">

              {/* Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-stone-900 tracking-tight leading-snug mb-2">
                  Sign in to your account
                </h1>
                <p className="text-stone-500 text-sm leading-relaxed">
                  Return to your dashboard and pick up where you left off.
                </p>
              </div>

              {/* Error */}
              {authError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl leading-relaxed"
                >
                  {authError}
                </motion.div>
              )}

              {/* Google button */}
              <motion.button
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={2}
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isSubmitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3 px-5 bg-white hover:bg-stone-50 active:bg-stone-100 border border-stone-200 rounded-xl text-stone-800 text-sm font-medium transition-all duration-150 flex items-center justify-center gap-3 shadow-sm cursor-pointer disabled:opacity-60"
              >
                {isGoogleLoading
                  ? <Loader2 className="w-4 h-4 animate-spin text-stone-500" />
                  : <GoogleIcon />
                }
                <span>Continue with Google</span>
              </motion.button>

              {/* "or" divider */}
              <div className="relative my-7 flex items-center">
                <div className="flex-1 border-t border-stone-200" />
                <span className="px-4 text-xs text-stone-400">or</span>
                <div className="flex-1 border-t border-stone-200" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>

                {/* Email */}
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}>
                  <Field label="Email" error={errors.email?.message}>
                    <input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="name@example.com"
                      autoComplete="email"
                      className={inputBase}
                    />
                  </Field>
                </motion.div>

                {/* Password */}
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}>
                  <Field label="Password" error={errors.password?.message}>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        {...register('password')}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        className={`${inputBase} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 rounded-md transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Forgot link — inside the field wrapper but below the input */}
                    <div className="flex justify-end -mt-1">
                      <Link
                        href="/forgot-password"
                        className="text-xs text-stone-400 hover:text-[#8c6b48] font-medium transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </Field>
                </motion.div>

                {/* Submit */}
                <motion.button
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={5}
                  type="submit"
                  disabled={isSubmitting || isGoogleLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full bg-[#8c6b48] hover:bg-[#7e5f3e] active:bg-[#705437] text-white py-3.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing in…</span>
                    </>
                  ) : (
                    'Sign in'
                  )}
                </motion.button>
              </form>

              {/* Create account link */}
              <motion.p
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={6}
                className="mt-8 text-center text-sm text-stone-500 leading-none"
              >
                New to ForeverVows?{' '}
                <Link
                  href="/register"
                  className="font-semibold text-stone-900 hover:text-[#8c6b48] underline underline-offset-2 transition-colors"
                >
                  Create an account
                </Link>
              </motion.p>

            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={7}
          className="mt-10 text-center text-xs text-stone-400"
        >
          © {new Date().getFullYear()} ForeverVows · All rights reserved.
        </motion.p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-[#faf7f2]">
          <Loader2 className="w-8 h-8 animate-spin text-[#8c6b48]" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
