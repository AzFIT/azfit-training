import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { LogIn, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number]

function motionEnter<T extends Record<string, unknown>>(
  reduce: boolean | null,
  initial: T,
  transition?: import('framer-motion').Transition
): { initial: T | false; transition?: import('framer-motion').Transition } {
  if (reduce) return { initial: false }
  return { initial, transition }
}

export default function LoginPage() {
  const reduceMotion = useReducedMotion()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { login, enableDemoMode } = useAuthStore()
  const [error, setError] = useState('')

  const handleSignIn = async () => {
    setError('')
    setIsLoading(true)
    const { error: loginError } = await login(email, password)
    setIsLoading(false)
    if (loginError) {
      setError(loginError)
    } else {
      navigate('/dashboard')
    }
  }

  const handleDemoMode = () => {
    enableDemoMode()
    navigate('/dashboard')
  }

  return (
    <div className="min-h-[100dvh] bg-[az-black] flex items-center justify-center p-4">
      {/* Background image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none"
        style={{ backgroundImage: 'url(/hero-bg.jpg)' }}
      />
      {/* Noise texture */}
      <div className="fixed inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay" />
      {/* Ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-cyan-glow blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-[rgba(139,92,246,0.03)] blur-[100px]" />
      </div>

      <motion.div
        {...motionEnter(reduceMotion, { opacity: 0, y: 30 }, { duration: 0.6, ease: easeOut })}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] relative z-10"
      >
        {/* Logo */}
        <motion.div
          {...motionEnter(reduceMotion, { opacity: 0, y: -10 }, { duration: 0.5, delay: 0.1, ease: easeOut })}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-block">
            <img
              src="./AzFIT_Logo_BlackBackground_Text.png"
              alt="AzFIT"
              className="h-10 w-auto mx-auto mb-6"
            />
          </Link>
          <h1 className="font-playfair text-3xl font-bold text-dark-primary mb-2">
            Welcome back
          </h1>
          <p className="text-dark-secondary text-sm">
            Sign in to your AzFIT trainer portal
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          {...motionEnter(reduceMotion, { opacity: 0, y: 20 }, { duration: 0.5, delay: 0.2, ease: easeOut })}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[az-black-card] border border-dark-border rounded-2xl p-6 sm:p-8"
        >
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-dark-secondary text-sm mb-2">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[az-black-elevated] border border-dark-border rounded-xl px-4 py-3 text-sm text-dark-primary placeholder:text-dark-muted focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan-glow transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-dark-secondary text-sm mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[az-black-elevated] border border-dark-border rounded-xl px-4 py-3 pr-11 text-sm text-dark-primary placeholder:text-dark-muted focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan-glow transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted hover:text-dark-secondary transition-colors p-0.5"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    rememberMe
                      ? 'bg-cyan border-cyan'
                      : 'border-[dark-subtle] group-hover:border-dark-muted'
                  }`}
                >
                  {rememberMe && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-dark-secondary text-sm">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-cyan text-sm hover:text-[cyan-light] transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Error */}
            {error && (
              <div className="text-danger text-sm text-center">{error}</div>
            )}

            {/* Sign In Button */}
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-cyan hover:bg-cyan-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm mt-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn size={16} />
              )}
              Sign In
            </button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dark-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[az-black-card] px-3 text-dark-muted">or</span>
              </div>
            </div>

            {/* Demo Mode Button */}
            <button
              onClick={handleDemoMode}
              className="w-full bg-transparent border border-dark-border hover:border-cyan/50 text-dark-secondary hover:text-dark-primary font-medium py-3 rounded-xl transition-all duration-200 text-sm"
            >
              Try Demo Mode
            </button>

            {/* Demo Warning */}
            <div className="flex items-start gap-2 rounded-lg bg-warning/10 border border-warning/20 p-3">
              <AlertTriangle size={14} className="text-warning flex-shrink-0 mt-0.5" />
              <p className="text-xs text-warning/90 leading-relaxed">
                Demo mode is for development only. All data is local and will be cleared when you log out.
              </p>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-dark-muted text-sm">
              Don&apos;t have an account?{' '}
              <Link
                to="/signup"
                className="text-cyan hover:text-[cyan-light] transition-colors font-medium"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Back to home */}
        <motion.div
          {...motionEnter(reduceMotion, { opacity: 0 }, { delay: 0.5, duration: 0.4 })}
          animate={{ opacity: 1 }}
          className="mt-6 text-center"
        >
          <Link
            to="/"
            className="text-dark-muted text-xs hover:text-dark-secondary transition-colors"
          >
            Back to home page
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
