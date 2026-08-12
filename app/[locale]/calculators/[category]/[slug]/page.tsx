import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { CalculatorLayout } from '@/components/calculator/CalculatorLayout';
import { locales, isLocale, type Locale } from '@/config/i18n.config';
import { calculators, getCalculator, calculatorRoute } from '@/config/calculators.config';
import { buildMetadata } from '@/lib/seo/metadata';

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
  )
};

/** Calculators that expose the metric/imperial switch in the page header. */
const unitAware = new Set(['tdee']);

/** locales × calculators — all 12 pages are pre-rendered as static HTML. */
export function generateStaticParams() {
  return locales.flatMap((locale) =>
    calculators.map((calculator) => ({
      locale,
      category: calculator.category,
      slug: calculator.slug
    }))
  );
}

export const dynamicParams = false;

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

  return (
    <CalculatorLayout
      locale={locale as Locale}
      meta={meta}
      showUnitToggle={unitAware.has(meta.id)}
    >
      <Calculator />
    </CalculatorLayout>
  );
}
