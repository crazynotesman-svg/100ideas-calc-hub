/**
 * Compound Interest & Investment Growth engine
 * 复利与投资增长计算引擎
 *
 * Pure, timezone-free function usable both at build time (for pSEO preset FAQ
 * copy) and at runtime in the browser. No I/O, no Date, no side effects.
 *
 * Model:
 *   - initial principal P
 *   - recurring monthly deposit PMT (12 deposits / year)
 *   - annual nominal rate r (%)
 *   - term of t years
 *   - compounding frequency n periods / year (default 12 = monthly)
 *
 * Each compounding period the balance earns the periodic rate r/n, then the
 * periodic deposit (PMT * 12/n) is added. Repeating this for every period across
 * all t years yields the future value A. Total principal is P + PMT*12*t and
 * total interest is A − principal.
 */

export interface CompoundInput {
  initialPrincipal: number;
  /** Recurring deposit made every month. */
  monthlyContribution: number;
  /** Annual nominal return, in percent (7 => 7%). */
  annualReturnRate: number;
  /** Investment horizon in whole years. */
  years: number;
  /** Compounding periods per year (1, 2, 4, 12). Defaults to monthly (12). */
  compoundingFrequency: number;
}

export interface CompoundYearPoint {
  year: number;
  /** Balance at the end of the year (future value so far). */
  balance: number;
  /** Cumulative out-of-pocket principal invested through this year. */
  contributed: number;
  /** balance − contributed. */
  interest: number;
}

export interface CompoundResult {
  /** Final future value A. */
  futureValue: number;
  /** P + PMT*12*t */
  totalPrincipal: number;
  /** A − totalPrincipal */
  totalInterest: number;
  /** totalInterest / totalPrincipal (0 when no principal invested). */
  interestRatio: number;
  /** average annual growth rate of the portfolio value (CAGR), in percent. */
  cagr: number;
  series: CompoundYearPoint[];
}

const DEFAULT_FREQUENCY = 12;

export function calculateCompound(input: CompoundInput): CompoundResult {
  const P = Math.max(0, input.initialPrincipal);
  const PMT = Math.max(0, input.monthlyContribution);
  const rPct = Math.max(0, input.annualReturnRate);
  const years = Math.max(1, Math.floor(input.years));
  const n = Math.max(1, Math.floor(input.compoundingFrequency || DEFAULT_FREQUENCY));

  const periodicRate = rPct / 100 / n;
  const depositPerPeriod = (PMT * 12) / n;

  let balance = P;
  let contributed = P;

  const series: CompoundYearPoint[] = [];

  for (let year = 1; year <= years; year++) {
    for (let p = 0; p < n; p++) {
      balance = balance * (1 + periodicRate) + depositPerPeriod;
      contributed += depositPerPeriod;
    }
    series.push({
      year,
      balance: round2(balance),
      contributed: round2(contributed),
      interest: round2(balance - contributed)
    });
  }

  const futureValue = round2(balance);
  const totalPrincipal = round2(contributed);
  const totalInterest = round2(futureValue - totalPrincipal);
  const interestRatio = totalPrincipal > 0 ? round4(totalInterest / totalPrincipal) : 0;

  // Compound annual growth rate of the ending balance vs. total invested.
  const cagr =
    totalPrincipal > 0 && years > 0
      ? round2((Math.pow(futureValue / totalPrincipal, 1 / years) - 1) * 100)
      : 0;

  return {
    futureValue,
    totalPrincipal,
    totalInterest,
    interestRatio,
    cagr,
    series
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
function round4(n: number) {
  return Math.round(n * 10000) / 10000;
}
