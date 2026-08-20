'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useCalculatorState } from '@/lib/hooks/useCalculatorState';
import { CopyLinkButton } from '@/components/calculator/CopyLinkButton';
import { ResultShareCard, type ShareHighlight } from '@/components/calculator/ResultShareCard';
import { CrossCalcBridge } from '@/components/seo/CrossCalcBridge';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { AlertTriangle, Banknote, CalendarClock, CreditCard, Download, PiggyBank, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { NumberField } from '@/components/ui/number-field';
import { localeMeta, type Locale } from '@/config/i18n.config';
import {
  calculateCreditCardPayoff,
  type CreditCardPayoffInput,
  type CreditCardStrategy
} from '@/lib/calculators/finance/credit-card-payoff';
import { toNumber } from '@/lib/utils';

const defaults: CreditCardPayoffInput = {
  balance: 10000,
  apr: 22,
  strategy: 'fixed',
  minimumPct: 1,
  minimumFloor: 25,
  fixedMonthly: 300,
  extraMonthly: 0
};

/** Flat URL-query field map for CreditCardPayoffCalculator. Defaults are omitted from the URL. */
const CREDITCARDPAYOFF_FIELDS = {
  balance: { default: '10000' },
  apr: { default: '22' },
  strategy: { default: 'fixed' },
  minPct: { default: '1' },
  floor: { default: '25' },
  fixed: { default: '300' },
  extra: { default: '0' }
};

const CREDITCARDPAYOFF_URL_KEY: Partial<
  Record<keyof CreditCardPayoffInput, keyof typeof CREDITCARDPAYOFF_FIELDS>
> = {
  balance: 'balance',
  apr: 'apr',
  strategy: 'strategy',
  minimumPct: 'minPct',
  minimumFloor: 'floor',
  fixedMonthly: 'fixed',
  extraMonthly: 'extra'
};

export function CreditCardPayoffCalculatorClient({
  initialState,
  initialQuery,
  cardTitle
}: {
  initialState?: Partial<CreditCardPayoffInput>;
  initialQuery?: Record<string, string>;
  cardTitle?: string;
} = {}) {
  const t = useTranslations('calculators.credit-card-payoff.ui');
  const tc = useTranslations('common');
  const tName = useTranslations('calculators.credit-card-payoff');
  const locale = useLocale() as Locale;

  // Seed from a pSEO preset so pre-filled inputs appear in the static HTML with zero layout shift.
  const [input, setInput] = useState<CreditCardPayoffInput>(() => ({ ...defaults, ...(initialState || {}) }));
  const [mounted, setMounted] = useState(false);

  const { values, setField, hydrated, shareUrl, reset } = useCalculatorState(CREDITCARDPAYOFF_FIELDS, initialQuery);

  useEffect(() => setMounted(true), []);

  // Once URL params are read (post-mount), apply them to the calculator inputs.
  useEffect(() => {
    if (!hydrated) return;
    setInput({
      balance: toNumber(values.balance, defaults.balance),
      apr: toNumber(values.apr, defaults.apr),
      strategy: (values.strategy === 'minimum' ? 'minimum' : 'fixed') as CreditCardStrategy,
      minimumPct: toNumber(values.minPct, defaults.minimumPct),
      minimumFloor: toNumber(values.floor, defaults.minimumFloor),
      fixedMonthly: toNumber(values.fixed, defaults.fixedMonthly),
      extraMonthly: toNumber(values.extra, defaults.extraMonthly)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const result = useMemo(() => calculateCreditCardPayoff(input), [input]);

  const currency = localeMeta[locale].currency;
  const money = useMemo(
    () =>
      new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }),
    [locale, currency]
  );
  const compact = useMemo(
    () => new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }),
    [locale]
  );

  // Estimated payoff date — computed client-side after mount to stay hydration-safe.
  const payoffDate = useMemo(() => {
    if (!mounted || result.payoffMonths === null) return null;
    const d = new Date(Date.now() + result.payoffMonths * 30.44 * 86400000);
    return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short' }).format(d);
  }, [mounted, result.payoffMonths, locale]);

  const highlights: ShareHighlight[] = useMemo(
    () => [
      { label: t('monthlyPayment'), value: money.format(result.monthlyPayment) },
      { label: t('payoffMonths'), value: result.payoffMonths === null ? '—' : String(result.payoffMonths) },
      { label: t('totalInterest'), value: money.format(result.totalInterest ?? 0) }
    ],
    [result, money, t]
  );

  const set = <K extends keyof CreditCardPayoffInput>(key: K, value: CreditCardPayoffInput[K]) => {
    setInput((prev) => ({ ...prev, [key]: value }));
    const urlKey = CREDITCARDPAYOFF_URL_KEY[key];
    if (urlKey) setField(urlKey, String(value));
  };

  // Cumulative principal / interest for the chart.
  const chartData = useMemo(() => {
    let principal = 0;
    let interest = 0;
    return result.schedule.map((point) => {
      principal += point.principal;
      interest += point.interest;
      return { month: point.month, balance: point.balance, principal, interest };
    });
  }, [result.schedule]);

  function exportCsv() {
    const header = ['month', 'payment', 'principal', 'interest', 'balance'];
    const rows = result.schedule.map((point) =>
      [point.month, point.payment, point.principal, point.interest, point.balance].join(',')
    );
    const blob = new Blob([[header.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'credit-card-payoff-schedule.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- inputs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{t('inputsTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <NumberField
              id="balance"
              label={`${t('balance')} (${currency})`}
              value={input.balance}
              min={0}
              step={500}
              onChange={(v) => set('balance', v)}
            />
            <NumberField
              id="apr"
              label={`${t('apr')} (%)`}
              value={input.apr}
              min={0}
              max={40}
              step={0.5}
              onChange={(v) => set('apr', v)}
            />
            <div className="flex flex-col gap-1.5">
              <Label>{t('strategy')}</Label>
              <div className="flex rounded-md border border-input text-sm">
                {(['minimum', 'fixed'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={input.strategy === s}
                    onClick={() => set('strategy', s)}
                    className={`flex-1 rounded-md px-3 py-2 font-medium ${
                      input.strategy === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {t(s === 'minimum' ? 'strategyMinimum' : 'strategyFixed')}
                  </button>
                ))}
              </div>
            </div>
            {input.strategy === 'minimum' ? (
              <>
                <NumberField
                  id="minimum-pct"
                  label={t('minimumPct')}
                  value={input.minimumPct}
                  min={0}
                  max={10}
                  step={0.5}
                  onChange={(v) => set('minimumPct', v)}
                />
                <NumberField
                  id="minimum-floor"
                  label={`${t('minimumFloor')} (${currency})`}
                  value={input.minimumFloor}
                  min={0}
                  step={5}
                  onChange={(v) => set('minimumFloor', v)}
                />
              </>
            ) : (
              <NumberField
                id="fixed-monthly"
                label={`${t('fixedMonthly')} (${currency})`}
                value={input.fixedMonthly}
                min={0}
                step={25}
                onChange={(v) => set('fixedMonthly', v)}
              />
            )}
            <div className="flex flex-col gap-1.5">
              <NumberField
                id="extra-monthly"
                label={`${t('extraMonthly')} (${currency})`}
                value={input.extraMonthly}
                min={0}
                step={25}
                onChange={(v) => set('extraMonthly', v)}
              />
              <p className="text-xs text-muted-foreground">{t('extraHint')}</p>
            </div>
          </div>

          {result.warning && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
            >
              <p className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4" aria-hidden />
                {t('warningTitle')}
              </p>
              <p className="mt-1">{t('warningBody', { interest: money.format(result.breakEvenInterest) })}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------ results */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle>{tc('results')}</CardTitle>
          <CopyLinkButton getUrl={shareUrl} />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Stat
              icon={<CreditCard className="h-4 w-4" aria-hidden />}
              label={t('monthlyPayment')}
              value={money.format(result.monthlyPayment)}
            />
            <Stat
              icon={<CalendarClock className="h-4 w-4" aria-hidden />}
              label={t('payoffMonths')}
              value={result.payoffMonths === null ? '—' : `${result.payoffMonths} ${t('monthsUnit')}`}
            />
            <Stat
              icon={<TrendingUp className="h-4 w-4" aria-hidden />}
              label={t('totalInterest')}
              value={money.format(result.totalInterest ?? 0)}
            />
            <Stat
              icon={<PiggyBank className="h-4 w-4" aria-hidden />}
              label={t('interestSaved')}
              value={money.format(result.interestSaved ?? 0)}
              hint={t('savedVsMin')}
            />
            <Stat
              icon={<CalendarClock className="h-4 w-4" aria-hidden />}
              label={t('payoffDate')}
              value={payoffDate ?? '…'}
            />
            <Stat
              icon={<Banknote className="h-4 w-4" aria-hidden />}
              label={t('totalPaid')}
              value={money.format(result.totalPaid ?? 0)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setInput(defaults);
                reset();
              }}
            >
              {tc('resetDefaults')}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={exportCsv}>
              <Download className="h-4 w-4" aria-hidden />
              {tc('exportCsv')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* -------------------------------------------- share card + cross-calc bridge */}
      <ResultShareCard
        locale={locale}
        calculatorId="credit-card-payoff"
        title={cardTitle ?? tName('name')}
        highlights={highlights}
        shareUrl={shareUrl}
      />
      <CrossCalcBridge from="credit-card-payoff" />

      {/* -------------------------------------------------------------- chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>{t('chartTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="chart-shell">
            {mounted && result.schedule.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ccp-balance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(32 95% 44%)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="hsl(32 95% 44%)" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="ccp-principal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="ccp-interest" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(38 92% 50%)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(38 92% 50%)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: 'hsl(215 16% 47%)' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tickFormatter={(value: number) => compact.format(value)}
                    tick={{ fontSize: 12, fill: 'hsl(215 16% 47%)' }}
                    tickLine={false}
                    axisLine={false}
                    width={54}
                  />
                  <Tooltip
                    formatter={(value: number) => money.format(value)}
                    labelFormatter={(label) => `${t('tableMonth')} ${label}`}
                    contentStyle={{ borderRadius: 10, border: '1px solid hsl(214 32% 91%)', fontSize: 13 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    name={t('chartBalance')}
                    stroke="hsl(32 95% 44%)"
                    fill="url(#ccp-balance)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="interest"
                    name={t('chartInterest')}
                    stroke="hsl(38 92% 50%)"
                    fill="url(#ccp-interest)"
                    strokeWidth={1.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="principal"
                    name={t('chartPrincipal')}
                    stroke="hsl(142 71% 45%)"
                    fill="url(#ccp-principal)"
                    strokeWidth={1.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* -------------------------------------------------------------- table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>{t('tableTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[320px] overflow-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                <tr className="text-left">
                  <th className="px-3 py-2 font-medium">{t('tableMonth')}</th>
                  <th className="hidden px-3 py-2 text-right font-medium sm:table-cell">{t('tablePayment')}</th>
                  <th className="px-3 py-2 text-right font-medium">{t('tablePrincipal')}</th>
                  <th className="px-3 py-2 text-right font-medium">{t('tableInterest')}</th>
                  <th className="px-3 py-2 text-right font-medium">{t('tableBalance')}</th>
                </tr>
              </thead>
              <tbody className="tabular">
                {result.schedule.map((point) => (
                  <tr key={point.month} className="border-t">
                    <td className="px-3 py-1.5">{point.month}</td>
                    <td className="hidden px-3 py-1.5 text-right sm:table-cell">{money.format(point.payment)}</td>
                    <td className="px-3 py-1.5 text-right">{money.format(point.principal)}</td>
                    <td className="px-3 py-1.5 text-right">{money.format(point.interest)}</td>
                    <td className="px-3 py-1.5 text-right">{money.format(point.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  hint
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="result-shell">
      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </p>
      <p className="tabular mt-1 text-xl font-bold leading-tight">{value}</p>
      {hint && <p className="mt-1 text-xs leading-5 text-muted-foreground">{hint}</p>}
    </div>
  );
}
