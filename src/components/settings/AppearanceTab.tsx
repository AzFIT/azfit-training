import { useState, useEffect } from 'react'
import { Moon, Sun, Monitor, Check } from 'lucide-react'
import { SectionCard } from './SectionCard'
import { ThemeCard } from './ThemeCard'
import { SegmentedControl } from './SegmentedControl'
import { ToggleRow } from './ToggleRow'
import { useUIStore } from '@/stores/useUIStore'

const STORAGE_KEY = 'azfit-settings-appearance'

const ACCENT_COLORS = [
  { name: 'Cyan', value: 'cyan', tw: 'bg-cyan' },
  { name: 'Violet', value: 'violet', tw: 'bg-violet' },
  { name: 'Green', value: 'success', tw: 'bg-success' },
  { name: 'Pink', value: 'trainer-accent', tw: 'bg-trainer-accent' }
  { name: 'Purple', value: 'admin-accent', tw: 'bg-admin-accent' }
  { name: 'Orange', value: 'warning', tw: 'bg-warning' },
  { name: 'Red', value: 'danger', tw: 'bg-danger' },
  { name: 'Blue', value: 'blue-500', tw: 'bg-blue-500' },
]

const FONT_SIZES = ['Small', 'Medium', 'Large']
const SIDEBAR_MODES = ['Expanded', 'Collapsed', 'Auto']

type ThemeMode = 'light' | 'dark' | 'system'

interface AppearanceData {
  theme: ThemeMode
  sidebarMode: string
  accentColor: string
  fontSize: string
  animations: boolean
}

function loadAppearance(): AppearanceData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {
    theme: 'dark',
    sidebarMode: 'Expanded',
    accentColor: 'cyan',
    fontSize: 'Medium',
    animations: true,
  }
}

function saveAppearance(data: AppearanceData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function AppearanceTab() {
  const initTheme = useUIStore((s) => s.initTheme)

  const [data, setData] = useState<AppearanceData>(loadAppearance)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    initTheme()
  }, [initTheme])

  const update = <K extends keyof AppearanceData>(key: K, value: AppearanceData[K]) => {
    const next = { ...data, [key]: value }
    setData(next)
    setSaved(false)

    if (key === 'theme') {
      const mode = value as ThemeMode
      if (mode === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        const root = document.documentElement
        root.classList.remove('dark', 'light')
        root.classList.add(prefersDark ? 'dark' : 'light')
      } else {
        const root = document.documentElement
        root.classList.remove('dark', 'light')
        root.classList.add(mode)
      }
      localStorage.setItem('azfit-theme', mode === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : mode)
    }
  }

  const handleSave = () => {
    saveAppearance(data)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const resolvedTheme = data.theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : data.theme

  const fontSizeClass =
    data.fontSize === 'Small' ? 'text-sm' : data.fontSize === 'Large' ? 'text-lg' : 'text-base'

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-5">
        <SectionCard title="Theme Mode">
          <div className="grid grid-cols-3 gap-3">
            <ThemeCard icon={Moon} label="Dark" selected={data.theme === 'dark'} onClick={() => update('theme', 'dark')} />
            <ThemeCard icon={Sun} label="Light" selected={data.theme === 'light'} onClick={() => update('theme', 'light')} />
            <ThemeCard icon={Monitor} label="System" selected={data.theme === 'system'} onClick={() => update('theme', 'system')} />
          </div>
        </SectionCard>

        <SectionCard title="Sidebar Mode">
          <SegmentedControl options={SIDEBAR_MODES} value={data.sidebarMode} onChange={(v) => update('sidebarMode', v)} />
          <p className="text-dark-muted text-xs mt-2">Choose how the sidebar behaves on page load.</p>
        </SectionCard>

        <SectionCard title="Accent Color">
          <div className="flex flex-wrap items-center gap-4">
            {ACCENT_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => update('accentColor', c.value)}
                className="group relative"
                aria-label={`Select ${c.name} accent`}
              >
                <div
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                    data.accentColor === c.value ? 'scale-110' : 'border-transparent group-hover:scale-105'
                  } ${c.tw}`}
                  style={{
                    borderColor: data.accentColor === c.value ? 'currentColor' : 'transparent',
                    boxShadow: data.accentColor === c.value ? '0 0 0 3px rgba(0,174,239,0.2)' : 'none',
                  }}
                />
                {data.accentColor === c.value && (
                  <Check size={14} className="absolute inset-0 m-auto text-white" strokeWidth={3} />
                )}
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Font Size">
          <SegmentedControl options={FONT_SIZES} value={data.fontSize} onChange={(v) => update('fontSize', v)} />
        </SectionCard>

        <SectionCard title="Animations">
          <ToggleRow
            title="Enable animations"
            description="Page transitions, micro-interactions, and scroll animations."
            checked={data.animations}
            onCheckedChange={(v) => update('animations', v)}
          />
        </SectionCard>

        <button
          onClick={handleSave}
          className="bg-cyan hover:bg-cyan-hover text-white font-medium px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
        >
          {saved ? <><Check size={16} /> Saved Preferences</> : 'Save Preferences'}
        </button>
      </div>

      <div className="xl:col-span-1">
        <div className="sticky top-4">
          <SectionCard title="Preview">
            <div
              className={`rounded-xl p-4 border border-dark-border transition-all duration-300 ${fontSizeClass} ${resolvedTheme === 'light' ? 'bg-white' : 'bg-az-black'}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold bg-cyan">A</div>
                <div>
                  <p className={`font-medium ${resolvedTheme === 'light' ? 'text-gray-950' : 'text-dark-primary'}`}>Sample Card</p>
                  <p className={`text-xs ${resolvedTheme === 'light' ? 'text-gray-500' : 'text-dark-muted'}`}>Preview your settings</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-2 flex-1 rounded-full bg-cyan opacity-30" />
                <div className="h-2 flex-1 rounded-full bg-cyan opacity-30" />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className={`text-xs ${resolvedTheme === 'light' ? 'text-gray-500' : 'text-dark-secondary'}`}>Font: {data.fontSize}</span>
                <div className="w-8 h-4 rounded-full relative bg-cyan">
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
