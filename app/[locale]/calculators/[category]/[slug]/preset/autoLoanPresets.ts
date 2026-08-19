/**
 * Auto Loan pSEO Preset Matrix / 汽车贷款计算器程序化 SEO 预设矩阵
 * ----------------------------------------------------------------------------
 * Seed scenarios for the Auto Loan & Payment calculator.
 * Each preset is a fully described, pre-filled landing page, with localized
 * title, meta description, scenario summary and a scenario-specific FAQ.
 *
 * The numbers embedded in the copy are computed from the live engine
 * (calculateAutoLoan) so the FAQ prose always matches the rendered benchmark.
 */

import { calculateAutoLoan, type AutoLoanInput } from '@/lib/calculators/finance/auto-loan';
import type { Locale } from '@/config/i18n.config';
import type { FaqEntry } from '@/lib/seo/schema';

export const AUTOLOAN_CATEGORY = 'finance';
export const AUTOLOAN_SLUG = 'auto-loan-calculator';

/** Locale-independent route for a scenario page. */
export function presetRoute(scenario: string) {
  return `/calculators/${AUTOLOAN_CATEGORY}/${AUTOLOAN_SLUG}/preset/${scenario}`;
}

interface LocalizedPreset {
  title: string;
  description: string;
  summaryIntro: string;
  faqs: FaqEntry[];
}

export interface AutoLoanPreset {
  slug: string;
  /** Resolved metric input state passed straight to the client (no CLS on first paint). */
  defaultParams: AutoLoanInput;
  localized: Record<Locale, LocalizedPreset>;
}

type Result = ReturnType<typeof calculateAutoLoan>;

/** Whole-dollar locale formatting for preset copy. */
function money(v: number, locale: string) {
  return `$${Math.round(v).toLocaleString(locale)}`;
}

function buildPreset(
  slug: string,
  defaultParams: AutoLoanInput,
  localized: (r: Result) => Record<Locale, LocalizedPreset>
): AutoLoanPreset {
  return { slug, defaultParams, localized: localized(calculateAutoLoan(defaultParams)) };
}

