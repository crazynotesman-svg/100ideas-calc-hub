/**
 * Lease vs. Buy pSEO Preset Matrix / 汽车租买对比计算器程序化 SEO 预设矩阵
 * ----------------------------------------------------------------------------
 * Seed scenarios for the Lease vs. Buy Auto calculator.
 * Each preset is a fully described, pre-filled landing page, with localized
 * title, meta description, scenario summary and a scenario-specific FAQ.
 *
 * The numbers embedded in the copy are computed from the live engine
 * (calculateLeaseVsBuy) so the FAQ prose always matches the rendered benchmark.
 */

import { calculateLeaseVsBuy, type LeaseVsBuyInput } from '@/lib/calculators/finance/lease-vs-buy';
import type { Locale } from '@/config/i18n.config';
import type { FaqEntry } from '@/lib/seo/schema';

export const LEASEVSBUY_CATEGORY = 'finance';
export const LEASEVSBUY_SLUG = 'lease-vs-buy-calculator';

/** Locale-independent route for a scenario page. */
export function presetRoute(scenario: string) {
  return `/calculators/${LEASEVSBUY_CATEGORY}/${LEASEVSBUY_SLUG}/preset/${scenario}`;
}

interface LocalizedPreset {
  title: string;
  description: string;
  summaryIntro: string;
  faqs: FaqEntry[];
}

export interface LeaseVsBuyPreset {
  slug: string;
  /** Resolved input state passed straight to the client (no CLS on first paint). */
  defaultParams: LeaseVsBuyInput;
  localized: Record<Locale, LocalizedPreset>;
}

type Result = ReturnType<typeof calculateLeaseVsBuy>;

/** Whole-dollar locale formatting for preset copy. */
function money(v: number, locale: string) {
  return `$${Math.round(v).toLocaleString(locale)}`;
}

/** "Buying wins by $X" / "Leasing wins by $X" helper. */
function winnerPhrase(r: Result, locale: string) {
  return r.winner === 'buy'
    ? `buying wins by about ${money(r.savings, locale)}`
    : `leasing wins by about ${money(r.savings, locale)}`;
}

function buildPreset(
  slug: string,
  defaultParams: LeaseVsBuyInput,
  localized: (r: Result) => Record<Locale, LocalizedPreset>
): LeaseVsBuyPreset {
  return { slug, defaultParams, localized: localized(calculateLeaseVsBuy(defaultParams)) };
}

