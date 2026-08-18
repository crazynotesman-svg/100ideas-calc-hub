/**
 * Mortgage pSEO Preset Matrix / 房贷计算器程序化 SEO 预设矩阵
 * ----------------------------------------------------------------------------
 * Seed scenarios for the Mortgage & Amortization calculator.
 * Each preset is a fully described, pre-filled landing page, with localized
 * title, meta description, scenario summary and a scenario-specific FAQ.
 *
 * The calculator numbers embedded in the copy are computed from the live engine
 * (calculateMortgage) so the FAQ prose always matches the rendered benchmark.
 */

import { calculateMortgage, type MortgageInput } from '@/lib/calculators/finance/mortgage';
import type { Locale } from '@/config/i18n.config';
import type { FaqEntry } from '@/lib/seo/schema';

export const MORTGAGE_CATEGORY = 'finance';
export const MORTGAGE_SLUG = 'mortgage-calculator';

/** Locale-independent route for a scenario page. */
export function presetRoute(scenario: string) {
  return `/calculators/${MORTGAGE_CATEGORY}/${MORTGAGE_SLUG}/preset/${scenario}`;
}

interface LocalizedPreset {
  title: string;
  description: string;
  summaryIntro: string;
  faqs: FaqEntry[];
}

export interface MortgagePreset {
  slug: string;
  /** Resolved metric input state passed straight to the client (no CLS on first paint). */
  defaultParams: MortgageInput;
  localized: Record<Locale, LocalizedPreset>;
}

type Result = ReturnType<typeof calculateMortgage>;

/** Whole-dollar locale formatting for preset copy. */
function money(v: number, locale: string) {
  return `$${Math.round(v).toLocaleString(locale)}`;
}
/** e.g. "25 years 3 months" style helper. */
function termParts(months: number) {
  return { y: Math.floor(months / 12), m: months % 12 };
}

function buildPreset(
  slug: string,
  defaultParams: MortgageInput,
  localized: (r: Result) => Record<Locale, LocalizedPreset>
): MortgagePreset {
  return { slug, defaultParams, localized: localized(calculateMortgage(defaultParams)) };
}

