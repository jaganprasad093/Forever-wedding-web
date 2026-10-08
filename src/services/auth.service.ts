import { createClient } from '@/lib/supabase/client'

export interface RegisterParams {
  name: string
  email: string
  password: string
  redirectTo?: string
}

export interface RegisterResult {
  success: boolean
  requiresEmailConfirmation: boolean
  error?: string
}

export interface LoginParams {
  email: string
  password: string
}

export interface ResendVerificationParams {
  email: string
  redirectTo?: string
}

export interface ResetPasswordParams {
  email: string
  redirectTo?: string
}

/**
 * Authentication service handling Supabase Auth interactions.
 * Contains purely service-level logic and API calls.
 */
export const authService = {
  /**
   * Registers a new user with email, password, and wedding account profile data.
   */
  async register({
    name,
    email,
    password,
    redirectTo = '/dashboard',
  }: RegisterParams): Promise<RegisterResult> {
    const supabase = createClient()
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          full_name: name,
          app_name: 'ForeverVows',
        },
        emailRedirectTo: callbackUrl,
      },
    })

    if (error) {
      const isRateLimit =
        error.code === 'over_email_send_rate_limit' ||
        error.status === 429 ||
        error.message.toLowerCase().includes('rate limit')

      if (isRateLimit) {
        return {
          success: false,
          requiresEmailConfirmation: false,
          error:
            'Supabase email sending limit exceeded (max 3 emails/hr on free tier). Please wait before trying again, or disable "Confirm email" in Supabase Auth settings.',
        }
      }

      return {
        success: false,
        requiresEmailConfirmation: false,
        error: error.message,
      }
    }

    // If an account with this email already exists, Supabase returns user with empty identities
    if (
      data.user &&
      Array.isArray(data.user.identities) &&
      data.user.identities.length === 0
    ) {
      return {
        success: false,
        requiresEmailConfirmation: false,
        error:
          'An account with this email is already registered. Please sign in instead.',
      }
    }

    // If session exists immediately (e.g. email confirmations turned off in Supabase)
    if (data.session && data.user) {
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          name,
        })
      } catch (profileError) {
        console.warn('Profile creation error during signup:', profileError)
      }
      return {
        success: true,
        requiresEmailConfirmation: false,
      }
    }

    // Email confirmation required by Supabase Auth
    return {
      success: true,
      requiresEmailConfirmation: true,
    }
  },

  /**
   * Signs in a user using email and password.
   */
  async login({ email, password }: LoginParams) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, user: data.user, session: data.session }
  },

  /**
   * Initiates Google OAuth authentication.
   */
  async signInWithGoogle(redirectTo = '/dashboard') {
    const supabase = createClient()
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl,
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  },

  /**
   * Resends confirmation email for unverified user accounts.
   */
  async resendVerificationEmail({
    email,
    redirectTo = '/dashboard',
  }: ResendVerificationParams) {
    const supabase = createClient()
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: callbackUrl,
      },
    })

    if (error) {
      const isRateLimit =
        error.code === 'over_email_send_rate_limit' ||
        error.status === 429 ||
        error.message.toLowerCase().includes('rate limit')

      if (isRateLimit) {
        return {
          success: false,
          error:
            'Supabase email sending limit exceeded (max 3/hr on free tier). Please wait before requesting another email, or disable "Confirm email" in Supabase Auth settings.',
        }
      }

      return { success: false, error: error.message }
    }

    return { success: true }
  },

  /**
   * Sends password reset instructions to the given email.
   */
  async resetPassword({ email, redirectTo }: ResetPasswordParams) {
    const supabase = createClient()
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const callbackUrl = redirectTo || `${origin}/reset-password`

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: callbackUrl,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  },

  /**
   * Signs out the current user session.
   */
  async signOut() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  },
}
