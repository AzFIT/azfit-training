import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CalendarViewMode = 'week' | 'month' | 'day' | 'agenda';

export interface CalendarEvent {
  id: string;
  title: string;
  clientId?: string;
  clientName?: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'session' | 'assessment' | 'follow-up' | 'personal';
  notes?: string;
  color?: string;
}

interface DragState {
  eventId: string | null;
  sourceDate: string | null;
}

interface CalendarState {
  events: CalendarEvent[];
  selectedDate: string;
  viewMode: CalendarViewMode;
  dragState: DragState;
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (id: string, data: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  setEvents: (events: CalendarEvent[]) => void;
  setViewMode: (mode: CalendarViewMode) => void;
  setSelectedDate: (date: string) => void;
  moveEvent: (eventId: string, newDate: string) => void;
  setDragState: (state: DragState) => void;
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set) => ({
      events: [],
      selectedDate: new Date().toISOString().split('T')[0],
      viewMode: 'week',
      dragState: { eventId: null, sourceDate: null },

      addEvent: (event: CalendarEvent) =>
        set((s) => ({ events: [...s.events, event] })),

      updateEvent: (id: string, data: Partial<CalendarEvent>) =>
        set((s) => ({
          events: s.events.map((e) => (e.id === id ? { ...e, ...data } : e)),
        })),

      deleteEvent: (id: string) =>
        set((s) => ({ events: s.events.filter((e) => e.id !== id) })),

      setEvents: (events: CalendarEvent[]) => set({ events }),

      setViewMode: (mode: CalendarViewMode) => set({ viewMode: mode }),
      setSelectedDate: (date: string) => set({ selectedDate: date }),

      moveEvent: (eventId: string, newDate: string) =>
        set((s) => ({
          events: s.events.map((e) =>
            e.id === eventId ? { ...e, date: newDate } : e
          ),
        })),

      setDragState: (state: DragState) => set({ dragState: state }),
    }),
    {
      name: 'azfit-calendar',
      partialize: (state) => ({
        events: state.events,
        selectedDate: state.selectedDate,
        viewMode: state.viewMode,
      }),
    }
  )
);
