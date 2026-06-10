import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dumbbell,
  Apple,
  TrendingUp,
  Trophy,
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
  Home,
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

const portalNavItems = [
  { label: 'Today', path: '/client-portal', icon: Home, exact: true },
  { label: 'Workout', path: '/client-portal/workout', icon: Dumbbell },
  { label: 'Nutrition', path: '/client-portal/nutrition', icon: Apple },
  { label: 'Progress', path: '/client-portal/progress', icon: TrendingUp },
  { label: 'Achievements', path: '/client-portal/achievements', icon: Trophy },
]

export default function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const { logout, user, profile } = useAuthStore()

  /* Theme management */
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('azfit-theme')
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'light')
    root.classList.add(theme)
    localStorage.setItem('azfit-theme', theme)
  }, [theme])

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const isDark = theme === 'dark'

  /* Theme-aware color tokens */
  const appBg = isDark ? 'bg-az-black' : 'bg-light-surface'
  const sidebarBg = isDark ? 'bg-az-black-card' : 'bg-white'
  const sidebarBorder = isDark ? 'border-dark-border' : 'border-light-border'
  const topBarBg = isDark ? 'bg-az-black/80' : 'bg-white/80'
  const topBarBorder = isDark ? 'border-dark-divider' : 'border-light-border'
  const textPrimary = isDark ? 'text-dark-primary' : 'text-light-primary'
  const textSecondary = isDark ? 'text-dark-secondary' : 'text-light-secondary'
  const textMuted = isDark ? 'text-dark-muted' : 'text-light-muted'
  const navInactiveText = isDark ? 'text-dark-secondary' : 'text-light-secondary'
  const navInactiveHoverText = isDark ? 'hover:text-dark-primary' : 'hover:text-light-primary'
  const navInactiveHoverBg = isDark ? 'hover:bg-dark-hover' : 'hover:bg-light-hover'
  const navActiveBg = 'bg-cyan-glow'

  return (
    <div className={`min-h-[100dvh] ${appBg} transition-colors duration-300`}>
      {/* Desktop Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-[260px] ${sidebarBg} ${sidebarBorder} border-r z-50 hidden lg:flex flex-col`}
      >
        {/* Logo */}
        <div className={`h-16 flex items-center px-4 border-b ${sidebarBorder}`}>
          <Link to="/client-portal" className="flex items-center gap-3">
            <img
              src={isDark ? '/AzFIT_Logo_BlackBackground_Text.png' : '/AzFIT_Logo_WhiteBackground_Text.png'}
              alt="AzFIT"
              className="h-8 w-auto"
            />
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {portalNavItems.map((item) => {
            const active = isActive(item.path, item.exact)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 h-10 px-3 rounded-lg transition-all duration-200 ${
                  active
                    ? `${navActiveBg} border-l-[3px] border-cyan`
                    : `${navInactiveText} ${navInactiveHoverText} ${navInactiveHoverBg} border-l-[3px] border-transparent`
                }`}
              >
                <item.icon size={20} className={active ? 'text-cyan' : ''} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className={`p-3 border-t ${sidebarBorder}`}>
          <div className={`flex items-center gap-3 p-2 rounded-lg ${navInactiveHoverBg} transition-colors`}>
            <img
              src="/avatar-placeholder.png"
              alt="User"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className={`${textPrimary} text-sm font-medium truncate`}>
                {profile?.full_name || user?.email?.split('@')[0] || 'Client'}
              </p>
              <p className={`${textMuted} text-xs truncate`}>Client</p>
            </div>
            <button
              onClick={handleLogout}
              className={`${textMuted} hover:text-danger p-1 transition-colors flex-shrink-0`}
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[100] lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`fixed left-0 top-0 bottom-0 w-[260px] ${sidebarBg} ${sidebarBorder} border-r z-[100] lg:hidden flex flex-col`}
            >
              <div className={`h-16 flex items-center justify-between px-4 border-b ${sidebarBorder}`}>
                <Link to="/client-portal" className="flex items-center" onClick={() => setMobileOpen(false)}>
                  <img
                    src={isDark ? '/AzFIT_Logo_BlackBackground_Text.png' : '/AzFIT_Logo_WhiteBackground_Text.png'}
                    alt="AzFIT"
                    className="h-8 w-auto"
                  />
                </Link>
                <button onClick={() => setMobileOpen(false)} className={`${textSecondary} p-2`} aria-label="Close menu">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 py-4 px-3 space-y-1">
                {portalNavItems.map((item) => {
                  const active = isActive(item.path, item.exact)
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 h-12 px-3 rounded-lg transition-all duration-200 ${
                        active
                          ? `${navActiveBg} border-l-[3px] border-cyan`
                          : `${navInactiveText} ${navInactiveHoverText} ${navInactiveHoverBg} border-l-[3px] border-transparent`
                      }`}
                    >
                      <item.icon size={20} className={active ? 'text-cyan' : ''} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </nav>

              <div className={`p-4 border-t ${sidebarBorder}`}>
                <div className="flex items-center gap-3">
                  <img src="/avatar-placeholder.png" alt="User" className="w-9 h-9 rounded-full object-cover" />
                  <div className="flex-1">
                    <p className={`${textPrimary} text-sm font-medium`}>
                      {profile?.full_name || user?.email?.split('@')[0] || 'Client'}
                    </p>
                    <p className={`${textMuted} text-xs`}>Client</p>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <header
        className={`fixed top-0 right-0 h-16 ${topBarBg} backdrop-blur-xl border-b ${topBarBorder} z-40 flex items-center px-4 sm:px-6 lg:px-8 transition-all duration-300`}
        style={{ left: isDesktop ? 260 : 0 }}
      >
        <div className="flex items-center justify-between w-full max-w-[1440px] mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className={`lg:hidden ${textSecondary} ${navInactiveHoverText} p-2 -ml-2`}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <h1 className={`${textPrimary} font-semibold text-lg`}>
              {portalNavItems.find((i) => isActive(i.path, i.exact))?.label || 'Client Portal'}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              className={`relative w-10 h-10 rounded-lg flex items-center justify-center ${textSecondary} ${navInactiveHoverText} ${navInactiveHoverBg} transition-colors`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => navigate('/client-portal/settings')}
              className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-dark-border hover:ring-cyan transition-all"
            >
              <img src="/avatar-placeholder.png" alt="User" className="w-full h-full object-cover" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className="pt-16 transition-all duration-300 min-h-[100dvh]"
        style={{ marginLeft: isDesktop ? 260 : 0 }}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
