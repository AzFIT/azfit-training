/* ═══════════════════════════════════════════
   NOTIFICATION SERVICE
   Browser push notifications + in-app toasts
   ═══════════════════════════════════════════ */

export type NotificationType = 'workout' | 'meal' | 'pr' | 'water' | 'system'

export interface NotificationPayload {
  type: NotificationType
  title: string
  body: string
  icon?: string
  data?: Record<string, unknown>
}

/* ── Browser Push Notification Permission ── */

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('[Notifications] Browser does not support push notifications')
    return false
  }

  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export function getNotificationPermission(): NotificationPermission | null {
  if (!('Notification' in window)) return null
  return Notification.permission
}

/* ── Show Browser Push Notification ── */

export function showPushNotification(payload: NotificationPayload): boolean {
  if (!('Notification' in window)) return false
  if (Notification.permission !== 'granted') return false

  try {
    new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/AzFIT_Logo_BlackBackground.png',
      badge: '/AzFIT_Logo_BlackBackground.png',
      tag: payload.type,
      requireInteraction: payload.type === 'workout',
      data: payload.data,
    })
    return true
  } catch (err) {
    console.error('[Notifications] Failed to show push notification:', err)
    return false
  }
}

/* ── In-App Toast (fallback when push not available) ── */

export interface ToastMessage {
  id: string
  type: NotificationType
  title: string
  body: string
  duration: number
}

const toastListeners = new Set<(toast: ToastMessage) => void>()

export function subscribeToToasts(callback: (toast: ToastMessage) => void): () => void {
  toastListeners.add(callback)
  return () => toastListeners.delete(callback)
}

export function showToast(payload: Omit<NotificationPayload, 'icon'> & { duration?: number }): void {
  const toast: ToastMessage = {
    id: `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type: payload.type,
    title: payload.title,
    body: payload.body,
    duration: payload.duration ?? 4000,
  }

  // Try push first, fallback to in-app toast
  const pushSent = showPushNotification({ ...payload, icon: '/AzFIT_Logo_BlackBackground.png' })

  if (!pushSent) {
    toastListeners.forEach((cb) => cb(toast))
  }
}

/* ── Scheduled Reminders ── */

export function scheduleWorkoutReminder(workoutTime: Date, title: string): void {
  const now = new Date()
  const reminderTime = new Date(workoutTime.getTime() - 60 * 60 * 1000) // 1 hour before

  if (reminderTime <= now) {
    // Workout is within 1 hour, show immediately
    showToast({
      type: 'workout',
      title: 'Workout Soon!',
      body: `${title} starts in less than an hour. Get ready!`,
      duration: 6000,
    })
    return
  }

  const delay = reminderTime.getTime() - now.getTime()
  setTimeout(() => {
    showToast({
      type: 'workout',
      title: 'Workout in 1 Hour',
      body: `${title} is scheduled soon. Prepare your gear!`,
      duration: 6000,
    })
  }, delay)
}

export function scheduleMealReminder(mealType: string, mealTime: Date): void {
  const now = new Date()
  const reminderTime = new Date(mealTime.getTime() + 3 * 60 * 60 * 1000) // 3 hours after

  if (reminderTime <= now) return // Already past

  const delay = reminderTime.getTime() - now.getTime()
  setTimeout(() => {
    showToast({
      type: 'meal',
      title: `Log Your ${mealType}`,
      body: `It's been 3 hours since ${mealType.toLowerCase()}. Don't forget to log it!`,
      duration: 5000,
    })
  }, delay)
}

export function showPRNotification(exerciseName: string, weight: number, reps: number): void {
  showToast({
    type: 'pr',
    title: '🎉 New Personal Record!',
    body: `${exerciseName}: ${weight}kg × ${reps} reps — Great work!`,
    duration: 8000,
  })
}

export function showWaterReminder(glassesConsumed: number, target: number): void {
  if (glassesConsumed >= target) return

  const remaining = target - glassesConsumed
  showToast({
    type: 'water',
    title: '💧 Hydration Check',
    body: `You've had ${glassesConsumed}/${target} glasses. ${remaining} more to go!`,
    duration: 4000,
  })
}

/* ── Check if notifications are supported ── */

export function areNotificationsSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator
}
