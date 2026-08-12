/**
 * FIRE / compound-interest engine
 * FIRE 退休复利与财务独立计算引擎
 *
 * Monthly compounding, inflation-aware. Two figures are always reported:
 *   - nominal balance  (future currency units)
 *   - real balance     (today's purchasing power)
 *
 * FIRE target follows the safe-withdrawal-rate rule:
 *   target(today) = annualExpenses / (SWR / 100)
 * and is inflated forward so that the crossing point is economically meaningful.
 */

export interface FireInput {
  currentAge: number;
  /** Age at which contributions stop; the projection still runs to `horizonAge`. */
  targetRetirementAge: number;
  initialCapital: number;
  monthlyContribution: number;
  /** Annual increase of the contribution amount, in % (salary growth). */
  contributionGrowthRate: number;
  /** Expected nominal annual return, in %. */
  annualReturnRate: number;
  /** Expected annual inflation, in %. */
  inflationRate: number;
  /** Safe withdrawal rate, in % (4 => the classic 4% rule). */
  withdrawalRate: number;
  /** Annual spending in today's money that the portfolio must cover. */
  annualExpenses: number;
  /** Last age simulated. */
  horizonAge?: number;
}

export interface FireYearPoint {
  year: number;
  age: number;
  /** Nominal portfolio value at the end of the year. */
  balance: number;
  /** Same value expressed in today's purchasing power. */
  realBalance: number;
  /** Cumulative out-of-pocket contributions (incl. initial capital). */
  contributed: number;
  /** balance - contributed */
  growth: number;
  /** Inflation-adjusted FIRE target for that year. */
  target: number;
  /** Real target stays flat — useful as a reference line. */
  realTarget: number;
  reached: boolean;
}

export interface FireResult {
  fireNumber: number;
  /** Age at which the portfolio first covers the inflated target. */
  fireAge: number | null;
  yearsToFire: number | null;
  /** True when FIRE happens no later than the requested retirement age. */
  onTrack: boolean;
  balanceAtRetirement: number;
  realBalanceAtRetirement: number;
  totalContributed: number;
  totalGrowth: number;
  /** Portfolio value at the end of the projection horizon. */
  finalBalance: number;
  finalRealBalance: number;
  /** Sustainable annual withdrawal at retirement, in today's money. */
  sustainableRealIncome: number;
  /** Monthly saving needed to hit the target exactly at `targetRetirementAge`. */
  requiredMonthlyContribution: number;
  /** Share of the final portfolio produced by compounding rather than deposits. */
  growthShare: number;
  series: FireYearPoint[];
  coverageRatio: number;
}

const MONTHS = 12;

function monthlyRate(annualPercent: number) {
  return Math.pow(1 + annualPercent / 100, 1 / MONTHS) - 1;
}

export function calculateFire(input: FireInput): FireResult {
  const currentAge = Math.max(0, Math.min(input.currentAge, 100));
  const retireAge = Math.max(currentAge + 1, Math.min(input.targetRetirementAge, 101));
  const horizonAge = Math.max(retireAge, Math.min(input.horizonAge ?? retireAge + 10, 110));

  const rMonthly = monthlyRate(input.annualReturnRate);
  const inflAnnual = input.inflationRate / 100;
  const swr = Math.max(0.1, input.withdrawalRate) / 100;

  const fireNumber = input.annualExpenses / swr;

  let balance = Math.max(0, input.initialCapital);
  let contributed = Math.max(0, input.initialCapital);
  let contribution = Math.max(0, input.monthlyContribution);

  const series: FireYearPoint[] = [];
  let fireAge: number | null = null;
  let balanceAtRetirement = balance;
  let realBalanceAtRetirement = balance;

  const totalYears = horizonAge - currentAge;

  for (let year = 1; year <= totalYears; year++) {
    const age = currentAge + year;
    const contributingThisYear = age <= retireAge;

    for (let m = 0; m < MONTHS; m++) {
      balance = balance * (1 + rMonthly);
      if (contributingThisYear) {
        balance += contribution;
        contributed += contribution;
      }
    }

    const deflator = Math.pow(1 + inflAnnual, year);
    const target = fireNumber * deflator;
    const realBalance = balance / deflator;
    const reached = balance >= target;

    if (reached && fireAge === null) fireAge = age;
    if (age === retireAge) {
      balanceAtRetirement = balance;
      realBalanceAtRetirement = realBalance;
    }

    series.push({
      year,
      age,
      balance: round2(balance),
      realBalance: round2(realBalance),
      contributed: round2(contributed),
      growth: round2(balance - contributed),
      target: round2(target),
      realTarget: round2(fireNumber),
      reached
    });

    // Salary growth applies once per year.
    if (contributingThisYear) contribution *= 1 + input.contributionGrowthRate / 100;
  }

  const finalBalance = balance;
  const finalRealBalance = balance / Math.pow(1 + inflAnnual, Math.max(1, totalYears));

  // Required monthly deposit to land exactly on the inflated target at retirement age.
  const nMonths = (retireAge - currentAge) * MONTHS;
  const targetAtRetirement = fireNumber * Math.pow(1 + inflAnnual, retireAge - currentAge);
  const fvInitial = input.initialCapital * Math.pow(1 + rMonthly, nMonths);
  const annuityFactor =
    rMonthly === 0 ? nMonths : (Math.pow(1 + rMonthly, nMonths) - 1) / rMonthly;
  const requiredMonthlyContribution = Math.max(
    0,
    (targetAtRetirement - fvInitial) / (annuityFactor || 1)
  );

  return {
    fireNumber: round2(fireNumber),
    fireAge,
    yearsToFire: fireAge === null ? null : fireAge - currentAge,
    onTrack: fireAge !== null && fireAge <= retireAge,
    balanceAtRetirement: round2(balanceAtRetirement),
    realBalanceAtRetirement: round2(realBalanceAtRetirement),
    totalContributed: round2(contributed),
    totalGrowth: round2(finalBalance - contributed),
    finalBalance: round2(finalBalance),
    finalRealBalance: round2(finalRealBalance),
    sustainableRealIncome: round2(realBalanceAtRetirement * swr),
    requiredMonthlyContribution: round2(requiredMonthlyContribution),
    growthShare: finalBalance > 0 ? round4((finalBalance - contributed) / finalBalance) : 0,
    series,
    coverageRatio: fireNumber > 0 ? round4(realBalanceAtRetirement / fireNumber) : 0
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
function round4(n: number) {
  return Math.round(n * 10000) / 10000;
}
