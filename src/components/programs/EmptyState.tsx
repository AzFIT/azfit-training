import { motion } from 'framer-motion'
import { Dumbbell, Zap } from 'lucide-react'

export function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan/20 to-violet/10 flex items-center justify-center mb-4 border border-cyan/20">
        <Dumbbell size={28} className="text-cyan" />
      </div>
      <h3 className="text-light-primary font-semibold text-lg mb-1">No Active Programs</h3>
      <p className="text-light-muted text-sm max-w-sm mb-6">
        Create your first program using the All-in-One Program Creator and assign it to a client.
      </p>
      <button
        onClick={onCreate}
        className="bg-gradient-to-r from-cyan to-violet text-white font-semibold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
      >
        <Zap size={16} />
        Create New Program
      </button>
    </motion.div>
  )
}
