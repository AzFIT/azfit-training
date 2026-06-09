import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

export default function WaterTrackerTab() {
  const [glasses, setGlasses] = useState(5)
  const targetGlasses = 8
  const mlPerGlass = 250
  const totalMl = glasses * mlPerGlass
  const targetMl = targetGlasses * mlPerGlass

  const handleGlassClick = (index: number) => {
    if (index < glasses) {
      setGlasses(index)
    } else {
      setGlasses(index + 1)
    }
  }

  const weeklyData = [
    { day: 'Mon', amount: 2000 },
    { day: 'Tue', amount: 2250 },
    { day: 'Wed', amount: 1750 },
    { day: 'Thu', amount: 2500 },
    { day: 'Fri', amount: 1500 },
    { day: 'Sat', amount: 2000 },
    { day: 'Sun', amount: totalMl },
  ]

  const ringPercentage = Math.min((totalMl / targetMl) * 100, 100)
  const circumference = 2 * Math.PI * 35
  const ringOffset = circumference - (ringPercentage / 100) * circumference

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24 mb-3">
          <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
            <circle cx="48" cy="48" r="35" fill="none" stroke="dark-border" strokeWidth="6" />
            <circle
              cx="48" cy="48" r="35"
              fill="none"
              stroke="cyan"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={ringOffset}
              style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-cyan text-lg font-bold">{Math.round(ringPercentage)}%</span>
          </div>
        </div>
        <div className="text-center">
          <span className="text-cyan text-2xl font-bold font-mono">{totalMl}</span>
          <span className="text-dark-muted text-base font-mono ml-1">/ {targetMl} ml</span>
        </div>
        <p className="text-dark-secondary text-sm mt-1">
          {glasses}/{targetGlasses} glasses
        </p>
      </div>

      {/* Glasses */}
      <div className="flex items-center justify-center gap-3">
        {Array.from({ length: targetGlasses }, (_, i) => (
          <motion.button
            key={i}
            onClick={() => handleGlassClick(i)}
            whileTap={{ scale: 0.9 }}
            className="relative flex flex-col items-center"
          >
            <div className="relative w-9 h-12">
              <svg width="36" height="48" viewBox="0 0 36 48">
                <path
                  d="M4 4 L8 44 Q8 46 10 46 L26 46 Q28 46 28 44 L32 4"
                  fill="none"
                  stroke="dark-border"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {i < glasses && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: '80%' }}
                  transition={{ duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number] }}
                  className="absolute bottom-[10%] left-[13%] right-[13%] rounded-b-lg overflow-hidden"
                  style={{ background: 'rgba(0, 174, 239, 0.6)' }}
                >
                  <div
                    className="absolute inset-x-0 top-0 h-1"
                    style={{ background: 'rgba(0, 174, 239, 0.9)' }}
                  />
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Quick add buttons */}
      <div className="flex items-center justify-center gap-2">
        {[250, 500, 1000].map((ml) => (
          <button
            key={ml}
            onClick={() => setGlasses((g) => Math.min(g + ml / 250, 20))}
            className="px-3 py-1.5 bg-[az-black-elevated] border border-dark-border rounded-lg text-xs text-cyan hover:bg-dark-hover transition-colors"
          >
            +{ml}ml
          </button>
        ))}
        <button
          onClick={() => setGlasses(0)}
          className="px-3 py-1.5 text-dark-muted hover:text-dark-primary text-xs transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Weekly chart */}
      <div className="bg-[az-black-card] border border-dark-border rounded-xl p-5">
        <h4 className="text-dark-primary font-semibold text-sm mb-4">This Week</h4>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="day"
                tick={{ fill: 'var(--dark-muted)', fontSize: 11 }}
                axisLine={{ stroke: 'dark-border' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--dark-muted)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 3000]}
              />
              <Tooltip
                contentStyle={{
                  background: 'az-black-elevated',
                  border: '1px solid dark-border',
                  borderRadius: '8px',
                  color: 'dark-primary',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {weeklyData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.amount >= targetMl ? 'cyan' : entry.amount >= 1500 ? 'violet' : 'orange'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
