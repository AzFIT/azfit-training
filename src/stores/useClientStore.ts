import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Client {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'active' | 'inactive';
  joinDate: string;
  lastSession: string;
  progress: number;
}

interface ClientState {
  clients: Client[];
  selectedClientId: string | null;
  selectedClients: { id: string; name: string }[];
  loading: boolean;
  setClients: (clients: Client[]) => void;
  selectClient: (id: string | null) => void;
  openClientTab: (id: string, name: string) => void;
  closeClientTab: (id: string) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  get selectedClient(): Client | null;
  get sortedClients(): Client[];
  get filteredClients(): (query: string) => Client[];
}

export const useClientStore = create<ClientState>()(
  persist(
    (set, get) => ({
      clients: [],
      selectedClientId: null,
      selectedClients: [],
      loading: false,

      setClients: (clients: Client[]) => set({ clients }),

      selectClient: (id: string | null) => set({ selectedClientId: id }),

      openClientTab: (id: string, name: string) => {
        const { selectedClients } = get();
        if (!selectedClients.find((c) => c.id === id)) {
          set({ selectedClients: [...selectedClients, { id, name }] });
        }
        set({ selectedClientId: id });
      },

      closeClientTab: (id: string) => {
        const { selectedClients, selectedClientId } = get();
        const newTabs = selectedClients.filter((c) => c.id !== id);
        set({
          selectedClients: newTabs,
          selectedClientId: selectedClientId === id ? (newTabs[0]?.id ?? null) : selectedClientId,
        });
      },

      updateClient: (id: string, data: Partial<Client>) => {
        const { clients } = get();
        set({
          clients: clients.map((c) => (c.id === id ? { ...c, ...data } : c)),
        });
      },

      get selectedClient() {
        const { clients, selectedClientId } = get();
        return clients.find((c) => c.id === selectedClientId) ?? null;
      },

      get sortedClients() {
        const { clients } = get();
        return [...clients].sort((a, b) => a.name.localeCompare(b.name));
      },

      get filteredClients() {
        const { clients } = get();
        return (query: string) => {
          if (!query.trim()) return clients;
          const q = query.toLowerCase();
          return clients.filter(
            (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
          );
        };
      },
    }),
    {
      name: 'azfit-clients',
      partialize: (state) => ({
        clients: state.clients,
        selectedClientId: state.selectedClientId,
        selectedClients: state.selectedClients,
      }),
    }
  )
);
