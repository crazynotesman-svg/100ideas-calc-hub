import { getTranslations } from 'next-intl/server';
import { FileQuestion } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';

/**
 * Locale-aware 404. Rendered inside the [locale] layout, so header, footer and
 * language switcher stay available — visitors are never dead-ended.
 */
export default async function LocaleNotFound() {
  const t = await getTranslations('notFound');

  return (
    <div className="container flex min-h-[52vh] flex-col items-center justify-center py-16 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-muted text-muted-foreground">
        <FileQuestion className="h-6 w-6" aria-hidden />
      </span>
      <h1 className="mt-5 text-2xl font-bold tracking-tight">{t('title')}</h1>
      <p className="mt-2 max-w-md text-[15px] leading-7 text-muted-foreground">
        {t('description')}
      </p>
      <Button asChild className="mt-6">
        <Link href="/calculators">{t('cta')}</Link>
      </Button>
    </div>
  );
}
