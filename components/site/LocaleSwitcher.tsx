'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Languages } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/routing';
import { locales, localeMeta, type Locale } from '@/config/i18n.config';
import { cn } from '@/lib/utils';

/**
 * Switches locale while staying on the exact same route, so the visitor never gets
 * bounced to the homepage — and the URL prefix always wins over Accept-Language afterwards
 * (next-intl writes the NEXT_LOCALE cookie on navigation).
 */
export function LocaleSwitcher({ current }: { current: Locale }) {
  const t = useTranslations('nav');
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-1.5">
      <Languages className="hidden h-4 w-4 text-muted-foreground sm:block" aria-hidden />
      <label htmlFor="locale-switcher" className="sr-only">
        {t('switchLanguage')}
      </label>
      <select
        id="locale-switcher"
        aria-label={t('switchLanguage')}
        value={current}
        disabled={isPending}
        onChange={(event) => {
          const next = event.target.value as Locale;
          startTransition(() => {
            router.replace(pathname, { locale: next });
          });
        }}
        className={cn(
          'h-9 cursor-pointer rounded-md border border-input bg-background px-2 text-sm font-medium',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isPending && 'opacity-60'
        )}
      >
        {locales.map((locale) => (
          <option key={locale} value={locale}>
            {localeMeta[locale].label}
          </option>
        ))}
      </select>
    </div>
  );
}
