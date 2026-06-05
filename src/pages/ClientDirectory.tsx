/**
 * ClientDirectory — Comprehensive, searchable client management page.
 * Features a 6-column sortable data table with filtering, progress indicators,
 * pagination, and quick actions.
 *
 * Route: /trainer/clients
 */
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Search,
  ChevronUp,
  ChevronDown,
  Eye,
  Pencil,
  MessageSquare,
  Download,
  UserPlus,
  Users,
  Target,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { useClientStore } from '@/stores/useClientStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import {
  generateClients,
  formatRelativeTime,
} from '@/lib/demo-data';
import type { DemoClient } from '@/lib/demo-data';

/* ------------------------------------------------------------------ */
/*  Type definitions                                                   */
/* ------------------------------------------------------------------ */

type SortField = 'name' | 'program' | 'compliance' | 'lastActive';
type SortDir = 'asc' | 'desc' | null;

interface SortConfig {
  field: SortField;
  dir: SortDir;
}

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const fadeUpItem = {
  hidden: { opacity: 0, y: 10 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  }),
};

const containerStagger: import('framer-motion').Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const cardFadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
};

/* ------------------------------------------------------------------ */
/*  Motion helpers (respect reduced motion)                            */
/* ------------------------------------------------------------------ */

function motionEnter<T extends Record<string, unknown>>(
  reduce: boolean | null,
  initial: T,
  transition?: import('framer-motion').Transition
): { initial: T | false; transition?: import('framer-motion').Transition } {
  if (reduce) return { initial: false };
  return { initial, transition };
}

/* ------------------------------------------------------------------ */
/*  Program badge colour helper                                        */
/* ------------------------------------------------------------------ */

function programColors(program: string): { bg: string; text: string } {
  switch (program) {
    case 'Strength': return { bg: 'rgba(0,174,239,0.1)', text: '#00AEEF' };
    case 'Weight Loss': return { bg: 'rgba(234,179,8,0.1)', text: '#EAB308' };
    case 'Endurance': return { bg: 'rgba(34,197,94,0.1)', text: '#22C55E' };
    case 'Hypertrophy': return { bg: 'rgba(168,85,247,0.1)', text: '#A855F7' };
    case 'Rehabilitation': return { bg: 'rgba(239,68,68,0.1)', text: '#EF4444' };
    case 'General Fitness': return { bg: 'rgba(59,130,246,0.1)', text: '#3B82F6' };
    default: return { bg: 'rgba(107,114,128,0.1)', text: '#6B7280' };
  }
}

/* ------------------------------------------------------------------ */
/*  Compliance colour helper                                           */
/* ------------------------------------------------------------------ */

function complianceColor(score: number): string {
  if (score >= 90) return '#22C55E';
  if (score >= 70) return '#EAB308';
  return '#EF4444';
}

function complianceLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  return 'Needs Attention';
}

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
      const eased = 1 - (1 - p) * (1 - p);
      setValue(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

/* ------------------------------------------------------------------ */
/*  Stats Bar                                                          */
/* ------------------------------------------------------------------ */

function StatsBar({ clients }: { clients: DemoClient[] }) {
  const reduceMotion = useReducedMotion();
  const activeCount = clients.filter((c) => c.status === 'active').length;
  const inactiveCount = clients.filter((c) => c.status === 'inactive').length;
  const newThisMonth = clients.filter((c) => {
    const d = new Date(c.joinDate);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const avgCompliance = clients.length > 0
    ? Math.round(clients.reduce((s, c) => s + c.complianceScore, 0) / clients.length)
    : 0;

  const animatedActive = useCountUp(activeCount);
  const animatedInactive = useCountUp(inactiveCount);
  const animatedNew = useCountUp(newThisMonth);
  const animatedCompliance = useCountUp(avgCompliance);

  const stats = [
    { label: 'Total Clients', value: clients.length, icon: Users, color: 'text-gray-500' },
    { label: 'Active', value: animatedActive, icon: Users, color: 'text-success', dot: true },
    { label: 'Inactive', value: animatedInactive, icon: Users, color: 'text-gray-400', dot: false },
    { label: 'New This Month', value: animatedNew, icon: TrendingUp, color: 'text-cyan' },
    { label: 'Avg. Compliance', value: `${animatedCompliance}%`, icon: Target, color: 'text-info' },
  ];

  return (
    <motion.div
      variants={containerStagger}
      initial={reduceMotion ? false : 'hidden'}
      animate="show"
      className="flex flex-wrap gap-3 mb-6"
    >
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          variants={cardFadeUp}
          className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-card"
        >
          <div className="relative">
            <stat.icon size={18} className={stat.color} />
            {stat.dot !== undefined && (
              <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${stat.dot ? 'bg-success' : 'bg-gray-300'}`} />
            )}
          </div>
          <div>
            <p className="text-caption text-gray-500">{stat.label}</p>
            <p className="text-data-md font-mono font-bold text-gray-900">{stat.value}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ================================================================== */
/*  MAIN PAGE COMPONENT                                                */
/* ================================================================== */

export default function ClientDirectory() {
  const reduceMotion = useReducedMotion();
  const { clients: storeClients, setClients } = useClientStore();
  const { addNotification } = useNotificationStore();
  const navigate = useNavigate();

  /* ---- Demo data ---- */
  const [demoClients, setDemoClients] = useState<DemoClient[]>([]);

  useEffect(() => {
    // Seed demo clients on first load if the store is empty (fresh session or incognito)
    if (storeClients.length === 0 && demoClients.length === 0) {
      const clients = generateClients();
      setDemoClients(clients);
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
    }
  }, [storeClients.length, demoClients.length, setClients]);

  const clients: DemoClient[] = demoClients.length > 0
    ? demoClients
    : storeClients.map((c) => ({
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

  /* ---- Toolbar state ---- */
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [complianceFilter, setComplianceFilter] = useState<string>('all');
  const [sort, setSort] = useState<SortConfig>({ field: 'name', dir: 'asc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  /* ---- Unique programs ---- */
  const programs = useMemo(() => [...new Set(clients.map((c) => c.program))], [clients]);

  /* ---- Sort handler ---- */
  const handleSort = (field: SortField) => {
    setSort((prev) => {
      if (prev.field !== field) return { field, dir: 'asc' };
      if (prev.dir === 'asc') return { field, dir: 'desc' };
      if (prev.dir === 'desc') return { field, dir: 'asc' };
      return { field, dir: 'asc' };
    });
    setPage(1);
  };

  /* ---- Sort icon ---- */
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sort.field !== field) return <ChevronUp size={14} className="text-gray-300 opacity-0 group-hover:opacity-50" />;
    return sort.dir === 'asc'
      ? <ChevronUp size={14} className="text-cyan" />
      : <ChevronDown size={14} className="text-cyan" />;
  };

  /* ---- Filtered & sorted data ---- */
  const filtered = useMemo(() => {
    let result = [...clients];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.program.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (programFilter !== 'all') {
      result = result.filter((c) => c.program === programFilter);
    }

    if (complianceFilter !== 'all') {
      result = result.filter((c) => {
        if (complianceFilter === 'high') return c.complianceScore >= 90;
        if (complianceFilter === 'medium') return c.complianceScore >= 70 && c.complianceScore < 90;
        if (complianceFilter === 'low') return c.complianceScore < 70;
        return true;
      });
    }

    result.sort((a, b) => {
      const { field, dir } = sort;
      let cmp = 0;
      switch (field) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'program':
          cmp = a.program.localeCompare(b.program);
          break;
        case 'compliance':
          cmp = a.complianceScore - b.complianceScore;
          break;
        case 'lastActive':
          cmp = new Date(a.lastActive).getTime() - new Date(b.lastActive).getTime();
          break;
      }
      return dir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [clients, search, statusFilter, programFilter, complianceFilter, sort]);

  /* ---- Pagination ---- */
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  /* ---- Export CSV ---- */
  const handleExport = () => {
    const headers = ['Name', 'Email', 'Program', 'Progress', 'Compliance', 'Status', 'Last Active'];
    const rows = filtered.map((c) => [c.name, c.email, c.program, `${c.programProgress}%`, `${c.complianceScore}%`, c.status, c.lastActive]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addNotification({ title: 'Export complete', message: `${filtered.length} clients exported to CSV.`, type: 'success' });
  };

  /* ---- Row click ---- */
  const handleRowClick = (clientId: string) => {
    navigate(`/trainer/client/${clientId}`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto bg-[#F8FAFC] min-h-[calc(100dvh-64px)]">
      {/* Page title */}
      <motion.div
        {...motionEnter(reduceMotion, { opacity: 0, y: 10 }, { duration: 0.35 })}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-display-md font-semibold text-gray-900">Clients</h1>
        <p className="text-body-sm text-gray-500 mt-1">Manage your client roster, track progress, and take action.</p>
      </motion.div>

      {/* Stats Bar */}
      <StatsBar clients={clients} />

      {/* Toolbar */}
      <motion.div
        {...motionEnter(reduceMotion, { opacity: 0 }, { delay: 0.2, duration: 0.3 })}
        animate={{ opacity: 1 }}
        className="flex flex-wrap items-center gap-2 mb-4"
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-[400px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or program..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-cyan text-gray-900 placeholder:text-gray-400"
          />
        </div>

        {/* Filters */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="text-sm bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-gray-700 outline-none focus:border-cyan"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="onboarding">Onboarding</option>
        </select>

        <select
          value={programFilter}
          onChange={(e) => { setProgramFilter(e.target.value); setPage(1); }}
          className="text-sm bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-gray-700 outline-none focus:border-cyan"
        >
          <option value="all">All Programs</option>
          {programs.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <select
          value={complianceFilter}
          onChange={(e) => { setComplianceFilter(e.target.value); setPage(1); }}
          className="text-sm bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-gray-700 outline-none focus:border-cyan"
        >
          <option value="all">All Compliance</option>
          <option value="high">Excellent (90%+)</option>
          <option value="medium">Good (70-89%)</option>
          <option value="low">Needs Attention (&lt;70%)</option>
        </select>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors"
        >
          <Download size={16} /> Export
        </button>
        <button
          onClick={() => addNotification({ title: 'Coming soon', message: 'Client creation will be available in the next update.', type: 'info' })}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-gradient-cyan text-white rounded-xl shadow-cyan hover:shadow-cyan-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <UserPlus size={16} /> Add Client
        </button>
      </motion.div>

      {/* Table Card */}
      <motion.div
        {...motionEnter(reduceMotion, { opacity: 0, y: 10 }, { delay: 0.25, duration: 0.35 })}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            {/* Header */}
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {[
                  { key: 'name' as SortField, label: 'Client', width: '25%' },
                  { key: 'program' as SortField, label: 'Program', width: '15%' },
                  { key: null, label: 'Progress', width: '20%' },
                  { key: 'compliance' as SortField, label: 'Compliance', width: '15%' },
                  { key: 'lastActive' as SortField, label: 'Last Active', width: '12%' },
                  { key: null, label: 'Actions', width: '13%' },
                ].map((col) => (
                  <th
                    key={col.label}
                    className={`text-left text-caption font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5 ${
                      col.key ? 'cursor-pointer select-none group hover:text-gray-700' : ''
                    }`}
                    style={{ width: col.width }}
                    onClick={() => col.key && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.key && <SortIcon field={col.key} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center justify-center py-14 text-center">
                      <Users size={40} className="text-gray-300 mb-3" />
                      <p className="text-heading-sm text-gray-700 mb-1">No clients found</p>
                      <p className="text-body-sm text-gray-500 mb-4">Try adjusting your search or filters</p>
                      <button
                        onClick={() => {
                          setSearch('');
                          setStatusFilter('all');
                          setProgramFilter('all');
                          setComplianceFilter('all');
                        }}
                        className="text-sm text-cyan hover:text-cyan-dark font-medium"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((client, idx) => {
                  const progColors = programColors(client.program);
                  const compColor = complianceColor(client.complianceScore);
                  const isStale = new Date().getTime() - new Date(client.lastActive).getTime() > 7 * 86400000;

                  return (
                    <motion.tr
                      key={client.id}
                      custom={idx}
                      variants={fadeUpItem}
                      initial={reduceMotion ? false : 'hidden'}
                      animate="show"
                      onClick={() => handleRowClick(client.id)}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                    >
                      {/* Client */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-cyan flex items-center justify-center text-white text-sm font-semibold shrink-0">
                            {client.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-body-sm font-semibold text-gray-900 truncate">{client.name}</p>
                            <p className="text-caption text-gray-400 truncate">{client.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Program */}
                      <td className="px-5 py-3.5">
                        <span
                          className="inline-block text-caption px-2.5 py-1 rounded-full font-semibold"
                          style={{ backgroundColor: progColors.bg, color: progColors.text }}
                        >
                          {client.program}
                        </span>
                      </td>

                      {/* Progress */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              {...motionEnter(reduceMotion, { width: 0 }, { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number], delay: idx * 0.03 })}
                              animate={{ width: `${client.programProgress}%` }}
                              className="h-full bg-gradient-cyan rounded-full"
                            />
                          </div>
                          <span className="text-caption font-mono text-cyan font-bold w-8 text-right">{client.programProgress}%</span>
                        </div>
                      </td>

                      {/* Compliance */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-caption font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${compColor}18`,
                              color: compColor,
                            }}
                          >
                            {client.complianceScore}%
                          </span>
                          <span className="text-caption text-gray-400 hidden xl:inline">{complianceLabel(client.complianceScore)}</span>
                        </div>
                      </td>

                      {/* Last Active */}
                      <td className="px-5 py-3.5">
                        <span className={`text-caption ${isStale ? 'text-danger' : 'text-gray-500'}`}>
                          {formatRelativeTime(client.lastActive)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleRowClick(client.id)}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-cyan transition-colors"
                            title="View profile"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => addNotification({ title: 'Coming soon', message: 'Quick edit will be available soon.', type: 'info' })}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-warning transition-colors"
                            title="Quick edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => addNotification({ title: 'Message', message: `Opening chat with ${client.name}...`, type: 'info' })}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-info transition-colors"
                            title="Send message"
                          >
                            <MessageSquare size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <span className="text-caption text-gray-500">
                Showing {(safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, filtered.length)} of {filtered.length}
              </span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="text-caption bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-gray-700 outline-none"
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-caption font-semibold transition-colors ${
                    p === safePage
                      ? 'bg-cyan text-white'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
