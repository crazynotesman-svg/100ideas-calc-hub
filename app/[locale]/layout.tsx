import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { locales, localeMeta, isLocale, type Locale } from '@/config/i18n.config';
import { buildMetadata } from '@/lib/seo/metadata';
import { graph, organizationSchema, websiteSchema } from '@/lib/seo/schema';
import { JsonLd } from '@/components/seo/JsonLd';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import '../globals.css';

/** Every locale is pre-rendered at build time -> static HTML on the edge, LCP well under 1s. */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb'
};

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: 'site' });

  return {
    ...buildMetadata({
      locale,
      route: '/',
      title: t('metaTitle'),
      description: t('metaDescription')
    }),
    title: {
      // Child routes only provide their own title; the template appends the brand.
      default: t('metaTitle'),
      template: `%s | ${t('name')}`
    },
    applicationName: t('name'),
    formatDetection: { telephone: false, address: false, email: false }
  };
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isLocale(locale)) notFound();
  unstable_setRequestLocale(locale);

  const messages = await getMessages();
  const meta = localeMeta[locale as Locale];

  return (
    <html lang={meta.hreflang} dir={meta.direction} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <JsonLd id="site-graph" data={graph([organizationSchema(), websiteSchema(locale)])} />
        <NextIntlClientProvider messages={messages}>
          <SiteHeader locale={locale} />
          <main className="flex-1">{children}</main>
          <SiteFooter locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
