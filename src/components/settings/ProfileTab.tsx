import { useState, useCallback, useEffect } from 'react'
import { Camera, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SectionCard } from './SectionCard'

const STORAGE_KEY = 'azfit-settings-profile'

interface ProfileData {
  fullName: string
  businessName: string
  email: string
  phone: string
  bio: string
  avatar: string | null
}

function loadProfile(): ProfileData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {
    fullName: 'Azwar H.',
    businessName: 'AzTechFit',
    email: 'azwar@aztechfit.hk',
    phone: '9123 4567',
    bio: 'Certified personal trainer specializing in body composition transformation.',
    avatar: null,
  }
}

function saveProfile(data: ProfileData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function ProfileTab() {
  const [profile, setProfile] = useState<ProfileData>(loadProfile)
  const [saved, setSaved] = useState(false)
  const [emailError, setEmailError] = useState('')

  useEffect(() => {
    const saved = loadProfile()
    setProfile(saved)
  }, [])

  const update = <K extends keyof ProfileData>(key: K, value: ProfileData[K]) => {
    setProfile((p) => ({ ...p, [key]: value }))
    setSaved(false)
    if (key === 'email') setEmailError('')
  }

  const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      update('avatar', url)
    }
  }, [])

  const handleSave = () => {
    if (!isValidEmail(profile.email)) {
      setEmailError('Please enter a valid email address')
      return
    }
    saveProfile(profile)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-5">
      <SectionCard title="Profile Information" description="Update your public profile and contact details.">
        <div className="flex items-start gap-6 mb-6">
          <div className="relative flex-shrink-0">
            <img
              src={profile.avatar || '/avatar-placeholder.png'}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-dark-border"
            />
            <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-cyan hover:bg-cyan-hover rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-lg">
              <Camera size={14} className="text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <Label className="text-dark-secondary text-xs mb-1">Full Name</Label>
              <Input
                value={profile.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                className="bg-az-black-elevated border-dark-border text-dark-primary"
              />
            </div>
            <div>
              <Label className="text-dark-secondary text-xs mb-1">Business Name</Label>
              <Input
                value={profile.businessName}
                onChange={(e) => update('businessName', e.target.value)}
                className="bg-az-black-elevated border-dark-border text-dark-primary"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-dark-secondary text-xs mb-1">Email</Label>
            <Input
              type="email"
              value={profile.email}
              onChange={(e) => update('email', e.target.value)}
              className={`bg-az-black-elevated border-dark-border text-dark-primary ${emailError ? 'border-danger' : ''}`}
            />
            {emailError && <p className="text-danger text-xs mt-1">{emailError}</p>}
          </div>
          <div>
            <Label className="text-dark-secondary text-xs mb-1">Phone</Label>
            <div className="flex items-center gap-2">
              <span className="text-dark-secondary text-sm bg-az-black-elevated border border-dark-border rounded-lg px-3 py-2">+852</span>
              <Input
                value={profile.phone}
                onChange={(e) => update('phone', e.target.value)}
                className="bg-az-black-elevated border-dark-border text-dark-primary flex-1"
              />
            </div>
          </div>
          <div>
            <Label className="text-dark-secondary text-xs mb-1">Bio <span className="text-dark-muted">({profile.bio.length}/200)</span></Label>
            <Textarea
              value={profile.bio}
              onChange={(e) => update('bio', e.target.value.slice(0, 200))}
              className="bg-az-black-elevated border-dark-border text-dark-primary min-h-[80px]"
            />
          </div>
          <Button
            onClick={handleSave}
            className="bg-cyan hover:bg-cyan-hover text-white"
          >
            {saved ? <><Check size={16} className="mr-2" /> Saved</> : 'Save Changes'}
          </Button>
        </div>
      </SectionCard>
    </div>
  )
}
