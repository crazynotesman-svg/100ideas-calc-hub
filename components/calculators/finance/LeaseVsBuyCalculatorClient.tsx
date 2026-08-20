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
import { chartTooltipStyle, chartCursorStyle, chartAxisTick, chartGridStroke, chartLegendStyle } from '@/lib/chart-style';
import { Banknote, CalendarClock, Car, Download, PiggyBank, Scale, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { NumberField } from '@/components/ui/number-field';
import { localeMeta, type Locale } from '@/config/i18n.config';
import { calculateLeaseVsBuy, type LeaseVsBuyInput } from '@/lib/calculators/finance/lease-vs-buy';
import { toNumber } from '@/lib/utils';

const defaults: LeaseVsBuyInput = {
  buyPrice: 35000,
  loanRate: 6,
  loanTermMonths: 36,
  holdingPeriodMonths: 36,
  resaleValue: 21000,
  downPayment: 3000,
  salesTaxPct: 7,
  msrp: 35000,
  moneyFactor: 0.0025,
  leaseTermMonths: 36,
  residualPct: 60,
  acquisitionFee: 0,
  dispositionFee: 0
};

/** Flat URL-query field map for LeaseVsBuyCalculator. Defaults are omitted from the URL. */
const LEASEVSBUY_FIELDS = {
  price: { default: '35000' },
  rate: { default: '6' },
  loanTerm: { default: '36' },
  holding: { default: '36' },
  resale: { default: '21000' },
  down: { default: '3000' },
  tax: { default: '7' },
  msrp: { default: '35000' },
  mf: { default: '0.0025' },
  leaseTerm: { default: '36' },
  residual: { default: '60' },
  acq: { default: '0' },
  disp: { default: '0' }
};

const LEASEVSBUY_URL_KEY: Partial<Record<keyof LeaseVsBuyInput, keyof typeof LEASEVSBUY_FIELDS>> = {
  buyPrice: 'price',
  loanRate: 'rate',
  loanTermMonths: 'loanTerm',
  holdingPeriodMonths: 'holding',
  resaleValue: 'resale',
  downPayment: 'down',
  salesTaxPct: 'tax',
  msrp: 'msrp',
  moneyFactor: 'mf',
  leaseTermMonths: 'leaseTerm',
  residualPct: 'residual',
  acquisitionFee: 'acq',
  dispositionFee: 'disp'
};

export function LeaseVsBuyCalculatorClient({
  initialState,
  initialQuery,
  cardTitle
}: {
  initialState?: Partial<LeaseVsBuyInput>;
  initialQuery?: Record<string, string>;
  cardTitle?: string;
} = {}) {
  const t = useTranslations('calculators.lease-vs-buy.ui');
  const tc = useTranslations('common');
  const tName = useTranslations('calculators.lease-vs-buy');
  const locale = useLocale() as Locale;

  // Seed from a pSEO preset so pre-filled inputs appear in the static HTML with zero layout shift.
  const [input, setInput] = useState<LeaseVsBuyInput>(() => ({ ...defaults, ...(initialState || {}) }));
  const [activeTab, setActiveTab] = useState<'buy' | 'lease'>('buy');
  const [mounted, setMounted] = useState(false);

  const { values, setField, hydrated, shareUrl, reset } = useCalculatorState(LEASEVSBUY_FIELDS, initialQuery);

  useEffect(() => setMounted(true), []);

  // Once URL params are read (post-mount), apply them to the calculator inputs.
  useEffect(() => {
    if (!hydrated) return;
    setInput({
      buyPrice: toNumber(values.price, defaults.buyPrice),
      loanRate: toNumber(values.rate, defaults.loanRate),
      loanTermMonths: toNumber(values.loanTerm, defaults.loanTermMonths),
      holdingPeriodMonths: toNumber(values.holding, defaults.holdingPeriodMonths),
      resaleValue: toNumber(values.resale, defaults.resaleValue),
      downPayment: toNumber(values.down, defaults.downPayment),
      salesTaxPct: toNumber(values.tax, defaults.salesTaxPct),
      msrp: toNumber(values.msrp, defaults.msrp),
      moneyFactor: toNumber(values.mf, defaults.moneyFactor),
      leaseTermMonths: toNumber(values.leaseTerm, defaults.leaseTermMonths),
      residualPct: toNumber(values.residual, defaults.residualPct),
      acquisitionFee: toNumber(values.acq, defaults.acquisitionFee),
      dispositionFee: toNumber(values.disp, defaults.dispositionFee)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const result = useMemo(() => calculateLeaseVsBuy(input), [input]);

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
      { label: t('buyNetCost'), value: money.format(result.buy.netCost) },
      { label: t('leaseNetCost'), value: money.format(result.lease.netCost) },
      { label: t('savings'), value: money.format(result.savings) }
    ],
    [result, money, t]
  );

  const set = <K extends keyof LeaseVsBuyInput>(key: K, value: LeaseVsBuyInput[K]) => {
    setInput((prev) => ({ ...prev, [key]: value }));
    const urlKey = LEASEVSBUY_URL_KEY[key];
    if (urlKey) setField(urlKey, String(value));
  };

  const winnerLabel = result.winner === 'buy' ? t('winnerBuy') : t('winnerLease');
  const leaseFees = input.acquisitionFee + input.dispositionFee;

  function exportCsv() {
    const row = [
      input.buyPrice,
      input.loanRate,
      input.holdingPeriodMonths,
      input.resaleValue,
      input.downPayment,
      input.salesTaxPct,
      input.msrp,
      input.moneyFactor,
      input.leaseTermMonths,
      input.residualPct,
      result.buy.netCost,
      result.lease.netCost,
      result.winner,
      result.savings
    ].join(',');
    const blob = new Blob(
      [
        `buyPrice,loanRate,holdingMonths,resaleValue,downPayment,salesTaxPct,msrp,moneyFactor,leaseTermMonths,residualPct,buyNetCost,leaseNetCost,winner,savings\n${row}`
      ],
      { type: 'text/csv;charset=utf-8' }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lease-vs-buy.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- inputs */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle>{t('inputsTitle')}</CardTitle>
            <div className="flex rounded-md border border-input text-sm">
              {(['buy', 'lease'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  aria-pressed={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-md px-3 py-1 font-medium ${
                    activeTab === tab ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {t(tab === 'buy' ? 'tabBuy' : 'tabLease')}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {activeTab === 'buy' ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <NumberField
                id="buy-price"
                label={`${t('buyPrice')} (${currency})`}
                value={input.buyPrice}
                min={0}
                step={1000}
                onChange={(v) => set('buyPrice', v)}
              />
              <NumberField
                id="loan-rate"
                label={`${t('loanRate')} (%)`}
                value={input.loanRate}
                min={0}
                max={20}
                step={0.1}
                onChange={(v) => set('loanRate', v)}
              />
              <NumberField
                id="loan-term"
                label={t('loanTermMonths')}
                value={input.loanTermMonths}
                min={1}
                max={84}
                step={12}
                onChange={(v) => set('loanTermMonths', v)}
              />
              <NumberField
                id="holding-period"
                label={t('holdingPeriodMonths')}
                value={input.holdingPeriodMonths}
                min={1}
                max={84}
                step={12}
                onChange={(v) => set('holdingPeriodMonths', v)}
              />
              <NumberField
                id="resale-value"
                label={`${t('resaleValue')} (${currency})`}
                value={input.resaleValue}
                min={0}
                step={1000}
                onChange={(v) => set('resaleValue', v)}
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
                id="sales-tax"
                label={`${t('salesTaxPct')} (%)`}
                value={input.salesTaxPct}
                min={0}
                max={20}
                step={0.5}
                onChange={(v) => set('salesTaxPct', v)}
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <NumberField
                id="msrp"
                label={`${t('msrp')} (${currency})`}
                value={input.msrp}
                min={0}
                step={1000}
                onChange={(v) => set('msrp', v)}
              />
              <div className="flex flex-col gap-1.5">
                <NumberField
                  id="money-factor"
                  label={t('moneyFactor')}
                  value={input.moneyFactor}
                  min={0}
                  max={0.01}
                  step={0.0001}
                  onChange={(v) => set('moneyFactor', v)}
                />
                <p className="text-xs text-muted-foreground">{t('moneyFactorHint')}</p>
              </div>
              <NumberField
                id="lease-term"
                label={t('leaseTermMonths')}
                value={input.leaseTermMonths}
                min={12}
                max={72}
                step={12}
                onChange={(v) => set('leaseTermMonths', v)}
              />
              <NumberField
                id="residual-pct"
                label={`${t('residualPct')} (%)`}
                value={input.residualPct}
                min={0}
                max={100}
                step={1}
                onChange={(v) => set('residualPct', v)}
              />
              <NumberField
                id="acquisition-fee"
                label={`${t('acquisitionFee')} (${currency})`}
                value={input.acquisitionFee}
                min={0}
                step={50}
                onChange={(v) => set('acquisitionFee', v)}
              />
              <NumberField
                id="disposition-fee"
                label={`${t('dispositionFee')} (${currency})`}
                value={input.dispositionFee}
                min={0}
                step={50}
                onChange={(v) => set('dispositionFee', v)}
              />
              <NumberField
                id="down-payment-lease"
                label={`${t('downPayment')} (${currency})`}
                value={input.downPayment}
                min={0}
                step={500}
                onChange={(v) => set('downPayment', v)}
              />
              <NumberField
                id="sales-tax-lease"
                label={`${t('salesTaxPct')} (%)`}
                value={input.salesTaxPct}
                min={0}
                max={20}
                step={0.5}
                onChange={(v) => set('salesTaxPct', v)}
              />
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
              icon={<Car className="h-4 w-4" aria-hidden />}
              label={t('buyNetCost')}
              value={money.format(result.buy.netCost)}
            />
            <Stat
              icon={<CalendarClock className="h-4 w-4" aria-hidden />}
              label={t('leaseNetCost')}
              value={money.format(result.lease.netCost)}
            />
            <Stat
              icon={<Trophy className="h-4 w-4" aria-hidden />}
              label={t('winner')}
              value={winnerLabel}
              hint={`${t('savings')}: ${money.format(result.savings)}`}
            />
            <Stat
              icon={<Banknote className="h-4 w-4" aria-hidden />}
              label={t('buyMonthly')}
              value={money.format(result.buy.monthlyPayment)}
            />
            <Stat
              icon={<Banknote className="h-4 w-4" aria-hidden />}
              label={t('leaseMonthly')}
              value={money.format(result.lease.monthlyPayment)}
            />
            <Stat
              icon={<PiggyBank className="h-4 w-4" aria-hidden />}
              label={t('finalEquity')}
              value={money.format(result.buy.finalEquity)}
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
        calculatorId="lease-vs-buy"
        title={cardTitle ?? tName('name')}
        highlights={highlights}
        shareUrl={shareUrl}
      />
      <CrossCalcBridge from="lease-vs-buy" />

      {/* -------------------------------------------------------------- chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>{t('chartTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="chart-shell">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="lvb-lease" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(38 92% 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(38 92% 50%)" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="lvb-buy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={chartAxisTick}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tickFormatter={(value: number) => compact.format(value)}
                    tick={chartAxisTick}
                    tickLine={false}
                    axisLine={false}
                    width={54}
                  />
                  <Tooltip
                    formatter={(value: number) => money.format(value)}
                    labelFormatter={(label) => `${t('tableRowMonthly')} ${label}`}
                    contentStyle={chartTooltipStyle} cursor={chartCursorStyle}
                  />
                  <Legend wrapperStyle={chartLegendStyle} />
                  <Area
                    type="monotone"
                    dataKey="leaseCum"
                    name={t('chartLeaseCum')}
                    stroke="hsl(38 92% 50%)"
                    fill="url(#lvb-lease)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="buyCum"
                    name={t('chartBuyCum')}
                    stroke="hsl(217 91% 60%)"
                    fill="url(#lvb-buy)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="buyEquity"
                    name={t('chartEquity')}
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
                  <th className="px-3 py-2 text-right font-medium">{t('tableColBuy')}</th>
                  <th className="px-3 py-2 text-right font-medium">{t('tableColLease')}</th>
                </tr>
              </thead>
              <tbody className="tabular">
                <TableRow label={t('tableRowDown')} buy={input.downPayment} lease={input.downPayment} money={money} />
                <TableRow label={t('tableRowMonthly')} buy={result.buy.totalMonthlyPayments} lease={result.lease.totalRent} money={money} />
                <TableRow label={t('tableRowFees')} buy={0} lease={leaseFees} money={money} />
                <TableRow label={t('tableRowTax')} buy={result.buy.salesTax} lease={result.lease.rentTax} money={money} />
                <TableRow label={t('tableRowEquity')} buy={result.buy.finalEquity} lease={0} money={money} />
                <tr className="border-t-2">
                  <td className="px-3 py-2 font-semibold">{t('tableRowNet')}</td>
                  <td className="px-3 py-2 text-right font-semibold text-primary">{money.format(result.buy.netCost)}</td>
                  <td className="px-3 py-2 text-right font-semibold text-primary">{money.format(result.lease.netCost)}</td>
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
  buy,
  lease,
  money
}: {
  label: string;
  buy: number;
  lease: number;
  money: Intl.NumberFormat;
}) {
  return (
    <tr className="border-t">
      <td className="px-3 py-2 text-muted-foreground">{label}</td>
      <td className="px-3 py-2 text-right">{money.format(buy)}</td>
      <td className="px-3 py-2 text-right">{money.format(lease)}</td>
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
