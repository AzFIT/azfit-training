import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  Plus,
  CalendarPlus,
  UserPlus,
  Dumbbell,
  MessageSquare,
  AlertTriangle,
  Bell,
  Info,
  CheckCircle2,
  Clock,
  ChevronRight,
  Search,
  ChevronDown,
  Eye,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import MetricCard from '../components/dashboard/MetricCard'
import type { MetricCardData } from '../components/dashboard/MetricCard'
import { useAppDataStore } from '../stores/useAppDataStore'
import {
  useClientList,
  useTodaySessions,
  useUnresolvedAlerts,
  useDashboardKPIs,
} from '../stores/useAppDataStore.selectors'
import type { CalendarSession, ClientAlert, Client } from '../types/entities'
import { format, formatDistanceToNow } from 'date-fns'

/* ------------------------------------------------------------------ */
/*  Motion helpers (respect reduced motion)                            */
/* ------------------------------------------------------------------ */

function motionEnter<T extends Record<string, unknown>>(
  reduce: boolean | null,
  initial: T,
  transition?: import('framer-motion').Transition
): { initial: T | false; transition?: import('framer-motion').Transition } {
  if (reduce) return { initial: false }
  return { initial, transition }
}

/* ------------------------------------------------------------------ */
/*  Easing                                                             */
/* ------------------------------------------------------------------ */
const easeSmooth = [0.25, 0.1, 0.25, 1] as [number, number, number, number]
const easeSpring = [0.175, 0.885, 0.32, 1.275] as [number, number, number, number]
const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number]

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface SessionItem {
  time: string
  client: string
  type: string
  duration: string
  status: 'completed' | 'in-progress' | 'upcoming'
  color: string
}

interface AlertItem {
  type: 'danger' | 'warning' | 'info' | 'success'
  message: string
  client: string
  time: string
}

interface ClientData {
  id: string
  name: string
  weight: string
  bodyFat: string
  sessions: number
  status: 'active' | 'warning' | 'alert'
  lastSession: string
}

/* ------------------------------------------------------------------ */
/*  Mappers: Store entities → UI shapes                                */
/* ------------------------------------------------------------------ */

const SESSION_TYPE_COLORS: Record<string, string> = {
  'Strength Training': '#00AEEF',
  'Upper Body Focus': '#8B5CF6',
  'Lower Body Power': '#00AEEF',
  'Cardio & Core': '#22C55E',
  'HIIT Circuit': '#F97316',
  'Mobility & Stretch': '#EAB308',
  'BioPrint Assessment': '#EC4899',
  'Program Review': '#3B82F6',
  'Nutrition Check-in': '#10B981',
  'Personal Training': '#00AEEF',
}

function mapSessionToItem(s: CalendarSession): SessionItem {
  const startH = parseInt(s.startTime.split(':')[0])
  const endH = parseInt(s.endTime.split(':')[0])
  const durationMin = (endH - startH) * 60
  const duration = durationMin >= 60 ? `${Math.floor(durationMin / 60)} hr` : `${durationMin} min`

  let status: SessionItem['status']
  if (s.status === 'completed') status = 'completed'
  else if (s.status === 'in-progress') status = 'in-progress'
  else status = 'upcoming'

  return {
    time: s.startTime,
    client: s.clientName,
    type: s.title,
    duration,
    status,
    color: SESSION_TYPE_COLORS[s.title] || '#00AEEF',
  }
}

function mapAlertToItem(a: ClientAlert): AlertItem {
  let type: AlertItem['type']
  switch (a.priority) {
    case 'high': type = 'danger'; break
    case 'medium': type = 'warning'; break
    default: type = 'info'; break
  }
  // If the message contains celebratory words, make it success
  if (a.message.toLowerCase().includes('goal achieved') || a.message.toLowerCase().includes('milestone') || a.message.toLowerCase().includes('completed')) {
    type = 'success'
  }

  const time = formatDistanceToNow(new Date(a.createdAt), { addSuffix: false })
    .replace('about ', '')
    .replace(/s$/, '')

  return {
    type,
    message: a.message,
    client: a.clientName,
    time: time.includes('hour') || time.includes('minute') ? time.replace(' ', '') + ' ago' : time,
  }
}

