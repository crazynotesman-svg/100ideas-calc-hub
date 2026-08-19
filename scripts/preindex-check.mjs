#!/usr/bin/env node
/**
 * P0 Pre-Indexing Health Check — CalcAtlas
 * ----------------------------------------------------------------------------
 * Verifies technical SEO readiness BEFORE triggering search-engine indexing.
 *
 *  1. robots.txt  — User-agent: * is allowed and references the sitemap.
 *  2. sitemap.xml — references every SSG content route; each <url> carries the
 *                   full reciprocal hreflang set (en/de/es/zh-Hans + x-default).
 *  3. head tags   — every calculator route has a clean canonical (no query),
 *                   the complete hreflang alternate set, and valid JSON-LD
 *                   (WebApplication + BreadcrumbList + FAQPage).
 *
 * Usage:
 *   node scripts/preindex-check.mjs https://calc.100ideas.net
 *   node scripts/preindex-check.mjs http://127.0.0.1:3311
 *
 * Exit code: 0 when every check passes, 1 when any FAIL is found.
 */

const base = (process.argv[2] || 'https://calc.100ideas.net').replace(/\/$/, '');
const ORIGIN = new URL(base).origin;

const LOCALES = ['en', 'de', 'es', 'zh'];
const HREFLANG = { en: 'en', de: 'de', es: 'es', zh: 'zh-Hans' };
const EXPECTED = new Set([...LOCALES.map((l) => HREFLANG[l]), 'x-default'].map((h) => h.toLowerCase()));

const CALCULATORS = [
  { category: 'travel', slug: 'schengen-visa-calculator' },
  { category: 'finance', slug: 'fire-compound-interest-calculator' },
  { category: 'health', slug: 'tdee-macro-calculator' },
  { category: 'finance', slug: 'compound-interest-calculator' },
  { category: 'finance', slug: 'mortgage-calculator' },
  { category: 'health', slug: 'body-fat-bmi-calculator' },
  { category: 'finance', slug: 'auto-loan-calculator' },
  { category: 'finance', slug: 'student-loan-calculator' },
  { category: 'finance', slug: 'lease-vs-buy-calculator' }
];

