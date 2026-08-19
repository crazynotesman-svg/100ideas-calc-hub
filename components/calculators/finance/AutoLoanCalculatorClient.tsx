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
import { Banknote, Car, Download, PiggyBank, Receipt, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { NumberField } from '@/components/ui/number-field';
import { localeMeta, type Locale } from '@/config/i18n.config';
import { calculateAutoLoan, type AutoLoanInput } from '@/lib/calculators/finance/auto-loan';
import { toNumber } from '@/lib/utils';

const defaults: AutoLoanInput = {
  vehiclePrice: 30000,
  downPayment: 3000,
  tradeInValue: 0,
  salesTaxPct: 7,
  termMonths: 60,
  annualRate: 6
};

/** Flat URL-query field map for AutoLoanCalculator. Defaults are omitted from the URL. */
const AUTOLOAN_FIELDS = {
  price: { default: '30000' },
  down: { default: '3000' },
  trade: { default: '0' },
  tax: { default: '7' },
  term: { default: '60' },
  rate: { default: '6' }
};

const AUTOLOAN_URL_KEY: Partial<Record<keyof AutoLoanInput, keyof typeof AUTOLOAN_FIELDS>> = {
  vehiclePrice: 'price',
  downPayment: 'down',
  tradeInValue: 'trade',
  salesTaxPct: 'tax',
  termMonths: 'term',
  annualRate: 'rate'
};

const TERM_OPTIONS = [24, 36, 48, 60, 72, 84];

export function AutoLoanCalculatorClient({
  initialState,
  initialQuery,
  cardTitle
}: {
  initialState?: Partial<AutoLoanInput>;
  initialQuery?: Record<string, string>;
  cardTitle?: string;
} = {}) {
  const t = useTranslations('calculators.auto-loan.ui');
  const tc = useTranslations('common');
  const tName = useTranslations('calculators.auto-loan');
  const locale = useLocale() as Locale;

  // Seed from a pSEO preset so pre-filled inputs appear in the static HTML with zero layout shift.
  const [input, setInput] = useState<AutoLoanInput>(() => ({ ...defaults, ...(initialState || {}) }));
  // Trade-in / sales-tax rows are toggleable; toggling off zeroes the value.
  const [showTradeIn, setShowTradeIn] = useState(() => (initialState?.tradeInValue ?? 0) > 0);
  const [showTax, setShowTax] = useState(() => (initialState?.salesTaxPct ?? 7) > 0);
  const [mounted, setMounted] = useState(false);

  const { values, setField, hydrated, shareUrl, reset } = useCalculatorState(AUTOLOAN_FIELDS, initialQuery);

  useEffect(() => setMounted(true), []);

  // Once URL params are read (post-mount), apply them to the calculator inputs.
  useEffect(() => {
    if (!hydrated) return;
    setInput({
      vehiclePrice: toNumber(values.price, defaults.vehiclePrice),
      downPayment: toNumber(values.down, defaults.downPayment),
      tradeInValue: toNumber(values.trade, defaults.tradeInValue),
      salesTaxPct: toNumber(values.tax, defaults.salesTaxPct),
      termMonths: toNumber(values.term, defaults.termMonths),
      annualRate: toNumber(values.rate, defaults.annualRate)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const result = useMemo(() => calculateAutoLoan(input), [input]);

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
      { label: t('monthlyPayment'), value: money.format(result.monthlyPayment) },
      { label: t('loanAmountLabel'), value: money.format(result.loanAmount) },
      { label: t('totalVehicleCost'), value: money.format(result.totalVehicleCost) }
    ],
    [result, money, t]
  );

  const set = <K extends keyof AutoLoanInput>(key: K, value: AutoLoanInput[K]) => {
    setInput((prev) => ({ ...prev, [key]: value }));
    const urlKey = AUTOLOAN_URL_KEY[key];
    if (urlKey) setField(urlKey, String(value));
  };

  const toggleTradeIn = () => {
    const next = !showTradeIn;
    setShowTradeIn(next);
    if (!next) set('tradeInValue', 0);
  };
  const toggleTax = () => {
    const next = !showTax;
    setShowTax(next);
    if (!next) set('salesTaxPct', 0);
  };

  // Cumulative principal / interest for the chart (areas grow over the term).
  const chartData = useMemo(() => {
    let principal = 0;
    let interest = 0;
    return result.series.map((point) => {
      principal += point.principal;
      interest += point.interest;
      return { month: point.month, balance: point.balance, principal, interest };
    });
  }, [result.series]);

  function exportCsv() {
    const header = ['month', 'payment', 'principal', 'interest', 'balance'];
    const rows = result.series.map((point) =>
      [point.month, point.payment, point.principal, point.interest, point.balance].join(',')
    );
    const blob = new Blob([[header.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'auto-loan-schedule.csv';
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
              id="vehicle-price"
              label={`${t('vehiclePrice')} (${currency})`}
              value={input.vehiclePrice}
              min={0}
              step={1000}
              onChange={(v) => set('vehiclePrice', v)}
            />
            <NumberField
              id="down-payment"
              label={`${t('downPayment')} (${currency})`}
              value={input.downPayment}
              min={0}
              step={500}
              onChange={(v) => set('downPayment', v)}
            />
            <NumberField
              id="interest-rate"
              label={`${t('annualRate')} (%)`}
              value={input.annualRate}
              min={0}
              max={25}
              step={0.1}
              onChange={(v) => set('annualRate', v)}
            />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="loan-term">{t('loanTerm')}</Label>
              <select
                id="loan-term"
                value={input.termMonths}
                onChange={(e) => set('termMonths', Number(e.target.value))}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {TERM_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m} {t('termMonths')}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={toggleTradeIn}
                aria-pressed={showTradeIn}
                className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                {t('showTradeIn')}
                <span className={`rounded px-1.5 py-0.5 text-xs ${showTradeIn ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {showTradeIn ? 'ON' : 'OFF'}
                </span>
              </button>
              {showTradeIn && (
                <NumberField
                  id="trade-in"
                  label={`${t('tradeIn')} (${currency})`}
                  value={input.tradeInValue}
                  min={0}
                  step={500}
                  onChange={(v) => set('tradeInValue', v)}
                />
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={toggleTax}
                aria-pressed={showTax}
                className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                {t('showTax')}
                <span className={`rounded px-1.5 py-0.5 text-xs ${showTax ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {showTax ? 'ON' : 'OFF'}
                </span>
              </button>
              {showTax && (
                <NumberField
                  id="sales-tax"
                  label={`${t('salesTax')} (%)`}
                  value={input.salesTaxPct}
                  min={0}
                  max={20}
                  step={0.5}
                  onChange={(v) => set('salesTaxPct', v)}
                />
              )}
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
              icon={<Car className="h-4 w-4" aria-hidden />}
              label={t('monthlyPayment')}
              value={money.format(result.monthlyPayment)}
            />
            <Stat
              icon={<Receipt className="h-4 w-4" aria-hidden />}
              label={t('loanAmountLabel')}
              value={money.format(result.loanAmount)}
            />
            <Stat
              icon={<Banknote className="h-4 w-4" aria-hidden />}
              label={t('totalInterest')}
              value={money.format(result.totalInterest)}
            />
            <Stat
              icon={<TrendingUp className="h-4 w-4" aria-hidden />}
              label={t('totalPayments')}
              value={money.format(result.totalPayments)}
            />
            <Stat
              icon={<PiggyBank className="h-4 w-4" aria-hidden />}
              label={t('totalVehicleCost')}
              value={money.format(result.totalVehicleCost)}
            />
            <Stat
              icon={<Receipt className="h-4 w-4" aria-hidden />}
              label={t('salesTaxLabel')}
              value={money.format(result.salesTax)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setInput(defaults);
                setShowTradeIn(false);
                setShowTax(true);
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
        calculatorId="auto-loan"
        title={cardTitle ?? tName('name')}
        highlights={highlights}
        shareUrl={shareUrl}
      />
      <CrossCalcBridge from="auto-loan" />

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
                    <linearGradient id="autoloan-balance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(45 93% 47%)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="hsl(45 93% 47%)" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="autoloan-principal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="autoloan-interest" x1="0" y1="0" x2="0" y2="1">
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
                    stroke="hsl(45 93% 47%)"
                    fill="url(#autoloan-balance)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="interest"
                    name={t('chartInterest')}
                    stroke="hsl(38 92% 50%)"
                    fill="url(#autoloan-interest)"
                    strokeWidth={1.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="principal"
                    name={t('chartPrincipal')}
                    stroke="hsl(142 71% 45%)"
                    fill="url(#autoloan-principal)"
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
                {result.series.map((point) => (
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
