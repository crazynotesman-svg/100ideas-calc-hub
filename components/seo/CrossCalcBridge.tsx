'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Activity, ArrowRight, Plane, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { calculatorRoute, getCalculatorById, type CalculatorMeta } from '@/config/calculators.config';

const NEXT: Record<string, string> = { tdee: 'fire', fire: 'schengen', schengen: 'tdee', compound: 'fire' };
const ICON = { plane: Plane, 'trending-up': TrendingUp, activity: Activity } as const;
const RING: Record<string, string> = {
  fire: 'border-emerald-500/30 bg-emerald-500/5',
  schengen: 'border-sky-500/30 bg-sky-500/5',
  tdee: 'border-orange-500/30 bg-orange-500/5',
  compound: 'border-violet-500/30 bg-violet-500/5'
};
const CHIP: Record<string, string> = {
  fire: 'bg-emerald-500/15 text-emerald-600',
  schengen: 'bg-sky-500/15 text-sky-600',
  tdee: 'bg-orange-500/15 text-orange-600',
  compound: 'bg-violet-500/15 text-violet-600'
};

type CalcId = 'tdee' | 'fire' | 'schengen' | 'compound';

interface CrossCalcBridgeProps {
  from: CalcId;
  /**
   * Optional query-string params to hand off to the target calculator. Left empty on
   * every current route because no source output maps cleanly onto a target input —
   * we don't fabricate values. The plumbing is here for when a genuine mapping exists.
   */
  query?: Record<string, string>;
}

/**
 * Cross-Calculator Smart Bridge.
 *
 * A contextual CTA that nudges the user toward the next relevant calculator based on
 * the one they just used: TDEE → FIRE (budget for early retirement), FIRE → Schengen
 * (visa compliance for the traveling retiree), Schengen → TDEE (nutrition on the road).
 *
 * Content is fixed per `from`, so this card renders identically on first paint and after
 * hydration → zero CLS.
 */
export function CrossCalcBridge({ from, query }: CrossCalcBridgeProps) {
  const t = useTranslations('common.bridge');
  const targetId = NEXT[from];
  const target = getCalculatorById(targetId) as CalculatorMeta | undefined;
  if (!target) return null;

  const tName = useTranslations(`calculators.${targetId}`);
  const Icon = ICON[target.icon];
  // next-intl <Link> auto-prepends the locale, so the href must be locale-less.
  const href =
    calculatorRoute(target) + (query ? `?${new URLSearchParams(query).toString()}` : '');

  return (
    <Card className={`border-2 ${RING[targetId]}`}>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${CHIP[targetId]}`}>
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t('heading')}
            </p>
            <p className="mt-0.5 text-base font-semibold">{t(`${from}Title`)}</p>
            <p className="mt-1 max-w-prose text-sm text-muted-foreground">{t(`${from}Body`)}</p>
          </div>
        </div>
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {t('cta', { name: tName('name') })}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </CardContent>
    </Card>
  );
}