// pSEO preset scenarios across every calculator — kept here so both the sitemap
// coverage check and the head-tag check below share one source of truth.
const PRESETS = [
  { category: 'health', slug: 'tdee-macro-calculator', scenario: '25-year-old-male' },
  { category: 'health', slug: 'tdee-macro-calculator', scenario: '30-year-old-female' },
  { category: 'health', slug: 'tdee-macro-calculator', scenario: 'sedentary-office-worker' },
  { category: 'health', slug: 'tdee-macro-calculator', scenario: 'weight-loss-cutting' },
  { category: 'finance', slug: 'fire-compound-interest-calculator', scenario: 'fat-fire-tech-engineer' },
  { category: 'finance', slug: 'fire-compound-interest-calculator', scenario: 'lean-fire-digital-nomad' },
  { category: 'finance', slug: 'fire-compound-interest-calculator', scenario: 'barista-fire-semi-retired' },
  { category: 'finance', slug: 'fire-compound-interest-calculator', scenario: 'coast-fire-early-career' },
  { category: 'travel', slug: 'schengen-visa-calculator', scenario: '90-day-rule-tourist' },
  { category: 'travel', slug: 'schengen-visa-calculator', scenario: 'frequent-business-traveler' },
  { category: 'travel', slug: 'schengen-visa-calculator', scenario: 'digital-nomad-schengen-shuffle' },
  { category: 'travel', slug: 'schengen-visa-calculator', scenario: 'overstay-risk-checker' },
  { category: 'finance', slug: 'compound-interest-calculator', scenario: '10k-at-7-percent-20-years' },
  { category: 'finance', slug: 'compound-interest-calculator', scenario: 'monthly-500-dollar-index-fund-growth' },
  { category: 'finance', slug: 'compound-interest-calculator', scenario: '100k-sp500-historical-return-30-years' },
  { category: 'finance', slug: 'compound-interest-calculator', scenario: 'millionaire-by-40-monthly-contribution' },
  { category: 'finance', slug: 'compound-interest-calculator', scenario: 'lump-sum-50k-5-years' },
  { category: 'finance', slug: 'compound-interest-calculator', scenario: 'conservative-saver-3-percent-20-years' },
  { category: 'finance', slug: 'compound-interest-calculator', scenario: 'early-start-teen-investor-18-to-65' },
  { category: 'finance', slug: 'compound-interest-calculator', scenario: 'high-earner-2k-monthly-15-years' },
  { category: 'finance', slug: 'mortgage-calculator', scenario: '30-year-fixed-mortgage-7-percent' },
  { category: 'finance', slug: 'mortgage-calculator', scenario: '15-year-fixed-vs-30-year-mortgage' },
  { category: 'finance', slug: 'mortgage-calculator', scenario: '500k-house-20-percent-down-payment' },
  { category: 'finance', slug: 'mortgage-calculator', scenario: 'extra-100-monthly-payment-mortgage-payoff' },
  { category: 'finance', slug: 'mortgage-calculator', scenario: '700k-house-10-percent-down' },
  { category: 'finance', slug: 'mortgage-calculator', scenario: 'mortgage-amortization-first-5-years' },
  { category: 'finance', slug: 'mortgage-calculator', scenario: '1-million-luxury-home-mortgage' },
  { category: 'finance', slug: 'mortgage-calculator', scenario: 'rental-property-mortgage-calculator' },
  { category: 'health', slug: 'body-fat-bmi-calculator', scenario: 'navy-body-fat-formula-calculator' },
  { category: 'health', slug: 'body-fat-bmi-calculator', scenario: 'bmi-vs-body-fat-percentage' },
  { category: 'health', slug: 'body-fat-bmi-calculator', scenario: 'female-body-fat-calculator' },
  { category: 'health', slug: 'body-fat-bmi-calculator', scenario: 'ideal-body-fat-percentage-by-age' },
  { category: 'health', slug: 'body-fat-bmi-calculator', scenario: 'body-fat-percentage-men-average' },
  { category: 'health', slug: 'body-fat-bmi-calculator', scenario: 'bmi-calculator-weight-height' },
  { category: 'health', slug: 'body-fat-bmi-calculator', scenario: 'lean-mass-body-composition' },
  { category: 'health', slug: 'body-fat-bmi-calculator', scenario: 'weight-loss-body-fat-target' },
  { category: 'finance', slug: 'auto-loan-calculator', scenario: '30k-car-loan-5-year-6-percent' },
  { category: 'finance', slug: 'auto-loan-calculator', scenario: '60-month-vs-72-month-auto-loan' },
  { category: 'finance', slug: 'auto-loan-calculator', scenario: 'used-car-loan-interest-rate-calculator' },
  { category: 'finance', slug: 'auto-loan-calculator', scenario: 'zero-down-payment-auto-loan' },
  { category: 'finance', slug: 'auto-loan-calculator', scenario: '50k-luxury-car-loan-payment' },
  { category: 'finance', slug: 'auto-loan-calculator', scenario: 'trade-in-value-car-loan-calculator' },
  { category: 'finance', slug: 'auto-loan-calculator', scenario: 'auto-loan-sales-tax-calculator' },
  { category: 'finance', slug: 'auto-loan-calculator', scenario: '20k-budget-car-loan-payment' },
  { category: 'finance', slug: 'student-loan-calculator', scenario: '30k-10yr-6.5' },
  { category: 'finance', slug: 'student-loan-calculator', scenario: '50k-graduate-7.5' },
  { category: 'finance', slug: 'student-loan-calculator', scenario: '100k-medical-law' },
  { category: 'finance', slug: 'student-loan-calculator', scenario: 'extra-200-payoff' },
  { category: 'finance', slug: 'student-loan-calculator', scenario: 'parent-plus-40k' },
  { category: 'finance', slug: 'student-loan-calculator', scenario: 'refinance-5pct-7yr' },
  { category: 'finance', slug: 'student-loan-calculator', scenario: 'idr-vs-standard' },
  { category: 'finance', slug: 'student-loan-calculator', scenario: '25k-grace-period' },
  { category: 'finance', slug: 'lease-vs-buy-calculator', scenario: '35k-36mo-luxury' },
  { category: 'finance', slug: 'lease-vs-buy-calculator', scenario: '50k-ev-tesla' },
  { category: 'finance', slug: 'lease-vs-buy-calculator', scenario: 'zero-down-lease' },
  { category: 'finance', slug: 'lease-vs-buy-calculator', scenario: 'high-mileage-commuter' },
  { category: 'finance', slug: 'lease-vs-buy-calculator', scenario: '25k-budget-sedan' },
  { category: 'finance', slug: 'lease-vs-buy-calculator', scenario: '60k-truck-suv' },
  { category: 'finance', slug: 'lease-vs-buy-calculator', scenario: 'business-tax-deduction' },
  { category: 'finance', slug: 'lease-vs-buy-calculator', scenario: 'low-money-factor-promo' }
];

