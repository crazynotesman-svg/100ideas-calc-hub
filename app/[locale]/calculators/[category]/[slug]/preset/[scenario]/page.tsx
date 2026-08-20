import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { CalculatorLayout } from '@/components/calculator/CalculatorLayout';
import { ScenarioPresetsGrid } from '@/components/seo/ScenarioPresetsGrid';
import { PresetQuickTweak } from '@/components/seo/PresetQuickTweak';
import { TdeeCalculator } from '@/components/calculators/TdeeCalculator';
import { FireCalculator } from '@/components/calculators/FireCalculator';
import { SchengenCalculator } from '@/components/calculators/SchengenCalculator';
import { calculateTdee } from '@/lib/calculators/health/tdee';
import { calculateFire, type FireResult } from '@/lib/calculators/finance/fire';
import { calculateSchengen, type SchengenResult } from '@/lib/calculators/travel/schengen';
import {
  TDEE_CATEGORY,
  TDEE_SLUG,
  PRESET_SLUGS as TDEE_SLUGS,
  PRESETS as TDEE_PRESETS,
  getPreset as getTdee,
  presetRoute as tdeeRoute,
  tdeeInitialQuery
} from '@/app/[locale]/calculators/[category]/[slug]/preset/tdeePresets';
import {
  FIRE_CATEGORY,
  FIRE_SLUG,
  PRESET_SLUGS as FIRE_SLUGS,
  PRESETS as FIRE_PRESETS,
  getPreset as getFire,
  presetRoute as fireRoute,
  fireInitialQuery
} from '@/app/[locale]/calculators/[category]/[slug]/preset/firePresets';
import {
  SCHENGEN_CATEGORY,
  SCHENGEN_SLUG,
  PRESET_SLUGS as SCHENGEN_SLUGS,
  PRESETS as SCHENGEN_PRESETS,
  getPreset as getSchengen,
  presetRoute as schengenRoute,
  schengenInitialQuery
} from '@/app/[locale]/calculators/[category]/[slug]/preset/schengenPresets';
import { CompoundInterestCalculatorClient } from '@/components/calculators/finance/CompoundInterestCalculatorClient';
import { calculateCompound, type CompoundResult } from '@/lib/calculators/finance/compound';
import { MortgageCalculatorClient } from '@/components/calculators/finance/MortgageCalculatorClient';
import { calculateMortgage, type MortgageResult } from '@/lib/calculators/finance/mortgage';
import {
  COMPOUND_CATEGORY,
  COMPOUND_SLUG,
  PRESET_SLUGS as COMPOUND_SLUGS,
  PRESETS as COMPOUND_PRESETS,
  getPreset as getCompound,
  presetRoute as compoundRoute,
  compoundInitialQuery
} from '@/app/[locale]/calculators/[category]/[slug]/preset/compoundInterestPresets';
import {
  MORTGAGE_CATEGORY,
  MORTGAGE_SLUG,
  PRESET_SLUGS as MORTGAGE_SLUGS,
  PRESETS as MORTGAGE_PRESETS,
  getPreset as getMortgage,
  presetRoute as mortgageRoute,
  mortgageInitialQuery
} from '@/app/[locale]/calculators/[category]/[slug]/preset/mortgagePresets';
import { BodyFatBmiCalculatorClient } from '@/components/calculators/health/BodyFatBmiCalculatorClient';
import { calculateBodyFatBmi, type BodyFatBmiResult } from '@/lib/calculators/health/body-fat-bmi';
import {
  BODYFAT_CATEGORY,
  BODYFAT_SLUG,
  PRESET_SLUGS as BODYFAT_SLUGS,
  PRESETS as BODYFAT_PRESETS,
  getPreset as getBodyFat,
  presetRoute as bodyFatRoute,
  bodyFatInitialQuery
} from '@/app/[locale]/calculators/[category]/[slug]/preset/bodyFatPresets';
import { AutoLoanCalculatorClient } from '@/components/calculators/finance/AutoLoanCalculatorClient';
import { calculateAutoLoan, type AutoLoanResult } from '@/lib/calculators/finance/auto-loan';
import {
  AUTOLOAN_CATEGORY,
  AUTOLOAN_SLUG,
  PRESET_SLUGS as AUTOLOAN_SLUGS,
  PRESETS as AUTOLOAN_PRESETS,
  getPreset as getAutoLoan,
  presetRoute as autoLoanRoute,
  autoLoanInitialQuery
} from '@/app/[locale]/calculators/[category]/[slug]/preset/autoLoanPresets';
import { StudentLoanCalculatorClient } from '@/components/calculators/finance/StudentLoanCalculatorClient';
import { calculateStudentLoan, type StudentLoanResult } from '@/lib/calculators/finance/student-loan';
import {
  STUDENTLOAN_CATEGORY,
  STUDENTLOAN_SLUG,
  PRESET_SLUGS as STUDENTLOAN_SLUGS,
  PRESETS as STUDENTLOAN_PRESETS,
  getPreset as getStudentLoan,
  presetRoute as studentLoanRoute,
  studentLoanInitialQuery
} from '@/app/[locale]/calculators/[category]/[slug]/preset/studentLoanPresets';
import { LeaseVsBuyCalculatorClient } from '@/components/calculators/finance/LeaseVsBuyCalculatorClient';
import { calculateLeaseVsBuy, type LeaseVsBuyResult } from '@/lib/calculators/finance/lease-vs-buy';
import {
  LEASEVSBUY_CATEGORY,
  LEASEVSBUY_SLUG,
  PRESET_SLUGS as LEASEVSBUY_SLUGS,
  PRESETS as LEASEVSBUY_PRESETS,
  getPreset as getLeaseVsBuy,
  presetRoute as leaseVsBuyRoute,
  leaseVsBuyInitialQuery
} from '@/app/[locale]/calculators/[category]/[slug]/preset/leaseVsBuyPresets';
import { CreditCardPayoffCalculatorClient } from '@/components/calculators/finance/CreditCardPayoffCalculatorClient';
import {
  calculateCreditCardPayoff,
  type CreditCardPayoffResult
} from '@/lib/calculators/finance/credit-card-payoff';
import {
  CREDITCARDPAYOFF_CATEGORY,
  CREDITCARDPAYOFF_SLUG,
  PRESET_SLUGS as CREDITCARDPAYOFF_SLUGS,
  PRESETS as CREDITCARDPAYOFF_PRESETS,
  getPreset as getCreditCardPayoff,
  presetRoute as creditCardPayoffRoute,
  creditCardPayoffInitialQuery
} from '@/app/[locale]/calculators/[category]/[slug]/preset/creditCardPayoffPresets';
import { buildMetadata } from '@/lib/seo/metadata';
import { HrefLangAlternates } from '@/components/seo/HrefLangAlternates';
import { isLocale, locales, localeMeta, type Locale } from '@/config/i18n.config';
import { calculatorRoute, getCalculator } from '@/config/calculators.config';

