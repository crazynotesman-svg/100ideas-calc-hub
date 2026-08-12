import { cn } from '@/lib/utils';

type AdFormat = 'sidebar' | 'sticky-sidebar' | 'leaderboard' | 'in-content';

/**
 * Reserved advertising containers.
 * The box is rendered at its final size from the very first paint — an ad script that loads
 * 2 seconds later drops into an already-reserved hole, so it cannot contribute to CLS.
 */
const sizes: Record<AdFormat, string> = {
  sidebar: 'h-[600px] w-full max-w-[300px]',
  'sticky-sidebar': 'h-[600px] w-full max-w-[300px]',
  leaderboard: 'h-[90px] w-full',
  'in-content': 'h-[250px] w-full'
};

export function AdSlot({
  format = 'sidebar',
  label,
  slotId,
  className
}: {
  format?: AdFormat;
  label: string;
  slotId: string;
  className?: string;
}) {
  return (
    <aside
      aria-label={label}
      data-ad-slot={slotId}
      className={cn('ad-shell shrink-0', sizes[format], className)}
    >
      <span className="select-none uppercase tracking-widest">{label}</span>
    </aside>
  );
}
