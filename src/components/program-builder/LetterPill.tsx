import { cn } from '../../lib/utils'

interface LetterPillProps {
  notation: string
  className?: string
}

export default function LetterPill({ notation, className }: LetterPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-sm font-bold min-w-[40px] text-center',
        'bg-[#00AEEF]/10 text-[#00AEEF]',
        className
      )}
    >
      {notation}
    </span>
  )
}
