/**
 * TrainerDashboard — Main trainer workspace with KPI cards, timeline, follow-ups,
 * client overview grid, and quick-action FABs.
 *
 * Route: /trainer/dashboard
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Search,
  Play,
  Pencil,
  X,
  CalendarClock,
  AlertTriangle,
  Clock,
  Info,
  CheckCircle,
  UserPlus,
  CalendarPlus,
  ClipboardList,
  MessageSquare,
  Plus,
  ChevronRight,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { format } from 'date-fns';
import { useAuthStore } from '@/stores/useAuthStore';
import { useClientStore } from '@/stores/useClientStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import {
  generateClients,
  generateSessions,
  generateAlerts,
  calculateKPIs,
  generateSparklineData,
  getTodayISO,
  getSessionsForDate,
  formatRelativeTime,
} from '@/lib/demo-data';
import type {
  DemoClient,
  DemoSession,
  DemoAlert,
  KPIData,
  SessionStatus,
} from '@/lib/demo-data';

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */

const springEase = [0.34, 1.56, 0.64, 1] as [number, number, number, number];
const containerStagger: import('framer-motion').Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUpItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
};

/* ------------------------------------------------------------------ */
/*  useCountUp hook                                                    */
/* ------------------------------------------------------------------ */

function useCountUp(target: number, duration = 1000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - p) * (1 - p); // ease-out
      setValue(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

/* ------------------------------------------------------------------ */
/*  Status colour helper                                               */
/* ------------------------------------------------------------------ */

function statusColor(status: SessionStatus) {
  switch (status) {
    case 'confirmed': return '#22C55E';
    case 'in-progress': return '#00AEEF';
    case 'pending': return '#EAB308';
    case 'cancelled': return '#D1D5DB';
    case 'completed': return '#22C55E';
    default: return '#9CA3AF';
  }
}

function statusLabel(status: SessionStatus) {
  switch (status) {
    case 'in-progress': return 'In Progress';
    default: return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

/* ------------------------------------------------------------------ */
/*  SparkLine component                                                */
/* ------------------------------------------------------------------ */

function SparkLine({ data, color, fillColor }: { data: number[]; color: string; fillColor: string }) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <div className="h-10 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <defs>
            <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fillColor} stopOpacity={0.4} />
              <stop offset="100%" stopColor={fillColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2}
            fill={`url(#grad-${color.replace('#', '')})`}
            dot={false}
            isAnimationActive
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ComplianceRing component                                           */
/* ------------------------------------------------------------------ */

function ComplianceRing({ value, size = 44 }: { value: number; size?: number }) {
  const data = [
    { name: 'compliant', value },
    { name: 'remaining', value: 100 - value },
  ];
  const COLORS = ['#22C55E', '#E5E7EB'];
  return (
    <div className="flex items-center gap-2 mt-2">
      <PieChart width={size} height={size}>
        <Pie
          data={data}
          cx={size / 2}
          cy={size / 2}
          innerRadius={size * 0.32}
          outerRadius={size * 0.44}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
          stroke="none"
          isAnimationActive
          animationDuration={1000}
        >
          {data.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index]} />
          ))}
        </Pie>
      </PieChart>
      <span className="text-sm font-bold text-gray-900 dark:text-white font-mono">{value}%</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TrendBadge component                                               */
/* ------------------------------------------------------------------ */

