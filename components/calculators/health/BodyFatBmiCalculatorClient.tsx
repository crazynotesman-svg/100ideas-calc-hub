'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useCalculatorState } from '@/lib/hooks/useCalculatorState';
import { useUnitSystem } from '@/store/useUnitSystem';
import { CopyLinkButton } from '@/components/calculator/CopyLinkButton';
import { ResultShareCard, type ShareHighlight } from '@/components/calculator/ResultShareCard';
import { CrossCalcBridge } from '@/components/seo/CrossCalcBridge';
import { Download, Flame, HeartPulse, Scale, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { NumberField } from '@/components/ui/number-field';
import {
  cmToIn,
  feetInchesToCm,
  inToCm,
  kgToLb,
  lbToKg
} from '@/lib/calculators/health/tdee';
import {
  calculateBodyFatBmi,
  idealBodyFatRange,
  type BodyFatBmiInput,
  type Gender
} from '@/lib/calculators/health/body-fat-bmi';
import { toNumber } from '@/lib/utils';
import type { Locale } from '@/config/i18n.config';

const defaults: BodyFatBmiInput = {
  gender: 'male',
  age: 30,
  heightCm: 175,
  weightKg: 75,
  waistCm: 85,
  neckCm: 38,
  hipCm: 0
};

/** Flat URL-query field map for BodyFatBmiCalculator. Defaults are omitted from the URL. */
const BODYFAT_FIELDS = {
  g: { default: 'male' },
  age: { default: '30' },
  h: { default: '175' },
  w: { default: '75' },
  waist: { default: '85' },
  neck: { default: '38' },
  hip: { default: '0' }
};

const BODYFAT_URL_KEY: Partial<Record<keyof BodyFatBmiInput, keyof typeof BODYFAT_FIELDS>> = {
  gender: 'g',
  age: 'age',
  heightCm: 'h',
  weightKg: 'w',
  waistCm: 'waist',
  neckCm: 'neck',
  hipCm: 'hip'
};

export function BodyFatBmiCalculatorClient({
  initialState,
  initialQuery,
  cardTitle
}: {
  initialState?: Partial<BodyFatBmiInput>;
  initialQuery?: Record<string, string>;
  cardTitle?: string;
} = {}) {
  const t = useTranslations('calculators.body-fat-bmi.ui');
  const tc = useTranslations('common');
  const tName = useTranslations('calculators.body-fat-bmi');
  const locale = useLocale() as Locale;
  const { unitSystem } = useUnitSystem();
  const imperial = unitSystem === 'imperial';

  // Seed from a pSEO preset so pre-filled inputs appear in the static HTML with zero layout shift.
  const [input, setInput] = useState<BodyFatBmiInput>(() => ({
    ...defaults,
    ...(initialState || {})
  }));
  // Imperial height is edited as feet + inches (metric is the single source of truth).
  const [heightFeet, setHeightFeet] = useState(() =>
    Math.floor(cmToIn(defaults.heightCm) / 12)
  );
  const [heightInches, setHeightInches] = useState(() =>
    Math.round(cmToIn(defaults.heightCm) % 12)
  );
  const [mounted, setMounted] = useState(false);

  const { values, setField, hydrated, shareUrl, reset } = useCalculatorState(
    BODYFAT_FIELDS,
    initialQuery
  );

  useEffect(() => setMounted(true), []);

  // Once URL params are read (post-mount), apply them to the calculator inputs.
  useEffect(() => {
    if (!hydrated) return;
    setInput({
      gender: values.g === 'female' ? 'female' : 'male',
      age: toNumber(values.age, defaults.age),
      heightCm: toNumber(values.h, defaults.heightCm),
      weightKg: toNumber(values.w, defaults.weightKg),
      waistCm: toNumber(values.waist, defaults.waistCm),
      neckCm: toNumber(values.neck, defaults.neckCm),
      hipCm: toNumber(values.hip, defaults.hipCm)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // When the unit toggle flips to imperial, re-sync the ft/in fields from metric.
  useEffect(() => {
    if (!imperial) return;
    const totalIn = cmToIn(input.heightCm);
    setHeightFeet(Math.floor(totalIn / 12));
    setHeightInches(Math.round(totalIn % 12));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitSystem]);

  const result = useMemo(() => calculateBodyFatBmi(input), [input]);
  const ideal = useMemo(
    () => idealBodyFatRange(input.gender, input.age),
    [input.gender, input.age]
  );

  const nf1 = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 }), [locale]);
  const nf0 = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }), [locale]);

  const set = <K extends keyof BodyFatBmiInput>(key: K, value: BodyFatBmiInput[K]) => {
    setInput((prev) => ({ ...prev, [key]: value }));
    const urlKey = BODYFAT_URL_KEY[key];
    if (urlKey) setField(urlKey, String(value));
  };

  const setGender = (gender: Gender) => {
    setInput((prev) => ({ ...prev, gender, hipCm: gender === 'female' ? prev.hipCm || 92 : 0 }));
    setField('g', gender);
  };

  const highlights: ShareHighlight[] = useMemo(
    () => [
      { label: t('bmi'), value: nf1.format(result.bmi) },
      { label: t('bodyFat'), value: `${nf1.format(result.bodyFatPercentage)}%` },
      { label: t('leanMass'), value: `${nf1.format(result.leanMassKg)} kg` }
    ],
    [result, nf1, t]
  );

  const weightDisplay = imperial ? kgToLb(input.weightKg) : input.weightKg;
  const waistDisplay = imperial ? cmToIn(input.waistCm) : input.waistCm;
  const neckDisplay = imperial ? cmToIn(input.neckCm) : input.neckCm;
  const hipDisplay = imperial ? cmToIn(input.hipCm) : input.hipCm;

  function exportCsv() {
    const row = [
      input.gender,
      input.age,
      input.heightCm,
      input.weightKg,
      input.waistCm,
      input.neckCm,
      input.hipCm,
      result.bmi,
      result.bodyFatPercentage,
      result.fatMassKg,
      result.leanMassKg
    ].join(',');
    const blob = new Blob([`gender,age,heightCm,weightKg,waistCm,neckCm,hipCm,bmi,bodyFatPct,fatMassKg,leanMassKg\n${row}`], {
      type: 'text/csv;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'body-fat-bmi.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  const genderLabel = t(input.gender === 'male' ? 'male' : 'female');
  const bmiCategoryLabel = {
    underweight: t('bmiUnderweight'),
    normal: t('bmiNormal'),
    overweight: t('bmiOverweight'),
    obese: t('bmiObese')
  }[result.bmiCategory];
  const bfCategoryLabel = {
    essential: t('bfEssential'),
    athletic: t('bfAthletic'),
    fitness: t('bfFitness'),
    average: t('bfAverage'),
    high: t('bfHigh')
  }[result.bodyFatCategory];

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- inputs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{t('inputsTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label>{t('gender')}</Label>
              <div className="grid grid-cols-2 gap-2">
                {(['male', 'female'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    aria-pressed={input.gender === g}
                    onClick={() => setGender(g)}
                    className={`h-10 rounded-md border text-sm font-medium transition-colors ${
                      input.gender === g
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input bg-background text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {t(g)}
                  </button>
                ))}
              </div>
            </div>
            <NumberField
              id="age"
              label={t('age')}
              value={input.age}
              min={10}
              max={100}
              step={1}
              onChange={(v) => set('age', v)}
            />
            <div className="flex flex-col gap-1.5">
              <Label>{t('height')}</Label>
              {imperial ? (
                <div className="grid grid-cols-2 gap-2">
                  <NumberField
                    id="height-feet"
                    label="ft"
                    value={heightFeet}
                    min={3}
                    max={8}
                    step={1}
                    onChange={(v) => {
                      setHeightFeet(v);
                      set('heightCm', feetInchesToCm(v, heightInches));
                    }}
                  />
                  <NumberField
                    id="height-inches"
                    label="in"
                    value={heightInches}
                    min={0}
                    max={11}
                    step={1}
                    onChange={(v) => {
                      setHeightInches(v);
                      set('heightCm', feetInchesToCm(heightFeet, v));
                    }}
                  />
                </div>
              ) : (
                <NumberField
                  id="height-cm"
                  label="cm"
                  value={input.heightCm}
                  min={100}
                  max={250}
                  step={1}
                  onChange={(v) => set('heightCm', v)}
                />
              )}
            </div>
            <NumberField
              id="weight"
              label={`${t('weight')} (${imperial ? 'lb' : 'kg'})`}
              value={weightDisplay}
              min={0}
              step={imperial ? 1 : 0.5}
              onChange={(v) => set('weightKg', imperial ? lbToKg(v) : v)}
            />
            <NumberField
              id="waist"
              label={`${t('waist')} (${imperial ? 'in' : 'cm'})`}
              value={waistDisplay}
              min={0}
              step={imperial ? 0.5 : 1}
              onChange={(v) => set('waistCm', imperial ? inToCm(v) : v)}
            />
            <NumberField
              id="neck"
              label={`${t('neck')} (${imperial ? 'in' : 'cm'})`}
              value={neckDisplay}
              min={0}
              step={imperial ? 0.5 : 1}
              onChange={(v) => set('neckCm', imperial ? inToCm(v) : v)}
            />
            {input.gender === 'female' && (
              <NumberField
                id="hip"
                label={`${t('hip')} (${imperial ? 'in' : 'cm'})`}
                value={hipDisplay}
                min={0}
                step={imperial ? 0.5 : 1}
                onChange={(v) => set('hipCm', imperial ? inToCm(v) : v)}
              />
            )}
          </div>
          {input.gender === 'female' && (
            <p className="text-xs text-muted-foreground">{t('hipHint')}</p>
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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              icon={<Scale className="h-4 w-4" aria-hidden />}
              label={t('bmi')}
              value={nf1.format(result.bmi)}
              badge={bmiCategoryLabel}
            />
            <Stat
              icon={<Flame className="h-4 w-4" aria-hidden />}
              label={t('bodyFat')}
              value={`${nf1.format(result.bodyFatPercentage)}%`}
              badge={bfCategoryLabel}
            />
            <Stat
              icon={<HeartPulse className="h-4 w-4" aria-hidden />}
              label={t('fatMass')}
              value={`${nf1.format(result.fatMassKg)} kg`}
            />
            <Stat
              icon={<Trophy className="h-4 w-4" aria-hidden />}
              label={t('leanMass')}
              value={`${nf1.format(result.leanMassKg)} kg`}
            />
          </div>

          {/* Body-composition bar: fat vs lean as a share of total weight. */}
          <div className="rounded-lg border p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {t('idealRange')}
            </p>
            <p className="tabular mt-1 font-semibold">
              {ideal.min}–{ideal.max}%
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t('idealHint', { gender: genderLabel, min: ideal.min, max: ideal.max })}
            </p>
            <div className="mt-3 space-y-1.5">
              <div className="flex h-4 w-full overflow-hidden rounded-full border">
                <div
                  className="bg-rose-500"
                  style={{ width: `${Math.min(result.bodyFatPercentage, 100)}%` }}
                />
                <div className="bg-emerald-500" style={{ width: `${100 - Math.min(result.bodyFatPercentage, 100)}%` }} />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-sm bg-rose-500" />
                  {t('chartFat')} ({nf1.format(result.fatMassKg)} kg)
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-sm bg-emerald-500" />
                  {t('chartLean')} ({nf1.format(result.leanMassKg)} kg)
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setInput(defaults);
                setHeightFeet(Math.floor(cmToIn(defaults.heightCm) / 12));
                setHeightInches(Math.round(cmToIn(defaults.heightCm) % 12));
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
        calculatorId="body-fat-bmi"
        title={cardTitle ?? tName('name')}
        highlights={highlights}
        shareUrl={shareUrl}
      />
      <CrossCalcBridge from="body-fat-bmi" />
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  badge
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge?: string;
}) {
  return (
    <div className="result-shell">
      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </p>
      <p className="tabular mt-1 text-xl font-bold leading-tight">{value}</p>
      {badge && (
        <p className="mt-1 inline-block rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
          {badge}
        </p>
      )}
    </div>
  );
}
