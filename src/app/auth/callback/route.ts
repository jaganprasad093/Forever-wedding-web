import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  // Supabase error parameters if link expired, invalid, or access denied
  const error = searchParams.get('error')
  const errorCode = searchParams.get('error_code')
  const errorDescription = searchParams.get('error_description')

  // Sanitize redirect target to avoid open redirect vulnerabilities
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'

  if (error || errorCode || errorDescription) {
    let friendlyMessage =
      errorDescription ||
      'Authentication link is invalid or has expired.'

    if (errorCode === 'otp_expired' || friendlyMessage.toLowerCase().includes('expired')) {
      friendlyMessage =
        'Your email confirmation link has expired or was already used. Please sign in or request a new verification link.'
    }

    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(friendlyMessage)}`
    )
  }

  const supabase = await createClient()

  // 1. Handle PKCE code exchange (standard Supabase OAuth and modern signup)
  if (code) {
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError && data.user) {
      // Sync user profile name if provided in metadata
      const name =
        data.user.user_metadata?.name ||
        data.user.user_metadata?.full_name ||
        data.user.email?.split('@')[0]

      if (name) {
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            name,
          })
        } catch (profileErr) {
          console.warn('Profile synchronization warning in auth callback:', profileErr)
        }
      }

      return NextResponse.redirect(`${origin}${safeNext}`)
    }

    if (exchangeError) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`
      )
    }
  }

  // 2. Handle token_hash verification (email OTP / confirmation link)
  if (token_hash && type) {
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    })

    if (!verifyError && data.user) {
      const name =
        data.user.user_metadata?.name ||
        data.user.user_metadata?.full_name ||
        data.user.email?.split('@')[0]

      if (name) {
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            name,
          })
        } catch (profileErr) {
          console.warn('Profile synchronization warning in auth callback:', profileErr)
        }
      }

      return NextResponse.redirect(`${origin}${safeNext}`)
    }

    if (verifyError) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(verifyError.message)}`
      )
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent('Invalid or expired verification link. Please sign in.')}`
  )
}
