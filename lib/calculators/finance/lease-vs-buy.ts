/**
 * Lease vs. Buy Auto engine
 * 汽车租赁与购买对比计算引擎
 *
 * Pure, timezone-free function usable both at build time (for pSEO preset FAQ
 * copy) and at runtime in the browser. No I/O, no Date, no side effects.
 *
 * Buying model (own the car, then sell):
 *   - sales tax is added to the financed amount; loan = price − down + tax
 *   - amortize over the loan term; after the holding period the remaining balance
 *     is settled and the car is sold at the expected resale value
 *   - net cost = down + tax + payments made + remaining balance − resale value
 *
 * Leasing model (rent the car for the term):
 *   - residual = MSRP × residual%
 *   - depreciation = (cap cost − residual) / term; finance charge = (cap cost + residual) × MF
 *   - monthly rent = depreciation + finance charge, plus sales tax on the payment
 *   - net cost = down (cap cost reduction) + acquisition fee + rent × term + disposition fee
 *     — no asset at the end
 *
 * The winner is the cheaper net cost over the same holding period. Internals use
 * exact (unrounded) values; outputs are rounded only for display.
 */

export interface LeaseVsBuyInput {
  /** Buying — negotiated purchase price. */
  buyPrice: number;
  /** Buying — annual loan rate in percent (6 => 6%). */
  loanRate: number;
  /** Buying — loan term in months. */
  loanTermMonths: number;
  /** Buying — months the car is kept before selling. */
  holdingPeriodMonths: number;
  /** Buying — expected resale value at the end of the holding period. */
  resaleValue: number;
  /** Shared — cash down / cap cost reduction. */
  downPayment: number;
  /** Shared — sales tax rate in percent (7 => 7%). */
  salesTaxPct: number;
  /** Leasing — manufacturer's suggested retail price (residual basis). */
  msrp: number;
  /** Leasing — money factor (APR ≈ MF × 2400). */
  moneyFactor: number;
  /** Leasing — lease term in months. */
  leaseTermMonths: number;
  /** Leasing — residual value as percent of MSRP (60 => 60%). */
  residualPct: number;
  /** Leasing — acquisition fee paid at signing (default 0). */
  acquisitionFee: number;
  /** Leasing — disposition fee paid at return (default 0). */
  dispositionFee: number;
}

export interface LeaseVsBuyMonthPoint {
  month: number;
  /** Cumulative out-of-pocket cost for leasing (down + rent accrued). */
  leaseCum: number;
  /** Cumulative out-of-pocket cost for buying (down + tax + payments accrued). */
  buyCum: number;
  /** Buy equity at this month: resale value − remaining loan balance. */
  buyEquity: number;
}

export interface LeaseVsBuyResult {
  buy: {
    /** Sales tax rolled into the loan. */
    salesTax: number;
    /** Financed amount = price − down + tax. */
    loanAmount: number;
    /** Monthly principal & interest payment. */
    monthlyPayment: number;
    /** Sum of all payments made during the holding period. */
    totalMonthlyPayments: number;
    /** Remaining balance at the end of the holding period (0 once paid off). */
    remainingBalance: number;
    /** Equity at the end of the holding period = resale − remaining balance. */
    finalEquity: number;
    /** Net cost of owning for the holding period and selling. */
    netCost: number;
    /** Net cost spread over the holding period. */
    monthlyAverage: number;
  };
  lease: {
    /** Residual dollar value = MSRP × residual%. */
    residual: number;
    /** Depreciation per month. */
    depreciation: number;
    /** Monthly finance charge. */
    financeCharge: number;
    /** Base monthly rent (before tax). */
    baseMonthly: number;
    /** Monthly rent including sales tax. */
    monthlyPayment: number;
    /** Sum of all rent payments (incl. tax). */
    totalRent: number;
    /** Sales tax portion of the total rent. */
    rentTax: number;
    /** Net cost of leasing (down + fees + rent, no asset). */
    netCost: number;
    /** Net cost spread over the lease term. */
    monthlyAverage: number;
  };
  /** buy.netCost − lease.netCost (negative → buying is cheaper). */
  difference: number;
  /** Lower net cost wins. */
  winner: 'buy' | 'lease';
  /** |difference| — how much the winner saves. */
  savings: number;
  /** Month-by-month cumulative cost / equity series (rounded). */
  series: LeaseVsBuyMonthPoint[];
}

