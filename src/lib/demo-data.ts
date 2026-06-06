/**
 * Demo Data Generator for AzFIT Client Portal
 * Provides synthetic clients, sessions, body stats, nutrition logs, and compliance data
 * for use in demo mode across all dashboard pages.
 */

import { format, subDays, startOfWeek } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

/** Program types available in the system */
export type ProgramType = 'Strength' | 'Weight Loss' | 'Endurance' | 'Hypertrophy' | 'Rehabilitation' | 'General Fitness';

/** Session status values */
export type SessionStatus = 'confirmed' | 'pending' | 'cancelled' | 'in-progress' | 'completed';

/** Alert priority levels */
export type AlertPriority = 'high' | 'medium' | 'low';

/** Notification category types */
export type NotificationCategory = 'alert' | 'message' | 'system' | 'session' | 'client' | 'milestone';

/** Represents a synthetic client with full profile data */
export interface DemoClient {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  initials: string;
  status: 'active' | 'inactive';
  program: ProgramType;
  programProgress: number;
  complianceScore: number;
  sessionsCompleted: number;
  lastActive: string; // ISO date
  joinDate: string;
  phone?: string;
  age: number;
  weight: number;
  height: number;
  bodyFat: number;
  goal: string;
}

/** Represents a training session */
export interface DemoSession {
  id: string;
  clientId: string;
  clientName: string;
  date: string; // ISO date
  startTime: string; // HH:mm
  endTime: string;
  type: string;
  status: SessionStatus;
  notes?: string;
}

/** Represents a follow-up alert */
export interface DemoAlert {
  id: string;
  clientId: string;
  clientName: string;
  clientInitials: string;
  priority: AlertPriority;
  type: string;
  message: string;
  action: string;
  createdAt: string;
}

/** Represents a notification item */
export interface DemoNotification {
  id: string;
  type: NotificationCategory;
  title: string;
  message: string;
  read: boolean;
  timestamp: number;
  clientId?: string;
  clientName?: string;
  clientInitials?: string;
}

/** KPI data for the dashboard */
export interface KPIData {
  activeClients: number;
  activeClientsTrend: number;
  sessionsThisWeek: number;
  sessionsTrend: number;
  revenueSGD: number;
  revenueTrend: number;
  complianceScore: number;
  complianceTrend: number;
}

const genId = () => `demo_${uuidv4().slice(0, 8)}_${Math.random().toString(36).slice(2, 6)}`;

const FIRST_NAMES = [
  'Sarah', 'Marcus', 'David', 'Jane', 'Michael', 'Emma', 'James', 'Lisa',
  'Robert', 'Anna', 'John', 'Maria', 'Wei', 'Priya', 'Tom',
];
const LAST_NAMES = [
  'Chen', 'Tan', 'Lim', 'Wong', 'Lee', 'Ng', 'Koh', 'Ong',
  'Goh', 'Chua', 'Sim', 'Teo', 'Ho', 'Yeo', 'Low',
];
const PROGRAMS: ProgramType[] = ['Strength', 'Weight Loss', 'Endurance', 'Hypertrophy', 'Rehabilitation', 'General Fitness'];
const SESSION_TYPES = [
  'Strength Training', 'Upper Body Focus', 'Lower Body Power', 'Cardio & Core',
  'HIIT Circuit', 'Mobility & Stretch', 'BioPrint Assessment', 'Program Review',
  'Nutrition Check-in', 'Personal Training',
];
const GOALS = [
  'Build muscle and increase strength',
  'Lose 5kg body fat in 3 months',
  'Improve cardiovascular endurance',
  'Rehabilitate shoulder injury',
  'General health and fitness',
  'Prepare for marathon',
  'Increase flexibility and mobility',
  'Body recomposition',
];

/**
 * Generate a random date within the last N days
 */
function randomDateWithin(days: number): string {
  const d = subDays(new Date(), Math.floor(Math.random() * days));
  return d.toISOString().split('T')[0];
}

/**
 * Generate 12 synthetic clients with realistic data
 */
export function generateClients(): DemoClient[] {
  const clients: DemoClient[] = [];
  for (let i = 0; i < 12; i++) {
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[i % LAST_NAMES.length];
    const program = PROGRAMS[i % PROGRAMS.length];
    const isActive = i < 10; // 10 active, 2 inactive
    const progress = Math.floor(Math.random() * 60) + 30; // 30-90%
    clients.push({
      id: genId(),
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      initials: `${firstName[0]}${lastName[0]}`,
      status: isActive ? 'active' : 'inactive',
      program,
      programProgress: progress,
      complianceScore: Math.floor(Math.random() * 40) + 55, // 55-95%
      sessionsCompleted: Math.floor(Math.random() * 30) + 5,
      lastActive: randomDateWithin(7),
      joinDate: randomDateWithin(90),
      age: 22 + Math.floor(Math.random() * 25),
      weight: 50 + Math.floor(Math.random() * 45),
      height: 155 + Math.floor(Math.random() * 30),
      bodyFat: 10 + Math.floor(Math.random() * 25),
      goal: GOALS[i % GOALS.length],
    });
  }
  return clients;
}

