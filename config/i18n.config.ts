/**
 * Locale support matrix / 语言矩阵配置
 * Single source of truth for routing, hreflang, sitemap and metadata generation.
 */

export const locales = ['en', 'de', 'es', 'zh'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

/** Locale that search engines should fall back to (rendered as hreflang="x-default"). */
export const xDefaultLocale: Locale = 'en';

export interface LocaleMeta {
  /** BCP-47 tag used in <html lang> and hreflang attributes. */
  hreflang: string;
  /** Native label used by the locale switcher. */
  label: string;
  /** Short uppercase code shown on compact viewports. */
  short: string;
  /** OpenGraph locale. */
  ogLocale: string;
  /** Intl formatting defaults. */
  currency: string;
  direction: 'ltr' | 'rtl';
}

export const localeMeta: Record<Locale, LocaleMeta> = {
  en: {
    hreflang: 'en',
    label: 'English',
    short: 'EN',
    ogLocale: 'en_US',
    currency: 'USD',
    direction: 'ltr'
  },
  de: {
    hreflang: 'de',
    label: 'Deutsch',
    short: 'DE',
    ogLocale: 'de_DE',
    currency: 'EUR',
    direction: 'ltr'
  },
  es: {
    hreflang: 'es',
    label: 'Español',
    short: 'ES',
    ogLocale: 'es_ES',
    currency: 'EUR',
    direction: 'ltr'
  },
  zh: {
    hreflang: 'zh-Hans',
    label: '简体中文',
    short: 'ZH',
    ogLocale: 'zh_CN',
    currency: 'CNY',
    direction: 'ltr'
  }
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