interface PageParams {
  params: { locale: string; category: string; slug: string; scenario: string };
}

/**
 * SSG for the pSEO preset pages (TDEE, FIRE and Schengen).
 *
 * We deliberately return the FULL param chain (locale + category + slug + scenario)
 * rather than only `{ scenario }`. The `[category]` segment has no own
 * generateStaticParams, so a child-only param object leaves that segment unresolved
 * and Next silently skips the route under `dynamicParams = false`. Supplying every
 * ancestor value from this single GSP lets Next prerender all scenario pages.
 */
export function generateStaticParams() {
  const expand = (category: string, slug: string, scenarios: string[]) =>
    scenarios.map((scenario) => ({ category, slug, scenario }));
  const combos = [
    ...expand(TDEE_CATEGORY, TDEE_SLUG, TDEE_SLUGS),
    ...expand(FIRE_CATEGORY, FIRE_SLUG, FIRE_SLUGS),
    ...expand(SCHENGEN_CATEGORY, SCHENGEN_SLUG, SCHENGEN_SLUGS),
    ...expand(COMPOUND_CATEGORY, COMPOUND_SLUG, COMPOUND_SLUGS),
    ...expand(MORTGAGE_CATEGORY, MORTGAGE_SLUG, MORTGAGE_SLUGS),
    ...expand(BODYFAT_CATEGORY, BODYFAT_SLUG, BODYFAT_SLUGS),
    ...expand(AUTOLOAN_CATEGORY, AUTOLOAN_SLUG, AUTOLOAN_SLUGS),
    ...expand(STUDENTLOAN_CATEGORY, STUDENTLOAN_SLUG, STUDENTLOAN_SLUGS),
    ...expand(LEASEVSBUY_CATEGORY, LEASEVSBUY_SLUG, LEASEVSBUY_SLUGS),
    ...expand(CREDITCARDPAYOFF_CATEGORY, CREDITCARDPAYOFF_SLUG, CREDITCARDPAYOFF_SLUGS)
  ];
  return locales.flatMap((l) => combos.map((c) => ({ locale: l, ...c })));
}

