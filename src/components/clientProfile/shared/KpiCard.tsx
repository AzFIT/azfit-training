import { motion } from 'framer-motion';
import { ChangePill } from './ChangePill';

export function KpiCard({ label, value, unit, change, icon: Icon, inverse }: {
  label: string; value: string | number; unit?: string; change?: number; icon: React.ComponentType<{ size?: number; className?: string }>; inverse?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-cyan-glow to-[rgba(139,92,246,0.04)] bg-[az-black-card] border border-dark-border rounded-xl p-5 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,174,239,0.1)] transition-all duration-200"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-cyan-glow flex items-center justify-center">
          <Icon size={18} className="text-cyan" />
        </div>
        <span className="text-xs text-dark-secondary font-medium">{label}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-dark-primary font-[family-name:var(--font-space-mono)]">{value}</span>
        {unit && <span className="text-sm text-dark-secondary mb-1">{unit}</span>}
      </div>
      {change !== undefined && <div className="mt-2"><ChangePill value={change} inverse={inverse} /></div>}
    </motion.div>
  );
}
