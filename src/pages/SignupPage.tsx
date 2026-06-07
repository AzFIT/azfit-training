import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserPlus, Eye, EyeOff, Mail } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number]

export default function SignupPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showVerificationMessage, setShowVerificationMessage] = useState(false)

  const { register } = useAuthStore()
  const [error, setError] = useState('')

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return 'Password must be at least 8 characters'
    if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter'
    if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number'
    return null
  }

  const handleCreateAccount = async () => {
    setError('')
    if (!fullName.trim()) {
      setError('Please enter your full name')
      return
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }
    const pwdError = validatePassword(password)
    if (pwdError) {
      setError(pwdError)
      return
    }
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
      setShowVerificationMessage(true)
    }
  }

  const inputClasses =
    'w-full bg-[#1A1A1A] border border-dark-border rounded-xl px-4 py-3 text-sm text-dark-primary placeholder:text-dark-muted focus:outline-none focus:border-cyan focus:ring-1 focus:ring-[rgba(0,174,239,0.15)] transition-all'

  if (showVerificationMessage) {
    return (
      <div className="min-h-[100dvh] bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[rgba(0,174,239,0.04)] blur-[120px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="w-full max-w-[440px] relative z-10 text-center"
        >
          <div className="bg-[#141414] border border-dark-border rounded-2xl p-8 sm:p-10">
            <div className="w-16 h-16 rounded-full bg-cyan/10 flex items-center justify-center mx-auto mb-6">
              <Mail size={28} className="text-cyan" />
            </div>
            <h1 className="font-playfair text-2xl font-bold text-dark-primary mb-3">
              Check your email
            </h1>
            <p className="text-dark-secondary text-sm mb-2">
              We&apos;ve sent a verification link to{' '}
              <span className="text-cyan font-medium">{email}</span>
            </p>
            <p className="text-dark-muted text-sm mb-8">
              Click the link in the email to activate your account, then sign in.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-2 bg-cyan hover:bg-cyan-hover text-white font-semibold py-3 rounded-xl transition-all duration-200 text-sm"
            >
              Go to Sign In
            </button>
            <div className="mt-6 text-center">
              <p className="text-dark-muted text-xs">
                Didn&apos;t receive it?{' '}
                <button
                  onClick={() => setShowVerificationMessage(false)}
                  className="text-cyan hover:text-[#33BFF2] transition-colors"
                >
                  Try again
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

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

            {/* Password */}
            <div>
              <label className="block text-dark-secondary text-sm mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
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
              disabled={isLoading}
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
