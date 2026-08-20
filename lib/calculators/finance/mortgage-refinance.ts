/**
 * Mortgage Refinance engine
 * 房贷重贷与保本盈亏平衡计算引擎
 *
 * Pure, timezone-free function usable both at build time (for pSEO preset FAQ
 * copy) and at runtime in the browser. No I/O, no Date, no side effects.
 *
 * Model:
 *   - Current loan: amortize the remaining balance at the current rate over the
 *     remaining term → current payment and remaining interest.
 *   - New loan: amortize (balance + rolled-in closing costs + cash-out) at the
 *     new rate over the new term → new payment and new total interest.
 *   - monthlySavings = old payment − new payment; break-even = closing costs ÷
 *     monthly savings; net lifetime savings = (old interest − new interest) − costs.
 *   - Warning when the new rate is not lower AND the term is not shortened (the
 *     refi is likely not worth it).
 *   - Exact (unrounded) payments drive the schedules; outputs are rounded for display.
 */

export type FeePayment = 'cash' | 'rolled';

export interface MortgageRefinanceInput {
  /** Remaining principal on the current loan. */
  currentBalance: number;
  /** Current annual rate in percent (6.5 => 6.5%). */
  currentRate: number;
  /** Remaining term in whole years. */
  remainingYears: number;
  /** New annual rate in percent. */
  newRate: number;
  /** New term in whole years. */
  newTermYears: number;
  /** Refinance closing costs. */
  closingCosts: number;
  /** How closing costs are paid. */
  feesPaid: FeePayment;
  /** Optional cash-out amount added to the new loan principal (0 = none). */
  cashOutAmount: number;
}

export interface MortgageRefinanceMonthPoint {
  month: number;
  /** Cumulative paid on the current loan (old payment × months). */
  oldCum: number;
  /** Cumulative paid on the new loan. */
  newCum: number;
  /** Cumulative savings (oldCum − newCum). */
  savingsCum: number;
}

export interface MortgageRefinanceResult {
  /** Current monthly payment (P&I). */
  currentMonthlyPayment: number;
  /** New monthly payment (P&I, incl. rolled costs / cash-out). */
  newMonthlyPayment: number;
  /** current − new (negative when the refi raises the payment). */
  monthlySavings: number;
  /** New loan principal = balance + rolled costs + cash-out. */
  newPrincipal: number;
  /** Break-even months (closing costs ÷ monthly savings); null when no savings. */
  breakEvenMonths: number | null;
  /** Interest remaining on the current loan. */
  currentRemainingInterest: number;
  /** Total interest on the new loan. */
  newTotalInterest: number;
  /** currentRemainingInterest − newTotalInterest (interest saved before costs). */
  interestSaved: number;
  /** interestSaved − closingCosts (net lifetime savings; negative = a loss). */
  netLifetimeSavings: number;
  /** True when the new rate is not lower and the term is not shortened. */
  warning: boolean;
  /** True when closing costs are rolled into the new loan. */
  rolledIn: boolean;
  /** Month-by-month cumulative comparison (rounded). */
  schedule: MortgageRefinanceMonthPoint[];
}

interface Amortized {
  monthlyPayment: number;
  totalInterest: number;
}

/** Exact amortized payment + total interest for a loan. */
function amortize(principal: number, annualRatePct: number, years: number): Amortized {
  const n = Math.max(1, Math.floor(years * 12));
  const r = Math.max(0, annualRatePct) / 100 / 12;
  const exact =
    principal <= 0 ? 0 : r === 0 ? principal / n : (principal * r) / (1 - Math.pow(1 + r, -n));
  return {
    monthlyPayment: round2(exact),
    totalInterest: round2(exact * n - principal)
  };
}

export function calculateMortgageRefinance(input: MortgageRefinanceInput): MortgageRefinanceResult {
  const balance = Math.max(0, input.currentBalance);
  const currentRate = Math.max(0, input.currentRate);
  const remainingYears = Math.max(1, Math.floor(input.remainingYears));
  const newRate = Math.max(0, input.newRate);
  const newTermYears = Math.max(1, Math.floor(input.newTermYears));
  const costs = Math.max(0, input.closingCosts);
  const rolledIn = input.feesPaid === 'rolled';
  const cashOut = Math.max(0, input.cashOutAmount);

  const current = amortize(balance, currentRate, remainingYears);
  const newPrincipal = balance + (rolledIn ? costs : 0) + cashOut;
  const next = amortize(newPrincipal, newRate, newTermYears);

  const monthlySavings = round2(current.monthlyPayment - next.monthlyPayment);
  const breakEvenMonths = monthlySavings > 0 ? Math.ceil(costs / monthlySavings) : null;
  const interestSaved = round2(current.totalInterest - next.totalInterest);
  const netLifetimeSavings = round2(interestSaved - costs);

  const warning = newRate >= currentRate && newTermYears >= remainingYears;

  // Monthly cumulative comparison across the longer of the two terms.
  const months = Math.max(remainingYears * 12, newTermYears * 12);
  const schedule: MortgageRefinanceMonthPoint[] = [];
  for (let m = 1; m <= months; m++) {
    schedule.push({
      month: m,
      oldCum: round2(current.monthlyPayment * m),
      newCum: round2(next.monthlyPayment * m),
      savingsCum: round2((current.monthlyPayment - next.monthlyPayment) * m)
    });
  }

  return {
    currentMonthlyPayment: current.monthlyPayment,
    newMonthlyPayment: next.monthlyPayment,
    monthlySavings,
    newPrincipal: round2(newPrincipal),
    breakEvenMonths,
    currentRemainingInterest: current.totalInterest,
    newTotalInterest: next.totalInterest,
    interestSaved,
    netLifetimeSavings,
    warning,
    rolledIn,
    schedule
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