/** Unknown scenarios (and any non-preset URL) must 404, not render a thin page. */
export const dynamicParams = false;

export async function generateMetadata({
  params: { locale, slug, scenario }
}: PageParams): Promise<Metadata> {
  if (!isLocale(locale)) return {};
  const l = locale as Locale;

  let preset;
  let route;
  if (slug === TDEE_SLUG) {
    const p = getTdee(scenario);
    if (!p) return {};
    preset = p;
    route = tdeeRoute(scenario);
  } else if (slug === FIRE_SLUG) {
    const p = getFire(scenario);
    if (!p) return {};
    preset = p;
    route = fireRoute(scenario);
  } else if (slug === SCHENGEN_SLUG) {
    const p = getSchengen(scenario);
    if (!p) return {};
    preset = p;
    route = schengenRoute(scenario);
  } else if (slug === COMPOUND_SLUG) {
    const p = getCompound(scenario);
    if (!p) return {};
    preset = p;
    route = compoundRoute(scenario);
  } else if (slug === MORTGAGE_SLUG) {
    const p = getMortgage(scenario);
    if (!p) return {};
    preset = p;
    route = mortgageRoute(scenario);
  } else if (slug === BODYFAT_SLUG) {
    const p = getBodyFat(scenario);
    if (!p) return {};
    preset = p;
    route = bodyFatRoute(scenario);
  } else if (slug === AUTOLOAN_SLUG) {
    const p = getAutoLoan(scenario);
    if (!p) return {};
    preset = p;
    route = autoLoanRoute(scenario);
  } else if (slug === STUDENTLOAN_SLUG) {
    const p = getStudentLoan(scenario);
    if (!p) return {};
    preset = p;
    route = studentLoanRoute(scenario);
  } else if (slug === LEASEVSBUY_SLUG) {
    const p = getLeaseVsBuy(scenario);
    if (!p) return {};
    preset = p;
    route = leaseVsBuyRoute(scenario);
  } else if (slug === CREDITCARDPAYOFF_SLUG) {
    const p = getCreditCardPayoff(scenario);
    if (!p) return {};
    preset = p;
    route = creditCardPayoffRoute(scenario);
  } else {
    return {};
  }

  const loc = preset.localized[l];
  return buildMetadata({
    locale: l,
    route,
    title: loc.title,
    description: loc.description,
    keywords: [slug.replace(/-/g, ' '), 'calculator', 'preset', scenario.replace(/-/g, ' ')],
    ogType: 'article'
  });
}