export const PRESETS: MortgagePreset[] = [
  buildPreset(
    '30-year-fixed-mortgage-7-percent',
    { homePrice: 400000, downPayment: 80000, loanTermYears: 30, annualRate: 7, extraMonthly: 0 },
    (r) => ({
      en: {
        title: '30-Year Fixed Mortgage at 7%',
        description:
          'The standard baseline: a $400,000 home with 20% down ($320,000 loan) financed at a 7% fixed rate for 30 years. A pre-filled mortgage calculator scenario.',
        summaryIntro: 'The most common home-loan setup — how a 7% rate shapes your monthly payment and lifetime interest.',
        faqs: [
          {
            question: 'What is the monthly payment on a 30-year mortgage at 7%?',
            answer: `On a $320,000 loan the principal & interest payment is about ${money(r.monthlyPayment, 'en-US')} a month, before taxes and insurance.`
          },
          {
            question: 'How much interest is paid over 30 years?',
            answer: `Over the full term you pay about ${money(r.totalInterest, 'en-US')} in interest, pushing the total cost of the loan to ${money(r.totalCost, 'en-US')}.`
          },
          {
            question: 'Why is this the baseline preset?',
            answer:
              'It gives buyers a realistic, shareable starting point for the most common loan structure — edit the price, down payment or rate and everything updates instantly.'
          }
        ]
      },
      de: {
        title: '30-jährige Festhypothek bei 7 %',
        description:
          'Die Standard-Baseline: ein Haus für 400.000 $ mit 20 % Anzahlung (320.000 $ Darlehen) zu 7 % Festzins über 30 Jahre. Ein voreingestelltes Szenario des Hypothekenrechners.',
        summaryIntro: 'Der häufigste Hauskredit-Aufbau — wie ein 7-%-Satz Monatsrate und Gesamtzinsen prägt.',
        faqs: [
          {
            question: 'Wie hoch ist die Monatsrate bei einer 30-jährigen Hypothek zu 7 %?',
            answer: `Bei einem Darlehen von 320.000 $ liegt die Tilgungs- und Zinsrate bei etwa ${money(r.monthlyPayment, 'de-DE')} pro Monat, vor Steuern und Versicherung.`
          },
          {
            question: 'Wie viel Zinsen fallen in 30 Jahren an?',
            answer: `Über die volle Laufzeit zahlst du etwa ${money(r.totalInterest, 'de-DE')} Zinsen; die Gesamtkosten des Darlehens steigen damit auf ${money(r.totalCost, 'de-DE')}.`
          },
          {
            question: 'Warum ist dies das Basis-Preset?',
            answer:
              'Es liefert Käufern einen realistischen, teilbaren Ausgangspunkt für die häufigste Kreditstruktur — Preis, Anzahlung oder Zinssatz ändern und alles aktualisiert sich sofort.'
          }
        ]
      },
      es: {
        title: 'Hipoteca fija a 30 años al 7 %',
        description:
          'La referencia estándar: una casa de 400.000 $ con un 20 % de entrada (préstamo de 320.000 $) financiada a un tipo fijo del 7 % durante 30 años. Un escenario preconfigurado de la calculadora de hipoteca.',
        summaryIntro: 'La estructura de préstamo más común — cómo un tipo del 7 % condiciona tu pago mensual y los intereses de por vida.',
        faqs: [
          {
            question: '¿Cuál es el pago mensual de una hipoteca a 30 años al 7 %?',
            answer: `Sobre un préstamo de 320.000 $ el pago de capital e intereses es de unos ${money(r.monthlyPayment, 'es-ES')} al mes, antes de impuestos y seguros.`
          },
          {
            question: '¿Cuánto interés se paga en 30 años?',
            answer: `A lo largo de todo el plazo pagas unos ${money(r.totalInterest, 'es-ES')} de intereses, lo que eleva el coste total del préstamo a ${money(r.totalCost, 'es-ES')}.`
          },
          {
            question: '¿Por qué es este el preset de referencia?',
            answer:
              'Da a los compradores un punto de partida realista y compartible para la estructura de préstamo más habitual: cambia precio, entrada o tipo y todo se actualiza al instante.'
          }
        ]
      },
      zh: {
        title: '30 年期固定利率抵押贷款（7%）',
        description:
          '标准基准：一套 40 万美元的房子，首付 20%（贷款 32 万美元），按 7% 固定利率贷 30 年。一个预填好的房贷计算器场景。',
        summaryIntro: '最常见的房贷结构——看 7% 的利率如何影响月供与终身利息。',
        faqs: [
          {
            question: '7%、30 年期房贷的月供是多少？',
            answer: `32 万美元的贷款，本金与利息月供约为每月 ${money(r.monthlyPayment, 'zh-CN')}（不含税费与保险）。`
          },
          {
            question: '30 年一共要还多少利息？',
            answer: `整个期限你大约支付 ${money(r.totalInterest, 'zh-CN')} 的利息，贷款总成本达到 ${money(r.totalCost, 'zh-CN')}。`
          },
          {
            question: '为什么把它作为基准预设？',
            answer:
              '它为最常见的贷款结构提供一个现实、可分享的起点——修改房价、首付或利率，一切即时更新。'
          }
        ]
      }
    })
  ),

  buildPreset(
    '15-year-fixed-vs-30-year-mortgage',
    { homePrice: 400000, downPayment: 80000, loanTermYears: 15, annualRate: 6.5, extraMonthly: 0 },
    (r) => {
      const alt = calculateMortgage({ homePrice: 400000, downPayment: 80000, loanTermYears: 30, annualRate: 7, extraMonthly: 0 });
      return {
        en: {
          title: '15-Year vs 30-Year Mortgage',
          description:
            'A side-by-side comparison on a $400,000 home with 20% down: a 15-year loan at 6.5% versus a 30-year loan at 7%. A pre-filled mortgage calculator scenario.',
          summaryIntro: 'Pay less interest in half the time, or keep the payment low — the classic trade-off, quantified.',
          faqs: [
            {
              question: 'How much more is the 15-year monthly payment?',
              answer: `The 15-year payment is about ${money(r.monthlyPayment, 'en-US')} a month versus ${money(alt.monthlyPayment, 'en-US')} on the 30-year — roughly ${money(r.monthlyPayment - alt.monthlyPayment, 'en-US')} more each month.`
            },
            {
              question: 'How much interest does a 15-year loan really save?',
              answer: `Total interest drops from about ${money(alt.totalInterest, 'en-US')} on the 30-year to ${money(r.totalInterest, 'en-US')} — saving roughly ${money(alt.totalInterest - r.totalInterest, 'en-US')} over the life of the loan.`
            },
            {
              question: 'Which one should I pick?',
              answer:
                'If you can absorb the higher payment and plan to stay long-term, the 15-year wins on cost; if cash flow matters more, the 30-year keeps payments flexible. This preset lets you compare both side by side.'
            }
          ]
        },
        de: {
          title: '15-jährige vs. 30-jährige Hypothek',
          description:
            'Ein direkter Vergleich bei einem Haus für 400.000 $ mit 20 % Anzahlung: ein 15-jähriges Darlehen zu 6,5 % gegenüber einem 30-jährigen zu 7 %. Ein voreingestelltes Szenario des Hypothekenrechners.',
          summaryIntro: 'In halber Zeit weniger Zinsen zahlen oder die Rate niedrig halten — der klassische Trade-off, beziffert.',
          faqs: [
            {
              question: 'Wie viel höher ist die Monatsrate bei 15 Jahren?',
              answer: `Die 15-jährige Rate liegt bei etwa ${money(r.monthlyPayment, 'de-DE')} gegenüber ${money(alt.monthlyPayment, 'de-DE')} bei 30 Jahren — also rund ${money(r.monthlyPayment - alt.monthlyPayment, 'de-DE')} mehr pro Monat.`
            },
            {
              question: 'Wie viel Zinsen spart ein 15-jähriges Darlehen wirklich?',
              answer: `Die Gesamtzinsen sinken von etwa ${money(alt.totalInterest, 'de-DE')} bei 30 Jahren auf ${money(r.totalInterest, 'de-DE')} — eine Ersparnis von rund ${money(alt.totalInterest - r.totalInterest, 'de-DE')} über die Laufzeit.`
            },
            {
              question: 'Welches sollte ich wählen?',
              answer:
                'Wenn du die höhere Rate verkraftest und langfristig wohnen bleibst, gewinnt die 15-jährige; zählt der Cashflow mehr, hält die 30-jährige die Raten flexibel. Dieses Preset vergleicht beides direkt.'
            }
          ]
        },
        es: {
          title: 'Hipoteca a 15 años frente a 30 años',
          description:
            'Una comparación lado a lado sobre una casa de 400.000 $ con un 20 % de entrada: un préstamo a 15 años al 6,5 % frente a uno a 30 años al 7 %. Un escenario preconfigurado de la calculadora de hipoteca.',
          summaryIntro: 'Pagar menos intereses en la mitad de tiempo o mantener el pago bajo — el clásico dilema, cuantificado.',
          faqs: [
            {
              question: '¿Cuánto mayor es el pago mensual a 15 años?',
              answer: `El pago a 15 años es de unos ${money(r.monthlyPayment, 'es-ES')} frente a ${money(alt.monthlyPayment, 'es-ES')} a 30 años — unos ${money(r.monthlyPayment - alt.monthlyPayment, 'es-ES')} más al mes.`
            },
            {
              question: '¿Cuánto interés ahorra realmente un préstamo a 15 años?',
              answer: `El interés total baja de unos ${money(alt.totalInterest, 'es-ES')} a 30 años a ${money(r.totalInterest, 'es-ES')} — un ahorro de unos ${money(alt.totalInterest - r.totalInterest, 'es-ES')} durante toda la vida del préstamo.`
            },
            {
              question: '¿Cuál debería elegir?',
              answer:
                'Si puedes asumir el pago mayor y piensas quedarte a largo plazo, gana el de 15 años; si el flujo de caja importa más, el de 30 años mantiene flexibles los pagos. Este preset compara ambos.'
            }
          ]
        },
        zh: {
          title: '15 年期 vs 30 年期房贷',
          description:
            '40 万美元房子、20% 首付的并排对比：15 年期 6.5% 贷款 vs 30 年期 7% 贷款。一个预填好的房贷计算器场景。',
          summaryIntro: '用一半时间少付利息，还是把月供压低——经典取舍，量化呈现。',
          faqs: [
            {
              question: '15 年期的月供高多少？',
              answer: `15 年期月供约 ${money(r.monthlyPayment, 'zh-CN')}，30 年期约 ${money(alt.monthlyPayment, 'zh-CN')}——每月多付约 ${money(r.monthlyPayment - alt.monthlyPayment, 'zh-CN')}。`
            },
            {
              question: '15 年期贷款到底能省多少利息？',
              answer: `总利息从 30 年期的约 ${money(alt.totalInterest, 'zh-CN')} 降至 15 年期的 ${money(r.totalInterest, 'zh-CN')}——整个贷款期节省约 ${money(alt.totalInterest - r.totalInterest, 'zh-CN')}。`
            },
            {
              question: '我该怎么选？',
              answer:
                '如果能承受更高的月供且打算长期居住，15 年期在总成本上胜出；如果现金流更重要，30 年期让月供更灵活。这个预设让你并排比较两者。'
            }
          ]
        }
      };
    }
  ),

  buildPreset(
    '500k-house-20-percent-down-payment',
    { homePrice: 500000, downPayment: 100000, loanTermYears: 30, annualRate: 7, extraMonthly: 0 },
    (r) => ({
      en: {
        title: '$500K House with 20% Down Payment',
        description:
          'The classic home-buyer setup: a $500,000 home with a $100,000 (20%) down payment, leaving a $400,000 loan at 7% for 30 years. A pre-filled mortgage calculator scenario.',
        summaryIntro: 'The 20%-down default that avoids PMI — and what it actually costs per month.',
        faqs: [
          {
            question: 'What is the monthly payment on a $500,000 house with 20% down?',
            answer: `With a $100,000 down payment the loan is $400,000, so principal & interest runs about ${money(r.monthlyPayment, 'en-US')} a month at 7% for 30 years.`
          },
          {
            question: 'Why is 20% down the standard?',
            answer: `A 20% down payment ($100,000 here) usually avoids private mortgage insurance and keeps equity positive from day one — on this loan the lifetime interest is about ${money(r.totalInterest, 'en-US')}.`
          },
          {
            question: 'How do I use this preset?',
            answer:
              'Open the page and the inputs are already filled in — change the price, rate or term and the payment, total cost and amortization schedule recalculate live.'
          }
        ]
      },
      de: {
        title: '500.000 $-Haus mit 20 % Anzahlung',
        description:
          'Das klassische Käufer-Setup: ein Haus für 500.000 $ mit 100.000 $ (20 %) Anzahlung, restliches Darlehen von 400.000 $ zu 7 % über 30 Jahre. Ein voreingestelltes Szenario des Hypothekenrechners.',
        summaryIntro: 'Die 20-%-Anzahlungs-Norm, die PMI vermeidet — und was sie monatlich wirklich kostet.',
        faqs: [
          {
            question: 'Wie hoch ist die Monatsrate bei einem 500.000-$-Haus mit 20 % Anzahlung?',
            answer: `Mit 100.000 $ Anzahlung beträgt das Darlehen 400.000 $, die Tilgungs- und Zinsrate liegt also bei etwa ${money(r.monthlyPayment, 'de-DE')} pro Monat bei 7 % über 30 Jahre.`
          },
          {
            question: 'Warum ist 20 % Anzahlung der Standard?',
            answer: `20 % (hier 100.000 $) vermeiden meist die private Hypothekenversicherung und sichern von Anfang an ein positives Eigenkapital — bei diesem Darlehen fallen über die Laufzeit etwa ${money(r.totalInterest, 'de-DE')} Zinsen an.`
          },
          {
            question: 'Wie nutze ich dieses Preset?',
            answer:
              'Öffne die Seite — die Eingaben sind schon ausgefüllt. Ändere Preis, Zinssatz oder Laufzeit und Rate, Gesamtkosten und Tilgungsplan aktualisieren sich live.'
          }
        ]
      },
      es: {
        title: 'Casa de 500.000 $ con 20 % de entrada',
        description:
          'El escenario clásico del comprador: una casa de 500.000 $ con 100.000 $ (20 %) de entrada, dejando un préstamo de 400.000 $ al 7 % durante 30 años. Un escenario preconfigurado de la calculadora de hipoteca.',
        summaryIntro: 'El estándar del 20 % de entrada que evita el seguro hipotecario privado — y lo que cuesta realmente al mes.',
        faqs: [
          {
            question: '¿Cuál es el pago mensual de una casa de 500.000 $ con 20 % de entrada?',
            answer: `Con 100.000 $ de entrada el préstamo es de 400.000 $, así que capital e intereses rondan los ${money(r.monthlyPayment, 'es-ES')} al mes al 7 % durante 30 años.`
          },
          {
            question: '¿Por qué es estándar el 20 % de entrada?',
            answer: `Un 20 % (aquí 100.000 $) suele evitar el seguro hipotecario privado y mantiene patrimonio positivo desde el primer día — en este préstamo el interés de por vida es de unos ${money(r.totalInterest, 'es-ES')}.`
          },
          {
            question: '¿Cómo uso este preset?',
            answer:
              'Abre la página y los campos ya están rellenos: cambia precio, tipo o plazo y el pago, el coste total y el calendario de amortización se recalculan en vivo.'
          }
        ]
      },
      zh: {
        title: '50 万美元房子，20% 首付',
        description:
          '经典购房方案：一套 50 万美元的房子，首付 10 万美元（20%），剩余 40 万美元贷款按 7% 贷 30 年。一个预填好的房贷计算器场景。',
        summaryIntro: '避免 PMI 的 20% 首付惯例——以及它实际的月供成本。',
        faqs: [
          {
            question: '50 万美元房子、20% 首付的月供是多少？',
            answer: `首付 10 万美元后贷款为 40 万美元，7% 贷 30 年的本金与利息月供约 ${money(r.monthlyPayment, 'zh-CN')}。`
          },
          {
            question: '为什么 20% 首付是惯例？',
            answer: `20%（此处 10 万美元）通常可避免私人抵押贷款保险（PMI），并让首日即有正资产——这笔贷款的终身利息约 ${money(r.totalInterest, 'zh-CN')}。`
          },
          {
            question: '怎么用这个预设？',
            answer:
              '打开页面输入已填好——修改房价、利率或期限，月供、总成本与摊销明细都会实时重算。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'extra-100-monthly-payment-mortgage-payoff',
    { homePrice: 400000, downPayment: 80000, loanTermYears: 30, annualRate: 7, extraMonthly: 100 },
    (r) => ({
      en: {
        title: 'Pay Off Mortgage Faster with $100 Extra a Month',
        description:
          'An early-payoff strategy: a $320,000 loan at 7% for 30 years with just $100 extra per month going straight to principal. A pre-filled mortgage calculator scenario.',
        summaryIntro: 'The smallest habit that pays off big — what $100 a month does to your payoff date and interest bill.',
        faqs: [
          {
            question: 'How much faster does $100 a month pay off the mortgage?',
            answer: `An extra $100 a month clears the loan in about ${termParts(r.payoffMonths).y} years ${termParts(r.payoffMonths).m} months instead of 30 years — roughly ${r.monthsSaved} months sooner.`
          },
          {
            question: 'How much interest does that save?',
            answer: `You save about ${money(r.interestSaved, 'en-US')} in interest — a solid return on just $100 a month redirected to principal.`
          },
          {
            question: 'Does my monthly payment change?',
            answer:
              'No — the scheduled payment stays the same; the extra $100 is applied to the principal each month, so you simply stop paying months earlier and owe far less interest overall.'
          }
        ]
      },
      de: {
        title: 'Hypothek mit 100 $ extra pro Monat schneller abbezahlen',
        description:
          'Eine Strategie zur vorzeitigen Tilgung: ein Darlehen von 320.000 $ zu 7 % über 30 Jahre mit nur 100 $ extra pro Monat direkt aufs Kapital. Ein voreingestelltes Szenario des Hypothekenrechners.',
        summaryIntro: 'Die kleinste Gewohnheit mit großer Wirkung — was 100 $ pro Monat für Tilgungsdatum und Zinsrechnung tun.',
        faqs: [
          {
            question: 'Wie viel schneller tilgen 100 $ pro Monat die Hypothek?',
            answer: `Mit 100 $ extra pro Monat ist das Darlehen nach etwa ${termParts(r.payoffMonths).y} Jahren und ${termParts(r.payoffMonths).m} Monaten abbezahlt statt nach 30 Jahren — rund ${r.monthsSaved} Monate früher.`
          },
          {
            question: 'Wie viel Zinsen spart das?',
            answer: `Du sparst etwa ${money(r.interestSaved, 'de-DE')} Zinsen — eine solide Rendite für nur 100 $ pro Monat, die direkt ins Kapital fließen.`
          },
          {
            question: 'Ändert sich meine Monatsrate?',
            answer:
              'Nein — die planmäßige Rate bleibt gleich; die 100 $ extra werden monatlich aufs Kapital angerechnet, sodass du einfach Monate früher fertig bist und insgesamt deutlich weniger Zinsen zahlst.'
          }
        ]
      },
      es: {
        title: 'Pagar la hipoteca antes con 100 $ extra al mes',
        description:
          'Una estrategia de amortización anticipada: un préstamo de 320.000 $ al 7 % durante 30 años con solo 100 $ extra al mes que van directos al capital. Un escenario preconfigurado de la calculadora de hipoteca.',
        summaryIntro: 'El hábito más pequeño con un gran resultado — lo que 100 $ al mes hacen por tu fecha de liquidación y tu factura de intereses.',
        faqs: [
          {
            question: '¿Cuánto antes se paga la hipoteca con 100 $ al mes?',
            answer: `Con 100 $ extra al mes el préstamo se liquida en unos ${termParts(r.payoffMonths).y} años y ${termParts(r.payoffMonths).m} meses en lugar de 30 años — unos ${r.monthsSaved} meses antes.`
          },
          {
            question: '¿Cuánto interés se ahorra?',
            answer: `Ahorras unos ${money(r.interestSaved, 'es-ES')} en intereses — un rendimiento sólido por solo 100 $ al mes destinados al capital.`
          },
          {
            question: '¿Cambia mi pago mensual?',
            answer:
              'No — el pago programado sigue igual; los 100 $ extra se aplican al capital cada mes, así que simplemente terminas meses antes y debes mucho menos interés en total.'
          }
        ]
      },
      zh: {
        title: '每月多还 100 美元，提前还清房贷',
        description:
          '提前还款策略：32 万美元贷款、7% 利率、30 年期限，每月额外 100 美元直接冲抵本金。一个预填好的房贷计算器场景。',
        summaryIntro: '最小的习惯带来最大的回报——每月 100 美元如何改变还清日期与利息账单。',
        faqs: [
          {
            question: '每月多还 100 美元能提前多久还清？',
            answer: `每月额外 100 美元，贷款约 ${termParts(r.payoffMonths).y} 年 ${termParts(r.payoffMonths).m} 个月即可还清，而不是 30 年——提前约 ${r.monthsSaved} 个月。`
          },
          {
            question: '能省多少利息？',
            answer: `你大约节省 ${money(r.interestSaved, 'zh-CN')} 的利息——每月仅 100 美元冲抵本金，回报可观。`
          },
          {
            question: '月供会变吗？',
            answer:
              '不会——计划月供保持不变；每月额外 100 美元直接用于本金，因此只是提前几个月结束还款，总利息大幅减少。'
          }
        ]
      }
    })
  ),

  buildPreset(
    '700k-house-10-percent-down',
    { homePrice: 700000, downPayment: 70000, loanTermYears: 30, annualRate: 7.5, extraMonthly: 0 },
    (r) => ({
      en: {
        title: '$700K House with 10% Down',
        description:
          'A low down-payment scenario: a $700,000 home with a 10% ($70,000) down payment, leaving a $630,000 loan at 7.5% for 30 years. A pre-filled mortgage calculator scenario.',
        summaryIntro: 'What a smaller down payment means for your monthly bill — and the interest you carry.',
        faqs: [
          {
            question: 'What is the monthly payment with only 10% down?',
            answer: `With a $70,000 down payment the loan is $630,000, so principal & interest is about ${money(r.monthlyPayment, 'en-US')} a month at 7.5% for 30 years.`
          },
          {
            question: 'How much interest comes with a small down payment?',
            answer: `A 10% down payment means a bigger loan and usually mortgage insurance; here lifetime interest reaches about ${money(r.totalInterest, 'en-US')}, so the total loan cost is ${money(r.totalCost, 'en-US')}.`
          },
          {
            question: 'Why model a 10% down payment?',
            answer:
              'It reflects how many first-time buyers actually finance — the preset shows the real cost of getting in sooner with less cash upfront.'
          }
        ]
      },
      de: {
        title: '700.000 $-Haus mit 10 % Anzahlung',
        description:
          'Ein Szenario mit niedriger Anzahlung: ein Haus für 700.000 $ mit 10 % (70.000 $) Anzahlung, restliches Darlehen von 630.000 $ zu 7,5 % über 30 Jahre. Ein voreingestelltes Szenario des Hypothekenrechners.',
        summaryIntro: 'Was eine kleinere Anzahlung für Monatsrate und Zinslast bedeutet.',
        faqs: [
          {
            question: 'Wie hoch ist die Monatsrate bei nur 10 % Anzahlung?',
            answer: `Mit 70.000 $ Anzahlung beträgt das Darlehen 630.000 $, die Tilgungs- und Zinsrate liegt also bei etwa ${money(r.monthlyPayment, 'de-DE')} pro Monat bei 7,5 % über 30 Jahre.`
          },
          {
            question: 'Wie viel Zinsen entstehen bei kleiner Anzahlung?',
            answer: `10 % Anzahlung bedeuten ein größeres Darlehen und meist eine Hypothekenversicherung; hier erreichen die Gesamtzinsen etwa ${money(r.totalInterest, 'de-DE')}, die Gesamtkosten also ${money(r.totalCost, 'de-DE')}.`
          },
          {
            question: 'Warum ein Szenario mit 10 % Anzahlung?',
            answer:
              'Es spiegelt wider, wie viele Erstkäufer tatsächlich finanzieren — das Preset zeigt die echten Kosten, früher mit weniger Eigenkapital einzusteigen.'
          }
        ]
      },
      es: {
        title: 'Casa de 700.000 $ con 10 % de entrada',
        description:
          'Un escenario de entrada reducida: una casa de 700.000 $ con un 10 % (70.000 $) de entrada, dejando un préstamo de 630.000 $ al 7,5 % durante 30 años. Un escenario preconfigurado de la calculadora de hipoteca.',
        summaryIntro: 'Lo que una entrada menor significa para tu factura mensual — y los intereses que arrastras.',
        faqs: [
          {
            question: '¿Cuál es el pago mensual con solo un 10 % de entrada?',
            answer: `Con 70.000 $ de entrada el préstamo es de 630.000 $, así que capital e intereses rondan los ${money(r.monthlyPayment, 'es-ES')} al mes al 7,5 % durante 30 años.`
          },
          {
            question: '¿Cuánto interés conlleva una entrada pequeña?',
            answer: `Un 10 % de entrada implica un préstamo mayor y normalmente seguro hipotecario; aquí el interés de por vida alcanza unos ${money(r.totalInterest, 'es-ES')}, con un coste total de ${money(r.totalCost, 'es-ES')}.`
          },
          {
            question: '¿Por qué modelar un 10 % de entrada?',
            answer:
              'Refleja cómo financian muchos compradores de primera vivienda: el preset muestra el coste real de entrar antes con menos efectivo inicial.'
          }
        ]
      },
      zh: {
        title: '70 万美元房子，10% 首付',
        description:
          '低首付场景：一套 70 万美元的房子，首付 10%（7 万美元），剩余 63 万美元贷款按 7.5% 贷 30 年。一个预填好的房贷计算器场景。',
        summaryIntro: '更低首付意味着怎样的月供——以及你要背负的利息。',
        faqs: [
          {
            question: '只有 10% 首付时月供是多少？',
            answer: `首付 7 万美元后贷款为 63 万美元，7.5% 贷 30 年的本金与利息月供约 ${money(r.monthlyPayment, 'zh-CN')}。`
          },
          {
            question: '低首付要承担多少利息？',
            answer: `10% 首付意味着更大的贷款和通常的抵押保险；这里终身利息达到约 ${money(r.totalInterest, 'zh-CN')}，贷款总成本为 ${money(r.totalCost, 'zh-CN')}。`
          },
          {
            question: '为什么要模拟 10% 首付？',
            answer:
              '这反映了许多首次购房者的真实融资方式——预设展示用更少现金尽早入场的真实成本。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'mortgage-amortization-first-5-years',
    { homePrice: 350000, downPayment: 70000, loanTermYears: 30, annualRate: 6.5, extraMonthly: 0 },
    (r) => {
      const first5 = r.series.slice(0, 5).reduce((a, p) => ({ interest: a.interest + p.interest, principal: a.principal + p.principal }), { interest: 0, principal: 0 });
      return {
        en: {
          title: 'Mortgage Amortization: What the First 5 Years Look Like',
          description:
            'Why the early years feel like all interest: a $280,000 loan at 6.5% for 30 years and how the amortization schedule splits payments in the first 5 years. A pre-filled mortgage calculator scenario.',
          summaryIntro: 'The front-loaded reality of mortgage interest — how little principal you build at first.',
          faqs: [
            {
              question: 'How much interest do I pay in the first 5 years?',
              answer: `In the first five years about ${money(first5.interest, 'en-US')} of your payments goes to interest versus ${money(first5.principal, 'en-US')} to principal — that is the front-loaded nature of amortization.`
            },
            {
              question: 'When does principal finally overtake interest?',
              answer: `Around year ${r.series.findIndex((p) => p.principal > p.interest) + 1} of a 30-year term, the split flips and you finally build equity faster than you pay interest.`
            },
            {
              question: 'How do I see this in the calculator?',
              answer:
                'Open the preset and scroll to the amortization table — every year shows the principal/interest split, and the chart makes the shift visible at a glance.'
            }
          ]
        },
        de: {
          title: 'Hypotheken-Tilgung: die ersten 5 Jahre im Blick',
          description:
            'Warum sich die frühen Jahre nach lauter Zinsen anfühlen: ein Darlehen von 280.000 $ zu 6,5 % über 30 Jahre und wie der Tilgungsplan die Raten in den ersten 5 Jahren aufteilt. Ein voreingestelltes Szenario des Hypothekenrechners.',
          summaryIntro: 'Die zinslastige Realität der Hypothek — wie wenig Kapital du anfangs aufbaust.',
          faqs: [
            {
              question: 'Wie viel Zinsen zahle ich in den ersten 5 Jahren?',
              answer: `In den ersten fünf Jahren fließen etwa ${money(first5.interest, 'de-DE')} deiner Zahlungen in Zinsen gegenüber ${money(first5.principal, 'de-DE')} ins Kapital — die Front-Loading-Natur der Tilgung.`
            },
            {
              question: 'Wann überholt das Kapital endlich die Zinsen?',
              answer: `Etwa im Jahr ${r.series.findIndex((p) => p.principal > p.interest) + 1} eines 30-jährigen Darlehens kippt die Aufteilung — du baust dann schneller Eigenkapital auf, als du Zinsen zahlst.`
            },
            {
              question: 'Wie sehe ich das im Rechner?',
              answer:
                'Öffne das Preset und scrolle zur Tilgungstabelle — jedes Jahr zeigt die Kapital-/Zins-Aufteilung, und die Grafik macht die Verschiebung auf einen Blick sichtbar.'
            }
          ]
        },
        es: {
          title: 'Amortización hipotecaria: qué pasa en los primeros 5 años',
          description:
            'Por qué los primeros años parecen todo intereses: un préstamo de 280.000 $ al 6,5 % durante 30 años y cómo reparte el calendario de amortización los pagos en los primeros 5 años. Un escenario preconfigurado de la calculadora de hipoteca.',
          summaryIntro: 'La realidad inicial de los intereses hipotecarios — el poco capital que construyes al principio.',
          faqs: [
            {
              question: '¿Cuánto interés pago en los primeros 5 años?',
              answer: `En los primeros cinco años unos ${money(first5.interest, 'es-ES')} de tus pagos van a intereses frente a ${money(first5.principal, 'es-ES')} a capital — la naturaleza inicial de la amortización.`
            },
            {
              question: '¿Cuándo supera el capital a los intereses?',
              answer: `Hacia el año ${r.series.findIndex((p) => p.principal > p.interest) + 1} de un plazo de 30 años la balanza se invierte y construyes patrimonio más rápido de lo que pagas intereses.`
            },
            {
              question: '¿Cómo lo veo en la calculadora?',
              answer:
                'Abre el preset y baja a la tabla de amortización — cada año muestra el reparto capital/interés, y la gráfica hace visible el cambio de un vistazo.'
            }
          ]
        },
        zh: {
          title: '房贷摊销：前 5 年长什么样',
          description:
            '为什么早期还款几乎全是利息：一笔 28 万美元、6.5%、30 年的贷款，看摊销表在前 5 年如何分配还款。一个预填好的房贷计算器场景。',
          summaryIntro: '房贷利息前置的现实——起初你积累的本金少得可怜。',
          faqs: [
            {
              question: '前 5 年要还多少利息？',
              answer: `前五年你的还款中约有 ${money(first5.interest, 'zh-CN')} 用于利息，只有 ${money(first5.principal, 'zh-CN')} 用于本金——这就是摊销的前置特性。`
            },
            {
              question: '本金什么时候才超过利息？',
              answer: `30 年期限大约在第 ${r.series.findIndex((p) => p.principal > p.interest) + 1} 年，分配翻转——那时你积累资产的速度终于超过支付利息的速度。`
            },
            {
              question: '在计算器里怎么看？',
              answer:
                '打开预设并滚动到摊销明细表——每年都显示本金/利息拆分，图表让这种转变一目了然。'
            }
          ]
        }
      };
    }
  ),

  buildPreset(
    '1-million-luxury-home-mortgage',
    { homePrice: 1000000, downPayment: 200000, loanTermYears: 30, annualRate: 6.8, extraMonthly: 0 },
    (r) => ({
      en: {
        title: '$1 Million Home Mortgage',
        description:
          'A high-value property scenario: a $1,000,000 home with a 20% ($200,000) down payment, leaving an $800,000 loan at 6.8% for 30 years. A pre-filled mortgage calculator scenario.',
        summaryIntro: 'What a seven-figure purchase really costs per month — and over the life of the loan.',
        faqs: [
          {
            question: 'What is the monthly payment on a $1 million home?',
            answer: `With $200,000 down the loan is $800,000, so principal & interest comes to about ${money(r.monthlyPayment, 'en-US')} a month at 6.8% for 30 years.`
          },
          {
            question: 'How much interest does a $1M mortgage generate?',
            answer: `Over 30 years you pay roughly ${money(r.totalInterest, 'en-US')} in interest, bringing the total cost of the loan to ${money(r.totalCost, 'en-US')}.`
          },
          {
            question: 'Should I put more than 20% down?',
            answer:
              'The preset starts at 20%, but increasing the down payment lowers the payment and total interest immediately — try $250,000 or $300,000 and watch both numbers drop.'
          }
        ]
      },
      de: {
        title: '1-Millionen-$-Haus Hypothek',
        description:
          'Ein Szenario für hochpreisige Immobilien: ein Haus für 1.000.000 $ mit 20 % (200.000 $) Anzahlung, restliches Darlehen von 800.000 $ zu 6,8 % über 30 Jahre. Ein voreingestelltes Szenario des Hypothekenrechners.',
        summaryIntro: 'Was ein siebenstelliger Kauf monatlich kostet — und über die Laufzeit.',
        faqs: [
          {
            question: 'Wie hoch ist die Monatsrate bei einem 1-Millionen-$-Haus?',
            answer: `Mit 200.000 $ Anzahlung beträgt das Darlehen 800.000 $, die Tilgungs- und Zinsrate liegt also bei etwa ${money(r.monthlyPayment, 'de-DE')} pro Monat bei 6,8 % über 30 Jahre.`
          },
          {
            question: 'Wie viel Zinsen erzeugt eine 1-Millionen-$-Hypothek?',
            answer: `Über 30 Jahre zahlst du rund ${money(r.totalInterest, 'de-DE')} Zinsen, die Gesamtkosten des Darlehens steigen auf ${money(r.totalCost, 'de-DE')}.`
          },
          {
            question: 'Sollte ich mehr als 20 % anzahlen?',
            answer:
              'Das Preset startet bei 20 %, aber eine höhere Anzahlung senkt Rate und Gesamtzinsen sofort — versuche 250.000 $ oder 300.000 $ und beobachte, wie beide Zahlen fallen.'
          }
        ]
      },
      es: {
        title: 'Hipoteca para una casa de 1 millón de $',
        description:
          'Un escenario de propiedad de alto valor: una casa de 1.000.000 $ con un 20 % (200.000 $) de entrada, dejando un préstamo de 800.000 $ al 6,8 % durante 30 años. Un escenario preconfigurado de la calculadora de hipoteca.',
        summaryIntro: 'Lo que cuesta realmente al mes una compra de siete cifras — y durante toda la vida del préstamo.',
        faqs: [
          {
            question: '¿Cuál es el pago mensual de una casa de 1 millón de $?',
            answer: `Con 200.000 $ de entrada el préstamo es de 800.000 $, así que capital e intereses rondan los ${money(r.monthlyPayment, 'es-ES')} al mes al 6,8 % durante 30 años.`
          },
          {
            question: '¿Cuánto interés genera una hipoteca de 1 M$?',
            answer: `En 30 años pagas unos ${money(r.totalInterest, 'es-ES')} de intereses, con un coste total del préstamo de ${money(r.totalCost, 'es-ES')}.`
          },
          {
            question: '¿Debería aportar más del 20 %?',
            answer:
              'El preset empieza con un 20 %, pero aumentar la entrada baja el pago y el interés total al instante — prueba con 250.000 $ o 300.000 $ y observa cómo caen ambas cifras.'
          }
        ]
      },
      zh: {
        title: '100 万美元豪宅房贷',
        description:
          '高价值房产场景：一套 100 万美元的房子，首付 20%（20 万美元），剩余 80 万美元贷款按 6.8% 贷 30 年。一个预填好的房贷计算器场景。',
        summaryIntro: '七位数购房每月真实花费多少——以及整个贷款期的总成本。',
        faqs: [
          {
            question: '100 万美元房子的月供是多少？',
            answer: `首付 20 万美元后贷款为 80 万美元，6.8% 贷 30 年的本金与利息月供约 ${money(r.monthlyPayment, 'zh-CN')}。`
          },
          {
            question: '100 万美元的房贷会产生多少利息？',
            answer: `30 年大约支付 ${money(r.totalInterest, 'zh-CN')} 的利息，贷款总成本达到 ${money(r.totalCost, 'zh-CN')}。`
          },
          {
            question: '首付要多于 20% 吗？',
            answer:
              '预设从 20% 起步，但提高首付会立即降低月供与总利息——试试 25 万或 30 万美元，看两个数字同步下降。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'rental-property-mortgage-calculator',
    { homePrice: 300000, downPayment: 60000, loanTermYears: 30, annualRate: 7.25, extraMonthly: 0 },
    (r) => ({
      en: {
        title: 'Rental Property Mortgage Calculator',
        description:
          'An investor setup: a $300,000 rental property with 20% down ($60,000), leaving a $240,000 loan at 7.25% for 30 years. A pre-filled mortgage calculator scenario for real estate investors.',
        summaryIntro: 'Know your financing before you quote cash flow — the mortgage number every rental deal starts from.',
        faqs: [
          {
            question: 'What is the mortgage payment on a $300,000 rental property?',
            answer: `With $60,000 down the loan is $240,000, so the principal & interest payment is about ${money(r.monthlyPayment, 'en-US')} a month at 7.25% for 30 years.`
          },
          {
            question: 'How does this fit into rental cash flow?',
            answer: `Before taxes, insurance and maintenance, the mortgage alone costs ${money(r.monthlyPayment, 'en-US')} a month — deduct it from expected rent to see whether the deal cash-flows.`
          },
          {
            question: 'Why model 20% down for a rental?',
            answer:
              'Most landlords need at least 20% equity to qualify for conventional financing; this preset starts there and lets you stress-test price, rate and extra payments.'
          }
        ]
      },
      de: {
        title: 'Hypothekenrechner für Mietobjekte',
        description:
          'Ein Investor-Setup: ein Mietobjekt für 300.000 $ mit 20 % Anzahlung (60.000 $), restliches Darlehen von 240.000 $ zu 7,25 % über 30 Jahre. Ein voreingestelltes Szenario des Hypothekenrechners für Immobilieninvestoren.',
        summaryIntro: 'Kennt eure Finanzierung, bevor ihr Cashflow nennt — die Hypothekenzahl, mit der jedes Mietdeal beginnt.',
        faqs: [
          {
            question: 'Wie hoch ist die Hypothekenrate bei einem Mietobjekt für 300.000 $?',
            answer: `Mit 60.000 $ Anzahlung beträgt das Darlehen 240.000 $, die Tilgungs- und Zinsrate liegt also bei etwa ${money(r.monthlyPayment, 'de-DE')} pro Monat bei 7,25 % über 30 Jahre.`
          },
          {
            question: 'Wie passt das in den Miet-Cashflow?',
            answer: `Vor Steuern, Versicherung und Instandhaltung kostet allein die Hypothek ${money(r.monthlyPayment, 'de-DE')} pro Monat — ziehe sie von der erwarteten Miete ab, um zu sehen, ob der Deal trägt.`
          },
          {
            question: 'Warum 20 % Anzahlung bei einem Mietobjekt?',
            answer:
              'Die meisten Vermieter brauchen mindestens 20 % Eigenkapital für eine konventionelle Finanzierung; dieses Preset startet dort und lässt Preis, Zinssatz und Sonderzahlungen durchspielen.'
          }
        ]
      },
      es: {
        title: 'Calculadora de hipoteca para propiedad en alquiler',
        description:
          'Un escenario de inversor: una propiedad de alquiler de 300.000 $ con un 20 % (60.000 $) de entrada, dejando un préstamo de 240.000 $ al 7,25 % durante 30 años. Un escenario preconfigurado de la calculadora de hipoteca para inversores inmobiliarios.',
        summaryIntro: 'Conoce tu financiación antes de hablar de cash flow — la cifra hipotecaria con la que empieza todo alquiler.',
        faqs: [
          {
            question: '¿Cuál es el pago hipotecario de una propiedad de alquiler de 300.000 $?',
            answer: `Con 60.000 $ de entrada el préstamo es de 240.000 $, así que capital e intereses rondan los ${money(r.monthlyPayment, 'es-ES')} al mes al 7,25 % durante 30 años.`
          },
          {
            question: '¿Cómo encaja esto en el cash flow del alquiler?',
            answer: `Antes de impuestos, seguros y mantenimiento, solo la hipoteca cuesta ${money(r.monthlyPayment, 'es-ES')} al mes — réstalo del alquiler esperado para ver si el trato genera flujo.`
          },
          {
            question: '¿Por qué modelar un 20 % de entrada para un alquiler?',
            answer:
              'La mayoría de los propietarios necesitan al menos un 20 % de patrimonio para optar a financiación convencional; este preset parte de ahí y permite probar precio, tipo y pagos extra.'
          }
        ]
      },
      zh: {
        title: '出租房房贷计算器',
        description:
          '投资者场景：一套 30 万美元的出租房，首付 20%（6 万美元），剩余 24 万美元贷款按 7.25% 贷 30 年。一个为房产投资者预填好的房贷计算器场景。',
        summaryIntro: '报价现金流之前先弄清融资——每一笔出租生意都从房贷数字开始。',
        faqs: [
          {
            question: '30 万美元出租房的房贷月供是多少？',
            answer: `首付 6 万美元后贷款为 24 万美元，7.25% 贷 30 年的本金与利息月供约 ${money(r.monthlyPayment, 'zh-CN')}。`
          },
          {
            question: '这如何影响出租现金流？',
            answer: `在税费、保险与维护之前，仅房贷每月就需 ${money(r.monthlyPayment, 'zh-CN')}——从预期租金中扣除，即可判断这笔生意是否产生正现金流。`
          },
          {
            question: '为什么出租房按 20% 首付建模？',
            answer:
              '大多数房东至少需要 20% 的净值才能获得常规融资；本预设以此为起点，并支持对价格、利率与额外还款进行压力测试。'
          }
        ]
      }
    })
  )
];

export const PRESET_SLUGS = PRESETS.map((p) => p.slug);

export function getPreset(scenario: string): MortgagePreset | undefined {
  return PRESETS.find((p) => p.slug === scenario);
}

/**
 * Build the URL-query seed from a MortgageInput preset, mirroring MORTGAGE_URL_KEY in
 * MortgageCalculatorClient. Defaults are omitted so a clean share link only carries
 * the values the preset actually set.
 */
export function mortgageInitialQuery(preset: MortgagePreset): Record<string, string> {
  const map: Partial<Record<keyof MortgageInput, string>> = {
    homePrice: 'price',
    downPayment: 'down',
    loanTermYears: 'years',
    annualRate: 'rate',
    extraMonthly: 'extra'
  };
  const q: Record<string, string> = {};
  for (const [key, urlKey] of Object.entries(map) as [keyof MortgageInput, string][]) {
    const v = preset.defaultParams[key];
    if (v !== undefined) q[urlKey] = String(v);
  }
  return q;
}