// Every SSG content route that must appear in a sitemap and carry a clean
// canonical + full hreflang + JSON-LD. Core routes live in /sitemap.xml; the 48
// preset routes live in /sitemap-presets.xml. (Canonical/sitemap are emitted with
// the production origin, so all host-agnostic checks below compare PATHNAME only.)
const targets = [];
for (const c of CALCULATORS) {
  for (const l of LOCALES) targets.push({ path: `/${l}/calculators/${c.category}/${c.slug}`, calc: true });
}
for (const p of PRESETS) {
  for (const l of LOCALES)
    targets.push({ path: `/${l}/calculators/${p.category}/${p.slug}/preset/${p.scenario}`, calc: true });
}
for (const l of LOCALES) {
  targets.push({ path: `/${l}`, calc: false });
  targets.push({ path: `/${l}/calculators`, calc: false });
}

// Core (non-preset) routes that MUST live in /sitemap.xml. The 48 preset routes
// are intentionally excluded here — they are verified in [2b] against
// /sitemap-presets.xml instead (task: "pSEO Sitemap Isolation").
const corePaths = targets.map((t) => t.path).filter((p) => !p.includes('/preset/'));

const C = {
  pass: '\x1b[32m', fail: '\x1b[31m', warn: '\x1b[33m',
  dim: '\x1b[90m', rst: '\x1b[0m', bold: '\x1b[1m'
};

let failedTargets = 0;
let warnedTargets = 0;
let totalChecks = 0;

async function get(path) {
  const res = await fetch(base + path, { redirect: 'manual' });
  const text = await res.text();
  return { res, text };
}

function collectTypes(value, acc = new Set()) {
  if (Array.isArray(value)) { value.forEach((v) => collectTypes(v, acc)); return acc; }
  if (value && typeof value === 'object') {
    if (value['@type']) {
      const t = Array.isArray(value['@type']) ? value['@type'] : [value['@type']];
      t.forEach((x) => acc.add(x));
    }
    if (value['@graph']) collectTypes(value['@graph'], acc);
    for (const k of Object.keys(value)) {
      if (k !== '@type' && k !== '@graph') collectTypes(value[k], acc);
    }
  }
  return acc;
}

// ---------------------------------------------------------------- [1] robots
console.log(`\n${C.bold}[1/3] robots.txt${C.rst} ${C.dim}(${base}/robots.txt)${C.rst}`);
{
  const { res, text } = await get('/robots.txt');
  if (res.status !== 200) {
    console.log(`${C.fail}[FAIL]${C.rst} robots.txt returned HTTP ${res.status}`);
    failedTargets++;
  } else {
    const allowsAll = /User-agent:\s*\*/i.test(text) && /Allow:\s*\//m.test(text);
    if (allowsAll) console.log(`${C.pass}[PASS]${C.rst} User-agent: * allowed (Allow: /)`);
    else { console.log(`${C.fail}[FAIL]${C.rst} robots.txt does not allow User-agent: *`); failedTargets++; }
    totalChecks++;

    const m = text.match(/Sitemap:\s*(\S+)/i);
    if (m && m[1].includes('sitemap.xml')) {
      console.log(`${C.pass}[PASS]${C.rst} Sitemap directive present → ${m[1]}`);
    } else {
      console.log(`${C.fail}[FAIL]${C.rst} robots.txt missing/wrong Sitemap: directive`);
      failedTargets++;
    }
    totalChecks++;
  }
}

