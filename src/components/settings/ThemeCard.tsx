import { CheckCircle2 } from 'lucide-react'

export function ThemeCard({
  icon: Icon,
  label,
  selected,
  onClick,
}: {
  icon: React.ElementType
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
        selected ? 'border-cyan bg-cyan-glow' : 'border-dark-border bg-az-black-elevated hover:border-dark-subtle'
      }`}
    >
      <Icon size={24} className={selected ? 'text-cyan' : 'text-dark-secondary'} />
      <span className={`text-sm ${selected ? 'text-cyan font-medium' : 'text-dark-secondary'}`}>{label}</span>
      {selected && <CheckCircle2 size={16} className="text-cyan absolute top-2 right-2" />}
    </button>
  )
}
