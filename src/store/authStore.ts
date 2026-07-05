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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        set({ user: session.user, profile: profile || null, loading: false, initialized: true })
      } else {
        set({ user: null, profile: null, loading: false, initialized: true })
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          set({ user: session.user, profile: profile || null, loading: false })
        } else {
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
    await supabase.auth.signOut()
    set({ user: null, profile: null, loading: false })
  },
}))
