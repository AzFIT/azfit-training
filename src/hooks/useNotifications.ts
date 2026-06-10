import { useState, useEffect, useCallback } from 'react'
import {
  requestNotificationPermission,
  getNotificationPermission,
  subscribeToToasts,
  showToast,
  type NotificationPayload,
  type ToastMessage,
} from '../services/notificationService'

export interface NotificationState {
  permission: NotificationPermission | null
  toasts: ToastMessage[]
  isSupported: boolean
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission | null>(getNotificationPermission())
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [isSupported] = useState(() => 'Notification' in window)

  useEffect(() => {
    const unsubscribe = subscribeToToasts((toast) => {
      setToasts((prev) => [...prev, toast])
      // Auto-remove after duration
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id))
      }, toast.duration)
    })
    return unsubscribe
  }, [])

  const requestPermission = useCallback(async () => {
    const granted = await requestNotificationPermission()
    setPermission(getNotificationPermission())
    return granted
  }, [])

  const notify = useCallback((payload: NotificationPayload & { duration?: number }) => {
    showToast(payload)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return {
    permission,
    toasts,
    isSupported,
    requestPermission,
    notify,
    dismissToast,
  }
}
