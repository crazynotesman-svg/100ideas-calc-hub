/**
 * Calculator metadata dictionary / 计算器元数据字典
 *
 * This file is the programmatic index that drives:
 *   - static route generation (generateStaticParams)
 *   - the multi-language sitemap
 *   - JSON-LD SoftwareApplication / FAQPage injection
 *   - homepage & category listings
 *
 * Slugs are intentionally locale-independent: one canonical URL shape per calculator
 * keeps link equity consolidated and makes reciprocal hreflang trivially correct.
 */

import { locales, type Locale } from './i18n.config';

export type CalculatorCategory = 'travel' | 'finance' | 'health';

/** schema.org applicationCategory mapping. */
export const categorySchemaMap: Record<CalculatorCategory, string> = {
  travel: 'TravelApplication',
  finance: 'FinanceApplication',
  health: 'HealthApplication'
};

/** Human-facing application sub-category used in the SoftwareApplication payload. */
export const categoryLabelMap: Record<CalculatorCategory, string> = {
  travel: 'Utility Calculator',
  finance: 'Finance Calculator',
  health: 'Health Calculator'
};

export interface CalculatorMeta {
  /** Stable id, also the i18n dictionary key: messages.calculators[id] */
  id: string;
  category: CalculatorCategory;
  slug: string;
  /** Number of FAQ entries present in every locale dictionary (drives FAQPage schema). */
  faqCount: number;
  /** ISO date used for sitemap <lastmod>. */
  updated: string;
  /** Sitemap priority. */
  priority: number;
  featured: boolean;
  /** Locales where the content is fully translated (all four for the MVP). */
  availableLocales: readonly Locale[];
  /** Lucide icon name rendered in listings. */
  icon: 'plane' | 'trending-up' | 'activity';
  accent: string;
}

export const calculators: readonly CalculatorMeta[] = [
  {
    id: 'schengen',
    category: 'travel',
    slug: 'schengen-visa-calculator',
    faqCount: 6,
    updated: '2026-08-12',
    priority: 1,
    featured: true,
    availableLocales: locales,
    icon: 'plane',
    accent: 'from-sky-500/15 to-blue-500/5'
  },
  {
    id: 'fire',
    category: 'finance',
    slug: 'fire-compound-interest-calculator',
    faqCount: 6,
    updated: '2026-08-12',
    priority: 0.9,
    featured: true,
    availableLocales: locales,
    icon: 'trending-up',
    accent: 'from-emerald-500/15 to-teal-500/5'
  },
  {
    id: 'tdee',
    category: 'health',
    slug: 'tdee-macro-calculator',
    faqCount: 6,
    updated: '2026-08-12',
    priority: 0.9,
    featured: true,
    availableLocales: locales,
    icon: 'activity',
    accent: 'from-orange-500/15 to-amber-500/5'
  },
  {
    id: 'body-fat-bmi',
    category: 'health',
    slug: 'body-fat-bmi-calculator',
    faqCount: 6,
    updated: '2026-08-18',
    priority: 0.9,
    featured: true,
    availableLocales: locales,
    icon: 'activity',
    accent: 'from-rose-500/15 to-pink-500/5'
  },
  {
    id: 'compound',
    category: 'finance',
    slug: 'compound-interest-calculator',
    faqCount: 6,
    updated: '2026-08-17',
    priority: 0.9,
    featured: true,
    availableLocales: locales,
    icon: 'trending-up',
    accent: 'from-violet-500/15 to-fuchsia-500/5'
  },
  {
    id: 'mortgage',
    category: 'finance',
    slug: 'mortgage-calculator',
    faqCount: 6,
    updated: '2026-08-18',
    priority: 0.9,
    featured: true,
    availableLocales: locales,
    icon: 'trending-up',
    accent: 'from-blue-500/15 to-indigo-500/5'
  },
  {
    id: 'auto-loan',
    category: 'finance',
    slug: 'auto-loan-calculator',
    faqCount: 6,
    updated: '2026-08-19',
    priority: 0.9,
    featured: true,
    availableLocales: locales,
    icon: 'trending-up',
    accent: 'from-yellow-500/15 to-amber-500/5'
  },
  {
    id: 'student-loan',
    category: 'finance',
    slug: 'student-loan-calculator',
    faqCount: 6,
    updated: '2026-08-19',
    priority: 0.9,
    featured: true,
    availableLocales: locales,
    icon: 'trending-up',
    accent: 'from-cyan-500/15 to-sky-500/5'
  }
] as const;

export const categories: readonly CalculatorCategory[] = ['travel', 'finance', 'health'];

export function getCalculator(category: string, slug: string): CalculatorMeta | undefined {
  return calculators.find((c) => c.category === category && c.slug === slug);
}

export function getCalculatorById(id: string): CalculatorMeta | undefined {
  return calculators.find((c) => c.id === id);
}

export function calculatorsByCategory(category: CalculatorCategory): CalculatorMeta[] {
  return calculators.filter((c) => c.category === category);
}

/** Locale-prefixed relative path, e.g. /de/calculators/travel/schengen-visa-calculator */
export function calculatorPath(locale: Locale | string, meta: CalculatorMeta) {
  return `/${locale}/calculators/${meta.category}/${meta.slug}`;
}

/** Locale-independent route (no prefix) — used by next-intl navigation helpers. */
export function calculatorRoute(meta: CalculatorMeta) {
  return `/calculators/${meta.category}/${meta.slug}`;
}
