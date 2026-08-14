'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useCalculatorState } from '@/lib/hooks/useCalculatorState';
import { CopyLinkButton } from '@/components/calculator/CopyLinkButton';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Download, Flame, PiggyBank, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { localeMeta, type Locale } from '@/config/i18n.config';
import { calculateFire, type FireInput } from '@/lib/calculators/finance/fire';
import { toNumber } from '@/lib/utils';

const defaults: FireInput = {
  currentAge: 32,
  targetRetirementAge: 50,
  initialCapital: 50000,
  monthlyContribution: 1500,
  contributionGrowthRate: 2,
  annualReturnRate: 7,
  inflationRate: 2.5,
  withdrawalRate: 4,
  annualExpenses: 36000,
  horizonAge: 65
};

/** Flat URL-query field map for FireCalculator. Defaults are omitted from the URL. */
const FIRE_FIELDS = {
  age: { default: '32' },
  retire: { default: '50' },
  capital: { default: '50000' },
  contrib: { default: '1500' },
  cgrowth: { default: '2' },
  areturn: { default: '7' },
  infl: { default: '2.5' },
  withdraw: { default: '4' },
  expenses: { default: '36000' },
  horizon: { default: '65' }
};

const FIRE_URL_KEY: Partial<Record<keyof FireInput, keyof typeof FIRE_FIELDS>> = {
  currentAge: 'age',
  targetRetirementAge: 'retire',
  initialCapital: 'capital',
  monthlyContribution: 'contrib',
  contributionGrowthRate: 'cgrowth',
  annualReturnRate: 'areturn',
  inflationRate: 'infl',
  withdrawalRate: 'withdraw',
  annualExpenses: 'expenses',
  horizonAge: 'horizon'
};

