import { getTranslations } from 'next-intl/server';
import { Calculator } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { Locale } from '@/config/i18n.config';
import { LocaleSwitcher } from './LocaleSwitcher';

export async function SiteHeader({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale });

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-14 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Calculator className="h-4 w-4" aria-hidden />
          </span>
          <span>{t('site.name')}</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm" aria-label={t('nav.calculators')}>
          <Link href="/" className="hidden text-muted-foreground hover:text-foreground sm:block">
            {t('nav.home')}
          </Link>
          <Link href="/calculators" className="text-muted-foreground hover:text-foreground">
            {t('nav.calculators')}
          </Link>
          <LocaleSwitcher current={locale} />
        </nav>
      </div>
    </header>
  );
}
