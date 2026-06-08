/**
 * Local Auth Service — Pure localStorage-based authentication
 *
 * Replaces Supabase auth for MVP deployment to GitHub Pages.
 * No backend required. Data persists in browser localStorage.
 *
 * Phase 1 spec:
 *   - Coach signup/login with localStorage persistence
 *   - Password "hashing" via btoa (not secure, but meets spec)
 *   - Auto-login via "azfit-auth-token" = coach ID
 *   - Logout clears token
 */

import type { CoachProfile } from './auth'

export interface AuthError {
  message: string
  status?: number
}

export interface LocalSession {
  user: {
    id: string
    email: string
    user_metadata: { full_name: string }
  }
  coachId: string
}

/* ── Storage Keys ────────────────────────────────────────────────── */

const COACHES_KEY = 'azfit-coaches'
const AUTH_TOKEN_KEY = 'azfit-auth-token'

/* ── Coach Storage ───────────────────────────────────────────────── */

interface StoredCoach {
  id: string
  fullName: string
  email: string
  passwordHash: string
  businessName?: string
  specialty?: string
  yearsExperience?: number
  createdAt: string
  lastLogin: string
  settings: {
    theme: string
    unitSystem: string
    defaultSessionDuration: number
  }
}

function getCoaches(): StoredCoach[] {
  try {
    const raw = localStorage.getItem(COACHES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCoaches(coaches: StoredCoach[]) {
  localStorage.setItem(COACHES_KEY, JSON.stringify(coaches))
}

/* ── Sign Up ─────────────────────────────────────────────────────── */

export async function signUp(
  email: string,
  password: string,
  metadata: { full_name: string; business_name?: string; specialty?: string }
): Promise<{ user: LocalSession['user'] | null; error: AuthError | null }> {
  const coaches = getCoaches()

  // Check if email already exists
  if (coaches.some((c) => c.email.toLowerCase() === email.toLowerCase())) {
    return { user: null, error: { message: 'An account with this email already exists' } }
  }

  const coach: StoredCoach = {
    id: 'coach_' + Date.now(),
    fullName: metadata.full_name,
    email: email.toLowerCase(),
    passwordHash: btoa(password),
    businessName: metadata.business_name || '',
    specialty: metadata.specialty || '',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    settings: {
      theme: 'dark',
      unitSystem: 'metric',
      defaultSessionDuration: 60,
    },
  }

  coaches.push(coach)
  saveCoaches(coaches)

  // Auto-login after signup
  localStorage.setItem(AUTH_TOKEN_KEY, coach.id)

  return {
    user: {
      id: coach.id,
      email: coach.email,
      user_metadata: { full_name: coach.fullName },
    },
    error: null,
  }
}

/* ── Sign In ─────────────────────────────────────────────────────── */

export async function signIn(
  email: string,
  password: string
): Promise<{ session: LocalSession | null; error: AuthError | null }> {
  const coaches = getCoaches()
  const coach = coaches.find((c) => c.email.toLowerCase() === email.toLowerCase())

  if (!coach) {
    return { session: null, error: { message: 'Invalid email or password' } }
  }

  if (coach.passwordHash !== btoa(password)) {
    return { session: null, error: { message: 'Invalid email or password' } }
  }

  // Update last login
  coach.lastLogin = new Date().toISOString()
  saveCoaches(coaches)

  // Set auth token
  localStorage.setItem(AUTH_TOKEN_KEY, coach.id)

  return {
    session: {
      user: {
        id: coach.id,
        email: coach.email,
        user_metadata: { full_name: coach.fullName },
      },
      coachId: coach.id,
    },
    error: null,
  }
}

/* ── Sign Out ────────────────────────────────────────────────────── */

export async function signOut(): Promise<{ error: AuthError | null }> {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  return { error: null }
}

/* ── Password Reset (no-op for local auth) ───────────────────────── */

export async function resetPassword(_email: string): Promise<{ error: AuthError | null }> {
  return { error: { message: 'Password reset is not available in offline mode' } }
}

/* ── Session ─────────────────────────────────────────────────────── */

export async function getSession(): Promise<{ session: LocalSession | null; error: AuthError | null }> {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  if (!token) {
    return { session: null, error: null }
  }

  const coaches = getCoaches()
  const coach = coaches.find((c) => c.id === token)

  if (!coach) {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    return { session: null, error: null }
  }

  return {
    session: {
      user: {
        id: coach.id,
        email: coach.email,
        user_metadata: { full_name: coach.fullName },
      },
      coachId: coach.id,
    },
    error: null,
  }
}

/* ── Coach Profile ───────────────────────────────────────────────── */

export async function getCoachProfile(userId: string): Promise<{ profile: CoachProfile | null; error: AuthError | null }> {
  const coaches = getCoaches()
  const coach = coaches.find((c) => c.id === userId)

  if (!coach) {
    return { profile: null, error: null }
  }

  return {
    profile: {
      id: coach.id,
      full_name: coach.fullName,
      email: coach.email,
      business_name: coach.businessName,
      specialty: coach.specialty,
      role: 'coach',
      created_at: coach.createdAt,
    },
    error: null,
  }
}

/* ── Auth State Listener (simulated) ─────────────────────────────── */

export function onAuthStateChange(
  _callback: (event: 'SIGNED_IN' | 'SIGNED_OUT' | 'USER_UPDATED', session: LocalSession | null) => void
) {
  // Local auth doesn't have real-time state changes.
  // Return a no-op subscription.
  return {
    data: {
      subscription: {
        unsubscribe: () => {},
      },
    },
  }
}
