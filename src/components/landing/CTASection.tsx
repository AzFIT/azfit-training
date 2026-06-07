import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

export default function CTASection() {
  const navigate = useNavigate()
  const { enableDemoMode } = useAuthStore()

  const handleTryDemo = () => {
    enableDemoMode()
    navigate('/dashboard')
  }

  return (
    <section className="relative bg-az-black py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan to-[#8B5CF6] opacity-15" />
      <div className="noise-overlay noise-overlay-light" />

      <div className="relative z-10 max-w-[700px] mx-auto px-4 sm:px-6 text-center">
        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5, ease: EASE }} className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          Ready to Transform Your Training?
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.15, duration: 0.5, ease: EASE }} className="text-[#A0A0A0] text-base sm:text-lg max-w-[520px] mx-auto mb-8">
          Join 116+ clients and 11+ trainers already using AzFIT to achieve better results. Start your free trial today — no credit card required.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.3, duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number] }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/signup" className="inline-flex items-center gap-2 bg-cyan hover:bg-cyan-dark text-white font-semibold px-8 py-4 rounded-xl transition-all hover:scale-[1.02] text-sm animate-pulseGlow" style={{ boxShadow: '0 4px 24px rgba(0,174,239,0.3)' }}>
            Get Started Free <ArrowRight size={16} />
          </Link>
          <button
            onClick={handleTryDemo}
            className="inline-flex items-center gap-2 text-[#A0A0A0] hover:text-white font-medium px-8 py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm"
          >
            <Sparkles size={16} />
            Try Demo — No Sign Up
          </button>
        </motion.div>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5, duration: 0.5 }} className="text-[#6B6B6B] text-sm mt-6">
          Free 14-day trial · No credit card required · Or try the demo instantly
        </motion.p>
      </div>
    </section>
  )
}
