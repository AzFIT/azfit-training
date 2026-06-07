import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, ChevronDown } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import HeroOrb from './HeroOrb'
import AIShowcase from './AIShowcase'

interface HeroSectionProps {
  logoSrc: string
  headline: string
  subheadline: string
}

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

export default function HeroSection({ logoSrc, headline, subheadline }: HeroSectionProps) {
  const navigate = useNavigate()
  const { enableDemoMode } = useAuthStore()

  const handleTryDemo = () => {
    enableDemoMode()
    navigate('/dashboard')
  }

  return (
    <section className="relative min-h-[100dvh] flex flex-col overflow-hidden">
      {/* Hero content */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div className="text-center lg:text-left">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4, ease: EASE }}
                className="font-mono text-xs text-cyan uppercase tracking-[0.15em] mb-6"
              >
                AzTechFit Hong Kong Presents
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.6, ease: EASE }}
                className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.05] tracking-tight mb-6"
              >
                {headline}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5, ease: EASE }}
                className="text-[#A0A0A0] text-base sm:text-lg max-w-[560px] mx-auto lg:mx-0 mb-8 leading-relaxed"
              >
                {subheadline}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5, ease: EASE }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8"
              >
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 bg-cyan hover:bg-cyan-dark text-white font-semibold px-7 py-3.5 rounded-xl transition-all hover:scale-[1.02] hover:shadow-lg text-sm"
                >
                  Start Free Trial
                  <ArrowRight size={16} />
                </Link>
                <button
                  onClick={handleTryDemo}
                  className="inline-flex items-center gap-2 text-[#A0A0A0] hover:text-white font-medium px-7 py-3.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm"
                >
                  <Sparkles size={16} />
                  Try Demo
                </button>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5, ease: EASE }}
                className="text-[#6B6B6B] text-sm"
              >
                Trusted by 116+ clients across Hong Kong
              </motion.p>
            </div>

            {/* Right: Orb */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.7, ease: EASE }}
              className="hidden lg:flex"
            >
              <HeroOrb logoSrc={logoSrc} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={24} className="text-[#6B6B6B]" />
        </motion.div>
      </motion.div>

      {/* AI Showcase */}
      <AIShowcase />
    </section>
  )
}
