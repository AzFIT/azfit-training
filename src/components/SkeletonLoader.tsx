/**
 * SkeletonLoader - Loading skeletons with shimmer animation
 * Variants: card, list, table, chart, text
 */
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  variant: 'card' | 'list' | 'table' | 'chart' | 'text';
  count?: number;
  className?: string;
}

export default function SkeletonLoader({ variant, count = 1, className }: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className={cn('bg-white dark:bg-[az-black-card] rounded-2xl p-6 border border-gray-200 dark:border-white/5', className)}>
            <div className="shimmer h-4 w-1/3 rounded mb-4" />
            <div className="shimmer h-8 w-2/3 rounded mb-2" />
            <div className="shimmer h-4 w-full rounded mb-2" />
            <div className="shimmer h-4 w-4/5 rounded" />
          </div>
        );
      case 'list':
        return (
          <div className={cn('space-y-3', className)}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-[az-black-card] rounded-xl border border-gray-200 dark:border-white/5">
                <div className="shimmer h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="shimmer h-4 w-1/3 rounded" />
                  <div className="shimmer h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        );
      case 'table':
        return (
          <div className={cn('bg-white dark:bg-[az-black-card] rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden', className)}>
            <div className="shimmer h-12 w-full border-b border-gray-200 dark:border-white/5" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="shimmer h-14 w-full border-b border-gray-100 dark:border-white/5 last:border-0" />
            ))}
          </div>
        );
      case 'chart':
        return (
          <div className={cn('bg-white dark:bg-[az-black-card] rounded-2xl p-6 border border-gray-200 dark:border-white/5', className)}>
            <div className="shimmer h-4 w-1/4 rounded mb-6" />
            <div className="shimmer h-48 w-full rounded-xl" />
          </div>
        );
      case 'text':
        return (
          <div className={cn('space-y-2', className)}>
            <div className="shimmer h-4 w-full rounded" />
            <div className="shimmer h-4 w-5/6 rounded" />
            <div className="shimmer h-4 w-4/6 rounded" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="mb-4 last:mb-0">{renderSkeleton()}</div>
      ))}
    </>
  );
}
