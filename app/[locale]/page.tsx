import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { Gauge, Globe2, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalculatorCard } from '@/components/site/CalculatorCard';
import { AdSlot } from '@/components/calculator/AdSlot';
import { locales, isLocale, type Locale } from '@/config/i18n.config';
import { HrefLangAlternates } from '@/components/seo/HrefLangAlternates';
import {
  calculators,
  calculatorRoute,
  categories,
  calculatorsByCategory,
  getCalculatorById
} from '@/config/calculators.config';
import { buildMetadata } from '@/lib/seo/metadata';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: 'site' });

  return buildMetadata({
    locale,
    route: '/',
    title: t('metaTitle'),
    description: t('metaDescription')
  });
}

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  if (!isLocale(locale)) notFound();
  unstable_setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'home' });
  const tCat = await getTranslations({ locale, namespace: 'categories' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });

  const schengen = getCalculatorById('schengen');
  const trust = [
    { icon: Gauge, title: t('trust.speedTitle'), body: t('trust.speedBody') },
    { icon: ShieldCheck, title: t('trust.privacyTitle'), body: t('trust.privacyBody') },
    { icon: Globe2, title: t('trust.i18nTitle'), body: t('trust.i18nBody') }
  ];

  return (
    <>
      <HrefLangAlternates route="/" locale={locale as Locale} />
      {/* ----------------------------------------------------------------- hero */}
      <section className="border-b bg-gradient-to-b from-muted/60 to-background">
        <div className="container py-14 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              {t('heroBadge')}
            </Badge>
            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl sm:leading-[1.1]">
              {t('heroTitle')}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 text-muted-foreground sm:text-base">
              {t('heroSubtitle')}
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/calculators">{t('ctaPrimary')}</Link>
              </Button>
              {schengen && (
                <Button asChild size="lg" variant="outline">
                  <Link href={calculatorRoute(schengen)}>{t('ctaSecondary')}</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- featured */}
      <section className="container py-12" aria-labelledby="featured-heading">
        <div className="max-w-2xl">
          <h2 id="featured-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            {t('featuredTitle')}
          </h2>
          <p className="mt-2 text-[15px] leading-7 text-muted-foreground">
            {t('featuredSubtitle')}
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {calculators
            .filter((calculator) => calculator.featured)
            .map((calculator) => (
              <CalculatorCard key={calculator.id} locale={locale} meta={calculator} />
            ))}
        </div>

        <AdSlot
          format="leaderboard"
          slotId="home-leaderboard"
          label={tc('advertisement')}
          className="mt-8"
        />
      </section>

      {/* ---------------------------------------------------------------- trust */}
      <section className="border-y bg-muted/30" aria-labelledby="trust-heading">
        <div className="container py-12">
          <h2 id="trust-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            {t('trustTitle')}
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {trust.map((item) => (
              <div key={item.title} className="rounded-lg border bg-card p-5">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="h-4.5 w-4.5" aria-hidden />
                </span>
                <h3 className="mt-3 text-[15px] font-semibold">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ categories */}
      <section className="container py-12" aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
          {t('browseByCategory')}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {categories.map((category) => (
            <div key={category} className="rounded-lg border p-5">
              <h3 className="text-[15px] font-semibold">{tCat(`${category}.name`)}</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                {tCat(`${category}.description`)}
              </p>
              <ul className="mt-3 space-y-1.5 text-sm">
                {calculatorsByCategory(category).map((calculator) => (
                  <li key={calculator.id}>
                    <Link
                      href={calculatorRoute(calculator)}
                      className="text-primary hover:underline"
                    >
                      <CalculatorName locale={locale} id={calculator.id} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          <Link href="/calculators" className="font-medium text-primary hover:underline">
            {tNav('calculators')} →
          </Link>
        </p>
      </section>
    </>
  );
}

async function CalculatorName({ locale, id }: { locale: string; id: string }) {
  const t = await getTranslations({ locale, namespace: `calculators.${id}` });
  return <>{t('shortName')}</>;
}
