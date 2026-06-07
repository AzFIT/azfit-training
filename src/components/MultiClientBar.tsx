/**
 * MultiClientBar — Horizontal tab bar for managing multiple open client profiles.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, MessageCircle, BarChart3, CalendarPlus, Layers } from 'lucide-react';
import { useClientStore } from '@/stores/useClientStore';

export default function MultiClientBar() {
  const { selectedClients, selectedClientId, selectClient, closeClientTab } = useClientStore();
  const [compareMode, setCompareMode] = useState(false);

  if (selectedClients.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[90] bg-white/90 dark:bg-[az-black-card]/90 backdrop-blur-lg border-t border-gray-200 dark:border-white/5 shadow-lg">
      {/* Utility Bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 dark:border-white/5">
        <Layers className="w-4 h-4 text-cyan" />
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Open Clients</span>
        <div className="flex-1" />
        <button
          onClick={() => setCompareMode(!compareMode)}
          className={`text-xs px-3 py-1 rounded-full transition-colors ${compareMode ? 'bg-cyan text-white' : 'bg-gray-100 dark:bg-[az-black-elevated] text-gray-600 dark:text-gray-400'}`}
        >
          Compare
        </button>
        <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500">
          <MessageCircle className="w-3.5 h-3.5" />
        </button>
        <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500">
          <BarChart3 className="w-3.5 h-3.5" />
        </button>
        <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500">
          <CalendarPlus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Client Tabs */}
      <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto">
        {selectedClients.map((client) => {
          const isActive = selectedClientId === client.id;
          return (
            <motion.div
              key={client.id}
              layout
              onClick={() => selectClient(client.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors shrink-0 ${
                isActive
                  ? 'bg-cyan/10 text-cyan border border-cyan/20'
                  : 'bg-gray-50 dark:bg-[az-black-elevated] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${isActive ? 'bg-cyan' : 'bg-gray-400'}`}>
                {client.name.charAt(0)}
              </div>
              <span className="text-xs font-medium whitespace-nowrap max-w-[100px] truncate">{client.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); closeClientTab(client.id); }}
                className="p-0.5 rounded hover:bg-white/20 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
