/**
 * ScenarioPresetsGrid — internal linking mesh for the pSEO preset pages.
 *
 * Rendered at the bottom of each base calculator page and inside every preset page,
 * so crawlers (and readers) can hop between pre-filled scenarios. Each card links to a
 * fully resolved, SSG-prerendered scenario route.
 *
 * Calculator-agnostic: the caller supplies the preset list, the i18n namespace for the
 * shared grid copy, and a route builder for the specific calculator.
 */
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Card, CardContent } from '@/components/ui/card';
import type { Locale } from '@/config/i18n.config';

export interface GridPreset {
  slug: string;
  localized: Record<Locale, { title: string; summaryIntro: string }>;
}

interface ScenarioPresetsGridProps {
  locale: Locale;
  /** i18n namespace that holds gridTitle / gridSubtitle / viewPreset / currentLabel. */
  namespace: string;
  /** Preset list to render (already localized per entry). */
  presets: GridPreset[];
  /** Route builder for this calculator's preset pages, e.g. (slug) => `/calculators/.../preset/slug`. */
  routeFor: (slug: string) => string;
  /** Slug of the page currently being viewed, so it can be marked active. */
  current?: string;
}

export async function ScenarioPresetsGrid({
  locale,
  namespace,
  presets,
  routeFor,
  current
}: ScenarioPresetsGridProps) {
  const t = await getTranslations({ locale, namespace });

  return (
    <section aria-labelledby="preset-grid-heading" className="mt-12">
      <h2 id="preset-grid-heading" className="text-xl font-semibold tracking-tight">
        {t('gridTitle')}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{t('gridSubtitle')}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {presets.map((preset) => {
          const loc = preset.localized[locale];
          const active = preset.slug === current;
          return (
            <Card key={preset.slug} className={active ? 'border-primary/40 bg-primary/5' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{loc.title}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {loc.summaryIntro}
                    </p>
                  </div>
                  {active && (
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                      {t('currentLabel')}
                    </span>
                  )}
                </div>

                {active ? (
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">
                    {t('currentLabel')}
                  </span>
                ) : (
                  <Link
                    href={routeFor(preset.slug)}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    {t('viewPreset')}
                  </Link>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
