import type { MetadataRoute } from 'next';
import { locales, localeMeta, xDefaultLocale, type Locale } from '@/config/i18n.config';
import { absoluteUrl } from '@/config/site.config';
import { calculators, calculatorPath } from '@/config/calculators.config';
import { PRESET_SLUGS, presetRoute } from '@/app/[locale]/calculators/[category]/[slug]/preset/tdeePresets';

/**
 * Multi-language sitemap (SEO Rule 1, sitemap half).
 *
 * Every URL is emitted once per locale, and each entry carries the full reciprocal
 * `xhtml:link` alternate set — including x-default — via Next's `alternates.languages`.
 * Google therefore gets the same hreflang graph from both the HTML head and the sitemap.
 *
 * Output: /sitemap.xml  (static file at build time, so it is edge-cached for free)
 */

/** Locale-independent static routes, mirrored across every locale. */
const staticRoutes: Array<{ route: string; priority: number; changeFrequency: Change }> = [
  { route: '', priority: 1, changeFrequency: 'weekly' },
  { route: '/calculators', priority: 0.9, changeFrequency: 'weekly' }
];

type Change = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;

/** Build the languages map required for hreflang alternates in the sitemap. */
function languagesFor(route: string) {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[localeMeta[locale].hreflang] = absoluteUrl(`/${locale}${route}`);
  }
  languages['x-default'] = absoluteUrl(`/${xDefaultLocale}${route}`);
  return languages;
}

function entry(params: {
  locale: Locale;
  route: string;
  priority: number;
  changeFrequency: Change;
  lastModified: string | Date;
}): MetadataRoute.Sitemap[number] {
  const { locale, route, priority, changeFrequency, lastModified } = params;
  return {
    url: absoluteUrl(`/${locale}${route}`),
    lastModified,
    changeFrequency,
    priority,
    alternates: { languages: languagesFor(route) }
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const item of staticRoutes) {
      entries.push({
        ...entry({
          locale,
          route: item.route,
          priority: item.priority,
          changeFrequency: item.changeFrequency,
          lastModified: now
        })
      });
    }

    for (const calculator of calculators) {
      // Only list locales the calculator is actually translated into — a 200 page with
      // fallback English copy would otherwise dilute the hreflang cluster.
      if (!calculator.availableLocales.includes(locale)) continue;

      entries.push({
        url: absoluteUrl(calculatorPath(locale, calculator)),
        lastModified: calculator.updated,
        changeFrequency: 'monthly',
        priority: calculator.priority,
        alternates: {
          languages: languagesFor(`/calculators/${calculator.category}/${calculator.slug}`)
        }
      });
    }

    // TDEE pSEO preset pages — every scenario mirrored across all four locales with full hreflang.
    for (const preset of PRESET_SLUGS) {
      const route = presetRoute(preset);
      entries.push({
        url: absoluteUrl(`/${locale}${route}`),
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: { languages: languagesFor(route) }
      });
    }
  }

  return entries;
}
