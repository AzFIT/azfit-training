/**
 * Auth Service — Thin wrapper around Supabase Auth
 *
 * Provides a clean API for sign-up, sign-in, sign-out, password reset,
 * and session management. All password hashing is handled server-side by Supabase.
 */

import { supabase, isSupabaseConfigured } from './supabase'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthError {
  message: string
  status?: number
}

export interface CoachProfile {
  id: string
  full_name: string
  email: string
  business_name?: string
  specialty?: string
  role: 'admin' | 'coach'
  created_at: string
}

/* ── Sign Up ─────────────────────────────────────────────────────── */

export async function signUp(
  email: string,
  password: string,
  metadata: { full_name: string; business_name?: string; specialty?: string }
): Promise<{ user: User | null; error: AuthError | null }> {
  if (!isSupabaseConfigured) {
    return { user: null, error: { message: 'Supabase is not configured. Check your environment variables.' } }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: metadata.full_name,
        business_name: metadata.business_name || '',
        specialty: metadata.specialty || '',
      },
    },
  })

  if (error) {
    return { user: null, error: { message: error.message, status: error.status } }
  }

  // Create coach profile in coaches table
  if (data.user) {
    const { error: profileError } = await supabase.from('coaches').insert({
      id: data.user.id,
      full_name: metadata.full_name,
      email,
      business_name: metadata.business_name || null,
      specialty: metadata.specialty || null,
      role: 'coach',
    })

    if (profileError) {
      console.error('[Auth] Failed to create coach profile:', profileError)
      // Don't fail signup if profile creation fails — user can retry later
    }
  }

  return { user: data.user ?? null, error: null }
}

/* ── Sign In ─────────────────────────────────────────────────────── */

export async function signIn(
  email: string,
  password: string
): Promise<{ session: Session | null; error: AuthError | null }> {
  if (!isSupabaseConfigured) {
    return { session: null, error: { message: 'Supabase is not configured. Check your environment variables.' } }
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { session: null, error: { message: error.message, status: error.status } }
  }

  return { session: data.session, error: null }
}

/* ── Sign Out ────────────────────────────────────────────────────── */

export async function signOut(): Promise<{ error: AuthError | null }> {
  if (!isSupabaseConfigured) {
    return { error: null }
  }

  const { error } = await supabase.auth.signOut()

  if (error) {
    return { error: { message: error.message } }
  }

  return { error: null }
}

/* ── Password Reset ──────────────────────────────────────────────── */

export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  if (!isSupabaseConfigured) {
    return { error: { message: 'Supabase is not configured. Check your environment variables.' } }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })

  if (error) {
    return { error: { message: error.message, status: error.status } }
  }

  return { error: null }
}

/* ── Session ─────────────────────────────────────────────────────── */

export async function getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
  if (!isSupabaseConfigured) {
    return { session: null, error: null }
  }

  const { data, error } = await supabase.auth.getSession()

  if (error) {
    return { session: null, error: { message: error.message } }
  }

  return { session: data.session, error: null }
}

/* ── Coach Profile ───────────────────────────────────────────────── */

export async function getCoachProfile(userId: string): Promise<{ profile: CoachProfile | null; error: AuthError | null }> {
  if (!isSupabaseConfigured) {
    return { profile: null, error: null }
  }

  const { data, error } = await supabase
    .from('coaches')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    return { profile: null, error: { message: error.message } }
  }

  return { profile: data as CoachProfile, error: null }
}

/* ── Auth State Listener ─────────────────────────────────────────── */

export function onAuthStateChange(
  callback: (event: 'SIGNED_IN' | 'SIGNED_OUT' | 'USER_UPDATED', session: Session | null) => void
) {
  if (!isSupabaseConfigured) {
    return { data: { subscription: { unsubscribe: () => {} } } }
  }

  return supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
      callback(event, session)
    }
  })
}
