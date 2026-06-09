import { useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield, Users, Dumbbell, Award, ChevronRight, BarChart3,
} from 'lucide-react'
import { useAppDataStore } from '../stores/useAppDataStore'
import { useAuthStore } from '../stores/authStore'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const { role } = useAuthStore()
  const {
    clients, programs, exercises, workoutSessions, alerts,
  } = useAppDataStore()

  // Belt-and-suspenders: redirect non-admins (AdminGuard should already handle this)
  useEffect(() => {
    if (role && role !== 'admin') {
      navigate('/dashboard', { replace: true })
    }
  }, [role, navigate])

  const stats = useMemo(() => {
    const clientList = Object.values(clients)
    const activeClients = clientList.filter(c => c.status === 'active').length
    const pausedClients = clientList.filter(c => c.status === 'on-hold').length
    const inactiveClients = clientList.filter(c => c.status === 'inactive').length
    const totalClients = clientList.length
    const totalPrograms = Object.keys(programs).length
    const totalExercises = Object.keys(exercises).length
    const totalSessions = Object.keys(workoutSessions).length
    const openAlerts = Object.values(alerts).filter(a => !a.resolved).length

    return {
      totalClients,
      activeClients,
      pausedClients,
      inactiveClients,
      totalPrograms,
      totalExercises,
      totalSessions,
      openAlerts,
    }
  }, [clients, programs, exercises, workoutSessions, alerts])

  const statCards = [
    { label: 'Clients', value: stats.totalClients, icon: Users, color: 'text-success' as const, bg: 'bg-success/10' },
    { label: 'Programs', value: stats.totalPrograms, icon: Dumbbell, color: 'text-violet' as const, bg: 'bg-violet/10' },
    { label: 'Exercises', value: stats.totalExercises, icon: BarChart3, color: 'text-warning' as const, bg: 'bg-warning/10' },
    { label: 'Sessions', value: stats.totalSessions, icon: Shield, color: 'text-cyan' as const, bg: 'bg-cyan/10' },
  ]

  const clientList = useMemo(() => Object.values(clients).sort(
    (a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()
  ), [clients])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-dark-primary tracking-tight flex items-center gap-2">
            <Shield size={24} className="text-cyan" />
            Admin Dashboard
          </h1>
          <p className="text-dark-secondary text-sm mt-0.5">
            Platform overview and client management
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan/10 border border-cyan/20">
          <Award size={14} className="text-cyan" />
          <span className="text-xs font-medium text-cyan">Admin Access</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-navy border border-navy-border rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <s.icon size={18} className={s.color} />
            </div>
            <p className="text-2xl font-bold text-dark-primary font-mono">
              {s.value.toLocaleString()}
            </p>
            <p className="text-xs text-light-muted mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Client Status Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-navy border border-navy-border rounded-xl p-5"
      >
        <h3 className="text-sm font-semibold text-dark-primary mb-4">
          Client Status Overview
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-az-black-elevated">
            <p className="text-xl font-bold text-success">{stats.activeClients}</p>
            <p className="text-xs text-light-muted mt-0.5">Active</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-az-black-elevated">
            <p className="text-xl font-bold text-warning">{stats.pausedClients}</p>
            <p className="text-xs text-light-muted mt-0.5">On Hold</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-az-black-elevated">
            <p className="text-xl font-bold text-danger">{stats.inactiveClients}</p>
            <p className="text-xs text-light-muted mt-0.5">Inactive</p>
          </div>
        </div>
      </motion.div>

      {/* Open Alerts */}
      {stats.openAlerts > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-navy border border-navy-border rounded-xl p-5"
        >
          <h3 className="text-sm font-semibold text-dark-primary mb-2">
            Open Alerts
          </h3>
          <p className="text-2xl font-bold text-danger font-mono">{stats.openAlerts}</p>
          <p className="text-xs text-light-muted">Unresolved follow-ups requiring attention</p>
        </motion.div>
      )}

      {/* Clients Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-navy border border-navy-border rounded-xl overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-navy-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-dark-primary">
            All Clients ({clientList.length})
          </h3>
        </div>
        <div className="divide-y divide-dark-divider">
          {clientList.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/clients/${c.id}`)}
              className="px-5 py-3.5 flex items-center gap-4 hover:bg-az-black-elevated/50 transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan to-violet flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {c.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-dark-primary truncate">
                    {c.name}
                  </p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    c.status === 'active' ? 'bg-success/10 text-success' :
                    c.status === 'on-hold' ? 'bg-warning/10 text-warning' :
                    'bg-dark-subtle text-dark-muted'
                  }`}>
                    {c.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-light-muted">
                    {c.goal || 'No goal set'}
                  </span>
                  {c.email && (
                    <span className="text-xs text-dark-muted">
                      {c.email}
                    </span>
                  )}
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-6 text-xs text-light-muted">
                <div className="text-center">
                  <p className="font-semibold text-dark-primary">{c.age || '—'}</p>
                  <p className="text-[10px]">age</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-dark-primary">{c.weight ? `${c.weight} kg` : '—'}</p>
                  <p className="text-[10px]">weight</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-dark-primary">{c.bodyFat ? `${c.bodyFat}%` : '—'}</p>
                  <p className="text-[10px]">body fat</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-dark-muted flex-shrink-0" />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
