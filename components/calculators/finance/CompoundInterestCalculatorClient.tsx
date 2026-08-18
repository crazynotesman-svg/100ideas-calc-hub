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
import { Download, PiggyBank, TrendingUp, Vault } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { NumberField } from '@/components/ui/number-field';
import { localeMeta, type Locale } from '@/config/i18n.config';
import { calculateCompound, type CompoundInput } from '@/lib/calculators/finance/compound';
import { toNumber } from '@/lib/utils';

const defaults: CompoundInput = {
  initialPrincipal: 10000,
  monthlyContribution: 500,
  annualReturnRate: 7,
  years: 20,
  compoundingFrequency: 12
};

/** Flat URL-query field map for CompoundInterestCalculator. Defaults are omitted from the URL. */
const COMPOUND_FIELDS = {
  principal: { default: '10000' },
  deposit: { default: '500' },
  rate: { default: '7' },
  years: { default: '20' },
  freq: { default: '12' }
};

const COMPOUND_URL_KEY: Partial<Record<keyof CompoundInput, keyof typeof COMPOUND_FIELDS>> = {
  initialPrincipal: 'principal',
  monthlyContribution: 'deposit',
  annualReturnRate: 'rate',
  years: 'years',
  compoundingFrequency: 'freq'
};

const FREQ_OPTIONS = [
  { value: 1, labelKey: 'frequencyAnnual' as const },
  { value: 2, labelKey: 'frequencySemiannual' as const },
  { value: 4, labelKey: 'frequencyQuarterly' as const },
  { value: 12, labelKey: 'frequencyMonthly' as const }
];

export function CompoundInterestCalculatorClient({
  initialState,
  initialQuery,
  cardTitle
}: {
  initialState?: Partial<CompoundInput>;
  initialQuery?: Record<string, string>;
  cardTitle?: string;
} = {}) {
  const t = useTranslations('calculators.compound.ui');
  const tc = useTranslations('common');
  const tName = useTranslations('calculators.compound');
  const locale = useLocale() as Locale;

  // Seed from a pSEO preset so pre-filled inputs appear in the static HTML with zero layout shift.
  const [input, setInput] = useState<CompoundInput>(() => ({ ...defaults, ...(initialState || {}) }));
  const [mounted, setMounted] = useState(false);

  const { values, setField, hydrated, shareUrl, reset } = useCalculatorState(COMPOUND_FIELDS, initialQuery);

  useEffect(() => setMounted(true), []);

  // Once URL params are read (post-mount), apply them to the calculator inputs.
  useEffect(() => {
    if (!hydrated) return;
    setInput({
      initialPrincipal: toNumber(values.principal, defaults.initialPrincipal),
      monthlyContribution: toNumber(values.deposit, defaults.monthlyContribution),
      annualReturnRate: toNumber(values.rate, defaults.annualReturnRate),
      years: toNumber(values.years, defaults.years),
      compoundingFrequency: toNumber(values.freq, defaults.compoundingFrequency)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const result = useMemo(() => calculateCompound(input), [input]);

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
      { label: t('futureValue'), value: money.format(result.futureValue) },
      { label: t('totalPrincipal'), value: money.format(result.totalPrincipal) },
      { label: t('totalInterest'), value: money.format(result.totalInterest) }
    ],
    [result, money, t]
  );

  const set = <K extends keyof CompoundInput>(key: K, value: CompoundInput[K]) => {
    setInput((prev) => ({ ...prev, [key]: value }));
    const urlKey = COMPOUND_URL_KEY[key];
    if (urlKey) setField(urlKey, String(value));
  };

  const chartData = useMemo(
    () =>
      result.series.map((point) => ({
        year: point.year,
        balance: point.balance,
        contributed: point.contributed,
        interest: point.interest
      })),
    [result.series]
  );

  function exportCsv() {
    const header = ['year', 'balance', 'contributed', 'interest'];
    const rows = result.series.map((point) =>
      [point.year, point.balance, point.contributed, point.interest].join(',')
    );
    const blob = new Blob([[header.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'compound-projection.csv';
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
              id="initial-principal"
              label={`${t('initialPrincipal')} (${currency})`}
              value={input.initialPrincipal}
              min={0}
              step={1000}
              onChange={(v) => set('initialPrincipal', v)}
            />
            <NumberField
              id="monthly-contribution"
              label={`${t('monthlyContribution')} (${currency})`}
              value={input.monthlyContribution}
              min={0}
              step={50}
              onChange={(v) => set('monthlyContribution', v)}
            />
            <NumberField
              id="annual-return"
              label={`${t('annualReturn')} (%)`}
              value={input.annualReturnRate}
              min={0}
              max={30}
              step={0.1}
              onChange={(v) => set('annualReturnRate', v)}
            />
            <NumberField
              id="years"
              label={t('years')}
              value={input.years}
              min={1}
              max={60}
              step={1}
              onChange={(v) => set('years', v)}
            />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="compounding-frequency">{t('compoundingFrequency')}</Label>
              <select
                id="compounding-frequency"
                value={input.compoundingFrequency}
                onChange={(e) => set('compoundingFrequency', Number(e.target.value))}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {FREQ_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
              icon={<Vault className="h-4 w-4" aria-hidden />}
              label={t('futureValue')}
              value={money.format(result.futureValue)}
              hint={t('futureValueHint')}
            />
            <Stat
              icon={<PiggyBank className="h-4 w-4" aria-hidden />}
              label={t('totalPrincipal')}
              value={money.format(result.totalPrincipal)}
            />
            <Stat
              icon={<TrendingUp className="h-4 w-4" aria-hidden />}
              label={t('totalInterest')}
              value={money.format(result.totalInterest)}
              hint={t('interestRatio', { percent: Math.round(result.interestRatio * 100) })}
            />
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-lg border p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('cagr')}</p>
              <p className="tabular mt-1 font-semibold">{result.cagr.toFixed(1)}%</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('interestRatioLabel')}</p>
              <p className="tabular mt-1 font-semibold">
                {Math.round(result.interestRatio * 100)}%
              </p>
            </div>
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
        calculatorId="compound"
        title={cardTitle ?? tName('name')}
        highlights={highlights}
        shareUrl={shareUrl}
      />
      <CrossCalcBridge from="compound" />

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
                    <linearGradient id="compound-balance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(262 83% 58%)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="hsl(262 83% 58%)" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="compound-contributed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="compound-interest" x1="0" y1="0" x2="0" y2="1">
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
                    stroke="hsl(262 83% 58%)"
                    fill="url(#compound-balance)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="interest"
                    name={t('chartInterest')}
                    stroke="hsl(38 92% 50%)"
                    fill="url(#compound-interest)"
                    strokeWidth={1.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="contributed"
                    name={t('chartContributed')}
                    stroke="hsl(142 71% 45%)"
                    fill="url(#compound-contributed)"
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
                  <th className="px-3 py-2 text-right font-medium">{t('tableBalance')}</th>
                  <th className="hidden px-3 py-2 text-right font-medium sm:table-cell">{t('tableContributed')}</th>
                  <th className="px-3 py-2 text-right font-medium">{t('tableInterest')}</th>
                </tr>
              </thead>
              <tbody className="tabular">
                {result.series.map((point) => (
                  <tr key={point.year} className="border-t">
                    <td className="px-3 py-1.5">{point.year}</td>
                    <td className="px-3 py-1.5 text-right">{money.format(point.balance)}</td>
                    <td className="hidden px-3 py-1.5 text-right sm:table-cell">
                      {money.format(point.contributed)}
                    </td>
                    <td className="px-3 py-1.5 text-right">{money.format(point.interest)}</td>
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
