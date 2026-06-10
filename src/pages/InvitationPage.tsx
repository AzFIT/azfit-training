/**
 * InvitationPage - Admin invitation acceptance flow
 * Review invitation -> Set password + MFA -> Success with auto-redirect
 */
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  User,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';

function getPasswordStrength(pwd: string): number {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
}
const strengthColors = ['bg-danger', 'bg-warning', 'bg-info', 'bg-success'];

export default function InvitationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { enableDemoMode } = useAuthStore();

  /* Mock: check if token is valid (demo: any non-empty token is valid) */
  const isValidToken = !!token && token.length > 0 && !token.startsWith('invalid');

  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [enableMfa, setEnableMfa] = useState(false);
  const [error, setError] = useState('');
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  const strength = getPasswordStrength(password);

  /* Auto-redirect on success */
  useEffect(() => {
    if (step === 3) {
      const t = setInterval(() => {
        setRedirectCountdown((c) => {
          if (c <= 1) {
            clearInterval(t);
            navigate('/dashboard');
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(t);
    }
  }, [step, navigate]);

  const handleAccept = () => {
    if (!termsAccepted) { setError('Please accept the terms'); return; }
    setError('');
    setStep(2);
  };

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setError('');
    // In a real flow, this would call Supabase to accept the invitation
    // For demo, we enable demo mode and redirect
    enableDemoMode();
    setStep(3);
  };

  /* ─── Invalid Token State ─── */
  if (!isValidToken) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[420px] bg-white rounded-[1.25rem] p-8 shadow-card text-center"
        >
          <XCircle size={56} className="text-danger mx-auto mb-4" />
          <h2 className="text-heading-lg text-gray-900 font-semibold mb-2">Invitation Expired</h2>
          <p className="text-body-sm text-gray-500 mb-6">
            This invitation link is no longer valid. Please contact your administrator for a new invitation.
          </p>
          <Link to="/login" className="btn-primary px-6 py-3 inline-block mb-3">
            Request New Invitation
          </Link>
          <div>
            <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Contact Support
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50 px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[rgba(168,85,247,0.08)] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-[480px] bg-white rounded-[1.25rem] p-8 shadow-card relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-4">
          <img src="./AzFIT_Logo_BlackBackground.png" alt="AzFIT" className="h-16 w-auto mx-auto mb-2" />
          <p className="text-cyan font-bold text-lg tracking-wider">AzFIT</p>
          <span className="inline-block mt-2 px-3 py-1 bg-admin-accent text-white text-caption font-medium rounded-full">
            Admin Invitation
          </span>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {['Review', 'Password', 'Complete'].map((label, i) => (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full transition-colors ${
                    step > i + 1 ? 'bg-success' : step === i + 1 ? 'bg-admin-accent' : 'bg-gray-300'
                  }`}
                />
                <span className={`text-[10px] mt-1 font-medium ${step === i + 1 ? 'text-admin-accent' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
              {i < 2 && <div className={`w-8 h-0.5 mx-1 mb-4 ${step > i + 1 ? 'bg-success' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Step 1: Review ── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-heading-lg text-gray-900 font-semibold text-center mb-2">You&apos;ve Been Invited</h2>
              <p className="text-body-sm text-gray-500 text-center mb-6">
                Review the invitation details below.
              </p>

              <div className="bg-gray-50 rounded-xl p-5 space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-caption text-gray-500">Invited by</span>
                  <span className="text-sm font-medium text-gray-900">Azwar (Founder)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-caption text-gray-500">Role</span>
                  <span className="inline-block px-2 py-0.5 bg-[rgba(168,85,247,0.1)] text-admin-accent text-caption font-semibold rounded-full">
                    Administrator
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-caption text-gray-500">Gym</span>
                  <span className="text-sm font-medium text-gray-900">AzTechFit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-caption text-gray-500">Date sent</span>
                  <span className="text-sm font-medium text-gray-900">{new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded border-gray-300 text-admin-accent focus:ring-admin-accent"
                />
                <span className="text-body-sm text-gray-600">
                  I agree to the{' '}
                  <span className="text-admin-accent cursor-pointer">Terms of Service</span> and{' '}
                  <span className="text-admin-accent cursor-pointer">Privacy Policy</span>
                </span>
              </label>

              {error && <p className="text-caption text-danger mb-2">{error}</p>}

              <button
                onClick={handleAccept}
                disabled={!termsAccepted}
                className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50 mb-3"
                style={{ background: 'linear-gradient(135deg, admin-accent, violet-light)' }}
              >
                Accept Invitation
              </button>
              <button className="w-full py-3 text-sm text-danger hover:bg-danger-light rounded-xl transition-colors">
                Decline
              </button>
            </motion.div>
          )}

          {/* ── Step 2: Set Password ── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-heading-lg text-gray-900 font-semibold text-center mb-2">Create Your Password</h2>
              <p className="text-body-sm text-gray-500 text-center mb-6">Set a secure password for your admin account.</p>

              <form onSubmit={handleComplete} className="space-y-4">
                <div>
                  <label className="text-caption font-medium text-gray-700 mb-1 block">Full name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      defaultValue="Admin User"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border-[1.5px] border-gray-200 rounded-xl text-sm focus:border-admin-accent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-caption font-medium text-gray-700 mb-1 block">Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      className="w-full pl-10 pr-10 py-3 bg-gray-50 border-[1.5px] border-gray-200 rounded-xl text-sm focus:border-admin-accent outline-none"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full ${i < strength ? strengthColors[strength - 1] : 'bg-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-caption font-medium text-gray-700 mb-1 block">Confirm password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className={`w-full pl-10 pr-10 py-3 bg-gray-50 border-[1.5px] rounded-xl text-sm outline-none ${
                        confirmPassword && password !== confirmPassword ? 'border-danger' : 'border-gray-200 focus:border-admin-accent'
                      }`}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-caption text-danger mt-1">Passwords do not match</p>
                  )}
                </div>

                {/* MFA Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={20} className="text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Enable two-factor authentication</p>
                      <p className="text-caption text-warning">Recommended for admin accounts</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnableMfa(!enableMfa)}
                    className={`w-12 h-7 rounded-full transition-colors relative ${enableMfa ? 'bg-admin-accent' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${enableMfa ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                {enableMfa && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-xl text-center"
                  >
                    <p className="text-sm text-gray-500 mb-2">Scan this QR code with your authenticator app</p>
                    <div className="w-32 h-32 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-caption text-gray-500">QR Placeholder</span>
                    </div>
                  </motion.div>
                )}

                {error && <p className="text-caption text-danger">{error}</p>}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-semibold text-sm text-white"
                  style={{ background: 'linear-gradient(135deg, admin-accent, violet-light)' }}
                >
                  Complete Setup
                </button>
              </form>
            </motion.div>
          )}

          {/* ── Step 3: Complete ── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.1, 1] }}
                transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
              >
                <CheckCircle size={56} className="text-admin-accent mx-auto mb-4" />
              </motion.div>
              <h2 className="text-heading-lg text-gray-900 font-semibold mb-2">Welcome to AzFIT!</h2>
              <p className="text-body-sm text-gray-500 mb-4">
                Your admin account is set up. Redirecting to dashboard in {redirectCountdown}s...
              </p>
              {/* Countdown progress */}
              <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden mb-6">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 3, ease: 'linear' }}
                  className="h-full bg-admin-accent"
                />
              </div>
              <Link
                to="/trainer/dashboard"
                className="inline-block px-8 py-3 rounded-xl font-semibold text-sm text-white"
                style={{ background: 'linear-gradient(135deg, admin-accent, violet-light)' }}
              >
                Go to Dashboard Now
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
