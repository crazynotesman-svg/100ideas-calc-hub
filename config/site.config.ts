/**
 * Global site constants. Deployment target: Cloudflare Pages / Vercel Edge.
 */
export const siteConfig = {
  name: 'CalcAtlas',
  /**
   * Absolute origin, no trailing slash.
   * Production default is the live domain; override with NEXT_PUBLIC_SITE_URL at build time
   * (Cloudflare Pages → Settings → Environment variables, or a .env file).
   */
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://calc.100ideas.net').replace(/\/$/, ''),
  twitter: '@calcatlas',
  publisher: 'CalcAtlas',
  /** Used in SoftwareApplication schema. */
  softwareVersion: '1.0.0'
} as const;

/** Build an absolute URL from a locale-prefixed path. */
export function absoluteUrl(path = '/') {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${siteConfig.url}${clean === '/' ? '' : clean}`;
}
