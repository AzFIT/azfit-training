/**
 * Auth Store — Central authentication state
 *
 * Uses Zustand for reactive auth state.
 * Tries Supabase Auth first (when configured), falls back to localStorage.
 */

import { create } from 'zustand'
import type { CoachProfile } from '../lib/auth'
import {
  signIn as localSignIn,
  signUp as localSignUp,
  signOut as localSignOut,
  getSession as localGetSession,
  getCoachProfile as localGetCoachProfile,
  onAuthStateChange,
} from '../lib/localAuth'
import type { LocalSession } from '../lib/localAuth'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

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

    // Try Supabase Auth first if configured
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (!error && data.user) {
        const role = (data.user.user_metadata?.role as UserRole) || 'coach'
        const fullName = (data.user.user_metadata?.full_name as string) || email.split('@')[0]

        set({
          user: {
            id: data.user.id,
            email: data.user.email || email,
            user_metadata: { full_name: fullName },
          },
          session: {
            user: {
              id: data.user.id,
              email: data.user.email || email,
              user_metadata: { full_name: fullName },
            },
            coachId: data.user.id,
          },
          profile: {
            id: data.user.id,
            full_name: fullName,
            email: data.user.email || email,
            role,
            created_at: data.user.created_at || new Date().toISOString(),
          },
          isAuthenticated: true,
          isLoading: false,
          role,
          isDemoMode: false,
        })

        return { error: null }
      }

      // If Supabase login failed with "Invalid login credentials", try local fallback
      // Otherwise return the Supabase error
      if (error && !error.message.includes('Invalid login credentials')) {
        set({ isLoading: false })
        return { error: error.message }
      }
    }

    // Fallback to local auth
    const { session, error } = await localSignIn(email, password)

    if (error || !session) {
      set({ isLoading: false })
      return { error: error?.message || 'Login failed' }
    }

    // Fetch coach profile
    const { profile: coachProfile } = await localGetCoachProfile(session.coachId)

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

    // Try Supabase first if configured
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata.full_name,
            role: 'coach',
          },
        },
      })

      if (!error && data.user) {
        const role: UserRole = 'coach'
        set({
          user: {
            id: data.user.id,
            email: data.user.email || email,
            user_metadata: { full_name: metadata.full_name },
          },
          session: {
            user: {
              id: data.user.id,
              email: data.user.email || email,
              user_metadata: { full_name: metadata.full_name },
            },
            coachId: data.user.id,
          },
          profile: {
            id: data.user.id,
            full_name: metadata.full_name,
            email: data.user.email || email,
            role,
            created_at: data.user.created_at || new Date().toISOString(),
          },
          isAuthenticated: true,
          isLoading: false,
          role,
          isDemoMode: false,
        })
        return { error: null }
      }

      if (error) {
        set({ isLoading: false })
        return { error: error.message }
      }
    }

    // Fallback to local auth
    const { user, error } = await localSignUp(email, password, metadata)

    if (error) {
      set({ isLoading: false })
      return { error: error.message }
    }

    if (!user) {
      set({ isLoading: false })
      return { error: 'Registration failed' }
    }

    // Auto-login after signup
    const { session, error: signInError } = await localSignIn(email, password)

    if (signInError || !session) {
      set({ isLoading: false })
      return { error: signInError?.message || 'Auto-login failed' }
    }

    const { profile: coachProfile } = await localGetCoachProfile(session.coachId)

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
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    }
    await localSignOut()
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

    // Try Supabase session first
    if (isSupabaseConfigured) {
      const { data } = await supabase.auth.getSession()
      if (data.session?.user) {
        const user = data.session.user
        const role = (user.user_metadata?.role as UserRole) || 'coach'
        const fullName = (user.user_metadata?.full_name as string) || user.email?.split('@')[0] || 'User'

        set({
          user: {
            id: user.id,
            email: user.email || '',
            user_metadata: { full_name: fullName },
          },
          session: {
            user: {
              id: user.id,
              email: user.email || '',
              user_metadata: { full_name: fullName },
            },
            coachId: user.id,
          },
          profile: {
            id: user.id,
            full_name: fullName,
            email: user.email || '',
            role,
            created_at: user.created_at || new Date().toISOString(),
          },
          isAuthenticated: true,
          isLoading: false,
          role,
          isDemoMode: false,
        })
        return
      }
    }

    // Fallback to local session
    const { session } = await localGetSession()

    if (!session) {
      set({ isLoading: false })
      return
    }

    const { profile: coachProfile } = await localGetCoachProfile(session.coachId)

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
