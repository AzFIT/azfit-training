/**
 * ForgotPasswordPage - 3-step password recovery flow
 * Email -> Verification code -> New password -> Success
 */
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function getPasswordStrength(pwd: string): number {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
}
const strengthColors = ['bg-danger', 'bg-warning', 'bg-info', 'bg-success'];
const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

export default function ForgotPasswordPage() {
  // navigation via window.location
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [error, setError] = useState('');
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  const strength = getPasswordStrength(newPassword);

  /* Countdown timer */
  useEffect(() => {
    if (resendCountdown > 0) {
      const t = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCountdown]);

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }
    setError('');
    setStep(2);
    setResendCountdown(60);
    setTimeout(() => codeRefs.current[0]?.focus(), 300);
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');
    if (value && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }
    if (newCode.every((d) => d) && newCode.join('').length === 6) {
      setTimeout(() => setStep(3), 400);
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];
    text.split('').forEach((d, i) => { if (i < 6) newCode[i] = d; });
    setCode(newCode);
    if (text.length === 6) setTimeout(() => setStep(3), 400);
    codeRefs.current[Math.min(text.length, 5)]?.focus();
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setError('');
    setStep(4);
  };

  const steps = [
    { label: 'Email', num: 1 },
    { label: 'Verify', num: 2 },
    { label: 'Reset', num: 3 },
  ];

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50 px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[rgba(0,174,239,0.08)] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-[420px] bg-white rounded-[1.25rem] p-8 shadow-card relative z-10"
      >
        {/* Compact Logo */}
        <div className="text-center mb-4">
          <img src="./AzFIT_Logo_BlackBackground.png" alt="AzFIT" className="h-12 w-auto mx-auto" />
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={s.label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full flex items-center justify-center transition-colors ${
                    step > s.num ? 'bg-success' : step === s.num ? 'bg-[#00AEEF]' : 'bg-gray-300'
                  }`}
                >
                  {step > s.num && <CheckCircle size={10} className="text-white" />}
                </div>
                <span
                  className={`text-[10px] mt-1 font-medium transition-colors ${
                    step === s.num ? 'text-[#00AEEF]' : step > s.num ? 'text-gray-600' : 'text-gray-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 mb-4 ${step > s.num ? 'bg-success' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Step 1: Email ── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-heading-lg text-gray-900 font-semibold text-center mb-2">Reset Your Password</h2>
              <p className="text-body-sm text-gray-500 text-center mb-6 max-w-[360px] mx-auto">
                Enter the email address associated with your account and we&apos;ll send you a verification code.
              </p>
              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <label className="text-caption font-medium text-gray-700 mb-1 block">Email address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border-[1.5px] border-gray-200 rounded-xl text-sm focus:border-[#00AEEF] outline-none"
                    />
                  </div>
                </div>
                {error && <p className="text-caption text-danger">{error}</p>}
                <button type="submit" className="w-full btn-primary py-3">Send Code</button>
                <Link to="/login" className="block text-center text-sm text-gray-400 hover:text-gray-600 transition-colors">
                  &larr; Back to login
                </Link>
              </form>
            </motion.div>
          )}

          {/* ── Step 2: Verify Code ── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-heading-lg text-gray-900 font-semibold text-center mb-2">Check Your Email</h2>
              <p className="text-body-sm text-gray-500 text-center mb-6">
                We&apos;ve sent a 6-digit code to <span className="text-[#00AEEF] font-medium">{email}</span>. Enter it below.
              </p>
              <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { codeRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-mono font-bold border-2 border-gray-300 rounded-xl focus:border-[#00AEEF] focus:ring-[3px] focus:ring-[rgba(0,174,239,0.15)] outline-none transition-all bg-white"
                  />
                ))}
              </div>
              <div className="text-center">
                {resendCountdown > 0 ? (
                  <p className="text-sm text-gray-400">Resend in {resendCountdown}s</p>
                ) : (
                  <button
                    onClick={() => { setResendCountdown(60); setCode(['', '', '', '', '', '']); }}
                    className="text-sm text-[#00AEEF] font-medium hover:underline"
                  >
                    Didn&apos;t receive it? Resend code
                  </button>
                )}
              </div>
              {error && <p className="text-caption text-danger text-center mt-2">{error}</p>}
            </motion.div>
          )}

          {/* ── Step 3: New Password ── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-heading-lg text-gray-900 font-semibold text-center mb-2">Create New Password</h2>
              <p className="text-body-sm text-gray-500 text-center mb-6">Choose a strong password you haven&apos;t used before.</p>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="text-caption font-medium text-gray-700 mb-1 block">New password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full pl-10 pr-10 py-3 bg-gray-50 border-[1.5px] border-gray-200 rounded-xl text-sm focus:border-[#00AEEF] outline-none"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {newPassword && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full ${i < strength ? strengthColors[strength - 1] : 'bg-gray-200'}`} />
                        ))}
                      </div>
                      <p className="text-caption text-gray-500">Strength: <span className="font-medium">{strengthLabels[strength - 1]}</span></p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-caption font-medium text-gray-700 mb-1 block">Confirm new password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className={`w-full pl-10 pr-10 py-3 bg-gray-50 border-[1.5px] rounded-xl text-sm outline-none ${
                        confirmPassword && newPassword !== confirmPassword ? 'border-danger' : 'border-gray-200 focus:border-[#00AEEF]'
                      }`}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-caption text-danger mt-1">Passwords do not match</p>
                  )}
                </div>

                {error && <p className="text-caption text-danger">{error}</p>}
                <button type="submit" className="w-full btn-primary py-3">Reset Password</button>
              </form>
            </motion.div>
          )}

          {/* ── Step 4: Success ── */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.1, 1] }}
                transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
              >
                <CheckCircle size={48} className="text-success mx-auto mb-4" />
              </motion.div>
              <h2 className="text-heading-md text-gray-900 font-semibold mb-2">Password Reset!</h2>
              <p className="text-body-sm text-gray-500 mb-6">Your password has been updated successfully.</p>
              <Link to="/login" className="btn-primary px-8 py-3 inline-block">Go to Login</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
