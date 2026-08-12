import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0–100 */
  value: number;
  indicatorClassName?: string;
  label?: string;
}

/**
 * Deterministic, CSS-only progress bar. The track is always rendered at full size,
 * only the indicator width animates -> no layout shift while recalculating.
 */
export function Progress({ value, className, indicatorClassName, label, ...props }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      aria-label={label}
      className={cn('relative h-3 w-full overflow-hidden rounded-full bg-secondary', className)}
      {...props}
    >
      <div
        className={cn('h-full rounded-full bg-primary transition-[width] duration-300', indicatorClassName)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