export const PRESETS: AutoLoanPreset[] = [
  buildPreset(
    '30k-car-loan-5-year-6-percent',
    { vehiclePrice: 30000, downPayment: 3000, tradeInValue: 0, salesTaxPct: 7, termMonths: 60, annualRate: 6 },
    (r) => ({
      en: {
        title: '$30K Car Loan — 5 Years at 6%',
        description:
          'The standard new-car benchmark: a $30,000 vehicle with $3,000 down, 7% sales tax and a 60-month loan at 6%. A pre-filled auto loan calculator scenario.',
        summaryIntro: 'The most typical new-car setup — what a 5-year loan really costs per month and in total.',
        faqs: [
          {
            question: 'What is the monthly payment on a $30,000 car loan?',
            answer: `After tax and your $3,000 down payment the loan is about ${money(r.loanAmount, 'en-US')}, so the monthly payment lands at roughly ${money(r.monthlyPayment, 'en-US')} over 60 months at 6%.`
          },
          {
            question: 'How much interest do I pay over 5 years?',
            answer: `The 60-month term costs about ${money(r.totalInterest, 'en-US')} in interest, bringing your total vehicle cost to ${money(r.totalVehicleCost, 'en-US')}.`
          },
          {
            question: 'Why use this preset?',
            answer:
              'It is a realistic baseline — change the price, term or rate and the payment, interest and schedule recalculate instantly.'
          }
        ]
      },
      de: {
        title: '30.000-$-Autokredit — 5 Jahre bei 6 %',
        description:
          'Der Standard-Benchmark für Neuwagen: ein Fahrzeug für 30.000 $ mit 3.000 $ Anzahlung, 7 % Umsatzsteuer und einem 60-Monats-Darlehen zu 6 %. Ein voreingestelltes Szenario des Autokredit-Rechners.',
        summaryIntro: 'Das typischste Neuwagen-Setup — was ein 5-Jahres-Darlehen monatlich und insgesamt wirklich kostet.',
        faqs: [
          {
            question: 'Wie hoch ist die Monatsrate bei einem 30.000-$-Autokredit?',
            answer: `Nach Steuer und 3.000 $ Anzahlung beträgt das Darlehen etwa ${money(r.loanAmount, 'de-DE')}, die Monatsrate liegt also bei rund ${money(r.monthlyPayment, 'de-DE')} über 60 Monate zu 6 %.`
          },
          {
            question: 'Wie viel Zinsen zahle ich in 5 Jahren?',
            answer: `Die 60-Monats-Laufzeit kostet etwa ${money(r.totalInterest, 'de-DE')} Zinsen, die Gesamtkosten des Fahrzeugs steigen auf ${money(r.totalVehicleCost, 'de-DE')}.`
          },
          {
            question: 'Warum dieses Preset nutzen?',
            answer:
              'Es ist eine realistische Baseline — Preis, Laufzeit oder Zinssatz ändern und Rate, Zinsen und Tilgungsplan aktualisieren sich sofort.'
          }
        ]
      },
      es: {
        title: 'Préstamo de auto de 30.000 $ — 5 años al 6 %',
        description:
          'La referencia estándar de coche nuevo: un vehículo de 30.000 $ con 3.000 $ de entrada, 7 % de impuesto sobre ventas y un préstamo a 60 meses al 6 %. Un escenario preconfigurado de la calculadora de préstamo de auto.',
        summaryIntro: 'La configuración de coche nuevo más típica — lo que cuesta realmente un préstamo a 5 años al mes y en total.',
        faqs: [
          {
            question: '¿Cuál es el pago mensual de un préstamo de coche de 30.000 $?',
            answer: `Tras impuestos y tu entrada de 3.000 $ el préstamo es de unos ${money(r.loanAmount, 'es-ES')}, así que el pago mensual ronda los ${money(r.monthlyPayment, 'es-ES')} durante 60 meses al 6 %.`
          },
          {
            question: '¿Cuánto interés pago en 5 años?',
            answer: `El plazo de 60 meses cuesta unos ${money(r.totalInterest, 'es-ES')} de intereses, con un coste total del vehículo de ${money(r.totalVehicleCost, 'es-ES')}.`
          },
          {
            question: '¿Por qué usar este preset?',
            answer:
              'Es una referencia realista — cambia precio, plazo o tipo y el pago, los intereses y el calendario se recalculan al instante.'
          }
        ]
      },
      zh: {
        title: '3 万美元车贷——5 年期、6% 利率',
        description:
          '标准新车基准：一辆 3 万美元的车，首付 3,000 美元，7% 销售税，60 个月贷款、6% 利率。一个预填好的汽车贷款计算器场景。',
        summaryIntro: '最典型的新车配置——看 5 年期贷款每月与总体的真实成本。',
        faqs: [
          {
            question: '3 万美元车贷的月供是多少？',
            answer: `加上税费并扣除 3,000 美元首付后，贷款约 ${money(r.loanAmount, 'zh-CN')}，60 个月、6% 利率下月供约 ${money(r.monthlyPayment, 'zh-CN')}。`
          },
          {
            question: '5 年要还多少利息？',
            answer: `60 个月期限的利息约 ${money(r.totalInterest, 'zh-CN')}，车辆总成本达到 ${money(r.totalVehicleCost, 'zh-CN')}。`
          },
          {
            question: '为什么用这个预设？',
            answer:
              '这是一个现实的基准——修改价格、期限或利率，月供、利息与明细都会即时重算。'
          }
        ]
      }
    })
  ),

  buildPreset(
    '60-month-vs-72-month-auto-loan',
    { vehiclePrice: 30000, downPayment: 3000, tradeInValue: 0, salesTaxPct: 7, termMonths: 72, annualRate: 6 },
    (r) => {
      const alt = calculateAutoLoan({ vehiclePrice: 30000, downPayment: 3000, tradeInValue: 0, salesTaxPct: 7, termMonths: 60, annualRate: 6 });
      return {
        en: {
          title: '60-Month vs 72-Month Auto Loan',
          description:
            'The payment-vs-interest trade-off on a $30,000 car with $3,000 down: a 72-month loan at 6% versus the same loan over 60 months. A pre-filled auto loan calculator scenario.',
          summaryIntro: 'Longer terms cut the monthly bill but inflate the interest — the classic car-loan dilemma, quantified.',
          faqs: [
            {
              question: 'How much lower is the 72-month payment?',
              answer: `The 72-month payment is about ${money(r.monthlyPayment, 'en-US')} versus ${money(alt.monthlyPayment, 'en-US')} on the 60-month loan — roughly ${money(alt.monthlyPayment - r.monthlyPayment, 'en-US')} less each month.`
            },
            {
              question: 'How much more interest does 72 months cost?',
              answer: `Total interest rises from about ${money(alt.totalInterest, 'en-US')} at 60 months to ${money(r.totalInterest, 'en-US')} at 72 — an extra ${money(r.totalInterest - alt.totalInterest, 'en-US')} just for stretching the term.`
            },
            {
              question: 'Which term should I choose?',
              answer:
                'Pick 72 months only if you need the lower payment; if you can afford it, 60 months saves thousands in interest. This preset compares both side by side.'
            }
          ]
        },
        de: {
          title: '60-Monats- vs. 72-Monats-Autokredit',
          description:
            'Der Zahlungs-gegen-Zinsen-Trade-off bei einem Auto für 30.000 $ mit 3.000 $ Anzahlung: ein 72-Monats-Darlehen zu 6 % gegenüber demselben Darlehen über 60 Monate. Ein voreingestelltes Szenario des Autokredit-Rechners.',
          summaryIntro: 'Längere Laufzeiten senken die Monatsrate, treiben aber die Zinsen — das klassische Autokredit-Dilemma, beziffert.',
          faqs: [
            {
              question: 'Wie viel niedriger ist die Rate bei 72 Monaten?',
              answer: `Die 72-Monats-Rate liegt bei etwa ${money(r.monthlyPayment, 'de-DE')} gegenüber ${money(alt.monthlyPayment, 'de-DE')} beim 60-Monats-Darlehen — rund ${money(alt.monthlyPayment - r.monthlyPayment, 'de-DE')} weniger pro Monat.`
            },
            {
              question: 'Wie viel mehr Zinsen kosten 72 Monate?',
              answer: `Die Gesamtzinsen steigen von etwa ${money(alt.totalInterest, 'de-DE')} bei 60 Monaten auf ${money(r.totalInterest, 'de-DE')} bei 72 — ein Aufpreis von ${money(r.totalInterest - alt.totalInterest, 'de-DE')} nur für die längere Laufzeit.`
            },
            {
              question: 'Welche Laufzeit sollte ich wählen?',
              answer:
                'Nimm 72 Monate nur, wenn du die niedrigere Rate brauchst; wer es sich leisten kann, spart mit 60 Monaten Tausende an Zinsen. Dieses Preset vergleicht beide direkt.'
            }
          ]
        },
        es: {
          title: 'Préstamo de auto a 60 meses frente a 72 meses',
          description:
            'El dilema pago-interés en un coche de 30.000 $ con 3.000 $ de entrada: un préstamo a 72 meses al 6 % frente al mismo a 60 meses. Un escenario preconfigurado de la calculadora de préstamo de auto.',
          summaryIntro: 'Los plazos largos reducen el pago mensual pero inflan los intereses — el dilema clásico, cuantificado.',
          faqs: [
            {
              question: '¿Cuánto menor es el pago a 72 meses?',
              answer: `El pago a 72 meses es de unos ${money(r.monthlyPayment, 'es-ES')} frente a ${money(alt.monthlyPayment, 'es-ES')} a 60 meses — unos ${money(alt.monthlyPayment - r.monthlyPayment, 'es-ES')} menos al mes.`
            },
            {
              question: '¿Cuánto interés adicional cuestan 72 meses?',
              answer: `El interés total sube de unos ${money(alt.totalInterest, 'es-ES')} a 60 meses a ${money(r.totalInterest, 'es-ES')} a 72 — un extra de ${money(r.totalInterest - alt.totalInterest, 'es-ES')} solo por alargar el plazo.`
            },
            {
              question: '¿Qué plazo debería elegir?',
              answer:
                'Elige 72 meses solo si necesitas el pago menor; si puedes permitírtelo, 60 meses ahorra miles en intereses. Este preset compara ambos.'
            }
          ]
        },
        zh: {
          title: '60 个月 vs 72 个月车贷',
          description:
            '3 万美元车、3,000 美元首付下的月供-利息权衡：72 个月 6% 贷款 vs 同样的贷款 60 个月。一个预填好的汽车贷款计算器场景。',
          summaryIntro: '更长期限降低月供却推高利息——经典车贷取舍，量化呈现。',
          faqs: [
            {
              question: '72 个月月供低多少？',
              answer: `72 个月月供约 ${money(r.monthlyPayment, 'zh-CN')}，60 个月约 ${money(alt.monthlyPayment, 'zh-CN')}——每月少付约 ${money(alt.monthlyPayment - r.monthlyPayment, 'zh-CN')}。`
            },
            {
              question: '72 个月要多付多少利息？',
              answer: `总利息从 60 个月的约 ${money(alt.totalInterest, 'zh-CN')} 升至 72 个月的 ${money(r.totalInterest, 'zh-CN')}——仅拉长期限就多付 ${money(r.totalInterest - alt.totalInterest, 'zh-CN')}。`
            },
            {
              question: '该选哪个期限？',
              answer:
                '只有需要更低月供时才选 72 个月；若能承受，60 个月可省数千美元利息。这个预设并排比较两者。'
            }
          ]
        }
      };
    }
  ),

  buildPreset(
    'used-car-loan-interest-rate-calculator',
    { vehiclePrice: 18000, downPayment: 2000, tradeInValue: 0, salesTaxPct: 7, termMonths: 60, annualRate: 9.5 },
    (r) => ({
      en: {
        title: 'Used Car Loan — Higher Interest Rate',
        description:
          'A realistic used-car benchmark: an $18,000 vehicle with $2,000 down at a 9.5% rate over 60 months. A pre-filled auto loan calculator scenario.',
        summaryIntro: 'Used-car financing usually costs more — see exactly what a higher rate adds to your payment and interest.',
        faqs: [
          {
            question: 'What is the monthly payment on a used car at 9.5%?',
            answer: `After tax and down payment the loan is about ${money(r.loanAmount, 'en-US')}, so the payment is roughly ${money(r.monthlyPayment, 'en-US')} a month over 60 months at 9.5%.`
          },
          {
            question: 'How much does the higher rate cost in interest?',
            answer: `At 9.5% you pay about ${money(r.totalInterest, 'en-US')} in interest over the term — a strong reason to shop rates before signing.`
          },
          {
            question: 'Why use this preset?',
            answer:
              'It shows the real cost of used-car money so you can compare a lower rate or a shorter term and see the savings immediately.'
          }
        ]
      },
      de: {
        title: 'Gebrauchtwagen-Darlehen — höherer Zinssatz',
        description:
          'Ein realistischer Gebrauchtwagen-Benchmark: ein Fahrzeug für 18.000 $ mit 2.000 $ Anzahlung zu 9,5 % über 60 Monate. Ein voreingestelltes Szenario des Autokredit-Rechners.',
        summaryIntro: 'Gebrauchtwagen-Finanzierung kostet meist mehr — sieh, was ein höherer Zinssatz zu Rate und Zinsen addiert.',
        faqs: [
          {
            question: 'Wie hoch ist die Monatsrate bei einem Gebrauchtwagen zu 9,5 %?',
            answer: `Nach Steuer und Anzahlung beträgt das Darlehen etwa ${money(r.loanAmount, 'de-DE')}, die Rate liegt also bei rund ${money(r.monthlyPayment, 'de-DE')} pro Monat über 60 Monate zu 9,5 %.`
          },
          {
            question: 'Was kostet der höhere Zinssatz an Zinsen?',
            answer: `Bei 9,5 % zahlst du über die Laufzeit etwa ${money(r.totalInterest, 'de-DE')} Zinsen — ein starkes Argument, vor der Unterschrift Zinssätze zu vergleichen.`
          },
          {
            question: 'Warum dieses Preset nutzen?',
            answer:
              'Es zeigt die realen Kosten von Gebrauchtwagen-Krediten, damit du einen niedrigeren Zinssatz oder eine kürzere Laufzeit vergleichen und die Ersparnis sofort sehen kannst.'
          }
        ]
      },
      es: {
        title: 'Préstamo de coche usado — tipo de interés alto',
        description:
          'Una referencia realista de coche usado: un vehículo de 18.000 $ con 2.000 $ de entrada a un 9,5 % durante 60 meses. Un escenario preconfigurado de la calculadora de préstamo de auto.',
        summaryIntro: 'Financiar un usado suele costar más — mira exactamente cuánto añade un tipo alto a tu pago y a tus intereses.',
        faqs: [
          {
            question: '¿Cuál es el pago mensual de un coche usado al 9,5 %?',
            answer: `Tras impuestos y entrada el préstamo es de unos ${money(r.loanAmount, 'es-ES')}, así que el pago ronda los ${money(r.monthlyPayment, 'es-ES')} al mes durante 60 meses al 9,5 %.`
          },
          {
            question: '¿Cuánto cuesta el tipo alto en intereses?',
            answer: `Al 9,5 % pagas unos ${money(r.totalInterest, 'es-ES')} de intereses durante el plazo — un motivo de peso para comparar tipos antes de firmar.`
          },
          {
            question: '¿Por qué usar este preset?',
            answer:
              'Muestra el coste real de financiar un usado para que compares un tipo menor o un plazo más corto y veas el ahorro al instante.'
          }
        ]
      },
      zh: {
        title: '二手车贷款——高利率场景',
        description:
          '现实的二手车基准：一辆 1.8 万美元的车，首付 2,000 美元，9.5% 利率贷 60 个月。一个预填好的汽车贷款计算器场景。',
        summaryIntro: '二手车融资通常更贵——看看高利率给月供与利息增加多少。',
        faqs: [
          {
            question: '9.5% 利率下二手车月供是多少？',
            answer: `加上税费并扣除首付后贷款约 ${money(r.loanAmount, 'zh-CN')}，60 个月、9.5% 利率下月供约 ${money(r.monthlyPayment, 'zh-CN')}。`
          },
          {
            question: '高利率要付出多少利息？',
            answer: `9.5% 下整个期限的利息约 ${money(r.totalInterest, 'zh-CN')}——签单前比价利率很有必要。`
          },
          {
            question: '为什么用这个预设？',
            answer:
              '它展示二手车资金的真实成本，让你对比更低利率或更短期限，并立即看到节省。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'zero-down-payment-auto-loan',
    { vehiclePrice: 25000, downPayment: 0, tradeInValue: 0, salesTaxPct: 7, termMonths: 72, annualRate: 7 },
    (r) => ({
      en: {
        title: 'Zero Down Payment Auto Loan — 100% Financing',
        description:
          'No money down: a $25,000 vehicle financed entirely, with tax, over 72 months at 7%. A pre-filled auto loan calculator scenario for 100% financing.',
        summaryIntro: 'Zero-down keeps cash in your pocket — but the entire price, plus tax, gets financed and compounded.',
        faqs: [
          {
            question: 'What is the payment with no down payment?',
            answer: `With $0 down the full ${money(r.loanAmount, 'en-US')} (including tax) is financed, so the payment is about ${money(r.monthlyPayment, 'en-US')} a month over 72 months.`
          },
          {
            question: 'How much interest does 100% financing cost?',
            answer: `Financing everything over 72 months at 7% adds about ${money(r.totalInterest, 'en-US')} in interest — the trade-off for keeping your cash.`
          },
          {
            question: 'Why model zero down?',
            answer:
              'It quantifies what "no money down" really means, so you can compare a small down payment and watch both the payment and interest drop.'
          }
        ]
      },
      de: {
        title: 'Autokredit ohne Anzahlung — 100 %-Finanzierung',
        description:
          'Keine Anzahlung: ein Fahrzeug für 25.000 $ wird komplett inklusive Steuer über 72 Monate zu 7 % finanziert. Ein voreingestelltes Szenario des Autokredit-Rechners für 100-%-Finanzierung.',
        summaryIntro: 'Ohne Anzahlung bleibt Geld in der Tasche — aber der volle Preis plus Steuer wird finanziert und verzinst.',
        faqs: [
          {
            question: 'Wie hoch ist die Rate ohne Anzahlung?',
            answer: `Mit 0 $ Anzahlung werden die vollen ${money(r.loanAmount, 'de-DE')} (inklusive Steuer) finanziert, die Rate liegt also bei etwa ${money(r.monthlyPayment, 'de-DE')} pro Monat über 72 Monate.`
          },
          {
            question: 'Was kostet die 100-%-Finanzierung an Zinsen?',
            answer: `Alles über 72 Monate zu 7 % zu finanzieren, addiert etwa ${money(r.totalInterest, 'de-DE')} Zinsen — der Preis dafür, dass das Geld in der Tasche bleibt.`
          },
          {
            question: 'Warum ohne Anzahlung modellieren?',
            answer:
              'Es beziffert, was "ohne Anzahlung" wirklich bedeutet, damit du eine kleine Anzahlung vergleichen und Rate sowie Zinsen fallen sehen kannst.'
          }
        ]
      },
      es: {
        title: 'Préstamo de auto sin entrada — financiación al 100 %',
        description:
          'Sin dinero de entrada: un vehículo de 25.000 $ financiado por completo, impuestos incluidos, durante 72 meses al 7 %. Un escenario preconfigurado de la calculadora de préstamo de auto para financiación al 100 %.',
        summaryIntro: 'Sin entrada mantienes efectivo en el bolsillo — pero se financia el precio completo, más impuestos, y se capitaliza.',
        faqs: [
          {
            question: '¿Cuál es el pago sin entrada?',
            answer: `Con 0 $ de entrada se financia el total de ${money(r.loanAmount, 'es-ES')} (impuestos incluidos), así que el pago es de unos ${money(r.monthlyPayment, 'es-ES')} al mes durante 72 meses.`
          },
          {
            question: '¿Cuánto interés cuesta la financiación al 100 %?',
            answer: `Financiar todo durante 72 meses al 7 % añade unos ${money(r.totalInterest, 'es-ES')} de intereses — la contrapartida de conservar tu efectivo.`
          },
          {
            question: '¿Por qué modelar sin entrada?',
            answer:
              'Cuantifica lo que significa realmente "sin dinero de entrada", para que compares una pequeña entrada y veas caer el pago y los intereses.'
          }
        ]
      },
      zh: {
        title: '零首付车贷——100% 全额融资',
        description:
          '零首付：一辆 2.5 万美元的车（含税）全额融资，72 个月、7% 利率。一个为 100% 融资预填好的汽车贷款计算器场景。',
        summaryIntro: '零首付让现金留在口袋里——但全部车价加税费都要融资并计息。',
        faqs: [
          {
            question: '零首付的月供是多少？',
            answer: `0 美元首付意味着全部 ${money(r.loanAmount, 'zh-CN')}（含税）都需融资，72 个月下月供约 ${money(r.monthlyPayment, 'zh-CN')}。`
          },
          {
            question: '100% 融资要付多少利息？',
            answer: `全额融资 72 个月、7% 利率，利息约 ${money(r.totalInterest, 'zh-CN')}——这是保留现金的代价。`
          },
          {
            question: '为什么要模拟零首付？',
            answer:
              '它量化"零首付"的真实含义，让你对比小额首付，看月供与利息同步下降。'
          }
        ]
      }
    })
  ),

  buildPreset(
    '50k-luxury-car-loan-payment',
    { vehiclePrice: 50000, downPayment: 10000, tradeInValue: 0, salesTaxPct: 8, termMonths: 60, annualRate: 6.5 },
    (r) => ({
      en: {
        title: '$50K Luxury Car Loan Payment',
        description:
          'A high-value purchase: a $50,000 vehicle with $10,000 down, 8% sales tax and a 60-month loan at 6.5%. A pre-filled auto loan calculator scenario.',
        summaryIntro: 'What a premium badge costs per month — and how much of it is interest.',
        faqs: [
          {
            question: 'What is the monthly payment on a $50,000 luxury car?',
            answer: `After tax and your $10,000 down payment the loan is about ${money(r.loanAmount, 'en-US')}, so the payment runs ${money(r.monthlyPayment, 'en-US')} a month over 60 months at 6.5%.`
          },
          {
            question: 'How much interest does a $50K loan generate?',
            answer: `Over 60 months you pay about ${money(r.totalInterest, 'en-US')} in interest, putting the total vehicle cost at ${money(r.totalVehicleCost, 'en-US')}.`
          },
          {
            question: 'Should I put more than $10,000 down?',
            answer:
              'A bigger down payment lowers both the payment and the interest immediately — try $15,000 or $20,000 and watch the numbers fall.'
          }
        ]
      },
      de: {
        title: '50.000-$-Luxusauto-Darlehen',
        description:
          'Ein hochpreisiger Kauf: ein Fahrzeug für 50.000 $ mit 10.000 $ Anzahlung, 8 % Umsatzsteuer und einem 60-Monats-Darlehen zu 6,5 %. Ein voreingestelltes Szenario des Autokredit-Rechners.',
        summaryIntro: 'Was eine Premiummarke monatlich kostet — und wie viel davon Zinsen sind.',
        faqs: [
          {
            question: 'Wie hoch ist die Monatsrate bei einem 50.000-$-Luxusauto?',
            answer: `Nach Steuer und 10.000 $ Anzahlung beträgt das Darlehen etwa ${money(r.loanAmount, 'de-DE')}, die Rate liegt bei ${money(r.monthlyPayment, 'de-DE')} pro Monat über 60 Monate zu 6,5 %.`
          },
          {
            question: 'Wie viel Zinsen erzeugt ein 50.000-$-Darlehen?',
            answer: `Über 60 Monate zahlst du etwa ${money(r.totalInterest, 'de-DE')} Zinsen, die Gesamtkosten des Fahrzeugs liegen bei ${money(r.totalVehicleCost, 'de-DE')}.`
          },
          {
            question: 'Sollte ich mehr als 10.000 $ anzahlen?',
            answer:
              'Eine höhere Anzahlung senkt Rate und Zinsen sofort — versuche 15.000 $ oder 20.000 $ und beobachte, wie die Zahlen fallen.'
          }
        ]
      },
      es: {
        title: 'Pago de préstamo de coche de lujo de 50.000 $',
        description:
          'Una compra de alto valor: un vehículo de 50.000 $ con 10.000 $ de entrada, 8 % de impuesto y un préstamo a 60 meses al 6,5 %. Un escenario preconfigurado de la calculadora de préstamo de auto.',
        summaryIntro: 'Lo que cuesta al mes una insignia premium — y cuánto de eso es interés.',
        faqs: [
          {
            question: '¿Cuál es el pago mensual de un coche de lujo de 50.000 $?',
            answer: `Tras impuestos y tu entrada de 10.000 $ el préstamo es de unos ${money(r.loanAmount, 'es-ES')}, así que el pago llega a ${money(r.monthlyPayment, 'es-ES')} al mes durante 60 meses al 6,5 %.`
          },
          {
            question: '¿Cuánto interés genera un préstamo de 50.000 $?',
            answer: `En 60 meses pagas unos ${money(r.totalInterest, 'es-ES')} de intereses, con un coste total del vehículo de ${money(r.totalVehicleCost, 'es-ES')}.`
          },
          {
            question: '¿Debería aportar más de 10.000 $?',
            answer:
              'Una entrada mayor baja el pago y los intereses al instante — prueba con 15.000 $ o 20.000 $ y observa caer las cifras.'
          }
        ]
      },
      zh: {
        title: '5 万美元豪车贷款月供',
        description:
          '高价值购买：一辆 5 万美元的车，首付 1 万美元，8% 销售税，60 个月贷款、6.5% 利率。一个预填好的汽车贷款计算器场景。',
        summaryIntro: '豪华品牌每月要花多少——其中又有多少是利息。',
        faqs: [
          {
            question: '5 万美元豪车的月供是多少？',
            answer: `加上税费并扣除 1 万美元首付后贷款约 ${money(r.loanAmount, 'zh-CN')}，60 个月、6.5% 利率下月供约 ${money(r.monthlyPayment, 'zh-CN')}。`
          },
          {
            question: '5 万美元贷款产生多少利息？',
            answer: `60 个月约支付 ${money(r.totalInterest, 'zh-CN')} 利息，车辆总成本达 ${money(r.totalVehicleCost, 'zh-CN')}。`
          },
          {
            question: '首付要多于 1 万美元吗？',
            answer:
              '更高首付会立即降低月供与利息——试试 1.5 万或 2 万美元，看数字同步下降。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'trade-in-value-car-loan-calculator',
    { vehiclePrice: 32000, downPayment: 2000, tradeInValue: 8000, salesTaxPct: 7, termMonths: 60, annualRate: 6 },
    (r) => ({
      en: {
        title: 'Trade-In Value Car Loan Calculator',
        description:
          'Equity from your old car: a $32,000 vehicle with $2,000 down and an $8,000 trade-in, financed over 60 months at 6%. A pre-filled auto loan calculator scenario.',
        summaryIntro: 'Trade-in credit cuts both the financed amount and the tax — the smartest discount at the dealership.',
        faqs: [
          {
            question: 'How much does a trade-in lower the loan?',
            answer: `An $8,000 trade-in reduces the loan to about ${money(r.loanAmount, 'en-US')} (it also lowers the taxable amount), cutting the payment to ${money(r.monthlyPayment, 'en-US')} a month.`
          },
          {
            question: 'Does a trade-in reduce sales tax?',
            answer: `Yes — in this model the tax is calculated on the price minus the trade-in, so the ${money(r.salesTax, 'en-US')} tax bill is smaller than it would be on the full price.`
          },
          {
            question: 'Why use this preset?',
            answer:
              'It shows the real value of your old car: try raising the trade-in and watch the loan, tax and payment all fall together.'
          }
        ]
      },
      de: {
        title: 'Inzahlungnahme-Rechner für Autokredite',
        description:
          'Eigenkapital aus dem alten Auto: ein Fahrzeug für 32.000 $ mit 2.000 $ Anzahlung und 8.000 $ Inzahlungnahme, finanziert über 60 Monate zu 6 %. Ein voreingestelltes Szenario des Autokredit-Rechners.',
        summaryIntro: 'Die Inzahlungnahme senkt sowohl Darlehen als auch Steuer — der klügste Rabatt beim Händler.',
        faqs: [
          {
            question: 'Wie stark senkt die Inzahlungnahme das Darlehen?',
            answer: `Eine Inzahlungnahme von 8.000 $ reduziert das Darlehen auf etwa ${money(r.loanAmount, 'de-DE')} (und den steuerpflichtigen Betrag), die Rate sinkt auf ${money(r.monthlyPayment, 'de-DE')} pro Monat.`
          },
          {
            question: 'Reduziert die Inzahlungnahme die Umsatzsteuer?',
            answer: `Ja — in diesem Modell wird die Steuer auf den Preis abzüglich Inzahlungnahme berechnet, die Steuer von ${money(r.salesTax, 'de-DE')} fällt also kleiner aus.`
          },
          {
            question: 'Warum dieses Preset nutzen?',
            answer:
              'Es zeigt den echten Wert deines alten Autos: erhöhe die Inzahlungnahme und sieh Darlehen, Steuer und Rate gemeinsam fallen.'
          }
        ]
      },
      es: {
        title: 'Calculadora de préstamo con valor de permuta',
        description:
          'Patrimonio de tu coche anterior: un vehículo de 32.000 $ con 2.000 $ de entrada y una permuta de 8.000 $, financiado durante 60 meses al 6 %. Un escenario preconfigurado de la calculadora de préstamo de auto.',
        summaryIntro: 'La permuta reduce tanto el importe financiado como el impuesto — el descuento más inteligente del concesionario.',
        faqs: [
          {
            question: '¿Cuánto reduce la permuta el préstamo?',
            answer: `Una permuta de 8.000 $ reduce el préstamo a unos ${money(r.loanAmount, 'es-ES')} (y también la base imponible), bajando el pago a ${money(r.monthlyPayment, 'es-ES')} al mes.`
          },
          {
            question: '¿La permuta reduce el impuesto sobre ventas?',
            answer: `Sí — en este modelo el impuesto se calcula sobre el precio menos la permuta, así que la factura de ${money(r.salesTax, 'es-ES')} es menor que sobre el precio completo.`
          },
          {
            question: '¿Por qué usar este preset?',
            answer:
              'Muestra el valor real de tu coche anterior: sube la permuta y observa caer préstamo, impuesto y pago a la vez.'
          }
        ]
      },
      zh: {
        title: '置换价值车贷计算器',
        description:
          '旧车换新车的净值：一辆 3.2 万美元的车，首付 2,000 美元，旧车置换价 8,000 美元，60 个月、6% 利率融资。一个预填好的汽车贷款计算器场景。',
        summaryIntro: '置换抵扣同时降低融资金额与税费——4S 店最聪明的折扣。',
        faqs: [
          {
            question: '置换能让贷款减少多少？',
            answer: `8,000 美元置换价把贷款降至约 ${money(r.loanAmount, 'zh-CN')}（同时降低税基），月供降至 ${money(r.monthlyPayment, 'zh-CN')}。`
          },
          {
            question: '置换能减少销售税吗？',
            answer: `可以——本模型中税费按车价减去置换价计算，${money(r.salesTax, 'zh-CN')} 的税额比按全价计算更少。`
          },
          {
            question: '为什么用这个预设？',
            answer:
              '它展示旧车的真实价值：调高置换价，贷款、税费与月供会一起下降。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'auto-loan-sales-tax-calculator',
    { vehiclePrice: 28000, downPayment: 3000, tradeInValue: 0, salesTaxPct: 9, termMonths: 60, annualRate: 6.5 },
    (r) => ({
      en: {
        title: 'Auto Loan Sales Tax Calculator',
        description:
          'A tax-inclusive scenario: a $28,000 vehicle with $3,000 down and 9% sales tax financed over 60 months at 6.5%. A pre-filled auto loan calculator scenario.',
        summaryIntro: 'Sales tax is often the hidden part of the price — see exactly what it adds to the loan and the payment.',
        faqs: [
          {
            question: 'How much sales tax gets financed?',
            answer: `At 9% the tax adds ${money(r.salesTax, 'en-US')} to the deal, taking the financed amount to about ${money(r.loanAmount, 'en-US')}.`
          },
          {
            question: 'What is the payment including tax?',
            answer: `With the tax rolled into the loan, the payment is about ${money(r.monthlyPayment, 'en-US')} a month over 60 months at 6.5%.`
          },
          {
            question: 'Why model the tax separately?',
            answer:
              'Many buyers forget the tax until the closing line — this preset makes the tax line visible and shows how much it costs with interest on top.'
          }
        ]
      },
      de: {
        title: 'Umsatzsteuer-Rechner für Autokredite',
        description:
          'Ein steuerinklusives Szenario: ein Fahrzeug für 28.000 $ mit 3.000 $ Anzahlung und 9 % Umsatzsteuer, finanziert über 60 Monate zu 6,5 %. Ein voreingestelltes Szenario des Autokredit-Rechners.',
        summaryIntro: 'Die Umsatzsteuer ist oft der versteckte Teil des Preises — sieh, was sie zu Darlehen und Rate addiert.',
        faqs: [
          {
            question: 'Wie viel Umsatzsteuer wird finanziert?',
            answer: `Bei 9 % addiert die Steuer ${money(r.salesTax, 'de-DE')} zum Geschäft und bringt den finanzierten Betrag auf etwa ${money(r.loanAmount, 'de-DE')}.`
          },
          {
            question: 'Wie hoch ist die Rate inklusive Steuer?',
            answer: `Mit in das Darlehen eingerechneter Steuer liegt die Rate bei etwa ${money(r.monthlyPayment, 'de-DE')} pro Monat über 60 Monate zu 6,5 %.`
          },
          {
            question: 'Warum die Steuer separat modellieren?',
            answer:
              'Viele Käufer vergessen die Steuer bis zur Schlussrechnung — dieses Preset macht die Steuerzeile sichtbar und zeigt, was sie inklusive Zinsen kostet.'
          }
        ]
      },
      es: {
        title: 'Calculadora de impuesto sobre ventas de auto',
        description:
          'Un escenario con impuestos incluidos: un vehículo de 28.000 $ con 3.000 $ de entrada y 9 % de impuesto, financiado durante 60 meses al 6,5 %. Un escenario preconfigurado de la calculadora de préstamo de auto.',
        summaryIntro: 'El impuesto suele ser la parte oculta del precio — mira exactamente cuánto añade al préstamo y al pago.',
        faqs: [
          {
            question: '¿Cuánto impuesto se financia?',
            answer: `Al 9 % el impuesto añade ${money(r.salesTax, 'es-ES')} al trato, elevando el importe financiado a unos ${money(r.loanAmount, 'es-ES')}.`
          },
          {
            question: '¿Cuál es el pago con impuestos incluidos?',
            answer: `Con el impuesto integrado en el préstamo, el pago es de unos ${money(r.monthlyPayment, 'es-ES')} al mes durante 60 meses al 6,5 %.`
          },
          {
            question: '¿Por qué modelar el impuesto por separado?',
            answer:
              'Muchos compradores olvidan el impuesto hasta la línea final — este preset lo hace visible y muestra cuánto cuesta con intereses encima.'
          }
        ]
      },
      zh: {
        title: '车贷销售税计算器',
        description:
          '含税场景：一辆 2.8 万美元的车，首付 3,000 美元，9% 销售税，60 个月、6.5% 利率融资。一个预填好的汽车贷款计算器场景。',
        summaryIntro: '销售税往往是价格中隐藏的部分——看它给贷款与月供增加多少。',
        faqs: [
          {
            question: '有多少销售税被计入融资？',
            answer: `9% 的税率让税费增加 ${money(r.salesTax, 'zh-CN')}，融资金额达到约 ${money(r.loanAmount, 'zh-CN')}。`
          },
          {
            question: '含税月供是多少？',
            answer: `税费计入贷款后，60 个月、6.5% 利率下月供约 ${money(r.monthlyPayment, 'zh-CN')}。`
          },
          {
            question: '为什么单独模拟税费？',
            answer:
              '许多买家直到结账才想起税——这个预设让税费一目了然，并显示叠加利息后的真实成本。'
          }
        ]
      }
    })
  ),

  buildPreset(
    '20k-budget-car-loan-payment',
    { vehiclePrice: 20000, downPayment: 2000, tradeInValue: 0, salesTaxPct: 6, termMonths: 48, annualRate: 5.5 },
    (r) => ({
      en: {
        title: '$20K Budget Car Loan Payment',
        description:
          'An affordable commuter setup: a $20,000 vehicle with $2,000 down, 6% sales tax and a 48-month loan at 5.5%. A pre-filled auto loan calculator scenario.',
        summaryIntro: 'A sensible, shorter-term plan for a budget-friendly car — lower interest, quicker payoff.',
        faqs: [
          {
            question: 'What is the monthly payment on a $20,000 car?',
            answer: `After tax and down payment the loan is about ${money(r.loanAmount, 'en-US')}, so the payment is roughly ${money(r.monthlyPayment, 'en-US')} a month over 48 months at 5.5%.`
          },
          {
            question: 'How much interest does a 48-month term cost?',
            answer: `The 48-month plan keeps interest to about ${money(r.totalInterest, 'en-US')}, keeping the total vehicle cost near ${money(r.totalVehicleCost, 'en-US')}.`
          },
          {
            question: 'Why use this preset?',
            answer:
              'It is the "keep it simple" car plan — short term, modest rate and a payment most budgets can absorb; tweak any input and it recalculates live.'
          }
        ]
      },
      de: {
        title: '20.000-$-Budget-Autokredit',
        description:
          'Ein erschwingliches Pendler-Setup: ein Fahrzeug für 20.000 $ mit 2.000 $ Anzahlung, 6 % Umsatzsteuer und einem 48-Monats-Darlehen zu 5,5 %. Ein voreingestelltes Szenario des Autokredit-Rechners.',
        summaryIntro: 'Ein vernünftiger, kürzerer Plan für ein preiswertes Auto — weniger Zinsen, schnellere Tilgung.',
        faqs: [
          {
            question: 'Wie hoch ist die Monatsrate bei einem 20.000-$-Auto?',
            answer: `Nach Steuer und Anzahlung beträgt das Darlehen etwa ${money(r.loanAmount, 'de-DE')}, die Rate liegt bei rund ${money(r.monthlyPayment, 'de-DE')} pro Monat über 48 Monate zu 5,5 %.`
          },
          {
            question: 'Was kostet eine 48-Monats-Laufzeit an Zinsen?',
            answer: `Der 48-Monats-Plan hält die Zinsen bei etwa ${money(r.totalInterest, 'de-DE')}, die Gesamtkosten bleiben nahe ${money(r.totalVehicleCost, 'de-DE')}.`
          },
          {
            question: 'Warum dieses Preset nutzen?',
            answer:
              'Es ist der "einfach halten"-Auto-Plan — kurze Laufzeit, moderater Zinssatz und eine Rate, die die meisten Budgets verkraften; jede Eingabe lässt sich ändern und neu berechnen.'
          }
        ]
      },
      es: {
        title: 'Préstamo de coche económico de 20.000 $',
        description:
          'Una configuración asequible para desplazamientos: un vehículo de 20.000 $ con 2.000 $ de entrada, 6 % de impuesto y un préstamo a 48 meses al 5,5 %. Un escenario preconfigurado de la calculadora de préstamo de auto.',
        summaryIntro: 'Un plan sensato y de plazo corto para un coche económico — menos intereses, liquidación más rápida.',
        faqs: [
          {
            question: '¿Cuál es el pago mensual de un coche de 20.000 $?',
            answer: `Tras impuestos y entrada el préstamo es de unos ${money(r.loanAmount, 'es-ES')}, así que el pago ronda los ${money(r.monthlyPayment, 'es-ES')} al mes durante 48 meses al 5,5 %.`
          },
          {
            question: '¿Cuánto interés cuesta un plazo de 48 meses?',
            answer: `El plan de 48 meses mantiene los intereses en unos ${money(r.totalInterest, 'es-ES')}, con un coste total cercano a ${money(r.totalVehicleCost, 'es-ES')}.`
          },
          {
            question: '¿Por qué usar este preset?',
            answer:
              'Es el plan de coche "sin complicaciones" — plazo corto, tipo moderado y un pago que la mayoría de presupuestos absorbe; cambia cualquier dato y se recalcula en vivo.'
          }
        ]
      },
      zh: {
        title: '2 万美元预算车贷',
        description:
          '经济型通勤配置：一辆 2 万美元的车，首付 2,000 美元，6% 销售税，48 个月贷款、5.5% 利率。一个预填好的汽车贷款计算器场景。',
        summaryIntro: '一辆实惠车的合理短期限方案——利息更低、还清更快。',
        faqs: [
          {
            question: '2 万美元车的月供是多少？',
            answer: `加上税费并扣除首付后贷款约 ${money(r.loanAmount, 'zh-CN')}，48 个月、5.5% 利率下月供约 ${money(r.monthlyPayment, 'zh-CN')}。`
          },
          {
            question: '48 个月期限要付多少利息？',
            answer: `48 个月方案把利息控制在约 ${money(r.totalInterest, 'zh-CN')}，车辆总成本接近 ${money(r.totalVehicleCost, 'zh-CN')}。`
          },
          {
            question: '为什么用这个预设？',
            answer:
              '这是"从简"的购车方案——短期限、温和利率、多数预算可承受的月供；改任意输入都会实时重算。'
          }
        ]
      }
    })
  )
];

export const PRESET_SLUGS = PRESETS.map((p) => p.slug);

export function getPreset(scenario: string): AutoLoanPreset | undefined {
  return PRESETS.find((p) => p.slug === scenario);
}

/**
 * Build the URL-query seed from an AutoLoanInput preset, mirroring AUTOLOAN_URL_KEY in
 * AutoLoanCalculatorClient. Defaults are omitted so a clean share link only carries
 * the values the preset actually set.
 */
export function autoLoanInitialQuery(preset: AutoLoanPreset): Record<string, string> {
  const q: Record<string, string> = {};
  const p = preset.defaultParams;
  if (p.vehiclePrice !== 30000) q.price = String(p.vehiclePrice);
  if (p.downPayment !== 3000) q.down = String(p.downPayment);
  if (p.tradeInValue !== 0) q.trade = String(p.tradeInValue);
  if (p.salesTaxPct !== 7) q.tax = String(p.salesTaxPct);
  if (p.termMonths !== 60) q.term = String(p.termMonths);
  if (p.annualRate !== 6) q.rate = String(p.annualRate);
  return q;
}
