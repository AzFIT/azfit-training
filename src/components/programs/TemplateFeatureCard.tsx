import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import type { TemplateDef } from './types'

export function TemplateFeatureCard({
  template,
  isActive,
  onClick,
  count,
}: {
  template: TemplateDef
  isActive: boolean
  onClick: () => void
  count: number
}) {
  const colorHex = {
    'text-violet': '#8B5CF6',
    'text-orange': '#F97316',
    'text-danger': '#EF4444',
    'text-cyan': '#00AEEF',
    'text-success': '#22C55E',
    'text-warning': '#EAB308',
    'text-light-muted': '#94A3B8',
  }[template.color] || '#94A3B8'

  return (
    <motion.button
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative flex-shrink-0 w-[180px] rounded-xl border p-4 text-left transition-all',
        isActive
          ? `${template.bg} ${template.border} ring-1 ring-[${colorHex}]/40`
          : 'bg-white border-light-border hover:border-light-muted'
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${colorHex}20`, color: colorHex }}
        >
          {template.icon}
        </div>
        <span className="text-light-primary font-semibold text-sm">{template.label}</span>
      </div>
      <p className="text-light-muted text-[11px] leading-relaxed mb-2">{template.description}</p>
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] px-1.5 py-0.5 rounded font-medium"
          style={{ backgroundColor: `${colorHex}15`, color: colorHex }}
        >
          {template.focus}
        </span>
        <span className="text-light-muted text-[10px] font-mono">{count} programs</span>
      </div>
      {isActive && (
        <div
          className="absolute top-2 right-2 w-2 h-2 rounded-full"
          style={{ backgroundColor: colorHex }}
        />
      )}
    </motion.button>
  )
}
