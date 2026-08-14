'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useCalculatorState } from '@/lib/hooks/useCalculatorState';
import { CopyLinkButton } from '@/components/calculator/CopyLinkButton';
import { Activity, Copy, Droplets, Flame, Leaf, Scale, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { useUnitSystem } from '@/store/useUnitSystem';
import { cn, toNumber } from '@/lib/utils';
import {
  activityFactors,
  calculateTdee,
  cmToIn,
  feetInchesToCm,
  goalAdjustments,
  kgToLb,
  lbToKg,
  macroPresets,
  type ActivityLevel,
  type Formula,
  type Goal,
  type MacroPreset,
  type Sex
} from '@/lib/calculators/health/tdee';

/* -------------------------------------------------------------- key mapping */

const activityKey: Record<ActivityLevel, string> = {
  sedentary: 'activitySedentary',
  light: 'activityLight',
  moderate: 'activityModerate',
  active: 'activityActive',
  athlete: 'activityAthlete'
};

const goalKey: Record<Goal, string> = {
  cut: 'goalCut',
  'mild-cut': 'goalMildCut',
  maintain: 'goalMaintain',
  'lean-bulk': 'goalLeanBulk',
  bulk: 'goalBulk'
};

const presetKey: Record<MacroPreset, string> = {
  balanced: 'presetBalanced',
  'high-protein': 'presetHighProtein',
  'low-carb': 'presetLowCarb',
  keto: 'presetKeto'
};

const bmiKey = {
  underweight: 'bmiUnderweight',
  normal: 'bmiNormal',
  overweight: 'bmiOverweight',
  obese: 'bmiObese'
} as const;

const activityLevels = Object.keys(activityFactors) as ActivityLevel[];
const goals = Object.keys(goalAdjustments) as Goal[];
const presets = Object.keys(macroPresets) as MacroPreset[];

/** Canonical (metric) defaults — identical on server and client, so hydration is stable. */
const defaults = {
  sex: 'male' as Sex,
  age: 30,
  heightCm: 178,
  weightKg: 76,
  bodyFat: '',
  activityLevel: 'moderate' as ActivityLevel,
  goal: 'mild-cut' as Goal,
  formula: 'mifflin' as Formula,
  macroPreset: 'balanced' as MacroPreset
};

const impDefaults = {
  feet: Math.floor(cmToIn(defaults.heightCm) / 12),
  inches: Math.round(cmToIn(defaults.heightCm) % 12),
  lb: Math.round(kgToLb(defaults.weightKg))
};

/**
 * Flat URL-query field map for TdeeCalculator. Metric is canonical: height/weight are
 * stored as cm/kg even when the UI shows imperial, so shared links are unit-agnostic.
 * Defaults are omitted from the URL.
 */
const TDEE_FIELDS = {
  sex: { default: 'male' },
  age: { default: '30' },
  height: { default: '178' },
  weight: { default: '76' },
  bodyfat: { default: '' },
  activity: { default: 'moderate' },
  goal: { default: 'mild-cut' },
  formula: { default: 'mifflin' },
  preset: { default: 'balanced' }
};

const TDEE_URL_KEY: Record<keyof typeof defaults, keyof typeof TDEE_FIELDS> = {
  sex: 'sex',
  age: 'age',
  heightCm: 'height',
  weightKg: 'weight',
  bodyFat: 'bodyfat',
  activityLevel: 'activity',
  goal: 'goal',
  formula: 'formula',
  macroPreset: 'preset'
};

/* ------------------------------------------------------------------ component */

export function TdeeCalculator() {
  const t = useTranslations('calculators.tdee.ui');
  const tc = useTranslations('common');
  const locale = useLocale();
  const { unitSystem } = useUnitSystem();
  const imperial = unitSystem === 'imperial';

  const [form, setForm] = useState(defaults);
  const [imp, setImp] = useState(impDefaults);
  const [copied, setCopied] = useState(false);

  const { values, setField, hydrated, shareUrl, reset } = useCalculatorState(TDEE_FIELDS);

  // Once URL params are read (post-mount), apply them to the calculator inputs.
  useEffect(() => {
    if (!hydrated) return;
    const heightCm = toNumber(values.height, defaults.heightCm);
    const weightKg = toNumber(values.weight, defaults.weightKg);
    setForm({
      sex: (values.sex as Sex) || defaults.sex,
      age: toNumber(values.age, defaults.age),
      heightCm,
      weightKg,
      bodyFat: values.bodyfat ?? '',
      activityLevel: (values.activity as ActivityLevel) || defaults.activityLevel,
      goal: (values.goal as Goal) || defaults.goal,
      formula: (values.formula as Formula) || defaults.formula,
      macroPreset: (values.preset as MacroPreset) || defaults.macroPreset
    });
    if (unitSystem === 'imperial') {
      const totalIn = cmToIn(heightCm);
      setImp({
        feet: Math.floor(totalIn / 12),
        inches: Math.round(totalIn % 12),
        lb: Math.round(kgToLb(weightKg))
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  /**
   * Metric is the single source of truth. Every imperial edit writes back to metric
   * immediately, so the only sync needed is metric -> imperial when the toggle flips.
   */
  useEffect(() => {
    if (unitSystem !== 'imperial') return;
    setImp(() => {
      const totalIn = cmToIn(form.heightCm);
      return {
        feet: Math.floor(totalIn / 12),
        inches: Math.round(totalIn % 12),
        lb: Math.round(kgToLb(form.weightKg))
      };
    });
    // Intentionally keyed on the unit system only — re-running on every metric edit
    // would fight the user's cursor while typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitSystem]);

  const set = <K extends keyof typeof defaults>(key: K, value: (typeof defaults)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    const urlKey = TDEE_URL_KEY[key];
    if (urlKey) setField(urlKey, String(value));
  };

  const bodyFatNumber = form.bodyFat.trim() === '' ? undefined : toNumber(form.bodyFat, 0);

  const result = useMemo(
    () =>
      calculateTdee({
        sex: form.sex,
        age: form.age,
        heightCm: form.heightCm,
        weightKg: form.weightKg,
        bodyFatPercent: bodyFatNumber,
        activityLevel: form.activityLevel,
        goal: form.goal,
        formula: form.formula,
        macroPreset: form.macroPreset
      }),
    [
      form.sex,
      form.age,
      form.heightCm,
      form.weightKg,
      bodyFatNumber,
      form.activityLevel,
      form.goal,
      form.formula,
      form.macroPreset
    ]
  );

  const nf = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }), [locale]);
  const nf1 = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 }),
    [locale]
  );

  /* ------------------------------------------------------- unit presentation */

  const weightUnit = imperial ? 'lb' : 'kg';
  const showWeight = (kg: number) => `${nf1.format(imperial ? kgToLb(kg) : kg)} ${weightUnit}`;
  const water = imperial
    ? `${nf.format(result.waterMl / 29.5735)} fl oz`
    : `${nf1.format(result.waterMl / 1000)} L`;

  const weeklyChange = imperial
    ? kgToLb(result.weeklyWeightChangeKg)
    : result.weeklyWeightChangeKg;
  const weeklySigned = `${weeklyChange > 0 ? '+' : ''}${nf1.format(weeklyChange)} ${weightUnit}`;

  const katchUnavailable = form.formula === 'katch' && result.usedFormula !== 'katch';

  function updateImperialHeight(next: Partial<typeof imp>) {
    const merged = { ...imp, ...next };
    setImp(merged);
    set('heightCm', Math.round(feetInchesToCm(merged.feet, merged.inches)));
  }

  function updateImperialWeight(lb: number) {
    setImp((prev) => ({ ...prev, lb }));
    set('weightKg', Math.round(lbToKg(lb) * 10) / 10);
  }

  async function copyResult() {
    const lines = [
      `${t('bmr')}: ${nf.format(result.bmr)} ${tc('kcal')}`,
      `${t('tdee')}: ${nf.format(result.tdee)} ${tc('kcal')}`,
      `${t('targetCalories')}: ${nf.format(result.targetCalories)} ${tc('kcal')} ${tc('perDay')}`,
      `${t('protein')}: ${result.macros.proteinG} ${tc('grams')}`,
      `${t('carbs')}: ${result.macros.carbsG} ${tc('grams')}`,
      `${t('fat')}: ${result.macros.fatG} ${tc('grams')}`,
      `${t('bmi')}: ${nf1.format(result.bmi)} (${t(bmiKey[result.bmiCategory])})`
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  const macroRows = [
    {
      key: 'protein',
      label: t('protein'),
      grams: result.macros.proteinG,
      kcal: result.macros.proteinKcal,
      percent: result.macros.proteinPercent,
      bar: 'bg-sky-500',
      dot: 'bg-sky-500'
    },
    {
      key: 'carbs',
      label: t('carbs'),
      grams: result.macros.carbsG,
      kcal: result.macros.carbsKcal,
      percent: result.macros.carbsPercent,
      bar: 'bg-emerald-500',
      dot: 'bg-emerald-500'
    },
    {
      key: 'fat',
      label: t('fat'),
      grams: result.macros.fatG,
      kcal: result.macros.fatKcal,
      percent: result.macros.fatPercent,
      bar: 'bg-amber-500',
      dot: 'bg-amber-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- inputs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{t('inputsTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">{t('sex')}</Label>
              {/* Fixed-height segmented control — no reflow when switching. */}
              <div
                role="radiogroup"
                aria-label={t('sex')}
                className="inline-flex h-10 items-center rounded-md border bg-muted/40 p-0.5"
              >
                {(['male', 'female'] as Sex[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={form.sex === option}
                    onClick={() => set('sex', option)}
                    className={cn(
                      'h-9 flex-1 rounded-[5px] text-sm font-medium transition-colors',
                      form.sex === option
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {t(option)}
                  </button>
                ))}
              </div>
            </div>

            <NumberField
              id="tdee-age"
              label={t('age')}
              value={form.age}
              min={10}
              max={100}
              onChange={(v) => set('age', v)}
            />

            {imperial ? (
              <div className="grid grid-cols-2 gap-2">
                <NumberField
                  id="tdee-height-ft"
                  label={t('heightFt')}
                  value={imp.feet}
                  min={3}
                  max={8}
                  onChange={(v) => updateImperialHeight({ feet: v })}
                />
                <NumberField
                  id="tdee-height-in"
                  label={t('heightIn')}
                  value={imp.inches}
                  min={0}
                  max={11}
                  onChange={(v) => updateImperialHeight({ inches: v })}
                />
              </div>
            ) : (
              <NumberField
                id="tdee-height"
                label={t('heightCm')}
                value={form.heightCm}
                min={90}
                max={250}
                onChange={(v) => set('heightCm', v)}
              />
            )}

            {imperial ? (
              <NumberField
                id="tdee-weight-lb"
                label={t('weightLb')}
                value={imp.lb}
                min={44}
                max={880}
                onChange={updateImperialWeight}
              />
            ) : (
              <NumberField
                id="tdee-weight"
                label={t('weightKg')}
                value={form.weightKg}
                min={20}
                max={400}
                step={0.5}
                onChange={(v) => set('weightKg', v)}
              />
            )}

            <div className="grid gap-1.5">
              <Label htmlFor="tdee-bodyfat" className="text-xs text-muted-foreground">
                {t('bodyFatOptional')}
              </Label>
              <Input
                id="tdee-bodyfat"
                type="number"
                inputMode="decimal"
                placeholder="—"
                min={3}
                max={69}
                step={0.5}
                value={form.bodyFat}
                onChange={(event) => set('bodyFat', event.target.value)}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="tdee-formula" className="text-xs text-muted-foreground">
                {t('formula')}
              </Label>
              <Select
                id="tdee-formula"
                value={form.formula}
                onChange={(event) => set('formula', event.target.value as Formula)}
              >
                <option value="mifflin">{t('formulaMifflin')}</option>
                <option value="katch">{t('formulaKatch')}</option>
              </Select>
            </div>

            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="tdee-activity" className="text-xs text-muted-foreground">
                {t('activity')}
              </Label>
              <Select
                id="tdee-activity"
                value={form.activityLevel}
                onChange={(event) => set('activityLevel', event.target.value as ActivityLevel)}
              >
                {activityLevels.map((level) => (
                  <option key={level} value={level}>
                    {t(activityKey[level])}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="tdee-goal" className="text-xs text-muted-foreground">
                {t('goal')}
              </Label>
              <Select
                id="tdee-goal"
                value={form.goal}
                onChange={(event) => set('goal', event.target.value as Goal)}
              >
                {goals.map((goal) => (
                  <option key={goal} value={goal}>
                    {t(goalKey[goal])}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="tdee-preset" className="text-xs text-muted-foreground">
                {t('macroPreset')}
              </Label>
              <Select
                id="tdee-preset"
                value={form.macroPreset}
                onChange={(event) => set('macroPreset', event.target.value as MacroPreset)}
              >
                {presets.map((preset) => (
                  <option key={preset} value={preset}>
                    {t(presetKey[preset])}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <p className="text-xs leading-5 text-muted-foreground">{t('bodyFatHint')}</p>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setForm(defaults);
                setImp(impDefaults);
                reset();
              }}
            >
              {tc('resetDefaults')}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={copyResult}>
              <Copy className="h-4 w-4" aria-hidden />
              {copied ? tc('copied') : tc('copy')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------ results */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle>{tc('results')}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={result.bmiCategory === 'normal' ? 'success' : 'warning'}>
              {t('bmi')} {nf1.format(result.bmi)} · {t(bmiKey[result.bmiCategory])}
            </Badge>
            <CopyLinkButton getUrl={shareUrl} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {katchUnavailable && (
            <p className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-amber-700">
              {t('formulaFallback')}
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              icon={<Flame className="h-4 w-4" aria-hidden />}
              label={t('bmr')}
              value={`${nf.format(result.bmr)} ${tc('kcal')}`}
              hint={t('bmrHint')}
            />
            <Stat
              icon={<Activity className="h-4 w-4" aria-hidden />}
              label={t('tdee')}
              value={`${nf.format(result.tdee)} ${tc('kcal')}`}
              hint={t('tdeeHint')}
            />
            <Stat
              icon={<Target className="h-4 w-4" aria-hidden />}
              label={t('targetCalories')}
              value={`${nf.format(result.targetCalories)} ${tc('kcal')}`}
              hint={`${t('calorieDelta')}: ${result.calorieDelta > 0 ? '+' : ''}${nf.format(
                result.calorieDelta
              )} ${tc('kcal')}`}
              accent
            />
            <Stat
              icon={<Scale className="h-4 w-4" aria-hidden />}
              label={t('weeklyChange')}
              value={weeklySigned}
              hint={
                result.leanBodyMassKg !== null
                  ? `${t('leanMass')}: ${showWeight(result.leanBodyMassKg)}`
                  : `${t('formula')}: ${t(
                      result.usedFormula === 'katch' ? 'formulaKatch' : 'formulaMifflin'
                    )}`
              }
            />
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <div className="flex items-center gap-2.5 rounded-lg border p-3">
              <Droplets className="h-4 w-4 shrink-0 text-sky-500" aria-hidden />
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t('water')}
                </p>
                <p className="tabular mt-0.5 font-semibold">{water}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg border p-3">
              <Leaf className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t('fiber')}
                </p>
                <p className="tabular mt-0.5 font-semibold">
                  {result.fiberG} {tc('grams')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg border p-3">
              <Scale className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t('leanMass')}
                </p>
                <p className="tabular mt-0.5 font-semibold">
                  {result.leanBodyMassKg !== null ? showWeight(result.leanBodyMassKg) : '—'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --------------------------------------------------------- macro split */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>{t('macrosTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pure-CSS stacked bar: no chart library, no mount gate, no layout shift. */}
          <div
            className="flex h-11 w-full overflow-hidden rounded-lg border bg-secondary"
            role="img"
            aria-label={t('chartTitle')}
          >
            {macroRows.map((row) => (
              <div
                key={row.key}
                className={cn(
                  'flex items-center justify-center text-xs font-semibold text-white transition-[width] duration-300',
                  row.bar
                )}
                style={{ width: `${row.percent}%` }}
              >
                {row.percent >= 12 ? `${row.percent}%` : ''}
              </div>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {macroRows.map((row) => (
              <div key={row.key} className="rounded-lg border p-3">
                <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                  <span className={cn('h-2 w-2 rounded-full', row.dot)} />
                  {row.label}
                </p>
                <p className="tabular mt-1 text-xl font-bold leading-tight">
                  {row.grams} {tc('grams')}
                </p>
                <p className="tabular mt-0.5 text-xs text-muted-foreground">
                  {nf.format(row.kcal)} {tc('kcal')} · {row.percent}%
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------- tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('activityTableTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <tbody className="tabular">
                  {result.activityBreakdown.map((row) => (
                    <tr
                      key={row.level}
                      className={cn(
                        'border-b last:border-0',
                        row.level === form.activityLevel && 'bg-primary/5 font-medium'
                      )}
                    >
                      <td className="px-3 py-2 text-[13px]">{t(activityKey[row.level])}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-right">
                        {nf.format(row.tdee)} {tc('kcal')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('goalTableTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <tbody className="tabular">
                  {result.goalBreakdown.map((row) => (
                    <tr
                      key={row.goal}
                      className={cn(
                        'border-b last:border-0',
                        row.goal === form.goal && 'bg-primary/5 font-medium'
                      )}
                    >
                      <td className="px-3 py-2 text-[13px]">{t(goalKey[row.goal])}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-right">
                        {nf.format(row.calories)} {tc('kcal')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="rounded-lg border-l-2 border-primary/40 bg-muted/40 p-3.5 text-xs leading-6 text-muted-foreground">
        {t('notMedicalAdvice')}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------- helpers */

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
  hint,
  accent
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className={cn('result-shell', accent && 'border-primary/30 bg-primary/5')}>
      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </p>
      <p className="tabular mt-1 text-xl font-bold leading-tight">{value}</p>
      {hint && <p className="mt-1 text-xs leading-5 text-muted-foreground">{hint}</p>}
    </div>
  );
}
