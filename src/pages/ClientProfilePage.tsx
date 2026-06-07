import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scale, CalendarPlus, MessageSquare, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { tabsConfig, type TabKey } from '../components/clientProfile/tabsConfig';
import {
  DashboardTab, BioPrintTab, BodyStatsTab, RecordsTab, NotesTab, SessionsTab,
  CalendarView, ProgramsTab, DietTab, LifestyleTab, DatabaseTab, GoalsTab, PhotosTab,
} from '../components/clientProfile/tabs';
import { useAppDataStore } from '../stores/useAppDataStore';
import { useSyncWorkoutSessions } from '../hooks/useWorkoutSync';

const TAB_COMPONENTS: Record<TabKey, React.ComponentType> = {
  dashboard: DashboardTab,
  bioprint: BioPrintTab,
  bodystats: BodyStatsTab,
  records: RecordsTab,
  notes: NotesTab,
  sessions: SessionsTab,
  calendar: CalendarView,
  programs: ProgramsTab,
  diet: DietTab,
  lifestyle: LifestyleTab,
  database: DatabaseTab,
  goals: GoalsTab,
  photos: PhotosTab,
};

export default function ClientProfilePage() {
  const navigate = useNavigate();
  const { id: clientId } = useParams<{ id: string }>();
  const { clients, workoutSessions } = useAppDataStore();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const tabBarRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  useSyncWorkoutSessions(clientId);

  const clientData = clientId ? clients[clientId] : null;
  const sessionCount = clientId
    ? Object.values(workoutSessions).filter((s) => s.clientId === clientId).length
    : 0;

  const checkOverflow = useCallback(() => {
    const el = tabBarRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 10);
    setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = tabBarRef.current;
    if (!el) return;
    checkOverflow();
    el.addEventListener('scroll', checkOverflow);
    window.addEventListener('resize', checkOverflow);
    return () => {
      el.removeEventListener('scroll', checkOverflow);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [checkOverflow]);

  const scrollTabs = (dir: 'left' | 'right') => {
    const el = tabBarRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
  };

  const ActiveTabComponent = TAB_COMPONENTS[activeTab] || DashboardTab;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="space-y-0"
    >
      {/* Client Header Bar */}
      <div className="bg-[#141414] border-b border-dark-border px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Left: Avatar + Name */}
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <img src={clientData?.avatar || '/avatar-placeholder.jpg'} alt={clientData?.name || 'Client'} className="w-14 h-14 rounded-full object-cover border-2 border-success" />
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-success border-2 border-[#141414]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-dark-primary">{clientData?.name || 'Unknown Client'}</h1>
                <span className="text-xs px-2 py-0.5 rounded-full text-success bg-[rgba(34,197,94,0.1)] font-semibold">{clientData?.status || 'Active'}</span>
              </div>
              <p className="text-xs text-dark-muted font-mono">{clientData?.id ? `#CLT-${clientData.id.slice(-4).toUpperCase()}` : ''}</p>
            </div>
          </div>

          {/* Center: Quick Stats */}
          <div className="flex items-center gap-3 sm:gap-5 flex-wrap sm:flex-1 sm:justify-center">
            {[
              { label: `${clientData?.age || '--'}${clientData ? (clientData.goal || '').charAt(0).toUpperCase() : 'F'}`, value: 'Age/Sex' },
              { label: `${clientData?.weight || '--'} kg`, value: 'Weight' },
              { label: `${clientData?.bodyFat || '--'}%`, value: 'Body Fat' },
              { label: `${sessionCount} total`, value: 'Sessions' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-3">
                {i > 0 && <div className="hidden sm:block w-px h-6 bg-dark-border" />}
                <div className="text-center sm:text-left">
                  <p className="text-sm text-dark-primary font-mono font-semibold">{stat.label}</p>
                  <p className="text-xs text-dark-muted">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => navigate(`/clients/${clientId}/progress`)} className="flex items-center gap-1.5 text-dark-secondary hover:text-dark-primary hover:bg-dark-hover px-3 py-2 rounded-lg text-sm transition-colors">
              <Scale size={14} /> <span className="hidden sm:inline">Progress</span>
            </button>
            <button className="flex items-center gap-1.5 bg-cyan hover:bg-cyan-hover text-white px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]">
              <CalendarPlus size={14} /> <span className="hidden sm:inline">Book</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-dark-secondary hover:text-dark-primary hover:bg-dark-hover rounded-lg transition-colors">
              <MessageSquare size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-dark-secondary hover:text-dark-primary hover:bg-dark-hover rounded-lg transition-colors">
              <MoreVertical size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-[#0A0A0A] border-b border-dark-divider relative">
        {showLeftArrow && (
          <button onClick={() => scrollTabs('left')} className="absolute left-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-r from-[#0A0A0A] to-transparent flex items-center justify-center text-dark-secondary hover:text-dark-primary">
            <ChevronLeft size={16} />
          </button>
        )}
        {showRightArrow && (
          <button onClick={() => scrollTabs('right')} className="absolute right-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-l from-[#0A0A0A] to-transparent flex items-center justify-center text-dark-secondary hover:text-dark-primary">
            <ChevronRight size={16} />
          </button>
        )}
        <div ref={tabBarRef} className="flex gap-1 px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {tabsConfig.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0
                  ${isActive ? 'bg-[#141414] text-dark-primary border border-dark-border' : 'text-dark-muted hover:text-dark-secondary hover:bg-dark-hover border border-transparent'}`}
                style={isActive ? { borderLeft: '3px solid #00AEEF' } : undefined}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <ActiveTabComponent />
        </motion.div>
      </div>
    </motion.div>
  );
}
