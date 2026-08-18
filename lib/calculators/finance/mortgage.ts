/**
 * Mortgage & Amortization engine
 * 房贷与摊销计算引擎
 *
 * Pure, timezone-free function usable both at build time (for pSEO preset FAQ
 * copy) and at runtime in the browser. No I/O, no Date, no side effects.
 *
 * Model (standard US-style fixed-rate amortization):
 *   - loan = homePrice − downPayment
 *   - monthly P&I payment M = L·r / (1 − (1+r)^−n), r = annualRate/12, n = term·12
 *   - each month: interest = balance·r, principal = M − interest (plus any extra
 *     payment, which goes 100% to principal), balance reduces accordingly
 *   - an extra monthly payment shortens the payoff and cuts total interest, which
 *     is reported as monthsSaved / interestSaved against the no-extra baseline.
 */

export interface MortgageInput {
  /** Purchase price of the property. */
  homePrice: number;
  /** Down payment in the same currency (clamped to [0, homePrice]). */
  downPayment: number;
  /** Loan term in whole years. */
  loanTermYears: number;
  /** Annual nominal interest rate, in percent (7 => 7%). */
  annualRate: number;
  /** Extra monthly payment applied entirely to principal. */
  extraMonthly: number;
}

export interface MortgageYearPoint {
  year: number;
  /** Total principal & interest paid during this year (incl. extra payments). */
  payment: number;
  /** Principal portion paid during this year (incl. extra payments). */
  principal: number;
  /** Interest portion paid during this year. */
  interest: number;
  /** Remaining balance at the end of the year. */
  balance: number;
}

export interface MortgageResult {
  /** homePrice − downPayment. */
  loanAmount: number;
  /** Monthly principal & interest payment (excluding extra). */
  monthlyPayment: number;
  /** Cumulative interest paid over the life of the loan. */
  totalInterest: number;
  /** Total P&I paid over the life of the loan (loan + totalInterest). */
  totalCost: number;
  /** Months until the loan is fully paid off (with extra payments applied). */
  payoffMonths: number;
  /** payoffMonths / 12 (decimal). */
  payoffYears: number;
  /** Baseline months − payoffMonths (0 when no extra payment). */
  monthsSaved: number;
  /** Baseline total interest − actual total interest (0 when no extra payment). */
  interestSaved: number;
  /** True when an extra monthly payment shortens the schedule. */
  hasExtra: boolean;
  /** Year-by-year amortization breakdown (rounded). */
  series: MortgageYearPoint[];
}

interface Amortized {
  payoffMonths: number;
  totalInterest: number;
  totalPaid: number;
  series: MortgageYearPoint[];
}

export function calculateMortgage(input: MortgageInput): MortgageResult {
  const homePrice = Math.max(0, input.homePrice);
  const downPayment = clamp(input.downPayment, 0, homePrice);
  const loan = round2(Math.max(0, homePrice - downPayment));
  const years = Math.max(1, Math.floor(input.loanTermYears));
  const ratePct = Math.max(0, input.annualRate);
  const extra = Math.max(0, input.extraMonthly);

  const n = years * 12;
  const r = ratePct / 100 / 12;

  // Standard fixed-rate monthly P&I payment (0 for a $0 loan, loan/n at 0% rate).
  const monthlyPayment =
    loan <= 0 ? 0 : r === 0 ? round2(loan / n) : round2((loan * r) / (1 - Math.pow(1 + r, -n)));

  const baseline = amortize(loan, r, n, monthlyPayment, 0);
  const active = extra > 0 ? amortize(loan, r, n, monthlyPayment, extra) : baseline;

  return {
    loanAmount: loan,
    monthlyPayment,
    totalInterest: round2(active.totalInterest),
    totalCost: round2(active.totalPaid),
    payoffMonths: active.payoffMonths,
    payoffYears: round2(active.payoffMonths / 12),
    monthsSaved: Math.max(0, baseline.payoffMonths - active.payoffMonths),
    interestSaved: round2(Math.max(0, baseline.totalInterest - active.totalInterest)),
    hasExtra: extra > 0,
    series: active.series
  };
}

/**
 * Walk the monthly amortization schedule, optionally accelerating with an extra
 * monthly principal payment, and aggregate it into a year-by-year series.
 */
function amortize(loan: number, r: number, n: number, payment: number, extra: number): Amortized {
  let balance = loan;
  let month = 0;
  let totalInterest = 0;
  let totalPaid = 0;

  // Per-year accumulators (flush every 12 months).
  let year = 0;
  let yPayment = 0;
  let yPrincipal = 0;
  let yInterest = 0;
  const series: MortgageYearPoint[] = [];

  while (month < n && balance > 0.005) {
    month++;
    const interest = balance * r;
    // Payment never exceeds the remaining balance on the final month.
    const principal = Math.min(payment - interest, balance);
    balance -= principal;
    totalInterest += interest;
    totalPaid += principal + interest;
    yPayment += principal + interest;
    yPrincipal += principal;
    yInterest += interest;

    // Extra payment: 100% to principal, capped at the remaining balance.
    if (extra > 0 && balance > 0.005) {
      const extraAmt = Math.min(extra, balance);
      balance -= extraAmt;
      totalPaid += extraAmt;
      yPayment += extraAmt;
      yPrincipal += extraAmt;
    }

    if (month % 12 === 0 || balance <= 0.005) {
      year++;
      series.push({
        year,
        payment: round2(yPayment),
        principal: round2(yPrincipal),
        interest: round2(yInterest),
        balance: round2(balance)
      });
      yPayment = 0;
      yPrincipal = 0;
      yInterest = 0;
    }
  }

  return { payoffMonths: month, totalInterest, totalPaid, series };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
function round2(n: number) {
  return Math.round(n * 100) / 100;
}
