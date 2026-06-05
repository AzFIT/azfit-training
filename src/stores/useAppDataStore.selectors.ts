/**
 * Selector Hooks for useAppDataStore
 *
 * Derived data should NOT live in the store — it lives here as memoized hooks.
 * This keeps the store lean (only raw entities + IDs) while giving components
 * convenient access to filtered, sorted, and joined data.
 */

import { useMemo } from 'react'
import { useAppDataStore } from './useAppDataStore'
import type { Client, Program, CalendarSession, ClientAlert, AppNotification } from '../types/entities'

// ── Client Selectors ───────────────────────────────────────────────

export function useSelectedClient(): Client | undefined {
  const id = useAppDataStore((s) => s.selectedClientId)
  return useAppDataStore((s) => (id ? s.clients[id] : undefined))
}

export function useClientList(): Client[] {
  const clientIds = useAppDataStore((s) => s.clientIds)
  const clients = useAppDataStore((s) => s.clients)
  return useMemo(
    () => clientIds.map((id) => clients[id]).filter(Boolean),
    [clientIds, clients]
  )
}

export function useSortedClients(): Client[] {
  const list = useClientList()
  return useMemo(() => [...list].sort((a, b) => a.name.localeCompare(b.name)), [list])
}

export function useActiveClients(): Client[] {
  const list = useClientList()
  return useMemo(() => list.filter((c) => c.status === 'active'), [list])
}

export function useInactiveClients(): Client[] {
  const list = useClientList()
  return useMemo(() => list.filter((c) => c.status === 'inactive'), [list])
}

export function useFilteredClients(query: string): Client[] {
  const list = useClientList()
  return useMemo(() => {
    if (!query.trim()) return list
    const q = query.toLowerCase()
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.goal.toLowerCase().includes(q)
    )
  }, [list, query])
}

export function useClientById(id: string | null): Client | undefined {
  const clients = useAppDataStore((s) => s.clients)
  return useMemo(() => (id ? clients[id] : undefined), [clients, id])
}

export function useClientStats() {
  const list = useClientList()
  return useMemo(() => {
    const total = list.length
    const active = list.filter((c) => c.status === 'active').length
    const inactive = list.filter((c) => c.status === 'inactive').length
    const avgCompliance =
      total > 0
        ? Math.round(list.reduce((sum, c) => sum + c.complianceScore, 0) / total)
        : 0
    return { total, active, inactive, avgCompliance }
  }, [list])
}

// ── Program Selectors ──────────────────────────────────────────────

export function useProgramList(): Program[] {
  const programIds = useAppDataStore((s) => s.programIds)
  const programs = useAppDataStore((s) => s.programs)
  return useMemo(
    () => programIds.map((id) => programs[id]).filter(Boolean),
    [programIds, programs]
  )
}

export function useProgramById(id: string | null): Program | undefined {
  const programs = useAppDataStore((s) => s.programs)
  return useMemo(() => (id ? programs[id] : undefined), [programs, id])
}

export function useProgramsForClient(clientId: string | null): Program[] {
  const assignments = useAppDataStore((s) => s.assignments)
  const programs = useAppDataStore((s) => s.programs)
  return useMemo(() => {
    if (!clientId) return []
    return Object.values(assignments)
      .filter((a) => a.clientId === clientId)
      .map((a) => programs[a.programId])
      .filter(Boolean)
  }, [assignments, programs, clientId])
}

export function useClientsForProgram(programId: string | null): Client[] {
  const assignments = useAppDataStore((s) => s.assignments)
  const clients = useAppDataStore((s) => s.clients)
  return useMemo(() => {
    if (!programId) return []
    return Object.values(assignments)
      .filter((a) => a.programId === programId)
      .map((a) => clients[a.clientId])
      .filter(Boolean)
  }, [assignments, clients, programId])
}

// ── Session Selectors ──────────────────────────────────────────────

