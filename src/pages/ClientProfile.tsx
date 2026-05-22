/**
 * ClientProfile — Full client profile page with 7 sub-tabs.
 * Route: /trainer/client/:id
 * Tabs: Dashboard | BioPrint | Body Stats | Lifestyle | Notes | Sessions | Calendar
 */

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail, Edit, MessageCircle, CalendarPlus, TrendingUp,
  Activity, ClipboardList, PieChart, LineChart, StickyNote, CalendarDays
} from 'lucide-react';
import DashboardTab from './client-profile/DashboardTab';
import BioPrintTab from './client-profile/BioPrintTab';
import BodyStatsTab from './client-profile/BodyStatsTab';
import LifestyleTab from './client-profile/LifestyleTab';
import NotesTab from './client-profile/NotesTab';
import SessionsTab from './client-profile/SessionsTab';
import CalendarTab from './client-profile/CalendarTab';
import { type FullClientProfile, generateClientProfile } from '@/lib/client-data';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: Activity },
  { id: 'bioprint', label: 'BioPrint', icon: PieChart },
  { id: 'bodystats', label: 'Body Stats', icon: LineChart },
  { id: 'lifestyle', label: 'Lifestyle', icon: ClipboardList },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'sessions', label: 'Sessions', icon: TrendingUp },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
];

/** Get client profile — from store or generate demo data */
function useClientProfile(id: string): FullClientProfile {
  const idx = parseInt(id.replace(/\D/g, '')) || 0;
  return generateClientProfile(idx);
}

export default function ClientProfile() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('dashboard');
  const client = useClientProfile(id || '0');

  const quickStats = [
    { label: 'Age', value: `${client.age} yrs` },
    { label: 'Weight', value: `${client.weight} kg` },
    { label: 'Body Fat', value: `${client.bodyFatPercent}%` },
    { label: 'Compliance', value: `${client.complianceScore}%` },
  ];

  return (
    <div className="min-h-screen pb-24">
      {/* Client Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#141414] border-b border-gray-200 dark:border-white/5"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00AEEF] to-[#33BFF2] flex items-center justify-center text-white text-2xl font-bold shrink-0">
                {client.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{client.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <Mail className="w-3.5 h-3.5" /> {client.email}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                    {client.program}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    client.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {client.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <Edit className="w-4 h-4" /> Edit
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <MessageCircle className="w-4 h-4" /> Message
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00AEEF] to-[#33BFF2] text-white text-sm font-medium shadow-lg shadow-[#00AEEF]/25 hover:shadow-xl hover:shadow-[#00AEEF]/30 transition-shadow">
                <CalendarPlus className="w-4 h-4" /> New Session
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {quickStats.map((s) => (
              <div key={s.label} className="bg-gray-50 dark:bg-[#1A1A1A] rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{s.label}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white font-mono mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Sub-Tabs */}
          <div className="flex gap-1 mt-6 overflow-x-auto pb-1 -mb-px">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors ${
                    isActive
                      ? 'text-[#00AEEF]'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="profile-tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00AEEF] rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === 'dashboard' && <DashboardTab client={client} />}
          {activeTab === 'bioprint' && <BioPrintTab client={client} />}
          {activeTab === 'bodystats' && <BodyStatsTab client={client} />}
          {activeTab === 'lifestyle' && <LifestyleTab client={client} />}
          {activeTab === 'notes' && <NotesTab client={client} />}
          {activeTab === 'sessions' && <SessionsTab client={client} />}
          {activeTab === 'calendar' && <CalendarTab client={client} />}
        </motion.div>
      </div>
    </div>
  );
}
