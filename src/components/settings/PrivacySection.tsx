import { useState } from 'react'
import { SectionCard } from './SectionCard'
import { ToggleRow } from './ToggleRow'

export function PrivacySection() {
  const [profileVisibility, _setProfileVisibility] = useState<'Trainers only' | 'All authenticated' | 'Public'>('Trainers only')
  const [activityStatus, setActivityStatus] = useState(true)
  const [dataCollection, setDataCollection] = useState(true)
  const [readReceipt, setReadReceipt] = useState(true)
  const [dataSharing, setDataSharing] = useState(false)

  return (
    <div>
      <SectionCard title="Profile Visibility" description="Who can see your profile and credentials.">
        <div className="space-y-2">
          {(['Trainers only', 'All authenticated', 'Public'] as const).map((opt) => (
            <label key={opt} className="flex items-center gap-3 p-3 rounded-lg border border-dark-border bg-az-black-elevated cursor-pointer hover:border-dark-subtle transition-colors">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${profileVisibility === opt ? 'border-cyan' : 'border-dark-muted'}`}>
                {profileVisibility === opt && <div className="w-2 h-2 rounded-full bg-cyan" />}
              </div>
              <span className="text-dark-primary text-sm">{opt}</span>
            </label>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Activity Status">
        <ToggleRow title="Show when I'm online" description="Display an online indicator to others." checked={activityStatus} onCheckedChange={setActivityStatus} />
        <ToggleRow title="Show when I read messages" description="Others can see when you've read their messages." checked={readReceipt} onCheckedChange={setReadReceipt} />
      </SectionCard>

      <SectionCard title="Data Collection">
        <ToggleRow title="Allow analytics" description="Help improve AzFIT by sharing anonymous usage data." checked={dataCollection} onCheckedChange={setDataCollection} />
        <ToggleRow title="Allow data sharing" description="Allow trainers to share anonymized data for research." checked={dataSharing} onCheckedChange={setDataSharing} />
      </SectionCard>
    </div>
  )
}
