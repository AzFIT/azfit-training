import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'

const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number]

/* ── Ring Animation Hook ─────────────────────────────── */
function useRingAnimation(targetPercent: number, delay: number = 0) {
  const [percent, setPercent] = useState(0)
  const [dotVisible, setDotVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDotVisible(targetPercent > 0)
      const startTime = performance.now()
      const duration = 1000
      function step(now: number) {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        const current = Math.round(eased * targetPercent)
        setPercent(current)
        if (progress < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, delay)
    return () => clearTimeout(timer)
  }, [targetPercent, delay])

  return { percent, dotVisible }
}

/* ── Conic Ring ──────────────────────────────────────── */
function ConicRing({
  percent,
  color,
  size = 64,
  dotVisible = false,
  children,
}: {
  percent: number
  color: string
  size?: number
  dotVisible?: boolean
  children?: React.ReactNode
}) {
  const isDark = typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : true
  const trackColor = isDark ? '#1E293B' : '#E2E8F0'
  const isComplete = percent >= 100

  const angle = (percent / 100) * 360
  const maskInset = Math.max(5, Math.round(size * 0.11))
  const dotSize = Math.max(6, Math.round(size * 0.14))
  const radius = size / 2 - maskInset / 2

  return (
    <div
      className="relative flex items-center justify-center flex-shrink-0 group"
      style={{ width: size, height: size }}
      title={`${Math.round(percent)}% complete`}
      role="img"
      aria-label={`Progress ring at ${Math.round(percent)} percent`}
    >
      {/* Progress trail */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(${color} ${percent}%, ${trackColor} 0%)`,
          boxShadow: `0 0 8px ${color}26, inset 0 0 12px rgba(0,0,0,0.15)`,
        }}
      />
      {/* Inner mask — donut hole */}
      <div
        className="absolute rounded-full bg-white dark:bg-navy"
        style={{
          top: maskInset, left: maskInset, right: maskInset, bottom: maskInset,
          boxShadow: isComplete
            ? `inset 0 0 20px ${color}40, 0 0 30px ${color}30, inset 0 0 8px ${color}20`
            : 'inset 0 2px 6px rgba(0,0,0,0.15), 0 1px 2px rgba(255,255,255,0.05)',
          transition: 'box-shadow 0.6s ease',
        }}
      />
      {/* 100% glow */}
      {isComplete && (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            top: maskInset - 1, left: maskInset - 1, right: maskInset - 1, bottom: maskInset - 1,
            boxShadow: `inset 0 0 20px ${color}40, 0 0 24px ${color}20`,
            transition: 'opacity 0.8s ease',
            opacity: dotVisible ? 1 : 0,
          }}
        />
      )}
      {/* End-cap dot */}
      <div
        className="absolute top-1/2 left-1/2 rounded-full transition-opacity duration-300"
        style={{
          width: dotSize, height: dotSize,
          marginTop: -dotSize / 2, marginLeft: -dotSize / 2,
          background: color,
          boxShadow: `0 0 6px ${color}, 0 0 12px ${color}66`,
          transform: `rotate(${angle}deg) translateY(-${radius}px)`,
          opacity: dotVisible && percent > 0 ? 1 : 0,
        }}
      />
      {/* Center content */}
      <div className="relative z-10 text-center">{children}</div>
    </div>
  )
}

/* ── Status Segment Bar ──────────────────────────────── */
function StatusSegmentBar({ active, paused, archived }: { active: number; paused: number; archived: number }) {
  const total = active + paused + archived
  if (total === 0) return null
  return (
    <div className="flex items-center gap-2.5 text-[10px]">
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-success" />
        <span className="text-gray-500 dark:text-light-muted">{active}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-warning" />
        <span className="text-gray-500 dark:text-light-muted">{paused}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-danger" />
        <span className="text-gray-500 dark:text-light-muted">{archived}</span>
      </div>
    </div>
  )
}

/* ── Ring Metric Card ────────────────────────────────── */
interface RingMetricCardProps {
  ringPercent: number
  ringColor: string
  ringValue: React.ReactNode
  label: string
  value: string
  delta: string
  deltaColor?: string
  extra?: React.ReactNode
  delay?: number
  hideValue?: boolean
  onToggleHide?: () => void
}

export default function RingMetricCard({
  ringPercent,
  ringColor,
  ringValue,
  label,
  value,
  delta,
  deltaColor = 'success',
  extra,
  delay = 0,
  hideValue = false,
  onToggleHide,
}: RingMetricCardProps) {
  const { percent, dotVisible } = useRingAnimation(ringPercent, delay)
  const [ringSize, setRingSize] = useState(64)

  useEffect(() => {
    function update() {
      const w = window.innerWidth
      setRingSize(w < 640 ? 56 : w < 1024 ? 72 : w < 1400 ? 64 : 72)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const fontSize = Math.max(11, Math.round(ringSize * 0.22))

  const deltaColorMap: Record<string, string> = {
    success: '#22C55E',
    warning: '#EAB308',
    danger: '#EF4444',
    cyan: '#00AEEF',
  }
  const resolvedDeltaColor = deltaColorMap[deltaColor] || deltaColor

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: easeOut }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="rounded-xl border border-gray-200 dark:border-navy-border bg-white dark:bg-navy relative overflow-hidden group hover:border-cyan/20 hover:shadow-[0_4px_24px_rgba(0,174,239,0.08)] transition-all duration-200"
      style={{
        background: 'linear-gradient(135deg, rgba(0,174,239,0.06) 0%, rgba(139,92,246,0.03) 100%)',
      }}
    >
      <div className="flex flex-col items-center text-center gap-2 p-3 sm:flex-row sm:items-center sm:text-left sm:gap-3.5 sm:p-4">
        <ConicRing percent={percent} color={ringColor} size={ringSize} dotVisible={dotVisible}>
          <span className="font-bold text-gray-900 dark:text-light-hover" style={{ fontSize, lineHeight: 1.1 }}>
            {ringValue}
          </span>
        </ConicRing>
        <div className="flex-1 min-w-0">
          <p className="text-gray-500 dark:text-light-muted font-medium uppercase tracking-wider text-[9px] sm:text-[10px] xl:text-[11px]">
            {label}
          </p>
          <div className="flex items-center gap-2 mt-0.5 justify-center sm:justify-start">
            <span className="font-bold text-gray-900 dark:text-light-hover text-base sm:text-lg xl:text-xl" style={{ fontFamily: 'Inter, sans-serif' }}>
              {hideValue ? '••••' : value}
            </span>
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${resolvedDeltaColor}20`, color: resolvedDeltaColor }}
            >
              {delta}
            </span>
          </div>
          {extra && <div className="mt-1">{extra}</div>}
        </div>
      </div>
      {onToggleHide && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleHide() }}
          className="absolute top-2 right-2 p-1 rounded text-gray-400 dark:text-dark-muted hover:text-gray-500 dark:hover:text-light-muted transition-colors"
        >
          {hideValue ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      )}
    </motion.div>
  )
}

export { StatusSegmentBar }
