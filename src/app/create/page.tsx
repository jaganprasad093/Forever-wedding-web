'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Loader2, Sparkles, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import { TEMPLATES } from '@/data/templates'
import { Template } from '@/types/wedding'
import { createClient } from '@/lib/supabase/client'

function CreateInvitationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateSlug = searchParams.get('template')

  const [status, setStatus] = useState<'loading' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [matchedTemplate, setMatchedTemplate] = useState<Template | null>(null)

  const isCreatingRef = useRef(false)

  const handleCreate = useCallback(async () => {
    if (!templateSlug) {
      router.replace('/templates')
      return
    }

    const template = TEMPLATES.find(
      (t) => t.slug === templateSlug || t.id === templateSlug
    )

    if (!template) {
      setStatus('error')
      setErrorMessage(`Template "${templateSlug}" was not found.`)
      return
    }

    setMatchedTemplate(template)
    setStatus('loading')
    setErrorMessage(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        // Redirect to register/login with return query if unauthenticated
        router.replace(`/register?template=${encodeURIComponent(template.slug)}`)
        return
      }

      // Ensure profile exists for the current user to satisfy foreign key constraint
      await supabase.from('profiles').upsert(
        {
          id: user.id,
          name:
            (user.user_metadata?.name as string) ||
            (user.user_metadata?.full_name as string) ||
            user.email?.split('@')[0] ||
            'User',
        },
        { onConflict: 'id' }
      )

      // Generate a unique wedding slug
      const baseSlug = `${template.slug}-${Date.now().toString(36)}`

      const { data: wedding, error: insertError } = await supabase
        .from('weddings')
        .insert({
          user_id: user.id,
          template_id: template.id,
          slug: baseSlug,
          theme:
            (template.config as { defaultTheme?: Record<string, string> })
              ?.defaultTheme || {},
          published: false,
          views: 0,
        })
        .select()
        .single()

      if (insertError) {
        console.error('Failed to create wedding:', insertError)
        setStatus('error')
        setErrorMessage(
          insertError.message || 'Failed to initialize invitation. Please try again.'
        )
        isCreatingRef.current = false
        return
      }

      if (wedding?.id) {
        router.replace(`/editor/${wedding.id}`)
      } else {
        throw new Error('No wedding record was returned.')
      }
    } catch (err: unknown) {
      console.error('Error in create page:', err)
      setStatus('error')
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred.'
      )
      isCreatingRef.current = false
    }
  }, [templateSlug, router])

  useEffect(() => {
    if (isCreatingRef.current) return
    isCreatingRef.current = true
    handleCreate()
  }, [handleCreate])

  return (
    <div className="relative min-h-screen w-full bg-[#faf7f2] flex flex-col justify-between selection:bg-[#ebdcc9] selection:text-[#5c4028]">
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[720px] h-[480px] bg-gradient-to-b from-[#f3eae0]/80 via-[#f9f5ee]/40 to-transparent rounded-full blur-3xl opacity-70" />
      </div>

      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 !px-5 sm:!px-10 !py-5 pointer-events-none">
        <Link
          href="/templates"
          className="pointer-events-auto group inline-flex items-center gap-2.5 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors duration-200"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-full border border-stone-200 bg-white/70 group-hover:border-[#cbb8a3] group-hover:bg-[#f8f3ed] transition-all duration-200">
            <ArrowLeft className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#8c6b48] group-hover:-translate-x-0.5 transition-all duration-200" />
          </span>
          <span>Browse Templates</span>
        </Link>
      </header>

      {/* Main Center */}
      <main className="flex-1 flex flex-col items-center justify-center !px-5 sm:!px-6 !pt-28 sm:!pt-32 !pb-16 w-full">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[480px]"
        >
          <div className="w-full bg-white/95 backdrop-blur-xs rounded-2xl sm:rounded-3xl border border-[#ede7de] shadow-[0_12px_44px_-10px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden !px-6 !py-10 sm:!px-10 sm:!py-12 text-center">
            {status === 'loading' ? (
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 bg-[#f7f2ea] border border-[#e5dacf] rounded-full flex items-center justify-center mx-auto !mb-6 shadow-xs">
                  <Sparkles className="w-7 h-7 text-[#8c6b48] animate-pulse" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8c6b48] opacity-60" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-[#8c6b48] border-2 border-white" />
                  </span>
                </div>

                <h1 className="font-serif !text-2xl sm:!text-3xl font-normal text-stone-900 tracking-tight !leading-tight !mb-2.5">
                  Preparing your invitation
                </h1>

                <p className="text-stone-500 text-sm leading-relaxed max-w-[340px] !mb-8">
                  {matchedTemplate
                    ? `Configuring the ${matchedTemplate.name} template for your wedding...`
                    : 'Setting up your bespoke wedding invitation space...'}
                </p>

                <div className="inline-flex items-center gap-2.5 text-xs font-medium text-[#8c6b48] bg-[#fbf8f4] border border-[#ebdcc9] !px-4 !py-2 rounded-full">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Redirecting to your editor shortly…</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mx-auto !mb-6 shadow-xs">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>

                <h1 className="font-serif !text-2xl sm:!text-3xl font-normal text-stone-900 tracking-tight !leading-tight !mb-2.5">
                  Something went wrong
                </h1>

                <p className="text-stone-500 text-sm leading-relaxed max-w-[340px] !mb-8">
                  {errorMessage || "We couldn't initialize your wedding template."}
                </p>

                <div className="flex flex-col gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      isCreatingRef.current = false
                      handleCreate()
                    }}
                    className="w-full h-12 !px-5 bg-[#8c6b48] hover:bg-[#7e5f3e] active:bg-[#6c4f31] text-white rounded-xl font-medium text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(140,107,72,0.22)] cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Try Again</span>
                  </button>

                  <Link
                    href="/templates"
                    className="w-full h-12 !px-5 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl text-stone-700 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Browse Other Templates</span>
                  </Link>

                  <Link
                    href="/dashboard"
                    className="text-xs text-stone-500 hover:text-[#8c6b48] transition-colors !mt-2 !py-1"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="!pb-8 text-center text-xs text-stone-400">
        © {new Date().getFullYear()} ForeverVows · All rights reserved.
      </footer>
    </div>
  )
}

export default function CreateInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-[#faf7f2]">
          <Loader2 className="w-8 h-8 animate-spin text-[#8c6b48]" />
        </div>
      }
    >
      <CreateInvitationContent />
    </Suspense>
  )
}
