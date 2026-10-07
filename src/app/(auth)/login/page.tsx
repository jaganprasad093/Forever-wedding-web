'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, ArrowLeft, AlertCircle } from 'lucide-react'
import { authService } from '@/services'

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

/* ─── Main Content ───────────────────────────────────────────────────── */
function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  const urlError = searchParams.get('error')

  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(urlError || null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null)
    const result = await authService.login({ email: data.email, password: data.password })
    if (!result.success && result.error) {
      setAuthError(result.error)
      return
    }
    router.push(redirectTo)
    router.refresh()
  }

  const handleGoogleSignIn = async () => {
    try {
      setAuthError(null)
      setIsGoogleLoading(true)
      const result = await authService.signInWithGoogle(redirectTo)
      if (!result.success && result.error) {
        setAuthError(result.error)
        setIsGoogleLoading(false)
      }
    } catch {
      setAuthError('Failed to initiate Google sign in. Please try again.')
      setIsGoogleLoading(false)
    }
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
          href="/"
          className="pointer-events-auto group inline-flex items-center gap-2
    text-xs font-medium text-stone-500
    hover:text-stone-900 transition-colors duration-200"
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-full
    border border-stone-200 bg-white/70
    group-hover:border-[#cbb8a3] group-hover:bg-[#f8f3ed]
    transition-all duration-200"
          >
            <ArrowLeft
              className="w-3.5 h-3.5 text-stone-400
        group-hover:text-[#8c6b48]
        group-hover:-translate-x-0.5
        transition-all duration-200"
            />
          </span>

          <span>Back to ForeverVows</span>
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
          className="flex flex-col items-center text-center gap-3.5 mb-12 sm:mb-14 px-4"
        >
          {/* Fine rule + star ornament */}
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-12 sm:w-16 bg-gradient-to-r from-transparent to-[#cbb8a3]" />
            <span className="text-[#a89078] text-[10px] sm:text-xs">✦</span>
            <div className="h-px w-12 sm:w-16 bg-gradient-to-l from-transparent to-[#cbb8a3]" />
          </div>

          {/* Welcome pill badge */}
          <div className="inline-flex items-center gap-2.5 !px-5 !py-1 rounded-full border border-[#d8c8b4]/80 bg-[#f7f2ea]/90 text-[#856543] !text-xs sm:!text-sm font-medium tracking-[0.18em] uppercase shadow-xs">            <span className="text-[9px] leading-none text-[#a07c57]">♦</span>
            <span>Welcome to ForeverVows</span>
          </div>

          <p className="text-stone-500 text-sm leading-relaxed max-w-[360px]">
            A calm, premium space to sign in, personalize, and publish with confidence.
          </p>
        </motion.div>

        {/* ── Card ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="w-full max-w-[480px] !mt-3"
        >
          <div className="w-full bg-white/95 backdrop-blur-xs rounded-2xl sm:rounded-3xl border border-[#ede7de] shadow-[0_12px_44px_-10px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
            {/* Card inner padding */}
            <div className="!px-8 !py-10 sm:!px-10 sm:!py-5">

              <div className="!mb-7">
                <h1 className="font-serif !text-xl sm:!text-2xl font-normal text-stone-900 tracking-tight !leading-tight !mb-3 !px-1">
                  Sign in to your account
                </h1>

                <p className="text-stone-500 !text-xs sm:!text-sm !leading-5 !px-1 max-w-[360px]">
                  Return to your dashboard and pick up where you left off.
                </p>
              </div>


              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 sm:gap-6" noValidate>

                {/* Email */}
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

                {/* Password */}
                <Field label="Password" error={errors.password?.message}>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className={`${inputBase} pr-10`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="flex justify-end mt-1.5">
                    <Link
                      href="/forgot-password"
                      className="text-xs text-stone-500 hover:text-[#8c6b48] transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </Field>

                {/* Error */}
                {authError && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="mb-6 p-4 bg-red-50/90 border border-red-200/80 rounded-xl flex items-start gap-3 shadow-xs"
                  >
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm text-red-700 font-medium leading-relaxed">
                      {authError}
                    </div>
                  </motion.div>
                )}
                {/* Submit */}
                <motion.button
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={5}
                  type="submit"
                  disabled={isSubmitting || isGoogleLoading}
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.995 }}
                  className="w-full h-12 bg-[#8c6b48] hover:bg-[#7e5f3e] active:bg-[#6c4f31] text-white rounded-xl font-medium text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(140,107,72,0.22)] hover:shadow-[0_4px_14px_rgba(140,107,72,0.32)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
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
                {/* "or" divider */}
                <div className="relative my-7 sm:my-8 flex items-center justify-center">
                  <div className="w-full border-t border-stone-200/70" />
                  <span className="absolute px-3 bg-white text-xs uppercase tracking-widest text-stone-400 font-medium">
                    or
                  </span>
                </div>
                {/* Google button */}
                <motion.button
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={2}
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading || isSubmitting}
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.995 }}
                  className="w-full h-12 px-5 bg-white hover:bg-stone-50/80 active:bg-stone-100 border border-stone-200/90 hover:border-stone-300 rounded-xl text-stone-700 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isGoogleLoading
                    ? <Loader2 className="w-4 h-4 animate-spin text-stone-500" />
                    : <GoogleIcon />
                  }
                  <span>Continue with Google</span>
                </motion.button>
              </form>

              {/* Create account link */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={6}
                className="!mt-3 !pt-2 border-t border-stone-100 text-center"
              >
                <p className="text-sm text-stone-500">
                  New to ForeverVows?{' '}
                  <Link
                    href="/register"
                    className="font-semibold text-stone-900 hover:text-[#8c6b48] underline underline-offset-4 decoration-stone-300 hover:decoration-[#8c6b48] transition-colors ml-1"
                  >
                    Create an account
                  </Link>
                </p>
              </motion.div>



            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={7}
          className="mt-10 sm:mt-12 text-center text-xs text-stone-400 tracking-wide translate-y-6"
        >
          © {new Date().getFullYear()} ForeverVows · All rights reserved.
        </motion.p>
      </main>
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
