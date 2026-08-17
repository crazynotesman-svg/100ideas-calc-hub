import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { CalculatorLayout } from '@/components/calculator/CalculatorLayout';
import { ScenarioPresetsGrid } from '@/components/seo/ScenarioPresetsGrid';
import { TdeeCalculator } from '@/components/calculators/TdeeCalculator';
import { FireCalculator } from '@/components/calculators/FireCalculator';
import { SchengenCalculator } from '@/components/calculators/SchengenCalculator';
import { calculateTdee } from '@/lib/calculators/health/tdee';
import { calculateFire, type FireResult } from '@/lib/calculators/finance/fire';
import { calculateSchengen, type SchengenResult } from '@/lib/calculators/travel/schengen';
import {
  TDEE_CATEGORY,
  TDEE_SLUG,
  PRESET_SLUGS as TDEE_SLUGS,
  PRESETS as TDEE_PRESETS,
  getPreset as getTdee,
  presetRoute as tdeeRoute,
  tdeeInitialQuery
} from '@/app/[locale]/calculators/[category]/[slug]/preset/tdeePresets';
import {
  FIRE_CATEGORY,
  FIRE_SLUG,
  PRESET_SLUGS as FIRE_SLUGS,
  PRESETS as FIRE_PRESETS,
  getPreset as getFire,
  presetRoute as fireRoute,
  fireInitialQuery
} from '@/app/[locale]/calculators/[category]/[slug]/preset/firePresets';
import {
  SCHENGEN_CATEGORY,
  SCHENGEN_SLUG,
  PRESET_SLUGS as SCHENGEN_SLUGS,
  PRESETS as SCHENGEN_PRESETS,
  getPreset as getSchengen,
  presetRoute as schengenRoute,
  schengenInitialQuery
} from '@/app/[locale]/calculators/[category]/[slug]/preset/schengenPresets';
import { buildMetadata } from '@/lib/seo/metadata';
import { isLocale, locales, localeMeta, type Locale } from '@/config/i18n.config';
import { calculatorRoute, getCalculator } from '@/config/calculators.config';

interface PageParams {
  params: { locale: string; category: string; slug: string; scenario: string };
}

/**
 * SSG for the pSEO preset pages (TDEE, FIRE and Schengen).
 *
 * We deliberately return the FULL param chain (locale + category + slug + scenario)
 * rather than only `{ scenario }`. The `[category]` segment has no own
 * generateStaticParams, so a child-only param object leaves that segment unresolved
 * and Next silently skips the route under `dynamicParams = false`. Supplying every
 * ancestor value from this single GSP lets Next prerender all scenario pages.
 */
export function generateStaticParams() {
  const expand = (category: string, slug: string, scenarios: string[]) =>
    scenarios.map((scenario) => ({ category, slug, scenario }));
  const combos = [
    ...expand(TDEE_CATEGORY, TDEE_SLUG, TDEE_SLUGS),
    ...expand(FIRE_CATEGORY, FIRE_SLUG, FIRE_SLUGS),
    ...expand(SCHENGEN_CATEGORY, SCHENGEN_SLUG, SCHENGEN_SLUGS)
  ];
  return locales.flatMap((l) => combos.map((c) => ({ locale: l, ...c })));
}

/** Unknown scenarios (and any non-preset URL) must 404, not render a thin page. */
export const dynamicParams = false;

export async function generateMetadata({
  params: { locale, slug, scenario }
}: PageParams): Promise<Metadata> {
  if (!isLocale(locale)) return {};
  const l = locale as Locale;

  let preset;
  let route;
  if (slug === TDEE_SLUG) {
    const p = getTdee(scenario);
    if (!p) return {};
    preset = p;
    route = tdeeRoute(scenario);
  } else if (slug === FIRE_SLUG) {
    const p = getFire(scenario);
    if (!p) return {};
    preset = p;
    route = fireRoute(scenario);
  } else if (slug === SCHENGEN_SLUG) {
    const p = getSchengen(scenario);
    if (!p) return {};
    preset = p;
    route = schengenRoute(scenario);
  } else {
    return {};
  }

  const loc = preset.localized[l];
  return buildMetadata({
    locale: l,
    route,
    title: loc.title,
    description: loc.description,
    keywords: [slug.replace(/-/g, ' '), 'calculator', 'preset', scenario.replace(/-/g, ' ')],
    ogType: 'article'
  });
}