export function useSessionList(): CalendarSession[] {
  const sessionIds = useAppDataStore((s) => s.sessionIds)
  const sessions = useAppDataStore((s) => s.sessions)
  return useMemo(
    () => sessionIds.map((id) => sessions[id]).filter(Boolean),
    [sessionIds, sessions]
  )
}

export function useSessionsForDate(date: string): CalendarSession[] {
  const list = useSessionList()
  return useMemo(() => list.filter((s) => s.date === date), [list, date])
}

export function useSessionsForClient(clientId: string | null): CalendarSession[] {
  const list = useSessionList()
  return useMemo(
    () => (clientId ? list.filter((s) => s.clientId === clientId) : []),
    [list, clientId]
  )
}

export function useTodaySessions(): CalendarSession[] {
  const today = new Date().toISOString().split('T')[0]
  return useSessionsForDate(today)
}

export function useUpcomingSessions(limit = 5): CalendarSession[] {
  const list = useSessionList()
  const today = new Date().toISOString().split('T')[0]
  return useMemo(
    () =>
      list
        .filter((s) => s.date >= today && s.status !== 'cancelled')
        .slice(0, limit),
    [list, today, limit]
  )
}

// ── Alert Selectors ────────────────────────────────────────────────

export function useAlertList(): ClientAlert[] {
  const alerts = useAppDataStore((s) => s.alerts)
  return useMemo(() => Object.values(alerts), [alerts])
}

export function useUnresolvedAlerts(): ClientAlert[] {
  const list = useAlertList()
  return useMemo(() => list.filter((a) => !a.resolved), [list])
}

export function useHighPriorityAlerts(): ClientAlert[] {
  const list = useUnresolvedAlerts()
  return useMemo(() => list.filter((a) => a.priority === 'high'), [list])
}

// ── Notification Selectors ─────────────────────────────────────────

export function useNotificationList(): AppNotification[] {
  const notifications = useAppDataStore((s) => s.notifications)
  return useMemo(
    () =>
      Object.values(notifications).sort((a, b) => b.timestamp - a.timestamp),
    [notifications]
  )
}

export function useUnreadNotifications(): AppNotification[] {
  const list = useNotificationList()
  return useMemo(() => list.filter((n) => !n.read), [list])
}

export function useUnreadCount(): number {
  return useUnreadNotifications().length
}

// ── Dashboard KPI Selectors ────────────────────────────────────────

export function useDashboardKPIs() {
  const clients = useClientList()
  const sessions = useSessionList()

  return useMemo(() => {
    const activeClients = clients.filter((c) => c.status === 'active').length
    const thisWeekStart = formatStartOfWeek(new Date())
    const sessionsThisWeek = sessions.filter(
      (s) => s.date >= thisWeekStart && s.status !== 'cancelled'
    ).length
    const avgCompliance =
      clients.length > 0
        ? Math.round(
            clients.reduce((sum, c) => sum + c.complianceScore, 0) / clients.length
          )
        : 0

    return {
      activeClients,
      activeClientsTrend: +3,
      sessionsThisWeek,
      sessionsTrend: +5,
      revenue: sessionsThisWeek * 150,
      revenueTrend: +12,
      complianceScore: avgCompliance,
      complianceTrend: -2,
    }
  }, [clients, sessions])
}

function formatStartOfWeek(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday start
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

// ── Reference Data Selectors ───────────────────────────────────────

export function useCategories() {
  return useAppDataStore((s) => s.categories)
}

export function useLevels() {
  return useAppDataStore((s) => s.levels)
}

export function useTrainingMethods() {
  return useAppDataStore((s) => s.trainingMethods)
}

// ── Convenience: Store State ───────────────────────────────────────

export function useIsDemoMode() {
  return useAppDataStore((s) => s.isDemoMode)
}

export function useIsLoading() {
  return useAppDataStore((s) => s.isLoading)
}

export function useSelectedDate() {
  return useAppDataStore((s) => s.selectedDate)
}
