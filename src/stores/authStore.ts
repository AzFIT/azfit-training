/**
 * Auth Store — Central authentication state (LocalStorage Mode)
 *
 * Uses Zustand for reactive auth state.
 * Local auth handles session persistence via localStorage.
 * This store mirrors the local session + adds coach profile/role.
 */

import { create } from 'zustand'
import type { CoachProfile } from '../lib/auth'
import {
  signIn,
  signUp,
  signOut,
  getSession,
  getCoachProfile,
  onAuthStateChange,
} from '../lib/localAuth'
import type { LocalSession } from '../lib/localAuth'

export type UserRole = 'admin' | 'coach'

interface DemoUser {
  id: string
  email: string
  user_metadata: { full_name: string }
}

interface AuthState {
  // ── State ──────────────────────────────────────────────────────
  user: DemoUser | null
  session: LocalSession | null
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
  setUser: (user: DemoUser | null) => void
  setSession: (session: LocalSession | null) => void
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
    const { profile: coachProfile } = await getCoachProfile(session.coachId)

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
    const { user, error } = await signUp(email, password, metadata)

    if (error) {
      set({ isLoading: false })
      return { error: error.message }
    }

    if (!user) {
      set({ isLoading: false })
      return { error: 'Registration failed' }
    }

    // Auto-login after signup (local auth does this automatically)
    const { session, error: signInError } = await signIn(email, password)

    if (signInError || !session) {
      set({ isLoading: false })
      return { error: signInError?.message || 'Auto-login failed' }
    }

    const { profile: coachProfile } = await getCoachProfile(session.coachId)

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

    const { profile: coachProfile } = await getCoachProfile(session.coachId)

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
      user: demoUser,
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

  // Local auth doesn't have real-time state changes
  onAuthStateChange(() => {})
}
