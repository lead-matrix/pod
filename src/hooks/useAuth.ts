import { useAuthStore } from '../store/authStore'

export const useAuth = () => {
  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)
  const loading = useAuthStore((state) => state.loading)
  const initialized = useAuthStore((state) => state.initialized)
  const signOut = useAuthStore((state) => state.signOut)

  const isAdmin = profile?.role === 'admin'

  return {
    user,
    profile,
    loading,
    initialized,
    signOut,
    isAdmin,
  }
}
