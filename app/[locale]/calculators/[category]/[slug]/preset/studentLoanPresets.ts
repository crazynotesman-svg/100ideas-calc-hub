/**
 * Student Loan pSEO Preset Matrix / 助学贷款计算器程序化 SEO 预设矩阵
 * ----------------------------------------------------------------------------
 * Seed scenarios for the Student Loan & Repayment Plan calculator.
 * Each preset is a fully described, pre-filled landing page, with localized
 * title, meta description, scenario summary and a scenario-specific FAQ.
 *
 * The numbers embedded in the copy are computed from the live engine
 * (calculateStudentLoan) so the FAQ prose always matches the rendered benchmark.
 */

import { calculateStudentLoan, type StudentLoanInput } from '@/lib/calculators/finance/student-loan';
import type { Locale } from '@/config/i18n.config';
import type { FaqEntry } from '@/lib/seo/schema';

export const STUDENTLOAN_CATEGORY = 'finance';
export const STUDENTLOAN_SLUG = 'student-loan-calculator';

/** Locale-independent route for a scenario page. */
export function presetRoute(scenario: string) {
  return `/calculators/${STUDENTLOAN_CATEGORY}/${STUDENTLOAN_SLUG}/preset/${scenario}`;
}

interface LocalizedPreset {
  title: string;
  description: string;
  summaryIntro: string;
  faqs: FaqEntry[];
}

export interface StudentLoanPreset {
  slug: string;
  /** Resolved metric input state passed straight to the client (no CLS on first paint). */
  defaultParams: StudentLoanInput;
  localized: Record<Locale, LocalizedPreset>;
}

type Result = ReturnType<typeof calculateStudentLoan>;

/** Whole-dollar locale formatting for preset copy. */
function money(v: number, locale: string) {
  return `$${Math.round(v).toLocaleString(locale)}`;
}
function termParts(months: number) {
  return { y: Math.floor(months / 12), m: months % 12 };
}

function buildPreset(
  slug: string,
  defaultParams: StudentLoanInput,
  localized: (r: Result) => Record<Locale, LocalizedPreset>
): StudentLoanPreset {
  return { slug, defaultParams, localized: localized(calculateStudentLoan(defaultParams)) };
}

