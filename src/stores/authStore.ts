/**
 * Auth Store — Central authentication state
 *
 * Uses Zustand for reactive auth state.
 * Supabase Auth handles session persistence (localStorage/cookies) internally.
 * This store mirrors the Supabase session + adds coach profile/role.
 */

import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import type { CoachProfile } from '../lib/auth'
import {
  signIn,
  signUp,
  signOut,
  getSession,
  getCoachProfile,
  onAuthStateChange,
} from '../lib/auth'

interface AuthState {
  // ── State ──────────────────────────────────────────────────────
  user: User | null
  session: Session | null
  profile: CoachProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  role: 'admin' | 'coach' | null

  // ── Actions ────────────────────────────────────────────────────
  login: (email: string, password: string) => Promise<{ error: string | null }>
  register: (email: string, password: string, metadata: { full_name: string; business_name?: string; specialty?: string }) => Promise<{ error: string | null }>
  logout: () => Promise<void>
  loadSession: () => Promise<void>
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setProfile: (profile: CoachProfile | null) => void
  setRole: (role: 'admin' | 'coach' | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  user: null,
  session: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  role: null,

  // ── Login ──────────────────────────────────────────────────────
  login: async (email, password) => {
    set({ isLoading: true })
    const { session, error } = await signIn(email, password)

    if (error || !session) {
      set({ isLoading: false })
      return { error: error?.message || 'Login failed' }
    }

    // Fetch coach profile
    const { profile: coachProfile } = await getCoachProfile(session.user.id)

    set({
      user: session.user,
      session,
      profile: coachProfile,
      isAuthenticated: true,
      isLoading: false,
      role: coachProfile?.role ?? 'coach',
    })

    return { error: null }
  },

  // ── Register ───────────────────────────────────────────────────
  register: async (email, password, metadata) => {
    set({ isLoading: true })
    const { error } = await signUp(email, password, metadata)

    if (error) {
      set({ isLoading: false })
      return { error: error.message }
    }

    // After signup, user needs to verify email before signing in
    // For now, auto-login may fail if email confirmation is required
    // Try auto-login anyway
    const { session, error: signInError } = await signIn(email, password)

    if (signInError || !session) {
      set({ isLoading: false })
      return { error: signInError?.message || 'Account created! Please check your email to verify your account, then sign in.' }
    }

    const { profile: coachProfile } = await getCoachProfile(session.user.id)

    set({
      user: session.user,
      session,
      profile: coachProfile,
      isAuthenticated: true,
      isLoading: false,
      role: coachProfile?.role ?? 'coach',
    })

    return { error: null }
  },

  // ── Logout ─────────────────────────────────────────────────────
  logout: async () => {
    await signOut()
    set({
      user: null,
      session: null,
      profile: null,
      isAuthenticated: false,
      isLoading: false,
      role: null,
    })
  },

  // ── Load Session ───────────────────────────────────────────────
  loadSession: async () => {
    set({ isLoading: true })
    const { session } = await getSession()

    if (!session) {
      set({ isLoading: false })
      return
    }

    const { profile: coachProfile } = await getCoachProfile(session.user.id)

    set({
      user: session.user,
      session,
      profile: coachProfile,
      isAuthenticated: true,
      isLoading: false,
      role: coachProfile?.role ?? 'coach',
    })
  },

  // ── Setters ────────────────────────────────────────────────────
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session, isAuthenticated: !!session }),
  setProfile: (profile) => set({ profile, role: profile?.role ?? null }),
  setRole: (role) => set({ role }),
}))

// ── Global auth state listener ───────────────────────────────────
// This runs once when the module is imported
let authListenerInitialized = false

export function initAuthListener() {
  if (authListenerInitialized) return
  authListenerInitialized = true

  const { data } = onAuthStateChange((event, session) => {
    const store = useAuthStore.getState()

    if (event === 'SIGNED_IN' && session) {
      getCoachProfile(session.user.id).then(({ profile }) => {
        store.setUser(session.user)
        store.setSession(session)
        store.setProfile(profile)
      })
    }

    if (event === 'SIGNED_OUT') {
      store.logout()
    }
  })

  return data.subscription
}