function mapClientToData(c: Client): ClientData {
  // Derive dashboard status from compliance + recency
  let status: ClientData['status'] = 'active'
  const daysSinceActive = (Date.now() - new Date(c.lastActive).getTime()) / 86400000
  if (c.complianceScore < 60 || daysSinceActive > 14) status = 'alert'
  else if (c.complianceScore < 75 || daysSinceActive > 7) status = 'warning'

  return {
    id: c.id,
    name: c.name,
    weight: `${c.weight} kg`,
    bodyFat: `${c.bodyFat}%`,
    sessions: c.sessionsCompleted,
    status,
    lastSession: format(new Date(c.lastActive), 'dd/MM/yyyy'),
  }
}

function buildMetricCards(kpis: ReturnType<typeof useDashboardKPIs>, clients: Client[]): MetricCardData[] {
  const { activeClients, sessionsThisWeek, complianceScore, revenue, activeClientsTrend, sessionsTrend, revenueTrend, complianceTrend } = kpis

  // Segment clients by compliance for the "engaged / moderate / atRisk" breakdown
  const engaged = clients.filter((c) => c.complianceScore >= 80).length
  const moderate = clients.filter((c) => c.complianceScore >= 60 && c.complianceScore < 80).length
  const atRisk = clients.filter((c) => c.complianceScore < 60).length

  return [
    { kind: 'sessions', percent: Math.round((sessionsThisWeek / 20) * 100), booked: sessionsThisWeek, total: 20, delta: sessionsTrend },
    { kind: 'clients', total: activeClients, engaged, moderate, atRisk, delta: activeClientsTrend },
    { kind: 'adherence', percent: complianceScore, label: 'Avg compliance', delta: complianceTrend },
    { kind: 'revenue', value: revenue, percent: 81, delta: revenueTrend },
  ]
}

/* ------------------------------------------------------------------ */
/*  Status Badge                                                       */
/* ------------------------------------------------------------------ */
function StatusBadge({ status }: { status: SessionItem['status'] }) {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
        <span className="w-1.5 h-1.5 rounded-full bg-success" />
        Done
      </span>
    )
  }
  if (status === 'in-progress') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
        Now
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#94A3B8]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]" />
      Upcoming
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Alert Icon                                                         */
/* ------------------------------------------------------------------ */
function AlertIcon({ type }: { type: AlertItem['type'] }) {
  const props = { size: 18, className: 'flex-shrink-0' }
  switch (type) {
    case 'danger':
      return <AlertTriangle {...props} className="flex-shrink-0 text-danger" />
    case 'warning':
      return <Clock {...props} className="flex-shrink-0 text-[#F59E0B]" />
    case 'info':
      return <Info {...props} className="flex-shrink-0 text-[#3B82F6]" />
    case 'success':
      return <CheckCircle2 {...props} className="flex-shrink-0 text-success" />
    default:
      return <Bell {...props} className="flex-shrink-0 text-[#94A3B8]" />
  }
}

function AlertBorderColor({ type }: { type: AlertItem['type'] }) {
  switch (type) {
    case 'danger': return '#EF4444'
    case 'warning': return '#F59E0B'
    case 'info': return '#3B82F6'
    case 'success': return '#22C55E'
    default: return '#94A3B8'
  }
}

/* ------------------------------------------------------------------ */
/*  Status Dot                                                         */
/* ------------------------------------------------------------------ */
function StatusDot({ status }: { status: ClientData['status'] }) {
  const color = status === 'active' ? '#22C55E' : status === 'warning' ? '#F59E0B' : '#EF4444'
  return (
    <span
      className="absolute top-3 right-3 w-2 h-2 rounded-full"
      style={{ backgroundColor: color }}
      title={status === 'active' ? 'Active' : status === 'warning' ? 'Attention' : 'Alert'}
    />
  )
}

