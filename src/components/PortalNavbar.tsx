/**
 * PortalNavbar - Dashboard top navigation bar
 * Shows sidebar toggle, page title/breadcrumb, search, notifications, avatar dropdown.
 */
import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Search,
  Bell,
  ChevronRight,
  LogOut,
  User,
  Settings,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import DarkModeToggle from './DarkModeToggle';

const routeTitles: Record<string, string> = {
  '/trainer/dashboard': 'Dashboard',
  '/trainer/clients': 'Clients',
  '/trainer/calendar': 'Calendar',
  '/trainer/programs': 'Programs',
  '/trainer/nutrition': 'Nutrition',
  '/trainer/settings': 'Settings',
  '/trainer/assessments': 'Assessments',
  '/notifications': 'Notifications',
};

export default function PortalNavbar() {
  const location = useLocation();
  const { user, profile, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const [avatarOpen, setAvatarOpen] = useState(false);

  const title = routeTitles[location.pathname] || 'Dashboard';
  const pathSegments = location.pathname.split('/').filter(Boolean);

  return (
    <header className="h-14 flex items-center px-4 sm:px-6 bg-white dark:bg-[az-black-card] border-b border-gray-200 dark:border-white/5 sticky top-0 z-40">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Breadcrumb / Title */}
        <div className="flex items-center gap-2 min-w-0">
          {pathSegments.length > 1 && (
            <>
              <Link
                to={`/${pathSegments[0]}`}
                className="text-sm text-gray-500 hover:text-cyan capitalize"
              >
                {pathSegments[0]}
              </Link>
              <ChevronRight size={14} className="text-gray-400 shrink-0" />
            </>
          )}
          <h1 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
            {title}
          </h1>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Search */}
        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 transition-colors">
          <Search size={18} />
        </button>

        {/* Dark mode */}
        <DarkModeToggle />

        {/* Notifications */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 transition-colors"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-4 min-w-[16px] px-1 text-[10px] font-bold bg-danger text-white rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setAvatarOpen(!avatarOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-cyan flex items-center justify-center text-white text-xs font-semibold">
              {(profile?.full_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
            </div>
          </button>

          <AnimatePresence>
            {avatarOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setAvatarOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[az-black-elevated] rounded-xl border border-gray-200 dark:border-white/8 shadow-modal z-50 py-1"
                >
                  <div className="px-3 py-2 border-b border-gray-100 dark:border-white/5">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{profile?.full_name || user?.email?.split('@')[0] || 'User'}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Link
                    to="/trainer/settings"
                    onClick={() => setAvatarOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    <User size={16} /> Profile
                  </Link>
                  <Link
                    to="/trainer/settings"
                    onClick={() => setAvatarOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    <Settings size={16} /> Settings
                  </Link>
                  <button
                    onClick={() => {
                      setAvatarOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger-light rounded-b-xl"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
