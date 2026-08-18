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
import { Banknote, CalendarClock, Download, Home, PiggyBank, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { NumberField } from '@/components/ui/number-field';
import { localeMeta, type Locale } from '@/config/i18n.config';
import { calculateMortgage, type MortgageInput } from '@/lib/calculators/finance/mortgage';
import { toNumber } from '@/lib/utils';

const defaults: MortgageInput = {
  homePrice: 500000,
  downPayment: 100000,
  loanTermYears: 30,
  annualRate: 7,
  extraMonthly: 0
};

/** Flat URL-query field map for MortgageCalculator. Defaults are omitted from the URL. */
const MORTGAGE_FIELDS = {
  price: { default: '500000' },
  down: { default: '100000' },
  years: { default: '30' },
  rate: { default: '7' },
  extra: { default: '0' }
};

const MORTGAGE_URL_KEY: Partial<Record<keyof MortgageInput, keyof typeof MORTGAGE_FIELDS>> = {
  homePrice: 'price',
  downPayment: 'down',
  loanTermYears: 'years',
  annualRate: 'rate',
  extraMonthly: 'extra'
};

export function MortgageCalculatorClient({
  initialState,
  initialQuery,
  cardTitle
}: {
  initialState?: Partial<MortgageInput>;
  initialQuery?: Record<string, string>;
  cardTitle?: string;
} = {}) {
  const t = useTranslations('calculators.mortgage.ui');
  const tc = useTranslations('common');
  const tName = useTranslations('calculators.mortgage');
  const locale = useLocale() as Locale;

  // Seed from a pSEO preset so pre-filled inputs appear in the static HTML with zero layout shift.
  const [input, setInput] = useState<MortgageInput>(() => ({ ...defaults, ...(initialState || {}) }));
  // UI-only toggle: show the down payment as a dollar amount or a percentage of the price.
  const [downMode, setDownMode] = useState<'amount' | 'percent'>('amount');
  const [mounted, setMounted] = useState(false);

  const { values, setField, hydrated, shareUrl, reset } = useCalculatorState(MORTGAGE_FIELDS, initialQuery);

  useEffect(() => setMounted(true), []);

  // Once URL params are read (post-mount), apply them to the calculator inputs.
  useEffect(() => {
    if (!hydrated) return;
    setInput({
      homePrice: toNumber(values.price, defaults.homePrice),
      downPayment: toNumber(values.down, defaults.downPayment),
      loanTermYears: toNumber(values.years, defaults.loanTermYears),
      annualRate: toNumber(values.rate, defaults.annualRate),
      extraMonthly: toNumber(values.extra, defaults.extraMonthly)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const result = useMemo(() => calculateMortgage(input), [input]);

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

  /** Key result highlights surfaced on the shareable card. */
  const highlights: ShareHighlight[] = useMemo(
    () => [
      { label: t('monthlyPayment'), value: money.format(result.monthlyPayment) },
      { label: t('totalInterest'), value: money.format(result.totalInterest) },
      { label: t('totalCost'), value: money.format(result.totalCost) }
    ],
    [result, money, t]
  );

  const set = <K extends keyof MortgageInput>(key: K, value: MortgageInput[K]) => {
    setInput((prev) => ({ ...prev, [key]: value }));
    const urlKey = MORTGAGE_URL_KEY[key];
    if (urlKey) setField(urlKey, String(value));
  };

  /** Down payment derived from the current percent when the input is in % mode. */
  const downPercent = input.homePrice > 0 ? (input.downPayment / input.homePrice) * 100 : 0;

  const onDownPercentChange = (pct: number) => {
    const amount = Math.round((input.homePrice * Math.min(100, Math.max(0, pct))) / 100);
    set('downPayment', amount);
  };

  // Cumulative principal / interest for the chart (areas grow over the term).
  const chartData = useMemo(() => {
    let principal = 0;
    let interest = 0;
    return result.series.map((point) => {
      principal += point.principal;
      interest += point.interest;
      return { year: point.year, balance: point.balance, principal, interest };
    });
  }, [result.series]);

  function exportCsv() {
    const header = ['year', 'payment', 'principal', 'interest', 'balance'];
    const rows = result.series.map((point) =>
      [point.year, point.payment, point.principal, point.interest, point.balance].join(',')
    );
    const blob = new Blob([[header.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mortgage-amortization.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  const payoffValue = `${result.payoffYears.toFixed(1)} ${tc('years')}`;

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
              id="home-price"
              label={`${t('homePrice')} (${currency})`}
              value={input.homePrice}
              min={0}
              step={10000}
              onChange={(v) => set('homePrice', v)}
            />
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="down-payment">
                  {downMode === 'amount' ? t('downAmount') : t('downPercent')}
                </Label>
                <div className="flex rounded-md border border-input text-xs">
                  <button
                    type="button"
                    aria-pressed={downMode === 'amount'}
                    onClick={() => setDownMode('amount')}
                    className={`rounded-l-md px-2 py-1 ${
                      downMode === 'amount' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    $
                  </button>
                  <button
                    type="button"
                    aria-pressed={downMode === 'percent'}
                    onClick={() => setDownMode('percent')}
                    className={`rounded-r-md px-2 py-1 ${
                      downMode === 'percent' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    %
                  </button>
                </div>
              </div>
              {downMode === 'amount' ? (
                <NumberField
                  id="down-payment"
                  label={t('downAmount')}
                  value={input.downPayment}
                  min={0}
                  step={5000}
                  onChange={(v) => set('downPayment', v)}
                />
              ) : (
                <input
                  id="down-payment-percent"
                  type="number"
                  value={Math.round(downPercent * 10) / 10}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(e) => onDownPercentChange(Number(e.target.value))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              )}
            </div>
            <NumberField
              id="loan-term"
              label={t('loanTermYears')}
              value={input.loanTermYears}
              min={1}
              max={40}
              step={1}
              onChange={(v) => set('loanTermYears', v)}
            />
            <NumberField
              id="interest-rate"
              label={`${t('annualRate')} (%)`}
              value={input.annualRate}
              min={0}
              max={20}
              step={0.05}
              onChange={(v) => set('annualRate', v)}
            />
            <div className="flex flex-col gap-1.5">
              <NumberField
                id="extra-monthly"
                label={`${t('extraMonthly')} (${currency})`}
                value={input.extraMonthly}
                min={0}
                step={50}
                onChange={(v) => set('extraMonthly', v)}
              />
              <p className="text-xs text-muted-foreground">{t('extraHint')}</p>
            </div>
          </div>
          <p className="rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            {t('loanAmountLabel')}: <span className="tabular font-medium text-foreground">{money.format(result.loanAmount)}</span>
          </p>
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
              icon={<Home className="h-4 w-4" aria-hidden />}
              label={t('monthlyPayment')}
              value={money.format(result.monthlyPayment)}
              hint={t('monthlyPaymentHint')}
            />
            <Stat
              icon={<Banknote className="h-4 w-4" aria-hidden />}
              label={t('totalInterest')}
              value={money.format(result.totalInterest)}
            />
            <Stat
              icon={<PiggyBank className="h-4 w-4" aria-hidden />}
              label={t('totalCost')}
              value={money.format(result.totalCost)}
            />
            <Stat
              icon={<CalendarClock className="h-4 w-4" aria-hidden />}
              label={t('payoffTime')}
              value={payoffValue}
              hint={result.hasExtra ? t('payoffHintExtra', { months: result.monthsSaved }) : t('payoffHintNone')}
            />
            {result.hasExtra && (
              <>
                <Stat
                  icon={<CalendarClock className="h-4 w-4" aria-hidden />}
                  label={t('monthsSaved')}
                  value={String(result.monthsSaved)}
                />
                <Stat
                  icon={<TrendingUp className="h-4 w-4" aria-hidden />}
                  label={t('interestSaved')}
                  value={money.format(result.interestSaved)}
                />
              </>
            )}
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
        calculatorId="mortgage"
        title={cardTitle ?? tName('name')}
        highlights={highlights}
        shareUrl={shareUrl}
      />
      <CrossCalcBridge from="mortgage" />

      {/* -------------------------------------------------------------- chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>{t('chartTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="chart-shell">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mortgage-balance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="mortgage-principal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="mortgage-interest" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(38 92% 50%)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(38 92% 50%)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" vertical={false} />
                  <XAxis
                    dataKey="year"
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
                    labelFormatter={(label) => `${t('tableYear')} ${label}`}
                    contentStyle={{ borderRadius: 10, border: '1px solid hsl(214 32% 91%)', fontSize: 13 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    name={t('chartBalance')}
                    stroke="hsl(217 91% 60%)"
                    fill="url(#mortgage-balance)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="interest"
                    name={t('chartInterest')}
                    stroke="hsl(38 92% 50%)"
                    fill="url(#mortgage-interest)"
                    strokeWidth={1.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="principal"
                    name={t('chartPrincipal')}
                    stroke="hsl(142 71% 45%)"
                    fill="url(#mortgage-principal)"
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
                  <th className="px-3 py-2 font-medium">{t('tableYear')}</th>
                  <th className="hidden px-3 py-2 text-right font-medium sm:table-cell">{t('tablePayment')}</th>
                  <th className="px-3 py-2 text-right font-medium">{t('tablePrincipal')}</th>
                  <th className="px-3 py-2 text-right font-medium">{t('tableInterest')}</th>
                  <th className="px-3 py-2 text-right font-medium">{t('tableBalance')}</th>
                </tr>
              </thead>
              <tbody className="tabular">
                {result.series.map((point) => (
                  <tr key={point.year} className="border-t">
                    <td className="px-3 py-1.5">{point.year}</td>
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
