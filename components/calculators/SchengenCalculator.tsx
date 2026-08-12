'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AlertTriangle, CalendarPlus, CheckCircle2, Clock, Copy, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { addDays, todayISO } from '@/lib/calculators/date-utils';
import {
  MAX_STAY_DAYS,
  calculateSchengen,
  type SchengenResult,
  type Trip
} from '@/lib/calculators/travel/schengen';

let tripSeq = 0;
const newTrip = (entryDate = '', exitDate = ''): Trip => ({
  id: `trip-${++tripSeq}`,
  entryDate,
  exitDate
});

const statusStyles = {
  ok: { badge: 'success' as const, ring: 'border-emerald-500/40 bg-emerald-500/5', bar: 'bg-emerald-500' },
  warning: { badge: 'warning' as const, ring: 'border-amber-500/40 bg-amber-500/5', bar: 'bg-amber-500' },
  critical: { badge: 'destructive' as const, ring: 'border-destructive/40 bg-destructive/5', bar: 'bg-destructive' },
  overstay: { badge: 'destructive' as const, ring: 'border-destructive/50 bg-destructive/10', bar: 'bg-destructive' }
};

export function SchengenCalculator() {
  const t = useTranslations('calculators.schengen.ui');
  const tc = useTranslations('common');
  const locale = useLocale();

  // Rendered identically on the server and on first client paint, then filled in.
  // The result shell keeps its height, so this never causes a layout shift.
  const [mounted, setMounted] = useState(false);
  const [referenceDate, setReferenceDate] = useState('');
  const [trips, setTrips] = useState<Trip[]>([newTrip()]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setReferenceDate(todayISO());
    setMounted(true);
  }, []);

  const result = useMemo<SchengenResult | null>(() => {
    if (!referenceDate) return null;
    const usable = trips.filter((trip) => trip.entryDate && trip.exitDate);
    return calculateSchengen(usable, referenceDate);
  }, [trips, referenceDate]);

  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: '2-digit', timeZone: 'UTC' }),
    [locale]
  );
  const fmt = (iso: string) => dateFmt.format(new Date(`${iso}T00:00:00Z`));

  const style = statusStyles[result?.status ?? 'ok'];
  const hasTrips = trips.some((trip) => trip.entryDate && trip.exitDate);

  function updateTrip(id: string, patch: Partial<Trip>) {
    setTrips((prev) => prev.map((trip) => (trip.id === id ? { ...trip, ...patch } : trip)));
  }

  function loadExample() {
    const base = referenceDate || todayISO();
    setTrips([
      newTrip(addDays(base, -150), addDays(base, -136)),
      newTrip(addDays(base, -70), addDays(base, -50)),
      newTrip(addDays(base, -20), addDays(base, -6))
    ]);
  }

  async function copyResult() {
    if (!result) return;
    const text = [
      `${t('windowLabel')}: ${result.windowStart} → ${result.windowEnd}`,
      `${t('daysUsed')}: ${result.daysUsed}/${MAX_STAY_DAYS}`,
      `${t('daysRemaining')}: ${result.daysRemaining}`,
      `${t('nextEntry')}: ${result.nextEntryDate ?? t('nextEntryToday')}`,
      `${t('maxConsecutive')}: ${result.maxConsecutiveDays}`
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — silently ignore */
    }
  }

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- inputs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{t('tripsTitle')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('tripsHint')}</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-2 sm:max-w-xs">
            <Label htmlFor="reference-date">{t('referenceDateLabel')}</Label>
            <Input
              id="reference-date"
              type="date"
              value={referenceDate}
              onChange={(event) => setReferenceDate(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">{t('referenceDateHint')}</p>
          </div>

          <div className="space-y-3">
            {trips.map((trip, index) => {
              const breakdown = result?.tripBreakdown.find((item) => item.id === trip.id);
              const error = breakdown?.error;
              return (
                <div
                  key={trip.id}
                  className="grid grid-cols-1 gap-3 rounded-lg border bg-muted/20 p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                >
                  <div className="grid gap-1.5">
                    <Label htmlFor={`${trip.id}-entry`} className="text-xs text-muted-foreground">
                      {t('tripLabel', { index: index + 1 })} · {t('entryDate')}
                    </Label>
                    <Input
                      id={`${trip.id}-entry`}
                      type="date"
                      value={trip.entryDate}
                      onChange={(event) => updateTrip(trip.id, { entryDate: event.target.value })}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor={`${trip.id}-exit`} className="text-xs text-muted-foreground">
                      {t('exitDate')}
                    </Label>
                    <Input
                      id={`${trip.id}-exit`}
                      type="date"
                      value={trip.exitDate}
                      onChange={(event) => updateTrip(trip.id, { exitDate: event.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {breakdown?.valid && (
                      <Badge variant="secondary" className="tabular whitespace-nowrap">
                        {breakdown.daysInWindow}/{breakdown.totalDays} {tc('days')}
                      </Badge>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={t('removeTrip')}
                      onClick={() => setTrips((prev) => prev.filter((item) => item.id !== trip.id))}
                      disabled={trips.length === 1}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </Button>
                  </div>
                  {error && (
                    <p className="text-xs text-destructive sm:col-span-3">
                      {error === 'reversed-range' ? t('reversedRange') : t('invalidDate')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setTrips((prev) => [...prev, newTrip()])}>
              <Plus className="h-4 w-4" aria-hidden />
              {t('addTrip')}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={loadExample}>
              <CalendarPlus className="h-4 w-4" aria-hidden />
              {t('loadExample')}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setTrips([newTrip()])}>
              <Trash2 className="h-4 w-4" aria-hidden />
              {t('clearAll')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------ results */}
      <Card className={cn('border-2 transition-colors', style.ring)}>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle>{tc('results')}</CardTitle>
          {/*
            The status badge only exists once a reference date is known (client-side).
            Reserving its row height here means hydration cannot grow the header and
            push the rest of the page down — that would be an un-attributed CLS hit.
          */}
          <div className="flex h-6 items-center">
            {result && (
              <Badge variant={style.badge}>
                {result.status === 'ok' && t('statusOk')}
                {result.status === 'warning' && t('statusWarning')}
                {result.status === 'critical' && t('statusCritical')}
                {result.status === 'overstay' && t('statusOverstay')}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Fixed min-height container: identical box before and after computation. */}
          <div className="min-h-[188px]">
            {!mounted || !result ? (
              /* The skeleton reuses the real .result-shell boxes, so the pre- and
                 post-hydration geometry is byte-for-byte the same box model. */
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="result-shell">
                  <div className="h-3.5 w-24 animate-pulse rounded bg-muted" />
                  <div className="mt-2.5 h-8 w-20 animate-pulse rounded bg-muted" />
                </div>
                <div className="result-shell">
                  <div className="h-3.5 w-24 animate-pulse rounded bg-muted" />
                  <div className="mt-2.5 h-8 w-16 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-[70px] animate-pulse rounded-lg bg-muted sm:col-span-2" />
              </div>
            ) : !hasTrips ? (
              <div className="grid h-[188px] place-items-center text-center text-sm text-muted-foreground">
                {t('noTrips')}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="result-shell">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {t('daysUsed')}
                    </p>
                    <p className="tabular mt-1 text-3xl font-bold">
                      {result.daysUsed}
                      <span className="ml-1 text-base font-medium text-muted-foreground">
                        / {MAX_STAY_DAYS}
                      </span>
                    </p>
                  </div>
                  <div className="result-shell">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {t('daysRemaining')}
                    </p>
                    <p
                      className={cn(
                        'tabular mt-1 text-3xl font-bold',
                        result.daysRemaining === 0 && 'text-destructive'
                      )}
                    >
                      {result.daysRemaining}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t('allowanceLabel', { used: result.daysUsed })}</span>
                    <span className="tabular">
                      {t('windowValue', {
                        start: fmt(result.windowStart),
                        end: fmt(result.windowEnd)
                      })}
                    </span>
                  </div>
                  <Progress
                    value={(result.daysUsed / MAX_STAY_DAYS) * 100}
                    indicatorClassName={style.bar}
                    label={t('allowanceLabel', { used: result.daysUsed })}
                  />
                </div>

                <div
                  className={cn(
                    'flex items-start gap-2.5 rounded-lg border p-3 text-sm',
                    result.status === 'ok' ? 'border-emerald-500/30' : 'border-amber-500/30'
                  )}
                >
                  {result.status === 'ok' ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  ) : (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
                  )}
                  <p>
                    {result.status === 'ok' && t('statusOkBody')}
                    {result.status === 'warning' && t('statusWarningBody')}
                    {result.status === 'critical' && t('statusCriticalBody')}
                    {result.status === 'overstay' &&
                      t('statusOverstayBody', {
                        days: Math.max(result.overstayDays, result.violations[0]?.excess ?? 1)
                      })}
                  </p>
                </div>

                <div className="grid gap-3 text-sm sm:grid-cols-3">
                  <div className="rounded-lg border p-3">
                    <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" aria-hidden />
                      {t('nextEntry')}
                    </p>
                    <p className="tabular mt-1 font-semibold">
                      {result.nextEntryDate ? fmt(result.nextEntryDate) : t('nextEntryToday')}
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {t('maxConsecutive')}
                    </p>
                    <p className="tabular mt-1 font-semibold">
                      {result.maxConsecutiveDays} {tc('days')}
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {t('fullReset')}
                    </p>
                    <p className="tabular mt-1 font-semibold">{fmt(result.fullResetDate)}</p>
                  </div>
                </div>

                {result.violations.length > 0 && (
                  <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3">
                    <p className="text-sm font-semibold text-destructive">{t('violationsTitle')}</p>
                    <ul className="tabular mt-1.5 space-y-1 text-xs text-destructive/90">
                      {result.violations.slice(0, 5).map((violation) => (
                        <li key={violation.date}>
                          {t('violationDetail', {
                            date: fmt(violation.date),
                            days: violation.daysUsed,
                            excess: violation.excess
                          })}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={copyResult}>
                    <Copy className="h-4 w-4" aria-hidden />
                    {copied ? tc('copied') : tc('copy')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ----------------------------------------------------------- timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{t('timelineTitle')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('timelineHint')}</p>
        </CardHeader>
        <CardContent>
          {/* 180 fixed-width columns: pure CSS, no chart library, constant height. */}
          <div className="h-[132px]">
            {mounted && result && (
              <>
                <div className="flex h-[104px] items-end gap-[1px]">
                  {result.timeline.map((point) => (
                    <div
                      key={point.date}
                      title={`${point.date} · ${point.daysUsed}/${MAX_STAY_DAYS}`}
                      className={cn(
                        'flex-1 rounded-t-[1px]',
                        point.present ? 'bg-primary' : 'bg-primary/15'
                      )}
                      style={{
                        height: `${Math.max(4, (point.daysUsed / MAX_STAY_DAYS) * 100)}%`
                      }}
                    />
                  ))}
                </div>
                <div className="tabular mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>{fmt(result.windowStart)}</span>
                  <span>{fmt(result.windowEnd)}</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
