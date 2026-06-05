import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'trainer' | 'client' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
}

interface Client {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'active' | 'inactive';
  joinDate: string;
  lastSession: string;
  progress: number;
}

interface CalendarEvent {
  id: string;
  title: string;
  clientId?: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'session' | 'assessment' | 'follow-up' | 'personal';
  notes?: string;
}

interface AuthState {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  clients: Client[];
  events: CalendarEvent[];
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  setRole: (role: UserRole) => void;
  toggleDemoMode: () => void;
  generateSyntheticData: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const generateSyntheticClients = (): Client[] => {
  const firstNames = ['Sarah', 'Marcus', 'David', 'Jane', 'Michael', 'Emma', 'James', 'Lisa', 'Robert', 'Anna', 'John', 'Maria'];
  const lastNames = ['Chen', 'Tan', 'Lim', 'Wong', 'Lee', 'Ng', 'Koh', 'Ong', 'Goh', 'Chua'];
  const statuses: ('active' | 'inactive')[] = ['active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active', 'inactive', 'active', 'active'];

  return Array.from({ length: 12 }, (_, i) => ({
    id: generateId(),
    name: `${firstNames[i]} ${lastNames[i]}`,
    email: `${firstNames[i].toLowerCase()}.${lastNames[i].toLowerCase()}@email.com`,
    status: statuses[i],
    joinDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lastSession: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    progress: Math.floor(Math.random() * 40) + 60,
  }));
};

const generateSyntheticEvents = (): CalendarEvent[] => {
  const titles = ['Upper Body Session', 'Lower Body Strength', 'Cardio & Core', 'BioPrint Assessment', 'Program Review', 'Nutrition Check-in'];
  const types: CalendarEvent['type'][] = ['session', 'session', 'session', 'assessment', 'follow-up', 'follow-up'];
  const events: CalendarEvent[] = [];

  for (let day = 0; day < 30; day++) {
    const date = new Date();
    date.setDate(date.getDate() - day);
    const dateStr = date.toISOString().split('T')[0];
    const numEvents = Math.floor(Math.random() * 3) + 1;

    for (let e = 0; e < numEvents; e++) {
      const hour = 9 + Math.floor(Math.random() * 10);
      events.push({
        id: generateId(),
        title: titles[Math.floor(Math.random() * titles.length)],
        clientId: generateId(),
        date: dateStr,
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        type: types[Math.floor(Math.random() * types.length)],
      });
    }
  }

  return events;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      isAuthenticated: false,
      isDemoMode: false,
      clients: [],
      events: [],

      login: async (email: string, _password: string, role: UserRole) => {
        const mockUser: User = {
          id: generateId(),
          email,
          name: role === 'trainer' ? 'Trainer User' : 'Client User',
          role,
        };
        set({ user: mockUser, role, isAuthenticated: true });
        return true;
      },

      logout: () => {
        set({ user: null, role: null, isAuthenticated: false, isDemoMode: false, clients: [], events: [] });
        localStorage.removeItem('azfit_demo_mode');
      },

      setRole: (role: UserRole) => set({ role }),

      toggleDemoMode: () => {
        const { isDemoMode } = get();
        const newMode = !isDemoMode;
        set({ isDemoMode: newMode });
        if (newMode) {
          get().generateSyntheticData();
        }
      },

      generateSyntheticData: () => {
        const clients = generateSyntheticClients();
        const events = generateSyntheticEvents();
        set({ clients, events, isDemoMode: true });
        localStorage.setItem('azfit_demo_mode', 'true');
      },
    }),
    {
      name: 'azfit-auth',
      partialize: (state) => ({ user: state.user, role: state.role, isAuthenticated: state.isAuthenticated, isDemoMode: state.isDemoMode }),
    }
  )
);
