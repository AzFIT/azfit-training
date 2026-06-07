import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

/**
 * AdminGuard — Redirects non-admin users to /dashboard.
 * Must be used inside AuthGuard (so isAuthenticated is guaranteed).
 */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const { role, isLoading } = useAuthStore()

  useEffect(() => {
    if (!isLoading && role !== 'admin') {
      navigate('/dashboard', { replace: true })
    }
  }, [isLoading, role, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-az-black">
        <div className="w-8 h-8 border-2 border-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (role !== 'admin') {
    return null
  }

  return <>{children}</>
}
