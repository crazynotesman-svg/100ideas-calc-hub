import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site.config';

/**
 * Output: /robots.txt
 *
 * Everything indexable is a static, locale-prefixed page, so a single permissive rule
 * is enough. `_next/` is disallowed to keep build-asset URLs out of crawl reports.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/_next/', '/api/']
      }
    ],
    sitemap: [
      `${siteConfig.url}/sitemap.xml`,
      `${siteConfig.url}/sitemap-presets.xml`
    ],
    host: siteConfig.url
  };
}
