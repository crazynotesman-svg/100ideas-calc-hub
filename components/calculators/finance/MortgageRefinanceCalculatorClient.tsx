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
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { AlertTriangle, Banknote, Download, Home, PiggyBank, Scale, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { NumberField } from '@/components/ui/number-field';
import { localeMeta, type Locale } from '@/config/i18n.config';
import {
  calculateMortgageRefinance,
  type FeePayment,
  type MortgageRefinanceInput
} from '@/lib/calculators/finance/mortgage-refinance';
import { toNumber } from '@/lib/utils';

const defaults: MortgageRefinanceInput = {
  currentBalance: 300000,
  currentRate: 6.5,
  remainingYears: 25,
  newRate: 5.0,
  newTermYears: 25,
  closingCosts: 5000,
  feesPaid: 'cash',
  cashOutAmount: 0
};

/** Flat URL-query field map for MortgageRefinanceCalculator. Defaults are omitted from the URL. */
const MORTGAGEREFINANCE_FIELDS = {
  balance: { default: '300000' },
  currentRate: { default: '6.5' },
  remaining: { default: '25' },
  newRate: { default: '5' },
  newTerm: { default: '25' },
  costs: { default: '5000' },
  fees: { default: 'cash' },
  cashOut: { default: '0' }
};

const MORTGAGEREFINANCE_URL_KEY: Partial<
  Record<keyof MortgageRefinanceInput, keyof typeof MORTGAGEREFINANCE_FIELDS>
> = {
  currentBalance: 'balance',
  currentRate: 'currentRate',
  remainingYears: 'remaining',
  newRate: 'newRate',
  newTermYears: 'newTerm',
  closingCosts: 'costs',
  feesPaid: 'fees',
  cashOutAmount: 'cashOut'
};

export function MortgageRefinanceCalculatorClient({
  initialState,
  initialQuery,
  cardTitle
}: {
  initialState?: Partial<MortgageRefinanceInput>;
  initialQuery?: Record<string, string>;
  cardTitle?: string;
} = {}) {
  const t = useTranslations('calculators.mortgage-refinance.ui');
  const tc = useTranslations('common');
  const tName = useTranslations('calculators.mortgage-refinance');
  const locale = useLocale() as Locale;

  // Seed from a pSEO preset so pre-filled inputs appear in the static HTML with zero layout shift.
  const [input, setInput] = useState<MortgageRefinanceInput>(() => ({ ...defaults, ...(initialState || {}) }));
  const [mounted, setMounted] = useState(false);

  const { values, setField, hydrated, shareUrl, reset } = useCalculatorState(MORTGAGEREFINANCE_FIELDS, initialQuery);

  useEffect(() => setMounted(true), []);

  // Once URL params are read (post-mount), apply them to the calculator inputs.
  useEffect(() => {
    if (!hydrated) return;
    setInput({
      currentBalance: toNumber(values.balance, defaults.currentBalance),
      currentRate: toNumber(values.currentRate, defaults.currentRate),
      remainingYears: toNumber(values.remaining, defaults.remainingYears),
      newRate: toNumber(values.newRate, defaults.newRate),
      newTermYears: toNumber(values.newTerm, defaults.newTermYears),
      closingCosts: toNumber(values.costs, defaults.closingCosts),
      feesPaid: (values.fees === 'rolled' ? 'rolled' : 'cash') as FeePayment,
      cashOutAmount: toNumber(values.cashOut, defaults.cashOutAmount)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const result = useMemo(() => calculateMortgageRefinance(input), [input]);

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

  const highlights: ShareHighlight[] = useMemo(
    () => [
      { label: t('newMonthlyPayment'), value: money.format(result.newMonthlyPayment) },
      { label: t('monthlySavings'), value: money.format(result.monthlySavings) },
      { label: t('netLifetimeSavings'), value: money.format(result.netLifetimeSavings) }
    ],
    [result, money, t]
  );

  const set = <K extends keyof MortgageRefinanceInput>(key: K, value: MortgageRefinanceInput[K]) => {
    setInput((prev) => ({ ...prev, [key]: value }));
    const urlKey = MORTGAGEREFINANCE_URL_KEY[key];
    if (urlKey) setField(urlKey, String(value));
  };

  const breakEvenValue = result.breakEvenMonths === null ? '—' : `${result.breakEvenMonths} ${t('monthsUnit')}`;

  function exportCsv() {
    const row = [
      input.currentBalance,
      input.currentRate,
      input.remainingYears,
      input.newRate,
      input.newTermYears,
      input.closingCosts,
      input.feesPaid,
      input.cashOutAmount,
      result.currentMonthlyPayment,
      result.newMonthlyPayment,
      result.monthlySavings,
      result.breakEvenMonths ?? '',
      result.currentRemainingInterest,
      result.newTotalInterest,
      result.interestSaved,
      result.netLifetimeSavings
    ].join(',');
    const blob = new Blob(
      [
        `currentBalance,currentRate,remainingYears,newRate,newTermYears,closingCosts,feesPaid,cashOut,currentMonthly,newMonthly,monthlySavings,breakEvenMonths,currentInterest,newInterest,interestSaved,netLifetimeSavings\n${row}`
      ],
      { type: 'text/csv;charset=utf-8' }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mortgage-refinance.csv';
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
          <div className="grid gap-6 lg:grid-cols-2">
            {/* current loan */}
            <div className="space-y-4 rounded-lg border p-4">
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                <Home className="h-4 w-4 text-primary" aria-hidden />
                {t('currentTitle')}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <NumberField
                  id="current-balance"
                  label={`${t('currentBalance')} (${currency})`}
                  value={input.currentBalance}
                  min={0}
                  step={10000}
                  onChange={(v) => set('currentBalance', v)}
                />
                <NumberField
                  id="current-rate"
                  label={`${t('currentRate')} (%)`}
                  value={input.currentRate}
                  min={0}
                  max={20}
                  step={0.125}
                  onChange={(v) => set('currentRate', v)}
                />
                <NumberField
                  id="remaining-years"
                  label={t('remainingYears')}
                  value={input.remainingYears}
                  min={1}
                  max={40}
                  step={1}
                  onChange={(v) => set('remainingYears', v)}
                />
              </div>
            </div>
            {/* new loan */}
            <div className="space-y-4 rounded-lg border p-4">
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                <Scale className="h-4 w-4 text-primary" aria-hidden />
                {t('newTitle')}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <NumberField
                  id="new-rate"
                  label={`${t('newRate')} (%)`}
                  value={input.newRate}
                  min={0}
                  max={20}
                  step={0.125}
                  onChange={(v) => set('newRate', v)}
                />
                <NumberField
                  id="new-term"
                  label={t('newTermYears')}
                  value={input.newTermYears}
                  min={1}
                  max={40}
                  step={1}
                  onChange={(v) => set('newTermYears', v)}
                />
                <NumberField
                  id="closing-costs"
                  label={`${t('closingCosts')} (${currency})`}
                  value={input.closingCosts}
                  min={0}
                  step={1000}
                  onChange={(v) => set('closingCosts', v)}
                />
                <div className="flex flex-col gap-1.5">
                  <Label>{t('feesPaid')}</Label>
                  <div className="flex rounded-md border border-input text-sm">
                    {(['cash', 'rolled'] as const).map((f) => (
                      <button
                        key={f}
                        type="button"
                        aria-pressed={input.feesPaid === f}
                        onClick={() => set('feesPaid', f)}
                        className={`flex-1 rounded-md px-3 py-2 font-medium ${
                          input.feesPaid === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {t(f === 'cash' ? 'feesCash' : 'feesRolled')}
                      </button>
                    ))}
                  </div>
                </div>
                <NumberField
                  id="cash-out"
                  label={`${t('cashOutAmount')} (${currency})`}
                  value={input.cashOutAmount}
                  min={0}
                  step={5000}
                  onChange={(v) => set('cashOutAmount', v)}
                />
              </div>
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
              <p className="mt-1">{t('warningBody')}</p>
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
              icon={<Banknote className="h-4 w-4" aria-hidden />}
              label={t('newMonthlyPayment')}
              value={money.format(result.newMonthlyPayment)}
            />
            <Stat
              icon={<TrendingDown className="h-4 w-4" aria-hidden />}
              label={t('monthlySavings')}
              value={money.format(result.monthlySavings)}
            />
            <Stat
              icon={<Scale className="h-4 w-4" aria-hidden />}
              label={t('breakEvenMonths')}
              value={breakEvenValue}
              hint={t('breakEvenHint')}
            />
            <Stat
              icon={<Banknote className="h-4 w-4" aria-hidden />}
              label={t('closingCostsLabel')}
              value={money.format(input.closingCosts)}
            />
            <Stat
              icon={<PiggyBank className="h-4 w-4" aria-hidden />}
              label={t('interestSaved')}
              value={money.format(result.interestSaved)}
            />
            <Stat
              icon={<Home className="h-4 w-4" aria-hidden />}
              label={t('netLifetimeSavings')}
              value={money.format(result.netLifetimeSavings)}
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
        calculatorId="mortgage-refinance"
        title={cardTitle ?? tName('name')}
        highlights={highlights}
        shareUrl={shareUrl}
      />
      <CrossCalcBridge from="mortgage-refinance" />

      {/* -------------------------------------------------------------- chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>{t('chartTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="chart-shell">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.schedule} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mr-old" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="mr-new" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(243 75% 59%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(243 75% 59%)" stopOpacity={0.02} />
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
                    labelFormatter={(label) => `${t('tableRowCurrent')} ${label}`}
                    contentStyle={{ borderRadius: 10, border: '1px solid hsl(214 32% 91%)', fontSize: 13 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area
                    type="monotone"
                    dataKey="oldCum"
                    name={t('chartOldCum')}
                    stroke="hsl(217 91% 60%)"
                    fill="url(#mr-old)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="newCum"
                    name={t('chartNewCum')}
                    stroke="hsl(243 75% 59%)"
                    fill="url(#mr-new)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="savingsCum"
                    name={t('chartSavingsCum')}
                    stroke="hsl(142 71% 45%)"
                    strokeWidth={2}
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
          <div className="overflow-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/80 backdrop-blur">
                <tr className="text-left">
                  <th className="px-3 py-2 font-medium" />
                  <th className="px-3 py-2 text-right font-medium">{t('currentTitle')}</th>
                  <th className="px-3 py-2 text-right font-medium">{t('newTitle')}</th>
                </tr>
              </thead>
              <tbody className="tabular">
                <TableRow label={t('tableRowCurrent')} current={result.currentMonthlyPayment} next={null} money={money} />
                <TableRow label={t('tableRowNew')} current={null} next={result.newMonthlyPayment} money={money} />
                <TableRow label={t('tableRowSavings')} current={result.monthlySavings} next={null} money={money} />
                <TableRow label={t('tableRowInterestCurrent')} current={result.currentRemainingInterest} next={null} money={money} />
                <TableRow label={t('tableRowInterestNew')} current={null} next={result.newTotalInterest} money={money} />
                <TableRow label={t('tableRowInterestSaved')} current={result.interestSaved} next={null} money={money} />
                <tr className="border-t-2">
                  <td className="px-3 py-2 font-semibold">{t('tableRowNet')}</td>
                  <td className="px-3 py-2 text-right font-semibold text-primary">{money.format(result.netLifetimeSavings)}</td>
                  <td className="px-3 py-2 text-right font-semibold text-primary">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TableRow({
  label,
  current,
  next,
  money
}: {
  label: string;
  current: number | null;
  next: number | null;
  money: Intl.NumberFormat;
}) {
  return (
    <tr className="border-t">
      <td className="px-3 py-2 text-muted-foreground">{label}</td>
      <td className="px-3 py-2 text-right">{current === null ? '—' : money.format(current)}</td>
      <td className="px-3 py-2 text-right">{next === null ? '—' : money.format(next)}</td>
    </tr>
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
