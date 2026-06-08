import { motion } from 'framer-motion'

type Status = 'active' | 'paused' | 'archived'

interface ClientStatusBadgeProps {
  status: Status
  size?: 'sm' | 'md'
}

const STATUS_CONFIG: Record<Status, { label: string; dot: string; bg: string; text: string }> = {
  active: {
    label: 'Active',
    dot: 'bg-success',
    bg: 'bg-success/10',
    text: 'text-success',
  },
  paused: {
    label: 'Paused',
    dot: 'bg-warning',
    bg: 'bg-warning/10',
    text: 'text-warning',
  },
  archived: {
    label: 'Archived',
    dot: 'bg-danger',
    bg: 'bg-danger/10',
    text: 'text-danger',
  },
}

export default function ClientStatusBadge({ status, size = 'sm' }: ClientStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  const isSm = size === 'sm'

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bg} ${config.text} ${isSm ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'}`}
    >
      <span className={`rounded-full ${config.dot} ${isSm ? 'w-1.5 h-1.5' : 'w-2 h-2'}`} />
      {config.label}
    </motion.span>
  )
}
