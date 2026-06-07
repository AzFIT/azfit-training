import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserPlus, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number]

type Role = 'trainer' | 'client'

export default function SignupPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<Role>('trainer')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { register } = useAuthStore()
  const [error, setError] = useState('')

  const handleCreateAccount = async () => {
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (!agreeTerms) {
      setError('Please agree to the terms')
      return
    }
    setIsLoading(true)
    const { error: registerError } = await register(email, password, {
      full_name: fullName,
    })
    setIsLoading(false)
    if (registerError) {
      setError(registerError)
    } else {
      navigate('/dashboard')
    }
  }

  const inputClasses =
    'w-full bg-[#1A1A1A] border border-dark-border rounded-xl px-4 py-3 text-sm text-dark-primary placeholder:text-dark-muted focus:outline-none focus:border-cyan focus:ring-1 focus:ring-[rgba(0,174,239,0.15)] transition-all'

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] flex items-center justify-center p-4">
      {/* Ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[rgba(0,174,239,0.04)] blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full bg-[rgba(139,92,246,0.03)] blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: easeOut }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-block">
            <img
              src="/AzFIT_Logo_WhiteBackground_Text.png"
              alt="AzFIT"
              className="h-10 w-auto brightness-0 invert mx-auto mb-6"
            />
          </Link>
          <h1 className="font-playfair text-3xl font-bold text-dark-primary mb-2">
            Create your account
          </h1>
          <p className="text-dark-secondary text-sm">
            Join AzFIT and start training smarter
          </p>
        </motion.div>

        {/* Signup Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: easeOut }}
          className="bg-[#141414] border border-dark-border rounded-2xl p-6 sm:p-8"
        >
          <div className="space-y-4">
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('trainer')}
                className={`py-2.5 px-4 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  role === 'trainer'
                    ? 'border-cyan bg-[rgba(0,174,239,0.15)] text-cyan'
                    : 'border-dark-border text-dark-secondary hover:bg-[#1A1A1A] hover:text-dark-primary'
                }`}
              >
                Trainer
              </button>
              <button
                type="button"
                onClick={() => setRole('client')}
                className={`py-2.5 px-4 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  role === 'client'
                    ? 'border-cyan bg-[rgba(0,174,239,0.15)] text-cyan'
                    : 'border-dark-border text-dark-secondary hover:bg-[#1A1A1A] hover:text-dark-primary'
                }`}
              >
                Client
              </button>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-dark-secondary text-sm mb-2">Full Name</label>
              <input
                type="text"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClasses}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-dark-secondary text-sm mb-2">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClasses}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-dark-secondary text-sm mb-2">Phone</label>
              <div className="flex">
                <div className="flex-shrink-0 flex items-center bg-[#1A1A1A] border border-r-0 border-dark-border rounded-l-xl px-3 py-3 text-sm text-dark-muted">
                  +852
                </div>
                <input
                  type="tel"
                  placeholder="XXXX XXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`${inputClasses} rounded-l-none`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-dark-secondary text-sm mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClasses} pr-11`}
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

            {/* Confirm Password */}
            <div>
              <label className="block text-dark-secondary text-sm mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${inputClasses} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted hover:text-dark-secondary transition-colors p-0.5"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Agree to Terms */}
            <label className="flex items-start gap-3 cursor-pointer group pt-1">
              <div
                onClick={() => setAgreeTerms(!agreeTerms)}
                className={`w-[18px] h-[18px] rounded border flex items-center justify-center transition-colors flex-shrink-0 mt-0.5 ${
                  agreeTerms
                    ? 'bg-cyan border-cyan'
                    : 'border-[#4A4A4A] group-hover:border-dark-muted'
                }`}
              >
                {agreeTerms && (
                  <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                    <path
                      d="M1 4.5L4 7.5L10 1"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span className="text-dark-secondary text-xs leading-relaxed">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    alert('Terms of Service coming soon!')
                  }}
                  className="text-cyan hover:text-[#33BFF2] transition-colors"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    alert('Privacy Policy coming soon!')
                  }}
                  className="text-cyan hover:text-[#33BFF2] transition-colors"
                >
                  Privacy Policy
                </button>
              </span>
            </label>

            {/* Error */}
            {error && (
              <div className="text-danger text-sm text-center">{error}</div>
            )}

            {/* Create Account Button */}
            <button
              onClick={handleCreateAccount}
              disabled={isLoading || !agreeTerms}
              className="w-full flex items-center justify-center gap-2 bg-cyan hover:bg-cyan-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm mt-2"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <UserPlus size={16} />
              )}
              Create Account
            </button>
          </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-dark-muted text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-cyan hover:text-[#33BFF2] transition-colors font-medium"
              >
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Back to home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
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
