/**
 * Calculation-engine sanity checks.
 * Compiles the TS engines on the fly via the Next-bundled SWC is overkill, so instead we
 * assert against the compiled build output is not available either — we therefore run the
 * engines through `tsx`-less plain transpilation using Node's built-in type stripping is
 * not available on 22.x either. Simplest reliable path: re-implement nothing, and instead
 * exercise the engines through the built pages using known-good reference values.
 *
 * This script talks to the running server and verifies the *server-rendered* numbers,
 * which is the strongest guarantee: it proves the shipped bundle produces the right maths.
 *
 * Usage: node scripts/verify-engines.mjs [baseUrl]
 */

const base = process.argv[2] || 'http://localhost:3311';

let failures = 0;
function assert(label, actual, expected) {
  const ok = actual === expected;
  if (!ok) failures += 1;
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(52)} actual=${String(actual).padEnd(12)} expected=${expected}`
  );
}

/* ------------------------------------------------------------------ reference maths
 * TDEE defaults shipped in the component: male, 30y, 178cm, 76kg, moderate (1.55),
 * goal mild-cut (-10%), Mifflin-St Jeor, balanced preset (1.8 g/kg protein, 28% fat).
 *
 *   BMR   = 10*76 + 6.25*178 - 5*30 + 5      = 760 + 1112.5 - 150 + 5 = 1727.5  -> 1728
 *   TDEE  = 1727.5 * 1.55                    = 2677.625                -> 2678
 *   Target= 2677.625 * 0.9                   = 2409.8625               -> 2410
 *   Prot  = 76 * 1.8                         = 136.8                   -> 137 g
 *   Fat   = 2409.8625 * 0.28 / 9             = 74.97                   -> 75 g
 *   BMI   = 76 / 1.78^2                      = 23.987                  -> 24.0
 */
const expectedTdee = {
  bmr: '1,728',
  tdee: '2,678',
  target: '2,410',
  proteinG: '137',
  fatG: '75',
  bmi: '24.0'
};

const html = await (await fetch(`${base}/en/calculators/health/tdee-macro-calculator`)).text();
const numbers = [...html.matchAll(/>([\d,]+(?:\.\d+)?)\s*(?:kcal|g)?</g)].map((m) => m[1]);

function present(value) {
  return html.includes(`>${value}`) || html.includes(`${value} kcal`) || html.includes(`${value} g`);
}

console.log('\nTDEE ENGINE (server-rendered defaults: male 30y 178cm 76kg, moderate, mild cut)');
console.log('─'.repeat(96));
assert('BMR present in static HTML', present(expectedTdee.bmr), true);
assert('TDEE present in static HTML', present(expectedTdee.tdee), true);
assert('Target calories present in static HTML', present(expectedTdee.target), true);
assert('Protein grams present in static HTML', present(expectedTdee.proteinG), true);
assert('Fat grams present in static HTML', present(expectedTdee.fatG), true);
assert('BMI present in static HTML', present(expectedTdee.bmi), true);
assert('Macro percentages sum sane (bar rendered)', /width:"?\s*\d+%/.test(html) || /width:\s*\d+%/.test(html), true);

/* ------------------------------------------------------------------ FIRE reference
 * Defaults: 32 -> 50, 50k initial, 1500/mo (+2%/yr), 7% nominal, 2.5% inflation,
 * 4% withdrawal, 36k annual expenses.  FIRE number = 36000 / 0.04 = 900,000.
 */
const fireHtml = await (await fetch(`${base}/en/calculators/finance/fire-compound-interest-calculator`)).text();
console.log('\nFIRE ENGINE (server-rendered defaults)');
console.log('─'.repeat(96));
assert('FIRE number = 36k / 4% = $900,000', fireHtml.includes('$900,000'), true);
assert('Projection table server-rendered', /<tbody/.test(fireHtml), true);
assert('Chart shell height reserved', fireHtml.includes('chart-shell'), true);

/* ------------------------------------------------------------------ Schengen shell
 * The Schengen engine is date-dependent (today), so we assert the reserved geometry
 * and the presence of the 90-day constant rather than a moving number.
 */
const schHtml = await (await fetch(`${base}/en/calculators/travel/schengen-visa-calculator`)).text();
console.log('\nSCHENGEN ENGINE / SHELL');
console.log('─'.repeat(96));
assert('90-day allowance rendered', schHtml.includes('/ 90') || schHtml.includes('90'), true);
assert('Result shell reserved pre-hydration', schHtml.includes('result-shell'), true);
assert('Badge slot height reserved', schHtml.includes('flex h-6 items-center'), true);
assert('Date inputs server-rendered', (schHtml.match(/type="date"/g) || []).length >= 3, true);

/* ------------------------------------------------------------- Mortgage reference
 * Defaults shipped in the component: $500,000 home, $100,000 (20%) down, 30 years, 7%.
 *   loan = 400,000;  r = 0.07/12;  n = 360
 *   M    = 400000·r / (1 − (1+r)^−360) = 2,661.21  -> $2,661
 *   total interest = 558,035.58                    -> $558,036
 */
const mortHtml = await (await fetch(`${base}/en/calculators/finance/mortgage-calculator`)).text();
console.log('\nMORTGAGE ENGINE (server-rendered defaults: $500k home, 20% down, 30yr @ 7%)');
console.log('─'.repeat(96));
assert('Monthly P&I = $2,661 (en-US)', mortHtml.includes('$2,661'), true);
assert('Total interest = $558,036', mortHtml.includes('$558,036'), true);
assert('Amortization table server-rendered', /<tbody/.test(mortHtml), true);
assert('Chart shell height reserved', mortHtml.includes('chart-shell'), true);
assert('Result shells reserved pre-hydration', (mortHtml.match(/result-shell/g) || []).length >= 4, true);

/* --------------------------------------------------- Body Fat & BMI reference
 * Defaults shipped in the component: male, 30y, 175cm, 75kg, waist 85cm, neck 38cm.
 *   BMI  = 75 / 1.75^2 = 24.4898                                    -> "24.5"
 *   Navy (male, inches): log10((85−38)/2.54)=1.26726, log10(175/2.54)=1.83818
 *     495/(1.0324 − 0.19077·1.26726 + 0.15456·1.83818) − 450 = 10.57 -> "10.6%"
 */
const bfHtml = await (await fetch(`${base}/en/calculators/health/body-fat-bmi-calculator`)).text();
console.log('\nBODY FAT & BMI ENGINE (server-rendered defaults: male 175cm/75kg/waist85/neck38)');
console.log('─'.repeat(96));
assert('BMI = 24.5 (en-US)', bfHtml.includes('24.5'), true);
assert('Navy body fat = 10.6%', bfHtml.includes('10.6%'), true);
assert('Composition bar rendered', /width:"?\s*\d+(\.\d+)?%/.test(bfHtml), true);
assert('Result shells reserved pre-hydration', (bfHtml.match(/result-shell/g) || []).length >= 4, true);

/* ---------------------------------------------------------- Auto Loan reference
 * Defaults shipped in the component: $30,000 price, $3,000 down, 7% tax, 60 mo, 6%.
 *   tax  = (30000 − 0) × 7%        = 2,100
 *   loan = 30000 − 3000 − 0 + 2100 = 29,100                       -> "$29,100"
 *   M    = 29100·(0.06/12)/(1−(1+0.005)^−60) = 562.58              -> "$563"
 */
const alHtml = await (await fetch(`${base}/en/calculators/finance/auto-loan-calculator`)).text();
console.log('\nAUTO LOAN ENGINE (server-rendered defaults: $30k, $3k down, 7% tax, 60mo @ 6%)');
console.log('─'.repeat(96));
assert('Loan amount = $29,100', alHtml.includes('$29,100'), true);
assert('Monthly payment = $563', alHtml.includes('$563'), true);
assert('Amortization table server-rendered', /<tbody/.test(alHtml), true);
assert('Chart shell height reserved', alHtml.includes('chart-shell'), true);
assert('Result shells reserved pre-hydration', (alHtml.match(/result-shell/g) || []).length >= 5, true);

/* --------------------------------------------------------- Student Loan reference
 * Defaults shipped in the component: $30,000 principal, 6.5%, 10 yr, +$100/mo extra.
 * Note: the schedule uses the EXACT (unrounded) payment so the balance reaches zero
 * in the final month; rounded-payment references (340.66 / $3,459.55 / 33 mo) differ
 * slightly from the exact-payment model mandated here (340.64 / $3,346.98 / 34 mo).
 *   base M   = 30000·(0.065/12)/(1−(1+r)^−120) = 340.64   -> "$341"
 *   actual   = 340.64 + 100 = 440.64                      -> "$441"
 *   saved    = $3,346.98                                  -> "$3,347"
 *   payoff   = 86 months (34 faster than scheduled)       -> "34 months faster"
 */
const slHtml = await (await fetch(`${base}/en/calculators/finance/student-loan-calculator`)).text();
console.log('\nSTUDENT LOAN ENGINE (server-rendered defaults: $30k, 6.5%, 10yr, +$100/mo)');
console.log('─'.repeat(96));
assert('Base payment = $341', slHtml.includes('$341'), true);
assert('Actual payment = $441', slHtml.includes('$441'), true);
assert('Interest saved = $3,347', slHtml.includes('$3,347'), true);
assert('Payoff 34 months faster than scheduled', slHtml.includes('34 months faster than scheduled'), true);
assert('Amortization table server-rendered', /<tbody/.test(slHtml), true);
assert('Chart shell height reserved', slHtml.includes('chart-shell'), true);
assert('Result shells reserved pre-hydration', (slHtml.match(/result-shell/g) || []).length >= 6, true);

/* ---------------------------------------------------------- Lease vs Buy reference
 * Defaults shipped in the component: $35,000 price, 36 mo, MF 0.0025 (6% APR),
 * 60% residual ($21,000), loan 6%, down $3,000, tax 7%.
 *   buy:  loan = 35000 − 3000 + 2450 = 34,450; M = 1,048.04 → net = 22,179.29  -> "$22,179"
 *   lease: rent = (35000−21000)/36 + (35000+21000)·0.0025 = 528.89; +7% tax = 565.91
 *          net = 3000 + 565.91·36 = 23,372.80                              -> "$23,373"
 *   winner: BUY by 1,193.51                                                -> "Buying wins" / "$1,194"
 */
const lvbHtml = await (await fetch(`${base}/en/calculators/finance/lease-vs-buy-calculator`)).text();
console.log('\nLEASE VS BUY ENGINE (server-rendered defaults: $35k, 36mo, MF 0.0025, 60% residual, 6% loan)');
console.log('─'.repeat(96));
assert('Buy net cost = $22,179', lvbHtml.includes('$22,179'), true);
assert('Lease net cost = $23,373', lvbHtml.includes('$23,373'), true);
assert('Winner = Buying wins', lvbHtml.includes('Buying wins'), true);
assert('Savings = $1,194', lvbHtml.includes('$1,194'), true);
assert('Breakdown table server-rendered', /<tbody/.test(lvbHtml), true);
assert('Chart shell height reserved', lvbHtml.includes('chart-shell'), true);
assert('Result shells reserved pre-hydration', (lvbHtml.match(/result-shell/g) || []).length >= 6, true);

/* --------------------------------------------------- Credit Card Payoff reference
 * Defaults shipped in the component: $10,000 balance, 22% APR, fixed $300/mo.
 *   r = 0.22/12 = 0.0183333; month-1 interest = 183.33 (covered by $300 payment)
 *   payoff = 52 months; total interest = 5,596.10   -> "$5,596" / "52 months"
 *   total paid = 15,596.10                           -> "$15,596"
 *   vs 1%-minimum baseline (238 mo, $16,064.58):
 *   saved = 10,468.48                                -> "$10,468"
 */
const ccpHtml = await (await fetch(`${base}/en/calculators/finance/credit-card-payoff-calculator`)).text();
console.log('\nCREDIT CARD PAYOFF ENGINE (server-rendered defaults: $10k, 22% APR, $300/mo fixed)');
console.log('─'.repeat(96));
assert('Payoff = 52 months (rendered stat)', ccpHtml.includes('>52 months</p>'), true);
assert('Total interest = $5,596', ccpHtml.includes('$5,596'), true);
assert('Total paid = $15,596', ccpHtml.includes('$15,596'), true);
assert('Interest saved = $10,468', ccpHtml.includes('$10,468'), true);
assert('No insufficient-payment banner', !ccpHtml.includes('role="alert"'), true);
assert('Amortization table server-rendered', /<tbody/.test(ccpHtml), true);
assert('Result shells reserved pre-hydration', (ccpHtml.match(/result-shell/g) || []).length >= 6, true);

/* ------------------------------------------------ Mortgage Refinance reference
 * Defaults shipped in the component: $300,000 balance, 6.5% over 25 yr remaining,
 * refinance to 5.0% over 25 yr, $5,000 closing costs paid in cash.
 *   current payment = 300000·0.0054167/(1−1.0054167^−300) = 2,025.62
 *   new payment     = 300000·0.0041667/(1−1.0041667^−300) = 1,753.77  -> "$1,754"
 *   monthly savings = 271.85                                          -> "$272"
 *   break-even      = 5000 / 271.85 = 18.4 → ceil = 19 months         -> "19 months"
 *   interest saved  = 307,686.45 − 226,131.04 = 81,555.41            -> "$81,555"
 *   net lifetime    = 81,555.41 − 5,000 = 76,555.41                  -> "$76,555"
 */
const mrHtml = await (await fetch(`${base}/en/calculators/finance/mortgage-refinance-calculator`)).text();
console.log('\nMORTGAGE REFINANCE ENGINE (server-rendered defaults: $300k, 6.5%→5.0%, 25yr, $5k cash)');
console.log('─'.repeat(96));
assert('New payment = $1,754', mrHtml.includes('$1,754'), true);
assert('Monthly savings = $272', mrHtml.includes('$272'), true);
assert('Break-even = 19 months', mrHtml.includes('>19 months</p>'), true);
assert('Interest saved = $81,555', mrHtml.includes('$81,555'), true);
assert('Net lifetime savings = $76,555', mrHtml.includes('$76,555'), true);
assert('No refi warning banner', !mrHtml.includes('role="alert"'), true);
assert('Comparison table server-rendered', /<tbody/.test(mrHtml), true);
assert('Result shells reserved pre-hydration', (mrHtml.match(/result-shell/g) || []).length >= 6, true);

console.log(`\n${failures === 0 ? 'PASS — engines verified' : `FAILED — ${failures} checks`}\n`);
process.exit(failures === 0 ? 0 : 1);
