import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ProfileTab,
  AppearanceTab,
  NotificationsTab,
  SecurityTab,
  DataTab,
  sections,
  ease,
  type SectionId,
} from '@/components/settings'

export default function SettingsPage() {
  const [active, setActive] = useState<SectionId>('profile')

  const renderSection = () => {
    switch (active) {
      case 'profile': return <ProfileTab />
      case 'appearance': return <AppearanceTab />
      case 'notifications': return <NotificationsTab />
      case 'security': return <SecurityTab />
      case 'data': return <DataTab />
      default: return <ProfileTab />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease }}
      className="flex flex-col lg:flex-row gap-6"
    >
      {/* Settings Sidebar */}
      <aside className="lg:w-[200px] flex-shrink-0">
        <div className="lg:sticky lg:top-4 bg-[az-black-card] border border-dark-border rounded-xl overflow-hidden">
          <nav className="py-2">
            {sections.map((s) => {
              const Icon = s.icon
              const isActive = active === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`w-full flex items-center gap-3 h-10 px-4 text-sm transition-all duration-200 relative ${
                    isActive
                      ? 'text-cyan font-medium'
                      : 'text-dark-secondary hover:text-dark-primary hover:bg-dark-hover'
                  }`}
                  style={isActive ? { background: 'rgba(0,174,239,0.08)', borderLeft: '3px solid cyan' } : { borderLeft: '3px solid transparent' }}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <span>{s.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Settings Content */}
      <main className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, ease }}
          >
            <h2 className="text-dark-primary text-2xl font-semibold mb-6">
              {sections.find((s) => s.id === active)?.label} Settings
            </h2>
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </main>
    </motion.div>
  )
}
