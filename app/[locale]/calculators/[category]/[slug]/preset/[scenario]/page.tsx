import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { CalculatorLayout } from '@/components/calculator/CalculatorLayout';
import { ScenarioPresetsGrid } from '@/components/seo/ScenarioPresetsGrid';
import { TdeeCalculator } from '@/components/calculators/TdeeCalculator';
import { calculateTdee } from '@/lib/calculators/health/tdee';
import {
  TDEE_CATEGORY,
  TDEE_SLUG,
  PRESET_SLUGS,
  getPreset,
  presetRoute
} from '@/app/[locale]/calculators/[category]/[slug]/preset/tdeePresets';
import { buildMetadata } from '@/lib/seo/metadata';
import { absoluteUrl } from '@/config/site.config';
import { isLocale, locales, type Locale } from '@/config/i18n.config';
import { calculatorRoute, getCalculator } from '@/config/calculators.config';

/** Maps a TdeeForm field to its URL-query key. Mirrors TDEE_URL_KEY in TdeeCalculator. */
const PRESET_QUERY_MAP: Record<string, string> = {
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

interface PageParams {
  params: { locale: string; category: string; slug: string; scenario: string };
}

/**
 * SSG for the pSEO preset pages.
 *
 * We deliberately return the FULL param chain (locale + category + slug + scenario)
 * rather than only `{ scenario }`. The `[category]` segment has no own
 * generateStaticParams, so a child-only param object leaves that segment unresolved
 * and Next silently skips the route under `dynamicParams = false`. Supplying every
 * ancestor value from this single GSP lets Next prerender all 16 scenario pages.
 */
export function generateStaticParams() {
  return locales.flatMap((l) =>
    PRESET_SLUGS.map((scenario) => ({
      locale: l,
      category: TDEE_CATEGORY,
      slug: TDEE_SLUG,
      scenario
    }))
  );
}

/** Unknown scenarios (and any non-TDEE preset URL) must 404, not render a thin page. */
export const dynamicParams = false;

export async function generateMetadata({
  params: { locale, scenario }
}: PageParams): Promise<Metadata> {
  if (!isLocale(locale)) return {};
  const preset = getPreset(scenario);
  if (!preset) return {};
  const loc = preset.localized[locale as Locale];
  return buildMetadata({
    locale: locale as Locale,
    route: presetRoute(scenario),
    title: loc.title,
    description: loc.description,
    keywords: ['tdee calculator', 'macro calculator', 'bmr calculator', scenario.replace(/-/g, ' ')],
    ogType: 'article'
  });
}

export default async function PresetPage({ params: { locale, category, slug, scenario } }: PageParams) {
  if (!isLocale(locale)) notFound();
  if (slug !== TDEE_SLUG) notFound();
  const preset = getPreset(scenario);
  if (!preset) notFound();

  unstable_setRequestLocale(locale);
  const l = locale as Locale;
  const meta = getCalculator(category, slug);
  if (!meta) notFound();

  const loc = preset.localized[l];
  const result = calculateTdee(preset.defaultParams);

  const t = await getTranslations({ locale: l, namespace: 'calculators.tdee.ui' });
  const tc = await getTranslations({ locale: l, namespace: 'common' });
  const tPreset = await getTranslations({ locale: l, namespace: 'tdeePresets' });
  const nf = new Intl.NumberFormat(l, { maximumFractionDigits: 0 });
  const nf1 = new Intl.NumberFormat(l, { maximumFractionDigits: 1, minimumFractionDigits: 1 });

  // Seed the calculator's URL state with the preset values so the share link reproduces them.
  const initialQuery: Record<string, string> = {};
  for (const [formKey, urlKey] of Object.entries(PRESET_QUERY_MAP)) {
    const v = (preset.defaultParams as Record<string, unknown>)[formKey];
    if (v !== undefined && v !== '') initialQuery[urlKey] = String(v);
  }

  const benchmark = (
    <section aria-labelledby="preset-benchmark" className="mt-10">
      <h2 id="preset-benchmark" className="text-xl font-semibold tracking-tight">
        {tPreset('benchmarkTitle')}
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {tPreset('benchmarkIntro', { scenario: loc.title })}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <PresetStat label={t('bmr')} value={`${nf.format(result.bmr)} ${tc('kcal')}`} />
        <PresetStat label={t('tdee')} value={`${nf.format(result.tdee)} ${tc('kcal')}`} />
        <PresetStat
          label={t('targetCalories')}
          value={`${nf.format(result.targetCalories)} ${tc('kcal')}`}
          accent
        />
        <PresetStat label={t('bmi')} value={nf1.format(result.bmi)} />
        <PresetStat label={t('protein')} value={`${nf.format(result.macros.proteinG)} ${tc('grams')}`} />
        <PresetStat label={t('carbs')} value={`${nf.format(result.macros.carbsG)} ${tc('grams')}`} />
        <PresetStat label={t('fat')} value={`${nf.format(result.macros.fatG)} ${tc('grams')}`} />
      </div>
    </section>
  );

  return (
    <CalculatorLayout
      locale={l}
      meta={meta}
      showUnitToggle
      scenario={{
        name: loc.title,
        description: loc.description,
        faqs: loc.faqs,
        breadcrumbLabel: loc.title,
        canonicalRoute: presetRoute(scenario),
        afterCalculator: benchmark,
        footer: <ScenarioPresetsGrid locale={l} current={scenario} />
      }}
    >
      <TdeeCalculator initialState={preset.defaultParams} initialQuery={initialQuery} />
    </CalculatorLayout>
  );
}

function PresetStat({
  label,
  value,
  accent
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={
        accent
          ? 'result-shell border-primary/30 bg-primary/5'
          : 'result-shell'
      }
    >
      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="tabular mt-1 text-xl font-bold leading-tight">{value}</p>
    </div>
  );
}
