import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, isLocale } from '@/config/i18n.config';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = requested && isLocale(requested) ? requested : defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    // Deterministic formatting keeps server and client HTML identical -> no hydration shift (CLS = 0).
    timeZone: 'UTC',
    now: new Date()
  };
});
