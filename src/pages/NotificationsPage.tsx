/**
 * NotificationsPage — Full notification center with filter tabs,
 * notification list with read/unread states, bulk actions, and empty state.
 *
 * Route: /notifications
 */
import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Calendar,
  User,
  Trophy,
  MessageSquare,
  CheckCheck,
  Trash2,
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { generateNotifications, generateClients, formatTimestamp } from '@/lib/demo-data';
import type { DemoNotification } from '@/lib/demo-data';

/* ------------------------------------------------------------------ */
/*  Category configuration                                             */
/* ------------------------------------------------------------------ */

const categoryConfig: Record<string, { label: string; icon: typeof Bell }> = {
  all: { label: 'All', icon: Bell },
  unread: { label: 'Unread', icon: Bell },
  alert: { label: 'Alerts', icon: AlertTriangle },
  message: { label: 'Messages', icon: MessageSquare },
  system: { label: 'System', icon: Info },
  session: { label: 'Sessions', icon: Calendar },
  client: { label: 'Clients', icon: User },
  milestone: { label: 'Milestones', icon: Trophy },
};

const typeColors: Record<string, string> = {
  success: '#22C55E',
  error: '#EF4444',
  warning: '#EAB308',
  info: '#3B82F6',
  session: '#00AEEF',
  client: '#A855F7',
  milestone: '#F59E0B',
  alert: '#EF4444',
  message: '#3B82F6',
  system: '#6B7280',
};

const typeIcons: Record<string, typeof Bell> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  session: Calendar,
  client: User,
  milestone: Trophy,
  alert: AlertTriangle,
  message: MessageSquare,
  system: Bell,
};

/* ------------------------------------------------------------------ */
/*  Toast trigger helpers                                              */
/* ------------------------------------------------------------------ */

export function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
  const config = {
    success: { icon: <CheckCircle size={18} className="text-success" />, borderColor: '#22C55E' },
    error: { icon: <XCircle size={18} className="text-danger" />, borderColor: '#EF4444' },
    warning: { icon: <AlertTriangle size={18} className="text-warning" />, borderColor: '#EAB308' },
    info: { icon: <Info size={18} className="text-info" />, borderColor: '#3B82F6' },
  };
  const c = config[type];
  toast(message, {
    icon: c.icon,
    style: { borderLeft: `3px solid ${c.borderColor}` },
  });
}

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const listItemVariant = {
  hidden: { opacity: 0, x: 12 },
  show: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.03, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  }),
  exit: { opacity: 0, x: 12, transition: { duration: 0.2 } },
};

/* ------------------------------------------------------------------ */
/*  Individual Notification Item                                       */
/* ------------------------------------------------------------------ */

