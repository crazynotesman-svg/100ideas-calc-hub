/**
 * Auto Loan & Payment engine
 * 汽车贷款与还款计算引擎
 *
 * Pure, timezone-free function usable both at build time (for pSEO preset FAQ
 * copy) and at runtime in the browser. No I/O, no Date, no side effects.
 *
 * Model (standard fixed-rate auto loan):
 *   - sales tax is levied on the taxable amount: vehicle price minus trade-in
 *     (the trade-in credit is a common convention in many US states)
 *   - loan = vehiclePrice − downPayment − tradeInValue + salesTax
 *   - monthly payment M = L·r / (1 − (1+r)^−n), r = annualRate/12, n = term months
 *   - each month: interest = balance·r, the rest reduces principal
 *   - total vehicle cost = down + trade-in + every principal & interest payment
 */

export interface AutoLoanInput {
  /** Sticker / negotiated price of the vehicle. */
  vehiclePrice: number;
  /** Cash down payment. */
  downPayment: number;
  /** Trade-in value — deducted from the price and from the taxable amount. */
  tradeInValue: number;
  /** Sales tax rate, in percent (7 => 7%). */
  salesTaxPct: number;
  /** Loan term in months (typically 24 / 36 / 48 / 60 / 72 / 84). */
  termMonths: number;
  /** Annual nominal interest rate, in percent (6 => 6%). */
  annualRate: number;
}

export interface AutoLoanMonthPoint {
  month: number;
  /** Principal & interest paid in this month. */
  payment: number;
  /** Principal portion. */
  principal: number;
  /** Interest portion. */
  interest: number;
  /** Remaining balance at the end of the month. */
  balance: number;
}

export interface AutoLoanResult {
  /** (price − tradeIn) × tax% — the tax financed into the loan. */
  salesTax: number;
  /** price − down − tradeIn + salesTax. */
  loanAmount: number;
  /** Monthly principal & interest payment. */
  monthlyPayment: number;
  /** Cumulative interest over the term. */
  totalInterest: number;
  /** Sum of all monthly payments (loan + interest). */
  totalPayments: number;
  /** down + tradeIn + totalPayments — everything you paid for the vehicle. */
  totalVehicleCost: number;
  /** Month-by-month amortization (rounded). */
  series: AutoLoanMonthPoint[];
}

export function calculateAutoLoan(input: AutoLoanInput): AutoLoanResult {
  const vehiclePrice = Math.max(0, input.vehiclePrice);
  const downPayment = clamp(input.downPayment, 0, vehiclePrice);
  const tradeInValue = clamp(input.tradeInValue, 0, vehiclePrice);
  const salesTaxPct = Math.max(0, input.salesTaxPct);
  const n = clamp(Math.floor(input.termMonths), 1, 360);
  const ratePct = Math.max(0, input.annualRate);

  // Trade-in credit reduces both the taxable amount and the financed amount.
  const taxable = Math.max(0, vehiclePrice - tradeInValue);
  const salesTax = round2((taxable * salesTaxPct) / 100);
  const loan = round2(Math.max(0, vehiclePrice - downPayment - tradeInValue + salesTax));

  const r = ratePct / 100 / 12;
  // Schedule uses the exact (unrounded) payment so the balance reaches zero in the
  // final month; the rounded value is only surfaced in the result.
  const exactPayment = loan <= 0 ? 0 : r === 0 ? loan / n : (loan * r) / (1 - Math.pow(1 + r, -n));
  const monthlyPayment = round2(exactPayment);

  // Walk the amortization schedule month by month.
  let balance = loan;
  let totalInterest = 0;
  let totalPaid = 0;
  const series: AutoLoanMonthPoint[] = [];
  for (let month = 1; month <= n; month++) {
    const interest = balance * r;
    const principal = Math.min(exactPayment - interest, balance);
    balance -= principal;
    totalInterest += interest;
    totalPaid += principal + interest;
    series.push({
      month,
      payment: round2(principal + interest),
      principal: round2(principal),
      interest: round2(interest),
      balance: round2(balance)
    });
  }

  return {
    salesTax,
    loanAmount: loan,
    monthlyPayment,
    totalInterest: round2(totalInterest),
    totalPayments: round2(totalPaid),
    totalVehicleCost: round2(downPayment + tradeInValue + totalPaid),
    series
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
function round2(n: number) {
  return Math.round(n * 100) / 100;
}
