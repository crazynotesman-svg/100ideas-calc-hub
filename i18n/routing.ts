import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { locales, defaultLocale } from '@/config/i18n.config';

export const routing = defineRouting({
  locales,
  defaultLocale,
  // SEO Rule 1: every locale (including the default) keeps an explicit prefix so that
  // hreflang pairs are always reciprocal and never collapse to a prefix-less duplicate.
  localePrefix: 'always',
  localeDetection: true
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
