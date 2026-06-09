import { useState } from 'react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SectionCard } from './SectionCard'
import { SegmentedControl } from './SegmentedControl'

export function DisplaySection() {
  const [units, setUnits] = useState<'Metric' | 'Imperial'>('Metric')
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY')
  const [timeFormat, setTimeFormat] = useState<'24-hour' | '12-hour'>('24-hour')
  const [language, setLanguage] = useState('English')

  return (
    <div>
      <SectionCard title="Date & Time" description="Configure how dates and times are displayed.">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-dark-secondary text-sm">Date Format</Label>
            <SegmentedControl options={['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']} value={dateFormat} onChange={setDateFormat} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-dark-secondary text-sm">Time Format</Label>
            <SegmentedControl options={['24-hour', '12-hour']} value={timeFormat} onChange={(v: string) => setTimeFormat(v as '24-hour' | '12-hour')} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-dark-secondary text-sm">Timezone</Label>
            <Select defaultValue="Asia/Hong_Kong" disabled>
              <SelectTrigger className="w-[220px] bg-[az-black-elevated] border-dark-border text-dark-primary opacity-60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[az-black-elevated] border-dark-border">
                <SelectItem value="Asia/Hong_Kong">Asia/Hong Kong (GMT+8)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Measurement Units" description="Choose your preferred units for weight, height, and distance.">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-dark-secondary text-sm">Units System</Label>
            <SegmentedControl options={['Metric', 'Imperial']} value={units} onChange={(v) => setUnits(v as 'Metric' | 'Imperial')} />
          </div>
          <div className="flex items-center gap-6 text-sm">
            <span className="text-dark-muted">Weight: <span className="text-dark-secondary">{units === 'Metric' ? 'kg' : 'lb'}</span></span>
            <span className="text-dark-muted">Height: <span className="text-dark-secondary">{units === 'Metric' ? 'cm' : 'in'}</span></span>
            <span className="text-dark-muted">Body Fat: <span className="text-dark-secondary">%</span></span>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Currency" description="Currency display for all monetary values.">
        <div className="flex items-center justify-between">
          <Label className="text-dark-secondary text-sm">Currency</Label>
          <div className="flex items-center gap-3">
            <span className="text-dark-muted text-sm">HKD (locked)</span>
            <Select defaultValue="HKD" disabled>
              <SelectTrigger className="w-[160px] bg-[az-black-elevated] border-dark-border text-dark-primary opacity-60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[az-black-elevated] border-dark-border">
                <SelectItem value="HKD">HKD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Language" description="Select your preferred interface language.">
        <div className="flex items-center justify-between">
          <Label className="text-dark-secondary text-sm">Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[200px] bg-[az-black-elevated] border-dark-border text-dark-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[az-black-elevated] border-dark-border">
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="zh-HK">繁體中文</SelectItem>
              <SelectItem value="zh-CN">简体中文</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SectionCard>
    </div>
  )
}
