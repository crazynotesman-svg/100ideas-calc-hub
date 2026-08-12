import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';

/**
 * Locale negotiation order (highest priority first):
 *   1. Explicit URL prefix            -> /de/... always wins, never rewritten.
 *   2. NEXT_LOCALE cookie             -> the visitor's last manual choice.
 *   3. Accept-Language request header  -> best quality match against the support matrix.
 *   4. defaultLocale                   -> `en`.
 */
const intlMiddleware = createMiddleware({
  ...routing,
  localeDetection: true,
  /**
   * Disabled on purpose — SINGLE SOURCE OF TRUTH for hreflang.
   *
   * next-intl's automatic `Link:` headers would emit a second, conflicting alternate set:
   * they use the bare locale code (`zh` instead of our `zh-Hans`), resolve against the
   * request host rather than the canonical origin, and never include `x-default`.
   * Google merges HTML head + HTTP headers + sitemap, so two disagreeing sets are a
   * hreflang conflict. All alternates are therefore emitted only from
   * `lib/seo/metadata.ts` (HTML head) and `app/sitemap.ts`, which share one generator.
   */
  alternateLinks: false
});

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);
  // Expose the resolved pathname so server components can build canonical URLs without guessing.
  response.headers.set('x-pathname', request.nextUrl.pathname);
  return response;
}

export const config = {
  // Skip API routes, Next internals, sitemap.xml / robots.txt and any file with an extension.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
