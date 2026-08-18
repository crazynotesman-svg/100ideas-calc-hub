import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { CalculatorCard } from '@/components/site/CalculatorCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { AdSlot } from '@/components/calculator/AdSlot';
import { locales, isLocale, type Locale } from '@/config/i18n.config';
import { HrefLangAlternates } from '@/components/seo/HrefLangAlternates';
import { absoluteUrl } from '@/config/site.config';
import {
  calculators,
  calculatorPath,
  calculatorsByCategory,
  categories
} from '@/config/calculators.config';
import { buildMetadata } from '@/lib/seo/metadata';
import { breadcrumbSchema, collectionPageSchema, graph } from '@/lib/seo/schema';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: 'calculatorsIndex' });

  return buildMetadata({
    locale,
    route: '/calculators',
    title: t('metaTitle'),
    description: t('metaDescription')
  });
}

export default async function CalculatorsIndexPage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  if (!isLocale(locale)) notFound();
  unstable_setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'calculatorsIndex' });
  const tCat = await getTranslations({ locale, namespace: 'categories' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });

  const pageUrl = absoluteUrl(`/${locale}/calculators`);

  // Names resolved up-front so the ItemList payload is fully localised.
  const items = await Promise.all(
    calculators.map(async (calculator) => {
      const tCalc = await getTranslations({ locale, namespace: `calculators.${calculator.id}` });
      return { name: tCalc('name'), url: absoluteUrl(calculatorPath(locale, calculator)) };
    })
  );

  return (
    <>
      <HrefLangAlternates route="/calculators" locale={locale as Locale} />
      <JsonLd
        id="calculators-index-schema"
        data={graph([
          collectionPageSchema({
            locale,
            url: pageUrl,
            name: t('title'),
            description: t('metaDescription'),
            items
          }),
          breadcrumbSchema([
            { name: tNav('home'), url: absoluteUrl(`/${locale}`) },
            { name: tNav('calculators'), url: pageUrl }
          ])
        ])}
      />

      <section className="border-b bg-gradient-to-b from-muted/50 to-background">
        <div className="container py-8">
          <Breadcrumbs
            items={[{ label: tNav('home'), href: '/' }, { label: tNav('calculators') }]}
            label={tc('breadcrumbLabel')}
          />
          <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">{t('title')}</h1>
          <p className="mt-2.5 max-w-2xl text-[15px] leading-7 text-muted-foreground">
            {t('intro')}
          </p>
        </div>
      </section>

      <div className="container py-10">
        <div className="space-y-12">
          {categories.map((category) => (
            <section key={category} aria-labelledby={`cat-${category}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id={`cat-${category}`} className="text-xl font-semibold tracking-tight">
                  {tCat(`${category}.name`)}
                </h2>
                <p className="text-sm text-muted-foreground">{tCat(`${category}.description`)}</p>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {calculatorsByCategory(category).map((calculator) => (
                  <CalculatorCard key={calculator.id} locale={locale} meta={calculator} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <AdSlot
          format="leaderboard"
          slotId="calculators-index-leaderboard"
          label={tc('advertisement')}
          className="mt-12"
        />
      </div>
    </>
  );
}