export default async function PresetPage({
  params: { locale, category, slug, scenario }
}: PageParams) {
  if (!isLocale(locale)) notFound();
  if (
    category !== TDEE_CATEGORY &&
    category !== FIRE_CATEGORY &&
    category !== SCHENGEN_CATEGORY &&
    category !== COMPOUND_CATEGORY &&
    category !== MORTGAGE_CATEGORY &&
    category !== BODYFAT_CATEGORY &&
    category !== AUTOLOAN_CATEGORY &&
    category !== STUDENTLOAN_CATEGORY &&
    category !== LEASEVSBUY_CATEGORY &&
    category !== CREDITCARDPAYOFF_CATEGORY
  )
    notFound();
  const l = locale as Locale;
  const meta = getCalculator(category, slug);
  if (!meta) notFound();

  unstable_setRequestLocale(locale);

  let title: string;
  let description: string;
  let faqs: { question: string; answer: string }[];
  let benchmark: React.ReactNode;
  let calculatorNode: React.ReactNode;
  let ns: string;
  let presets: { slug: string; localized: Record<Locale, { title: string; summaryIntro: string }> }[];
  let routeFor: (s: string) => string;

  if (slug === TDEE_SLUG) {
    const p = getTdee(scenario);
    if (!p) notFound();
    const r = calculateTdee(p.defaultParams);
    const loc = p.localized[l];
    title = loc.title;
    description = loc.description;
    faqs = loc.faqs;
    ns = 'tdeePresets';
    presets = TDEE_PRESETS;
    routeFor = tdeeRoute;
    calculatorNode = (
      <TdeeCalculator initialState={p.defaultParams} initialQuery={tdeeInitialQuery(p)} cardTitle={title} />
    );
    benchmark = await TdeeBenchmark(l, r);
  } else if (slug === FIRE_SLUG) {
    const p = getFire(scenario);
    if (!p) notFound();
    const r = calculateFire(p.defaultParams);
    const loc = p.localized[l];
    title = loc.title;
    description = loc.description;
    faqs = loc.faqs;
    ns = 'firePresets';
    presets = FIRE_PRESETS;
    routeFor = fireRoute;
    calculatorNode = (
      <FireCalculator initialState={p.defaultParams} initialQuery={fireInitialQuery(p)} cardTitle={title} />
    );
    benchmark = await FireBenchmark(l, r);
  } else if (slug === SCHENGEN_SLUG) {
    const p = getSchengen(scenario);
    if (!p) notFound();
    const r = calculateSchengen(p.defaultParams.trips, p.defaultParams.referenceDate);
    const loc = p.localized[l];
    title = loc.title;
    description = loc.description;
    faqs = loc.faqs;
    ns = 'schengenPresets';
    presets = SCHENGEN_PRESETS;
    routeFor = schengenRoute;
    calculatorNode = <SchengenCalculator initialQuery={schengenInitialQuery(p)} cardTitle={title} />;
    benchmark = await SchengenBenchmark(l, r);
  } else if (slug === COMPOUND_SLUG) {
    const p = getCompound(scenario);
    if (!p) notFound();
    const r = calculateCompound(p.defaultParams);
    const loc = p.localized[l];
    title = loc.title;
    description = loc.description;
    faqs = loc.faqs;
    ns = 'compoundPresets';
    presets = COMPOUND_PRESETS;
    routeFor = compoundRoute;
    calculatorNode = (
      <CompoundInterestCalculatorClient
        initialState={p.defaultParams}
        initialQuery={compoundInitialQuery(p)}
        cardTitle={title}
      />
    );
    benchmark = await CompoundInterestBenchmark(l, r);
  } else if (slug === MORTGAGE_SLUG) {
    const p = getMortgage(scenario);
    if (!p) notFound();
    const r = calculateMortgage(p.defaultParams);
    const loc = p.localized[l];
    title = loc.title;
    description = loc.description;
    faqs = loc.faqs;
    ns = 'mortgagePresets';
    presets = MORTGAGE_PRESETS;
    routeFor = mortgageRoute;
    calculatorNode = (
      <MortgageCalculatorClient
        initialState={p.defaultParams}
        initialQuery={mortgageInitialQuery(p)}
        cardTitle={title}
      />
    );
    benchmark = await MortgageBenchmark(l, r);
  } else if (slug === BODYFAT_SLUG) {
    const p = getBodyFat(scenario);
    if (!p) notFound();
    const r = calculateBodyFatBmi(p.defaultParams);
    const loc = p.localized[l];
    title = loc.title;
    description = loc.description;
    faqs = loc.faqs;
    ns = 'bodyFatPresets';
    presets = BODYFAT_PRESETS;
    routeFor = bodyFatRoute;
    calculatorNode = (
      <BodyFatBmiCalculatorClient
        initialState={p.defaultParams}
        initialQuery={bodyFatInitialQuery(p)}
        cardTitle={title}
      />
    );
    benchmark = await BodyFatBmiBenchmark(l, r);
  } else if (slug === AUTOLOAN_SLUG) {
    const p = getAutoLoan(scenario);
    if (!p) notFound();
    const r = calculateAutoLoan(p.defaultParams);
    const loc = p.localized[l];
    title = loc.title;
    description = loc.description;
    faqs = loc.faqs;
    ns = 'autoLoanPresets';
    presets = AUTOLOAN_PRESETS;
    routeFor = autoLoanRoute;
    calculatorNode = (
      <AutoLoanCalculatorClient
        initialState={p.defaultParams}
        initialQuery={autoLoanInitialQuery(p)}
        cardTitle={title}
      />
    );
    benchmark = await AutoLoanBenchmark(l, r);
  } else if (slug === STUDENTLOAN_SLUG) {
    const p = getStudentLoan(scenario);
    if (!p) notFound();
    const r = calculateStudentLoan(p.defaultParams);
    const loc = p.localized[l];
    title = loc.title;
    description = loc.description;
    faqs = loc.faqs;
    ns = 'studentLoanPresets';
    presets = STUDENTLOAN_PRESETS;
    routeFor = studentLoanRoute;
    calculatorNode = (
      <StudentLoanCalculatorClient
        initialState={p.defaultParams}
        initialQuery={studentLoanInitialQuery(p)}
        cardTitle={title}
      />
    );
    benchmark = await StudentLoanBenchmark(l, r);
  } else if (slug === LEASEVSBUY_SLUG) {
    const p = getLeaseVsBuy(scenario);
    if (!p) notFound();
    const r = calculateLeaseVsBuy(p.defaultParams);
    const loc = p.localized[l];
    title = loc.title;
    description = loc.description;
    faqs = loc.faqs;
    ns = 'leaseVsBuyPresets';
    presets = LEASEVSBUY_PRESETS;
    routeFor = leaseVsBuyRoute;
    calculatorNode = (
      <LeaseVsBuyCalculatorClient
        initialState={p.defaultParams}
        initialQuery={leaseVsBuyInitialQuery(p)}
        cardTitle={title}
      />
    );
    benchmark = await LeaseVsBuyBenchmark(l, r);
  } else if (slug === CREDITCARDPAYOFF_SLUG) {
    const p = getCreditCardPayoff(scenario);
    if (!p) notFound();
    const r = calculateCreditCardPayoff(p.defaultParams);
    const loc = p.localized[l];
    title = loc.title;
    description = loc.description;
    faqs = loc.faqs;
    ns = 'creditCardPayoffPresets';
    presets = CREDITCARDPAYOFF_PRESETS;
    routeFor = creditCardPayoffRoute;
    calculatorNode = (
      <CreditCardPayoffCalculatorClient
        initialState={p.defaultParams}
        initialQuery={creditCardPayoffInitialQuery(p)}
        cardTitle={title}
      />
    );
    benchmark = await CreditCardPayoffBenchmark(l, r);
  } else {
    notFound();
    return;
  }

  const tPreset = await getTranslations({ locale: l, namespace: ns });

  return (
    <>
      <HrefLangAlternates route={routeFor(scenario)} locale={l} />
      <CalculatorLayout
        locale={l}
        meta={meta}
        showUnitToggle={slug === TDEE_SLUG || slug === BODYFAT_SLUG}
        scenario={{
        name: title,
        description,
        faqs,
        breadcrumbLabel: title,
        canonicalRoute: routeFor(scenario),
        afterCalculator: (
          <section aria-labelledby="preset-benchmark" className="mt-10">
            <h2 id="preset-benchmark" className="text-xl font-semibold tracking-tight">
              {tPreset('benchmarkTitle')}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {tPreset('benchmarkIntro', { scenario: title })}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{benchmark}</div>
          </section>
        ),
        footer: (
          <ScenarioPresetsGrid
            locale={l}
            namespace={ns}
            presets={presets}
            routeFor={routeFor}
            current={scenario}
          />
        )
      }}
    >
      <>
        <PresetQuickTweak locale={l} current={scenario} presets={presets} routeFor={routeFor} />
        {calculatorNode}
      </>
    </CalculatorLayout>
    </>
  );
}

