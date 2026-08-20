/**
 * Mortgage Refinance pSEO Preset Matrix / 房贷重贷计算器程序化 SEO 预设矩阵
 * ----------------------------------------------------------------------------
 * Seed scenarios for the Mortgage Refinance calculator.
 * Each preset is a fully described, pre-filled landing page, with localized
 * title, meta description, scenario summary and a scenario-specific FAQ.
 *
 * The numbers embedded in the copy are computed from the live engine
 * (calculateMortgageRefinance) so the FAQ prose always matches the rendered benchmark.
 *
 * NOTE: every interpolated string MUST use backtick template literals — single
 * quotes with `${...}` inside break the TS parse (see credit-card-payoff history).
 */

import { calculateMortgageRefinance, type MortgageRefinanceInput } from '@/lib/calculators/finance/mortgage-refinance';
import type { Locale } from '@/config/i18n.config';
import type { FaqEntry } from '@/lib/seo/schema';

export const MORTGAGEREFINANCE_CATEGORY = 'finance';
export const MORTGAGEREFINANCE_SLUG = 'mortgage-refinance-calculator';

/** Locale-independent route for a scenario page. */
export function presetRoute(scenario: string) {
  return `/calculators/${MORTGAGEREFINANCE_CATEGORY}/${MORTGAGEREFINANCE_SLUG}/preset/${scenario}`;
}

interface LocalizedPreset {
  title: string;
  description: string;
  summaryIntro: string;
  faqs: FaqEntry[];
}

export interface MortgageRefinancePreset {
  slug: string;
  /** Resolved input state passed straight to the client (no CLS on first paint). */
  defaultParams: MortgageRefinanceInput;
  localized: Record<Locale, LocalizedPreset>;
}

type Result = ReturnType<typeof calculateMortgageRefinance>;

/** Whole-dollar locale formatting for preset copy. */
function money(v: number, locale: string) {
  return `$${Math.round(v).toLocaleString(locale)}`;
}

function buildPreset(
  slug: string,
  defaultParams: MortgageRefinanceInput,
  localized: (r: Result, input: MortgageRefinanceInput) => Record<Locale, LocalizedPreset>
): MortgageRefinancePreset {
  return { slug, defaultParams, localized: localized(calculateMortgageRefinance(defaultParams), defaultParams) };
}

