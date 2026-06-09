import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import { SectionCard } from './SectionCard'
import { ToggleRow } from './ToggleRow'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'azfit-settings-notifications'

const NOTIFICATION_TYPES = [
  { key: 'newClient', label: 'New Client', description: 'When a new client signs up or is assigned.' },
  { key: 'sessionBooking', label: 'Session Booking', description: 'Bookings, cancellations, and reschedules.' },
  { key: 'payment', label: 'Payment', description: 'Successful payments, failed charges, refunds.' },
  { key: 'assessmentDue', label: 'Assessment Due', description: 'Upcoming BioPrint, body stats, or PAR-Q due.' },
  { key: 'milestone', label: 'Milestone', description: 'Client reaches a goal or personal record.' },
  { key: 'system', label: 'System', description: 'Security alerts, maintenance, feature updates.' },
] as const

const CHANNELS = ['inApp', 'email'] as const

type Channel = typeof CHANNELS[number]
type TypeKey = typeof NOTIFICATION_TYPES[number]['key']

interface NotificationsData {
  toggles: Record<TypeKey, Record<Channel, boolean>>
  quietHoursEnabled: boolean
  quietHoursStart: string
  quietHoursEnd: string
}

function loadNotifications(): NotificationsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  const defaults: Record<TypeKey, Record<Channel, boolean>> = {} as Record<TypeKey, Record<Channel, boolean>>
  NOTIFICATION_TYPES.forEach((t) => {
    defaults[t.key] = { inApp: true, email: true }
  })
  return {
    toggles: defaults,
    quietHoursEnabled: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
  }
}

function saveNotifications(data: NotificationsData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function NotificationsTab() {
  const [data, setData] = useState<NotificationsData>(loadNotifications)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setData(loadNotifications())
  }, [])

  const updateToggle = (type: TypeKey, channel: Channel, value: boolean) => {
    setData((p) => ({
      ...p,
      toggles: {
        ...p.toggles,
        [type]: { ...p.toggles[type], [channel]: value },
      },
    }))
    setSaved(false)
  }

  const updateQuiet = <K extends keyof NotificationsData>(key: K, value: NotificationsData[K]) => {
    setData((p) => ({ ...p, [key]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    saveNotifications(data)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-5">
      <SectionCard title="Notification Preferences" description="Choose how you want to be notified for each event type.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left text-dark-secondary text-xs font-medium py-2 pr-4">Event</th>
                <th className="text-center text-dark-secondary text-xs font-medium py-2 w-32">In-App</th>
                <th className="text-center text-dark-secondary text-xs font-medium py-2 w-32">Email</th>
              </tr>
            </thead>
            <tbody>
              {NOTIFICATION_TYPES.map((t) => (
                <tr key={t.key} className="border-b border-dark-divider last:border-0">
                  <td className="py-3 pr-4">
                    <p className="text-dark-primary text-sm font-medium">{t.label}</p>
                    <p className="text-dark-muted text-xs">{t.description}</p>
                  </td>
                  <td className="py-3 text-center">
                    <input
                      type="checkbox"
                      checked={data.toggles[t.key].inApp}
                      onChange={(e) => updateToggle(t.key, 'inApp', e.target.checked)}
                      className="w-4 h-4 accent-cyan cursor-pointer"
                    />
                  </td>
                  <td className="py-3 text-center">
                    <input
                      type="checkbox"
                      checked={data.toggles[t.key].email}
                      onChange={(e) => updateToggle(t.key, 'email', e.target.checked)}
                      className="w-4 h-4 accent-cyan cursor-pointer"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Quiet Hours" description="Pause notifications during selected hours.">
        <ToggleRow
          title="Enable quiet hours"
          description="Notifications will be silenced during the selected time range."
          checked={data.quietHoursEnabled}
          onCheckedChange={(v) => updateQuiet('quietHoursEnabled', v)}
        />
        {data.quietHoursEnabled && (
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-dark-divider">
            <div className="flex-1">
              <Label className="text-dark-secondary text-xs mb-1">Start</Label>
              <Input
                type="time"
                value={data.quietHoursStart}
                onChange={(e) => updateQuiet('quietHoursStart', e.target.value)}
                className="bg-[az-black-elevated] border-dark-border text-dark-primary"
              />
            </div>
            <span className="text-dark-muted text-sm pt-5">to</span>
            <div className="flex-1">
              <Label className="text-dark-secondary text-xs mb-1">End</Label>
              <Input
                type="time"
                value={data.quietHoursEnd}
                onChange={(e) => updateQuiet('quietHoursEnd', e.target.value)}
                className="bg-[az-black-elevated] border-dark-border text-dark-primary"
              />
            </div>
          </div>
        )}
      </SectionCard>

      <Button onClick={handleSave} className="bg-cyan hover:bg-cyan-hover text-white">
        {saved ? <><Check size={16} className="mr-2" /> Saved Preferences</> : 'Save Preferences'}
      </Button>
    </div>
  )
}