/* ----------------------------------------------------------------- benchmarks */

async function TdeeBenchmark(locale: Locale, r: ReturnType<typeof calculateTdee>) {
  const t = await getTranslations({ locale, namespace: 'calculators.tdee.ui' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  const nf1 = new Intl.NumberFormat(locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  return (
    <>
      <PresetStat label={t('bmr')} value={`${nf.format(r.bmr)} ${tc('kcal')}`} />
      <PresetStat label={t('tdee')} value={`${nf.format(r.tdee)} ${tc('kcal')}`} />
      <PresetStat label={t('targetCalories')} value={`${nf.format(r.targetCalories)} ${tc('kcal')}`} accent />
      <PresetStat label={t('bmi')} value={nf1.format(r.bmi)} />
      <PresetStat label={t('protein')} value={`${nf.format(r.macros.proteinG)} ${tc('grams')}`} />
      <PresetStat label={t('carbs')} value={`${nf.format(r.macros.carbsG)} ${tc('grams')}`} />
      <PresetStat label={t('fat')} value={`${nf.format(r.macros.fatG)} ${tc('grams')}`} />
    </>
  );
}

async function FireBenchmark(locale: Locale, r: FireResult) {
  const t = await getTranslations({ locale, namespace: 'calculators.fire.ui' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const money = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: localeMeta[locale].currency,
    maximumFractionDigits: 0
  });
  return (
    <>
      <PresetStat label={t('fireNumber')} value={money.format(r.fireNumber)} accent />
      <PresetStat
        label={t('fireAge')}
        value={r.fireAge ? `${r.fireAge} ${tc('yearsOld')}` : t('notReached')}
      />
      <PresetStat
        label={t('balanceAtRetirement')}
        value={`${money.format(r.balanceAtRetirement)}`}
      />
      <PresetStat
        label={t('sustainableIncome')}
        value={money.format(r.sustainableRealIncome)}
      />
      <PresetStat label={t('totalGrowth')} value={money.format(r.totalGrowth)} />
      <PresetStat label={t('coverage')} value={`${Math.round(r.coverageRatio * 100)}%`} />
    </>
  );
}

async function SchengenBenchmark(locale: Locale, r: SchengenResult) {
  const t = await getTranslations({ locale, namespace: 'calculators.schengen.ui' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const df = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
  const statusLabel =
    r.status === 'ok'
      ? t('statusOk')
      : r.status === 'warning'
        ? t('statusWarning')
        : r.status === 'critical'
          ? t('statusCritical')
          : t('statusOverstay');
  return (
    <>
      <PresetStat label={t('daysUsed')} value={`${r.daysUsed} / 90`} accent />
      <PresetStat label={t('daysRemaining')} value={`${r.daysRemaining} ${tc('days')}`} />
      <PresetStat label={t('maxConsecutive')} value={`${r.maxConsecutiveDays} ${tc('days')}`} />
      <PresetStat
        label={t('nextEntry')}
        value={r.nextEntryDate ? df.format(new Date(`${r.nextEntryDate}T00:00:00Z`)) : t('nextEntryToday')}
      />
      <PresetStat label={t('fullReset')} value={df.format(new Date(`${r.fullResetDate}T00:00:00Z`))} />
      <PresetStat label={t('status')} value={statusLabel} />
    </>
  );
}

async function CompoundInterestBenchmark(locale: Locale, r: CompoundResult) {
  const t = await getTranslations({ locale, namespace: 'calculators.compound.ui' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const money = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: localeMeta[locale].currency,
    maximumFractionDigits: 0
  });
  return (
    <>
      <PresetStat label={t('futureValue')} value={money.format(r.futureValue)} accent />
      <PresetStat label={t('totalPrincipal')} value={money.format(r.totalPrincipal)} />
      <PresetStat label={t('totalInterest')} value={money.format(r.totalInterest)} />
      <PresetStat
        label={t('interestRatioLabel')}
        value={`${Math.round(r.interestRatio * 100)}%`}
      />
      <PresetStat label={t('cagr')} value={`${r.cagr.toFixed(1)}%`} />
      <PresetStat label={tc('years')} value={`${r.series.length}`} />
    </>
  );
}

async function MortgageBenchmark(locale: Locale, r: MortgageResult) {
  const t = await getTranslations({ locale, namespace: 'calculators.mortgage.ui' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const money = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: localeMeta[locale].currency,
    maximumFractionDigits: 0
  });
  return (
    <>
      <PresetStat label={t('monthlyPayment')} value={money.format(r.monthlyPayment)} accent />
      <PresetStat label={t('totalInterest')} value={money.format(r.totalInterest)} />
      <PresetStat label={t('totalCost')} value={money.format(r.totalCost)} />
      <PresetStat label={t('payoffTime')} value={`${r.payoffYears.toFixed(1)} ${tc('years')}`} />
      {r.hasExtra && (
        <>
          <PresetStat label={t('monthsSaved')} value={String(r.monthsSaved)} />
          <PresetStat label={t('interestSaved')} value={money.format(r.interestSaved)} accent />
        </>
      )}
    </>
  );
}

async function BodyFatBmiBenchmark(locale: Locale, r: BodyFatBmiResult) {
  const t = await getTranslations({ locale, namespace: 'calculators.body-fat-bmi.ui' });
  const nf1 = new Intl.NumberFormat(locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  const bmiLabel = {
    underweight: t('bmiUnderweight'),
    normal: t('bmiNormal'),
    overweight: t('bmiOverweight'),
    obese: t('bmiObese')
  }[r.bmiCategory];
  const bfLabel = {
    essential: t('bfEssential'),
    athletic: t('bfAthletic'),
    fitness: t('bfFitness'),
    average: t('bfAverage'),
    high: t('bfHigh')
  }[r.bodyFatCategory];
  return (
    <>
      <PresetStat label={t('bmi')} value={`${nf1.format(r.bmi)} · ${bmiLabel}`} accent />
      <PresetStat
        label={t('bodyFat')}
        value={`${nf1.format(r.bodyFatPercentage)}% · ${bfLabel}`}
        accent
      />
      <PresetStat label={t('fatMass')} value={`${nf1.format(r.fatMassKg)} kg`} />
      <PresetStat label={t('leanMass')} value={`${nf1.format(r.leanMassKg)} kg`} />
    </>
  );
}

async function AutoLoanBenchmark(locale: Locale, r: AutoLoanResult) {
  const t = await getTranslations({ locale, namespace: 'calculators.auto-loan.ui' });
  const money = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: localeMeta[locale].currency,
    maximumFractionDigits: 0
  });
  return (
    <>
      <PresetStat label={t('monthlyPayment')} value={money.format(r.monthlyPayment)} accent />
      <PresetStat label={t('loanAmountLabel')} value={money.format(r.loanAmount)} />
      <PresetStat label={t('totalInterest')} value={money.format(r.totalInterest)} />
      <PresetStat label={t('salesTaxLabel')} value={money.format(r.salesTax)} />
      <PresetStat label={t('totalVehicleCost')} value={money.format(r.totalVehicleCost)} accent />
    </>
  );
}

async function StudentLoanBenchmark(locale: Locale, r: StudentLoanResult) {
  const t = await getTranslations({ locale, namespace: 'calculators.student-loan.ui' });
  const money = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: localeMeta[locale].currency,
    maximumFractionDigits: 0
  });
  return (
    <>
      <PresetStat label={t('monthlyPayment')} value={money.format(r.monthlyPayment)} accent />
      {r.hasExtra && (
        <PresetStat label={t('actualMonthlyPayment')} value={money.format(r.actualMonthlyPayment)} />
      )}
      <PresetStat label={t('totalInterest')} value={money.format(r.totalInterest)} />
      {r.capitalizedInterest > 0 && (
        <PresetStat label={t('capitalizedInterest')} value={money.format(r.capitalizedInterest)} />
      )}
      {r.hasExtra && (
        <PresetStat label={t('interestSaved')} value={money.format(r.interestSaved)} accent />
      )}
      <PresetStat label={t('totalPayment')} value={money.format(r.totalPayment)} />
    </>
  );
}

async function LeaseVsBuyBenchmark(locale: Locale, r: LeaseVsBuyResult) {
  const t = await getTranslations({ locale, namespace: 'calculators.lease-vs-buy.ui' });
  const money = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: localeMeta[locale].currency,
    maximumFractionDigits: 0
  });
  const winnerLabel = r.winner === 'buy' ? t('winnerBuy') : t('winnerLease');
  return (
    <>
      <PresetStat label={t('buyNetCost')} value={money.format(r.buy.netCost)} accent />
      <PresetStat label={t('leaseNetCost')} value={money.format(r.lease.netCost)} />
      <PresetStat label={t('winner')} value={`${winnerLabel} · ${money.format(r.savings)}`} accent />
      <PresetStat label={t('buyMonthly')} value={money.format(r.buy.monthlyPayment)} />
      <PresetStat label={t('leaseMonthly')} value={money.format(r.lease.monthlyPayment)} />
      <PresetStat label={t('finalEquity')} value={money.format(r.buy.finalEquity)} />
    </>
  );
}

async function CreditCardPayoffBenchmark(locale: Locale, r: CreditCardPayoffResult) {
  const t = await getTranslations({ locale, namespace: 'calculators.credit-card-payoff.ui' });
  const money = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: localeMeta[locale].currency,
    maximumFractionDigits: 0
  });
  const months = r.payoffMonths === null ? '—' : String(r.payoffMonths);
  return (
    <>
      <PresetStat label={t('monthlyPayment')} value={money.format(r.monthlyPayment)} accent />
      <PresetStat label={t('payoffMonths')} value={`${months} ${t('monthsUnit')}`} accent />
      <PresetStat label={t('totalInterest')} value={money.format(r.totalInterest ?? 0)} />
      <PresetStat label={t('interestSaved')} value={money.format(r.interestSaved ?? 0)} />
      <PresetStat label={t('totalPaid')} value={money.format(r.totalPaid ?? 0)} />
    </>
  );
}

function PresetStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={accent ? 'result-shell border-primary/30 bg-primary/5' : 'result-shell'}>
      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="tabular mt-1 text-xl font-bold leading-tight">{value}</p>
    </div>
  );
}
