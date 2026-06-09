import {
  User,
  Bell,
  Palette,
  Shield,
  Database,
} from 'lucide-react'

export type SectionId = 'profile' | 'appearance' | 'notifications' | 'security' | 'data'

export interface SectionDef {
  id: SectionId
  label: string
  icon: React.ElementType
}

export const sections: SectionDef[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'data', label: 'Data', icon: Database },
]

export const accentColors = [
  { name: 'Cyan', value: 'cyan' },
  { name: 'Purple', value: 'violet' },
  { name: 'Green', value: 'success' },
  { name: 'Pink', value: 'trainer-accent' },
]

export const ease = [0.16, 1, 0.3, 1] as [number, number, number, number]