function TrendBadge({ value, prefix = '' }: { value: number; prefix?: string }) {
  const isPositive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-caption font-semibold px-2 py-0.5 rounded-full ${
        isPositive
          ? 'bg-success-light text-success'
          : 'bg-danger-light text-danger'
      }`}
    >
      {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {prefix}{value > 0 ? '+' : ''}{value}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  KPI Card component                                                 */
/* ------------------------------------------------------------------ */

interface KPICardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend: number;
  sparklineData: number[];
  sparkColor: string;
  sparkFill: string;
  link: string;
  linkText: string;
}

function KPICard({
  label,
  value,
  prefix = '',
  suffix = '',
  trend,
  sparklineData,
  sparkColor,
  sparkFill,
  link,
  linkText,
}: KPICardProps) {
  const animated = useCountUp(value);
  return (
    <motion.div
      variants={fadeUpItem}
      className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-white/[0.06] p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-caption text-gray-500 uppercase tracking-wider font-medium">{label}</span>
        <TrendBadge value={trend} />
      </div>
      <div className="text-data-lg font-mono font-bold text-gray-900 dark:text-white">
        {prefix}{animated}{suffix}
      </div>
      <SparkLine data={sparklineData} color={sparkColor} fillColor={sparkFill} />
      <Link
        to={link}
        className="inline-flex items-center gap-1 text-caption text-cyan hover:text-cyan-dark mt-3 font-medium transition-colors"
      >
        {linkText} <ChevronRight size={12} />
      </Link>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  ComplianceKPI Card (special — has ring instead of sparkline)       */
/* ------------------------------------------------------------------ */

function ComplianceKPICard({ value, trend }: { value: number; trend: number }) {
  return (
    <motion.div
      variants={fadeUpItem}
      className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-white/[0.06] p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-caption text-gray-500 uppercase tracking-wider font-medium">Avg. Compliance</span>
        <TrendBadge value={trend} />
      </div>
      <ComplianceRing value={value} />
      <Link
        to="#"
        className="inline-flex items-center gap-1 text-caption text-cyan hover:text-cyan-dark mt-3 font-medium transition-colors"
      >
        View report <ChevronRight size={12} />
      </Link>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Today's Timeline                                                   */
/* ------------------------------------------------------------------ */

function TodayTimeline({ sessions }: { sessions: DemoSession[] }) {
  const today = getTodayISO();
  const todaySessions = useMemo(
    () => getSessionsForDate(sessions, today).filter((s) => s.status !== 'completed'),
    [sessions, today]
  );

  return (
    <motion.div
      variants={fadeUpItem}
      className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-white/[0.06] p-6 shadow-card mb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-heading-sm font-semibold text-gray-900 dark:text-white">Today&apos;s Schedule</h2>
          <p className="text-body-sm text-gray-500 mt-0.5">{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
        <Link
          to="/trainer/calendar"
          className="inline-flex items-center gap-1 text-caption text-cyan hover:text-cyan-dark font-medium transition-colors"
        >
          View full calendar <ChevronRight size={12} />
        </Link>
      </div>

      {/* Timeline */}
      {todaySessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <CalendarClock size={32} className="text-gray-300 mb-2" />
          <p className="text-body-sm text-gray-400">No sessions scheduled for today</p>
          <Link to="/trainer/calendar" className="text-caption text-cyan mt-1 font-medium hover:underline">
            Add a session
          </Link>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical connector */}
          <div className="absolute left-[23px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700" />

          <div className="space-y-3">
            {todaySessions.map((session, idx) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
                className="flex items-start gap-4 relative"
              >
                {/* Time */}
                <div className="w-12 text-right shrink-0">
                  <span className="text-caption font-mono text-gray-400">{session.startTime}</span>
                </div>

                {/* Status dot */}
                <div className="relative z-10 mt-1">
                  {session.status === 'in-progress' ? (
                    <motion.div
                      animate={{ scale: [1, 1.35, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-2.5 h-2.5 rounded-full bg-[#00AEEF]"
                    />
                  ) : (
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: statusColor(session.status) }}
                    />
                  )}
                </div>

                {/* Event card */}
                <div
                  className="flex-1 min-w-0 p-3 rounded-xl border border-gray-100 dark:border-white/[0.04] bg-gray-50/50 dark:bg-white/[0.02]"
                  style={{ borderLeftWidth: 3, borderLeftColor: statusColor(session.status) }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-body-sm font-semibold text-gray-900 dark:text-white truncate">
                          {session.clientName}
                        </p>
                        <span
                          className="text-caption px-1.5 py-0.5 rounded-full font-medium shrink-0"
                          style={{
                            backgroundColor: `${statusColor(session.status)}18`,
                            color: statusColor(session.status),
                          }}
                        >
                          {statusLabel(session.status)}
                        </span>
                      </div>
                      <p className="text-caption text-gray-500 mt-0.5">{session.type}</p>
                      <p className="text-caption font-mono text-gray-400 mt-0.5">
                        {session.startTime} - {session.endTime}
                      </p>
                    </div>

                    {/* Quick actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {session.status === 'confirmed' && (
                        <button
                          title="Start session"
                          className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 hover:text-success transition-colors"
                        >
                          <Play size={14} />
                        </button>
                      )}
                      <button
                        title="Edit session"
                        className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      {session.status !== 'cancelled' && (
                        <button
                          title="Cancel session"
                          className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 hover:text-danger transition-colors"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Follow-ups Panel                                                   */
/* ------------------------------------------------------------------ */

function FollowUpsPanel({ alerts, onDismiss }: { alerts: DemoAlert[]; onDismiss: (id: string) => void }) {
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const filtered = filter === 'all' ? alerts : alerts.filter((a) => a.priority === filter);

  const priorityConfig = {
    high: { color: '#EF4444', icon: AlertTriangle, bg: 'bg-danger-light' },
    medium: { color: '#EAB308', icon: Clock, bg: 'bg-warning-light' },
    low: { color: '#3B82F6', icon: Info, bg: 'bg-info-light' },
  };

  return (
    <motion.div
      variants={fadeUpItem}
      className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-white/[0.06] p-6 shadow-card mb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-heading-sm font-semibold text-gray-900 dark:text-white">Follow-ups & Alerts</h2>
          {alerts.length > 0 && (
            <span className="text-caption font-semibold px-2 py-0.5 rounded-full bg-danger-light text-danger">
              {alerts.length}
            </span>
          )}
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'high' | 'medium' | 'low')}
          className="text-caption bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 text-gray-700 dark:text-gray-300 outline-none focus:border-cyan"
        >
          <option value="all">All</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Alert list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <CheckCircle size={32} className="text-success mb-2" />
          <p className="text-body-sm text-gray-400">All caught up! No follow-ups needed.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((alert) => {
              const cfg = priorityConfig[alert.priority];
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04]"
                  style={{ borderLeftWidth: 3, borderLeftColor: cfg.color }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${cfg.color}18` }}
                  >
                    <Icon size={16} style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm font-medium text-gray-900 dark:text-white truncate">
                      {alert.clientName} — {alert.message}
                    </p>
                    <p className="text-caption text-gray-500 capitalize">{alert.priority} priority</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onDismiss(alert.id)}
                      className="text-caption text-cyan hover:text-cyan-dark font-medium px-2 py-1 rounded-md hover:bg-cyan-glow transition-colors"
                    >
                      {alert.action}
                    </button>
                    <button
                      onClick={() => onDismiss(alert.id)}
                      className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Mark done"
                    >
                      <CheckCircle size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Client Card (for overview grid)                                    */
