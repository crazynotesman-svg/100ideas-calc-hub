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
import { Banknote, CalendarClock, Download, GraduationCap, PiggyBank, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { NumberField } from '@/components/ui/number-field';
import { localeMeta, type Locale } from '@/config/i18n.config';
import { calculateStudentLoan, type StudentLoanInput } from '@/lib/calculators/finance/student-loan';
import { toNumber } from '@/lib/utils';

const defaults: StudentLoanInput = {
  principal: 30000,
  annualRate: 6.5,
  termYears: 10,
  gracePeriodMonths: 0,
  extraMonthly: 100
};

/** Flat URL-query field map for StudentLoanCalculator. Defaults are omitted from the URL. */
const STUDENTLOAN_FIELDS = {
  principal: { default: '30000' },
  rate: { default: '6.5' },
  years: { default: '10' },
  grace: { default: '0' },
  extra: { default: '100' }
};

const STUDENTLOAN_URL_KEY: Partial<Record<keyof StudentLoanInput, keyof typeof STUDENTLOAN_FIELDS>> = {
  principal: 'principal',
  annualRate: 'rate',
  termYears: 'years',
  gracePeriodMonths: 'grace',
  extraMonthly: 'extra'
};

export function StudentLoanCalculatorClient({
  initialState,
  initialQuery,
  cardTitle
}: {
  initialState?: Partial<StudentLoanInput>;
  initialQuery?: Record<string, string>;
  cardTitle?: string;
} = {}) {
  const t = useTranslations('calculators.student-loan.ui');
  const tc = useTranslations('common');
  const tName = useTranslations('calculators.student-loan');
  const locale = useLocale() as Locale;

  // Seed from a pSEO preset so pre-filled inputs appear in the static HTML with zero layout shift.
  const [input, setInput] = useState<StudentLoanInput>(() => ({ ...defaults, ...(initialState || {}) }));
  const [mounted, setMounted] = useState(false);

  const { values, setField, hydrated, shareUrl, reset } = useCalculatorState(STUDENTLOAN_FIELDS, initialQuery);

  useEffect(() => setMounted(true), []);

  // Once URL params are read (post-mount), apply them to the calculator inputs.
  useEffect(() => {
    if (!hydrated) return;
    setInput({
      principal: toNumber(values.principal, defaults.principal),
      annualRate: toNumber(values.rate, defaults.annualRate),
      termYears: toNumber(values.years, defaults.termYears),
      gracePeriodMonths: toNumber(values.grace, defaults.gracePeriodMonths),
      extraMonthly: toNumber(values.extra, defaults.extraMonthly)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const result = useMemo(() => calculateStudentLoan(input), [input]);

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
      { label: t('actualMonthlyPayment'), value: money.format(result.actualMonthlyPayment) },
      { label: t('totalInterest'), value: money.format(result.totalInterest) },
      { label: t('totalPayment'), value: money.format(result.totalPayment) }
    ],
    [result, money, t]
  );

  const set = <K extends keyof StudentLoanInput>(key: K, value: StudentLoanInput[K]) => {
    setInput((prev) => ({ ...prev, [key]: value }));
    const urlKey = STUDENTLOAN_URL_KEY[key];
    if (urlKey) setField(urlKey, String(value));
  };

  // Cumulative principal / interest for the chart (areas grow over the term).
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
    link.download = 'student-loan-schedule.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  const payoffValue = `${result.payoffMonths} ${t('termMonths')}`;
  const payoffHint = result.hasExtra
    ? t('payoffHintExtra', { months: result.monthsSaved })
    : t('payoffHintNone');

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
              id="principal"
              label={`${t('principal')} (${currency})`}
              value={input.principal}
              min={0}
              step={1000}
              onChange={(v) => set('principal', v)}
            />
            <NumberField
              id="annual-rate"
              label={`${t('annualRate')} (%)`}
              value={input.annualRate}
              min={0}
              max={20}
              step={0.1}
              onChange={(v) => set('annualRate', v)}
            />
            <NumberField
              id="term-years"
              label={`${t('termYears')} (${tc('years')})`}
              value={input.termYears}
              min={1}
              max={30}
              step={1}
              onChange={(v) => set('termYears', v)}
            />
            <div className="flex flex-col gap-1.5">
              <NumberField
                id="grace-period"
                label={t('gracePeriodMonths')}
                value={input.gracePeriodMonths}
                min={0}
                max={36}
                step={1}
                onChange={(v) => set('gracePeriodMonths', v)}
              />
              <p className="text-xs text-muted-foreground">{t('graceHint')}</p>
            </div>
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
              icon={<GraduationCap className="h-4 w-4" aria-hidden />}
              label={t('monthlyPayment')}
              value={money.format(result.monthlyPayment)}
            />
            <Stat
              icon={<Banknote className="h-4 w-4" aria-hidden />}
              label={t('actualMonthlyPayment')}
              value={money.format(result.actualMonthlyPayment)}
            />
            <Stat
              icon={<TrendingUp className="h-4 w-4" aria-hidden />}
              label={t('totalInterest')}
              value={money.format(result.totalInterest)}
            />
            <Stat
              icon={<PiggyBank className="h-4 w-4" aria-hidden />}
              label={t('interestSaved')}
              value={money.format(result.interestSaved)}
            />
            <Stat
              icon={<CalendarClock className="h-4 w-4" aria-hidden />}
              label={t('payoffTime')}
              value={payoffValue}
              hint={payoffHint}
            />
            <Stat
              icon={<Banknote className="h-4 w-4" aria-hidden />}
              label={t('totalPayment')}
              value={money.format(result.totalPayment)}
            />
            {input.gracePeriodMonths > 0 && (
              <>
                <Stat
                  icon={<TrendingUp className="h-4 w-4" aria-hidden />}
                  label={t('capitalizedInterest')}
                  value={money.format(result.capitalizedInterest)}
                />
                <Stat
                  icon={<Banknote className="h-4 w-4" aria-hidden />}
                  label={t('capitalizedBalance')}
                  value={money.format(result.capitalizedBalance)}
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
        calculatorId="student-loan"
        title={cardTitle ?? tName('name')}
        highlights={highlights}
        shareUrl={shareUrl}
      />
      <CrossCalcBridge from="student-loan" />

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
                    <linearGradient id="studentloan-balance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(199 89% 48%)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="hsl(199 89% 48%)" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="studentloan-principal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="studentloan-interest" x1="0" y1="0" x2="0" y2="1">
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
                    stroke="hsl(199 89% 48%)"
                    fill="url(#studentloan-balance)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="interest"
                    name={t('chartInterest')}
                    stroke="hsl(38 92% 50%)"
                    fill="url(#studentloan-interest)"
                    strokeWidth={1.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="principal"
                    name={t('chartPrincipal')}
                    stroke="hsl(142 71% 45%)"
                    fill="url(#studentloan-principal)"
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
