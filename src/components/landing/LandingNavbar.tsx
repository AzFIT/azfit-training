import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowRight, Sparkles } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
]

interface LandingNavbarProps {
  logoSrc: string
}

export default function LandingNavbar({ logoSrc }: LandingNavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { enableDemoMode } = useAuthStore()

  const handleTryDemo = () => {
    enableDemoMode()
    navigate('/dashboard')
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (href: string) => {
    setOpen(false)
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  const bg = scrolled
    ? 'bg-az-black/95 backdrop-blur-xl border-b border-white/10'
    : 'bg-transparent'

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${bg}`}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoSrc} alt="AzFIT" className="h-9 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <button
                key={l.label}
                onClick={() => scrollTo(l.href)}
                className="text-[dark-secondary] hover:text-white text-sm font-medium transition-colors"
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={handleTryDemo}
              className="text-cyan hover:text-cyan-light text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Sparkles size={14} />
              Try Demo
            </button>
            <Link
              to="/login"
              className="text-[dark-secondary] hover:text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="bg-cyan hover:bg-cyan-dark text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:scale-[1.02] flex items-center gap-1.5"
            >
              Get Started
              <ArrowRight size={14} />
            </Link>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="md:hidden text-white p-2"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed right-0 top-0 bottom-0 w-[280px] bg-az-black z-50 md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <img src={logoSrc} alt="AzFIT" className="h-8 w-auto" />
                <button
                  onClick={() => setOpen(false)}
                  className="text-white p-2"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex flex-col p-4 gap-1">
                {NAV_LINKS.map((l) => (
                  <button
                    key={l.label}
                    onClick={() => scrollTo(l.href)}
                    className="text-left text-[dark-secondary] hover:text-white text-lg font-medium px-4 py-3 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    {l.label}
                  </button>
                ))}
              </div>
              <div className="mt-auto p-4 border-t border-white/10 flex flex-col gap-3">
                <button
                  onClick={() => { setOpen(false); handleTryDemo(); }}
                  className="text-center text-cyan hover:text-cyan-light text-sm font-medium px-4 py-3 rounded-lg border border-cyan/20 hover:bg-cyan/5 transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles size={14} />
                  Try Demo
                </button>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="text-center text-[dark-secondary] hover:text-white text-sm font-medium px-4 py-3 rounded-lg border border-white/10 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="text-center bg-cyan hover:bg-cyan-dark text-white text-sm font-semibold px-4 py-3 rounded-lg transition-all hover:scale-[1.02]"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
