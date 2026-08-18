import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { CalculatorLayout } from '@/components/calculator/CalculatorLayout';
import { ScenarioPresetsGrid } from '@/components/seo/ScenarioPresetsGrid';
import { PRESETS as TDEE_PRESETS, presetRoute as tdeeRoute } from '@/app/[locale]/calculators/[category]/[slug]/preset/tdeePresets';
import { PRESETS as FIRE_PRESETS, presetRoute as fireRoute } from '@/app/[locale]/calculators/[category]/[slug]/preset/firePresets';
import { PRESETS as SCHENGEN_PRESETS, presetRoute as schengenRoute } from '@/app/[locale]/calculators/[category]/[slug]/preset/schengenPresets';
import { PRESETS as COMPOUND_PRESETS, presetRoute as compoundRoute } from '@/app/[locale]/calculators/[category]/[slug]/preset/compoundInterestPresets';
import { PRESETS as MORTGAGE_PRESETS, presetRoute as mortgageRoute } from '@/app/[locale]/calculators/[category]/[slug]/preset/mortgagePresets';
import { PRESETS as BODYFAT_PRESETS, presetRoute as bodyFatRoute } from '@/app/[locale]/calculators/[category]/[slug]/preset/bodyFatPresets';
import { locales, isLocale, type Locale } from '@/config/i18n.config';
import { calculators, getCalculator, calculatorRoute } from '@/config/calculators.config';
import { buildMetadata } from '@/lib/seo/metadata';
import { HrefLangAlternates } from '@/components/seo/HrefLangAlternates';

/**
 * One dynamic route serves every calculator in every locale.
 *
 * The calculator UIs are loaded through next/dynamic so that each page only ships its own
 * client chunk — the Schengen page never downloads Recharts, which keeps LCP/INP budgets intact.
 * SSR stays enabled, so the interactive markup is present in the static HTML (CLS = 0).
 */
const registry: Record<string, React.ComponentType> = {
  schengen: dynamic(() =>
    import('@/components/calculators/SchengenCalculator').then((m) => m.SchengenCalculator)
  ),
  fire: dynamic(() =>
    import('@/components/calculators/FireCalculator').then((m) => m.FireCalculator)
  ),
  tdee: dynamic(() =>
    import('@/components/calculators/TdeeCalculator').then((m) => m.TdeeCalculator)
  ),
  compound: dynamic(() =>
    import('@/components/calculators/finance/CompoundInterestCalculatorClient').then(
      (m) => m.CompoundInterestCalculatorClient
    )
  ),
  mortgage: dynamic(() =>
    import('@/components/calculators/finance/MortgageCalculatorClient').then(
      (m) => m.MortgageCalculatorClient
    )
  ),
  'body-fat-bmi': dynamic(() =>
    import('@/components/calculators/health/BodyFatBmiCalculatorClient').then(
      (m) => m.BodyFatBmiCalculatorClient
    )
  )
};

/** Calculators that expose the metric/imperial switch in the page header. */
const unitAware = new Set(['tdee', 'body-fat-bmi']);

/** locales × calculators — all 12 pages are pre-rendered as static HTML when possible. */
export function generateStaticParams() {
  return locales.flatMap((locale) =>
    calculators.map((calculator) => ({
      locale,
      category: calculator.category,
      slug: calculator.slug
    }))
  );
}

/**
 * Allow on-demand rendering for any valid calculator slug.
 * On Cloudflare Workers, OpenNext's prerender routing for dynamic-segment pages is not
 * 100% reliable, so `dynamicParams = false` would hard-404 valid pages whose static HTML
 * wasn't matched. With `true`, a valid slug renders (SSG hit or Worker SSR fallback — both
 * SEO-complete); only slugs that fail `getCalculator()` reach `notFound()`.
 */
export const dynamicParams = true;

interface PageParams {
  params: { locale: string; category: string; slug: string };
}

export async function generateMetadata({
  params: { locale, category, slug }
}: PageParams): Promise<Metadata> {
  if (!isLocale(locale)) return {};
  const meta = getCalculator(category, slug);
  if (!meta) return {};

  const t = await getTranslations({ locale, namespace: `calculators.${meta.id}` });

  return buildMetadata({
    locale,
    route: calculatorRoute(meta),
    title: t('metaTitle'),
    description: t('metaDescription'),
    keywords: t.raw('keywords') as string[],
    ogType: 'article'
  });
}

export default async function CalculatorPage({ params: { locale, category, slug } }: PageParams) {
  if (!isLocale(locale)) notFound();
  const meta = getCalculator(category, slug);
  if (!meta) notFound();

  unstable_setRequestLocale(locale);

  const Calculator = registry[meta.id];
  if (!Calculator) notFound();

  // Internal-linking mesh: surface each calculator's pSEO preset grid on its base page.
  const bottomSlot =
    meta.id === 'tdee' ? (
      <ScenarioPresetsGrid
        locale={locale as Locale}
        namespace="tdeePresets"
        presets={TDEE_PRESETS}
        routeFor={tdeeRoute}
      />
    ) : meta.id === 'fire' ? (
      <ScenarioPresetsGrid
        locale={locale as Locale}
        namespace="firePresets"
        presets={FIRE_PRESETS}
        routeFor={fireRoute}
      />
    ) : meta.id === 'schengen' ? (
      <ScenarioPresetsGrid
        locale={locale as Locale}
        namespace="schengenPresets"
        presets={SCHENGEN_PRESETS}
        routeFor={schengenRoute}
      />
    ) : meta.id === 'compound' ? (
      <ScenarioPresetsGrid
        locale={locale as Locale}
        namespace="compoundPresets"
        presets={COMPOUND_PRESETS}
        routeFor={compoundRoute}
      />
    ) : meta.id === 'mortgage' ? (
      <ScenarioPresetsGrid
        locale={locale as Locale}
        namespace="mortgagePresets"
        presets={MORTGAGE_PRESETS}
        routeFor={mortgageRoute}
      />
    ) : meta.id === 'body-fat-bmi' ? (
      <ScenarioPresetsGrid
        locale={locale as Locale}
        namespace="bodyFatPresets"
        presets={BODYFAT_PRESETS}
        routeFor={bodyFatRoute}
      />
    ) : undefined;

  return (
    <>
      <HrefLangAlternates route={calculatorRoute(meta)} locale={locale as Locale} />
      <CalculatorLayout
        locale={locale as Locale}
        meta={meta}
        showUnitToggle={unitAware.has(meta.id)}
        bottomSlot={bottomSlot}
      >
        <Calculator />
      </CalculatorLayout>
    </>
  );
}
