import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'button' | 'card';
}

export function Skeleton({ className, variant = 'text' }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-300 dark:bg-gray-700 rounded';

  if (variant === 'button') {
    return (
      <div
        className={cn(
          baseClasses,
          'h-9 w-full',
          className
        )}
      />
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={cn(
          baseClasses,
          'h-24 w-full',
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        baseClasses,
        'h-4 w-full',
        className
      )}
    />
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="button" />
      ))}
    </div>
  );
}

