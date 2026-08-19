/**
 * Dedicated pSEO sitemap — long-tail preset pages only.
 * ----------------------------------------------------------------------------
 * Output: /sitemap-presets.xml
 *
 * Every preset scenario (TDEE, FIRE, Schengen) mirrored across all four locales,
 * each carrying the full reciprocal hreflang set (en/de/es/zh-Hans + x-default).
 *
 * Kept separate from the core /sitemap.xml so the long-tail index coverage can be
 * monitored independently in Google Search Console. Both files are referenced from
 * robots.txt, so crawlers discover each from a single directive set.
 */
import { locales, localeMeta, xDefaultLocale } from '@/config/i18n.config';
import { absoluteUrl } from '@/config/site.config';
import { PRESET_SLUGS as TDEE, presetRoute as tdeeRoute } from '@/app/[locale]/calculators/[category]/[slug]/preset/tdeePresets';
import { PRESET_SLUGS as FIRE, presetRoute as fireRoute } from '@/app/[locale]/calculators/[category]/[slug]/preset/firePresets';
import { PRESET_SLUGS as SCHENGEN, presetRoute as schengenRoute } from '@/app/[locale]/calculators/[category]/[slug]/preset/schengenPresets';
import { PRESET_SLUGS as COMPOUND, presetRoute as compoundRoute } from '@/app/[locale]/calculators/[category]/[slug]/preset/compoundInterestPresets';
import { PRESET_SLUGS as MORTGAGE, presetRoute as mortgageRoute } from '@/app/[locale]/calculators/[category]/[slug]/preset/mortgagePresets';
import { PRESET_SLUGS as BODYFAT, presetRoute as bodyFatRoute } from '@/app/[locale]/calculators/[category]/[slug]/preset/bodyFatPresets';
import { PRESET_SLUGS as AUTOLOAN, presetRoute as autoLoanRoute } from '@/app/[locale]/calculators/[category]/[slug]/preset/autoLoanPresets';
import { PRESET_SLUGS as STUDENTLOAN, presetRoute as studentLoanRoute } from '@/app/[locale]/calculators/[category]/[slug]/preset/studentLoanPresets';
import { PRESET_SLUGS as LEASEVSBUY, presetRoute as leaseVsBuyRoute } from '@/app/[locale]/calculators/[category]/[slug]/preset/leaseVsBuyPresets';

const ALL_PRESET_ROUTES: string[] = [
  ...TDEE.map((s) => tdeeRoute(s)),
  ...FIRE.map((s) => fireRoute(s)),
  ...SCHENGEN.map((s) => schengenRoute(s)),
  ...COMPOUND.map((s) => compoundRoute(s)),
  ...MORTGAGE.map((s) => mortgageRoute(s)),
  ...BODYFAT.map((s) => bodyFatRoute(s)),
  ...AUTOLOAN.map((s) => autoLoanRoute(s)),
  ...STUDENTLOAN.map((s) => studentLoanRoute(s)),
  ...LEASEVSBUY.map((s) => leaseVsBuyRoute(s))
];

function languagesFor(route: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[localeMeta[locale].hreflang] = absoluteUrl(`/${locale}${route}`);
  }
  languages['x-default'] = absoluteUrl(`/${xDefaultLocale}${route}`);
  return languages;
}

// Pre-render at build time so the file is edge-cached for free.
export const dynamic = 'force-static';

export function GET() {
  const now = new Date().toISOString();

  const urls = ALL_PRESET_ROUTES.flatMap((route) =>
    locales.map((locale) => {
      const self = absoluteUrl(`/${locale}${route}`);
      const alts = Object.entries(languagesFor(route))
        .map(([h, u]) => `      <xhtml:link rel="alternate" hreflang="${h}" href="${u}"/>`)
        .join('\n');
      return `    <url>
      <loc>${self}</loc>
      <lastmod>${now}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
${alts}
    </url>`;
    })
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    }
  });
}
