/**
 * AppSidebar - Dashboard sidebar (240px fixed)
 * Shows AzFIT logo, navigation items, active state with cyan glow, user avatar at bottom.
 */
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Dumbbell,
  BookOpen,
  Apple,
  Settings,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/trainer/dashboard' },
  { icon: Users, label: 'Clients', to: '/trainer/clients' },
  { icon: CalendarDays, label: 'Calendar', to: '/trainer/calendar' },
  { icon: Dumbbell, label: 'Programs', to: '/programs/library' },
  { icon: BookOpen, label: 'Exercises', to: '/exercises' },
  { icon: Apple, label: 'Nutrition', to: '/trainer/nutrition' },
  { icon: Settings, label: 'Settings', to: '/trainer/settings' },
];

export default function AppSidebar() {
  const location = useLocation();
  const { user, profile, role } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-white/5">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={collapsed ? './AzFIT_Logo_WhiteBackground.png' : './AzFIT_Logo_WhiteBackground_Text.png'}
            alt="AzFIT"
            className={collapsed ? 'h-8 w-auto' : 'h-8 w-auto'}
          />
        </Link>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="ml-auto p-1 rounded hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hidden lg:block"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                active
                  ? 'bg-[rgba(0,174,239,0.15)] text-cyan'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} className={active ? 'text-cyan' : ''} />
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-cyan flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {(profile?.full_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {profile?.full_name || user?.email?.split('@')[0] || 'User'}
              </p>
              <span className="text-caption text-cyan capitalize">
                {role ?? 'Coach'}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-3 left-4 z-50 p-2 rounded-lg bg-white/80 dark:bg-[#141414]/80 backdrop-blur border border-gray-200 dark:border-white/10"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed left-0 top-0 bottom-0 w-60 bg-white dark:bg-[#141414] border-r border-gray-200 dark:border-white/5 z-50 flex flex-col lg:hidden"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col h-screen sticky top-0 bg-white dark:bg-[#141414] border-r border-gray-200 dark:border-white/5 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="absolute -right-3 top-20 p-1 rounded-full bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 shadow-sm z-10"
          >
            <Menu size={12} />
          </button>
        )}
        {sidebarContent}
      </aside>
    </>
  );
}