/* ------------------------------------------------------------------ */

function ClientCard({ client, index }: { client: DemoClient; index: number }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
      onClick={() => navigate(`/trainer/client/${client.id}`)}
      className="p-4 rounded-xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#141414] cursor-pointer hover:border-cyan/30 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group"
    >
      {/* Top row: avatar + name + status */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-cyan flex items-center justify-center text-white text-sm font-semibold">
            {client.initials}
          </div>
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#141414] ${
              client.status === 'active' ? 'bg-success' : 'bg-gray-300'
            }`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-body-sm font-semibold text-gray-900 dark:text-white truncate">{client.name}</p>
          <span
            className="inline-block text-caption px-2 py-0.5 rounded-full font-medium mt-0.5"
            style={{
              backgroundColor:
                client.program === 'Strength'
                  ? 'rgba(0,174,239,0.1)'
                  : client.program === 'Weight Loss'
                    ? 'rgba(234,179,8,0.1)'
                    : client.program === 'Endurance'
                      ? 'rgba(34,197,94,0.1)'
                      : 'rgba(59,130,246,0.1)',
              color:
                client.program === 'Strength'
                  ? '#00AEEF'
                  : client.program === 'Weight Loss'
                    ? '#EAB308'
                    : client.program === 'Endurance'
                      ? '#22C55E'
                      : '#3B82F6',
            }}
          >
            {client.program}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-caption text-gray-500">Program Progress</span>
          <span className="text-caption font-mono text-cyan font-bold">{client.programProgress}%</span>
        </div>
        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${client.programProgress}%` }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number], delay: 0.2 + index * 0.04 }}
            className="h-full bg-gradient-cyan rounded-full"
          />
        </div>
      </div>

      {/* Mini stats row */}
      <div className="flex items-center justify-between text-caption text-gray-500">
        <span>{client.sessionsCompleted} sessions</span>
        <span className="text-success">{client.complianceScore}% compliance</span>
        <span className="text-gray-400">{formatRelativeTime(client.lastActive)}</span>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Client Overview Grid                                               */
