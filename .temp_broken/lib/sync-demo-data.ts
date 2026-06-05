/**
 * AzFIT Demo Data Sync
 * Populates all stores with realistic demo data on first login.
 * Call syncAllDemoData() after successful login.
 */

import { useClientStore } from '@/stores/useClientStore';
import { useCalendarStore } from '@/stores/useCalendarStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useProgramStore } from '@/stores/useProgramStore';
import { generateClients, generateSessions, generateNotifications } from './demo-data';
import type { DemoClient, DemoSession } from './demo-data';
import type { CalendarEvent } from '@/stores/useCalendarStore';
import type { AppNotification } from '@/stores/useNotificationStore';

let hasSynced = false;

/**
 * Convert DemoSession to CalendarEvent format
 */
function sessionToCalendarEvent(s: DemoSession): CalendarEvent {
  const typeMap: Record<string, CalendarEvent['type']> = {
    'pt': 'session',
    'group': 'session',
    'online': 'session',
    'assessment': 'assessment',
    'strength': 'session',
    'cardio': 'session',
    'recovery': 'follow-up',
    'nutrition-check': 'follow-up',
    'program-review': 'follow-up',
    'bio-print': 'assessment',
    'initial-consult': 'assessment',
  };

  const statusMap: Record<string, CalendarEvent['status']> = {
    'scheduled': 'upcoming',
    'completed': 'completed',
    'cancelled': 'cancelled',
    'no-show': 'no-show',
    'confirmed': 'confirmed',
    'in-progress': 'in-progress',
    'pending': 'pending',
  };

  const now = new Date().toISOString();

  return {
    id: s.id,
    title: s.type === 'pt' ? 'Personal Training' : s.type === 'assessment' ? 'Assessment' : `${s.clientName} - ${s.type}`,
    date: s.date,
    startTime: s.startTime,
    endTime: s.endTime,
    duration: s.duration,
    type: typeMap[s.type] || 'session',
    status: statusMap[s.status] || 'upcoming',
    clientId: s.clientId,
    clientName: s.clientName,
    color: getClientColor(s.clientId),
    notes: s.notes,
    isRecurring: false,
    seriesId: null,
    createdAt: now,
    updatedAt: now,
  };
}

function getClientColor(clientId: string): string {
  const colors = ['#00AEEF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];
  const idx = parseInt(clientId.replace(/\D/g, '')) || 0;
  return colors[idx % colors.length];
}

/**
 * Convert DemoNotification to AppNotification format
 */
function demoNotifToAppNotif(n: any, idx: number): AppNotification {
  return {
    id: `notif-${idx}`,
    title: n.title,
    message: n.message,
    type: n.type,
    read: n.read,
    createdAt: n.createdAt,
    link: n.link,
  };
}

/**
 * Sync all demo data into stores. Safe to call multiple times (idempotent).
 */
export function syncAllDemoData(): void {
  if (hasSynced) return;
  hasSynced = true;

  // 1. Sync clients
  const clients = generateClients(12);
  const clientStore = useClientStore.getState();

  // Check if already populated
  if (!clientStore.clients || clientStore.clients.length === 0) {
    useClientStore.setState({ clients });
  }

  // 2. Sync calendar events
  const sessions = generateSessions(30);
  const calendarStore = useCalendarStore.getState();

  if (!calendarStore.events || calendarStore.events.length === 0) {
    const events = sessions.map(sessionToCalendarEvent);
    useCalendarStore.setState({ events });
  }

  // 3. Sync notifications
  const notifs = generateNotifications(10);
  const notifStore = useNotificationStore.getState();

  if (!notifStore.notifications || notifStore.notifications.length === 0) {
    const notifications = notifs.map(demoNotifToAppNotif);
    useNotificationStore.setState({ notifications });
  }

  // 4. Ensure program library is loaded
  const programStore = useProgramStore.getState();
  if (!programStore.exercises || programStore.exercises.length === 0) {
    // Exercises will be loaded lazily by the ProgramStore itself
  }
}

/**
 * Reset the sync flag (useful for testing)
 */
export function resetSyncFlag(): void {
  hasSynced = false;
}
