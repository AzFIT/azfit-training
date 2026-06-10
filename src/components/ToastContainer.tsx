import { motion, AnimatePresence } from 'framer-motion'
import { X, Dumbbell, Utensils, Trophy, Droplets, Bell } from 'lucide-react'
import type { ToastMessage } from '../services/notificationService'

const typeConfig = {
  workout: { icon: Dumbbell, color: 'text-cyan', bg: 'bg-cyan/10', border: 'border-cyan/30' },
  meal: { icon: Utensils, color: 'text-success', bg: 'bg-success/10', border: 'border-success/30' },
  pr: { icon: Trophy, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' },
  water: { icon: Droplets, color: 'text-info', bg: 'bg-info/10', border: 'border-info/30' },
  system: { icon: Bell, color: 'text-dark-secondary', bg: 'bg-dark-hover', border: 'border-dark-border' },
}

interface ToastContainerProps {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const cfg = typeConfig[toast.type] || typeConfig.system
          const Icon = cfg.icon

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              className={`pointer-events-auto w-72 bg-az-black-card border ${cfg.border} rounded-xl p-3 shadow-lg`}
            >
              <div className="flex items-start gap-2">
                <div className={`mt-0.5 ${cfg.color}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold ${cfg.color}`}>{toast.title}</p>
                  <p className="text-dark-secondary text-[11px] mt-0.5 leading-relaxed">{toast.body}</p>
                </div>
                <button
                  onClick={() => onDismiss(toast.id)}
                  className="text-dark-muted hover:text-dark-primary transition-colors flex-shrink-0"
                >
                  <X size={12} />
                </button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
