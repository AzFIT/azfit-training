export function SegmentedControl({
  options,
  value,
  onChange,
  disabled,
}: {
  options: string[]
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  return (
    <div className={`inline-flex bg-[az-black-elevated] rounded-lg p-0.5 border border-dark-border ${disabled ? 'opacity-50' : ''}`}>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => !disabled && onChange(opt)}
          className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
            value === opt
              ? 'bg-dark-hover text-cyan font-medium'
              : 'text-dark-secondary hover:text-dark-primary'
          }`}
          disabled={disabled}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
