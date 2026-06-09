import {
  Monitor,
  Bell,
  Palette,
  Shield,
  User,
  Database,
  Plug,
} from 'lucide-react'

export type SectionId = 'display' | 'notifications' | 'appearance' | 'privacy' | 'account' | 'data' | 'integrations'

export interface SectionDef {
  id: SectionId
  label: string
  icon: React.ElementType
}

export const sections: SectionDef[] = [
  { id: 'display', label: 'Display', icon: Monitor },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'account', label: 'Account', icon: User },
  { id: 'data', label: 'Data', icon: Database },
  { id: 'integrations', label: 'Integrations', icon: Plug },
]

export const accentColors = [
  { name: 'Cyan', value: 'cyan' },
  { name: 'Purple', value: 'violet' },
  { name: 'Green', value: 'success' },
  { name: 'Pink', value: 'trainer-accent' },
]

export const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]
