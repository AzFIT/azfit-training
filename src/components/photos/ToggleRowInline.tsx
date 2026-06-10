export default function ToggleRowInline({
  title,
  icon,
  checked,
  onChange,
}: {
  title: string
  icon: React.ReactNode
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all ${
        checked ? 'border-cyan bg-cyan-glow' : 'border-dark-border bg-az-black-elevated'
      }`}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-dark-primary text-xs">{title}</span>
      </div>
      <div className={`w-8 h-4 rounded-full relative transition-colors ${checked ? 'bg-cyan' : 'bg-dark-border'}`}>
        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${checked ? 'right-0.5' : 'left-0.5'}`} />
      </div>
    </button>
  )
}