export default async function PresetPage({
  params: { locale, category, slug, scenario }
}: PageParams) {
  if (!isLocale(locale)) notFound();
  if (category !== TDEE_CATEGORY && category !== FIRE_CATEGORY && category !== SCHENGEN_CATEGORY) notFound();
  const l = locale as Locale;
  const meta = getCalculator(category, slug);
  if (!meta) notFound();

  unstable_setRequestLocale(locale);

  let title: string;
  let description: string;
  let faqs: { question: string; answer: string }[];
  let benchmark: React.ReactNode;
  let calculatorNode: React.ReactNode;
  let ns: string;
  let presets: { slug: string; localized: Record<Locale, { title: string; summaryIntro: string }> }[];
  let routeFor: (s: string) => string;

  if (slug === TDEE_SLUG) {
    const p = getTdee(scenario);
    if (!p) notFound();
    const r = calculateTdee(p.defaultParams);
    const loc = p.localized[l];
    title = loc.title;
    description = loc.description;
    faqs = loc.faqs;
    ns = 'tdeePresets';
    presets = TDEE_PRESETS;
    routeFor = tdeeRoute;
    calculatorNode = <TdeeCalculator initialState={p.defaultParams} initialQuery={tdeeInitialQuery(p)} />;
    benchmark = await TdeeBenchmark(l, r);
  } else if (slug === FIRE_SLUG) {
    const p = getFire(scenario);
    if (!p) notFound();
    const r = calculateFire(p.defaultParams);
    const loc = p.localized[l];
    title = loc.title;
    description = loc.description;
    faqs = loc.faqs;
    ns = 'firePresets';
    presets = FIRE_PRESETS;
    routeFor = fireRoute;
    calculatorNode = <FireCalculator initialState={p.defaultParams} initialQuery={fireInitialQuery(p)} />;
    benchmark = await FireBenchmark(l, r);
  } else if (slug === SCHENGEN_SLUG) {
    const p = getSchengen(scenario);
    if (!p) notFound();
    const r = calculateSchengen(p.defaultParams.trips, p.defaultParams.referenceDate);
    const loc = p.localized[l];
    title = loc.title;
    description = loc.description;
    faqs = loc.faqs;
    ns = 'schengenPresets';
    presets = SCHENGEN_PRESETS;
    routeFor = schengenRoute;
    calculatorNode = <SchengenCalculator initialQuery={schengenInitialQuery(p)} />;
    benchmark = await SchengenBenchmark(l, r);
  } else {
    notFound();
    return;
  }

  const tPreset = await getTranslations({ locale: l, namespace: ns });

  return (
    <CalculatorLayout
      locale={l}
      meta={meta}
      showUnitToggle={slug === TDEE_SLUG}
      scenario={{
        name: title,
        description,
        faqs,
        breadcrumbLabel: title,
        canonicalRoute: routeFor(scenario),
        afterCalculator: (
          <section aria-labelledby="preset-benchmark" className="mt-10">
            <h2 id="preset-benchmark" className="text-xl font-semibold tracking-tight">
              {tPreset('benchmarkTitle')}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {tPreset('benchmarkIntro', { scenario: title })}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{benchmark}</div>
          </section>
        ),
        footer: (
          <ScenarioPresetsGrid
            locale={l}
            namespace={ns}
            presets={presets}
            routeFor={routeFor}
            current={scenario}
          />
        )
      }}
    >
      {calculatorNode}
    </CalculatorLayout>
  );
}

/* ----------------------------------------------------------------- benchmarks */

async function TdeeBenchmark(locale: Locale, r: ReturnType<typeof calculateTdee>) {
  const t = await getTranslations({ locale, namespace: 'calculators.tdee.ui' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  const nf1 = new Intl.NumberFormat(locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  return (
    <>
      <PresetStat label={t('bmr')} value={`${nf.format(r.bmr)} ${tc('kcal')}`} />
      <PresetStat label={t('tdee')} value={`${nf.format(r.tdee)} ${tc('kcal')}`} />
      <PresetStat label={t('targetCalories')} value={`${nf.format(r.targetCalories)} ${tc('kcal')}`} accent />
      <PresetStat label={t('bmi')} value={nf1.format(r.bmi)} />
      <PresetStat label={t('protein')} value={`${nf.format(r.macros.proteinG)} ${tc('grams')}`} />
      <PresetStat label={t('carbs')} value={`${nf.format(r.macros.carbsG)} ${tc('grams')}`} />
      <PresetStat label={t('fat')} value={`${nf.format(r.macros.fatG)} ${tc('grams')}`} />
    </>
  );
}

async function FireBenchmark(locale: Locale, r: FireResult) {
  const t = await getTranslations({ locale, namespace: 'calculators.fire.ui' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const money = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: localeMeta[locale].currency,
    maximumFractionDigits: 0
  });
  return (
    <>
      <PresetStat label={t('fireNumber')} value={money.format(r.fireNumber)} accent />
      <PresetStat
        label={t('fireAge')}
        value={r.fireAge ? `${r.fireAge} ${tc('yearsOld')}` : t('notReached')}
      />
      <PresetStat
        label={t('balanceAtRetirement')}
        value={`${money.format(r.balanceAtRetirement)}`}
      />
      <PresetStat
        label={t('sustainableIncome')}
        value={money.format(r.sustainableRealIncome)}
      />
      <PresetStat label={t('totalGrowth')} value={money.format(r.totalGrowth)} />
      <PresetStat label={t('coverage')} value={`${Math.round(r.coverageRatio * 100)}%`} />
    </>
  );
}

async function SchengenBenchmark(locale: Locale, r: SchengenResult) {
  const t = await getTranslations({ locale, namespace: 'calculators.schengen.ui' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const df = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
  const statusLabel =
    r.status === 'ok'
      ? t('statusOk')
      : r.status === 'warning'
        ? t('statusWarning')
        : r.status === 'critical'
          ? t('statusCritical')
          : t('statusOverstay');
  return (
    <>
      <PresetStat label={t('daysUsed')} value={`${r.daysUsed} / 90`} accent />
      <PresetStat label={t('daysRemaining')} value={`${r.daysRemaining} ${tc('days')}`} />
      <PresetStat label={t('maxConsecutive')} value={`${r.maxConsecutiveDays} ${tc('days')}`} />
      <PresetStat
        label={t('nextEntry')}
        value={r.nextEntryDate ? df.format(new Date(`${r.nextEntryDate}T00:00:00Z`)) : t('nextEntryToday')}
      />
      <PresetStat label={t('fullReset')} value={df.format(new Date(`${r.fullResetDate}T00:00:00Z`))} />
      <PresetStat label={t('status')} value={statusLabel} />
    </>
  );
}

function PresetStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={accent ? 'result-shell border-primary/30 bg-primary/5' : 'result-shell'}>
      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="tabular mt-1 text-xl font-bold leading-tight">{value}</p>
    </div>
  );
}
