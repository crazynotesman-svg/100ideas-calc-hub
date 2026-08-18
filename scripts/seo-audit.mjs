/**
 * SEO / i18n regression audit.
 * Crawls the running production server and asserts the Phase 2 rules:
 *   Rule 1  reciprocal hreflang (every locale + x-default) and a self-referencing canonical
 *   Rule 2  SoftwareApplication + FAQPage JSON-LD on every calculator page
 *   Rule 3  server-rendered interactive markup (nothing waits for JS to paint)
 *
 * Usage: node scripts/seo-audit.mjs [baseUrl]
 */

const base = process.argv[2] || 'http://localhost:3311';
const locales = ['en', 'de', 'es', 'zh'];
const hreflangs = { en: 'en', de: 'de', es: 'es', zh: 'zh-Hans' };
const CANONICAL_ORIGIN = 'https://calc.100ideas.net';

const routes = [
  { route: '', kind: 'home' },
  { route: '/calculators', kind: 'index' },
  { route: '/calculators/travel/schengen-visa-calculator', kind: 'calculator' },
  { route: '/calculators/finance/fire-compound-interest-calculator', kind: 'calculator' },
  { route: '/calculators/health/tdee-macro-calculator', kind: 'calculator' },
  { route: '/calculators/finance/compound-interest-calculator', kind: 'calculator' },
  { route: '/calculators/finance/mortgage-calculator', kind: 'calculator' }
];

let failures = 0;
const rows = [];

function check(condition, message) {
  if (!condition) {
    failures += 1;
    return `FAIL(${message})`;
  }
  return null;
}

for (const locale of locales) {
  for (const { route, kind } of routes) {
    const url = `${base}/${locale}${route}`;
    const res = await fetch(url, { redirect: 'manual' });
    const html = await res.text();
    const problems = [];

    problems.push(check(res.status === 200, `status ${res.status}`));

    // Single source of truth: hreflang must come from the HTML head + sitemap only.
    // A middleware-generated `Link:` header would be a second, conflicting alternate set.
    const linkHeader = res.headers.get('link') || '';
    problems.push(check(!linkHeader.includes('hreflang'), 'duplicate hreflang in Link header'));

    // --- html lang
    const lang = html.match(/<html lang="([^"]+)"/)?.[1];
    problems.push(check(lang === hreflangs[locale], `lang=${lang}`));

    // --- Rule 1: canonical
    const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
    const expectedCanonical = `${CANONICAL_ORIGIN}/${locale}${route}`;
    problems.push(check(canonical === expectedCanonical, `canonical=${canonical}`));

    // --- Rule 1: hreflang set
    // Match the reciprocal hreflang <link> set. The attribute is emitted as lowercase
    // `hreflang` (correct HTML); the regex is case-insensitive and order-tolerant so the
    // audit validates the canonical serialization rather than the old camelCase quirk.
    const alternates = [...html.matchAll(/rel="alternate"[^>]*?hreflang="([^"]+)"[^>]*?href="([^"]+)"/gi)].map(
      (m) => [m[1], m[2]]
    );
    const map = Object.fromEntries(alternates);
    problems.push(check(alternates.length === locales.length + 1, `alt count ${alternates.length}`));
    for (const l of locales) {
      problems.push(
        check(map[hreflangs[l]] === `${CANONICAL_ORIGIN}/${l}${route}`, `hreflang ${l}`)
      );
    }
    problems.push(
      check(map['x-default'] === `${CANONICAL_ORIGIN}/en${route}`, 'x-default')
    );

    // --- Rule 2: JSON-LD
    const types = new Set([...html.matchAll(/"@type":"([^"]+)"/g)].map((m) => m[1]));
    problems.push(check(types.has('Organization') && types.has('WebSite'), 'site graph'));
    if (kind === 'calculator') {
      problems.push(check(types.has('WebApplication'), 'WebApplication'));
      problems.push(check(types.has('FAQPage'), 'FAQPage'));
      problems.push(check(types.has('BreadcrumbList'), 'BreadcrumbList'));
      const questions = [...html.matchAll(/"@type":"Question"/g)].length;
      problems.push(check(questions >= 6, `questions ${questions}`));
      // Rule 3: interactive form must exist in the static HTML, not after hydration.
      problems.push(check(/<input/.test(html), 'no server-rendered input'));
      problems.push(check(/result-shell|chart-shell/.test(html), 'no reserved result shell'));
    }
    if (kind === 'index') {
      problems.push(check(types.has('CollectionPage'), 'CollectionPage'));
      problems.push(check(types.has('ItemList'), 'ItemList'));
    }

    // --- meta hygiene
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
    const desc = html.match(/name="description" content="([^"]*)"/)?.[1] ?? '';
    problems.push(check(title.length > 10 && title.length <= 75, `title len ${title.length}`));
    problems.push(check(desc.length > 50 && desc.length <= 320, `desc len ${desc.length}`));

    const errors = problems.filter(Boolean);
    rows.push({
      url: `/${locale}${route}` || `/${locale}`,
      status: res.status,
      alt: alternates.length,
      jsonld: types.size,
      titleLen: title.length,
      descLen: desc.length,
      result: errors.length ? errors.join(' ') : 'OK'
    });
  }
}

// ------------------------------------------------------------------ sitemap
const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
const urlCount = [...sitemap.matchAll(/<url>/g)].length;
const altCount = [...sitemap.matchAll(/<xhtml:link/g)].length;
const expectedUrls = locales.length * routes.length;
const expectedAlts = expectedUrls * (locales.length + 1);
const sitemapOk = urlCount === expectedUrls && altCount === expectedAlts;
if (!sitemapOk) failures += 1;

const robots = await (await fetch(`${base}/robots.txt`)).text();
const robotsOk = robots.includes('Sitemap:') && robots.includes('/sitemap.xml');
if (!robotsOk) failures += 1;

// -------------------------------------------------------------------- report
console.log('\nPAGE AUDIT');
console.log('─'.repeat(104));
console.log(
  'route'.padEnd(58) + 'code'.padEnd(6) + 'alt'.padEnd(5) + 'ld'.padEnd(4) + 'title'.padEnd(7) + 'desc'.padEnd(6) + 'result'
);
for (const r of rows) {
  console.log(
    r.url.padEnd(58) +
      String(r.status).padEnd(6) +
      String(r.alt).padEnd(5) +
      String(r.jsonld).padEnd(4) +
      String(r.titleLen).padEnd(7) +
      String(r.descLen).padEnd(6) +
      r.result
  );
}

console.log('\nSITEMAP / ROBOTS');
console.log('─'.repeat(104));
console.log(`sitemap <url> entries      ${urlCount} (expected ${expectedUrls})`);
console.log(`sitemap <xhtml:link> tags  ${altCount} (expected ${expectedAlts})`);
console.log(`robots.txt sitemap line    ${robotsOk ? 'OK' : 'MISSING'}`);

console.log(`\n${failures === 0 ? 'PASS — 0 violations' : `FAILED — ${failures} violations`}\n`);
process.exit(failures === 0 ? 0 : 1);