/**
 * Generate 30 days of session history plus today's sessions
 */
export function generateSessions(clients: DemoClient[]): DemoSession[] {
  const sessions: DemoSession[] = [];
  const today = format(new Date(), 'yyyy-MM-dd');

  // Generate sessions for last 30 days
  for (let day = 0; day < 30; day++) {
    const date = format(subDays(new Date(), day), 'yyyy-MM-dd');
    const numSessions = Math.floor(Math.random() * 3) + 1; // 1-3 sessions per day

    for (let s = 0; s < numSessions; s++) {
      const client = clients[Math.floor(Math.random() * clients.length)];
      const hour = 8 + Math.floor(Math.random() * 11); // 8am-7pm
      let status: SessionStatus;
      if (day === 0) {
        // Today: mix of confirmed, in-progress, cancelled
        const r = Math.random();
        status = r < 0.5 ? 'confirmed' : r < 0.8 ? 'in-progress' : 'cancelled';
      } else if (day < 7) {
        // Recent: mostly completed
        status = Math.random() < 0.9 ? 'completed' : 'cancelled';
      } else {
        // Older: all completed
        status = 'completed';
      }

      sessions.push({
        id: genId(),
        clientId: client.id,
        clientName: client.name,
        date,
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        type: SESSION_TYPES[Math.floor(Math.random() * SESSION_TYPES.length)],
        status,
      });
    }
  }

  // Ensure today has at least 4 sessions for the timeline demo
  const todaySessions = sessions.filter((s) => s.date === today);
  if (todaySessions.length < 4) {
    const needed = 4 - todaySessions.length;
    for (let i = 0; i < needed; i++) {
      const client = clients[i % clients.length];
      const hour = 9 + i * 2;
      sessions.push({
        id: genId(),
        clientId: client.id,
        clientName: client.name,
        date: today,
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        type: SESSION_TYPES[i % SESSION_TYPES.length],
        status: i === 1 ? 'in-progress' : 'confirmed',
      });
    }
  }

  return sessions.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
}

/**
 * Generate follow-up alerts for the dashboard
 */
export function generateAlerts(clients: DemoClient[]): DemoAlert[] {
  const alerts: DemoAlert[] = [];
  const highPriorityClients = clients.filter((_, i) => i < 4);
  const medPriorityClients = clients.filter((_, i) => i >= 4 && i < 8);
  const lowPriorityClients = clients.filter((_, i) => i >= 8);

  // High priority: body stats overdue, unlogged nutrition
  highPriorityClients.forEach((client, i) => {
    const messages = [
      'Body stats overdue (7 days)',
      'Nutrition log missing (5 days)',
      'Session no-show yesterday',
      'PAR-Q assessment expired',
    ];
    const actions = ['Log now', 'Send reminder', 'Follow up', 'Renew PAR-Q'];
    alerts.push({
      id: genId(),
      clientId: client.id,
      clientName: client.name,
      clientInitials: client.initials,
      priority: 'high',
      type: i < 2 ? 'body-stats' : 'session',
      message: messages[i % messages.length],
      action: actions[i % actions.length],
      createdAt: randomDateWithin(3),
    });
  });

  // Medium priority: assessments due, inactive clients
  medPriorityClients.forEach((client, i) => {
    const messages = [
      'Bi-weekly assessment due',
      'Inactive for 14 days',
      'Program adherence dropped below 70%',
      'Goal milestone check-in needed',
    ];
    const actions = ['Schedule', 'Send message', 'Review program', 'Check in'];
    alerts.push({
      id: genId(),
      clientId: client.id,
      clientName: client.name,
      clientInitials: client.initials,
      priority: 'medium',
      type: i < 2 ? 'assessment' : 'adherence',
      message: messages[i % messages.length],
      action: actions[i % actions.length],
      createdAt: randomDateWithin(5),
    });
  });

  // Low priority: general notes, check-ins
  lowPriorityClients.forEach((client, i) => {
    const messages = [
      'Weekly check-in reminder',
      'General notes: Adjust macros',
      'Celebration: 10 sessions completed!',
      'Form check needed on deadlift',
    ];
    const actions = ['Check in', 'View notes', 'Celebrate', 'Schedule form'];
    alerts.push({
      id: genId(),
      clientId: client.id,
      clientName: client.name,
      clientInitials: client.initials,
      priority: 'low',
      type: i < 2 ? 'checkin' : 'note',
      message: messages[i % messages.length],
      action: actions[i % actions.length],
      createdAt: randomDateWithin(7),
    });
  });

  return alerts;
}

