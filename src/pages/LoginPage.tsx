/**
 * LoginPage - Role-based login with Trainer/Client tabs, demo mode, social login placeholders.
 */
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Dumbbell,
  User,
  FlaskConical,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore, type UserRole } from '@/stores/useAuthStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, toggleDemoMode } = useAuthStore();
  const urlRole = searchParams.get('role') as UserRole | null;
  const [role, setRole] = useState<UserRole>(urlRole === 'client' || urlRole === 'trainer' ? urlRole : 'trainer');
  const [email, setEmail] = useState('trainer@azfit.com');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      triggerShake();
      return;
    }
    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters');
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      await login(email, password, role);
      navigate('/trainer/dashboard');
    } catch (err: unknown) {
      const errorStr = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
      setError(`Login error: ${errorStr}`);
      triggerShake();
    }
    setLoading(false);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const handleDemo = async () => {
    toggleDemoMode();
    try {
      await login('demo@azfit.com', 'demo123', role);
      navigate('/trainer/dashboard');
    } catch {
      setError('Demo mode failed. Please try again.');
    }
  };

  const tabs: { key: UserRole; label: string; icon: typeof Dumbbell }[] = [
    { key: 'trainer', label: 'Trainer', icon: Dumbbell },
    { key: 'client', label: 'Client', icon: User },
  ];

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-[#0A0A0A] via-[#111827] to-[#0A0A0A] px-4 py-12 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[rgba(0,174,239,0.15)] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[rgba(236,72,153,0.1)] rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div
        className={`w-full max-w-[420px] bg-white dark:bg-[#1A1A1A] rounded-[1.25rem] p-8 sm:p-10 shadow-xl border-2 border-gray-300 dark:border-white/10 relative z-10 ${shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
        style={{ marginTop: '80px' }}
      >
        <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}`}</style>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-6"
        >
          <img src="./AzFIT_Logo_BlackBackground.png" alt="AzFIT" className="h-16 w-auto mx-auto mb-2" />
          <p className="text-[#00AEEF] font-bold text-xl tracking-wider">AzFIT</p>
        </motion.div>

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-6"
        >
          <h1 className="text-heading-lg text-gray-900 font-semibold">Welcome Back</h1>
          <p className="text-body-sm text-gray-500">Sign in to your account</p>
        </motion.div>

        {/* Role Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex bg-gray-100 rounded-full p-1 mb-6"
        >
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => { setRole(t.key); setError(''); }}
              className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition-all ${
                role === t.key ? 'text-white' : 'text-gray-500'
              }`}
            >
              {role === t.key && (
                <motion.div
                  layoutId="loginRoleTab"
                  className="absolute inset-0 bg-[#00AEEF] rounded-full shadow-cyan"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <t.icon size={16} className="relative z-10" />
              <span className="relative z-10">{t.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="text-caption font-medium text-gray-700 mb-1 block">Email address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#1A1A1A] border-[1.5px] border-gray-200 dark:border-white/10 rounded-xl text-sm focus:border-[#00AEEF] focus:ring-[3px] focus:ring-[rgba(0,174,239,0.15)] outline-none transition-all"
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
                placeholder="Enter your password"
                className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-[#1A1A1A] border-[1.5px] border-gray-200 dark:border-white/10 rounded-xl text-sm focus:border-[#00AEEF] focus:ring-[3px] focus:ring-[rgba(0,174,239,0.15)] outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-caption text-danger"
            >
              {error}
            </motion.p>
          )}

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-[#00AEEF] focus:ring-[#00AEEF]"
              />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-sm text-[#00AEEF] font-medium hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 flex items-center justify-center disabled:opacity-70"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>

          {/* Demo Mode */}
          <button
            type="button"
            onClick={handleDemo}
            className="w-full flex items-center justify-center gap-2 py-3 border-[1.5px] border-dashed border-[rgba(0,174,239,0.3)] text-[#00AEEF] rounded-xl text-sm font-medium hover:bg-[rgba(0,174,239,0.08)] hover:border-solid transition-all"
          >
            <FlaskConical size={18} />
            Try Demo Mode
          </button>
        </motion.form>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="relative my-6"
        >
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-gray-400 text-caption">or continue with</span>
          </div>
        </motion.div>

        {/* Social Login */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="grid grid-cols-2 gap-3"
        >
          <button
            onClick={() => alert('Coming soon!')}
            className="flex items-center justify-center gap-2 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google
          </button>
          <button
            onClick={() => alert('Coming soon!')}
            className="flex items-center justify-center gap-2 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="black"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
            Apple
          </button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="text-center mt-6 space-y-2"
        >
          <p className="text-body-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-[#00AEEF] font-semibold hover:underline">Sign up</Link>
          </p>
          <Link to="/" className="text-body-sm text-gray-400 hover:text-gray-600 transition-colors">
            &larr; Back to AzFIT
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
