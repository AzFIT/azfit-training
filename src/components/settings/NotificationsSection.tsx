import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SectionCard } from './SectionCard'
import { ToggleRow } from './ToggleRow'

export function NotificationsSection() {
  const [emailToggles, setEmailToggles] = useState({
    weeklySummary: true,
    sessionReminders: true,
    clientUpdates: true,
    systemAlerts: true,
  })
  const [pushToggles, setPushToggles] = useState({
    sessionReminders: true,
    clientMessages: true,
    goalMilestones: true,
  })
  const [inApp, _setInApp] = useState<'All' | 'Mentions only' | 'None'>('All')
  const [quietHours, setQuietHours] = useState(true)
  const [channel, setChannel] = useState<'email' | 'push' | 'inapp'>('email')

  const updateEmail = (key: string, v: boolean) =>
    setEmailToggles((p) => ({ ...p, [key]: v }))
  const updatePush = (key: string, v: boolean) =>
    setPushToggles((p) => ({ ...p, [key]: v }))

  return (
    <div>
      {/* Channel tabs */}
      <div className="inline-flex bg-az-black-elevated rounded-lg p-0.5 border border-dark-border mb-5">
        {(['email', 'push', 'inapp'] as const).map((c) => (
          <button
            key={c}
            onClick={() => setChannel(c)}
            className={`px-4 py-1.5 text-sm rounded-md transition-all capitalize ${
              channel === c ? 'bg-dark-hover text-cyan font-medium' : 'text-dark-secondary hover:text-dark-primary'
            }`}
          >
            {c === 'inapp' ? 'In-App' : c}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {channel === 'email' && (
          <motion.div key="email" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <SectionCard title="Email Notifications">
              <ToggleRow title="Weekly summary" description="Receive a weekly progress and schedule summary." checked={emailToggles.weeklySummary} onCheckedChange={(v) => updateEmail('weeklySummary', v)} />
              <ToggleRow title="Session reminders" description="Reminder 24h and 1h before your sessions." checked={emailToggles.sessionReminders} onCheckedChange={(v) => updateEmail('sessionReminders', v)} />
              <ToggleRow title="Client updates" description="Missed check-ins, low adherence alerts, etc." checked={emailToggles.clientUpdates} onCheckedChange={(v) => updateEmail('clientUpdates', v)} />
              <ToggleRow title="System alerts" description="Login from new device, password changes." checked={emailToggles.systemAlerts} onCheckedChange={(v) => updateEmail('systemAlerts', v)} />
            </SectionCard>
          </motion.div>
        )}
        {channel === 'push' && (
          <motion.div key="push" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <SectionCard title="Push Notifications">
              <ToggleRow title="Session reminders" description="Push notification before scheduled sessions." checked={pushToggles.sessionReminders} onCheckedChange={(v) => updatePush('sessionReminders', v)} />
              <ToggleRow title="Client messages" description="When clients send you a message." checked={pushToggles.clientMessages} onCheckedChange={(v) => updatePush('clientMessages', v)} />
              <ToggleRow title="Goal milestones" description="When clients reach a goal milestone." checked={pushToggles.goalMilestones} onCheckedChange={(v) => updatePush('goalMilestones', v)} />
            </SectionCard>
          </motion.div>
        )}
        {channel === 'inapp' && (
          <motion.div key="inapp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <SectionCard title="In-App Notifications" description="Control which notifications appear inside the app.">
              <div className="space-y-3">
                {(['All', 'Mentions only', 'None'] as const).map((opt) => (
                  <label key={opt} className="flex items-center gap-3 p-3 rounded-lg border border-dark-border bg-az-black-elevated cursor-pointer hover:border-dark-subtle transition-colors">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${inApp === opt ? 'border-cyan' : 'border-dark-muted'}`}>
                      {inApp === opt && <div className="w-2 h-2 rounded-full bg-cyan" />}
                    </div>
                    <span className="text-dark-primary text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </SectionCard>
          </motion.div>
        )}
      </AnimatePresence>

      <SectionCard title="Quiet Hours" description="Pause notifications during sleep hours.">
        <ToggleRow title="Enable quiet hours" description="22:00 - 07:00 — notifications will be silenced." checked={quietHours} onCheckedChange={setQuietHours} />
      </SectionCard>
    </div>
  )
}
