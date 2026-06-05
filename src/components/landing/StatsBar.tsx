import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const STATS = [
  { value: 116, suffix: '+', label: 'Active Clients' },
  { value: 11, suffix: '+', label: 'Expert Trainers' },
  { value: 2333, suffix: '+', label: 'Sessions Completed' },
  { value: 22, suffix: '%', label: 'Avg. Improvement' },
]

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })

  useEffect(() => {
    if (!inView) return
    const startTime = performance.now()
    const duration = 1500

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, target])

  return (
    <span ref={ref} className="font-mono text-3xl sm:text-4xl font-bold text-[#111827] tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  )
}

export default function StatsBar() {
  return (
    <section className="bg-[#F8F9FA] border-t border-[#E5E7EB] py-12 sm:py-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.15, duration: 0.5, ease: EASE }}
              className={`flex flex-col items-center text-center ${i < STATS.length - 1 ? 'lg:border-r lg:border-[#E5E7EB]' : ''}`}
            >
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              <span className="text-[#6B7280] text-sm mt-2">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
