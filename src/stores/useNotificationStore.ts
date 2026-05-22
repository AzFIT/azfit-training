import { create } from 'zustand';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  timestamp: number;
}

export interface ToastItem {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  toastQueue: ToastItem[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismissToast: (id: string) => void;
  addToast: (message: string, type: NotificationType) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],
  unreadCount: 0,
  toastQueue: [],

  addNotification: (notification) => {
    const newNotif: Notification = {
      ...notification,
      id: generateId(),
      timestamp: Date.now(),
      read: false,
    };
    set((s) => ({
      notifications: [newNotif, ...s.notifications],
      unreadCount: s.unreadCount + 1,
    }));
  },

  markRead: (id: string) => {
    set((s) => {
      const notifs = s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      const unread = notifs.filter((n) => !n.read).length;
      return { notifications: notifs, unreadCount: unread };
    });
  },

  markAllRead: () => {
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  dismissToast: (id: string) => {
    set((s) => ({
      toastQueue: s.toastQueue.filter((t) => t.id !== id),
    }));
  },

  addToast: (message: string, type: NotificationType) => {
    const toast: ToastItem = { id: generateId(), message, type };
    set((s) => ({ toastQueue: [...s.toastQueue, toast] }));
    setTimeout(() => {
      set((s) => ({
        toastQueue: s.toastQueue.filter((t) => t.id !== toast.id),
      }));
    }, 4000);
  },
}));
