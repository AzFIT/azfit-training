import { useState, useCallback } from 'react'
import {
  Camera,
  Eye,
  EyeOff,
  Trash2,
  Smartphone,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { SectionCard } from './SectionCard'

export function AccountSection() {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [avatar, setAvatar] = useState<string | null>(null)
  const [name, setName] = useState('Azwar H.')
  const [email] = useState('azwar@aztechfit.hk')
  const [phone, setPhone] = useState('9123 4567')
  const [bio, setBio] = useState('Certified personal trainer specializing in body composition transformation.')
  const [sessions] = useState([
    { id: '1', device: 'MacBook Pro', browser: 'Chrome', location: 'Hong Kong', current: true, lastActive: 'Current session' },
    { id: '2', device: 'iPhone 15 Pro', browser: 'Safari', location: 'Hong Kong', current: false, lastActive: '2 hours ago' },
    { id: '3', device: 'iPad Air', browser: 'Chrome', location: 'Hong Kong', current: false, lastActive: '3 days ago' },
  ])

  const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setAvatar(url)
    }
  }, [])

  return (
    <div>
      {/* Profile Card */}
      <SectionCard title="Profile">
        <div className="flex items-start gap-6 mb-6">
          <div className="relative flex-shrink-0">
            <img
              src={avatar || '/avatar-placeholder.png'}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-dark-border"
            />
            <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-cyan hover:bg-cyan-hover rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-lg">
              <Camera size={14} className="text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <Label className="text-dark-secondary text-xs mb-1">Full Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-az-black-elevated border-dark-border text-dark-primary" />
            </div>
            <div>
              <Label className="text-dark-secondary text-xs mb-1">Email</Label>
              <div className="flex items-center gap-2">
                <Input value={email} disabled className="bg-az-black-elevated border-dark-border text-dark-primary opacity-60" />
                <Button variant="ghost" size="sm" className="text-cyan hover:text-cyan-hover shrink-0">Change</Button>
              </div>
            </div>
            <div>
              <Label className="text-dark-secondary text-xs mb-1">Phone</Label>
              <div className="flex items-center gap-2">
                <span className="text-dark-secondary text-sm bg-az-black-elevated border border-dark-border rounded-lg px-3 py-2">+852</span>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-az-black-elevated border-dark-border text-dark-primary flex-1" />
              </div>
            </div>
            <div>
              <Label className="text-dark-secondary text-xs mb-1">Bio <span className="text-dark-muted">({bio.length}/200)</span></Label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, 200))} className="bg-az-black-elevated border-dark-border text-dark-primary min-h-[80px]" />
            </div>
            <Button className="bg-cyan hover:bg-cyan-hover text-white">Save Changes</Button>
          </div>
        </div>
      </SectionCard>

      {/* Password */}
      <SectionCard title="Change Password">
        <div className="space-y-3 max-w-md">
          <div className="relative">
            <Label className="text-dark-secondary text-xs mb-1">Current Password</Label>
            <Input type={showCurrent ? 'text' : 'password'} placeholder="••••••••" className="bg-az-black-elevated border-dark-border text-dark-primary pr-10" />
            <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-[26px] text-dark-muted hover:text-dark-secondary">
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="relative">
            <Label className="text-dark-secondary text-xs mb-1">New Password</Label>
            <Input type={showNew ? 'text' : 'password'} placeholder="••••••••" className="bg-az-black-elevated border-dark-border text-dark-primary pr-10" />
            <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-[26px] text-dark-muted hover:text-dark-secondary">
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="relative">
            <Label className="text-dark-secondary text-xs mb-1">Confirm New Password</Label>
            <Input type={showConfirm ? 'text' : 'password'} placeholder="••••••••" className="bg-az-black-elevated border-dark-border text-dark-primary pr-10" />
            <button onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-[26px] text-dark-muted hover:text-dark-secondary">
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <Button className="bg-cyan hover:bg-cyan-hover text-white">Update Password</Button>
        </div>
      </SectionCard>

      {/* Two-Factor Auth */}
      <SectionCard title="Two-Factor Authentication">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-dark-primary text-sm font-medium">Status</p>
              <span className="px-2 py-0.5 text-xs rounded-full bg-[rgba(234,179,8,0.15)] text-warning font-medium">Not enabled</span>
            </div>
            <p className="text-dark-muted text-xs">Add an extra layer of security to your account.</p>
          </div>
          <Button variant="outline" className="border-cyan text-cyan hover:bg-[rgba(0,174,239,0.1)]">Enable 2FA</Button>
        </div>
      </SectionCard>

      {/* Active Sessions */}
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
                <Button variant="ghost" size="sm" className="text-danger hover:text-[danger] hover:bg-[rgba(239,68,68,0.1)]">Revoke</Button>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Danger Zone */}
      <div className="bg-az-black-card border border-[rgba(239,68,68,0.3)] rounded-xl p-6 mb-5">
        <h3 className="text-danger text-base font-semibold mb-4 flex items-center gap-2">
          <Trash2 size={16} />
          Danger Zone
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-primary text-sm font-medium">Deactivate Account</p>
              <p className="text-dark-muted text-xs">Temporarily disable your account. You can reactivate anytime.</p>
            </div>
            <Button variant="outline" className="border-danger text-danger hover:bg-[rgba(239,68,68,0.1)]">Deactivate</Button>
          </div>
          <div className="h-px bg-[rgba(239,68,68,0.2)]" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-primary text-sm font-medium">Delete Account</p>
              <p className="text-dark-muted text-xs">Permanently delete your account and all data. This cannot be undone.</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-danger hover:bg-[danger] text-white">Delete Account</Button>
              </DialogTrigger>
              <DialogContent className="bg-az-black-card border-dark-border text-dark-primary max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-danger">Delete Account</DialogTitle>
                  <DialogDescription className="text-dark-muted">
                    This action is permanent and cannot be undone. All your data will be permanently removed.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label className="text-dark-secondary text-sm mb-2">Type DELETE to confirm</Label>
                  <Input placeholder="DELETE" className="bg-az-black-elevated border-dark-border text-dark-primary" />
                </div>
                <DialogFooter>
                  <Button variant="ghost" className="text-dark-secondary">Cancel</Button>
                  <Button className="bg-danger hover:bg-[danger] text-white">Permanently Delete</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  )
}
