import { getTranslations } from 'next-intl/server';
import { Activity, ArrowRight, Plane, TrendingUp } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import type { Locale } from '@/config/i18n.config';
import { calculatorRoute, type CalculatorMeta } from '@/config/calculators.config';

const icons = {
  plane: Plane,
  'trending-up': TrendingUp,
  activity: Activity
} as const;

/**
 * Listing card used on the homepage and the calculators index.
 * Server-rendered, fixed internal spacing — the grid never reflows after hydration.
 */
export async function CalculatorCard({
  locale,
  meta,
  className
}: {
  locale: Locale;
  meta: CalculatorMeta;
  className?: string;
}) {
  const t = await getTranslations({ locale, namespace: `calculators.${meta.id}` });
  const tCat = await getTranslations({ locale, namespace: 'categories' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const Icon = icons[meta.icon];

  return (
    <Link
      href={calculatorRoute(meta)}
      className={cn(
        'group flex flex-col rounded-lg border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            'grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-primary',
            meta.accent
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          {tCat(`${meta.category}.name`)}
        </span>
      </div>

      <h3 className="mt-3.5 text-[15px] font-semibold leading-snug">{t('name')}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{t('intro')}</p>

      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
        {tc('openCalculator')}
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </span>
    </Link>
  );
}
