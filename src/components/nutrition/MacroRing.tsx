import { useState, useEffect } from 'react'

export default function MacroRing({
  label,
  grams,
  percentage,
  color,
  unit,
  delay = 0,
}: {
  label: string
  grams: number
  percentage: number
  color: string
  unit: string
  delay?: number
}) {
  const [animated, setAnimated] = useState(false)
  const clampedPct = Math.min(Math.max(percentage, 0), 100)

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  const circumference = 2 * Math.PI * 45
  const offset = circumference - (animated ? clampedPct / 100 : 0) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[100px] h-[100px]">
        <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
          <circle cx="50" cy="50" r="45" fill="none" stroke="dark-border" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-dark-primary text-base font-bold font-mono">{Math.round(clampedPct)}%</span>
          <span className="text-dark-muted text-[10px]">{Math.round(grams)}{unit}</span>
        </div>
      </div>
      <p className="text-dark-secondary text-xs mt-2 font-medium">{label}</p>
      <p className="text-dark-muted text-[10px] font-mono">
        {Math.round(grams * (unit === 'g' ? 4 : 1))} kcal
      </p>
    </div>
  )
}
