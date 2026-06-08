import { motion } from 'framer-motion'
import { Users, Dumbbell, CalendarPlus, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function EmptyDashboard() {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {/* SVG Illustration */}
      <div className="relative w-48 h-48 mb-8">
        <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Background circle */}
          <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="1" className="text-cyan/10" />
          <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan/5" />
          {/* Central figure */}
          <circle cx="100" cy="75" r="18" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan/40" />
          <path d="M70 160 Q100 110 130 160" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-cyan/40" />
          <line x1="82" y1="95" x2="60" y2="130" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-cyan/30" />
          <line x1="118" y1="95" x2="140" y2="130" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-cyan/30" />
          {/* Floating elements */}
          <motion.g
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <circle cx="45" cy="55" r="8" fill="currentColor" className="text-success/20" />
          </motion.g>
          <motion.g
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          >
            <rect x="155" y="45" width="14" height="14" rx="3" fill="currentColor" className="text-violet/20" transform="rotate(15 162 52)" />
          </motion.g>
          <motion.g
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          >
            <polygon points="35,130 42,118 49,130" fill="currentColor" className="text-warning/20" />
          </motion.g>
          <motion.g
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          >
            <circle cx="165" cy="140" r="6" fill="currentColor" className="text-cyan/15" />
          </motion.g>
        </svg>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 dark:text-light-hover mb-2">
        Welcome to AzFIT
      </h3>
      <p className="text-gray-500 dark:text-light-muted max-w-sm mb-8 text-sm leading-relaxed">
        Your dashboard is empty. Start by adding your first client or creating a workout program to see your metrics come to life.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate('/clients')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-cyan text-white font-medium text-sm hover:bg-cyan/90 transition-colors shadow-lg shadow-cyan/20"
        >
          <Users size={16} />
          Add Your First Client
          <ArrowRight size={14} />
        </button>
        <button
          onClick={() => navigate('/programs')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 dark:border-navy-border text-gray-700 dark:text-light font-medium text-sm hover:bg-gray-50 dark:hover:bg-navy-border/50 transition-colors"
        >
          <Dumbbell size={16} />
          Create a Program
        </button>
      </div>

      <div className="mt-8 flex items-center gap-6 text-xs text-gray-400 dark:text-dark-muted">
        <div className="flex items-center gap-1.5">
          <CalendarPlus size={12} />
          <span>Schedule sessions</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users size={12} />
          <span>Track progress</span>
        </div>
      </div>
    </motion.div>
  )
}