// -------------------------------------------------------------- [2] sitemap
console.log(`\n${C.bold}[2/3] sitemap.xml${C.rst} ${C.dim}(${base}/sitemap.xml)${C.rst}`);
let sitemapOk = true;
{
  const { res, text } = await get('/sitemap.xml');
  if (res.status !== 200) {
    console.log(`${C.fail}[FAIL]${C.rst} sitemap.xml returned HTTP ${res.status}`);
    failedTargets++; sitemapOk = false;
  } else {
    const blocks = text.split('<url>').slice(1).map((b) => b.split('</url>')[0]);
    const locs = blocks.map((b) => (b.match(/<loc>([^<]+)<\/loc>/) || [])[1]).filter(Boolean);
    const paths = new Set(
      locs.map((u) => {
        try { return new URL(u).pathname; } catch { return u; }
      })
    );
    console.log(`${C.pass}[PASS]${C.rst} ${locs.length} <url> entries`);
    totalChecks++;

    let missingAlts = 0;
    for (const b of blocks) {
      const langs = new Set([...b.matchAll(/hreflang="([^"]+)"/g)].map((m) => m[1].toLowerCase()));
      for (const h of EXPECTED) if (!langs.has(h)) missingAlts++;
    }
    if (missingAlts === 0) {
      console.log(`${C.pass}[PASS]${C.rst} every <url> carries full hreflang set (en/de/es/zh-Hans/x-default)`);
    } else {
      console.log(`${C.fail}[FAIL]${C.rst} ${missingAlts} missing hreflang alternates across sitemap`);
      failedTargets++; sitemapOk = false;
    }
    totalChecks++;

    const expectedPaths = corePaths;
    const missing = expectedPaths.filter((p) => !paths.has(p));
    if (missing.length === 0) {
      console.log(`${C.pass}[PASS]${C.rst} all ${expectedPaths.length} core routes present in sitemap.xml`);
    } else {
      console.log(`${C.fail}[FAIL]${C.rst} routes missing from sitemap: ${missing.join(', ')}`);
      failedTargets++; sitemapOk = false;
    }
    totalChecks++;
  }
}

// -------------------------------------------------- [2b] sitemap-presets.xml
console.log(
  `\n${C.bold}[2b/3] sitemap-presets.xml${C.rst} ${C.dim}(${base}/sitemap-presets.xml)${C.rst}`
);
{
  const { res, text } = await get('/sitemap-presets.xml');
  if (res.status !== 200) {
    console.log(`${C.fail}[FAIL]${C.rst} sitemap-presets.xml returned HTTP ${res.status}`);
    failedTargets++;
  } else {
    const blocks = text.split('<url>').slice(1).map((b) => b.split('</url>')[0]);
    const locs = blocks.map((b) => (b.match(/<loc>([^<]+)<\/loc>/) || [])[1]).filter(Boolean);
    const paths = new Set(
      locs.map((u) => {
        try {
          return new URL(u).pathname;
        } catch {
          return u;
        }
      })
    );
    console.log(`${C.pass}[PASS]${C.rst} ${locs.length} <url> entries`);
    totalChecks++;

    let missingAlts = 0;
    for (const b of blocks) {
      const langs = new Set([...b.matchAll(/hreflang="([^"]+)"/g)].map((m) => m[1].toLowerCase()));
      for (const h of EXPECTED) if (!langs.has(h)) missingAlts++;
    }
    if (missingAlts === 0) {
      console.log(
        `${C.pass}[PASS]${C.rst} every <url> carries full hreflang set (en/de/es/zh-Hans/x-default)`
      );
    } else {
      console.log(
        `${C.fail}[FAIL]${C.rst} ${missingAlts} missing hreflang alternates in sitemap-presets.xml`
      );
      failedTargets++;
    }
    totalChecks++;

    const expectedPresetPaths = PRESETS.flatMap((p) =>
      LOCALES.map((l) => `/${l}/calculators/${p.category}/${p.slug}/preset/${p.scenario}`)
    );
    const missing = expectedPresetPaths.filter((p) => !paths.has(p));
    if (missing.length === 0) {
      console.log(
        `${C.pass}[PASS]${C.rst} all ${expectedPresetPaths.length} preset routes present in sitemap-presets.xml`
      );
    } else {
      console.log(
        `${C.fail}[FAIL]${C.rst} preset routes missing: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '…' : ''}`
      );
      failedTargets++;
    }
    totalChecks++;
  }
}

// ------------------------------------------------------------ [3] head tags
console.log(`\n${C.bold}[3/3] head tags${C.rst} ${C.dim}(canonical · hreflang · JSON-LD)${C.rst}`);

const results = await Promise.all(
  targets.map(async ({ path, calc }) => {
    const r = { path, errors: [], warnings: [] };
    const { res, text } = await get(path);
    if (res.status !== 200) { r.errors.push(`HTTP ${res.status}`); return r; }

    const can = (text.match(/rel="canonical"[^>]*href="([^"]+)"/i) || [])[1];
    if (!can) r.errors.push('missing canonical');
    else if (can.includes('?')) r.errors.push(`canonical has query: ${can}`);
    else {
      let canPath;
      try { canPath = new URL(can).pathname; } catch { canPath = null; }
      if (!canPath) r.errors.push(`canonical unparseable: ${can}`);
      else if (canPath !== path) r.errors.push(`canonical mismatch: ${can}`);
    }

    const raw = [...text.matchAll(/rel="alternate"[^>]*hreflang="([^"]+)"/gi)].map((m) => m[1].toLowerCase());
    const have = new Set(raw);
    if (![...EXPECTED].every((h) => have.has(h))) r.errors.push(`hreflang incomplete [${raw.join(', ')}]`);
    if (/hrefLang=/.test(text)) r.warnings.push('hreflang serialized as hrefLang (camelCase)');

    if (calc) {
      const types = new Set();
      for (const s of [...text.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1])) {
        try { collectTypes(JSON.parse(s), types); } catch { /* ignore malformed block */ }
      }
      if (!types.has('WebApplication')) r.errors.push('no WebApplication JSON-LD');
      if (!types.has('BreadcrumbList')) r.errors.push('no BreadcrumbList JSON-LD');
      if (!types.has('FAQPage')) r.errors.push('no FAQPage JSON-LD');
    }
    return r;
  })
);

for (const r of results) {
  const tag = r.errors.length ? `${C.fail}[FAIL]${C.rst}` : `${C.pass}[PASS]${C.rst}`;
  let line = `${tag} ${r.path}`;
  if (r.errors.length) line += `  ${C.dim}→ ${r.errors.join('; ')}${C.rst}`;
  if (r.warnings.length) { line += `  ${C.warn}(warn: ${r.warnings.join('; ')})${C.rst}`; warnedTargets++; }
  if (r.errors.length) failedTargets++;
  console.log(line);
}

// ---------------------------------------------------------------- summary
console.log(`\n${'─'.repeat(64)}`);
console.log(`${C.bold}SUMMARY${C.rst}`);
const calcCount = CALCULATORS.length * LOCALES.length;
const presetCount = PRESETS.length * LOCALES.length;
console.log(`  pages checked : ${targets.length} (${calcCount} calculator + ${LOCALES.length * 2} home/listing + ${presetCount} preset)`);
console.log(`  sitemap/robots: ${sitemapOk ? `${C.pass}OK${C.rst}` : `${C.fail}FAIL${C.rst}`}`);
console.log(`  pages with failures : ${failedTargets}`);
console.log(`  pages with warnings : ${warnedTargets}`);
console.log(`${'─'.repeat(64)}`);
if (failedTargets === 0) {
  console.log(`${C.pass}RESULT: PASS — ready for Google Search Console submission.${C.rst}\n`);
  process.exit(0);
} else {
  console.log(`${C.fail}RESULT: FAIL — ${failedTargets} page(s) have blocking issues.${C.rst}\n`);
  process.exit(1);
}
