import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Dumbbell,
  Activity,
  Brain,
  HeartPulse,
  TrendingUp,
  MessageCircle,
  Calendar,
  BarChart3,
  Check,
} from 'lucide-react'

const SKILLS = [Dumbbell, Activity, Brain, HeartPulse, TrendingUp, MessageCircle, Calendar, BarChart3]
const RADIUS_PX = 160
const CUES = [
  "Client's squat depth improved 12% this week",
  'Recommend deload for Client 247 — HRV down 15%',
  'PR alert: Sarah hit a new 1RM on deadlifts!',
]

const FEATURES = [
  "Context-aware — knows the page and client you're viewing",
  'Drag-and-drop floating assistant, always within reach',
  'Learns your coaching style with every interaction',
]

const TICKER_ROWS = [
  'LOAD • VOLUME • INTENSITY • HR_ZONE • RECOVERY • STREAK • SYNC • COACH • CLIENT • PROGRESS • METRICS • PERFORMANCE • ',
  'AI_COACH • BIOPRINT • TDEE_CALC • WEARABLE • MACRO • SET • REP • REST • PERIODIZE • ANALYZE • PREDICT • RETAIN • ',
  'SESSION_01 • SESSION_02 • CLIENT_247 • CHECK_IN • STREAK_14 • GOAL_HIT • PR_SET • RECOVERY_95% • SLEEP_A • HRV_62 • ',
]

export default function AIShowcase() {
  const [cueIdx, setCueIdx] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setCueIdx((i) => (i + 1) % CUES.length), 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center_bottom,rgba(0,174,239,0.1)_0%,transparent_60%)]" />

      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-12 lg:gap-8 items-center">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="font-mono text-xs text-cyan uppercase tracking-[0.15em] mb-4 block">
              Artificial Intelligence
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-6">
              AI That Coaches With You
            </h2>
            <p className="text-[#9CA3AF] text-base leading-relaxed max-w-[420px] mb-8">
              AzFIT&apos;s AI understands your programming philosophy, adapts to client
              feedback, and generates coaching cues in real time.
            </p>
            <ul className="space-y-4 mb-8">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-[#D1D5DB] text-sm">
                  <Check size={18} className="text-cyan flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center relative"
          >
            <div className="relative w-[400px] h-[400px] sm:w-[400px] sm:h-[400px]">
              {/* Overflow guard — prevents icon clipping */}
              <div className="absolute inset-[-20px]" />
              {/* Pedestal */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-8 w-[200px] h-[30px] bg-[radial-gradient(ellipse,rgba(0,174,239,0.08)_0%,transparent_70%)] rounded-[50%]" />

              {/* Pulse waves */}
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full border border-cyan/15 animate-pulse-ring pointer-events-none"
                  style={{ animationDelay: `${i}s` }}
                />
              ))}

              {/* Outer ring with icons */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full border border-cyan/15 animate-spin-slow pointer-events-none">
                {SKILLS.map((Icon, i) => {
                  const angle = (i * 360) / SKILLS.length
                  const rad = (angle * Math.PI) / 180
                  const x = Math.cos(rad) * RADIUS_PX
                  const y = Math.sin(rad) * RADIUS_PX
                  return (
                    <div
                      key={i}
                      className="absolute flex items-center justify-center w-12 h-12 rounded-full bg-cyan/[0.08] animate-spin-slow"
                      style={{
                        left: `calc(50% + ${x}px - 24px)`,
                        top: `calc(50% - ${y}px - 24px)`,
                        animationDirection: 'reverse',
                      }}
                    >
                      <Icon size={22} className="text-cyan" />
                    </div>
                  )
                })}
              </div>

              {/* Central orb */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[170px] h-[170px] rounded-full bg-[radial-gradient(circle,rgba(0,174,239,0.2)_0%,transparent_70%)] border-2 border-cyan/30 flex items-center justify-center animate-orb-breathe">
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(0,174,239,0.3)_0%,transparent_60%)]" />
                <Brain size={40} className="text-cyan relative z-10" />
              </div>

              {/* Cue card */}
              <div className="absolute top-[5%] right-[0%] max-w-[200px] p-3 rounded-lg bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-cyan/15 animate-[cue-fade_4s_ease-in-out_infinite]">
                <p className="text-[#D1D5DB] text-xs leading-relaxed">{CUES[cueIdx]}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Data stream ticker */}
      <div className="relative py-16 bg-[#111827] overflow-hidden">
        <div className="[mask-image:linear-gradient(to_right,transparent_0%,black_15%,black_85%,transparent_100%)]">
          {TICKER_ROWS.map((row, i) => (
            <div key={i} className="overflow-hidden mb-4 whitespace-nowrap">
              <div
                className="inline-block font-mono font-medium uppercase tracking-[0.08em] text-[clamp(14px,1.2vw,18px)]"
                style={{
                  color: `rgba(209,213,219,${0.4 - i * 0.05})`,
                  animation: `ticker-scroll ${40 + i * 5}s linear infinite ${i % 2 === 1 ? 'reverse' : ''}`,
                }}
              >
                {row.repeat(6)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes cue-fade {
          0%, 100% { opacity: 0; transform: translateY(10px); }
          20%, 80% { opacity: 1; transform: translateY(0); }
        }
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}
