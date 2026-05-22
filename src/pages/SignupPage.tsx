/**
 * SignupPage - Account creation with role selection, password strength, terms.
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Dumbbell,
  User,
  ArrowRight,
  Check,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, type UserRole } from '@/stores/useAuthStore';

function getPasswordStrength(pwd: string): { level: number; label: string } {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  return { level: score, label: score === 0 ? 'Weak' : labels[score - 1] };
}

const strengthColors = ['bg-danger', 'bg-warning', 'bg-info', 'bg-success'];

export default function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();

  const [role, setRole] = useState<UserRole | null>(searchParams.get('role') as UserRole | null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const r = searchParams.get('role');
    if (r === 'trainer' || r === 'client') setRole(r);
  }, [searchParams]);

  const strength = getPasswordStrength(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!role) { setError('Please select a role'); return; }
    if (!name.trim()) { setError('Please enter your full name'); return; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (!agreed) { setError('Please agree to the terms'); return; }

    setLoading(true);
    await login(email, password, role);
    setLoading(false);
    navigate('/onboarding');
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50 px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[rgba(0,174,239,0.08)] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[rgba(236,72,153,0.05)] rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-[480px] bg-white rounded-[1.25rem] p-8 shadow-card relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <img src="./AzFIT_Logo_BlackBackground.png" alt="AzFIT" className="h-16 w-auto mx-auto mb-2" />
          <p className="text-[#00AEEF] font-bold text-xl tracking-wider">AzFIT</p>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-heading-lg text-gray-900 font-semibold">Create Your Account</h1>
          <p className="text-body-sm text-gray-500">Join AzFIT as a Trainer or Client</p>
        </div>

        {/* Role Selection */}
        <p className="text-caption font-semibold text-gray-700 uppercase tracking-[0.05em] mb-3">I am a...</p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Trainer Card */}
          <button
            onClick={() => setRole('trainer')}
            className={`relative text-left p-5 rounded-2xl border-2 transition-all duration-200 hover:scale-[1.02] ${
              role === 'trainer'
                ? 'border-[#EC4899] bg-[rgba(236,72,153,0.05)]'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            {role === 'trainer' && (
              <span className="absolute top-3 right-3 w-5 h-5 bg-[#EC4899] rounded-full flex items-center justify-center">
                <Check size={12} className="text-white" />
              </span>
            )}
            <div className="w-14 h-14 rounded-full bg-[rgba(236,72,153,0.1)] flex items-center justify-center mb-3">
              <Dumbbell size={28} className="text-[#EC4899]" />
            </div>
            <h3 className="text-heading-sm font-semibold text-gray-900 mb-1">Trainer</h3>
            <p className="text-body-sm text-gray-500">I coach clients and manage training programs</p>
            <ArrowRight size={16} className="text-gray-400 mt-3" />
          </button>

          {/* Client Card */}
          <button
            onClick={() => setRole('client')}
            className={`relative text-left p-5 rounded-2xl border-2 transition-all duration-200 hover:scale-[1.02] ${
              role === 'client'
                ? 'border-[#00AEEF] bg-[rgba(0,174,239,0.05)]'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            {role === 'client' && (
              <span className="absolute top-3 right-3 w-5 h-5 bg-[#00AEEF] rounded-full flex items-center justify-center">
                <Check size={12} className="text-white" />
              </span>
            )}
            <div className="w-14 h-14 rounded-full bg-[rgba(0,174,239,0.15)] flex items-center justify-center mb-3">
              <User size={28} className="text-[#00AEEF]" />
            </div>
            <h3 className="text-heading-sm font-semibold text-gray-900 mb-1">Client</h3>
            <p className="text-body-sm text-gray-500">I&apos;m looking for personal training and fitness tracking</p>
            <ArrowRight size={16} className="text-gray-400 mt-3" />
          </button>
        </div>

        {/* Account Details Form */}
        <AnimatePresence>
          {role && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-4 overflow-hidden"
            >
              <div>
                <label className="text-caption font-medium text-gray-700 mb-1 block">Full name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-[1.5px] border-gray-200 rounded-xl text-sm focus:border-[#00AEEF] focus:ring-[3px] focus:ring-[rgba(0,174,239,0.15)] outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-caption font-medium text-gray-700 mb-1 block">Email address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-[1.5px] border-gray-200 rounded-xl text-sm focus:border-[#00AEEF] focus:ring-[3px] focus:ring-[rgba(0,174,239,0.15)] outline-none transition-all"
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
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 border-[1.5px] border-gray-200 rounded-xl text-sm focus:border-[#00AEEF] focus:ring-[3px] focus:ring-[rgba(0,174,239,0.15)] outline-none transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {/* Strength indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full ${i < strength.level ? strengthColors[strength.level - 1] : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <p className="text-caption text-gray-500">
                      Password strength: <span className={`font-medium ${strength.level === 4 ? 'text-success' : strength.level === 3 ? 'text-info' : strength.level === 2 ? 'text-warning' : 'text-danger'}`}>{strength.label}</span>
                    </p>
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
                    placeholder="Confirm your password"
                    className={`w-full pl-10 pr-10 py-3 bg-gray-50 border-[1.5px] rounded-xl text-sm outline-none transition-all ${
                      confirmPassword
                        ? passwordsMatch
                          ? 'border-success focus:border-success focus:ring-[3px] focus:ring-success-light'
                          : 'border-danger focus:border-danger focus:ring-[3px] focus:ring-danger-light'
                        : 'border-gray-200 focus:border-[#00AEEF] focus:ring-[3px] focus:ring-[rgba(0,174,239,0.15)]'
                    }`}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-caption text-danger mt-1">Passwords do not match</p>
                )}
              </div>

              {/* Terms */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded border-gray-300 text-[#00AEEF] focus:ring-[#00AEEF]"
                />
                <span className="text-body-sm text-gray-600">
                  I agree to the{' '}
                  <span className="text-[#00AEEF] cursor-pointer">Terms of Service</span> and{' '}
                  <span className="text-[#00AEEF] cursor-pointer">Privacy Policy</span>
                </span>
              </label>

              {error && <p className="text-caption text-danger">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 flex items-center justify-center disabled:opacity-70"
              >
                {loading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  `Create ${role === 'trainer' ? 'Trainer' : 'Client'} Account`
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-body-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-[#00AEEF] font-semibold hover:underline">Sign in</Link>
          </p>
          <Link to="/" className="text-body-sm text-gray-400 hover:text-gray-600 transition-colors">
            &larr; Back to AzFIT
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
