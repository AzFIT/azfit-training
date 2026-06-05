import { useState, useMemo } from 'react'
import { Eye, EyeOff } from 'lucide-react'

/* ── Types ────────────────────────────────────────────── */

export type MetricCardData =
  | { kind: 'sessions'; percent: number; booked: number; total: number; delta: number }
  | { kind: 'clients'; total: number; engaged: number; moderate: number; atRisk: number; delta: number }
  | { kind: 'adherence'; percent: number; label: string; delta: number }
  | { kind: 'revenue'; value: number; percent: number; delta: number }

interface MetricCardProps {
  data: MetricCardData

}

/* ── Helpers ──────────────────────────────────────────── */

function circumference(r: number) {
  return 2 * Math.PI * r
}

/* ── Ring SVG ─────────────────────────────────────────── */

function RingChart({
  percent,
  size,
  children,
}: {
  percent: number
  size: number
  children: React.ReactNode
}) {
  const r = 34
  const c = circumference(r)
  const filled = c * (percent / 100)

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      className="flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <circle cx="40" cy="40" r={r} fill="none" stroke="#2A3A50" strokeWidth="8" />
      <circle
        cx="40"
        cy="40"
        r={r}
        fill="none"
        stroke="#00AEEF"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${c}`}
        strokeDashoffset="0"
        transform="rotate(-90 40 40)"
      />
      {children}
    </svg>
  )
}

/* ── Sparkline SVG ────────────────────────────────────── */

function Sparkline({ data, width, height }: { data: number[]; width: number; height: number }) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = width / (data.length - 1)

  const points = data.map((v, i) => {
    const x = i * stepX
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x},${y}`
  })

  const pathD = `M ${points.join(' L ')}`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mt-1">
      <path d={pathD} fill="none" stroke="#00AEEF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
    </svg>
  )
}

/* ── Client Segments ──────────────────────────────────── */

function ClientSegments({
  engaged,
  moderate,
  atRisk,
}: {
  engaged: number
  moderate: number
  atRisk: number
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[rgba(34,197,94,0.15)] text-[#22C55E]">
        {engaged}
      </span>
      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[rgba(245,158,11,0.15)] text-[#F59E0B]">
        {moderate}
      </span>
      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[rgba(239,68,68,0.15)] text-[#EF4444]">
        {atRisk}
      </span>
    </div>
  )
}

/* ── Delta Badge ──────────────────────────────────────── */

function DeltaBadge({ value }: { value: number }) {
  const isPositive = value >= 0
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold flex-shrink-0 ${
        isPositive
          ? 'bg-[rgba(34,197,94,0.15)] text-[#22C55E]'
          : 'bg-[rgba(239,68,68,0.15)] text-[#EF4444]'
      }`}
    >
      {value >= 0 ? '+' : ''}
      {value}
    </span>
  )
}

/* ── Main Component ───────────────────────────────────── */

export default function MetricCard({ data }: MetricCardProps) {
  const [hidden, setHidden] = useState(false)

  const ringSize = useMemo(() => {
    // Tailwind breakpoints: we'll use CSS classes, but for SVG viewBox we keep 80x80
    // The actual rendered size is controlled by CSS
    return 80
  }, [])

  const cardClass =
    'flex items-center gap-4 md:gap-5 lg:gap-6 p-4 md:p-5 lg:p-6 rounded-xl border transition-all duration-200 hover:border-[rgba(0,174,239,0.3)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.15)]'

  const labelClass =
    'text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.05em] text-[#94A3B8] whitespace-nowrap overflow-hidden text-ellipsis'

  const valueClass = 'text-[20px] md:text-[22px] lg:text-[24px] font-bold text-[#F1F5F9] leading-[1.2]'

  switch (data.kind) {
    case 'sessions': {
      const sparkData = [12, 13, 14, 13, 15, 14, 16, 15, 17, 16, 18, 18]
      return (
        <div className={cardClass} style={{ background: '#151D2E', borderColor: '#2A3A50' }}>
          <RingChart percent={data.percent} size={ringSize}>
            <text x="40" y="40" textAnchor="middle" dominantBaseline="central" fill="#F1F5F9" fontSize="18" fontWeight="700">
              {data.percent}%
            </text>
          </RingChart>
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <div className={labelClass}>Sessions This Week</div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={valueClass}>
                {data.booked}/{data.total} booked
              </span>
              <DeltaBadge value={data.delta} />
            </div>
            <div className="hidden [@media(min-width:400px)]:block">
              <Sparkline data={sparkData} width={60} height={18} />
            </div>
          </div>
        </div>
      )
    }

    case 'clients': {
      return (
        <div className={cardClass} style={{ background: '#151D2E', borderColor: '#2A3A50' }}>
          <RingChart percent={100} size={ringSize}>
            <text x="40" y="40" textAnchor="middle" dominantBaseline="central" fill="#F1F5F9" fontSize="16" fontWeight="700">
              {data.total}
            </text>
          </RingChart>
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <div className={labelClass}>Active Clients</div>
            <ClientSegments engaged={data.engaged} moderate={data.moderate} atRisk={data.atRisk} />
            <DeltaBadge value={data.delta} />
          </div>
        </div>
      )
    }

    case 'adherence': {
      return (
        <div className={cardClass} style={{ background: '#151D2E', borderColor: '#2A3A50' }}>
          <RingChart percent={data.percent} size={ringSize}>
            <text x="40" y="40" textAnchor="middle" dominantBaseline="central" fill="#F1F5F9" fontSize="18" fontWeight="700">
              {data.percent}%
            </text>
          </RingChart>
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <div className={labelClass}>Adherence Score</div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={valueClass}>{data.label}</span>
              <DeltaBadge value={data.delta} />
            </div>
          </div>
        </div>
      )
    }

    case 'revenue': {
      const formatted = `$${data.value.toLocaleString()}`
      const sparkData = [42, 44, 43, 46, 48, 47, 50, 48, 52, 49, 51, 48]
      return (
        <div className={cardClass} style={{ background: '#151D2E', borderColor: '#2A3A50' }}>
          <RingChart percent={data.percent} size={ringSize}>
            <text x="40" y="40" textAnchor="middle" dominantBaseline="central" fill="#F1F5F9" fontSize="13" fontWeight="700">
              {formatted}
            </text>
          </RingChart>
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <div className="flex items-start justify-between w-full">
              <div className={labelClass}>Weekly Revenue</div>
              <button
                onClick={() => setHidden((h) => !h)}
                className="text-[#94A3B8] hover:text-[#F1F5F9] p-1 -mr-1 -mt-1 rounded transition-colors flex-shrink-0"
                title="Hide/Show"
              >
                {hidden ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={valueClass}>
                {hidden ? (
                  <span className="tracking-[4px]">••••</span>
                ) : (
                  formatted
                )}
              </span>
              <DeltaBadge value={data.delta} />
            </div>
            <div className="hidden [@media(min-width:400px)]:block">
              <Sparkline data={sparkData} width={60} height={18} />
            </div>
          </div>
        </div>
      )
    }
  }
}
