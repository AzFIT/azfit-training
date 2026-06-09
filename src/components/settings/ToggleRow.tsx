import { Switch } from '@/components/ui/switch'

export function ToggleRow({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string
  description?: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-dark-divider last:border-0">
      <div className="flex-1 pr-4">
        <p className="text-dark-primary text-sm font-medium">{title}</p>
        {description && <p className="text-dark-muted text-xs mt-0.5">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
