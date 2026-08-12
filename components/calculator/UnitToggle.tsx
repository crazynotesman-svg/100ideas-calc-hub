'use client';

import { useTranslations } from 'next-intl';
import { useUnitSystem } from '@/store/useUnitSystem';
import { cn } from '@/lib/utils';

/** Segmented metric/imperial switch. Fixed width so switching never reflows the header. */
export function UnitToggle({ className }: { className?: string }) {
  const t = useTranslations('common');
  const { unitSystem, setUnitSystem } = useUnitSystem();

  const options: Array<{ value: 'metric' | 'imperial'; label: string }> = [
    { value: 'metric', label: t('metric') },
    { value: 'imperial', label: t('imperial') }
  ];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {t('unitSystem')}
      </span>
      <div
        role="radiogroup"
        aria-label={t('unitSystem')}
        className="inline-flex h-9 items-center rounded-md border bg-muted/50 p-0.5"
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={unitSystem === option.value}
            onClick={() => setUnitSystem(option.value)}
            className={cn(
              'h-8 w-[74px] rounded-[5px] text-xs font-medium transition-colors',
              unitSystem === option.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
