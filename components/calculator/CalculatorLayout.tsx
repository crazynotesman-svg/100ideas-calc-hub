import { getTranslations } from 'next-intl/server';
import { Sigma, ShieldCheck, Sparkles } from 'lucide-react';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { CalculatorSchema } from '@/components/seo/CalculatorSchema';
import { AdSlot } from './AdSlot';
import { FaqAccordion } from './FaqAccordion';
import { UnitToggle } from './UnitToggle';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/i18n/routing';
import type { Locale } from '@/config/i18n.config';
import { absoluteUrl } from '@/config/site.config';
import {
  calculatorRoute,
  calculators,
  type CalculatorMeta
} from '@/config/calculators.config';
import { type FaqEntry } from '@/lib/seo/schema';

interface ContentSection {
  heading: string;
  paragraphs: string[];
  list?: string[];
}

export interface CalculatorLayoutProps {
  locale: Locale;
  meta: CalculatorMeta;
  /** The interactive client-side calculator. */
  children: React.ReactNode;
  /** Show the metric/imperial segmented control in the page header. */
  showUnitToggle?: boolean;
}

/**
 * Universal calculator page container.
 *
 * Layout contract (identical for every calculator, which is what keeps CLS at zero):
 *   header      → breadcrumbs · H1 · intro · unit toggle
 *   main grid   → [ calculator + results ]  |  [ sticky ad rail ]
 *   bottom      → FAQ accordion · formula explanation · long-form SEO content · related tools
 *
 * The component is a Server Component: all copy, schema and layout ship as static HTML,
 * only the calculator itself hydrates.
 */
export async function CalculatorLayout({
  locale,
  meta,
  children,
  showUnitToggle = false
}: CalculatorLayoutProps) {
  const t = await getTranslations({ locale, namespace: `calculators.${meta.id}` });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const tCat = await getTranslations({ locale, namespace: 'categories' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });

  const faqs = t.raw('faq') as FaqEntry[];
  const steps = t.raw('formula.steps') as string[];
  const sections = t.raw('content.sections') as ContentSection[];
  const features = t.raw('features') as string[];

  const pageUrl = absoluteUrl(`/${locale}${calculatorRoute(meta)}`);
  const related = calculators.filter((c) => c.id !== meta.id);

  const crumbs = [
    { label: tNav('home'), href: '/' },
    { label: tNav('calculators'), href: '/calculators' },
    { label: tCat(`${meta.category}.name`), href: '/calculators' },
    { label: t('shortName') }
  ];

  return (
    <>
      {/* SEO Rule 2: WebApplication + FAQPage (+ BreadcrumbList) on every calculator page. */}
      <CalculatorSchema
        locale={locale}
        meta={meta}
        name={t('name')}
        description={t('metaDescription')}
        url={pageUrl}
        featureList={features}
        faqs={faqs}
        breadcrumbs={[
          { name: tNav('home'), url: absoluteUrl(`/${locale}`) },
          { name: tNav('calculators'), url: absoluteUrl(`/${locale}/calculators`) },
          { name: t('name'), url: pageUrl }
        ]}
      />

      {/* ---------------------------------------------------------------- header */}
      <section className="border-b bg-gradient-to-b from-muted/50 to-background">
        <div className="container py-7">
          <Breadcrumbs items={crumbs} label={tc('breadcrumbLabel')} />

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('h1')}</h1>
              <p className="mt-2.5 text-[15px] leading-7 text-muted-foreground">{t('intro')}</p>
            </div>
            {showUnitToggle && <UnitToggle className="shrink-0" />}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              {tc('clientSideNotice')}
            </Badge>
            <Badge variant="outline">
              {tc('lastUpdated')}: {meta.updated}
            </Badge>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- main grid */}
      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">{children}</div>

          <div className="hidden lg:block">
            <div className="sticky top-20 space-y-4">
              <AdSlot
                format="sticky-sidebar"
                slotId={`${meta.id}-sidebar`}
                label={tc('advertisement')}
              />
              <Card>
                <CardContent className="space-y-2 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <Sparkles className="h-4 w-4 text-primary" aria-hidden />
                    {tc('features')}
                  </p>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {features.map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Mobile / tablet in-content ad — reserved height, so no shift on small screens either. */}
        <AdSlot
          format="in-content"
          slotId={`${meta.id}-inline`}
          label={tc('advertisement')}
          className="mt-8 lg:hidden"
        />

        {/* ---------------------------------------------------------- bottom copy */}
        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 space-y-12">
            <section aria-labelledby="faq-heading">
              <h2 id="faq-heading" className="text-xl font-semibold tracking-tight">
                {tc('faqTitle')}
              </h2>
              <div className="mt-3">
                <FaqAccordion items={faqs} />
              </div>
            </section>

            <section aria-labelledby="formula-heading">
              <h2
                id="formula-heading"
                className="flex items-center gap-2 text-xl font-semibold tracking-tight"
              >
                <Sigma className="h-5 w-5 text-primary" aria-hidden />
                {tc('formulaTitle')}
              </h2>
              <div className="prose-seo mt-3">
                <p>{t('formula.intro')}</p>
                <ol className="mt-4 space-y-2.5">
                  {steps.map((step, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {index + 1}
                      </span>
                      <span className="font-mono text-[13.5px] leading-7">{step}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-5 rounded-lg border-l-2 border-primary/40 bg-muted/40 p-3.5 text-sm">
                  {t('formula.note')}
                </p>
              </div>
            </section>

            <section aria-labelledby="about-heading">
              <h2 id="about-heading" className="text-xl font-semibold tracking-tight">
                {tc('aboutTitle')}
              </h2>
              <div className="prose-seo mt-3">
                {sections.map((section) => (
                  <div key={section.heading}>
                    <h3>{section.heading}</h3>
                    {section.paragraphs.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                    {section.list && (
                      <ul>
                        {section.list.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="related-heading">
              <h2 id="related-heading" className="text-xl font-semibold tracking-tight">
                {tc('relatedCalculators')}
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {related.map((item) => (
                  <Link
                    key={item.id}
                    href={calculatorRoute(item)}
                    className="rounded-lg border p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
                  >
                    <p className="text-sm font-semibold">
                      <RelatedName locale={locale} id={item.id} />
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                      {tCat(`${item.category}.name`)}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <div className="hidden lg:block">
            <AdSlot format="sidebar" slotId={`${meta.id}-footer`} label={tc('advertisement')} />
          </div>
        </div>
      </div>
    </>
  );
}

async function RelatedName({ locale, id }: { locale: Locale; id: string }) {
  const t = await getTranslations({ locale, namespace: `calculators.${id}` });
  return <>{t('name')}</>;
}
