import { motion } from 'framer-motion'

export function StatCard({
  icon: Icon,
  label,
  value,
  color,
  delay,
}: {
  icon: React.ElementType
  label: string
  value: string
  color: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="flex items-center gap-3"
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-light-primary font-semibold text-lg leading-tight truncate font-mono">
          {value}
        </p>
        <p className="text-light-muted text-xs truncate">{label}</p>
      </div>
    </motion.div>
  )
}
