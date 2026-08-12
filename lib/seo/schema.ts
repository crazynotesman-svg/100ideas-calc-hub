/**
 * JSON-LD generators / Schema 与 SEO 生成器
 * SEO Rule 2 — every calculator page injects SoftwareApplication + FAQPage.
 */
import { localeMeta, type Locale } from '@/config/i18n.config';
import { siteConfig, absoluteUrl } from '@/config/site.config';
import {
  categoryLabelMap,
  categorySchemaMap,
  type CalculatorMeta
} from '@/config/calculators.config';

export interface FaqEntry {
  question: string;
  answer: string;
}

export function organizationSchema() {
  return {
    '@type': 'Organization',
    '@id': `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url
  };
}

export function websiteSchema(locale: Locale) {
  return {
    '@type': 'WebSite',
    '@id': `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: absoluteUrl(`/${locale}`),
    inLanguage: localeMeta[locale].hreflang,
    publisher: { '@id': `${siteConfig.url}/#organization` }
  };
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url
    }))
  };
}

export function softwareApplicationSchema(params: {
  meta: CalculatorMeta;
  locale: Locale;
  name: string;
  description: string;
  url: string;
  featureList: string[];
}) {
  const { meta, locale, name, description, url, featureList } = params;
  return {
    '@type': 'SoftwareApplication',
    '@id': `${url}#software`,
    name,
    description,
    url,
    applicationCategory: categorySchemaMap[meta.category],
    applicationSubCategory: categoryLabelMap[meta.category],
    operatingSystem: 'Any (web browser)',
    browserRequirements: 'Requires JavaScript. Runs fully client-side.',
    softwareVersion: siteConfig.softwareVersion,
    dateModified: meta.updated,
    inLanguage: localeMeta[locale].hreflang,
    isAccessibleForFree: true,
    featureList,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: localeMeta[locale].currency
    },
    publisher: { '@id': `${siteConfig.url}/#organization` }
  };
}

export function faqPageSchema(url: string, faqs: FaqEntry[]) {
  return {
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

/**
 * CollectionPage + ItemList for the calculators index.
 * Gives Google an explicit, ordered inventory of the tools on the hub page.
 */
export function collectionPageSchema(params: {
  locale: Locale;
  url: string;
  name: string;
  description: string;
  items: Array<{ name: string; url: string }>;
}) {
  const { locale, url, name, description, items } = params;
  return {
    '@type': 'CollectionPage',
    '@id': `${url}#collection`,
    name,
    description,
    url,
    inLanguage: localeMeta[locale].hreflang,
    isPartOf: { '@id': `${siteConfig.url}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        url: item.url
      }))
    }
  };
}

/** Wrap any number of node objects into a single @graph document. */
export function graph(nodes: object[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes
  };
}