export const PRESETS: MortgageRefinancePreset[] = [
  buildPreset(
    '30yr-7pct-to-5.5pct',
    { currentBalance: 400000, currentRate: 7.0, remainingYears: 30, newRate: 5.5, newTermYears: 30, closingCosts: 8000, feesPaid: 'cash', cashOutAmount: 0 },
    (r, input) => ({
      en: {
        title: 'Refinance $400K from 7% to 5.5%',
        description:
          'A $400,000 mortgage at 7.0% refinanced to 5.5% over a new 30-year term with $8,000 in closing costs. A pre-filled mortgage refinance calculator scenario.',
        summaryIntro: 'The classic rate-cut refi — how much the payment drops and how long it takes to break even.',
        faqs: [
          {
            question: 'How much does the payment drop?',
            answer: `The payment falls from about ${money(r.currentMonthlyPayment, 'en-US')} to ${money(r.newMonthlyPayment, 'en-US')} a month — saving roughly ${money(r.monthlySavings, 'en-US')} monthly.`
          },
          {
            question: 'When do I break even on the costs?',
            answer: `With ${money(input.closingCosts ?? 0, 'en-US')} in closing costs, the break-even point is about ${r.breakEvenMonths} months — every month after that is pure savings.`
          },
          {
            question: 'What do I save in total?',
            answer: `The refi cuts remaining interest by about ${money(r.interestSaved, 'en-US')}; net of costs the lifetime savings are roughly ${money(r.netLifetimeSavings, 'en-US')}.`
          }
        ]
      },
      de: {
        title: '400.000-$-Hypothek von 7 % auf 5,5 % umschulden',
        description:
          'Eine Hypothek von 400.000 $ zu 7,0 %, umgeschuldet auf 5,5 % über eine neue 30-jährige Laufzeit mit 8.000 $ Abschlusskosten. Ein voreingestelltes Szenario des Hypotheken-Umschuldungsrechners.',
        summaryIntro: 'Die klassische Zinssenkungs-Umschuldung — wie stark die Rate fällt und wie lange es dauert, sich zu amortisieren.',
        faqs: [
          {
            question: 'Wie stark sinkt die Rate?',
            answer: `Die Rate fällt von etwa ${money(r.currentMonthlyPayment, 'de-DE')} auf ${money(r.newMonthlyPayment, 'de-DE')} pro Monat — eine Ersparnis von rund ${money(r.monthlySavings, 'de-DE')} monatlich.`
          },
          {
            question: 'Wann amortisieren sich die Kosten?',
            answer: `Mit ${money(input.closingCosts ?? 0, 'de-DE')} Abschlusskosten liegt der Break-even bei etwa ${r.breakEvenMonths} Monaten — danach ist jeder Monat reine Ersparnis.`
          },
          {
            question: 'Was spare ich insgesamt?',
            answer: `Die Umschuldung senkt die Restzinsen um etwa ${money(r.interestSaved, 'de-DE')}; netto nach Kosten liegen die Lebensersparnisse bei rund ${money(r.netLifetimeSavings, 'de-DE')}.`
          }
        ]
      },
      es: {
        title: 'Refinanciar 400.000 $ del 7 % al 5,5 %',
        description:
          'Una hipoteca de 400.000 $ al 7,0 % refinanciada al 5,5 % en un nuevo plazo de 30 años con 8.000 $ de costes de cierre. Un escenario preconfigurado de la calculadora de refinanciación de hipoteca.',
        summaryIntro: 'La refinanciación clásica por bajada de tipo — cuánto baja el pago y cuánto tarda en compensar.',
        faqs: [
          {
            question: '¿Cuánto baja el pago?',
            answer: `El pago cae de unos ${money(r.currentMonthlyPayment, 'es-ES')} a ${money(r.newMonthlyPayment, 'es-ES')} al mes — ahorrando unos ${money(r.monthlySavings, 'es-ES')} mensuales.`
          },
          {
            question: '¿Cuándo compensan los costes?',
            answer: `Con ${money(input.closingCosts ?? 0, 'es-ES')} de costes de cierre, el punto de equilibrio está en unos ${r.breakEvenMonths} meses — cada mes después es ahorro puro.`
          },
          {
            question: '¿Qué ahorro en total?',
            answer: `La refinanciación recorta el interés restante en unos ${money(r.interestSaved, 'es-ES')}; netos de costes, los ahorros de por vida rondan los ${money(r.netLifetimeSavings, 'es-ES')}.`
          }
        ]
      },
      zh: {
        title: '40 万美元房贷从 7% 重贷至 5.5%',
        description:
          '一笔 400,000 美元、7.0% 的房贷，重贷至 5.5%、新 30 年期限，交割费 8,000 美元。一个预填好的房贷重贷计算器场景。',
        summaryIntro: '经典降息重贷——月供降多少、多久回本。',
        faqs: [
          {
            question: '月供降多少？',
            answer: `月供从约 ${money(r.currentMonthlyPayment, 'zh-CN')} 降至 ${money(r.newMonthlyPayment, 'zh-CN')}——每月节省约 ${money(r.monthlySavings, 'zh-CN')}。`
          },
          {
            question: '多久能回本？',
            answer: `交割费 ${money(input.closingCosts ?? 0, 'zh-CN')} 的保本月数约为 ${r.breakEvenMonths} 个月——之后每月都是纯节省。`
          },
          {
            question: '总共能省多少？',
            answer: `重贷削减剩余利息约 ${money(r.interestSaved, 'zh-CN')}；扣除费用后生命周期净省约 ${money(r.netLifetimeSavings, 'zh-CN')}。`
          }
        ]
      }
    })
  ),

  buildPreset(
    '30yr-to-15yr-refi',
    { currentBalance: 300000, currentRate: 6.5, remainingYears: 25, newRate: 5.0, newTermYears: 15, closingCosts: 7000, feesPaid: 'cash', cashOutAmount: 0 },
    (r, input) => ({
      en: {
        title: 'Refinance from 30-Year to 15-Year',
        description:
          'A 25-years-remaining mortgage refinanced to a 15-year term at 5.0% with $7,000 in costs — higher payment, far less interest. A pre-filled mortgage refinance calculator scenario.',
        summaryIntro: 'The term-shortening play: trade a bigger payment for a mortgage-free decade.',
        faqs: [
          {
            question: 'How does the payment change?',
            answer: `The payment rises from about ${money(r.currentMonthlyPayment, 'en-US')} to ${money(r.newMonthlyPayment, 'en-US')} a month, but the home is paid off in 15 years instead of 25.`
          },
          {
            question: 'How much interest does it save?',
            answer: `Remaining interest drops from about ${money(r.currentRemainingInterest, 'en-US')} to ${money(r.newTotalInterest, 'en-US')} — a saving of roughly ${money(r.interestSaved, 'en-US')}.`
          },
          {
            question: 'Why use this preset?',
            answer:
              'It shows the true cost of a 15-year refi — the extra monthly cash versus the interest you never pay.'
          }
        ]
      },
      de: {
        title: 'Von 30 auf 15 Jahre refinanzieren',
        description:
          'Eine Hypothek mit 25 Jahren Restlaufzeit, umgeschuldet auf 15 Jahre zu 5,0 % mit 7.000 $ Kosten — höhere Rate, deutlich weniger Zinsen. Ein voreingestelltes Szenario des Hypotheken-Umschuldungsrechners.',
        summaryIntro: 'Der Laufzeitverkürzungs-Zug: eine größere Rate gegen ein Jahrzehnt Hypothekenfreiheit.',
        faqs: [
          {
            question: 'Wie verändert sich die Rate?',
            answer: `Die Rate steigt von etwa ${money(r.currentMonthlyPayment, 'de-DE')} auf ${money(r.newMonthlyPayment, 'de-DE')} pro Monat, aber das Haus ist in 15 statt 25 Jahren abbezahlt.`
          },
          {
            question: 'Wie viel Zinsen spart es?',
            answer: `Die Restzinsen sinken von etwa ${money(r.currentRemainingInterest, 'de-DE')} auf ${money(r.newTotalInterest, 'de-DE')} — eine Ersparnis von rund ${money(r.interestSaved, 'de-DE')}.`
          },
          {
            question: 'Warum dieses Preset nutzen?',
            answer:
              'Es zeigt die wahren Kosten einer 15-jährigen Umschuldung — das zusätzliche Bargeld pro Monat gegen die Zinsen, die du nie zahlst.'
          }
        ]
      },
      es: {
        title: 'Refinanciar de 30 a 15 años',
        description:
          'Una hipoteca con 25 años restantes refinanciada a un plazo de 15 años al 5,0 % con 7.000 $ de costes — pago mayor, mucho menos interés. Un escenario preconfigurado de la calculadora de refinanciación de hipoteca.',
        summaryIntro: 'La jugada de acortar el plazo: cambia un pago mayor por una década sin hipoteca.',
        faqs: [
          {
            question: '¿Cómo cambia el pago?',
            answer: `El pago sube de unos ${money(r.currentMonthlyPayment, 'es-ES')} a ${money(r.newMonthlyPayment, 'es-ES')} al mes, pero la casa se liquida en 15 años en lugar de 25.`
          },
          {
            question: '¿Cuánto interés ahorra?',
            answer: `El interés restante cae de unos ${money(r.currentRemainingInterest, 'es-ES')} a ${money(r.newTotalInterest, 'es-ES')} — un ahorro de unos ${money(r.interestSaved, 'es-ES')}.`
          },
          {
            question: '¿Por qué usar este preset?',
            answer:
              'Muestra el coste real de una refi a 15 años — el efectivo extra mensual frente al interés que nunca pagas.'
          }
        ]
      },
      zh: {
        title: '房贷从 30 年期重贷转 15 年期',
        description:
          '一笔剩余 25 年的房贷，重贷至 5.0%、15 年期限，费用 7,000 美元——月供更高，利息大幅减少。一个预填好的房贷重贷计算器场景。',
        summaryIntro: '缩短期限的打法：用更高的月供换提前十年无贷。',
        faqs: [
          {
            question: '月供怎么变？',
            answer: `月供从约 ${money(r.currentMonthlyPayment, 'zh-CN')} 升至 ${money(r.newMonthlyPayment, 'zh-CN')}，但房子 15 年而非 25 年还清。`
          },
          {
            question: '能省多少利息？',
            answer: `剩余利息从约 ${money(r.currentRemainingInterest, 'zh-CN')} 降至 ${money(r.newTotalInterest, 'zh-CN')}——节省约 ${money(r.interestSaved, 'zh-CN')}。`
          },
          {
            question: '为什么用这个预设？',
            answer:
              '它展示 15 年期重贷的真实代价——每月多付的现金 vs 永远不必支付的利息。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'no-closing-cost-refi',
    { currentBalance: 250000, currentRate: 7.0, remainingYears: 28, newRate: 6.0, newTermYears: 28, closingCosts: 0, feesPaid: 'cash', cashOutAmount: 0 },
    (r, input) => ({
      en: {
        title: 'No-Closing-Cost Refinance',
        description:
          'A $250,000 mortgage refinanced from 7.0% to 6.0% with zero closing costs — break even immediately. A pre-filled mortgage refinance calculator scenario.',
        summaryIntro: 'When the lender absorbs the fees, every month of savings is pure gain from day one.',
        faqs: [
          {
            question: 'Is a no-cost refi worth it?',
            answer: `With zero closing costs the payment still drops from ${money(r.currentMonthlyPayment, 'en-US')} to ${money(r.newMonthlyPayment, 'en-US')} — saving ${money(r.monthlySavings, 'en-US')} a month with no break-even wait.`
          },
          {
            question: 'How much interest is saved?',
            answer: `The lower rate cuts remaining interest by about ${money(r.interestSaved, 'en-US')} over the life of the loan.`
          },
          {
            question: 'What is the catch?',
            answer:
              'Lenders often bake costs into a slightly higher rate or a larger balance — compare the true rate, not just the advertised no-fee headline.'
          }
        ]
      },
      de: {
        title: 'Umschuldung ohne Abschlusskosten',
        description:
          'Eine Hypothek von 250.000 $ von 7,0 % auf 6,0 % umgeschuldet ohne Abschlusskosten — sofortiger Break-even. Ein voreingestelltes Szenario des Hypotheken-Umschuldungsrechners.',
        summaryIntro: 'Wenn der Kreditgeber die Gebühren übernimmt, ist jeder Sparmonat von Tag eins an reiner Gewinn.',
        faqs: [
          {
            question: 'Lohnt sich eine Umschuldung ohne Kosten?',
            answer: `Ohne Abschlusskosten sinkt die Rate trotzdem von ${money(r.currentMonthlyPayment, 'de-DE')} auf ${money(r.newMonthlyPayment, 'de-DE')} — ${money(r.monthlySavings, 'de-DE')} Ersparnis pro Monat ohne Wartezeit.`
          },
          {
            question: 'Wie viel Zinsen werden gespart?',
            answer: `Der niedrigere Zinssatz senkt die Restzinsen über die Laufzeit um etwa ${money(r.interestSaved, 'de-DE')}.`
          },
          {
            question: 'Wo ist der Haken?',
            answer:
              'Kreditgeber verrechnen Kosten oft über einen leicht höheren Zinssatz oder größeren Saldo — vergleiche den echten Zinssatz, nicht nur die kostenlose Überschrift.'
          }
        ]
      },
      es: {
        title: 'Refinanciación sin costes de cierre',
        description:
          'Una hipoteca de 250.000 $ refinanciada del 7,0 % al 6,0 % sin costes de cierre — compensa de inmediato. Un escenario preconfigurado de la calculadora de refinanciación de hipoteca.',
        summaryIntro: 'Cuando el prestamista absorbe las tasas, cada mes de ahorro es ganancia pura desde el día uno.',
        faqs: [
          {
            question: '¿Merece la pena sin costes?',
            answer: `Sin costes de cierre el pago aun así baja de ${money(r.currentMonthlyPayment, 'es-ES')} a ${money(r.newMonthlyPayment, 'es-ES')} — ahorrando ${money(r.monthlySavings, 'es-ES')} al mes sin esperar al equilibrio.`
          },
          {
            question: '¿Cuánto interés se ahorra?',
            answer: `El tipo menor recorta el interés restante en unos ${money(r.interestSaved, 'es-ES')} durante la vida del préstamo.`
          },
          {
            question: '¿Cuál es la trampa?',
            answer:
              'Los prestamistas suelen meter los costes en un tipo algo mayor o en un saldo más grande — compara el tipo real, no solo el titular de sin tasas.'
          }
        ]
      },
      zh: {
        title: '零交割费重贷',
        description:
          '一笔 250,000 美元的房贷从 7.0% 重贷至 6.0%，交割费为零——立即回本。一个预填好的房贷重贷计算器场景。',
        summaryIntro: '当贷方吸收费用时，从第一天起每个月的节省都是纯收益。',
        faqs: [
          {
            question: '零费用重贷划算吗？',
            answer: `零交割费下月供仍从 ${money(r.currentMonthlyPayment, 'zh-CN')} 降至 ${money(r.newMonthlyPayment, 'zh-CN')}——每月省 ${money(r.monthlySavings, 'zh-CN')}，无需等待回本。`
          },
          {
            question: '能省多少利息？',
            answer: `更低利率在贷款期内削减剩余利息约 ${money(r.interestSaved, 'zh-CN')}。`
          },
          {
            question: '有什么猫腻？',
            answer:
              '贷方常把成本计入略高的利率或更大的余额——比较真实利率，而非只看"零费用"的宣传。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'break-even-2-year',
    { currentBalance: 350000, currentRate: 6.8, remainingYears: 27, newRate: 5.8, newTermYears: 27, closingCosts: 6000, feesPaid: 'cash', cashOutAmount: 0 },
    (r, input) => ({
      en: {
        title: 'Refinance with a 2-Year Break Even',
        description:
          'A $350,000 mortgage at 6.8% refinanced to 5.8% with $6,000 in costs engineered to break even in about two years. A pre-filled mortgage refinance calculator scenario.',
        summaryIntro: 'A healthy refi rule of thumb — if you cannot break even in about 2 years, question the deal.',
        faqs: [
          {
            question: 'How fast do I break even?',
            answer: `With monthly savings of ${money(r.monthlySavings, 'en-US')} on ${money(input.closingCosts ?? 0, 'en-US')} of costs, break even lands at about ${r.breakEvenMonths} months.`
          },
          {
            question: 'What is the lifetime saving?',
            answer: `Net of costs the refi saves roughly ${money(r.netLifetimeSavings, 'en-US')} over the remaining term.`
          },
          {
            question: 'When does the 2-year rule apply?',
            answer:
              'If you plan to stay past the break-even point, the refi pays; if you may move sooner, the costs may never be recovered.'
          }
        ]
      },
      de: {
        title: 'Umschuldung mit 2-Jahres-Amortisation',
        description:
          'Eine Hypothek von 350.000 $ zu 6,8 %, umgeschuldet auf 5,8 % mit 6.000 $ Kosten, ausgelegt auf Break-even in etwa zwei Jahren. Ein voreingestelltes Szenario des Hypotheken-Umschuldungsrechners.',
        summaryIntro: 'Eine gesunde Umschuldungs-Faustregel — ohne Break-even in etwa 2 Jahren das Angebot hinterfragen.',
        faqs: [
          {
            question: 'Wie schnell amortisiere ich?',
            answer: `Bei monatlichen Einsparungen von ${money(r.monthlySavings, 'de-DE')} auf ${money(input.closingCosts ?? 0, 'de-DE')} Kosten liegt der Break-even bei etwa ${r.breakEvenMonths} Monaten.`
          },
          {
            question: 'Wie hoch ist die Lebensersparnis?',
            answer: `Netto nach Kosten spart die Umschuldung über die Restlaufzeit rund ${money(r.netLifetimeSavings, 'de-DE')}.`
          },
          {
            question: 'Wann gilt die 2-Jahres-Regel?',
            answer:
              'Bleibst du über den Break-even hinaus, zahlt sich die Umschuldung aus; ziehst du früher um, werden die Kosten vielleicht nie gedeckt.'
          }
        ]
      },
      es: {
        title: 'Refinanciación con equilibrio en 2 años',
        description:
          'Una hipoteca de 350.000 $ al 6,8 % refinanciada al 5,8 % con 6.000 $ de costes, diseñada para compensar en unos dos años. Un escenario preconfigurado de la calculadora de refinanciación de hipoteca.',
        summaryIntro: 'Una regla de oro de la refi — si no compensa en unos 2 años, cuestiona la oferta.',
        faqs: [
          {
            question: '¿Cuánto tardo en compensar?',
            answer: `Con ahorros mensuales de ${money(r.monthlySavings, 'es-ES')} sobre ${money(input.closingCosts ?? 0, 'es-ES')} de costes, el equilibrio llega en unos ${r.breakEvenMonths} meses.`
          },
          {
            question: '¿Cuál es el ahorro de por vida?',
            answer: `Netos de costes, la refi ahorra unos ${money(r.netLifetimeSavings, 'es-ES')} durante el plazo restante.`
          },
          {
            question: '¿Cuándo aplica la regla de los 2 años?',
            answer:
              'Si piensas quedarte más allá del punto de equilibrio, la refi paga; si puedes mudarte antes, los costes quizá nunca se recuperen.'
          }
        ]
      },
      zh: {
        title: '2 年回本的重贷策略',
        description:
          '一笔 350,000 美元、6.8% 的房贷，重贷至 5.8%、费用 6,000 美元，设计为约两年回本。一个预填好的房贷重贷计算器场景。',
        summaryIntro: '健康的重贷经验法则——约 2 年无法回本，就要质疑这笔交易。',
        faqs: [
          {
            question: '多久回本？',
            answer: `每月省 ${money(r.monthlySavings, 'zh-CN')}、费用 ${money(input.closingCosts ?? 0, 'zh-CN')}，保本月数约 ${r.breakEvenMonths} 个月。`
          },
          {
            question: '生命周期节省多少？',
            answer: `扣除费用后，重贷在剩余期限内净省约 ${money(r.netLifetimeSavings, 'zh-CN')}。`
          },
          {
            question: '2 年法则何时适用？',
            answer:
              '若计划居住超过回本点，重贷划算；若可能提前搬家，费用可能永远无法收回。'
          }
        ]
      }
    })
  ),

  buildPreset(
    '500k-jumbo-refinance',
    { currentBalance: 500000, currentRate: 7.25, remainingYears: 30, newRate: 6.0, newTermYears: 30, closingCosts: 12000, feesPaid: 'cash', cashOutAmount: 0 },
    (r, input) => ({
      en: {
        title: '$500K Jumbo Mortgage Refinance',
        description:
          'A $500,000 jumbo mortgage at 7.25% refinanced to 6.0% over 30 years with $12,000 in costs. A pre-filled mortgage refinance calculator scenario.',
        summaryIntro: 'Big balances amplify every rate change — the jumbo refi math at $500K.',
        faqs: [
          {
            question: 'How much does a jumbo refi save monthly?',
            answer: `The payment drops from about ${money(r.currentMonthlyPayment, 'en-US')} to ${money(r.newMonthlyPayment, 'en-US')} — roughly ${money(r.monthlySavings, 'en-US')} a month.`
          },
          {
            question: 'What is the break-even and net saving?',
            answer: `With ${money(input.closingCosts ?? 0, 'en-US')} in costs you break even in about ${r.breakEvenMonths} months and net roughly ${money(r.netLifetimeSavings, 'en-US')} over the term.`
          },
          {
            question: 'Why use this preset?',
            answer:
              'Jumbo loans have their own rate spreads — this shows whether a 1.25-point drop is worth the larger closing bill.'
          }
        ]
      },
      de: {
        title: 'Jumbo-Hypothek von 500.000 $ umschulden',
        description:
          'Eine Jumbo-Hypothek von 500.000 $ zu 7,25 %, umgeschuldet auf 6,0 % über 30 Jahre mit 12.000 $ Kosten. Ein voreingestelltes Szenario des Hypotheken-Umschuldungsrechners.',
        summaryIntro: 'Große Salden verstärken jede Zinsänderung — die Jumbo-Rechnung bei 500.000 $.',
        faqs: [
          {
            question: 'Wie viel spart eine Jumbo-Umschuldung monatlich?',
            answer: `Die Rate fällt von etwa ${money(r.currentMonthlyPayment, 'de-DE')} auf ${money(r.newMonthlyPayment, 'de-DE')} — rund ${money(r.monthlySavings, 'de-DE')} pro Monat.`
          },
          {
            question: 'Was sind Break-even und Nettoersparnis?',
            answer: `Mit ${money(input.closingCosts ?? 0, 'de-DE')} Kosten amortisierst du in etwa ${r.breakEvenMonths} Monaten und sparst netto rund ${money(r.netLifetimeSavings, 'de-DE')} über die Laufzeit.`
          },
          {
            question: 'Warum dieses Preset nutzen?',
            answer:
              'Jumbo-Darlehen haben eigene Zinsaufschläge — hier siehst du, ob ein Rückgang von 1,25 Punkten die größere Abschlussrechnung wert ist.'
          }
        ]
      },
      es: {
        title: 'Refinanciación de hipoteca jumbo de 500.000 $',
        description:
          'Una hipoteca jumbo de 500.000 $ al 7,25 % refinanciada al 6,0 % en 30 años con 12.000 $ de costes. Un escenario preconfigurado de la calculadora de refinanciación de hipoteca.',
        summaryIntro: 'Los saldos grandes amplifican cada cambio de tipo — la matemática jumbo en 500.000 $.',
        faqs: [
          {
            question: '¿Cuánto ahorra una refi jumbo al mes?',
            answer: `El pago cae de unos ${money(r.currentMonthlyPayment, 'es-ES')} a ${money(r.newMonthlyPayment, 'es-ES')} — unos ${money(r.monthlySavings, 'es-ES')} al mes.`
          },
          {
            question: '¿Cuál es el equilibrio y el ahorro neto?',
            answer: `Con ${money(input.closingCosts ?? 0, 'es-ES')} de costes compensas en unos ${r.breakEvenMonths} meses y ahorras netos unos ${money(r.netLifetimeSavings, 'es-ES')} durante el plazo.`
          },
          {
            question: '¿Por qué usar este preset?',
            answer:
              'Los préstamos jumbo tienen sus propios diferenciales — esto muestra si una caída de 1,25 puntos vale la factura de cierre mayor.'
          }
        ]
      },
      zh: {
        title: '50 万美元巨额房贷重贷',
        description:
          '一笔 500,000 美元、7.25% 的巨额房贷，重贷至 6.0%、30 年期限、费用 12,000 美元。一个预填好的房贷重贷计算器场景。',
        summaryIntro: '大余额放大每一次利率变化——50 万美元的巨额重贷数学。',
        faqs: [
          {
            question: '巨额重贷每月省多少？',
            answer: `月供从约 ${money(r.currentMonthlyPayment, 'zh-CN')} 降至 ${money(r.newMonthlyPayment, 'zh-CN')}——每月约省 ${money(r.monthlySavings, 'zh-CN')}。`
          },
          {
            question: '回本与净省是多少？',
            answer: `费用 ${money(input.closingCosts ?? 0, 'zh-CN')}，约 ${r.breakEvenMonths} 个月回本，期限内净省约 ${money(r.netLifetimeSavings, 'zh-CN')}。`
          },
          {
            question: '为什么用这个预设？',
            answer:
              '巨额贷款有独立的利率价差——这里展示 1.25 个点的降幅是否值更高的交割账单。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'cash-out-refi-50k',
    { currentBalance: 280000, currentRate: 6.5, remainingYears: 22, newRate: 6.0, newTermYears: 30, closingCosts: 9000, feesPaid: 'cash', cashOutAmount: 50000 },
    (r, input) => ({
      en: {
        title: 'Cash-Out Refinance — $50K for Home Renovation',
        description:
          'A $280,000 mortgage refinanced to 6.0% over 30 years with $50,000 cashed out for renovations, $9,000 in costs. A pre-filled mortgage refinance calculator scenario.',
        summaryIntro: 'Turn home equity into cash — and see what a fresh 30-year clock costs.',
        faqs: [
          {
            question: 'How much does the payment change?',
            answer: `The new loan of about ${money(r.newPrincipal, 'en-US')} raises the payment from ${money(r.currentMonthlyPayment, 'en-US')} to ${money(r.newMonthlyPayment, 'en-US')} a month.`
          },
          {
            question: 'What is the trade-off?',
            answer: `You pocket ${money(input.cashOutAmount ?? 0, 'en-US')} now, but restart a 30-year term — compare the extra interest before tapping equity.`
          },
          {
            question: 'Why use this preset?',
            answer:
              'It separates the cash-out from the rate math, so you can judge if the renovation is worth the new loan structure.'
          }
        ]
      },
      de: {
        title: 'Cash-out-Umschuldung — 50.000 $ für die Renovierung',
        description:
          'Eine Hypothek von 280.000 $, umgeschuldet auf 6,0 % über 30 Jahre mit 50.000 $ Auszahlung für Renovierungen und 9.000 $ Kosten. Ein voreingestelltes Szenario des Hypotheken-Umschuldungsrechners.',
        summaryIntro: 'Wohneigenkapital in Bargeld verwandeln — und sehen, was eine neue 30-Jahres-Uhr kostet.',
        faqs: [
          {
            question: 'Wie verändert sich die Rate?',
            answer: `Das neue Darlehen von etwa ${money(r.newPrincipal, 'de-DE')} hebt die Rate von ${money(r.currentMonthlyPayment, 'de-DE')} auf ${money(r.newMonthlyPayment, 'de-DE')} pro Monat.`
          },
          {
            question: 'Was ist der Kompromiss?',
            answer: `Du erhältst jetzt ${money(input.cashOutAmount ?? 0, 'de-DE')}, startest aber eine 30-jährige Laufzeit neu — vergleiche die Zusatzzinsen, bevor du Eigenkapital anfasst.`
          },
          {
            question: 'Warum dieses Preset nutzen?',
            answer:
              'Es trennt die Auszahlung von der Zinsrechnung, damit du beurteilen kannst, ob die Renovierung die neue Darlehensstruktur wert ist.'
          }
        ]
      },
      es: {
        title: 'Refinanciación con retiro de efectivo — 50.000 $ para reforma',
        description:
          'Una hipoteca de 280.000 $ refinanciada al 6,0 % en 30 años con 50.000 $ retirados para reformas y 9.000 $ de costes. Un escenario preconfigurado de la calculadora de refinanciación de hipoteca.',
        summaryIntro: 'Convierte el patrimonio de la casa en efectivo — y mira lo que cuesta un nuevo reloj de 30 años.',
        faqs: [
          {
            question: '¿Cómo cambia el pago?',
            answer: `El nuevo préstamo de unos ${money(r.newPrincipal, 'es-ES')} sube el pago de ${money(r.currentMonthlyPayment, 'es-ES')} a ${money(r.newMonthlyPayment, 'es-ES')} al mes.`
          },
          {
            question: '¿Cuál es el intercambio?',
            answer: `Te embolsas ${money(input.cashOutAmount ?? 0, 'es-ES')} ahora, pero reinicias un plazo de 30 años — compara el interés extra antes de tocar el patrimonio.`
          },
          {
            question: '¿Por qué usar este preset?',
            answer:
              'Separa el retiro de efectivo de las matemáticas del tipo, para juzgar si la reforma vale la nueva estructura de préstamo.'
          }
        ]
      },
      zh: {
        title: 'Cash-out 重贷——变现 5 万美元用于翻新',
        description:
          '一笔 280,000 美元的房贷，重贷至 6.0%、30 年期限，变现 50,000 美元用于翻新，费用 9,000 美元。一个预填好的房贷重贷计算器场景。',
        summaryIntro: '把房屋净值变成现金——并看清重新开始的 30 年时钟的代价。',
        faqs: [
          {
            question: '月供怎么变？',
            answer: `新贷款约 ${money(r.newPrincipal, 'zh-CN')}，月供从 ${money(r.currentMonthlyPayment, 'zh-CN')} 升至 ${money(r.newMonthlyPayment, 'zh-CN')}。`
          },
          {
            question: '权衡是什么？',
            answer: `你现在拿到 ${money(input.cashOutAmount ?? 0, 'zh-CN')}，但重新开始 30 年期限——动净值前先对比额外利息。`
          },
          {
            question: '为什么用这个预设？',
            answer:
              '它把变现与利率数学分开，便于判断翻新是否值得新的贷款结构。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'fha-to-conventional-refi',
    { currentBalance: 260000, currentRate: 6.75, remainingYears: 26, newRate: 6.25, newTermYears: 26, closingCosts: 6500, feesPaid: 'cash', cashOutAmount: 0 },
    (r, input) => ({
      en: {
        title: 'FHA to Conventional Refinance (Drop PMI)',
        description:
          'An FHA mortgage at 6.75% refinanced to a conventional 6.25% loan, typically dropping mortgage insurance once you have 20% equity. A pre-filled mortgage refinance calculator scenario.',
        summaryIntro: 'Beyond the rate, the real win is often killing the monthly mortgage-insurance premium.',
        faqs: [
          {
            question: 'How much does the payment drop?',
            answer: `Excluding insurance, the payment falls from about ${money(r.currentMonthlyPayment, 'en-US')} to ${money(r.newMonthlyPayment, 'en-US')} — and dropping PMI/MIP removes an extra monthly charge on top.`
          },
          {
            question: 'What is the break-even?',
            answer: `With ${money(input.closingCosts ?? 0, 'en-US')} in costs and ${money(r.monthlySavings, 'en-US')} saved each month, break even is about ${r.breakEvenMonths} months.`
          },
          {
            question: 'Why use this preset?',
            answer:
              'It isolates the pure rate comparison — add your own PMI savings to see the full FHA-to-conventional benefit.'
          }
        ]
      },
      de: {
        title: 'FHA-zu-konventionell-Umschuldung (PMI weg)',
        description:
          'Eine FHA-Hypothek zu 6,75 %, umgeschuldet auf ein konventionelles Darlehen zu 6,25 % — typischerweise entfällt die Hypothekenversicherung ab 20 % Eigenkapital. Ein voreingestelltes Szenario des Hypotheken-Umschuldungsrechners.',
        summaryIntro: 'Über den Zinssatz hinaus ist der echte Gewinn oft das Streichen der monatlichen Hypothekenversicherung.',
        faqs: [
          {
            question: 'Wie stark sinkt die Rate?',
            answer: `Ohne Versicherung fällt die Rate von etwa ${money(r.currentMonthlyPayment, 'de-DE')} auf ${money(r.newMonthlyPayment, 'de-DE')} — und der Wegfall von PMI/MIP entfernt zusätzlich eine monatliche Belastung.`
          },
          {
            question: 'Was ist der Break-even?',
            answer: `Mit ${money(input.closingCosts ?? 0, 'de-DE')} Kosten und ${money(r.monthlySavings, 'de-DE')} Ersparnis pro Monat liegt der Break-even bei etwa ${r.breakEvenMonths} Monaten.`
          },
          {
            question: 'Warum dieses Preset nutzen?',
            answer:
              'Es isoliert den reinen Zinsvergleich — füge deine eigenen PMI-Ersparnisse hinzu, um den vollen FHA-zu-konventionell-Nutzen zu sehen.'
          }
        ]
      },
      es: {
        title: 'Refinanciación de FHA a convencional (quitar PMI)',
        description:
          'Una hipoteca FHA al 6,75 % refinanciada a un préstamo convencional al 6,25 %, normalmente eliminando el seguro hipotecario con un 20 % de patrimonio. Un escenario preconfigurado de la calculadora de refinanciación de hipoteca.',
        summaryIntro: 'Más allá del tipo, la ganancia real suele ser matar la prima mensual del seguro hipotecario.',
        faqs: [
          {
            question: '¿Cuánto baja el pago?',
            answer: `Sin seguro, el pago cae de unos ${money(r.currentMonthlyPayment, 'es-ES')} a ${money(r.newMonthlyPayment, 'es-ES')} — y quitar el PMI/MIP elimina además un cargo mensual extra.`
          },
          {
            question: '¿Cuál es el equilibrio?',
            answer: `Con ${money(input.closingCosts ?? 0, 'es-ES')} de costes y ${money(r.monthlySavings, 'es-ES')} ahorrados al mes, el equilibrio está en unos ${r.breakEvenMonths} meses.`
          },
          {
            question: '¿Por qué usar este preset?',
            answer:
              'Aísla la comparación de tipos pura — añade tus propios ahorros de PMI para ver el beneficio completo de FHA a convencional.'
          }
        ]
      },
      zh: {
        title: 'FHA 转常规贷款（取消 PMI 保险）',
        description:
          '一笔 6.75% 的 FHA 房贷，重贷至 6.25% 的常规贷款——通常拥有 20% 净值后即可取消房贷保险。一个预填好的房贷重贷计算器场景。',
        summaryIntro: '除了利率，真正的赢点往往是砍掉每月房贷保险费。',
        faqs: [
          {
            question: '月供降多少？',
            answer: `不含保险，月供从约 ${money(r.currentMonthlyPayment, 'zh-CN')} 降至 ${money(r.newMonthlyPayment, 'zh-CN')}——取消 PMI/MIP 再额外省去一笔月费。`
          },
          {
            question: '回本是多少？',
            answer: `费用 ${money(input.closingCosts ?? 0, 'zh-CN')}、每月省 ${money(r.monthlySavings, 'zh-CN')}，保本月数约 ${r.breakEvenMonths} 个月。`
          },
          {
            question: '为什么用这个预设？',
            answer:
              '它隔离纯利率对比——加上你自己的 PMI 节省，即可看到 FHA 转常规的完整收益。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'arm-to-fixed-refinance',
    { currentBalance: 320000, currentRate: 5.5, remainingYears: 27, newRate: 6.0, newTermYears: 30, closingCosts: 8500, feesPaid: 'cash', cashOutAmount: 0 },
    (r, input) => ({
      en: {
        title: 'Refinance from ARM to Fixed Rate',
        description:
          'An adjustable-rate mortgage at 5.5% refinanced into a fixed 6.0% 30-year loan for payment certainty. A pre-filled mortgage refinance calculator scenario.',
        summaryIntro: 'Trading a low teaser rate for a locked-in payment — what the certainty costs today.',
        faqs: [
          {
            question: 'How does the payment compare?',
            answer: `The fixed payment is about ${money(r.newMonthlyPayment, 'en-US')} versus ${money(r.currentMonthlyPayment, 'en-US')} at the current ARM rate — a small premium for locking in.`
          },
          {
            question: 'Why fix when the ARM is lower?',
            answer:
              'ARMs reset periodically; if rates rise, future adjustments can push the payment well above the fixed level — certainty has value beyond the current comparison.'
          },
          {
            question: 'Why use this preset?',
            answer:
              'It shows the immediate cost of leaving an ARM — the real decision is whether future rate risk outweighs today\'s difference.'
          }
        ]
      },
      de: {
        title: 'Von variabel auf fest umschulden',
        description:
          'Eine Hypothek mit variablem Zinssatz zu 5,5 %, umgeschuldet in ein festes 6,0-%-Darlehen über 30 Jahre für Zahlungssicherheit. Ein voreingestelltes Szenario des Hypotheken-Umschuldungsrechners.',
        summaryIntro: 'Einen niedrigen Lockzinssatz gegen eine feste Rate tauschen — was die Sicherheit heute kostet.',
        faqs: [
          {
            question: 'Wie vergleicht sich die Rate?',
            answer: `Die feste Rate liegt bei etwa ${money(r.newMonthlyPayment, 'de-DE')} gegenüber ${money(r.currentMonthlyPayment, 'de-DE')} beim aktuellen variablen Zinssatz — ein kleiner Aufpreis für die Absicherung.`
          },
          {
            question: 'Warum fest, wenn der variable Zinssatz niedriger ist?',
            answer:
              'Variablen setzen sich periodisch neu; steigen die Zinsen, können spätere Anpassungen die Rate weit über das feste Niveau treiben — Sicherheit hat Wert über den aktuellen Vergleich hinaus.'
          },
          {
            question: 'Warum dieses Preset nutzen?',
            answer:
              'Es zeigt die unmittelbaren Kosten des Verlassens eines variablen Zinssatzes — die eigentliche Entscheidung ist, ob das Zinsrisiko die heutige Differenz überwiegt.'
          }
        ]
      },
      es: {
        title: 'Refinanciar de tipo variable a fijo',
        description:
          'Una hipoteca de tipo variable al 5,5 % refinanciada en un préstamo fijo al 6,0 % a 30 años para certeza de pago. Un escenario preconfigurado de la calculadora de refinanciación de hipoteca.',
        summaryIntro: 'Cambiar un tipo gancho bajo por un pago fijado — lo que cuesta hoy la certeza.',
        faqs: [
          {
            question: '¿Cómo se compara el pago?',
            answer: `El pago fijo es de unos ${money(r.newMonthlyPayment, 'es-ES')} frente a ${money(r.currentMonthlyPayment, 'es-ES')} al tipo variable actual — una prima pequeña por fijarlo.`
          },
          {
            question: '¿Por qué fijar si el variable es menor?',
            answer:
              'Los ARM se reajustan periódicamente; si suben los tipos, los ajustes futuros pueden empujar el pago muy por encima del nivel fijo — la certeza vale más allá de la comparación actual.'
          },
          {
            question: '¿Por qué usar este preset?',
            answer:
              'Muestra el coste inmediato de dejar un ARM — la decisión real es si el riesgo de tipos futuros supera la diferencia de hoy.'
          }
        ]
      },
      zh: {
        title: '浮动利率（ARM）转固定利率重贷',
        description:
          '一笔 5.5% 的浮动利率房贷，重贷为 6.0% 的 30 年固定利率贷款，以锁定还款。一个预填好的房贷重贷计算器场景。',
        summaryIntro: '用较低的诱饵利率换取锁定月供——今天的确定性代价。',
        faqs: [
          {
            question: '月供如何对比？',
            answer: `固定月供约 ${money(r.newMonthlyPayment, 'zh-CN')}，当前 ARM 利率下约 ${money(r.currentMonthlyPayment, 'zh-CN')}——为锁定支付小额溢价。`
          },
          {
            question: 'ARM 更低为何要转固定？',
            answer:
              'ARM 会周期性重置；若利率上升，未来调整可能把月供推到远超固定水平——确定性的价值超出当前对比。'
          },
          {
            question: '为什么用这个预设？',
            answer:
              '它展示离开 ARM 的即时成本——真正的决策是未来利率风险是否超过今天的差异。'
          }
        ]
      }
    })
  )
];

export const PRESET_SLUGS = PRESETS.map((p) => p.slug);

export function getPreset(scenario: string): MortgageRefinancePreset | undefined {
  return PRESETS.find((p) => p.slug === scenario);
}

/**
 * Build the URL-query seed from a MortgageRefinanceInput preset, mirroring
 * MORTGAGEREFINANCE_URL_KEY in MortgageRefinanceCalculatorClient. Defaults are
 * omitted so a clean share link only carries the values the preset actually set.
 */
export function mortgageRefinanceInitialQuery(preset: MortgageRefinancePreset): Record<string, string> {
  const q: Record<string, string> = {};
  const p = preset.defaultParams;
  if (p.currentBalance !== 300000) q.balance = String(p.currentBalance);
  if (p.currentRate !== 6.5) q.currentRate = String(p.currentRate);
  if (p.remainingYears !== 25) q.remaining = String(p.remainingYears);
  if (p.newRate !== 5.0) q.newRate = String(p.newRate);
  if (p.newTermYears !== 25) q.newTerm = String(p.newTermYears);
  if (p.closingCosts !== 5000) q.costs = String(p.closingCosts);
  if (p.feesPaid !== 'cash') q.fees = p.feesPaid;
  if (p.cashOutAmount !== 0) q.cashOut = String(p.cashOutAmount);
  return q;
}
