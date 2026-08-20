'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Activity, ArrowRight, Plane, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { calculatorRoute, getCalculatorById, type CalculatorMeta } from '@/config/calculators.config';

/**
 * Next-calculator map. A source calculator may target several destinations
 * (mortgage → FIRE + Compound): the first entry is the primary card with
 * source-specific copy, additional targets use the generic secondary copy.
 */
const NEXT: Record<string, string | string[]> = {
  tdee: 'fire',
  fire: 'schengen',
  schengen: 'tdee',
  compound: ['fire', 'credit-card-payoff'],
  mortgage: ['fire', 'compound', 'lease-vs-buy', 'mortgage-refinance'],
  'body-fat-bmi': 'tdee',
  'auto-loan': ['mortgage', 'lease-vs-buy', 'compound'],
  'student-loan': ['mortgage', 'auto-loan', 'compound'],
  'lease-vs-buy': ['auto-loan', 'mortgage', 'compound'],
  'credit-card-payoff': ['student-loan', 'auto-loan', 'compound'],
  'mortgage-refinance': ['mortgage', 'auto-loan', 'compound', 'credit-card-payoff']
};
const ICON = { plane: Plane, 'trending-up': TrendingUp, activity: Activity } as const;
const RING: Record<string, string> = {
  fire: 'border-emerald-500/30 bg-emerald-500/5',
  schengen: 'border-sky-500/30 bg-sky-500/5',
  tdee: 'border-orange-500/30 bg-orange-500/5',
  compound: 'border-violet-500/30 bg-violet-500/5',
  mortgage: 'border-blue-500/30 bg-blue-500/5',
  'body-fat-bmi': 'border-rose-500/30 bg-rose-500/5',
  'auto-loan': 'border-yellow-500/30 bg-yellow-500/5',
  'student-loan': 'border-cyan-500/30 bg-cyan-500/5',
  'lease-vs-buy': 'border-emerald-500/30 bg-emerald-500/5',
  'credit-card-payoff': 'border-amber-500/30 bg-amber-500/5',
  'mortgage-refinance': 'border-indigo-500/30 bg-indigo-500/5'
};
const CHIP: Record<string, string> = {
  fire: 'bg-emerald-500/15 text-emerald-600',
  schengen: 'bg-sky-500/15 text-sky-600',
  tdee: 'bg-orange-500/15 text-orange-600',
  compound: 'bg-violet-500/15 text-violet-600',
  mortgage: 'bg-blue-500/15 text-blue-600',
  'body-fat-bmi': 'bg-rose-500/15 text-rose-600',
  'auto-loan': 'bg-yellow-500/15 text-yellow-600',
  'student-loan': 'bg-cyan-500/15 text-cyan-600',
  'lease-vs-buy': 'bg-emerald-500/15 text-emerald-600',
  'credit-card-payoff': 'bg-amber-500/15 text-amber-600',
  'mortgage-refinance': 'bg-indigo-500/15 text-indigo-600'
};

type CalcId =
  | 'tdee'
  | 'fire'
  | 'schengen'
  | 'compound'
  | 'mortgage'
  | 'body-fat-bmi'
  | 'auto-loan'
  | 'student-loan'
  | 'lease-vs-buy'
  | 'credit-card-payoff'
  | 'mortgage-refinance';

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
 * (visa compliance for the traveling retiree), Schengen → TDEE (nutrition on the road),
 * mortgage → FIRE + Compound (retire the debt, then grow wealth).
 *
 * Content is fixed per `from`, so these cards render identically on first paint and
 * after hydration → zero CLS.
 */
export function CrossCalcBridge({ from, query }: CrossCalcBridgeProps) {
  const t = useTranslations('common.bridge');
  const tNames = useTranslations('calculators');
  const targetIds = (Array.isArray(NEXT[from]) ? NEXT[from] : [NEXT[from]]) as CalcId[];

  return (
    <div className="space-y-3">
      {targetIds.map((targetId, index) => {
        const target = getCalculatorById(targetId) as CalculatorMeta | undefined;
        if (!target) return null;
        const Icon = ICON[target.icon];
        const primary = index === 0;
        const title = primary ? t(`${from}Title`) : t('secondaryTitle', { name: tNames(`${targetId}.name`) });
        const body = primary ? t(`${from}Body`) : t('secondaryBody', { name: tNames(`${targetId}.name`) });
        // next-intl <Link> auto-prepends the locale, so the href must be locale-less.
        const href =
          calculatorRoute(target) + (query ? `?${new URLSearchParams(query).toString()}` : '');

        return (
          <Card key={targetId} className={`border-2 ${RING[targetId]}`}>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${CHIP[targetId]}`}>
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t('heading')}
                  </p>
                  <p className="mt-0.5 text-base font-semibold">{title}</p>
                  <p className="mt-1 max-w-prose text-sm text-muted-foreground">{body}</p>
                </div>
              </div>
              <Link
                href={href}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {t('cta', { name: tNames(`${targetId}.name`) })}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