export function calculateLeaseVsBuy(input: LeaseVsBuyInput): LeaseVsBuyResult {
  const buyPrice = Math.max(0, input.buyPrice);
  const down = clamp(input.downPayment, 0, buyPrice);
  const ratePct = Math.max(0, input.loanRate);
  const loanTerm = clamp(Math.floor(input.loanTermMonths), 1, 360);
  const holding = clamp(Math.floor(input.holdingPeriodMonths), 1, 360);
  const resale = Math.max(0, input.resaleValue);
  const taxPct = Math.max(0, input.salesTaxPct);
  const msrp = Math.max(0, input.msrp);
  const mf = Math.max(0, input.moneyFactor);
  const leaseTerm = clamp(Math.floor(input.leaseTermMonths), 1, 120);
  const residualPct = Math.max(0, input.residualPct);
  const acqFee = Math.max(0, input.acquisitionFee);
  const dispFee = Math.max(0, input.dispositionFee);

  /* ------------------------------------------------------------- buying */
  const salesTax = (buyPrice * taxPct) / 100;
  const loan = Math.max(0, buyPrice - down + salesTax);
  const r = ratePct / 100 / 12;
  const exactPayment = loan <= 0 ? 0 : r === 0 ? loan / loanTerm : (loan * r) / (1 - Math.pow(1 + r, -loanTerm));
  const monthlyPayment = round2(exactPayment);

  // Walk the loan schedule for the holding period to get the remaining balance.
  let balance = loan;
  let paymentsMade = 0;
  for (let m = 0; m < Math.min(holding, loanTerm); m++) {
    const interest = balance * r;
    const principal = Math.min(exactPayment - interest, balance);
    balance -= principal;
    paymentsMade += principal + interest;
  }
  const remainingBalance = Math.max(0, balance);
  // If the loan is shorter than the holding period, the car is owned free and clear.
  const totalBuyPaid = down + salesTax + paymentsMade + (holding > loanTerm ? 0 : remainingBalance);
  const finalEquity = resale - remainingBalance;
  const buyNetCost = totalBuyPaid - resale;

  /* ------------------------------------------------------------ leasing */
  const residual = (msrp * residualPct) / 100;
  const capCost = msrp + acqFee;
  const depreciation = (capCost - residual) / leaseTerm;
  const financeCharge = (capCost + residual) * mf;
  const baseMonthly = depreciation + financeCharge;
  const leaseMonthly = baseMonthly * (1 + taxPct / 100);
  const totalRent = leaseMonthly * leaseTerm;
  const leaseNetCost = down + acqFee + totalRent + dispFee;

  const difference = buyNetCost - leaseNetCost;
  const winner: 'buy' | 'lease' = difference > 0 ? 'lease' : 'buy';
  const savings = Math.abs(difference);

  /* ------------------------------------------------------------ series */
  const series: LeaseVsBuyMonthPoint[] = [];
  const months = Math.max(holding, leaseTerm);
  let leaseCum = down;
  let buyCum = down + salesTax;
  let buyBalance = loan;
  for (let m = 1; m <= months; m++) {
    if (m <= leaseTerm) leaseCum += leaseMonthly;
    if (m <= holding) {
      if (m <= loanTerm && loan > 0) {
        const interest = buyBalance * r;
        const principal = Math.min(exactPayment - interest, buyBalance);
        buyBalance -= principal;
        buyCum += principal + interest;
      }
    }
    const equityAt = resale - Math.max(0, buyBalance);
    series.push({
      month: m,
      leaseCum: round2(leaseCum),
      buyCum: round2(buyCum),
      buyEquity: round2(equityAt)
    });
  }

  return {
    buy: {
      salesTax: round2(salesTax),
      loanAmount: round2(loan),
      monthlyPayment,
      totalMonthlyPayments: round2(paymentsMade),
      remainingBalance: round2(remainingBalance),
      finalEquity: round2(finalEquity),
      netCost: round2(buyNetCost),
      monthlyAverage: round2(buyNetCost / holding)
    },
    lease: {
      residual: round2(residual),
      depreciation: round2(depreciation),
      financeCharge: round2(financeCharge),
      baseMonthly: round2(baseMonthly),
      monthlyPayment: round2(leaseMonthly),
      totalRent: round2(totalRent),
      rentTax: round2(totalRent - baseMonthly * leaseTerm),
      netCost: round2(leaseNetCost),
      monthlyAverage: round2(leaseNetCost / leaseTerm)
    },
    difference: round2(difference),
    winner,
    savings: round2(savings),
    series
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
function round2(n: number) {
  return Math.round(n * 100) / 100;
}
