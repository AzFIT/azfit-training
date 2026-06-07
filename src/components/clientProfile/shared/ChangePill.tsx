import { TrendingDown, TrendingUp } from 'lucide-react';

export function ChangePill({ value, inverse = false, unit }: { value: number; inverse?: boolean; unit?: string }) {
  const isPositive = value > 0;
  const isGood = inverse ? !isPositive : isPositive;
  const label = value > 0 ? `+${value}${unit || ''}` : `${value}${unit || ''}`;
  if (value === 0) return <span className="text-xs font-semibold text-dark-muted bg-[rgba(107,107,107,0.1)] px-2 py-0.5 rounded-full">0</span>;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${isGood ? 'text-success bg-[rgba(34,197,94,0.1)]' : 'text-danger bg-[rgba(239,68,68,0.1)]'}`}>
      {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {label}
    </span>
  );
}
