import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { User } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'admin' | 'customer'
  phone: string | null
}

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  initialized: boolean
  initialize: () => Promise<void>
  signOut: () => Promise<void>
  signInDemo: (role: 'admin' | 'customer') => void
}

// Guard — prevents duplicate DB profile fetches when auth fires rapidly
let _lastFetchedUserId: string | null = null

// Safe profile fetch — NEVER throws, always returns null on any error
// (e.g. table doesn't exist yet, network issue, RLS block)
const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
  if (_lastFetchedUserId === userId) return null // skip duplicate
  _lastFetchedUserId = userId
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle() // maybeSingle() returns null instead of error when no row found

    if (error) {
      // Table may not exist yet or RLS blocks — fail gracefully
      console.warn('[authStore] Profile fetch skipped:', error.message)
      return null
    }
    return data as UserProfile | null
  } catch {
    return null
  }
}

// Build a minimal profile from the Supabase Auth user when DB row is missing
const profileFromUser = (user: User): UserProfile => ({
  id: user.id,
  email: user.email ?? '',
  full_name: user.user_metadata?.full_name ?? null,
  avatar_url: user.user_metadata?.avatar_url ?? null,
  role: 'customer',
  phone: user.phone ?? null,
})

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    // Guard: only run once
    if (get().initialized) return

    // FIX: Check for persistent demo session first
    const demoSessionStr = localStorage.getItem('demo_auth_session')
    if (demoSessionStr) {
      try {
        const { user, profile } = JSON.parse(demoSessionStr)
        set({ user, profile, loading: false, initialized: true })
        return
      } catch {
        localStorage.removeItem('demo_auth_session')
      }
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        set({
          user: session.user,
          // Fall back to auth-derived profile if DB row not yet available
          profile: profile ?? profileFromUser(session.user),
          loading: false,
          initialized: true,
        })
      } else {
        set({ user: null, profile: null, loading: false, initialized: true })
      }

      // Listen for auth state changes (login, logout, token refresh)
      supabase.auth.onAuthStateChange(async (_event, session) => {
        // If a demo session is currently active, ignore Supabase listener updates
        if (localStorage.getItem('demo_auth_session')) return

        if (session?.user) {
          const fetched = await fetchProfile(session.user.id)
          set((state) => ({
            user: session.user,
            profile: fetched ?? state.profile ?? profileFromUser(session.user!),
            loading: false,
            initialized: true,
          }))
        } else {
          _lastFetchedUserId = null
          set({ user: null, profile: null, loading: false, initialized: true })
        }
      })
    } catch (error) {
      console.error('[authStore] Initialization error:', error)
      // Always resolve so ProtectedRoute never spins forever
      set({ user: null, profile: null, loading: false, initialized: true })
    }
  },

  signOut: async () => {
    set({ loading: true })
    _lastFetchedUserId = null
    localStorage.removeItem('demo_auth_session')
    await supabase.auth.signOut()
    set({ user: null, profile: null, loading: false })
  },

  signInDemo: (role: 'admin' | 'customer') => {
    const mockUser = {
      id: role === 'admin' ? 'demo-admin-id' : 'demo-customer-id',
      email: role === 'admin' ? 'admin@threaddrop.com' : 'demo@threaddrop.com',
      user_metadata: {
        full_name: role === 'admin' ? 'Demo Admin' : 'Demo Customer',
      },
    } as any

    const mockProfile: UserProfile = {
      id: mockUser.id,
      email: mockUser.email,
      full_name: mockUser.user_metadata.full_name,
      avatar_url: null,
      role: role,
      phone: null,
    }

    // Persist mock session so page reload doesn't sign them out
    localStorage.setItem('demo_auth_session', JSON.stringify({ user: mockUser, profile: mockProfile }))
    set({ user: mockUser, profile: mockProfile, loading: false, initialized: true })
  },
}))
