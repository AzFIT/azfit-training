export function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-[az-black-card] border border-dark-border rounded-xl p-6 mb-5">
      <h3 className="text-dark-primary text-base font-semibold mb-1">{title}</h3>
      {description && <p className="text-dark-muted text-sm mb-4">{description}</p>}
      <div className="mt-4">{children}</div>
    </div>
  )
}