/**
 * Generate notifications for the notification center
 */
export function generateNotifications(clients: DemoClient[]): DemoNotification[] {
  const notifications: DemoNotification[] = [];
  const now = Date.now();

  const templates: Array<{ type: NotificationCategory; title: string; message: string }> = [
    { type: 'session', title: 'New session scheduled', message: 'Session with {name} on Monday at 10:00 AM' },
    { type: 'client', title: 'Client milestone reached', message: '{name} completed 20 sessions!' },
    { type: 'alert', title: 'Body stats overdue', message: '{name} has not logged body stats in 7 days' },
    { type: 'system', title: 'AzFIT updated', message: 'New features available in v2.1' },
    { type: 'message', title: 'New message', message: '{name}: "Can we reschedule Thursday?"' },
    { type: 'milestone', title: 'Goal achieved!', message: '{name} hit their weight loss target!' },
    { type: 'session', title: 'Session cancelled', message: '{name} cancelled tomorrow\'s session' },
    { type: 'client', title: 'New client onboarded', message: '{name} completed PAR-Q assessment' },
    { type: 'alert', title: 'Compliance warning', message: '{name}\'s weekly compliance dropped to 45%' },
    { type: 'system', title: 'Weekly report ready', message: 'Your weekly summary is now available' },
    { type: 'message', title: 'Nutrition log updated', message: '{name} submitted 3 days of nutrition logs' },
    { type: 'milestone', title: 'Strength PR!', message: '{name} hit a new deadlift PR of 140kg' },
    { type: 'session', title: 'Assessment completed', message: 'BioPrint assessment done with {name}' },
    { type: 'client', title: 'Program updated', message: '{name} moved to Phase 2 of Strength program' },
    { type: 'alert', title: 'Payment due', message: 'Invoice for {name} is due in 3 days' },
  ];

  templates.forEach((tmpl, i) => {
    const client = clients[i % clients.length];
    const hoursAgo = i * 3 + Math.floor(Math.random() * 3);
    notifications.push({
      id: genId(),
      type: tmpl.type,
      title: tmpl.title,
      message: tmpl.message.replace('{name}', client.name),
      read: i > 6, // first 7 are unread
      timestamp: now - hoursAgo * 3600_000,
      clientId: client.id,
      clientName: client.name,
      clientInitials: client.initials,
    });
  });

  return notifications;
}

/**
 * Calculate KPI data from generated clients and sessions
 */
export function calculateKPIs(clients: DemoClient[], sessions: DemoSession[]): KPIData {
  const activeClients = clients.filter((c) => c.status === 'active').length;
  const thisWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const sessionsThisWeek = sessions.filter((s) => s.date >= thisWeekStart && s.status !== 'cancelled').length;
  const avgCompliance = Math.round(clients.reduce((sum, c) => sum + c.complianceScore, 0) / clients.length);

  // Generate sparkline data (7 data points)
  return {
    activeClients,
    activeClientsTrend: +3,
    sessionsThisWeek,
    sessionsTrend: +5,
    revenueSGD: sessionsThisWeek * 150, // SGD$150 per session
    revenueTrend: +12,
    complianceScore: avgCompliance,
    complianceTrend: -2,
  };
}

/**
 * Generate 7 data points for sparkline charts
 */
export function generateSparklineData(baseValue: number, variance: number = 10): number[] {
  return Array.from({ length: 7 }, () =>
    Math.max(0, baseValue + Math.floor(Math.random() * variance * 2) - variance)
  );
}

/**
 * Get sessions for a specific date
 */
export function getSessionsForDate(sessions: DemoSession[], date: string): DemoSession[] {
  return sessions.filter((s) => s.date === date);
}

/**
 * Get today's date as ISO string
 */
export function getTodayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Format relative time (e.g. "2 hours ago", "3 days ago")
 */
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / 3600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return format(date, 'MMM d');
}

/**
 * Format timestamp to relative time
 */
export function formatTimestamp(ts: number): string {
  const diffMs = Date.now() - ts;
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return format(new Date(ts), 'MMM d');
}
