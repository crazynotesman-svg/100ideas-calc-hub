import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import type { Locale } from '@/config/i18n.config';
import type { GridPreset } from './ScenarioPresetsGrid';

interface PresetQuickTweakProps {
  locale: Locale;
  /** Slug of the preset currently being viewed — shown as an active, non-linked pill. */
  current: string;
  /** Full sibling list for this calculator's matrix. */
  presets: GridPreset[];
  /** Route builder for this calculator's preset pages. */
  routeFor: (slug: string) => string;
}

/**
 * Quick Scenario Tweak Bar.
 *
 * A horizontal pill list of a preset page's sibling scenarios, mounted at the top of
 * every `/preset/[scenario]` page. The current scenario is shown as an active pill; the
 * rest are one-tap links that jump to another pre-filled scenario via next-intl <Link>,
 * which performs a client-side navigation (no full reload, no re-fetch) — the low-friction
 * switch that reduces bounce.
 */
export async function PresetQuickTweak({ locale, current, presets, routeFor }: PresetQuickTweakProps) {
  if (presets.length <= 1) return null;

  const t = await getTranslations({ locale, namespace: 'common.tweak' });

  return (
    <section aria-label={t('heading')} className="mb-6 rounded-xl border bg-muted/30 p-3">
      <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {t('heading')}
      </p>
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => {
          const active = p.slug === current;
          if (active) {
            return (
              <span
                key={p.slug}
                aria-current="true"
                className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
              >
                {p.localized[locale].title}
              </span>
            );
          }
          return (
            <Link
              key={p.slug}
              href={routeFor(p.slug)}
              scroll={false}
              className="rounded-full border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
            >
              {p.localized[locale].title}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
