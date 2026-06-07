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

export type UserRole = 'admin' | 'coach'

interface DemoUser {
  id: string
  email: string
  user_metadata: { full_name: string }
}

interface AuthState {
  // ── State ──────────────────────────────────────────────────────
  user: User | DemoUser | null
  session: Session | null
  profile: CoachProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  role: UserRole | null
  isDemoMode: boolean

  // ── Actions ────────────────────────────────────────────────────
  login: (email: string, password: string) => Promise<{ error: string | null }>
  register: (email: string, password: string, metadata: { full_name: string; business_name?: string; specialty?: string }) => Promise<{ error: string | null }>
  logout: () => Promise<void>
  loadSession: () => Promise<void>
  enableDemoMode: () => void
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setProfile: (profile: CoachProfile | null) => void
  setRole: (role: UserRole | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  user: null,
  session: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  role: null,
  isDemoMode: false,

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
      isDemoMode: false,
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
    // Try auto-login anyway (works if email confirmation is disabled)
    const { session, error: signInError } = await signIn(email, password)

    if (signInError || !session) {
      set({ isLoading: false })
      return { error: null } // Success but needs email verification
    }

    const { profile: coachProfile } = await getCoachProfile(session.user.id)

    set({
      user: session.user,
      session,
      profile: coachProfile,
      isAuthenticated: true,
      isLoading: false,
      role: coachProfile?.role ?? 'coach',
      isDemoMode: false,
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
      isDemoMode: false,
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
      isDemoMode: false,
    })
  },

  // ── Demo Mode ──────────────────────────────────────────────────
  enableDemoMode: () => {
    const demoUser: DemoUser = {
      id: 'demo-user-' + crypto.randomUUID(),
      email: 'demo@azfit.fit',
      user_metadata: { full_name: 'Demo Trainer' },
    }
    set({
      user: demoUser as unknown as User,
      session: null,
      profile: { id: demoUser.id, full_name: 'Demo Trainer', email: demoUser.email, role: 'coach', created_at: new Date().toISOString() },
      isAuthenticated: true,
      isLoading: false,
      role: 'coach',
      isDemoMode: true,
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
