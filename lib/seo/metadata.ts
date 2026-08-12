import type { Metadata } from 'next';
import { locales, localeMeta, xDefaultLocale, type Locale } from '@/config/i18n.config';
import { siteConfig, absoluteUrl } from '@/config/site.config';

export interface BuildMetadataInput {
  locale: Locale;
  /** Locale-independent route WITHOUT the locale prefix, e.g. `/calculators/travel/schengen-visa-calculator`. Use '' for the homepage. */
  route: string;
  title: string;
  description: string;
  keywords?: string[];
  /** Overrides the default `website` OG type. */
  ogType?: 'website' | 'article';
  /** Set to false for utility routes that must not be indexed. */
  index?: boolean;
}

/**
 * SEO Rule 1 — Strict Hreflang Tagging.
 * Produces a reciprocal alternate set for every supported locale plus x-default,
 * and a canonical that points at the exact current locale route.
 */
export function buildAlternates(route: string, locale: Locale) {
  const normalized = route === '/' ? '' : route.replace(/\/$/, '');

  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[localeMeta[l].hreflang] = absoluteUrl(`/${l}${normalized}`);
  }
  languages['x-default'] = absoluteUrl(`/${xDefaultLocale}${normalized}`);

  return {
    canonical: absoluteUrl(`/${locale}${normalized}`),
    languages
  };
}

export function buildMetadata(input: BuildMetadataInput): Metadata {
  const { locale, route, title, description, keywords, ogType = 'website', index = true } = input;
  const alternates = buildAlternates(route, locale);

  return {
    title,
    description,
    keywords,
    alternates,
    metadataBase: new URL(siteConfig.url),
    robots: index
      ? {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 }
        }
      : { index: false, follow: false },
    openGraph: {
      type: ogType,
      title,
      description,
      url: alternates.canonical,
      siteName: siteConfig.name,
      locale: localeMeta[locale].ogLocale,
      alternateLocale: locales.filter((l) => l !== locale).map((l) => localeMeta[l].ogLocale)
    },
    twitter: {
      card: 'summary_large_image',
      site: siteConfig.twitter,
      title,
      description
    }
  };
}
