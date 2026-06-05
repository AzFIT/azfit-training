import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  CalendarDays,
  Dumbbell,
  Apple,
  Users,
  Camera,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
  Sparkles,
  BookOpen,
} from 'lucide-react'
import AiChat from './AiChat'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Calendar', path: '/calendar', icon: CalendarDays },
  { label: 'Programs', path: '/programs', icon: Dumbbell },
  { label: 'Program Builder', path: '/program-builder', icon: Sparkles },
  { label: 'Exercise Library', path: '/exercise-library', icon: BookOpen },
  { label: 'Nutrition', path: '/nutrition', icon: Apple },
  { label: 'Clients', path: '/clients', icon: Users },
  { label: 'Photos', path: '/photos', icon: Camera },
  { label: 'Settings', path: '/settings', icon: Settings },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

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
    window.dispatchEvent(new CustomEvent('azfit-theme-change', { detail: theme }))
  }, [theme])

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const sidebarWidthPx = isDesktop ? (collapsed ? 72 : 260) : 0
  const isActive = (path: string) => {
    if (path === '/clients') return location.pathname.startsWith('/clients')
    if (path === '/program-builder') return location.pathname.startsWith('/program-builder')
    return location.pathname === path
  }

  const isDark = theme === 'dark'

  /* ── Theme-aware color tokens ───────────────────────── */
  const appBg = isDark ? 'bg-[#0A0A0A]' : 'bg-[#F8FAFC]'
  const sidebarBg = isDark ? 'bg-[#141414]' : 'bg-white'
  const sidebarBorder = isDark ? 'border-[#2A2A2A]' : 'border-[#E2E8F0]'
  const topBarBg = isDark ? 'bg-[#0A0A0A]/80' : 'bg-white/80'
  const topBarBorder = isDark ? 'border-[#1F1F1F]' : 'border-[#E2E8F0]'
  const textPrimary = isDark ? 'text-[#F0F0F0]' : 'text-[#0F172A]'
  const textSecondary = isDark ? 'text-[#A0A0A0]' : 'text-[#64748B]'
  const textMuted = isDark ? 'text-[#6B6B6B]' : 'text-[#94A3B8]'
  const navInactiveText = isDark ? 'text-[#A0A0A0]' : 'text-[#64748B]'
  const navInactiveHoverText = isDark ? 'hover:text-[#F0F0F0]' : 'hover:text-[#0F172A]'
  const navInactiveHoverBg = isDark ? 'hover:bg-[#242424]' : 'hover:bg-[#F1F5F9]'
  const navActiveBg = isDark ? 'bg-[rgba(0,174,239,0.15)]' : 'bg-[rgba(0,174,239,0.08)]'
  const inputBg = isDark ? 'bg-[#141414]' : 'bg-[#F1F5F9]'
  const inputBorder = isDark ? 'border-[#2A2A2A]' : 'border-[#E2E8F0]'
  const inputText = isDark ? 'text-[#F0F0F0]' : 'text-[#0F172A]'
  const inputPlaceholder = isDark ? 'placeholder:text-[#6B6B6B]' : 'placeholder:text-[#94A3B8]'
  const tooltipBg = isDark ? 'bg-[#1A1A1A]' : 'bg-white'
  const tooltipBorder = isDark ? 'border-[#2A2A2A]' : 'border-[#E2E8F0]'
  const tooltipText = isDark ? 'text-[#F0F0F0]' : 'text-[#0F172A]'
  const hoverRing = isDark ? 'hover:ring-[#00AEEF]' : 'hover:ring-[#00AEEF]'
  const ringColor = isDark ? 'ring-[#2A2A2A]' : 'ring-[#E2E8F0]'

  return (
    <div className={`min-h-[100dvh] ${appBg} transition-colors duration-300`}>
      {/* Desktop Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 ${sidebarBg} ${sidebarBorder} border-r z-50 transition-all duration-300 hidden lg:flex flex-col`}
        style={{ width: sidebarWidthPx || 260 }}
      >
        {/* Logo */}
        <div className={`h-16 flex items-center px-4 border-b ${sidebarBorder} overflow-hidden`}>
          <Link to="/dashboard" className="flex items-center gap-3 flex-shrink-0">
            <img
              src={isDark ? '/AzFIT_Logo_BlackBackground_Text.png' : '/AzFIT_Logo_WhiteBackground_Text.png'}
              alt="AzFIT"
              className="h-8 w-auto transition-opacity duration-300"
              style={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
            />
            {collapsed && (
              <img
                src={isDark ? '/AzFIT_Logo_BlackBackground.png' : '/AzFIT_Logo_WhiteBackground.png'}
                alt="AzFIT"
                className="h-8 w-8 object-contain"
              />
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`ml-auto ${textMuted} ${navInactiveHoverText} p-1 rounded-lg ${navInactiveHoverBg} transition-colors flex-shrink-0`}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 h-10 px-3 rounded-lg transition-all duration-200 group relative ${
                  active
                    ? `${navActiveBg}`
                    : `${navInactiveText} ${navInactiveHoverText} ${navInactiveHoverBg}`
                }`}
                style={active ? { color: isDark ? '#F0F0F0' : '#0F172A', borderLeft: '3px solid #00AEEF' } : { borderLeft: '3px solid transparent' }}
              >
                <item.icon size={20} className="flex-shrink-0" style={active ? { color: '#00AEEF' } : undefined} />
                <span
                  className="text-sm font-medium truncate transition-opacity duration-300"
                  style={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
                >
                  {item.label}
                </span>
                {/* Tooltip for collapsed */}
                {collapsed && (
                  <div className={`absolute left-full ml-2 px-2.5 py-1.5 ${tooltipBg} border ${tooltipBorder} rounded-lg text-xs ${tooltipText} whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg`}>
                    {item.label}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className={`p-3 border-t ${sidebarBorder}`}>
          <div className={`flex items-center gap-3 p-2 rounded-lg ${navInactiveHoverBg} transition-colors cursor-pointer`}>
            <img
              src="/avatar-placeholder.png"
              alt="User"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <div
              className="flex-1 min-w-0 overflow-hidden transition-opacity duration-300"
              style={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
            >
              <p className={`${textPrimary} text-sm font-medium truncate`}>Trainer</p>
              <p className={`${textMuted} text-xs truncate`}>Pro Plan</p>
            </div>
            {!collapsed && (
              <button className={`${textMuted} hover:text-[#EF4444] p-1 transition-colors flex-shrink-0`} aria-label="Logout">
                <LogOut size={16} />
              </button>
            )}
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
              {/* Mobile Logo */}
              <div className={`h-16 flex items-center justify-between px-4 border-b ${sidebarBorder}`}>
                <Link to="/dashboard" className="flex items-center" onClick={() => setMobileOpen(false)}>
                  <img src={isDark ? '/AzFIT_Logo_BlackBackground_Text.png' : '/AzFIT_Logo_WhiteBackground_Text.png'} alt="AzFIT" className="h-8 w-auto" />
                </Link>
                <button onClick={() => setMobileOpen(false)} className={`${textSecondary} p-2`} aria-label="Close menu">
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Nav Items */}
              <nav className="flex-1 py-4 px-3 space-y-1">
                {navItems.map((item) => {
                  const active = isActive(item.path)
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 h-12 px-3 rounded-lg transition-all duration-200 ${
                        active
                          ? `${navActiveBg} border-l-[3px] border-[#00AEEF]`
                          : `${navInactiveText} ${navInactiveHoverText} ${navInactiveHoverBg} border-l-[3px] border-transparent`
                      }`}
                      style={active ? { color: isDark ? '#F0F0F0' : '#0F172A' } : undefined}
                    >
                      <item.icon size={20} style={active ? { color: '#00AEEF' } : undefined} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* Mobile User */}
              <div className={`p-4 border-t ${sidebarBorder}`}>
                <div className="flex items-center gap-3">
                  <img src="/avatar-placeholder.png" alt="User" className="w-9 h-9 rounded-full object-cover" />
                  <div className="flex-1">
                    <p className={`${textPrimary} text-sm font-medium`}>Trainer</p>
                    <p className={`${textMuted} text-xs`}>Pro Plan</p>
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
        style={{ left: sidebarWidthPx }}
      >
        <div className="flex items-center justify-between w-full max-w-[1440px] mx-auto">
          {/* Left: Menu button + Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className={`lg:hidden ${textSecondary} ${navInactiveHoverText} p-2 -ml-2`}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <h1 className={`${textPrimary} font-semibold text-lg hidden sm:block`}>
              {navItems.find((i) => isActive(i.path))?.label || 'Dashboard'}
            </h1>
          </div>

          {/* Right: Search, Notifications, Avatar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search */}
            <div
              className={`hidden sm:flex items-center ${inputBg} rounded-full border ${inputBorder} transition-all duration-300 ${
                searchFocused ? 'w-64 border-[#00AEEF]' : 'w-48'
              }`}
            >
              <Search size={16} className={`${textMuted} ml-3 flex-shrink-0`} />
              <input
                type="text"
                placeholder="Search..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={`bg-transparent border-none outline-none text-sm ${inputText} ${inputPlaceholder} px-2 py-2 w-full`}
              />
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              className={`relative w-10 h-10 rounded-lg flex items-center justify-center ${textSecondary} ${navInactiveHoverText} ${navInactiveHoverBg} transition-colors`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notification */}
            <button
              className={`relative w-10 h-10 rounded-lg flex items-center justify-center ${textSecondary} ${navInactiveHoverText} ${navInactiveHoverBg} transition-colors`}
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EF4444]" />
            </button>

            {/* Avatar */}
            <button
              onClick={() => navigate('/settings')}
              className={`w-9 h-9 rounded-full overflow-hidden ring-2 ${ringColor} ${hoverRing} transition-all`}
            >
              <img src="/avatar-placeholder.png" alt="User" className="w-full h-full object-cover" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className="pt-16 transition-all duration-300 min-h-[100dvh]"
        style={{ marginLeft: sidebarWidthPx }}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto">
          {children}
        </div>
      </main>

      {/* AI Chat */}
      <AiChat />
    </div>
  )
}