export const PRESETS: StudentLoanPreset[] = [
  buildPreset(
    '30k-10yr-6.5',
    { principal: 30000, annualRate: 6.5, termYears: 10, gracePeriodMonths: 0, extraMonthly: 0 },
    (r) => ({
      en: {
        title: '$30K Student Loan — 10 Years at 6.5%',
        description:
          'The standard federal-loan benchmark: $30,000 at 6.5% repaid over 10 years. A pre-filled student loan calculator scenario.',
        summaryIntro: 'The most common student debt setup — what a $30,000 loan costs per month and in total.',
        faqs: [
          {
            question: 'What is the monthly payment on a $30,000 student loan?',
            answer: `At 6.5% over 10 years the payment is about ${money(r.monthlyPayment, 'en-US')} a month, with roughly ${money(r.totalInterest, 'en-US')} in total interest.`
          },
          {
            question: 'How much do I pay back in total?',
            answer: `Over the full term you repay about ${money(r.totalPayment, 'en-US')} — the original ${money(r.totalPrincipal, 'en-US')} plus interest.`
          },
          {
            question: 'Why use this preset?',
            answer:
              'It is a realistic baseline for a typical federal loan — change the rate, term or add an extra payment and everything recalculates live.'
          }
        ]
      },
      de: {
        title: '30.000-$-Studienkredit — 10 Jahre bei 6,5 %',
        description:
          'Der Standard-Benchmark für Bundesdarlehen: 30.000 $ zu 6,5 % über 10 Jahre. Ein voreingestelltes Szenario des Studienkredit-Rechners.',
        summaryIntro: 'Das häufigste Studentenschulden-Setup — was ein 30.000-$-Darlehen monatlich und insgesamt kostet.',
        faqs: [
          {
            question: 'Wie hoch ist die Monatsrate bei einem 30.000-$-Studienkredit?',
            answer: `Bei 6,5 % über 10 Jahre liegt die Rate bei etwa ${money(r.monthlyPayment, 'de-DE')} pro Monat, mit rund ${money(r.totalInterest, 'de-DE')} Gesamtzinsen.`
          },
          {
            question: 'Wie viel zahle ich insgesamt zurück?',
            answer: `Über die Laufzeit zahlst du etwa ${money(r.totalPayment, 'de-DE')} zurück — die ursprünglichen ${money(r.totalPrincipal, 'de-DE')} plus Zinsen.`
          },
          {
            question: 'Warum dieses Preset nutzen?',
            answer:
              'Es ist eine realistische Baseline für ein typisches Bundesdarlehen — Zinssatz, Laufzeit oder Sondertilgung ändern und alles berechnet sich neu.'
          }
        ]
      },
      es: {
        title: 'Préstamo estudiantil de 30.000 $ — 10 años al 6,5 %',
        description:
          'La referencia estándar del préstamo federal: 30.000 $ al 6,5 % en 10 años. Un escenario preconfigurado de la calculadora de préstamo estudiantil.',
        summaryIntro: 'La configuración de deuda estudiantil más común — lo que cuesta un préstamo de 30.000 $ al mes y en total.',
        faqs: [
          {
            question: '¿Cuál es el pago mensual de un préstamo estudiantil de 30.000 $?',
            answer: `Al 6,5 % en 10 años el pago es de unos ${money(r.monthlyPayment, 'es-ES')} al mes, con unos ${money(r.totalInterest, 'es-ES')} de interés total.`
          },
          {
            question: '¿Cuánto pago en total?',
            answer: `En todo el plazo devuelves unos ${money(r.totalPayment, 'es-ES')} — los ${money(r.totalPrincipal, 'es-ES')} originales más los intereses.`
          },
          {
            question: '¿Por qué usar este preset?',
            answer:
              'Es una referencia realista para un préstamo federal típico — cambia tipo, plazo o añade un pago extra y todo se recalcula en vivo.'
          }
        ]
      },
      zh: {
        title: '3 万美元助学贷款——10 年期、6.5% 利率',
        description:
          '标准联邦贷款基准：3 万美元、6.5% 利率、10 年还清。一个预填好的助学贷款计算器场景。',
        summaryIntro: '最常见的学债配置——看 3 万美元贷款每月与总体的真实成本。',
        faqs: [
          {
            question: '3 万美元助学贷款的月供是多少？',
            answer: `6.5%、10 年期限下月供约 ${money(r.monthlyPayment, 'zh-CN')}，总利息约 ${money(r.totalInterest, 'zh-CN')}。`
          },
          {
            question: '我一共要还多少钱？',
            answer: `整个期限大约还款 ${money(r.totalPayment, 'zh-CN')}——原始本金 ${money(r.totalPrincipal, 'zh-CN')} 加利息。`
          },
          {
            question: '为什么用这个预设？',
            answer:
              '它是典型联邦贷款的现实基准——修改利率、期限或增加额外还款，一切即时重算。'
          }
        ]
      }
    })
  ),

  buildPreset(
    '50k-graduate-7.5',
    { principal: 50000, annualRate: 7.5, termYears: 10, gracePeriodMonths: 6, extraMonthly: 0 },
    (r) => ({
      en: {
        title: '$50K Graduate Loan at 7.5%',
        description:
          'A graduate-school scenario: $50,000 at 7.5% with a 6-month grace period before a 10-year repayment. A pre-filled student loan calculator scenario.',
        summaryIntro: 'Grad loans carry higher rates — see how the grace-period interest capitalization adds up.',
        faqs: [
          {
            question: 'What is the payment on a $50,000 graduate loan?',
            answer: `After the 6-month grace period capitalizes about ${money(r.capitalizedInterest, 'en-US')} of interest, the balance is ${money(r.capitalizedBalance, 'en-US')}, giving a payment near ${money(r.monthlyPayment, 'en-US')} a month.`
          },
          {
            question: 'How much does the grace period add?',
            answer: `The capitalized interest pushes total interest to about ${money(r.totalInterest, 'en-US')} across the loan — a good reason to pay interest during grace if you can.`
          },
          {
            question: 'Why model graduate debt?',
            answer:
              'Graduate loans often exceed $50,000 at higher rates — this preset shows the real monthly burden before you commit.'
          }
        ]
      },
      de: {
        title: '50.000-$-Graduierten-Darlehen zu 7,5 %',
        description:
          'Ein Graduierten-Szenario: 50.000 $ zu 7,5 % mit 6-monatiger Karenzzeit vor der 10-jährigen Rückzahlung. Ein voreingestelltes Szenario des Studienkredit-Rechners.',
        summaryIntro: 'Graduierten-Darlehen haben höhere Zinssätze — sieh, wie sich die Kapitalisierung der Karenzzeit summiert.',
        faqs: [
          {
            question: 'Wie hoch ist die Rate bei einem 50.000-$-Graduierten-Darlehen?',
            answer: `Nach der 6-monatigen Karenzzeit, die etwa ${money(r.capitalizedInterest, 'de-DE')} Zinsen kapitalisiert, beträgt der Saldo ${money(r.capitalizedBalance, 'de-DE')} — die Rate liegt bei etwa ${money(r.monthlyPayment, 'de-DE')} pro Monat.`
          },
          {
            question: 'Wie viel addiert die Karenzzeit?',
            answer: `Die kapitalisierten Zinsen treiben die Gesamtzinsen auf etwa ${money(r.totalInterest, 'de-DE')} — ein Grund, während der Karenzzeit Zinsen zu zahlen, wenn möglich.`
          },
          {
            question: 'Warum Graduiertenschulden modellieren?',
            answer:
              'Graduierten-Darlehen übersteigen oft 50.000 $ zu höheren Zinssätzen — dieses Preset zeigt die echte monatliche Last vor der Zusage.'
          }
        ]
      },
      es: {
        title: 'Préstamo de posgrado de 50.000 $ al 7,5 %',
        description:
          'Un escenario de posgrado: 50.000 $ al 7,5 % con un periodo de gracia de 6 meses antes de la amortización a 10 años. Un escenario preconfigurado de la calculadora de préstamo estudiantil.',
        summaryIntro: 'Los préstamos de posgrado llevan tipos más altos — mira cómo se acumula la capitalización del periodo de gracia.',
        faqs: [
          {
            question: '¿Cuál es el pago de un préstamo de posgrado de 50.000 $?',
            answer: `Tras el periodo de gracia de 6 meses, que capitaliza unos ${money(r.capitalizedInterest, 'es-ES')} de intereses, el saldo es de ${money(r.capitalizedBalance, 'es-ES')}, con un pago cercano a ${money(r.monthlyPayment, 'es-ES')} al mes.`
          },
          {
            question: '¿Cuánto añade el periodo de gracia?',
            answer: `El interés capitalizado eleva el interés total a unos ${money(r.totalInterest, 'es-ES')} — un motivo para pagar intereses durante la gracia si puedes.`
          },
          {
            question: '¿Por qué modelar la deuda de posgrado?',
            answer:
              'Los préstamos de posgrado suelen superar los 50.000 $ a tipos más altos — este preset muestra la carga mensual real antes de comprometerte.'
          }
        ]
      },
      zh: {
        title: '5 万美元研究生贷款，7.5% 利率',
        description:
          '研究生场景：5 万美元、7.5% 利率，6 个月宽限期后开始 10 年还款。一个预填好的助学贷款计算器场景。',
        summaryIntro: '研究生贷款利率更高——看宽限期利息资本化如何累积。',
        faqs: [
          {
            question: '5 万美元研究生贷款的月供是多少？',
            answer: `6 个月宽限期资本化约 ${money(r.capitalizedInterest, 'zh-CN')} 利息后，余额为 ${money(r.capitalizedBalance, 'zh-CN')}，月供接近 ${money(r.monthlyPayment, 'zh-CN')}。`
          },
          {
            question: '宽限期增加了多少？',
            answer: `资本化利息把总利息推高至约 ${money(r.totalInterest, 'zh-CN')}——如果条件允许，宽限期内主动付息是明智之举。`
          },
          {
            question: '为什么要模拟研究生学债？',
            answer:
              '研究生贷款常超过 5 万美元且利率更高——这个预设让你在承诺之前看清真实的月供负担。'
          }
        ]
      }
    })
  ),

  buildPreset(
    '100k-medical-law',
    { principal: 100000, annualRate: 6.8, termYears: 10, gracePeriodMonths: 0, extraMonthly: 0 },
    (r) => ({
      en: {
        title: '$100K Medical & Law School Loan',
        description:
          'A high-balance professional scenario: $100,000 at 6.8% over 10 years. A pre-filled student loan calculator scenario for medical and law students.',
        summaryIntro: 'Six-figure professional debt — the monthly reality behind the degree.',
        faqs: [
          {
            question: 'What is the payment on a $100,000 student loan?',
            answer: `At 6.8% over 10 years the payment is about ${money(r.monthlyPayment, 'en-US')} a month — before any income-driven or forgiveness plan.`
          },
          {
            question: 'How much interest does six-figure debt generate?',
            answer: `Total interest reaches about ${money(r.totalInterest, 'en-US')}, so the total repayment is roughly ${money(r.totalPayment, 'en-US')}.`
          },
          {
            question: 'Why use this preset?',
            answer:
              'It gives medical and law students a concrete baseline to plan repayment before residency or first-year income starts.'
          }
        ]
      },
      de: {
        title: '100.000-$-Medizin- und Jura-Studienkredit',
        description:
          'Ein professionelles Hochschulden-Szenario: 100.000 $ zu 6,8 % über 10 Jahre. Ein voreingestelltes Szenario des Studienkredit-Rechners für Medizin- und Jura-Studierende.',
        summaryIntro: 'Sechsstellige Berufsschulden — die monatliche Realität hinter dem Abschluss.',
        faqs: [
          {
            question: 'Wie hoch ist die Rate bei einem 100.000-$-Studienkredit?',
            answer: `Bei 6,8 % über 10 Jahre liegt die Rate bei etwa ${money(r.monthlyPayment, 'de-DE')} pro Monat — vor jedem einkommensabhängigen oder Erlass-Plan.`
          },
          {
            question: 'Wie viel Zinsen erzeugt eine sechsstellige Schuld?',
            answer: `Die Gesamtzinsen erreichen etwa ${money(r.totalInterest, 'de-DE')}, die Gesamtrückzahlung liegt also bei rund ${money(r.totalPayment, 'de-DE')}.`
          },
          {
            question: 'Warum dieses Preset nutzen?',
            answer:
              'Es gibt Medizin- und Jura-Studierenden eine konkrete Baseline, um die Rückzahlung vor Assistenzzeit oder Ersteinkommen zu planen.'
          }
        ]
      },
      es: {
        title: 'Préstamo de 100.000 $ para medicina y derecho',
        description:
          'Un escenario profesional de saldo alto: 100.000 $ al 6,8 % en 10 años. Un escenario preconfigurado de la calculadora de préstamo estudiantil para estudiantes de medicina y derecho.',
        summaryIntro: 'Deuda profesional de seis cifras — la realidad mensual detrás del título.',
        faqs: [
          {
            question: '¿Cuál es el pago de un préstamo estudiantil de 100.000 $?',
            answer: `Al 6,8 % en 10 años el pago es de unos ${money(r.monthlyPayment, 'es-ES')} al mes — antes de cualquier plan de pago según ingresos o condonación.`
          },
          {
            question: '¿Cuánto interés genera una deuda de seis cifras?',
            answer: `El interés total llega a unos ${money(r.totalInterest, 'es-ES')}, así que la devolución total ronda los ${money(r.totalPayment, 'es-ES')}.`
          },
          {
            question: '¿Por qué usar este preset?',
            answer:
              'Da a estudiantes de medicina y derecho una referencia concreta para planear el pago antes de que empiece la residencia o el primer salario.'
          }
        ]
      },
      zh: {
        title: '10 万美元医学院/法学院助学贷款',
        description:
          '高额职业场景：10 万美元、6.8% 利率、10 年还清。一个为医学院与法学院学生预填好的助学贷款计算器场景。',
        summaryIntro: '六位数职业债务——学位背后的月供现实。',
        faqs: [
          {
            question: '10 万美元助学贷款的月供是多少？',
            answer: `6.8%、10 年期限下月供约 ${money(r.monthlyPayment, 'zh-CN')}——在任何收入驱动或减免计划之前。`
          },
          {
            question: '六位数债务会产生多少利息？',
            answer: `总利息约 ${money(r.totalInterest, 'zh-CN')}，总还款额约 ${money(r.totalPayment, 'zh-CN')}。`
          },
          {
            question: '为什么用这个预设？',
            answer:
              '它给医学生和法学生一个具体的基准，在住院医师或首年收入开始前规划还款。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'extra-200-payoff',
    { principal: 30000, annualRate: 6.5, termYears: 10, gracePeriodMonths: 0, extraMonthly: 200 },
    (r) => ({
      en: {
        title: 'Pay Off Student Loans Faster — $200 Extra a Month',
        description:
          'An aggressive payoff plan: $30,000 at 6.5% over 10 years with $200 extra a month going straight to principal. A pre-filled student loan calculator scenario.',
        summaryIntro: 'The single most powerful habit — what $200 a month does to your payoff date and interest bill.',
        faqs: [
          {
            question: 'How much faster does $200 a month pay off the loan?',
            answer: `With $200 extra a month the loan clears in about ${termParts(r.payoffMonths).y} years ${termParts(r.payoffMonths).m} months instead of 10 years — roughly ${r.monthsSaved} months sooner.`
          },
          {
            question: 'How much interest does that save?',
            answer: `You save about ${money(r.interestSaved, 'en-US')} in interest — a big return on a $200 monthly habit.`
          },
          {
            question: 'Does my base payment change?',
            answer:
              'No — the scheduled payment stays the same; the $200 extra is applied to principal each month, so you simply finish months earlier and owe far less interest.'
          }
        ]
      },
      de: {
        title: 'Studienkredite schneller abbezahlen — 200 $ extra pro Monat',
        description:
          'Ein aggressiver Tilgungsplan: 30.000 $ zu 6,5 % über 10 Jahre mit 200 $ extra pro Monat direkt aufs Kapital. Ein voreingestelltes Szenario des Studienkredit-Rechners.',
        summaryIntro: 'Die wirksamste Gewohnheit — was 200 $ pro Monat für Tilgungsdatum und Zinsrechnung tun.',
        faqs: [
          {
            question: 'Wie viel schneller tilgen 200 $ pro Monat das Darlehen?',
            answer: `Mit 200 $ extra pro Monat ist das Darlehen nach etwa ${termParts(r.payoffMonths).y} Jahren und ${termParts(r.payoffMonths).m} Monaten abbezahlt statt nach 10 Jahren — rund ${r.monthsSaved} Monate früher.`
          },
          {
            question: 'Wie viel Zinsen spart das?',
            answer: `Du sparst etwa ${money(r.interestSaved, 'de-DE')} Zinsen — eine große Rendite auf eine 200-$-Gewohnheit.`
          },
          {
            question: 'Ändert sich meine Basisrate?',
            answer:
              'Nein — die planmäßige Rate bleibt gleich; die 200 $ extra fließen monatlich ins Kapital, sodass du Monate früher fertig bist und deutlich weniger Zinsen zahlst.'
          }
        ]
      },
      es: {
        title: 'Pagar los préstamos estudiantiles antes — 200 $ extra al mes',
        description:
          'Un plan de pago agresivo: 30.000 $ al 6,5 % en 10 años con 200 $ extra al mes directos al capital. Un escenario preconfigurado de la calculadora de préstamo estudiantil.',
        summaryIntro: 'El hábito más poderoso — lo que 200 $ al mes hacen por tu fecha de liquidación y tu factura de intereses.',
        faqs: [
          {
            question: '¿Cuánto antes se paga con 200 $ extra al mes?',
            answer: `Con 200 $ extra al mes el préstamo se liquida en unos ${termParts(r.payoffMonths).y} años y ${termParts(r.payoffMonths).m} meses en lugar de 10 años — unos ${r.monthsSaved} meses antes.`
          },
          {
            question: '¿Cuánto interés se ahorra?',
            answer: `Ahorras unos ${money(r.interestSaved, 'es-ES')} en intereses — un gran rendimiento por un hábito de 200 $ al mes.`
          },
          {
            question: '¿Cambia mi pago base?',
            answer:
              'No — el pago programado sigue igual; los 200 $ extra van al capital cada mes, así que terminas meses antes y debes mucho menos interés.'
          }
        ]
      },
      zh: {
        title: '每月多还 200 美元，提前还清助学贷款',
        description:
          '激进还款计划：3 万美元、6.5%、10 年，每月额外 200 美元直接冲抵本金。一个预填好的助学贷款计算器场景。',
        summaryIntro: '最强大的习惯——每月 200 美元如何改变还清日期与利息账单。',
        faqs: [
          {
            question: '每月 200 美元能提前多久还清？',
            answer: `每月额外 200 美元，贷款约 ${termParts(r.payoffMonths).y} 年 ${termParts(r.payoffMonths).m} 个月还清，而不是 10 年——提前约 ${r.monthsSaved} 个月。`
          },
          {
            question: '能省多少利息？',
            answer: `你大约节省 ${money(r.interestSaved, 'zh-CN')} 的利息——每月 200 美元习惯的巨大回报。`
          },
          {
            question: '基础月供会变吗？',
            answer:
              '不会——计划月供保持不变；每月 200 美元用于本金，因此提前数月结束，总利息大幅减少。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'parent-plus-40k',
    { principal: 40000, annualRate: 8, termYears: 10, gracePeriodMonths: 0, extraMonthly: 0 },
    (r) => ({
      en: {
        title: 'Parent PLUS Loan — $40K at 8%',
        description:
          'A Parent PLUS scenario: $40,000 borrowed at 8% over 10 years. A pre-filled student loan calculator scenario for parents financing a child\'s education.',
        summaryIntro: 'PLUS loans carry the highest federal rates — what $40,000 really costs the family.',
        faqs: [
          {
            question: 'What is the payment on a $40,000 Parent PLUS loan?',
            answer: `At 8% over 10 years the payment is about ${money(r.monthlyPayment, 'en-US')} a month — significantly higher than a direct student loan at the same balance.`
          },
          {
            question: 'How much interest does an 8% PLUS loan generate?',
            answer: `The 8% rate produces about ${money(r.totalInterest, 'en-US')} in interest, making the total repayment roughly ${money(r.totalPayment, 'en-US')}.`
          },
          {
            question: 'Why use this preset?',
            answer:
              'It shows parents the real monthly burden of PLUS borrowing before signing, so they can weigh federal versus private options.'
          }
        ]
      },
      de: {
        title: 'Parent-PLUS-Darlehen — 40.000 $ zu 8 %',
        description:
          'Ein Parent-PLUS-Szenario: 40.000 $ zu 8 % über 10 Jahre. Ein voreingestelltes Szenario des Studienkredit-Rechners für Eltern, die die Ausbildung ihres Kindes finanzieren.',
        summaryIntro: 'PLUS-Darlehen haben die höchsten Bundeszinssätze — was 40.000 $ die Familie wirklich kosten.',
        faqs: [
          {
            question: 'Wie hoch ist die Rate bei einem 40.000-$-Parent-PLUS-Darlehen?',
            answer: `Bei 8 % über 10 Jahre liegt die Rate bei etwa ${money(r.monthlyPayment, 'de-DE')} pro Monat — deutlich höher als ein direktes Studiendarlehen bei gleichem Saldo.`
          },
          {
            question: 'Wie viel Zinsen erzeugt ein 8-%-PLUS-Darlehen?',
            answer: `Der 8-%-Zinssatz erzeugt etwa ${money(r.totalInterest, 'de-DE')} Zinsen, die Gesamtrückzahlung liegt bei rund ${money(r.totalPayment, 'de-DE')}.`
          },
          {
            question: 'Warum dieses Preset nutzen?',
            answer:
              'Es zeigt Eltern die echte monatliche Last der PLUS-Finanzierung vor der Unterschrift, damit sie Bundes- und Privatoptionen abwägen können.'
          }
        ]
      },
      es: {
        title: 'Préstamo Parent PLUS — 40.000 $ al 8 %',
        description:
          'Un escenario Parent PLUS: 40.000 $ al 8 % durante 10 años. Un escenario preconfigurado de la calculadora de préstamo estudiantil para padres que financian la educación de un hijo.',
        summaryIntro: 'Los préstamos PLUS llevan los tipos federales más altos — lo que 40.000 $ cuestan de verdad a la familia.',
        faqs: [
          {
            question: '¿Cuál es el pago de un préstamo Parent PLUS de 40.000 $?',
            answer: `Al 8 % en 10 años el pago es de unos ${money(r.monthlyPayment, 'es-ES')} al mes — bastante mayor que un préstamo estudiantil directo del mismo saldo.`
          },
          {
            question: '¿Cuánto interés genera un PLUS al 8 %?',
            answer: `El tipo del 8 % genera unos ${money(r.totalInterest, 'es-ES')} de intereses, con una devolución total de unos ${money(r.totalPayment, 'es-ES')}.`
          },
          {
            question: '¿Por qué usar este preset?',
            answer:
              'Muestra a los padres la carga mensual real de la financiación PLUS antes de firmar, para sopesar opciones federales y privadas.'
          }
        ]
      },
      zh: {
        title: 'Parent PLUS 贷款——4 万美元、8% 利率',
        description:
          'Parent PLUS 场景：4 万美元、8% 利率、10 年还清。一个为资助子女教育的家长预填好的助学贷款计算器场景。',
        summaryIntro: 'PLUS 贷款拥有最高的联邦利率——4 万美元让家庭付出多少。',
        faqs: [
          {
            question: '4 万美元 Parent PLUS 贷款的月供是多少？',
            answer: `8%、10 年期限下月供约 ${money(r.monthlyPayment, 'zh-CN')}——显著高于同余额的直接助学贷款。`
          },
          {
            question: '8% 的 PLUS 贷款产生多少利息？',
            answer: `8% 利率产生约 ${money(r.totalInterest, 'zh-CN')} 的利息，总还款额约 ${money(r.totalPayment, 'zh-CN')}。`
          },
          {
            question: '为什么用这个预设？',
            answer:
              '它让家长在签字前看清 PLUS 借款的真实月供负担，以便权衡联邦与私人选项。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'refinance-5pct-7yr',
    { principal: 35000, annualRate: 5, termYears: 7, gracePeriodMonths: 0, extraMonthly: 0 },
    (r) => ({
      en: {
        title: 'Refinance Student Loans — 5% for 7 Years',
        description:
          'A refinancing scenario: $35,000 at a private 5% rate over 7 years. A pre-filled student loan calculator scenario for refinancing to a shorter, lower-rate term.',
        summaryIntro: 'The refinance play: shorter term, lower rate — what it costs per month and what it saves.',
        faqs: [
          {
            question: 'What is the payment after refinancing to 5% for 7 years?',
            answer: `At 5% over 84 months the payment is about ${money(r.monthlyPayment, 'en-US')} a month, with total interest near ${money(r.totalInterest, 'en-US')}.`
          },
          {
            question: 'How much does refinancing save?',
            answer:
              'A lower rate and a shorter term together slash interest dramatically compared with a 10-year federal loan at 6.5% — the calculator lets you compare both scenarios.'
          },
          {
            question: 'What should I check before refinancing?',
            answer:
              'Confirm you can afford the higher payment and weigh the loss of federal protections (forbearance, income-driven plans, forgiveness) before giving them up.'
          }
        ]
      },
      de: {
        title: 'Studienkredit refinanzieren — 5 % für 7 Jahre',
        description:
          'Ein Refinanzierungs-Szenario: 35.000 $ zu privaten 5 % über 7 Jahre. Ein voreingestelltes Szenario des Studienkredit-Rechners für die Umschuldung auf eine kürzere, günstigere Laufzeit.',
        summaryIntro: 'Der Refinanzierungs-Zug: kürzere Laufzeit, niedrigerer Zinssatz — die monatlichen Kosten und die Ersparnis.',
        faqs: [
          {
            question: 'Wie hoch ist die Rate nach der Refinanzierung auf 5 % über 7 Jahre?',
            answer: `Bei 5 % über 84 Monate liegt die Rate bei etwa ${money(r.monthlyPayment, 'de-DE')} pro Monat, die Gesamtzinsen bei rund ${money(r.totalInterest, 'de-DE')}.`
          },
          {
            question: 'Wie viel spart die Refinanzierung?',
            answer:
              'Ein niedrigerer Zinssatz und eine kürzere Laufzeit senken die Zinsen im Vergleich zu einem 10-jährigen Bundesdarlehen zu 6,5 % drastisch — der Rechner vergleicht beide Szenarien.'
          },
          {
            question: 'Was sollte ich vor der Refinanzierung prüfen?',
            answer:
              'Vergewissere dich, dass du die höhere Rate tragen kannst, und wäge den Verlust von Bundesschutz (Stundung, einkommensabhängige Pläne, Erlass) ab.'
          }
        ]
      },
      es: {
        title: 'Refinanciar préstamos estudiantiles — 5 % a 7 años',
        description:
          'Un escenario de refinanciación: 35.000 $ a un tipo privado del 5 % durante 7 años. Un escenario preconfigurado de la calculadora de préstamo estudiantil para refinanciar a un plazo más corto y barato.',
        summaryIntro: 'La jugada de la refinanciación: plazo más corto, tipo más bajo — lo que cuesta al mes y lo que ahorra.',
        faqs: [
          {
            question: '¿Cuál es el pago tras refinanciar al 5 % a 7 años?',
            answer: `Al 5 % en 84 meses el pago es de unos ${money(r.monthlyPayment, 'es-ES')} al mes, con un interés total cercano a ${money(r.totalInterest, 'es-ES')}.`
          },
          {
            question: '¿Cuánto ahorra la refinanciación?',
            answer:
              'Un tipo menor y un plazo más corto recortan drásticamente los intereses frente a un préstamo federal a 10 años al 6,5 % — la calculadora permite comparar ambos.'
          },
          {
            question: '¿Qué revisar antes de refinanciar?',
            answer:
              'Confirma que puedes asumir el pago mayor y sopesa perder las protecciones federales (prórroga, planes por ingresos, condonación) antes de renunciar a ellas.'
          }
        ]
      },
      zh: {
        title: '助学贷款再融资——5%、7 年期',
        description:
          '再融资场景：3.5 万美元、私人 5% 利率、7 年还清。一个为转为更短更优期限而预填好的助学贷款计算器场景。',
        summaryIntro: '再融资打法：更短期限、更低利率——每月成本与节省。',
        faqs: [
          {
            question: '再融资到 5%、7 年后月供是多少？',
            answer: `5%、84 个月期限下月供约 ${money(r.monthlyPayment, 'zh-CN')}，总利息约 ${money(r.totalInterest, 'zh-CN')}。`
          },
          {
            question: '再融资能省多少？',
            answer:
              '更低的利率加更短的期限，相比 6.5% 的 10 年期联邦贷款可大幅削减利息——计算器让你对比两个场景。'
          },
          {
            question: '再融资前要检查什么？',
            answer:
              '确认你能承受更高的月供，并在放弃联邦保护（延期、收入驱动计划、减免）之前权衡利弊。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'idr-vs-standard',
    { principal: 45000, annualRate: 6.5, termYears: 10, gracePeriodMonths: 0, extraMonthly: 0 },
    (r) => {
      const alt = calculateStudentLoan({ principal: 45000, annualRate: 6.5, termYears: 20, gracePeriodMonths: 0, extraMonthly: 0 });
      return {
        en: {
          title: 'Income-Driven vs Standard Repayment',
          description:
            'The IDR trade-off on $45,000 at 6.5%: the standard 10-year plan versus a 20-year income-driven-style repayment. A pre-filled student loan calculator scenario.',
          summaryIntro: 'Lower monthly payments now — or far less interest overall? The choice, quantified.',
          faqs: [
            {
              question: 'How much lower is the IDR-style payment?',
              answer: `The 20-year plan drops the payment from about ${money(r.monthlyPayment, 'en-US')} to ${money(alt.monthlyPayment, 'en-US')} a month — roughly ${money(r.monthlyPayment - alt.monthlyPayment, 'en-US')} less.`
            },
            {
              question: 'How much more interest does a longer plan cost?',
              answer: `Total interest rises from about ${money(r.totalInterest, 'en-US')} on the standard plan to ${money(alt.totalInterest, 'en-US')} over 20 years — an extra ${money(alt.totalInterest - r.totalInterest, 'en-US')}.`
            },
            {
              question: 'How do I choose?',
              answer:
                'Income-driven plans can be the right call when payments are unaffordable, especially with forgiveness potential. If you can afford it, the standard plan is far cheaper in interest.'
            }
          ]
        },
        de: {
          title: 'Einkommensabhängige vs. Standard-Rückzahlung',
          description:
            'Der IDR-Trade-off bei 45.000 $ zu 6,5 %: der Standard-10-Jahres-Plan gegenüber einer einkommensabhängigen 20-Jahres-Rückzahlung. Ein voreingestelltes Szenario des Studienkredit-Rechners.',
          summaryIntro: 'Niedrigere Raten jetzt — oder deutlich weniger Zinsen insgesamt? Die Wahl, beziffert.',
          faqs: [
            {
              question: 'Wie viel niedriger ist die IDR-Rate?',
              answer: `Der 20-Jahres-Plan senkt die Rate von etwa ${money(r.monthlyPayment, 'de-DE')} auf ${money(alt.monthlyPayment, 'de-DE')} pro Monat — rund ${money(r.monthlyPayment - alt.monthlyPayment, 'de-DE')} weniger.`
            },
            {
              question: 'Wie viel mehr Zinsen kostet ein längerer Plan?',
              answer: `Die Gesamtzinsen steigen von etwa ${money(r.totalInterest, 'de-DE')} beim Standardplan auf ${money(alt.totalInterest, 'de-DE')} über 20 Jahre — ein Aufpreis von ${money(alt.totalInterest - r.totalInterest, 'de-DE')}.`
            },
            {
              question: 'Wie wähle ich?',
              answer:
                'Einkommensabhängige Pläne sind sinnvoll, wenn Raten unbezahlbar sind, besonders mit Erlass-Potenzial. Wer es sich leisten kann, spart beim Standardplan deutlich Zinsen.'
            }
          ]
        },
        es: {
          title: 'Pago según ingresos frente a pago estándar',
          description:
            'El dilema del IDR con 45.000 $ al 6,5 %: el plan estándar a 10 años frente a una amortización de 20 años estilo IDR. Un escenario preconfigurado de la calculadora de préstamo estudiantil.',
          summaryIntro: 'Pagos mensuales más bajos ahora — ¿o mucho menos interés en total? La elección, cuantificada.',
          faqs: [
            {
              question: '¿Cuánto menor es el pago estilo IDR?',
              answer: `El plan de 20 años baja el pago de unos ${money(r.monthlyPayment, 'es-ES')} a ${money(alt.monthlyPayment, 'es-ES')} al mes — unos ${money(r.monthlyPayment - alt.monthlyPayment, 'es-ES')} menos.`
            },
            {
              question: '¿Cuánto interés adicional cuesta un plan más largo?',
              answer: `El interés total sube de unos ${money(r.totalInterest, 'es-ES')} en el plan estándar a ${money(alt.totalInterest, 'es-ES')} en 20 años — un extra de ${money(alt.totalInterest - r.totalInterest, 'es-ES')}.`
            },
            {
              question: '¿Cómo elijo?',
              answer:
                'Los planes por ingresos tienen sentido cuando los pagos no son asequibles, sobre todo con potencial de condonación. Si puedes pagarlo, el plan estándar es mucho más barato en intereses.'
            }
          ]
        },
        zh: {
          title: '收入驱动 vs 标准还款',
          description:
            '4.5 万美元、6.5% 利率下的 IDR 取舍：标准 10 年期 vs 收入驱动式 20 年期还款。一个预填好的助学贷款计算器场景。',
          summaryIntro: '现在月供更低——还是总利息更少？选择被量化。',
          faqs: [
            {
              question: '收入驱动式月供低多少？',
              answer: `20 年期计划把月供从约 ${money(r.monthlyPayment, 'zh-CN')} 降至 ${money(alt.monthlyPayment, 'zh-CN')}——每月少付约 ${money(r.monthlyPayment - alt.monthlyPayment, 'zh-CN')}。`
            },
            {
              question: '更长期限要多付多少利息？',
              answer: `总利息从标准计划的约 ${money(r.totalInterest, 'zh-CN')} 升至 20 年期的 ${money(alt.totalInterest, 'zh-CN')}——多付 ${money(alt.totalInterest - r.totalInterest, 'zh-CN')}。`
            },
            {
              question: '我该怎么选？',
              answer:
                '当月供难以负担时（尤其有减免潜力），收入驱动计划是合理选择；若负担得起，标准计划在利息上便宜得多。'
            }
          ]
        }
      };
    }
  ),

  buildPreset(
    '25k-grace-period',
    { principal: 25000, annualRate: 5.5, termYears: 10, gracePeriodMonths: 6, extraMonthly: 0 },
    (r) => ({
      en: {
        title: '$25K Undergrad Loan with 6-Month Grace Period',
        description:
          'A typical undergrad scenario: $25,000 at 5.5% with a 6-month grace period before 10 years of repayment. A pre-filled student loan calculator scenario.',
        summaryIntro: 'What the post-graduation grace period does to your balance — before you even start paying.',
        faqs: [
          {
            question: 'How does the 6-month grace period change my loan?',
            answer: `Interest accrues during grace and capitalizes about ${money(r.capitalizedInterest, 'en-US')}, lifting the balance to ${money(r.capitalizedBalance, 'en-US')} before your first payment.`
          },
          {
            question: 'What is my first payment?',
            answer: `On the capitalized balance at 5.5% over 10 years, the payment is about ${money(r.monthlyPayment, 'en-US')} a month.`
          },
          {
            question: 'Can I avoid the capitalization?',
            answer:
              'If your loan is unsubsidized, making voluntary interest payments during grace prevents the interest from being added to the principal.'
          }
        ]
      },
      de: {
        title: '25.000-$-Bachelor-Darlehen mit 6-monatiger Karenzzeit',
        description:
          'Ein typisches Bachelor-Szenario: 25.000 $ zu 5,5 % mit 6-monatiger Karenzzeit vor 10 Jahren Rückzahlung. Ein voreingestelltes Szenario des Studienkredit-Rechners.',
        summaryIntro: 'Was die Karenzzeit nach dem Abschluss mit deinem Saldo macht — bevor du überhaupt zahlst.',
        faqs: [
          {
            question: 'Wie verändert die 6-monatige Karenzzeit mein Darlehen?',
            answer: `Während der Karenzzeit laufen Zinsen auf und kapitalisieren etwa ${money(r.capitalizedInterest, 'de-DE')}, der Saldo steigt auf ${money(r.capitalizedBalance, 'de-DE')} vor der ersten Rate.`
          },
          {
            question: 'Wie hoch ist meine erste Rate?',
            answer: `Auf dem kapitalisierten Saldo zu 5,5 % über 10 Jahre liegt die Rate bei etwa ${money(r.monthlyPayment, 'de-DE')} pro Monat.`
          },
          {
            question: 'Kann ich die Kapitalisierung vermeiden?',
            answer:
              'Bei ungeförderten Darlehen verhindern freiwillige Zinszahlungen während der Karenzzeit, dass die Zinsen dem Kapital zugeschlagen werden.'
          }
        ]
      },
      es: {
        title: 'Préstamo de grado de 25.000 $ con 6 meses de gracia',
        description:
          'Un escenario típico de grado: 25.000 $ al 5,5 % con un periodo de gracia de 6 meses antes de 10 años de amortización. Un escenario preconfigurado de la calculadora de préstamo estudiantil.',
        summaryIntro: 'Lo que el periodo de gracia posgraduación hace con tu saldo — antes incluso de empezar a pagar.',
        faqs: [
          {
            question: '¿Cómo cambia mi préstamo el periodo de gracia de 6 meses?',
            answer: `Los intereses se acumulan durante la gracia y capitalizan unos ${money(r.capitalizedInterest, 'es-ES')}, elevando el saldo a ${money(r.capitalizedBalance, 'es-ES')} antes de tu primer pago.`
          },
          {
            question: '¿Cuál es mi primer pago?',
            answer: `Sobre el saldo capitalizado al 5,5 % en 10 años, el pago es de unos ${money(r.monthlyPayment, 'es-ES')} al mes.`
          },
          {
            question: '¿Puedo evitar la capitalización?',
            answer:
              'En préstamos no subvencionados, pagar intereses voluntariamente durante la gracia evita que se añadan al capital.'
          }
        ]
      },
      zh: {
        title: '2.5 万美元本科贷款，含 6 个月宽限期',
        description:
          '典型本科场景：2.5 万美元、5.5% 利率，6 个月宽限期后开始 10 年还款。一个预填好的助学贷款计算器场景。',
        summaryIntro: '毕业后宽限期对你的余额做了什么——在你开始还款之前。',
        faqs: [
          {
            question: '6 个月宽限期如何改变我的贷款？',
            answer: `宽限期内利息累积并资本化约 ${money(r.capitalizedInterest, 'zh-CN')}，余额在首次还款前升至 ${money(r.capitalizedBalance, 'zh-CN')}。`
          },
          {
            question: '我的第一笔还款是多少？',
            answer: `按资本化后的余额、5.5%、10 年计算，月供约 ${money(r.monthlyPayment, 'zh-CN')}。`
          },
          {
            question: '能避免资本化吗？',
            answer:
              '如果是无贴息贷款，在宽限期内主动支付利息可防止利息计入本金。'
          }
        ]
      }
    })
  )
];

export const PRESET_SLUGS = PRESETS.map((p) => p.slug);

export function getPreset(scenario: string): StudentLoanPreset | undefined {
  return PRESETS.find((p) => p.slug === scenario);
}

/**
 * Build the URL-query seed from a StudentLoanInput preset, mirroring STUDENTLOAN_URL_KEY
 * in StudentLoanCalculatorClient. Defaults are omitted so a clean share link only carries
 * the values the preset actually set.
 */
export function studentLoanInitialQuery(preset: StudentLoanPreset): Record<string, string> {
  const q: Record<string, string> = {};
  const p = preset.defaultParams;
  if (p.principal !== 30000) q.principal = String(p.principal);
  if (p.annualRate !== 6.5) q.rate = String(p.annualRate);
  if (p.termYears !== 10) q.years = String(p.termYears);
  if (p.gracePeriodMonths !== 0) q.grace = String(p.gracePeriodMonths);
  if (p.extraMonthly !== 0) q.extra = String(p.extraMonthly);
  return q;
}