/* ------------------------------------------------------------------ */
/*  Main Dashboard                                                     */
/* ------------------------------------------------------------------ */
export default function DashboardPage() {
  const reduceMotion = useReducedMotion()
  const navigate = useNavigate()
  const [fabOpen, setFabOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')

  /* Seed demo data if store is empty */
  const seedDemoData = useAppDataStore((s) => s.seedDemoData)
  const clientIds = useAppDataStore((s) => s.clientIds)
  useEffect(() => {
    if (clientIds.length === 0) {
      seedDemoData()
    }
  }, [clientIds.length, seedDemoData])

  /* Data from central store */
  const kpis = useDashboardKPIs()
  const allClients = useClientList()
  const todayStoreSessions = useTodaySessions()
  const unresolvedAlerts = useUnresolvedAlerts()

  /* Map to UI shapes */
  const metricData = useMemo(() => buildMetricCards(kpis, allClients), [kpis, allClients])
  const todaySessions = useMemo(() => todayStoreSessions.map(mapSessionToItem), [todayStoreSessions])
  const followupAlerts = useMemo(() => unresolvedAlerts.map(mapAlertToItem), [unresolvedAlerts])
  const clientList = useMemo(() => allClients.map(mapClientToData), [allClients])

  /* Filter clients */
  const filteredClients = useMemo(() => {
    let filtered = clientList
    if (searchQuery.trim()) {
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }
    if (filterStatus !== 'All') {
      filtered = filtered.filter((c) => {
        if (filterStatus === 'Active') return c.status === 'active'
        if (filterStatus === 'Inactive') return c.status === 'alert'
        if (filterStatus === 'New This Month') return c.sessions < 12
        return true
      })
    }
    return filtered
  }, [searchQuery, filterStatus, clientList])

  /* Close FAB on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFabOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const fabActions = [
    { label: 'New Session', icon: CalendarPlus, action: () => navigate('/calendar') },
    { label: 'Add Client', icon: UserPlus, action: () => navigate('/clients/0') },
    { label: 'Create Program', icon: Dumbbell, action: () => navigate('/programs/new') },
    { label: 'Send Message', icon: MessageSquare, action: () => setFabOpen(false) },
  ]

  const todayDate = format(new Date(), "EEEE, d MMMM yyyy")

  return (
    <motion.div
      {...motionEnter(reduceMotion, { opacity: 0 }, { duration: 0.3 })}
      animate={{ opacity: 1 }}
      className="space-y-8 bg-[#F8FAFC] min-h-[calc(100dvh-64px)]"
    >
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 lg:gap-6 max-w-[1200px] mx-auto">
        {metricData.map((data, idx) => (
          <motion.div
            key={data.kind}
            {...motionEnter(reduceMotion, { opacity: 0, y: 20 }, { duration: 0.5, delay: idx * 0.08, ease: easeOut })}
            animate={{ opacity: 1, y: 0 }}
          >
            <MetricCard data={data} />
          </motion.div>
        ))}
      </div>

      {/* Schedule + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Today's Schedule */}
        <motion.div
          {...motionEnter(reduceMotion, { opacity: 0, x: -30 }, { duration: 0.5, delay: 0.3, ease: easeOut })}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3 bg-white border border-[#E2E8F0] rounded-xl p-5 lg:p-6 shadow-sm"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[#0F172A] text-lg font-semibold">Today&apos;s Schedule</h2>
              <p className="text-[#94A3B8] text-xs mt-0.5">{todayDate}</p>
            </div>
            <Link
              to="/calendar"
              className="text-cyan text-xs font-medium hover:text-[#008DC4] transition-colors flex items-center gap-1"
            >
              View Calendar
              <ChevronRight size={14} />
            </Link>
          </div>

          {/* Timeline */}
          <div className="relative space-y-3 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
            {/* Vertical line */}
            <div className="absolute left-[29px] top-0 bottom-0 w-[2px] bg-[#E2E8F0]" />

            {todaySessions.map((session, idx) => (
              <motion.div
                key={session.time + session.client + idx}
                {...motionEnter(reduceMotion, { opacity: 0, scale: 0.95 }, { duration: 0.3, delay: 0.4 + idx * 0.08, ease: easeSpring })}
                animate={{ opacity: 1, scale: 1 }}
                className="relative flex items-start gap-4 group"
              >
                {/* Time label */}
                <div className="w-[50px] text-right text-xs text-[#94A3B8] pt-3" style={{ fontFamily: '"Space Mono", monospace' }}>
                  {session.time}
                </div>

                {/* Dot */}
                <div
                  className="relative z-10 w-[10px] h-[10px] rounded-full mt-3.5 flex-shrink-0"
                  style={{
                    backgroundColor: session.status === 'in-progress' ? session.color : '#E2E8F0',
                    boxShadow: session.status === 'in-progress' ? `0 0 8px ${session.color}` : 'none',
                  }}
                >
                  {session.status === 'in-progress' && (
                    <span
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{ backgroundColor: session.color, opacity: 0.4 }}
                    />
                  )}
                </div>

                {/* Card */}
                <div
                  className="flex-1 bg-[#F8FAFC] rounded-lg p-3.5 border-l-4 transition-all duration-150 group-hover:bg-[#F1F5F9] group-hover:scale-[1.01]"
                  style={{ borderLeftColor: session.color }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[#94A3B8]" style={{ fontFamily: '"Space Mono", monospace' }}>
                      {session.time} - {String(parseInt(session.time.split(':')[0]) + parseInt(session.duration.split(' ')[0]) / 60).split('.')[0].padStart(2, '0')}:{session.time.split(':')[1]}
                    </span>
                    <StatusBadge status={session.status} />
                  </div>
                  <p className="text-[#0F172A] text-sm font-semibold">{session.client}</p>
                  <p className="text-[#64748B] text-xs">{session.type}</p>
                  <p className="text-[#94A3B8] text-[10px] mt-1 flex items-center gap-1">
                    <Clock size={10} />
                    {session.duration}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Follow-ups & Alerts */}
        <motion.div
          {...motionEnter(reduceMotion, { opacity: 0, x: 30 }, { duration: 0.5, delay: 0.4, ease: easeOut })}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-xl p-5 lg:p-6 shadow-sm"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[#0F172A] text-lg font-semibold">Follow-ups &amp; Alerts</h2>
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[rgba(239,68,68,0.1)] text-danger text-xs font-bold">
              {followupAlerts.length}
            </span>
          </div>

          {/* Alert list */}
          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
            {followupAlerts.map((alert, idx) => (
              <motion.div
                key={idx}
                {...motionEnter(reduceMotion, { opacity: 0, x: 20 }, { duration: 0.3, delay: 0.5 + idx * 0.1, ease: easeOut })}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#F8FAFC] rounded-lg p-4 border-l-[3px] hover:bg-[#F1F5F9] transition-colors duration-150 cursor-pointer flex items-start gap-3"
                style={{ borderLeftColor: AlertBorderColor({ type: alert.type }) }}
                onClick={() => navigate('/clients/1')}
              >
                <AlertIcon type={alert.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-[#0F172A] text-xs font-medium leading-snug">{alert.message}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-cyan text-xs hover:underline">{alert.client}</span>
                    <span className="text-[#94A3B8] text-[10px]" style={{ fontFamily: '"Space Mono", monospace' }}>
                      {alert.time}
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[#94A3B8] flex-shrink-0 mt-0.5" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Your Clients */}
      <motion.div
        {...motionEnter(reduceMotion, { opacity: 0, y: 20 }, { duration: 0.5, delay: 0.5, ease: easeOut })}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <h2 className="text-[#0F172A] text-lg font-semibold">Your Clients</h2>
            <span className="text-[#94A3B8] text-sm">({allClients.length})</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 bg-white border border-[#E2E8F0] rounded-lg pl-8 pr-3 py-2 text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-cyan transition-colors shadow-sm"
              />
            </div>
            {/* Filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none bg-white border border-[#E2E8F0] rounded-lg pl-3 pr-8 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-cyan transition-colors cursor-pointer shadow-sm"
              >
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="New This Month">New This Month</option>
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
            </div>
            <Link
              to="/clients"
              className="text-cyan text-xs font-medium hover:text-[#008DC4] transition-colors flex items-center gap-1 whitespace-nowrap"
            >
              View All
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredClients.map((client, idx) => (
              <motion.div
                key={client.id}
                {...motionEnter(reduceMotion, { opacity: 0, y: 20 }, { duration: 0.35, delay: 0.6 + idx * 0.05, ease: easeOut })}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
                whileHover={{
                  y: -3,
                  transition: { duration: 0.25, ease: easeSmooth },
                }}
                onClick={() => navigate(`/clients/${client.id}`)}
                className="bg-white border border-[#E2E8F0] rounded-xl p-5 relative cursor-pointer hover:border-[rgba(0,174,239,0.3)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-250 shadow-sm"
              >
                <StatusDot status={client.status} />

                {/* Avatar + Name */}
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src="/avatar-placeholder.png"
                    alt={client.name}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-[#0F172A] text-sm font-semibold truncate">{client.name}</p>
                    <p className="text-[#94A3B8] text-xs">{client.lastSession}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-[#F8FAFC] rounded-lg p-2 text-center">
                    <p className="text-[#0F172A] text-xs font-semibold">{client.weight}</p>
                    <p className="text-[#94A3B8] text-[10px]">Weight</p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-lg p-2 text-center">
                    <p className="text-[#0F172A] text-xs font-semibold">{client.bodyFat}</p>
                    <p className="text-[#94A3B8] text-[10px]">Body Fat</p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-lg p-2 text-center">
                    <p className="text-[#0F172A] text-xs font-semibold">{client.sessions}</p>
                    <p className="text-[#94A3B8] text-[10px]">Sessions</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[#94A3B8] text-[10px]">Program Progress</span>
                    <span className="text-[#0F172A] text-[10px] font-medium">{Math.min(client.sessions * 2, 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <motion.div
                      {...motionEnter(reduceMotion, { width: 0 }, { duration: 0.8, delay: 0.7 + idx * 0.05, ease: easeOut })}
                      animate={{ width: `${Math.min(client.sessions * 2, 100)}%` }}
                      className="h-full rounded-full"
                      style={{
                        background:
                          client.status === 'active'
                            ? '#22C55E'
                            : client.status === 'warning'
                              ? '#F59E0B'
                              : '#EF4444',
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <Eye size={32} className="mx-auto text-[#94A3B8] mb-3" />
            <p className="text-[#0F172A] text-sm font-medium">No clients found</p>
            <p className="text-[#94A3B8] text-xs mt-1">Try adjusting your search or filter</p>
          </div>
        )}
      </motion.div>

      {/* FAB */}
      <div className="fixed bottom-6 right-6 z-40">
        <AnimatePresence>
          {fabOpen && (
            <motion.div
              {...motionEnter(reduceMotion, { opacity: 0, y: 20, scale: 0.9 }, { duration: 0.2 })}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-16 right-0 space-y-2"
            >
              {fabActions.map((action, idx) => (
                <motion.button
                  key={action.label}
                  {...motionEnter(reduceMotion, { opacity: 0, x: 20 }, { delay: idx * 0.05 })}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={action.action}
                  className="flex items-center gap-3 bg-white border border-[#E2E8F0] text-[#0F172A] px-4 py-2.5 rounded-full shadow-lg hover:bg-[#F8FAFC] transition-colors whitespace-nowrap text-sm font-medium"
                >
                  <action.icon size={16} className="text-cyan" />
                  {action.label}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setFabOpen(!fabOpen)}
          className="w-14 h-14 rounded-full bg-cyan text-white shadow-lg shadow-[rgba(0,174,239,0.3)] flex items-center justify-center hover:bg-[#008DC4] transition-colors"
        >
          <motion.div animate={{ rotate: fabOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
            <Plus size={24} />
          </motion.div>
        </motion.button>
      </div>
    </motion.div>
  )
}
