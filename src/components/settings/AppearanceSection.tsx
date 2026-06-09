import { useState, useEffect } from 'react'
import { Moon, Sun, MonitorIcon, Check } from 'lucide-react'
import { SectionCard } from './SectionCard'
import { ThemeCard } from './ThemeCard'
import { SegmentedControl } from './SegmentedControl'
import { ToggleRow } from './ToggleRow'
import { accentColors } from './constants'

export function AppearanceSection() {
  const resolveTheme = (t: string | null): 'Dark' | 'Light' => {
    if (t === 'light' || t === 'Dark') return 'Light'
    if (t === 'dark' || t === 'Light') return 'Dark'
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'Dark' : 'Light'
  }

  const [theme, setThemeState] = useState<'Dark' | 'Light'>(() => {
    return resolveTheme(localStorage.getItem('azfit-theme'))
  })

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent
      setThemeState(custom.detail === 'dark' ? 'Dark' : 'Light')
    }
    window.addEventListener('azfit-theme-change', handler)
    return () => window.removeEventListener('azfit-theme-change', handler)
  }, [])

  const setGlobalTheme = (mode: 'Dark' | 'Light') => {
    const t = mode === 'Dark' ? 'dark' : 'light'
    localStorage.setItem('azfit-theme', t)
    window.dispatchEvent(new CustomEvent('azfit-theme-change', { detail: t }))
    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.classList.add(t)
    setThemeState(mode)
  }

  const [accent, setAccent] = useState('cyan')
  const [density, setDensity] = useState<'Comfortable' | 'Compact' | 'Spacious'>('Comfortable')
  const [animations, setAnimations] = useState(true)

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-5">
        <SectionCard title="Theme Mode">
          <div className="grid grid-cols-3 gap-3">
            <ThemeCard icon={Moon} label="Dark" selected={theme === 'Dark'} onClick={() => setGlobalTheme('Dark')} />
            <ThemeCard icon={Sun} label="Light" selected={theme === 'Light'} onClick={() => setGlobalTheme('Light')} />
            <ThemeCard icon={MonitorIcon} label="System" selected={false} onClick={() => {
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
              setGlobalTheme(prefersDark ? 'Dark' : 'Light')
            }} />
          </div>
        </SectionCard>

        <SectionCard title="Accent Color">
          <div className="flex items-center gap-4">
            {accentColors.map((c) => (
              <button
                key={c.value}
                onClick={() => setAccent(c.value)}
                className="group relative"
                aria-label={`Select ${c.name} accent`}
              >
                <div
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                    accent === c.value ? 'scale-110' : 'border-transparent group-hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: c.value,
                    borderColor: accent === c.value ? c.value : 'transparent',
                    boxShadow: accent === c.value ? `0 0 0 3px ${c.value}33` : 'none',
                  }}
                />
                {accent === c.value && (
                  <Check size={14} className="absolute inset-0 m-auto text-white" strokeWidth={3} />
                )}
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="UI Density">
          <SegmentedControl
            options={['Compact', 'Comfortable', 'Spacious']}
            value={density}
            onChange={(v) => setDensity(v as typeof density)}
          />
        </SectionCard>

        <SectionCard title="Animations">
          <ToggleRow title="Enable animations" description="Page transitions, micro-interactions, and scroll animations." checked={animations} onCheckedChange={setAnimations} />
        </SectionCard>
      </div>

      {/* Preview panel */}
      <div className="xl:col-span-1">
        <div className="sticky top-4">
          <SectionCard title="Preview">
            <div
              className="rounded-xl p-4 border transition-all duration-300"
              style={{
                backgroundColor: theme === 'Light' ? 'off-white-2' : 'az-black',
                borderColor: theme === 'Light' ? 'gray-200' : 'dark-border',
                padding: density === 'Compact' ? '8px' : density === 'Spacious' ? '24px' : '16px',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: accent }}>A</div>
                <div>
                  <p className="text-sm font-medium" style={{ color: theme === 'Light' ? 'gray-950' : 'dark-primary' }}>Sample Card</p>
                  <p className="text-xs" style={{ color: theme === 'Light' ? 'gray-550' : 'dark-muted' }}>Preview your settings</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: accent, opacity: 0.3 }} />
                <div className="h-2 flex-1 rounded-full" style={{ backgroundColor: accent, opacity: 0.3 }} />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs" style={{ color: theme === 'Light' ? 'gray-550' : 'dark-secondary' }}>Density: {density}</span>
                <div className="w-8 h-4 rounded-full relative" style={{ backgroundColor: accent }}>
                  <div className="absolute right-0.5 top-0.5 w-3 h-3 rounded-full bg-white" />
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
