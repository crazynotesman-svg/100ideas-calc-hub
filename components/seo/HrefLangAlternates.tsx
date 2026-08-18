import { buildAlternates } from '@/lib/seo/metadata';
import type { Locale } from '@/config/i18n.config';

/**
 * Renders the reciprocal hreflang <link> set as real React elements.
 *
 * Both Next.js' `metadata.alternates.languages` and React's `hrefLang` prop
 * serialise the attribute as `hrefLang` (camelCase), which trips strict
 * parsers/linters. Passing the lowercase `hreflang` key instead forces React to
 * emit the correct lowercase `hreflang` attribute in the served HTML.
 * (React prints a dev-only warning about the unknown property; it is suppressed
 * in production builds and never reaches the static HTML.)
 */
export function HrefLangAlternates({ route, locale }: { route: string; locale: Locale }) {
  const { languages } = buildAlternates(route, locale);

  return (
    <>
      {Object.entries(languages).map(([code, href]) => {
        const linkProps = { rel: 'alternate', hreflang: code, href } as Record<string, string>;
        // eslint-disable-next-line react/no-unknown-property
        return <link key={code} {...(linkProps as Record<string, string>)} />;
      })}
    </>
  );
}
