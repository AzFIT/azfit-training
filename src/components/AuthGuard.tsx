import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

/**
 * AuthGuard — Redirects unauthenticated users to /login.
 * Shows a loading spinner while checking the session.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, isLoading } = useAuthStore()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true, state: { from: location.pathname } })
    }
  }, [isLoading, isAuthenticated, navigate, location.pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-az-black">
        <div className="w-8 h-8 border-2 border-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
