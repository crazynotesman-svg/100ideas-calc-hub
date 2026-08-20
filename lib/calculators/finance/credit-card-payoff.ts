/**
 * Credit Card Payoff engine
 * 信用卡还款与清欠计算引擎
 *
 * Pure, timezone-free function usable both at build time (for pSEO preset FAQ
 * copy) and at runtime in the browser. No I/O, no Date, no side effects.
 *
 * Payment models:
 *   - Minimum strategy: payment = max(floor, balance × minimumPct%) + interest,
 *     so a payment is always made even when the balance is tiny.
 *   - Fixed strategy: payment = fixedMonthly (plus any extra).
 *   - An extra monthly payment is added on top in both strategies.
 *
 * Guards:
 *   - A fixed payment that does not cover the first month's interest can never
 *     reduce the balance → status "insufficient" and the loop stops (no hang).
 *   - Exact (unrounded) numbers drive the schedule so the balance reaches zero
 *     in the final month; outputs are rounded only for display.
 */

export type CreditCardStrategy = 'minimum' | 'fixed';

export interface CreditCardPayoffInput {
  /** Current card balance. */
  balance: number;
  /** Annual percentage rate (22 => 22%). */
  apr: number;
  /** Payment strategy. */
  strategy: CreditCardStrategy;
  /** For "minimum": percent of balance used as the principal portion (1 => 1%). */
  minimumPct: number;
  /** For "minimum": absolute floor on the principal portion. */
  minimumFloor: number;
  /** For "fixed": the fixed monthly payment. */
  fixedMonthly: number;
  /** Extra monthly payment applied on top (0 = none). */
  extraMonthly: number;
}

export interface CreditCardMonthPoint {
  month: number;
  /** Total payment made this month. */
  payment: number;
  /** Principal portion. */
  principal: number;
  /** Interest portion. */
  interest: number;
  /** Balance at the end of the month. */
  balance: number;
}

export interface CreditCardPayoffResult {
  /** 'ok' or 'insufficient' when the fixed payment cannot cover monthly interest. */
  status: 'ok' | 'insufficient';
  /** First-month interest — the minimum payment that makes progress. */
  breakEvenInterest: number;
  /** Monthly payment actually applied (0 when insufficient). */
  monthlyPayment: number;
  /** Months to pay off (null when insufficient). */
  payoffMonths: number | null;
  /** Total interest over the payoff (null when insufficient). */
  totalInterest: number | null;
  /** Total paid (null when insufficient). */
  totalPaid: number | null;
  /** Baseline = minimum-only, no extra. */
  baseline: {
    payoffMonths: number | null;
    totalInterest: number | null;
    totalPaid: number | null;
  };
  /** baseline − actual (null when insufficient). */
  interestSaved: number | null;
  monthsSaved: number | null;
  /** True when an extra payment is active. */
  hasExtra: boolean;
  /** True when the fixed payment is too low. */
  warning: boolean;
  /** Month-by-month schedule (rounded). */
  schedule: CreditCardMonthPoint[];
}

interface Amortized {
  payoffMonths: number;
  totalInterest: number;
  totalPaid: number;
  monthlyPayment: number;
  schedule: CreditCardMonthPoint[];
}

export function calculateCreditCardPayoff(input: CreditCardPayoffInput): CreditCardPayoffResult {
  const balance = Math.max(0, input.balance);
  const apr = Math.max(0, input.apr);
  const strategy: CreditCardStrategy = input.strategy === 'fixed' ? 'fixed' : 'minimum';
  const minPct = Math.max(0, Math.min(input.minimumPct, 100));
  const floor = Math.max(0, input.minimumFloor);
  const fixed = Math.max(0, input.fixedMonthly);
  const extra = Math.max(0, input.extraMonthly);

  const r = apr / 100 / 12;

  // Payment function shared by the schedule walker.
  const paymentFor = (balanceNow: number): number => {
    const interest = balanceNow * r;
    if (strategy === 'minimum') {
      const principalPart = Math.max(floor, (balanceNow * minPct) / 100);
      return principalPart + interest + extra;
    }
    return Math.min(fixed + extra, balanceNow + interest);
  };

  const baselinePaymentFor = (balanceNow: number): number => {
    const interest = balanceNow * r;
    const principalPart = Math.max(floor, (balanceNow * minPct) / 100);
    return principalPart + interest;
  };

  const actual = amortize(balance, r, paymentFor, strategy === 'fixed');
  const baseline = amortize(balance, r, baselinePaymentFor, false);

  const warning = strategy === 'fixed' && actual.status === 'insufficient';
  const interestSaved =
    actual.status === 'ok' && baseline.status === 'ok'
      ? round2(Math.max(0, baseline.totalInterest - actual.totalInterest))
      : null;
  const monthsSaved =
    actual.status === 'ok' && baseline.status === 'ok'
      ? Math.max(0, baseline.payoffMonths - actual.payoffMonths)
      : null;

  return {
    status: actual.status,
    breakEvenInterest: round2(balance * r),
    monthlyPayment: actual.status === 'ok' ? round2(actual.monthlyPayment) : 0,
    payoffMonths: actual.status === 'ok' ? actual.payoffMonths : null,
    totalInterest: actual.status === 'ok' ? round2(actual.totalInterest) : null,
    totalPaid: actual.status === 'ok' ? round2(actual.totalPaid) : null,
    baseline: {
      payoffMonths: baseline.status === 'ok' ? baseline.payoffMonths : null,
      totalInterest: baseline.status === 'ok' ? round2(baseline.totalInterest) : null,
      totalPaid: baseline.status === 'ok' ? round2(baseline.totalPaid) : null
    },
    interestSaved,
    monthsSaved,
    hasExtra: extra > 0,
    warning,
    schedule: actual.status === 'ok' ? actual.schedule : []
  };
}

/**
 * Walk the monthly payoff. Returns status 'insufficient' when the payment does not
 * exceed the month's interest (the balance would never shrink) — the loop stops to
 * avoid an infinite hang and the caller surfaces the warning.
 */
function amortize(
  loan: number,
  r: number,
  paymentFn: (balance: number) => number,
  isFixed: boolean
): { status: 'ok' | 'insufficient' } & Amortized {
  let balance = loan;
  let month = 0;
  let totalInterest = 0;
  let totalPaid = 0;
  let monthlyPayment = 0;
  const schedule: CreditCardMonthPoint[] = [];
  const maxMonths = 1200; // hard safety cap (100 years)

  while (balance > 0.005 && month < maxMonths) {
    month++;
    const interest = balance * r;
    const payment = isFixed ? Math.min(paymentFn(balance), balance + interest) : paymentFn(balance);

    // Fixed payment that cannot cover this month's interest → no progress possible.
    if (isFixed && payment <= interest && balance > 0.005) {
      return {
        status: 'insufficient',
        payoffMonths: 0,
        totalInterest: 0,
        totalPaid: 0,
        monthlyPayment: 0,
        schedule: []
      };
    }

    const principal = payment - interest;
    balance -= principal;
    totalInterest += interest;
    totalPaid += payment;
    monthlyPayment = payment;

    schedule.push({
      month,
      payment: round2(payment),
      principal: round2(principal),
      interest: round2(interest),
      balance: round2(balance)
    });
  }

  return { status: 'ok', payoffMonths: month, totalInterest, totalPaid, monthlyPayment, schedule };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