export function FireCalculator() {
  const t = useTranslations('calculators.fire.ui');
  const tc = useTranslations('common');
  const locale = useLocale() as Locale;
  const [input, setInput] = useState<FireInput>(defaults);
  const [mounted, setMounted] = useState(false);

  const { values, setField, hydrated, shareUrl, reset } = useCalculatorState(FIRE_FIELDS);

  useEffect(() => setMounted(true), []);

  // Once URL params are read (post-mount), apply them to the calculator inputs.
  useEffect(() => {
    if (!hydrated) return;
    setInput({
      currentAge: toNumber(values.age, defaults.currentAge),
      targetRetirementAge: toNumber(values.retire, defaults.targetRetirementAge),
      initialCapital: toNumber(values.capital, defaults.initialCapital),
      monthlyContribution: toNumber(values.contrib, defaults.monthlyContribution),
      contributionGrowthRate: toNumber(values.cgrowth, defaults.contributionGrowthRate),
      annualReturnRate: toNumber(values.areturn, defaults.annualReturnRate),
      inflationRate: toNumber(values.infl, defaults.inflationRate),
      withdrawalRate: toNumber(values.withdraw, defaults.withdrawalRate),
      annualExpenses: toNumber(values.expenses, defaults.annualExpenses),
      horizonAge: toNumber(values.horizon, defaults.horizonAge)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const result = useMemo(() => calculateFire(input), [input]);

  const currency = localeMeta[locale].currency;
  const money = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        maximumFractionDigits: 0
      }),
    [locale, currency]
  );
  const compact = useMemo(
    () => new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }),
    [locale]
  );

  const set = <K extends keyof FireInput>(key: K, value: FireInput[K]) => {
    setInput((prev) => ({ ...prev, [key]: value }));
    const urlKey = FIRE_URL_KEY[key];
    if (urlKey) setField(urlKey, String(value));
  };

  const chartData = useMemo(
    () =>
      result.series.map((point) => ({
        age: point.age,
        nominal: point.balance,
        real: point.realBalance,
        contributed: point.contributed,
        target: point.target
      })),
    [result.series]
  );

  function exportCsv() {
    const header = ['age', 'balance', 'realBalance', 'contributed', 'growth', 'target'];
    const rows = result.series.map((point) =>
      [point.age, point.balance, point.realBalance, point.contributed, point.growth, point.target].join(',')
    );
    const blob = new Blob([[header.join(','), ...rows].join('\n')], {
      type: 'text/csv;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fire-projection.csv';
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
              id="current-age"
              label={t('currentAge')}
              value={input.currentAge}
              min={16}
              max={80}
              onChange={(v) => set('currentAge', v)}
            />
            <NumberField
              id="retirement-age"
              label={t('retirementAge')}
              value={input.targetRetirementAge}
              min={input.currentAge + 1}
              max={90}
              onChange={(v) => set('targetRetirementAge', v)}
            />
            <NumberField
              id="horizon"
              label={t('horizon')}
              value={input.horizonAge ?? 65}
              min={input.targetRetirementAge}
              max={100}
              onChange={(v) => set('horizonAge', v)}
            />
            <NumberField
              id="initial-capital"
              label={`${t('initialCapital')} (${currency})`}
              value={input.initialCapital}
              min={0}
              step={1000}
              onChange={(v) => set('initialCapital', v)}
            />
            <NumberField
              id="annual-expenses"
              label={`${t('annualExpenses')} (${currency})`}
              value={input.annualExpenses}
              min={0}
              step={1000}
              onChange={(v) => set('annualExpenses', v)}
            />
            <NumberField
              id="contribution-growth"
              label={`${t('contributionGrowth')} (%)`}
              value={input.contributionGrowthRate}
              min={0}
              max={20}
              step={0.5}
              onChange={(v) => set('contributionGrowthRate', v)}
            />
            <NumberField
              id="annual-return"
              label={`${t('annualReturn')} (%)`}
              value={input.annualReturnRate}
              min={0}
              max={20}
              step={0.1}
              onChange={(v) => set('annualReturnRate', v)}
            />
            <NumberField
              id="inflation"
              label={`${t('inflation')} (%)`}
              value={input.inflationRate}
              min={0}
              max={15}
              step={0.1}
              onChange={(v) => set('inflationRate', v)}
            />
            <NumberField
              id="withdrawal-rate"
              label={`${t('withdrawalRate')} (%)`}
              value={input.withdrawalRate}
              min={1}
              max={10}
              step={0.25}
              onChange={(v) => set('withdrawalRate', v)}
            />
          </div>

          <div className="rounded-lg border bg-muted/20 p-4">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="monthly-contribution">{t('monthlyContribution')}</Label>
              <span className="tabular text-lg font-semibold">
                {money.format(input.monthlyContribution)}
              </span>
            </div>
            <Slider
              id="monthly-contribution"
              className="mt-3"
              value={[input.monthlyContribution]}
              min={0}
              max={10000}
              step={50}
              onValueChange={([value]) => set('monthlyContribution', value)}
              aria-label={t('monthlyContribution')}
            />
            <div className="tabular mt-1.5 flex justify-between text-xs text-muted-foreground">
              <span>{money.format(0)}</span>
              <span>{money.format(10000)}</span>
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

      {/* ------------------------------------------------------------ results */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle>{tc('results')}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={result.onTrack ? 'success' : 'warning'}>
              {result.onTrack ? t('onTrack') : t('offTrack')}
            </Badge>
            <CopyLinkButton getUrl={shareUrl} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              icon={<Target className="h-4 w-4" aria-hidden />}
              label={t('fireNumber')}
              value={money.format(result.fireNumber)}
              hint={t('fireNumberHint')}
            />
            <Stat
              icon={<Flame className="h-4 w-4" aria-hidden />}
              label={t('fireAge')}
              value={result.fireAge ? `${result.fireAge} ${tc('yearsOld')}` : t('notReached')}
              hint={
                result.yearsToFire !== null
                  ? `${t('yearsToFire')}: ${t('yearsLong', { count: result.yearsToFire })}`
                  : undefined
              }
            />
            <Stat
              icon={<PiggyBank className="h-4 w-4" aria-hidden />}
              label={t('balanceAtRetirement')}
              value={money.format(result.balanceAtRetirement)}
              hint={`${t('realBalance')}: ${money.format(result.realBalanceAtRetirement)}`}
            />
            <Stat
              icon={<TrendingUp className="h-4 w-4" aria-hidden />}
              label={t('totalGrowth')}
              value={money.format(result.totalGrowth)}
              hint={t('growthShare', { percent: Math.round(result.growthShare * 100) })}
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
              <span>{t('coverage')}</span>
              <span className="tabular">{Math.round(result.coverageRatio * 100)}%</span>
            </div>
            <Progress
              value={result.coverageRatio * 100}
              indicatorClassName={result.coverageRatio >= 1 ? 'bg-emerald-500' : 'bg-primary'}
              label={t('coverage')}
            />
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {t('totalContributed')}
              </p>
              <p className="tabular mt-1 font-semibold">{money.format(result.totalContributed)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {t('sustainableIncome')}
              </p>
              <p className="tabular mt-1 font-semibold">
                {money.format(result.sustainableRealIncome)}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {t('requiredContribution')}
              </p>
              <p className="tabular mt-1 font-semibold">
                {money.format(result.requiredMonthlyContribution)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* -------------------------------------------------------------- chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>{t('chartTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Height is fixed by .chart-shell, so Recharts mounting cannot shift the page. */}
          <div className="chart-shell">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fire-nominal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(221 83% 53%)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="hsl(221 83% 53%)" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="fire-real" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" vertical={false} />
                  <XAxis
                    dataKey="age"
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
                    labelFormatter={(label) => `${t('tableAge')} ${label}`}
                    contentStyle={{
                      borderRadius: 10,
                      border: '1px solid hsl(214 32% 91%)',
                      fontSize: 13
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area
                    type="monotone"
                    dataKey="nominal"
                    name={t('chartNominal')}
                    stroke="hsl(221 83% 53%)"
                    fill="url(#fire-nominal)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="real"
                    name={t('chartReal')}
                    stroke="hsl(142 71% 45%)"
                    fill="url(#fire-real)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="contributed"
                    name={t('chartContributed')}
                    stroke="hsl(215 16% 47%)"
                    strokeWidth={1.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    name={t('chartTarget')}
                    stroke="hsl(38 92% 50%)"
                    strokeDasharray="5 4"
                    strokeWidth={1.5}
                    dot={false}
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
                  <th className="px-3 py-2 font-medium">{t('tableAge')}</th>
                  <th className="px-3 py-2 text-right font-medium">{t('tableBalance')}</th>
                  <th className="px-3 py-2 text-right font-medium">{t('tableReal')}</th>
                  <th className="hidden px-3 py-2 text-right font-medium sm:table-cell">
                    {t('tableContributed')}
                  </th>
                  <th className="hidden px-3 py-2 text-right font-medium sm:table-cell">
                    {t('tableGrowth')}
                  </th>
                </tr>
              </thead>
              <tbody className="tabular">
                {result.series.map((point) => (
                  <tr
                    key={point.age}
                    className={
                      point.reached && point.age === result.fireAge
                        ? 'bg-emerald-500/10 font-medium'
                        : 'border-t'
                    }
                  >
                    <td className="px-3 py-1.5">{point.age}</td>
                    <td className="px-3 py-1.5 text-right">{money.format(point.balance)}</td>
                    <td className="px-3 py-1.5 text-right">{money.format(point.realBalance)}</td>
                    <td className="hidden px-3 py-1.5 text-right sm:table-cell">
                      {money.format(point.contributed)}
                    </td>
                    <td className="hidden px-3 py-1.5 text-right sm:table-cell">
                      {money.format(point.growth)}
                    </td>
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

function NumberField({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step = 1
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(toNumber(event.target.value, min ?? 0))}
      />
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
