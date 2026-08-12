import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { calculators, calculatorRoute } from '@/config/calculators.config';
import type { Locale } from '@/config/i18n.config';

export async function SiteFooter({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale });
  const year = 2026;

  return (
    <footer className="mt-16 border-t bg-muted/30">
      <div className="container grid gap-8 py-10 md:grid-cols-3">
        <div>
          <p className="font-semibold">{t('site.name')}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t('site.tagline')}</p>
        </div>

        <div>
          <p className="text-sm font-semibold">{t('nav.calculators')}</p>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            {calculators.map((meta) => (
              <li key={meta.id}>
                <Link href={calculatorRoute(meta)} className="hover:text-foreground">
                  {t(`calculators.${meta.id}.shortName`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>{t('footer.disclaimer')}</p>
          <p className="mt-3">{t('footer.builtWith')}</p>
        </div>
      </div>

      <div className="container border-t py-5 text-xs text-muted-foreground">
        © {year} {t('site.name')}. {t('footer.rights')}
      </div>
    </footer>
  );
}
