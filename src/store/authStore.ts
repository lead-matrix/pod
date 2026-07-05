import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { User } from '@supabase/supabase-js'

interface UserProfile {
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
}

// FIX #5: Guard — tracks the last user ID fetched to prevent duplicate
// profile DB calls when auth state fires multiple times in quick succession
let _lastFetchedUserId: string | null = null

const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
  if (_lastFetchedUserId === userId) return null // skip duplicate fetch
  _lastFetchedUserId = userId
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data as UserProfile | null
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        set({ user: session.user, profile, loading: false, initialized: true })
      } else {
        set({ user: null, profile: null, loading: false, initialized: true })
      }

      // Listen for auth changes — deduped by fetchProfile guard
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const existing = await fetchProfile(session.user.id)
          // fetchProfile returns null when it skips a duplicate; keep current profile
          set((state) => ({
            user: session.user,
            profile: existing ?? state.profile,
            loading: false,
          }))
        } else {
          _lastFetchedUserId = null // reset guard on sign-out
          set({ user: null, profile: null, loading: false })
        }
      })
    } catch (error) {
      console.error('Error initializing auth store:', error)
      set({ user: null, profile: null, loading: false, initialized: true })
    }
  },

  signOut: async () => {
    set({ loading: true })
    _lastFetchedUserId = null
    await supabase.auth.signOut()
    set({ user: null, profile: null, loading: false })
  },
}))
