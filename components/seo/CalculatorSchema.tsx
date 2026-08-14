/**
 * Calculator structured-data injector.
 *
 * Renders a single JSON-LD <script> containing:
 *   - WebApplication  (the calculator itself, free to use)
 *   - FAQPage         (only when the page has FAQ items)
 *   - BreadcrumbList  (the page's breadcrumb trail)
 *
 * Composed from the generators in @/lib/seo/schema and emitted through the
 * zero-JS JsonLd injector so it lands in the static HTML.
 */
import { JsonLd } from '@/components/seo/JsonLd';
import {
  breadcrumbSchema,
  faqPageSchema,
  graph,
  webApplicationSchema,
  type FaqEntry
} from '@/lib/seo/schema';
import type { CalculatorMeta } from '@/config/calculators.config';
import type { Locale } from '@/config/i18n.config';

interface CalculatorSchemaProps {
  locale: Locale;
  meta: CalculatorMeta;
  name: string;
  description: string;
  url: string;
  featureList: string[];
  faqs: FaqEntry[];
  breadcrumbs: Array<{ name: string; url: string }>;
}

export function CalculatorSchema({
  locale,
  meta,
  name,
  description,
  url,
  featureList,
  faqs,
  breadcrumbs
}: CalculatorSchemaProps) {
  const nodes: object[] = [
    webApplicationSchema({ meta, locale, name, description, url, featureList }),
    faqPageSchema(url, faqs),
    breadcrumbSchema(breadcrumbs)
  ];

  return <JsonLd id={`calculator-schema-${meta.id}`} data={graph(nodes)} />;
}
