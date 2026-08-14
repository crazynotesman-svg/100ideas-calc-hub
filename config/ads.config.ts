/**
 * Google AdSense configuration for CalcAtlas.
 *
 * Two pieces of data:
 *  1. ADSENSE_CLIENT — the publisher ID from the loader snippet Google gave you
 *     (`<script async src=".../adsbygoogle.js?client=ca-pub-1952663885350547">`).
 *  2. ADSENSE_SLOTS — maps the logical slot names used in <AdSlot slotId="..." />
 *     (see components/calculator/CalculatorLayout.tsx) to the numeric Ad Unit IDs
 *     you create in the AdSense dashboard.
 *
 * To activate a placement:
 *   a. AdSense → Ads → By ad unit → create a "Display ad" → copy its ID
 *      (the number from the snippet's `data-ad-slot="..."`).
 *   b. Add an entry below, e.g.  'schengen-sidebar': '1234567890'.
 * Until a slot is configured, <AdSlot> renders the reserved-height placeholder
 * (no ad served, but no layout shift either — satisfies the CLS = 0 rule).
 */
export const ADSENSE_CLIENT = 'ca-pub-1952663885350547';

export const ADSENSE_SLOTS: Record<string, string> = {
  // Logical slotId (from CalculatorLayout) -> real AdSense ad-unit ID.
  // 'schengen-sidebar': 'XXXXXXXXXX',
  // 'schengen-inline': 'XXXXXXXXXX',
  // 'schengen-footer': 'XXXXXXXXXX',
  // 'fire-sidebar': 'XXXXXXXXXX',
  // 'fire-inline': 'XXXXXXXXXX',
  // 'fire-footer': 'XXXXXXXXXX',
  // 'tdee-sidebar': 'XXXXXXXXXX',
  // 'tdee-inline': 'XXXXXXXXXX',
  // 'tdee-footer': 'XXXXXXXXXX'
};
