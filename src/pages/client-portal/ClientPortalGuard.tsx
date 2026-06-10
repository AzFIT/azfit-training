import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

/**
 * ClientPortalGuard — Only allows clients to access the client portal.
 * Coaches and admins are redirected to /dashboard.
 * Unauthenticated users are redirected to /login.
 */
export default function ClientPortalGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, isLoading, role } = useAuthStore()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      navigate('/login', { replace: true, state: { from: location.pathname } })
      return
    }

    // If role is coach or admin, redirect to dashboard
    if (role === 'coach' || role === 'admin') {
      navigate('/dashboard', { replace: true })
    }
  }, [isLoading, isAuthenticated, role, navigate, location.pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-az-black">
        <div className="w-8 h-8 border-2 border-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated || role === 'coach' || role === 'admin') {
    return null
  }

  return <>{children}</>
}