/* ------------------------------------------------------------------ */

function ClientOverview({ clients }: { clients: DemoClient[] }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'compliance' | 'lastActive' | 'progress'>('name');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const programs = useMemo(() => [...new Set(clients.map((c) => c.program))], [clients]);

  const filtered = useMemo(() => {
    let result = [...clients];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
      );
    }

    if (programFilter !== 'all') {
      result = result.filter((c) => c.program === programFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter);
    }

    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'compliance':
        result.sort((a, b) => b.complianceScore - a.complianceScore);
        break;
      case 'lastActive':
        result.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());
        break;
      case 'progress':
        result.sort((a, b) => b.programProgress - a.programProgress);
        break;
    }

    return result;
  }, [clients, search, sortBy, programFilter, statusFilter]);

  return (
    <motion.div
      variants={fadeUpItem}
      className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-white/[0.06] p-6 shadow-card"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <h2 className="text-heading-sm font-semibold text-gray-900 dark:text-white">Client Overview</h2>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 text-sm bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-cyan min-w-[200px] text-gray-900 dark:text-white placeholder:text-gray-400"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-sm bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-gray-700 dark:text-gray-300 outline-none focus:border-cyan"
          >
            <option value="name">Alphabetical</option>
            <option value="compliance">Compliance</option>
            <option value="lastActive">Last Active</option>
            <option value="progress">Progress</option>
          </select>

          {/* Program filter */}
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="text-sm bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-gray-700 dark:text-gray-300 outline-none focus:border-cyan"
          >
            <option value="all">All Programs</option>
            {programs.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-gray-700 dark:text-gray-300 outline-none focus:border-cyan"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center">
          <Search size={32} className="text-gray-300 mb-2" />
          <p className="text-body-sm text-gray-400">No clients match your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((client, idx) => (
            <ClientCard key={client.id} client={client} index={idx} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quick Action FABs                                                  */
/* ------------------------------------------------------------------ */

function QuickActionFABs() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    { icon: UserPlus, label: 'New Client', onClick: () => navigate('/trainer/clients') },
    { icon: CalendarPlus, label: 'Quick Session', onClick: () => navigate('/trainer/calendar') },
    { icon: ClipboardList, label: 'Body Stats', onClick: () => navigate('/trainer/assessments') },
    { icon: MessageSquare, label: 'Message', onClick: () => {} },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[90] flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-[-1]"
              onClick={() => setOpen(false)}
            />

            {/* FAB items */}
            {actions.map((action, i) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 20, scale: 0 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3, ease: springEase }}
                onClick={() => {
                  setOpen(false);
                  action.onClick();
                }}
                className="flex items-center gap-3 group"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-[#1A1A1A] px-3 py-1.5 rounded-lg shadow-md border border-gray-200 dark:border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                  {action.label}
                </span>
                <div className="w-12 h-12 rounded-full bg-[#1A1A1A] dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform">
                  <action.icon size={18} />
                </div>
              </motion.button>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Primary FAB */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-trainer-accent flex items-center justify-center text-white shadow-trainer hover:shadow-lg transition-shadow"
        style={{ boxShadow: '0 8px 24px rgba(236, 72, 153, 0.4)' }}
      >
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.25, ease: springEase }}>
          <Plus size={24} />
        </motion.div>
      </motion.button>
    </div>
  );
}

/* ================================================================== */
/*  MAIN PAGE COMPONENT                                                */
/* ================================================================== */

export default function TrainerDashboard() {
  const { isDemoMode, user } = useAuthStore();
  const { setClients, clients: storeClients } = useClientStore();
  const { addNotification } = useNotificationStore();

  /* ---- Demo data ---- */
  const [demoClients, setDemoClients] = useState<DemoClient[]>([]);
  const [demoSessions, setDemoSessions] = useState<DemoSession[]>([]);
  const [demoAlerts, setDemoAlerts] = useState<DemoAlert[]>([]);

  useEffect(() => {
    if (isDemoMode || !user) {
      const clients = generateClients();
      const sessions = generateSessions(clients);
      const alerts = generateAlerts(clients);
      setDemoClients(clients);
      setDemoSessions(sessions);
      setDemoAlerts(alerts);

      // Sync with client store
      setClients(
        clients.map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          status: c.status,
          joinDate: c.joinDate,
          lastSession: c.lastActive,
          progress: c.programProgress,
        }))
      );

      // Add welcome notification
      addNotification({
        title: 'Welcome to AzFIT Dashboard',
        message: 'Demo mode is active with 12 synthetic clients.',
        type: 'info',
      });
    }
  }, [isDemoMode, user, setClients, addNotification]);

  /* ---- KPI data ---- */
  const kpis: KPIData = useMemo(() => {
    const source = demoClients.length > 0 ? demoClients : storeClients.map((c) => ({ status: c.status, complianceScore: c.progress } as DemoClient));
    if (demoClients.length > 0) {
      return calculateKPIs(demoClients, demoSessions);
    }
    return {
      activeClients: source.filter((c) => c.status === 'active').length || 8,
      activeClientsTrend: 3,
      sessionsThisWeek: 24,
      sessionsTrend: 5,
      revenueSGD: 3600,
      revenueTrend: 12,
      complianceScore: 87,
      complianceTrend: -2,
    };
  }, [demoClients, demoSessions, storeClients]);

  /* ---- Alert dismissal ---- */
  const handleDismissAlert = useCallback((id: string) => {
    setDemoAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const clientsForOverview = demoClients.length > 0 ? demoClients : storeClients.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    initials: c.name.split(' ').map((n) => n[0]).join(''),
    status: c.status,
    program: 'Strength' as const,
    programProgress: c.progress,
    complianceScore: c.progress,
    sessionsCompleted: 10,
    lastActive: c.lastSession,
    joinDate: c.joinDate,
    age: 30,
    weight: 70,
    height: 170,
    bodyFat: 18,
    goal: 'General fitness',
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-24 max-w-[1440px] mx-auto">
      {/* Page title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-6"
      >
        <h1 className="text-display-md font-semibold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-body-sm text-gray-500 mt-1">
          Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}. Here&apos;s what&apos;s happening today.
        </p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <KPICard
          label="Active Clients"
          value={kpis.activeClients}
          trend={kpis.activeClientsTrend}
          sparklineData={generateSparklineData(kpis.activeClients, 5)}
          sparkColor="#00AEEF"
          sparkFill="rgba(0, 174, 239, 0.15)"
          link="/trainer/clients"
          linkText="View all"
        />
        <KPICard
          label="Sessions This Week"
          value={kpis.sessionsThisWeek}
          trend={kpis.sessionsTrend}
          sparklineData={generateSparklineData(kpis.sessionsThisWeek, 8)}
          sparkColor="#3B82F6"
          sparkFill="rgba(59, 130, 246, 0.15)"
          link="/trainer/calendar"
          linkText="View calendar"
        />
        <KPICard
          label="Revenue (SGD)"
          value={kpis.revenueSGD}
          prefix="$"
          trend={kpis.revenueTrend}
          sparklineData={generateSparklineData(kpis.revenueSGD / 100, 20)}
          sparkColor="#22C55E"
          sparkFill="rgba(34, 197, 94, 0.15)"
          link="#"
          linkText="View details"
        />
        <ComplianceKPICard value={kpis.complianceScore} trend={kpis.complianceTrend} />
      </motion.div>

      {/* Today's Timeline */}
      <TodayTimeline sessions={demoSessions} />

      {/* Follow-ups */}
      <FollowUpsPanel alerts={demoAlerts} onDismiss={handleDismissAlert} />

      {/* Client Overview */}
      <ClientOverview clients={clientsForOverview} />

      {/* FABs */}
      <QuickActionFABs />
    </div>
  );
}
