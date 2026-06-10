import { useState, useCallback } from 'react'
import {
  Globe,
  CalendarDays,
  Smartphone,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SectionCard } from './SectionCard'

export function IntegrationsSection() {
  const [googleSheets, setGoogleSheets] = useState(false)
  const [icalUrl] = useState('https://azfit.app/api/calendar/ical/abc123')
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  return (
    <div>
      <SectionCard title="Connected Apps">
        <div className="space-y-3">
          {/* Google Sheets */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-az-black-elevated border border-dark-border">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-dark-hover flex items-center justify-center">
                <Globe size={20} className="text-success" />
              </div>
              <div>
                <p className="text-dark-primary text-sm font-medium">Google Sheets</p>
                <p className="text-dark-muted text-xs">Sync client data to spreadsheets</p>
              </div>
            </div>
            {googleSheets ? (
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs rounded-full bg-[rgba(34,197,94,0.15)] text-success font-medium">Connected</span>
                <Button variant="ghost" size="sm" className="text-danger hover:text-[danger]" onClick={() => setGoogleSheets(false)}>Disconnect</Button>
              </div>
            ) : (
              <Button size="sm" className="bg-cyan hover:bg-cyan-hover text-white" onClick={() => setGoogleSheets(true)}>Connect</Button>
            )}
          </div>

          {/* Calendar Sync */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-az-black-elevated border border-dark-border">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-dark-hover flex items-center justify-center">
                <CalendarDays size={20} className="text-violet" />
              </div>
              <div>
                <p className="text-dark-primary text-sm font-medium">Calendar Sync</p>
                <p className="text-dark-muted text-xs">iCal feed for external calendars</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-xs text-dark-secondary bg-az-black px-2 py-1 rounded border border-dark-border hidden sm:block max-w-[200px] truncate">{icalUrl}</code>
              <Button variant="ghost" size="sm" className="text-cyan hover:text-cyan-hover" onClick={() => handleCopy(icalUrl)}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-az-black-elevated border border-dark-border">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-dark-hover flex items-center justify-center">
                <Smartphone size={20} className="text-success" />
              </div>
              <div>
                <p className="text-dark-primary text-sm font-medium">WhatsApp Business</p>
                <p className="text-dark-muted text-xs">Send client reminders via WhatsApp</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="border-cyan text-cyan hover:bg-[rgba(0,174,239,0.1)]">Setup</Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="API Keys" description="Manage API keys for third-party integrations.">
        <div className="space-y-3">
          <Label className="text-dark-secondary text-xs">Live API Key</Label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-az-black-elevated border-dark-border text-dark-primary pr-20"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-10 top-1/2 -translate-y-1/2 text-dark-muted hover:text-dark-secondary"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <Button variant="ghost" size="icon" className="text-cyan hover:text-cyan-hover" onClick={() => handleCopy(apiKey)}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </Button>
            <Button variant="outline" size="sm" className="border-dark-border text-dark-secondary hover:text-dark-primary shrink-0">
              <RefreshCw size={14} className="mr-1" />
              Regenerate
            </Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Webhooks" description="Receive real-time event notifications.">
        <div className="space-y-3">
          <div>
            <Label className="text-dark-secondary text-xs mb-1">Webhook URL</Label>
            <Input value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://your-app.com/webhook" className="bg-az-black-elevated border-dark-border text-dark-primary" />
          </div>
          <div>
            <Label className="text-dark-secondary text-xs mb-1">Secret Key</Label>
            <Input value={webhookSecret} onChange={(e) => setWebhookSecret(e.target.value)} placeholder="whsec_..." className="bg-az-black-elevated border-dark-border text-dark-primary" />
          </div>
          <div className="flex gap-2">
            <Button className="bg-cyan hover:bg-cyan-hover text-white">Add Webhook</Button>
            <Button variant="outline" className="border-dark-border text-dark-secondary">Send Test</Button>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
