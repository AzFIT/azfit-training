import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

function getPasswordStrength(pwd: string): number {
  let s = 0
  if (pwd.length >= 8) s++
  if (/[A-Z]/.test(pwd)) s++
  if (/[0-9]/.test(pwd)) s++
  if (/[^A-Za-z0-9]/.test(pwd)) s++
  return s
}

const strengthColors = ['bg-danger', 'bg-warning', 'bg-info', 'bg-success']
const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong']

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [hasToken, setHasToken] = useState(false)

  // Check if we have a recovery token in the URL (Supabase puts it there after email click)
  useEffect(() => {
    const hash = window.location.hash
    const query = window.location.search
    const hasRecoveryToken = hash.includes('type=recovery') || query.includes('token=') || query.includes('code=')
    setHasToken(hasRecoveryToken)

    // If Supabase auto-detects the session from URL, it will be available
    if (isSupabaseConfigured && hasRecoveryToken) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          setHasToken(true)
        }
      })
    }
  }, [])

  const strength = getPasswordStrength(newPassword)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (!/[A-Z]/.test(newPassword)) {
      setError('Password must contain at least one uppercase letter')
      return
    }
    if (!/[0-9]/.test(newPassword)) {
      setError('Password must contain at least one number')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Password reset is unavailable.')
      setIsLoading(false)
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    setIsLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-[100dvh] bg-az-black flex items-center justify-center p-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-cyan-glow blur-[120px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[400px] relative z-10 text-center"
        >
          <div className="bg-az-black-card border border-dark-border rounded-2xl p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.1, 1] }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <CheckCircle size={48} className="text-success mx-auto mb-4" />
            </motion.div>
            <h1 className="font-playfair text-2xl font-bold text-dark-primary mb-3">
              Password Updated!
            </h1>
            <p className="text-dark-secondary text-sm mb-6">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 bg-cyan hover:bg-cyan-dark text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-[1.02] text-sm w-full"
            >
              Go to Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-az-black flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-cyan-glow blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[400px] relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <img
              src="/AzFIT_Logo_BlackBackground_Text.png"
              alt="AzFIT"
              className="h-10 w-auto mx-auto mb-6"
            />
          </Link>
          <h1 className="font-playfair text-3xl font-bold text-dark-primary mb-2">
            Reset Password
          </h1>
          <p className="text-dark-secondary text-sm">
            Create a new password for your account
          </p>
        </div>

        {/* Error: No token */}
        {!hasToken && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-az-black-card border border-warning/20 rounded-2xl p-6 text-center"
          >
            <AlertTriangle size={32} className="text-warning mx-auto mb-3" />
            <h2 className="text-dark-primary font-semibold mb-2">Invalid or Expired Link</h2>
            <p className="text-dark-secondary text-sm mb-4">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center justify-center gap-2 bg-cyan hover:bg-cyan-dark text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-[1.02] text-sm w-full"
            >
              Request New Link
            </Link>
          </motion.div>
        )}

        {/* Form */}
        {hasToken && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-az-black-card border border-dark-border rounded-2xl p-6 sm:p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-dark-secondary text-sm mb-2">New Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    className="w-full bg-az-black-elevated border border-dark-border rounded-xl pl-10 pr-10 py-3 text-sm text-dark-primary placeholder:text-dark-muted focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan-glow transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted hover:text-dark-secondary transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full ${i < strength ? strengthColors[strength - 1] : 'bg-dark-border'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-dark-muted">
                      Strength: <span className="font-medium text-dark-secondary">{strengthLabels[strength - 1]}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-dark-secondary text-sm mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    className={`w-full bg-az-black-elevated border rounded-xl pl-10 pr-10 py-3 text-sm text-dark-primary placeholder:text-dark-muted focus:outline-none focus:ring-1 focus:ring-cyan-glow transition-all ${
                      confirmPassword && newPassword !== confirmPassword
                        ? 'border-danger focus:border-danger'
                        : 'border-dark-border focus:border-cyan'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted hover:text-dark-secondary transition-colors"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-danger text-xs mt-1">Passwords do not match</p>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="text-danger text-sm text-center">{error}</div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-cyan hover:bg-cyan-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm mt-2"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Lock size={16} />
                )}
                Reset Password
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-dark-muted text-sm hover:text-dark-secondary transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
