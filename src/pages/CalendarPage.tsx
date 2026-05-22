/**
 * CalendarPage — Full scheduling with Week/Month/Day/Agenda views.
 * Route: /trainer/calendar
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { format, addWeeks, subWeeks, addMonths, subMonths, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarPlus, Filter } from 'lucide-react';
import WeekView from './calendar/WeekView';
import MonthView from './calendar/MonthView';
import DayView from './calendar/DayView';
import AgendaView from './calendar/AgendaView';
import EventDetailModal from './calendar/EventDetailModal';
import { useCalendarStore } from '@/stores/useCalendarStore';

type CalendarView = 'week' | 'month' | 'day' | 'agenda';

export default function CalendarPage() {
  const { events, selectedDate, setSelectedDate, viewMode, setViewMode } = useCalendarStore();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [clientFilter, setClientFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filtered = events.filter((e) => {
    if (clientFilter && !e.clientName?.toLowerCase().includes(clientFilter.toLowerCase()) && !e.title.toLowerCase().includes(clientFilter.toLowerCase())) return false;
    if (typeFilter && e.type !== typeFilter) return false;
    return true;
  });

  const selectedEvent = events.find((e) => e.id === selectedEventId) || null;

  const navigate = {
    week: { prev: () => setSelectedDate(format(subWeeks(new Date(selectedDate), 1), 'yyyy-MM-dd')), next: () => setSelectedDate(format(addWeeks(new Date(selectedDate), 1), 'yyyy-MM-dd')) },
    month: { prev: () => setSelectedDate(format(subMonths(new Date(selectedDate), 1), 'yyyy-MM-dd')), next: () => setSelectedDate(format(addMonths(new Date(selectedDate), 1), 'yyyy-MM-dd')) },
    day: { prev: () => setSelectedDate(format(subDays(new Date(selectedDate), 1), 'yyyy-MM-dd')), next: () => setSelectedDate(format(addDays(new Date(selectedDate), 1), 'yyyy-MM-dd')) },
    agenda: { prev: () => setSelectedDate(format(subWeeks(new Date(selectedDate), 1), 'yyyy-MM-dd')), next: () => setSelectedDate(format(addWeeks(new Date(selectedDate), 1), 'yyyy-MM-dd')) },
  };

  const views: { id: CalendarView; label: string }[] = [
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
    { id: 'day', label: 'Day' },
    { id: 'agenda', label: 'Agenda' },
  ];

  const dateDisplay = {
    week: `Week of ${format(new Date(selectedDate), 'MMM d, yyyy')}`,
    month: format(new Date(selectedDate), 'MMMM yyyy'),
    day: format(new Date(selectedDate), 'EEEE, MMM d, yyyy'),
    agenda: `From ${format(new Date(selectedDate), 'MMM d, yyyy')}`,
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-white dark:bg-[#141414] border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-2">
          {views.map((v) => (
            <button
              key={v.id}
              onClick={() => setViewMode(v.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                viewMode === v.id ? 'bg-[#00AEEF] text-white' : 'bg-gray-100 dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/5'
              }`}
            >{v.label}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={navigate[viewMode].prev} className="p-2 rounded-lg bg-gray-100 dark:bg-[#1A1A1A] hover:bg-gray-200 dark:hover:bg-white/5 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#1A1A1A] text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/5 transition-colors">
            Today
          </button>
          <button onClick={navigate[viewMode].next} className="p-2 rounded-lg bg-gray-100 dark:bg-[#1A1A1A] hover:bg-gray-200 dark:hover:bg-white/5 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white ml-3 min-w-[180px]">{dateDisplay[viewMode]}</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input type="text" placeholder="Search..." value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}
              className="pl-8 pr-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1A1A1A] text-sm focus:border-[#00AEEF] outline-none w-40" />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1A1A1A] text-sm">
            <option value="">All Types</option>
            <option value="session">Session</option>
            <option value="assessment">Assessment</option>
            <option value="follow-up">Follow-up</option>
            <option value="personal">Personal</option>
          </select>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00AEEF] to-[#33BFF2] text-white text-sm font-medium shadow-lg shadow-[#00AEEF]/25">
            <CalendarPlus className="w-4 h-4" /> New Session
          </button>
        </div>
      </div>

      {/* Calendar Views */}
      <div className="flex-1 overflow-auto p-4">
        {viewMode === 'week' && <WeekView events={filtered} selectedDate={selectedDate} onEventClick={setSelectedEventId} />}
        {viewMode === 'month' && <MonthView events={filtered} selectedDate={selectedDate} onEventClick={setSelectedEventId} onDayClick={(d) => { setSelectedDate(d); setViewMode('day'); }} />}
        {viewMode === 'day' && <DayView events={filtered} selectedDate={selectedDate} onEventClick={setSelectedEventId} />}
        {viewMode === 'agenda' && <AgendaView events={filtered} selectedDate={selectedDate} onEventClick={setSelectedEventId} />}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal event={selectedEvent} onClose={() => setSelectedEventId(null)} />
      )}
    </motion.div>
  );
}
