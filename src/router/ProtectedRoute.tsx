import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

interface ProtectedRouteProps {
  requireAdmin?: boolean
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requireAdmin = false }) => {
  const { user, isAdmin, loading, initialized } = useAuth()

  // Show spinner only while auth is actively loading
  // If initialized is still false after a reasonable wait something is wrong —
  // the authStore always sets initialized: true in its catch block, so this
  // should be a very brief flash at most.
  if (loading || !initialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#06060a]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
