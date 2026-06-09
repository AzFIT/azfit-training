import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (p: number) => void
}) {
  if (totalPages <= 1) return null

  const pages: (number | string)[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg text-light-secondary hover:text-light-primary hover:bg-light-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronDown size={16} className="rotate-90" />
      </button>
      {pages.map((p, i) =>
        typeof p === 'string' ? (
          <span key={`dots-${i}`} className="text-light-muted px-1">{p}</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              'w-9 h-9 rounded-lg text-sm font-medium transition-colors',
              p === currentPage
                ? 'bg-cyan text-white'
                : 'text-light-secondary hover:text-light-primary hover:bg-light-hover'
            )}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg text-light-secondary hover:text-light-primary hover:bg-light-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronDown size={16} className="-rotate-90" />
      </button>
    </div>
  )
}
