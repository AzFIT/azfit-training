import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppDataStore } from '../../../stores/useAppDataStore';

export default function CalendarView() {
  const { id: clientId } = useParams<{ id: string }>();
  const { sessions } = useAppDataStore();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const clientSessions = clientId
    ? Object.values(sessions).filter((s) => s.clientId === clientId)
    : [];
  const sessionDates = new Set(
    clientSessions.map((s) => {
      const d = new Date(s.date);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    })
  );
  const isToday = (d: number) => d === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
  const hasSession = (d: number) => sessionDates.has(`${String(d).padStart(2, '0')}/${String(currentMonth + 1).padStart(2, '0')}/${currentYear}`);

  return (
    <div className="bg-[az-black-card] border border-dark-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); } else setCurrentMonth(currentMonth - 1); }}
          className="w-8 h-8 rounded-lg bg-[az-black-elevated] hover:bg-dark-hover flex items-center justify-center text-dark-secondary transition-colors">
          <ChevronLeft size={16} />
        </button>
        <h3 className="text-base font-semibold text-dark-primary">{monthNames[currentMonth]} {currentYear}</h3>
        <button onClick={() => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); } else setCurrentMonth(currentMonth + 1); }}
          className="w-8 h-8 rounded-lg bg-[az-black-elevated] hover:bg-dark-hover flex items-center justify-center text-dark-secondary transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((d) => (<div key={d} className="text-center text-xs text-dark-muted font-semibold py-2">{d}</div>))}
        {Array.from({ length: adjustedFirstDay }, (_, i) => (<div key={`empty-${i}`} />))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d = i + 1;
          const t = isToday(d);
          const s = hasSession(d);
          const cls = t
            ? 'bg-cyan-glow text-cyan border border-cyan'
            : s
              ? 'bg-[az-black-elevated] text-dark-primary hover:bg-dark-hover'
              : 'text-dark-secondary hover:bg-[az-black-elevated]';
          return (
            <div key={d} className={'aspect-square rounded-lg flex flex-col items-center justify-center relative text-sm font-medium transition-colors cursor-pointer ' + cls}>
              {d}
              {s && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-cyan" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
