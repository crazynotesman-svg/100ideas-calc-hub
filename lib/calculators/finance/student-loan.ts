/**
 * Student Loan & Repayment Plan engine
 * 助学贷款与还款计划计算引擎
 *
 * Pure, timezone-free function usable both at build time (for pSEO preset FAQ
 * copy) and at runtime in the browser. No I/O, no Date, no side effects.
 *
 * Model (fixed-rate student loan with optional grace period):
 *   - during the grace period no payments are made; monthly interest accrues and
 *     is CAPITALIZED (added to the principal) when repayment begins
 *   - base payment M = L·r / (1 − (1+r)^−n), L = capitalized balance, r = monthly rate,
 *     n = term in months
 *   - the schedule is walked with the EXACT (unrounded) payment so the balance reaches
 *     zero in the final month; rounded values are surfaced only in the output
 *   - an extra monthly payment goes 100% to principal, shortening the term and saving
 *     interest (monthsSaved / interestSaved vs the no-extra baseline)
 */

export interface StudentLoanInput {
  /** Original principal borrowed. */
  principal: number;
  /** Annual nominal interest rate, in percent (6.5 => 6.5%). */
  annualRate: number;
  /** Repayment term in whole years (after the grace period). */
  termYears: number;
  /** Months of grace before repayment — interest accrues and capitalizes (0 = none). */
  gracePeriodMonths: number;
  /** Extra monthly payment applied entirely to principal. */
  extraMonthly: number;
}

export interface StudentLoanMonthPoint {
  month: number;
  /** Principal & interest paid in this month (incl. extra). */
  payment: number;
  /** Principal portion (incl. extra). */
  principal: number;
  /** Interest portion. */
  interest: number;
  /** Remaining balance at the end of the month. */
  balance: number;
}

export interface StudentLoanResult {
  /** Interest accrued (and capitalized) during the grace period. */
  capitalizedInterest: number;
  /** Balance at the start of repayment = principal + capitalizedInterest. */
  capitalizedBalance: number;
  /** Base principal & interest payment (excluding extra). */
  monthlyPayment: number;
  /** monthlyPayment + extraMonthly. */
  actualMonthlyPayment: number;
  /** Original principal + capitalized interest. */
  totalPrincipal: number;
  /** Cumulative interest over the life of the loan (incl. grace accrual). */
  totalInterest: number;
  /** Sum of every payment made. */
  totalPayment: number;
  /** Months until fully paid off (with extra payments applied). */
  payoffMonths: number;
  /** Baseline months − payoffMonths (0 when no extra payment). */
  monthsSaved: number;
  /** Baseline total interest − actual total interest (0 when no extra payment). */
  interestSaved: number;
  /** True when an extra monthly payment shortens the schedule. */
  hasExtra: boolean;
  /** Month-by-month amortization of the repayment phase (rounded). */
  schedule: StudentLoanMonthPoint[];
}

interface Amortized {
  payoffMonths: number;
  totalInterest: number;
  totalPaid: number;
  schedule: StudentLoanMonthPoint[];
}

export function calculateStudentLoan(input: StudentLoanInput): StudentLoanResult {
  const principal = Math.max(0, input.principal);
  const ratePct = Math.max(0, input.annualRate);
  const years = Math.max(1, Math.floor(input.termYears));
  const graceMonths = clamp(Math.floor(input.gracePeriodMonths), 0, 120);
  const extra = Math.max(0, input.extraMonthly);

  const n = years * 12;
  const r = ratePct / 100 / 12;

  // Grace period: interest accrues monthly on the running balance, then capitalizes.
  let balance = principal;
  let graceInterest = 0;
  for (let m = 0; m < graceMonths; m++) {
    const accrual = balance * r;
    balance += accrual;
    graceInterest += accrual;
  }
  const capitalizedBalance = round2(balance);
  const capitalizedInterest = round2(graceInterest);

  // Exact (unrounded) payment drives the schedule so the balance hits zero exactly.
  const exactPayment =
    capitalizedBalance <= 0
      ? 0
      : r === 0
        ? capitalizedBalance / n
        : (capitalizedBalance * r) / (1 - Math.pow(1 + r, -n));
  const monthlyPayment = round2(exactPayment);

  const baseline = amortize(capitalizedBalance, r, n, exactPayment, 0);
  const active = extra > 0 ? amortize(capitalizedBalance, r, n, exactPayment, extra) : baseline;

  return {
    capitalizedInterest,
    capitalizedBalance,
    monthlyPayment,
    actualMonthlyPayment: round2(monthlyPayment + extra),
    totalPrincipal: round2(capitalizedBalance),
    totalInterest: round2(graceInterest + active.totalInterest),
    totalPayment: round2(active.totalPaid),
    payoffMonths: active.payoffMonths,
    monthsSaved: Math.max(0, baseline.payoffMonths - active.payoffMonths),
    interestSaved: round2(Math.max(0, baseline.totalInterest - active.totalInterest)),
    hasExtra: extra > 0,
    schedule: active.schedule
  };
}

/**
 * Walk the monthly repayment schedule with the exact base payment, optionally
 * accelerating with an extra monthly principal payment, and aggregate into months.
 */
function amortize(
  loan: number,
  r: number,
  n: number,
  payment: number,
  extra: number
): Amortized {
  let balance = loan;
  let month = 0;
  let totalInterest = 0;
  let totalPaid = 0;
  const schedule: StudentLoanMonthPoint[] = [];

  while (month < n && balance > 0.005) {
    month++;
    const interest = balance * r;
    const principal = Math.min(payment - interest, balance);
    balance -= principal;
    totalInterest += interest;
    totalPaid += principal + interest;

    let extraAmt = 0;
    if (extra > 0 && balance > 0.005) {
      extraAmt = Math.min(extra, balance);
      balance -= extraAmt;
      totalPaid += extraAmt;
    }

    schedule.push({
      month,
      payment: round2(principal + interest + extraAmt),
      principal: round2(principal + extraAmt),
      interest: round2(interest),
      balance: round2(balance)
    });
  }

  return { payoffMonths: month, totalInterest, totalPaid, schedule };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
function round2(n: number) {
  return Math.round(n * 100) / 100;
}