export const PRESETS: LeaseVsBuyPreset[] = [
  buildPreset(
    '35k-36mo-luxury',
    { buyPrice: 35000, loanRate: 6, loanTermMonths: 36, holdingPeriodMonths: 36, resaleValue: 21000, downPayment: 3000, salesTaxPct: 7, msrp: 35000, moneyFactor: 0.0025, leaseTermMonths: 36, residualPct: 60, acquisitionFee: 0, dispositionFee: 0 },
    (r) => ({
      en: {
        title: '$35K Luxury Car — Lease or Buy in 36 Months?',
        description:
          'A $35,000 vehicle compared two ways over 36 months: a 6% auto loan versus a lease at 0.0025 money factor with 60% residual. A pre-filled lease vs buy calculator scenario.',
        summaryIntro: 'The head-to-head on a typical $35,000 car — where the money actually goes in 36 months.',
        faqs: [
          {
            question: 'Is it cheaper to lease or buy a $35,000 car?',
            answer: `Over 36 months ${winnerPhrase(r, 'en-US')} — buying nets about ${money(r.buy.netCost, 'en-US')} versus ${money(r.lease.netCost, 'en-US')} for leasing.`
          },
          {
            question: 'What are the monthly payments?',
            answer: `The buy payment is about ${money(r.buy.monthlyPayment, 'en-US')} a month versus ${money(r.lease.monthlyPayment, 'en-US')} for the lease — the lease looks cheaper monthly, but you own nothing at the end.`
          },
          {
            question: 'Why use this preset?',
            answer:
              'It is the classic 36-month comparison — change the rate, residual or down payment and the winner and savings recalculate instantly.'
          }
        ]
      },
      de: {
        title: '35.000-$-Luxusauto — Leasen oder kaufen in 36 Monaten?',
        description:
          'Ein Fahrzeug für 35.000 $ zwei Wege über 36 Monate verglichen: ein 6-%-Autodarlehen gegenüber einem Leasing mit Money Factor 0,0025 und 60 % Restwert. Ein voreingestelltes Szenario des Leasing-oder-Kauf-Rechners.',
        summaryIntro: 'Der Direktvergleich bei einem typischen 35.000-$-Auto — wohin das Geld in 36 Monaten wirklich fließt.',
        faqs: [
          {
            question: 'Ist es günstiger, ein 35.000-$-Auto zu leasen oder zu kaufen?',
            answer: `Über 36 Monate ${winnerPhrase(r, 'de-DE')} — Kaufen kostet netto etwa ${money(r.buy.netCost, 'de-DE')} gegenüber ${money(r.lease.netCost, 'de-DE')} beim Leasing.`
          },
          {
            question: 'Wie hoch sind die Monatsraten?',
            answer: `Die Kaufrate liegt bei etwa ${money(r.buy.monthlyPayment, 'de-DE')} pro Monat gegenüber ${money(r.lease.monthlyPayment, 'de-DE')} beim Leasing — Leasing wirkt monatlich günstiger, aber am Ende gehört dir nichts.`
          },
          {
            question: 'Warum dieses Preset nutzen?',
            answer:
              'Es ist der klassische 36-Monats-Vergleich — Zinssatz, Restwert oder Anzahlung ändern und Sieger und Ersparnis berechnen sich sofort neu.'
          }
        ]
      },
      es: {
        title: 'Coche de lujo de 35.000 $ — ¿leasing o compra en 36 meses?',
        description:
          'Un vehículo de 35.000 $ comparado de dos formas en 36 meses: un préstamo al 6 % frente a un leasing con money factor 0,0025 y 60 % de valor residual. Un escenario preconfigurado de la calculadora de leasing o compra.',
        summaryIntro: 'El cara a cara de un coche típico de 35.000 $ — dónde va el dinero en 36 meses.',
        faqs: [
          {
            question: '¿Es más barato alquilar o comprar un coche de 35.000 $?',
            answer: `En 36 meses ${winnerPhrase(r, 'es-ES')} — comprar cuesta neto unos ${money(r.buy.netCost, 'es-ES')} frente a ${money(r.lease.netCost, 'es-ES')} del leasing.`
          },
          {
            question: '¿Cuáles son los pagos mensuales?',
            answer: `El pago de compra es de unos ${money(r.buy.monthlyPayment, 'es-ES')} al mes frente a ${money(r.lease.monthlyPayment, 'es-ES')} del leasing — el leasing parece más barato al mes, pero no te queda nada al final.`
          },
          {
            question: '¿Por qué usar este preset?',
            answer:
              'Es la comparación clásica a 36 meses — cambia tipo, residual o entrada y el ganador y el ahorro se recalculan al instante.'
          }
        ]
      },
      zh: {
        title: '3.5 万美元豪华车——36 个月租还是买？',
        description:
          '一辆 3.5 万美元的车在 36 个月内两种方式的对比：6% 车贷 vs 租赁（Money Factor 0.0025、残值率 60%）。一个预填好的租买对比计算器场景。',
        summaryIntro: '典型 3.5 万美元车的正面对决——36 个月里钱到底花在哪。',
        faqs: [
          {
            question: '3.5 万美元的车租还是买更划算？',
            answer: `36 个月内${r.winner === 'buy' ? `购买胜出约 ${money(r.savings, 'zh-CN')}` : `租赁胜出约 ${money(r.savings, 'zh-CN')}`}——购买净成本约 ${money(r.buy.netCost, 'zh-CN')}，租赁约 ${money(r.lease.netCost, 'zh-CN')}。`
          },
          {
            question: '月供分别是多少？',
            answer: `购买月供约 ${money(r.buy.monthlyPayment, 'zh-CN')}，租赁月费约 ${money(r.lease.monthlyPayment, 'zh-CN')}——租赁看似每月更省，但期末你不拥有任何资产。`
          },
          {
            question: '为什么用这个预设？',
            answer:
              '这是经典的 36 个月对比——修改利率、残值率或首付，胜者与节省额即时重算。'
          }
        ]
      }
    })
  ),

  buildPreset(
    '50k-ev-tesla',
    { buyPrice: 50000, loanRate: 6.5, loanTermMonths: 60, holdingPeriodMonths: 36, resaleValue: 27500, downPayment: 5000, salesTaxPct: 7, msrp: 50000, moneyFactor: 0.0022, leaseTermMonths: 36, residualPct: 55, acquisitionFee: 650, dispositionFee: 350 },
    (r) => ({
      en: {
        title: '$50K EV (Tesla) — Lease or Buy?',
        description:
          'An electric-vehicle scenario: a $50,000 EV with fast depreciation (55% residual) compared over 36 months between leasing and a 6.5% loan. A pre-filled lease vs buy calculator scenario.',
        summaryIntro: 'EVs depreciate faster than gas cars — does that make leasing the smarter bet?',
        faqs: [
          {
            question: 'Should I lease or buy an EV?',
            answer: `On this $50,000 EV over 36 months, ${winnerPhrase(r, 'en-US')} — leasing nets about ${money(r.lease.netCost, 'en-US')} versus ${money(r.buy.netCost, 'en-US')} for buying.`
          },
          {
            question: 'Why do EVs favor leasing?',
            answer:
              'Faster depreciation means the resale value drops quickly; leasing caps your exposure to that loss because you return the car instead of absorbing the equity hit.'
          },
          {
            question: 'What is the monthly comparison?',
            answer: `The lease runs about ${money(r.lease.monthlyPayment, 'en-US')} a month versus ${money(r.buy.monthlyPayment, 'en-US')} for the buy loan over 60 months.`
          }
        ]
      },
      de: {
        title: '50.000-$-Elektroauto (Tesla) — Leasen oder kaufen?',
        description:
          'Ein Elektroauto-Szenario: ein 50.000-$-EV mit schneller Wertminderung (55 % Restwert) über 36 Monate zwischen Leasing und einem 6,5-%-Darlehen. Ein voreingestelltes Szenario des Leasing-oder-Kauf-Rechners.',
        summaryIntro: 'EVs verlieren schneller an Wert als Benziner — macht das Leasing zur klügeren Wahl?',
        faqs: [
          {
            question: 'Sollte ich ein EV leasen oder kaufen?',
            answer: `Bei diesem 50.000-$-EV über 36 Monate ${winnerPhrase(r, 'de-DE')} — Leasing netto etwa ${money(r.lease.netCost, 'de-DE')} gegenüber ${money(r.buy.netCost, 'de-DE')} beim Kauf.`
          },
          {
            question: 'Warum bevorzugen EVs das Leasing?',
            answer:
              'Schnellere Wertminderung lässt den Wiederverkaufswert schnell fallen; Leasing begrenzt dein Risiko, weil du das Auto zurückgibst, statt den Eigenkapitalverlust zu tragen.'
          },
          {
            question: 'Wie sieht der Monatsvergleich aus?',
            answer: `Das Leasing liegt bei etwa ${money(r.lease.monthlyPayment, 'de-DE')} pro Monat gegenüber ${money(r.buy.monthlyPayment, 'de-DE')} beim Kaufdarlehen über 60 Monate.`
          }
        ]
      },
      es: {
        title: 'EV de 50.000 $ (Tesla) — ¿leasing o compra?',
        description:
          'Un escenario de vehículo eléctrico: un EV de 50.000 $ con depreciación rápida (55 % residual) comparado en 36 meses entre leasing y un préstamo al 6,5 %. Un escenario preconfigurado de la calculadora de leasing o compra.',
        summaryIntro: 'Los EV se deprecian más rápido que los de gasolina — ¿hace eso más inteligente el leasing?',
        faqs: [
          {
            question: '¿Debería alquilar o comprar un EV?',
            answer: `En este EV de 50.000 $ en 36 meses, ${winnerPhrase(r, 'es-ES')} — el leasing neto unos ${money(r.lease.netCost, 'es-ES')} frente a ${money(r.buy.netCost, 'es-ES')} de la compra.`
          },
          {
            question: '¿Por qué los EV favorecen el leasing?',
            answer:
              'La depreciación más rápida hace caer pronto el valor de reventa; el leasing limita tu exposición porque devuelves el coche en lugar de absorber la pérdida de patrimonio.'
          },
          {
            question: '¿Cuál es la comparación mensual?',
            answer: `El leasing ronda los ${money(r.lease.monthlyPayment, 'es-ES')} al mes frente a ${money(r.buy.monthlyPayment, 'es-ES')} del préstamo a 60 meses.`
          }
        ]
      },
      zh: {
        title: '5 万美元电动车（Tesla）——租还是买？',
        description:
          '电动车场景：一辆 5 万美元、贬值较快（残值率 55%）的 EV，在 36 个月内对比租赁与 6.5% 贷款。一个预填好的租买对比计算器场景。',
        summaryIntro: '电动车比燃油车贬值更快——这是否意味着租赁更明智？',
        faqs: [
          {
            question: '电动车该租还是买？',
            answer: `这辆 5 万美元 EV 在 36 个月内，${r.winner === 'buy' ? `购买胜出约 ${money(r.savings, 'zh-CN')}` : `租赁胜出约 ${money(r.savings, 'zh-CN')}`}——租赁净成本约 ${money(r.lease.netCost, 'zh-CN')}，购买约 ${money(r.buy.netCost, 'zh-CN')}。`
          },
          {
            question: '为什么电动车更适合租赁？',
            answer:
              '贬值更快意味着残值迅速下滑；租赁通过到期还车来限制你的亏损敞口，而不是承担资产缩水。'
          },
          {
            question: '月对比如何？',
            answer: `租赁月费约 ${money(r.lease.monthlyPayment, 'zh-CN')}，购买 60 个月贷款月供约 ${money(r.buy.monthlyPayment, 'zh-CN')}。`
          }
        ]
      }
    })
  ),

  buildPreset(
    'zero-down-lease',
    { buyPrice: 32000, loanRate: 6.5, loanTermMonths: 60, holdingPeriodMonths: 36, resaleValue: 17600, downPayment: 0, salesTaxPct: 7, msrp: 32000, moneyFactor: 0.0025, leaseTermMonths: 36, residualPct: 55, acquisitionFee: 650, dispositionFee: 350 },
    (r) => ({
      en: {
        title: 'Zero Down — Lease vs Buy a $32K Car',
        description:
          'No cash down either way: a $32,000 car leased with zero cap cost reduction versus a 5-year loan with no down payment, compared over 36 months. A pre-filled lease vs buy calculator scenario.',
        summaryIntro: 'When you bring nothing to the table, the lease can shine — here is the math.',
        faqs: [
          {
            question: 'Is a zero-down lease better than buying?',
            answer: `With no money down, ${winnerPhrase(r, 'en-US')} — the lease nets about ${money(r.lease.netCost, 'en-US')} versus ${money(r.buy.netCost, 'en-US')} for buying with a 5-year loan.`
          },
          {
            question: 'Why does zero-down favor leasing?',
            answer:
              'With $0 down you finance the entire purchase price plus tax, so the buy loan carries more interest; the lease spreads only depreciation and a finance charge.'
          },
          {
            question: 'What should I watch out for?',
            answer:
              'Zero-down leases usually come with higher monthly rent and mileage penalties — check the numbers before signing.'
          }
        ]
      },
      de: {
        title: 'Ohne Anzahlung — Leasen oder ein 32.000-$-Auto kaufen?',
        description:
          'Kein Eigenkapital in beiden Fällen: ein Auto für 32.000 $ ohne Cap-Cost-Reduction geleast gegenüber einem 5-Jahres-Darlehen ohne Anzahlung, über 36 Monate verglichen. Ein voreingestelltes Szenario des Leasing-oder-Kauf-Rechners.',
        summaryIntro: 'Wenn du nichts einbringst, kann das Leasing glänzen — hier ist die Rechnung.',
        faqs: [
          {
            question: 'Ist ein Leasing ohne Anzahlung besser als Kaufen?',
            answer: `Ohne Eigenkapital ${winnerPhrase(r, 'de-DE')} — das Leasing netto etwa ${money(r.lease.netCost, 'de-DE')} gegenüber ${money(r.buy.netCost, 'de-DE')} beim Kauf mit 5-Jahres-Darlehen.`
          },
          {
            question: 'Warum bevorzugt null Anzahlung das Leasing?',
            answer:
              'Mit 0 $ Anzahlung finanzierst du den vollen Kaufpreis plus Steuer, das Kaufdarlehen trägt also mehr Zinsen; das Leasing verteilt nur Wertminderung und Finanzierungskosten.'
          },
          {
            question: 'Worauf sollte ich achten?',
            answer:
              'Leasing ohne Anzahlung bringt meist höhere Raten und Kilometer-Strafen — prüfe die Zahlen vor der Unterschrift.'
          }
        ]
      },
      es: {
        title: 'Sin entrada — ¿leasing o comprar un coche de 32.000 $?',
        description:
          'Sin efectivo inicial en ninguno de los dos casos: un coche de 32.000 $ alquilado sin reducción de coste capital frente a un préstamo a 5 años sin entrada, comparado en 36 meses. Un escenario preconfigurado de la calculadora de leasing o compra.',
        summaryIntro: 'Cuando no aportas nada, el leasing puede brillar — aquí está la matemática.',
        faqs: [
          {
            question: '¿Es mejor un leasing sin entrada que comprar?',
            answer: `Sin dinero inicial, ${winnerPhrase(r, 'es-ES')} — el leasing neto unos ${money(r.lease.netCost, 'es-ES')} frente a ${money(r.buy.netCost, 'es-ES')} de la compra con préstamo a 5 años.`
          },
          {
            question: '¿Por qué la entrada cero favorece el leasing?',
            answer:
              'Con 0 $ de entrada financias el precio completo más impuestos, así que el préstamo lleva más intereses; el leasing reparte solo depreciación y un cargo financiero.'
          },
          {
            question: '¿Qué debería vigilar?',
            answer:
              'Los leases sin entrada suelen traer rentas mensuales más altas y penalizaciones por kilometraje — revisa las cifras antes de firmar.'
          }
        ]
      },
      zh: {
        title: '零首付——租还是买一辆 3.2 万美元的车？',
        description:
          '两种方式都无现金首付：一辆 3.2 万美元的车零 Cap Cost Reduction 租赁 vs 零首付 5 年期贷款，36 个月对比。一个预填好的租买对比计算器场景。',
        summaryIntro: '当你分文不投时，租赁可能大放异彩——数学在这里。',
        faqs: [
          {
            question: '零首付租赁比购买更好吗？',
            answer: `零首付情况下，${r.winner === 'buy' ? `购买胜出约 ${money(r.savings, 'zh-CN')}` : `租赁胜出约 ${money(r.savings, 'zh-CN')}`}——租赁净成本约 ${money(r.lease.netCost, 'zh-CN')}，5 年期贷款购买约 ${money(r.buy.netCost, 'zh-CN')}。`
          },
          {
            question: '为什么零首付更利于租赁？',
            answer:
              '0 美元首付意味着全额车价加税费都要融资，贷款利息更高；租赁只分摊折旧与金融费用。'
          },
          {
            question: '需要注意什么？',
            answer:
              '零首付租赁通常月费更高并伴有里程罚金——签字前务必核对数字。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'high-mileage-commuter',
    { buyPrice: 30000, loanRate: 6.5, loanTermMonths: 60, holdingPeriodMonths: 48, resaleValue: 13500, downPayment: 2000, salesTaxPct: 7, msrp: 30000, moneyFactor: 0.0032, leaseTermMonths: 36, residualPct: 50, acquisitionFee: 650, dispositionFee: 350 },
    (r) => ({
      en: {
        title: 'High-Mileage Commuter — Lease or Buy?',
        description:
          'A 15,000-miles-a-year commuter scenario: a $30,000 car kept for 4 years, where high mileage crushes lease residuals. A pre-filled lease vs buy calculator scenario.',
        summaryIntro: 'Leases punish mileage — see how 15k miles a year tilts the decision hard toward buying.',
        faqs: [
          {
            question: 'Is buying better for high mileage?',
            answer: `At 15,000 miles a year over 4 years, ${winnerPhrase(r, 'en-US')} — buying nets about ${money(r.buy.netCost, 'en-US')} versus ${money(r.lease.netCost, 'en-US')} for the lease.`
          },
          {
            question: 'Why does mileage kill the lease?',
            answer:
              'Lease terms cap miles (typically 10–12k/yr) and charge 15–25¢ per excess mile; at 15k/yr you pay thousands in penalties, while buying only faces faster depreciation.'
          },
          {
            question: 'What is the monthly picture?',
            answer: `The lease runs about ${money(r.lease.monthlyPayment, 'en-US')} a month (before mileage overage) versus ${money(r.buy.monthlyPayment, 'en-US')} for the buy loan.`
          }
        ]
      },
      de: {
        title: 'Vielfahrer-Pendler — Leasen oder kaufen?',
        description:
          'Ein Pendler-Szenario mit 24.000 km pro Jahr: ein Auto für 30.000 $, 4 Jahre gehalten, bei dem hohe Laufleistung den Leasing-Restwert zerstört. Ein voreingestelltes Szenario des Leasing-oder-Kauf-Rechners.',
        summaryIntro: 'Leasing bestraft Kilometer — sieh, wie 24.000 km pro Jahr die Entscheidung klar Richtung Kauf kippen.',
        faqs: [
          {
            question: 'Ist Kaufen bei hoher Laufleistung besser?',
            answer: `Bei 24.000 km pro Jahr über 4 Jahre ${winnerPhrase(r, 'de-DE')} — Kaufen netto etwa ${money(r.buy.netCost, 'de-DE')} gegenüber ${money(r.lease.netCost, 'de-DE')} beim Leasing.`
          },
          {
            question: 'Warum tötet Laufleistung das Leasing?',
            answer:
              'Leasingverträge begrenzen Kilometer (typisch 15.000–20.000 km/Jahr) und verlangen 15–25 Cent pro Überschreitung; bei 24.000 km/Jahr zahlst du Tausende an Strafen, während Kaufen nur schnellere Wertminderung bedeutet.'
          },
          {
            question: 'Wie sieht die monatliche Lage aus?',
            answer: `Das Leasing liegt bei etwa ${money(r.lease.monthlyPayment, 'de-DE')} pro Monat (vor Kilometer-Überschreitung) gegenüber ${money(r.buy.monthlyPayment, 'de-DE')} beim Kaufdarlehen.`
          }
        ]
      },
      es: {
        title: 'Conductor de alto kilometraje — ¿leasing o compra?',
        description:
          'Un escenario de 24.000 km al año: un coche de 30.000 $ conservado 4 años, donde el alto kilometraje destroza los residuales del leasing. Un escenario preconfigurado de la calculadora de leasing o compra.',
        summaryIntro: 'El leasing penaliza el kilometraje — mira cómo 24.000 km al año inclinan la decisión hacia la compra.',
        faqs: [
          {
            question: '¿Es mejor comprar para alto kilometraje?',
            answer: `A 24.000 km al año durante 4 años, ${winnerPhrase(r, 'es-ES')} — comprar neto unos ${money(r.buy.netCost, 'es-ES')} frente a ${money(r.lease.netCost, 'es-ES')} del leasing.`
          },
          {
            question: '¿Por qué el kilometraje mata el leasing?',
            answer:
              'Los contratos de leasing limitan kilómetros (normalmente 12.000–16.000 km/año) y cobran 15–25 centavos por kilómetro extra; a 24.000 km/año pagas miles en penalizaciones, mientras que comprar solo sufre depreciación más rápida.'
          },
          {
            question: '¿Cuál es el panorama mensual?',
            answer: `El leasing ronda los ${money(r.lease.monthlyPayment, 'es-ES')} al mes (antes de excesos de kilometraje) frente a ${money(r.buy.monthlyPayment, 'es-ES')} del préstamo.`
          }
        ]
      },
      zh: {
        title: '高里程通勤——租还是买？',
        description:
          '每年 1.5 万英里的通勤场景：一辆 3 万美元的车持有 4 年，高里程会压垮租赁残值。一个预填好的租买对比计算器场景。',
        summaryIntro: '租赁惩罚里程——看每年 1.5 万英里如何把决定推向购买。',
        faqs: [
          {
            question: '高里程更适合买吗？',
            answer: `每年 1.5 万英里、4 年持有，${r.winner === 'buy' ? `购买胜出约 ${money(r.savings, 'zh-CN')}` : `租赁胜出约 ${money(r.savings, 'zh-CN')}`}——购买净成本约 ${money(r.buy.netCost, 'zh-CN')}，租赁约 ${money(r.lease.netCost, 'zh-CN')}。`
          },
          {
            question: '为什么里程会毁掉租赁？',
            answer:
              '租赁合同限制里程（通常每年 1–1.2 万英里），超出每英里收 15–25 美分；每年 1.5 万英里要付数千美元罚金，而购买只是面临更快的贬值。'
          },
          {
            question: '月度对比如何？',
            answer: `租赁月费约 ${money(r.lease.monthlyPayment, 'zh-CN')}（不含里程超额），购买贷款月供约 ${money(r.buy.monthlyPayment, 'zh-CN')}。`
          }
        ]
      }
    })
  ),

  buildPreset(
    '25k-budget-sedan',
    { buyPrice: 25000, loanRate: 6, loanTermMonths: 60, holdingPeriodMonths: 36, resaleValue: 13750, downPayment: 2500, salesTaxPct: 6, msrp: 25000, moneyFactor: 0.0025, leaseTermMonths: 36, residualPct: 55, acquisitionFee: 650, dispositionFee: 350 },
    (r) => ({
      en: {
        title: '$25K Budget Sedan — 3-Year Ownership Cost',
        description:
          'An affordable commuter sedan: $25,000 compared over 36 months between a 5-year loan and a lease. A pre-filled lease vs buy calculator scenario.',
        summaryIntro: 'For budget sedans the math is tight — which side of the line does $25,000 land on?',
        faqs: [
          {
            question: 'Lease or buy a $25,000 sedan?',
            answer: `Over 36 months ${winnerPhrase(r, 'en-US')} — buying nets about ${money(r.buy.netCost, 'en-US')} versus ${money(r.lease.netCost, 'en-US')} for leasing.`
          },
          {
            question: 'What are the payments?',
            answer: `The buy payment is about ${money(r.buy.monthlyPayment, 'en-US')} a month versus ${money(r.lease.monthlyPayment, 'en-US')} for the lease.`
          },
          {
            question: 'Why use this preset?',
            answer:
              'It answers the most common budget-car question — whether keeping a modest sedan for 3 years is cheaper than renting it.'
          }
        ]
      },
      de: {
        title: '25.000-$-Budget-Limousine — 3-Jahres-Kosten',
        description:
          'Eine erschwingliche Pendler-Limousine: 25.000 $ über 36 Monate zwischen einem 5-Jahres-Darlehen und einem Leasing verglichen. Ein voreingestelltes Szenario des Leasing-oder-Kauf-Rechners.',
        summaryIntro: 'Bei Budget-Limousinen ist die Rechnung knapp — auf welcher Seite landet 25.000 $?',
        faqs: [
          {
            question: 'Leasen oder eine 25.000-$-Limousine kaufen?',
            answer: `Über 36 Monate ${winnerPhrase(r, 'de-DE')} — Kaufen netto etwa ${money(r.buy.netCost, 'de-DE')} gegenüber ${money(r.lease.netCost, 'de-DE')} beim Leasing.`
          },
          {
            question: 'Wie hoch sind die Raten?',
            answer: `Die Kaufrate liegt bei etwa ${money(r.buy.monthlyPayment, 'de-DE')} pro Monat gegenüber ${money(r.lease.monthlyPayment, 'de-DE')} beim Leasing.`
          },
          {
            question: 'Warum dieses Preset nutzen?',
            answer:
              'Es beantwortet die häufigste Budget-Frage — ob das Halten einer bescheidenen Limousine über 3 Jahre günstiger ist als das Mieten.'
          }
        ]
      },
      es: {
        title: 'Sedán económico de 25.000 $ — coste a 3 años',
        description:
          'Un sedán asequible para desplazamientos: 25.000 $ comparados en 36 meses entre un préstamo a 5 años y un leasing. Un escenario preconfigurado de la calculadora de leasing o compra.',
        summaryIntro: 'Para sedanes económicos la cuenta es ajustada — ¿de qué lado cae 25.000 $?',
        faqs: [
          {
            question: '¿Alquilar o comprar un sedán de 25.000 $?',
            answer: `En 36 meses ${winnerPhrase(r, 'es-ES')} — comprar neto unos ${money(r.buy.netCost, 'es-ES')} frente a ${money(r.lease.netCost, 'es-ES')} del leasing.`
          },
          {
            question: '¿Cuáles son los pagos?',
            answer: `El pago de compra es de unos ${money(r.buy.monthlyPayment, 'es-ES')} al mes frente a ${money(r.lease.monthlyPayment, 'es-ES')} del leasing.`
          },
          {
            question: '¿Por qué usar este preset?',
            answer:
              'Responde la pregunta más común del coche económico — si mantener un sedán modesto 3 años es más barato que alquilarlo.'
          }
        ]
      },
      zh: {
        title: '2.5 万美元经济型家轿——3 年持有成本',
        description:
          '一辆经济型通勤轿车：2.5 万美元在 36 个月内对比 5 年期贷款与租赁。一个预填好的租买对比计算器场景。',
        summaryIntro: '经济型家轿的账目很接近——2.5 万美元落在哪一边？',
        faqs: [
          {
            question: '2.5 万美元的轿车租还是买？',
            answer: `36 个月内${r.winner === 'buy' ? `购买胜出约 ${money(r.savings, 'zh-CN')}` : `租赁胜出约 ${money(r.savings, 'zh-CN')}`}——购买净成本约 ${money(r.buy.netCost, 'zh-CN')}，租赁约 ${money(r.lease.netCost, 'zh-CN')}。`
          },
          {
            question: '月供分别是多少？',
            answer: `购买月供约 ${money(r.buy.monthlyPayment, 'zh-CN')}，租赁月费约 ${money(r.lease.monthlyPayment, 'zh-CN')}。`
          },
          {
            question: '为什么用这个预设？',
            answer:
              '它回答最常见的预算车问题——持有这辆朴素的轿车 3 年是否比租赁更便宜。'
          }
        ]
      }
    })
  ),

  buildPreset(
    '60k-truck-suv',
    { buyPrice: 60000, loanRate: 6.5, loanTermMonths: 60, holdingPeriodMonths: 48, resaleValue: 37200, downPayment: 6000, salesTaxPct: 7, msrp: 60000, moneyFactor: 0.0028, leaseTermMonths: 48, residualPct: 62, acquisitionFee: 650, dispositionFee: 350 },
    (r) => ({
      en: {
        title: '$60K Truck or Large SUV — Lease vs Loan',
        description:
          'A big-vehicle scenario: a $60,000 truck/SUV with strong resale (62% residual) compared over 48 months. A pre-filled lease vs buy calculator scenario.',
        summaryIntro: 'Trucks hold value — see whether that makes buying the clear winner on a $60,000 rig.',
        faqs: [
          {
            question: 'Lease or buy a $60,000 truck?',
            answer: `Over 48 months ${winnerPhrase(r, 'en-US')} — buying nets about ${money(r.buy.netCost, 'en-US')} versus ${money(r.lease.netCost, 'en-US')} for the lease.`
          },
          {
            question: 'Why do trucks often favor buying?',
            answer:
              'Trucks and large SUVs keep a high resale value, so you get strong equity back when selling; leasing gives up that equity since you return the vehicle.'
          },
          {
            question: 'What are the monthly numbers?',
            answer: `The buy payment is about ${money(r.buy.monthlyPayment, 'en-US')} a month versus ${money(r.lease.monthlyPayment, 'en-US')} for the lease.`
          }
        ]
      },
      de: {
        title: '60.000-$-Pickup oder großes SUV — Leasen oder kaufen',
        description:
          'Ein Großfahrzeug-Szenario: ein Pickup/SUV für 60.000 $ mit starkem Restwert (62 %) über 48 Monate verglichen. Ein voreingestelltes Szenario des Leasing-oder-Kauf-Rechners.',
        summaryIntro: 'Pickups halten ihren Wert — sieh, ob das den Kauf zum klaren Sieger bei 60.000 $ macht.',
        faqs: [
          {
            question: 'Leasen oder einen 60.000-$-Pickup kaufen?',
            answer: `Über 48 Monate ${winnerPhrase(r, 'de-DE')} — Kaufen netto etwa ${money(r.buy.netCost, 'de-DE')} gegenüber ${money(r.lease.netCost, 'de-DE')} beim Leasing.`
          },
          {
            question: 'Warum begünstigen Pickups oft den Kauf?',
            answer:
              'Pickups und große SUVs behalten einen hohen Wiederverkaufswert, sodass du beim Verkauf starkes Eigenkapital zurückbekommst; Leasing gibt dieses Eigenkapital auf, da du das Fahrzeug zurückgibst.'
          },
          {
            question: 'Wie hoch sind die Monatszahlen?',
            answer: `Die Kaufrate liegt bei etwa ${money(r.buy.monthlyPayment, 'de-DE')} pro Monat gegenüber ${money(r.lease.monthlyPayment, 'de-DE')} beim Leasing.`
          }
        ]
      },
      es: {
        title: 'Pickup o SUV grande de 60.000 $ — leasing o préstamo',
        description:
          'Un escenario de vehículo grande: un pickup/SUV de 60.000 $ con fuerte valor residual (62 %) comparado en 48 meses. Un escenario preconfigurado de la calculadora de leasing o compra.',
        summaryIntro: 'Los pickups conservan valor — mira si eso convierte la compra en ganadora clara en un 60.000 $.',
        faqs: [
          {
            question: '¿Alquilar o comprar un pickup de 60.000 $?',
            answer: `En 48 meses ${winnerPhrase(r, 'es-ES')} — comprar neto unos ${money(r.buy.netCost, 'es-ES')} frente a ${money(r.lease.netCost, 'es-ES')} del leasing.`
          },
          {
            question: '¿Por qué los pickups favorecen la compra?',
            answer:
              'Los pickups y SUV grandes conservan un alto valor de reventa, así que recuperas fuerte patrimonio al vender; el leasing renuncia a ese patrimonio porque devuelves el vehículo.'
          },
          {
            question: '¿Cuáles son las cifras mensuales?',
            answer: `El pago de compra es de unos ${money(r.buy.monthlyPayment, 'es-ES')} al mes frente a ${money(r.lease.monthlyPayment, 'es-ES')} del leasing.`
          }
        ]
      },
      zh: {
        title: '6 万美元皮卡/大型 SUV——租还是贷',
        description:
          '大型车辆场景：一辆 6 万美元、残值强劲（62%）的皮卡/SUV，48 个月对比。一个预填好的租买对比计算器场景。',
        summaryIntro: '皮卡保值——看看这是否让 6 万美元的购买成为明确赢家。',
        faqs: [
          {
            question: '6 万美元的皮卡租还是买？',
            answer: `48 个月内${r.winner === 'buy' ? `购买胜出约 ${money(r.savings, 'zh-CN')}` : `租赁胜出约 ${money(r.savings, 'zh-CN')}`}——购买净成本约 ${money(r.buy.netCost, 'zh-CN')}，租赁约 ${money(r.lease.netCost, 'zh-CN')}。`
          },
          {
            question: '为什么皮卡通常更适合购买？',
            answer:
              '皮卡与大型 SUV 残值高，出售时能拿回可观权益；租赁则放弃这部分权益，因为车辆到期归还。'
          },
          {
            question: '月度数字如何？',
            answer: `购买月供约 ${money(r.buy.monthlyPayment, 'zh-CN')}，租赁月费约 ${money(r.lease.monthlyPayment, 'zh-CN')}。`
          }
        ]
      }
    })
  ),

  buildPreset(
    'business-tax-deduction',
    { buyPrice: 40000, loanRate: 6.5, loanTermMonths: 60, holdingPeriodMonths: 36, resaleValue: 23200, downPayment: 4000, salesTaxPct: 7, msrp: 40000, moneyFactor: 0.0025, leaseTermMonths: 36, residualPct: 58, acquisitionFee: 650, dispositionFee: 350 },
    (r) => ({
      en: {
        title: 'Business Vehicle — Lease or Buy for Tax?',
        description:
          'A business-use scenario: a $40,000 vehicle for self-employed/business owners, weighing lease-payment deductions against loan-interest and depreciation. A pre-filled lease vs buy calculator scenario.',
        summaryIntro: 'For business users the tax angle matters — the raw cost comparison, with the deduction notes.',
        faqs: [
          {
            question: 'What is the raw cost difference?',
            answer: `Over 36 months ${winnerPhrase(r, 'en-US')} — buying nets about ${money(r.buy.netCost, 'en-US')} versus ${money(r.lease.netCost, 'en-US')} for the lease, before any tax treatment.`
          },
          {
            question: 'How do business deductions change it?',
            answer:
              'Lease payments can be deducted in full for business use, while buying deducts interest and depreciation — the right choice depends on your bracket and how the vehicle is used.'
          },
          {
            question: 'Why use this preset?',
            answer:
              'It gives business owners the base numbers to hand to an accountant — the lease-vs-buy gap they then adjust for their own tax situation.'
          }
        ]
      },
      de: {
        title: 'Geschäftsfahrzeug — Leasen oder kaufen für Steuern?',
        description:
          'Ein Geschäftsnutzungs-Szenario: ein Fahrzeug für 40.000 $ für Selbstständige/Geschäftsinhaber, das Leasingraten-Abzüge gegen Darlehenszinsen und Abschreibung abwägt. Ein voreingestelltes Szenario des Leasing-oder-Kauf-Rechners.',
        summaryIntro: 'Für Geschäftskunden zählt die Steuerperspektive — der rohe Kostenvergleich mit Abzugshinweisen.',
        faqs: [
          {
            question: 'Wie groß ist der rohe Kostendifferenz?',
            answer: `Über 36 Monate ${winnerPhrase(r, 'de-DE')} — Kaufen netto etwa ${money(r.buy.netCost, 'de-DE')} gegenüber ${money(r.lease.netCost, 'de-DE')} beim Leasing, vor jeder Steuerbehandlung.`
          },
          {
            question: 'Wie ändern Geschäftsabzüge das?',
            answer:
              'Leasingraten können bei Geschäftsnutzung voll abgesetzt werden, beim Kauf werden Zinsen und Abschreibung abgesetzt — die richtige Wahl hängt von deinem Steuersatz und der Nutzung ab.'
          },
          {
            question: 'Warum dieses Preset nutzen?',
            answer:
              'Es liefert Geschäftsinhabern die Basiszahlen für den Steuerberater — die Leasing-Kauf-Lücke, die sie für ihre Steuersituation anpassen.'
          }
        ]
      },
      es: {
        title: 'Vehículo de empresa — ¿leasing o compra para impuestos?',
        description:
          'Un escenario de uso empresarial: un vehículo de 40.000 $ para autónomos/empresarios, sopesando deducciones de leasing frente a intereses de préstamo y depreciación. Un escenario preconfigurado de la calculadora de leasing o compra.',
        summaryIntro: 'Para uso empresarial importa el ángulo fiscal — la comparación de coste bruto con notas de deducción.',
        faqs: [
          {
            question: '¿Cuál es la diferencia de coste bruto?',
            answer: `En 36 meses ${winnerPhrase(r, 'es-ES')} — comprar neto unos ${money(r.buy.netCost, 'es-ES')} frente a ${money(r.lease.netCost, 'es-ES')} del leasing, antes de cualquier tratamiento fiscal.`
          },
          {
            question: '¿Cómo cambian las deducciones empresariales?',
            answer:
              'Los pagos de leasing se pueden deducir por completo en uso empresarial, mientras que comprar deduce intereses y depreciación — la elección correcta depende de tu tramo y del uso del vehículo.'
          },
          {
            question: '¿Por qué usar este preset?',
            answer:
              'Da a los empresarios las cifras base para su asesor fiscal — la brecha leasing-compra que luego ajustan a su situación tributaria.'
          }
        ]
      },
      zh: {
        title: '企业用车——租还是买更省税？',
        description:
          '企业用途场景：一辆 4 万美元、面向自雇/企业主的车，权衡租赁付款抵扣与贷款利息、折旧。一个预填好的租买对比计算器场景。',
        summaryIntro: '对企业用户来说税务角度很重要——原始成本对比加抵扣说明。',
        faqs: [
          {
            question: '原始成本差异是多少？',
            answer: `36 个月内${r.winner === 'buy' ? `购买胜出约 ${money(r.savings, 'zh-CN')}` : `租赁胜出约 ${money(r.savings, 'zh-CN')}`}——购买净成本约 ${money(r.buy.netCost, 'zh-CN')}，租赁约 ${money(r.lease.netCost, 'zh-CN')}（均未考虑税务处理）。`
          },
          {
            question: '企业抵扣如何改变结果？',
            answer:
              '企业用途下租赁付款可全额抵扣，购买则抵扣利息与折旧——正确选择取决于你的税率与车辆用途。'
          },
          {
            question: '为什么用这个预设？',
            answer:
              '它给企业主提供交给会计的基础数字——他们再根据自己的税务状况调整租买差距。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'low-money-factor-promo',
    { buyPrice: 33000, loanRate: 6.5, loanTermMonths: 60, holdingPeriodMonths: 36, resaleValue: 19140, downPayment: 3000, salesTaxPct: 7, msrp: 33000, moneyFactor: 0.0015, leaseTermMonths: 36, residualPct: 58, acquisitionFee: 650, dispositionFee: 350 },
    (r) => ({
      en: {
        title: 'Low Money Factor Promo — Lease or Buy?',
        description:
          'A promotional-rate scenario: a $33,000 vehicle with an aggressive 0.0015 money factor (≈3.6% APR) compared against a 6.5% loan over 36 months. A pre-filled lease vs buy calculator scenario.',
        summaryIntro: 'When the dealer subsidizes the lease rate, the equation can flip — here is the proof.',
        faqs: [
          {
            question: 'Does a low money factor make leasing better?',
            answer: `At 0.0015 money factor over 36 months, ${winnerPhrase(r, 'en-US')} — the promo lease nets about ${money(r.lease.netCost, 'en-US')} versus ${money(r.buy.netCost, 'en-US')} for buying.`
          },
          {
            question: 'What does 0.0015 money factor mean?',
            answer:
              'Money factor × 2400 ≈ APR, so 0.0015 is roughly a 3.6% lease rate — well below a typical 6.5% auto loan, which is why the lease can win despite the fees.'
          },
          {
            question: 'Why use this preset?',
            answer:
              'It shows how to evaluate dealer promos — plug in the offered money factor and see instantly whether the special rate changes the winner.'
          }
        ]
      },
      de: {
        title: 'Niedriger Money-Factor-Sonderpreis — Leasen oder kaufen?',
        description:
          'Ein Sonderkonditionen-Szenario: ein Fahrzeug für 33.000 $ mit aggressivem Money Factor 0,0015 (≈3,6 % APR) gegen ein 6,5-%-Darlehen über 36 Monate. Ein voreingestelltes Szenario des Leasing-oder-Kauf-Rechners.',
        summaryIntro: 'Wenn der Händler den Leasingzins subventioniert, kann sich die Gleichung drehen — hier ist der Beweis.',
        faqs: [
          {
            question: 'Macht ein niedriger Money Factor Leasing besser?',
            answer: `Bei Money Factor 0,0015 über 36 Monate ${winnerPhrase(r, 'de-DE')} — das Sonder-Leasing netto etwa ${money(r.lease.netCost, 'de-DE')} gegenüber ${money(r.buy.netCost, 'de-DE')} beim Kauf.`
          },
          {
            question: 'Was bedeutet Money Factor 0,0015?',
            answer:
              'Money Factor × 2400 ≈ APR, also entspricht 0,0015 etwa 3,6 % Leasingzins — deutlich unter einem typischen 6,5-%-Autodarlehen, weshalb das Leasing trotz Gebühren gewinnen kann.'
          },
          {
            question: 'Warum dieses Preset nutzen?',
            answer:
              'Es zeigt, wie man Händler-Aktionen bewertet — den angebotenen Money Factor eintragen und sofort sehen, ob der Sonderzins den Sieger ändert.'
          }
        ]
      },
      es: {
        title: 'Promo de money factor bajo — ¿leasing o compra?',
        description:
          'Un escenario de tipo promocional: un vehículo de 33.000 $ con un money factor agresivo de 0,0015 (≈3,6 % TAE) frente a un préstamo al 6,5 % en 36 meses. Un escenario preconfigurado de la calculadora de leasing o compra.',
        summaryIntro: 'Cuando el concesionario subvenciona el tipo del leasing, la ecuación puede invertirse — aquí está la prueba.',
        faqs: [
          {
            question: '¿Un money factor bajo hace mejor el leasing?',
            answer: `Con money factor 0,0015 en 36 meses, ${winnerPhrase(r, 'es-ES')} — la promo neta unos ${money(r.lease.netCost, 'es-ES')} frente a ${money(r.buy.netCost, 'es-ES')} de la compra.`
          },
          {
            question: '¿Qué significa 0,0015 de money factor?',
            answer:
              'Money factor × 2400 ≈ TAE, así que 0,0015 equivale a un 3,6 % de leasing — muy por debajo de un préstamo típico al 6,5 %, por eso el leasing puede ganar pese a las tasas.'
          },
          {
            question: '¿Por qué usar este preset?',
            answer:
              'Muestra cómo evaluar las promos del concesionario — introduce el money factor ofrecido y mira al instante si el tipo especial cambia al ganador.'
          }
        ]
      },
      zh: {
        title: '低 Money Factor 促销——租还是买？',
        description:
          '促销利率场景：一辆 3.3 万美元的车，租赁 Money Factor 低至 0.0015（≈3.6% APR），与 6.5% 贷款在 36 个月内对比。一个预填好的租买对比计算器场景。',
        summaryIntro: '当经销商补贴租赁利率时，方程可能翻转——证据在此。',
        faqs: [
          {
            question: '低 Money Factor 会让租赁更划算吗？',
            answer: `0.0015 Money Factor、36 个月下，${r.winner === 'buy' ? `购买胜出约 ${money(r.savings, 'zh-CN')}` : `租赁胜出约 ${money(r.savings, 'zh-CN')}`}——促销租赁净成本约 ${money(r.lease.netCost, 'zh-CN')}，购买约 ${money(r.buy.netCost, 'zh-CN')}。`
          },
          {
            question: '0.0015 Money Factor 意味着什么？',
            answer:
              'Money Factor × 2400 ≈ APR，0.0015 约等于 3.6% 的租赁利率——远低于典型的 6.5% 车贷，这就是租赁在扣除费用后仍能胜出的原因。'
          },
          {
            question: '为什么用这个预设？',
            answer:
              '它演示如何评估经销商促销——填入给出的 Money Factor，立刻看到特惠利率是否改变胜者。'
          }
        ]
      }
    })
  )
];

export const PRESET_SLUGS = PRESETS.map((p) => p.slug);

export function getPreset(scenario: string): LeaseVsBuyPreset | undefined {
  return PRESETS.find((p) => p.slug === scenario);
}

/**
 * Build the URL-query seed from a LeaseVsBuyInput preset, mirroring LEASEVSBUY_URL_KEY in
 * LeaseVsBuyCalculatorClient. Defaults are omitted so a clean share link only carries
 * the values the preset actually set.
 */
export function leaseVsBuyInitialQuery(preset: LeaseVsBuyPreset): Record<string, string> {
  const q: Record<string, string> = {};
  const p = preset.defaultParams;
  if (p.buyPrice !== 35000) q.price = String(p.buyPrice);
  if (p.loanRate !== 6) q.rate = String(p.loanRate);
  if (p.loanTermMonths !== 36) q.loanTerm = String(p.loanTermMonths);
  if (p.holdingPeriodMonths !== 36) q.holding = String(p.holdingPeriodMonths);
  if (p.resaleValue !== 21000) q.resale = String(p.resaleValue);
  if (p.downPayment !== 3000) q.down = String(p.downPayment);
  if (p.salesTaxPct !== 7) q.tax = String(p.salesTaxPct);
  if (p.msrp !== 35000) q.msrp = String(p.msrp);
  if (p.moneyFactor !== 0.0025) q.mf = String(p.moneyFactor);
  if (p.leaseTermMonths !== 36) q.leaseTerm = String(p.leaseTermMonths);
  if (p.residualPct !== 60) q.residual = String(p.residualPct);
  if (p.acquisitionFee !== 0) q.acq = String(p.acquisitionFee);
  if (p.dispositionFee !== 0) q.disp = String(p.dispositionFee);
  return q;
}
