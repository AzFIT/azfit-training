import { useState } from 'react'
import { Eye, EyeOff, Check, Smartphone, Shield } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { SectionCard } from './SectionCard'
import { Switch } from '@/components/ui/switch'

const SESSIONS = [
  { id: '1', device: 'MacBook Pro', browser: 'Chrome', location: 'Hong Kong', current: true, lastActive: 'Current session' },
  { id: '2', device: 'iPhone 15 Pro', browser: 'Safari', location: 'Hong Kong', current: false, lastActive: '2 hours ago' },
  { id: '3', device: 'iPad Air', browser: 'Chrome', location: 'Hong Kong', current: false, lastActive: '3 days ago' },
]

export function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [twoFactor, setTwoFactor] = useState(false)
  const [sessions, setSessions] = useState(SESSIONS)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleUpdatePassword = () => {
    setError('')
    setMessage('')
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all password fields')
      return
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match')
      return
    }
    setMessage('Password updated successfully')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setTimeout(() => setMessage(''), 3000)
  }

  const revokeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div className="space-y-5">
      <SectionCard title="Change Password">
        <div className="space-y-4 max-w-md">
          <PasswordField
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
            show={showCurrent}
            toggle={() => setShowCurrent((v) => !v)}
          />
          <PasswordField
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            show={showNew}
            toggle={() => setShowNew((v) => !v)}
          />
          <PasswordField
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            show={showConfirm}
            toggle={() => setShowConfirm((v) => !v)}
          />
          {error && <p className="text-danger text-sm">{error}</p>}
          {message && <p className="text-success text-sm flex items-center gap-1"><Check size={14} /> {message}</p>}
          <Button onClick={handleUpdatePassword} className="bg-cyan hover:bg-cyan-hover text-white">
            Update Password
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Two-Factor Authentication">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-dark-hover flex items-center justify-center flex-shrink-0">
              <Shield size={16} className="text-dark-secondary" />
            </div>
            <div>
              <p className="text-dark-primary text-sm font-medium">Two-factor authentication</p>
              <p className="text-dark-muted text-xs">Add an extra layer of security to your account.</p>
            </div>
          </div>
          <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
        </div>
        {twoFactor && (
          <div className="mt-4 p-3 rounded-lg bg-success/10 border border-success/20">
            <p className="text-success text-sm flex items-center gap-2">
              <Check size={14} /> 2FA enabled (mock)
            </p>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Active Sessions" description="You're signed in on these devices.">
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-az-black-elevated border border-dark-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-dark-hover flex items-center justify-center">
                  <Smartphone size={16} className="text-dark-secondary" />
                </div>
                <div>
                  <p className="text-dark-primary text-sm font-medium">{s.device} — {s.browser}</p>
                  <p className="text-dark-muted text-xs">{s.location} · {s.lastActive}</p>
                </div>
              </div>
              {s.current ? (
                <span className="text-success text-xs font-medium">Current</span>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => revokeSession(s.id)} className="text-danger hover:text-[danger] hover:bg-[rgba(239,68,68,0.1)]">
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  toggle,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  show: boolean
  toggle: () => void
}) {
  return (
    <div className="relative">
      <Label className="text-dark-secondary text-xs mb-1">{label}</Label>
      <Input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="••••••••"
        className="bg-az-black-elevated border-dark-border text-dark-primary pr-10"
      />
      <button
        type="button"
        onClick={toggle}
        className="absolute right-3 top-[26px] text-dark-muted hover:text-dark-secondary"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}
