export function SectionCard({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-az-black-card border border-dark-border rounded-xl p-5 ${className}`}>
      <h3 className="text-base font-semibold text-dark-primary mb-4">{title}</h3>
      {children}
    </div>
  );
}