function NotificationItem({
  notification,
  index,
  onMarkRead,
}: {
  notification: DemoNotification;
  index: number;
  onMarkRead: (id: string) => void;
}) {
  const Icon = typeIcons[notification.type] || Bell;
  const color = typeColors[notification.type] || '#6B7280';

  return (
    <motion.div
      key={notification.id}
      custom={index}
      variants={listItemVariant}
      initial="hidden"
      animate="show"
      exit="exit"
      layout
      className={`flex items-start gap-4 p-4 border-b border-gray-100 dark:border-white/[0.04] transition-colors hover:bg-gray-50 dark:hover:bg-[#1A1A1A] ${
        !notification.read ? 'bg-cyan-glow/30 dark:bg-cyan-glow/20' : ''
      }`}
    >
      {/* Icon / Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}18` }}
      >
        {notification.clientInitials ? (
          <span className="text-sm font-semibold" style={{ color }}>
            {notification.clientInitials}
          </span>
        ) : (
          <Icon size={18} style={{ color }} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={`text-body-sm truncate ${!notification.read ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-800 dark:text-gray-200'}`}>
              {notification.title}
            </p>
            <p className="text-caption text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
            <p className="text-caption text-gray-400 mt-1">{formatTimestamp(notification.timestamp)}</p>
          </div>

          {/* Unread indicator + mark read */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            {!notification.read && (
              <span className="w-2 h-2 rounded-full bg-cyan" />
            )}
            {!notification.read && (
              <button
                onClick={() => onMarkRead(notification.id)}
                className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 hover:text-cyan transition-colors"
                title="Mark as read"
              >
                <CheckCircle size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ================================================================== */
/*  MAIN PAGE COMPONENT                                                */
/* ================================================================== */

export default function NotificationsPage() {
  const { isDemoMode } = useAuthStore();
  const { markRead, markAllRead } = useNotificationStore();

  /* ---- Demo notifications ---- */
  const [demoNotifications, setDemoNotifications] = useState<DemoNotification[]>([]);

  useEffect(() => {
    if (isDemoMode) {
      const clients = generateClients();
      const notifs = generateNotifications(clients);
      setDemoNotifications(notifs);
    }
  }, [isDemoMode]);

  /* ---- Combined notifications ---- */
  const allNotifications: DemoNotification[] = demoNotifications;

  /* ---- Filter state ---- */
  const [activeFilter, setActiveFilter] = useState<string>('all');

  /* ---- Filtered list ---- */
  const filtered = useMemo(() => {
    if (activeFilter === 'all') return allNotifications;
    if (activeFilter === 'unread') return allNotifications.filter((n) => !n.read);
    return allNotifications.filter((n) => n.type === activeFilter);
  }, [allNotifications, activeFilter]);

  /* ---- Unread count ---- */
  const unreadCount = allNotifications.filter((n) => !n.read).length;

  /* ---- Mark read ---- */
  const handleMarkRead = useCallback((id: string) => {
    markRead(id);
    setDemoNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, [markRead]);

  /* ---- Mark all read ---- */
  const handleMarkAllRead = useCallback(() => {
    markAllRead();
    setDemoNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read', 'success');
  }, [markAllRead]);

  /* ---- Clear all ---- */
  const handleClearAll = useCallback(() => {
    setDemoNotifications([]);
    showToast('All notifications cleared', 'info');
  }, []);

  /* ---- Available filters ---- */
  const filters = ['all', 'unread', 'alert', 'message', 'system'];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[900px] mx-auto">
      {/* Sonner Toaster */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--white, #FFFFFF)',
            border: '1px solid var(--gray-200, #E5E7EB)',
            borderRadius: '0.75rem',
            padding: '1rem 1.25rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          },
        }}
      />

      {/* Page title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-display-md font-semibold text-gray-900 dark:text-white">Notifications</h1>
            <p className="text-body-sm text-gray-500 mt-1">
              {unreadCount > 0 ? (
                <span>
                  You have <span className="text-cyan font-semibold">{unreadCount} unread</span> notification{unreadCount > 1 ? 's' : ''}
                </span>
              ) : (
                'All caught up! No new notifications.'
              )}
            </p>
          </div>

          {/* Bulk actions */}
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 transition-colors"
              >
                <CheckCheck size={16} /> Mark all read
              </button>
            )}
            {allNotifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 dark:border-white/10 rounded-xl hover:bg-danger-light hover:text-danger dark:hover:bg-danger-light/20 text-gray-700 dark:text-gray-300 transition-colors"
              >
                <Trash2 size={16} /> Clear all
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Filter tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="flex flex-wrap gap-2 mb-4"
      >
        {filters.map((filter) => {
          const cfg = categoryConfig[filter];
          const count = filter === 'all'
            ? allNotifications.length
            : filter === 'unread'
              ? allNotifications.filter((n) => !n.read).length
              : allNotifications.filter((n) => n.type === filter).length;

          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeFilter === filter
                  ? 'bg-cyan text-white shadow-cyan'
                  : 'bg-gray-100 dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
              }`}
            >
              <cfg.icon size={14} />
              {cfg.label}
              <span className={`text-caption px-1.5 py-0.5 rounded-full font-semibold ${
                activeFilter === filter
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-gray-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* Notification list card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.35 }}
        className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-white/[0.06] shadow-card overflow-hidden"
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <Bell size={40} className="text-gray-300 mb-3" />
            <p className="text-heading-sm text-gray-700 dark:text-gray-300 mb-1">
              {activeFilter === 'all' ? 'No notifications yet' : 'No matching notifications'}
            </p>
            <p className="text-body-sm text-gray-500">
              {activeFilter === 'all'
                ? 'When you get notifications, they will appear here.'
                : 'Try a different filter to see more notifications.'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((notification, idx) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                index={idx}
                onMarkRead={handleMarkRead}
              />
            ))}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}
