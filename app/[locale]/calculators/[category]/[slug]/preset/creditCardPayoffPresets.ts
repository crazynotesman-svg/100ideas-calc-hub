/**
 * Credit Card Payoff pSEO Preset Matrix / 信用卡还款计算器程序化 SEO 预设矩阵
 * ----------------------------------------------------------------------------
 * Seed scenarios for the Credit Card Payoff calculator.
 * Each preset is a fully described, pre-filled landing page, with localized
 * title, meta description, scenario summary and a scenario-specific FAQ.
 *
 * The numbers embedded in the copy are computed from the live engine
 * (calculateCreditCardPayoff) so the FAQ prose always matches the rendered benchmark.
 */

import { calculateCreditCardPayoff, type CreditCardPayoffInput } from '@/lib/calculators/finance/credit-card-payoff';
import type { Locale } from '@/config/i18n.config';
import type { FaqEntry } from '@/lib/seo/schema';

export const CREDITCARDPAYOFF_CATEGORY = 'finance';
export const CREDITCARDPAYOFF_SLUG = 'credit-card-payoff-calculator';

/** Locale-independent route for a scenario page. */
export function presetRoute(scenario: string) {
  return `/calculators/${CREDITCARDPAYOFF_CATEGORY}/${CREDITCARDPAYOFF_SLUG}/preset/${scenario}`;
}

interface LocalizedPreset {
  title: string;
  description: string;
  summaryIntro: string;
  faqs: FaqEntry[];
}

export interface CreditCardPayoffPreset {
  slug: string;
  /** Resolved input state passed straight to the client (no CLS on first paint). */
  defaultParams: CreditCardPayoffInput;
  localized: Record<Locale, LocalizedPreset>;
}

type Result = ReturnType<typeof calculateCreditCardPayoff>;

/** Whole-dollar locale formatting for preset copy. */
function money(v: number, locale: string) {
  return `$${Math.round(v).toLocaleString(locale)}`;
}

function buildPreset(
  slug: string,
  defaultParams: CreditCardPayoffInput,
  localized: (r: Result) => Record<Locale, LocalizedPreset>
): CreditCardPayoffPreset {
  return { slug, defaultParams, localized: localized(calculateCreditCardPayoff(defaultParams)) };
}

export const PRESETS: CreditCardPayoffPreset[] = [
  buildPreset(
    '5k-20pct-apr-payoff',
    { balance: 5000, apr: 20, strategy: 'fixed', minimumPct: 1, minimumFloor: 25, fixedMonthly: 150, extraMonthly: 0 },
    (r) => ({
      en: {
        title: 'Pay Off $5,000 Card at 20% APR',
        description:
          'A $5,000 balance at 20% APR paid off with a $150 monthly payment. A pre-filled credit card payoff calculator scenario.',
        summaryIntro: 'A typical first-card balance — see exactly how long $150 a month takes and what it costs.',
        faqs: [
          {
            question: 'How long does it take to pay off $5,000 at 20% APR?',
            answer: `With a fixed $150 payment the balance clears in about ${r.payoffMonths} months (roughly ${Math.ceil((r.payoffMonths ?? 0) / 12)} years), with about ${money(r.totalInterest ?? 0, 'en-US')} in interest.`
          },
          {
            question: 'How much faster is that than the minimum?',
            answer: `Minimum-only payments would stretch to about ${r.baseline.payoffMonths} months — this plan saves roughly ${r.monthsSaved} months and about ${money(r.interestSaved ?? 0, 'en-US')} in interest.`
          },
          {
            question: 'Why use this preset?',
            answer:
              'It is the most common payoff question — tweak the payment or add an extra amount and the months and interest update instantly.'
          }
        ]
      },
      de: {
        title: '5.000-$-Karte bei 20 % APR abbezahlen',
        description:
          'Ein Saldo von 5.000 $ bei 20 % APR, abbezahlt mit 150 $ pro Monat. Ein voreingestelltes Szenario des Kreditkarten-Tilgungsrechners.',
        summaryIntro: 'Ein typisches erstes Karten-Saldo — sieh, wie lange 150 $ pro Monat brauchen und was es kostet.',
        faqs: [
          {
            question: 'Wie lange dauert es, 5.000 $ bei 20 % APR abzuzahlen?',
            answer: `Mit einer festen Rate von 150 $ ist der Saldo nach etwa ${r.payoffMonths} Monaten (rund ${Math.ceil((r.payoffMonths ?? 0) / 12)} Jahre) abbezahlt, mit etwa ${money(r.totalInterest ?? 0, 'de-DE')} Zinsen.`
          },
          {
            question: 'Wie viel schneller als die Mindestzahlung?',
            answer: `Nur Mindestzahlungen würden sich auf etwa ${r.baseline.payoffMonths} Monate ziehen — dieser Plan spart rund ${r.monthsSaved} Monate und etwa ${money(r.interestSaved ?? 0, 'de-DE')} Zinsen.`
          },
          {
            question: 'Warum dieses Preset nutzen?',
            answer:
              'Es ist die häufigste Tilgungsfrage — Rate ändern oder einen Extrabetrag hinzufügen und Monate sowie Zinsen aktualisieren sich sofort.'
          }
        ]
      },
      es: {
        title: 'Liquidar 5.000 $ de tarjeta al 20 % TAE',
        description:
          'Un saldo de 5.000 $ al 20 % TAE pagado con 150 $ mensuales. Un escenario preconfigurado de la calculadora de liquidación de tarjeta.',
        summaryIntro: 'Un saldo típico de primera tarjeta — mira cuánto tardan 150 $ al mes y cuánto cuesta.',
        faqs: [
          {
            question: '¿Cuánto tarda en liquidar 5.000 $ al 20 % TAE?',
            answer: `Con un pago fijo de 150 $ el saldo se limpia en unos ${r.payoffMonths} meses (unas ${Math.ceil((r.payoffMonths ?? 0) / 12)} años), con unos ${money(r.totalInterest ?? 0, 'es-ES')} de intereses.`
          },
          {
            question: '¿Cuánto más rápido que el pago mínimo?',
            answer: `Solo con mínimos se alargaría a unos ${r.baseline.payoffMonths} meses — este plan ahorra unos ${r.monthsSaved} meses y unos ${money(r.interestSaved ?? 0, 'es-ES')} de intereses.`
          },
          {
            question: '¿Por qué usar este preset?',
            answer:
              'Es la pregunta de liquidación más común — cambia el pago o añade un extra y los meses e intereses se actualizan al instante.'
          }
        ]
      },
      zh: {
        title: '还清 5,000 美元、20% APR 的信用卡',
        description:
          '一笔 5,000 美元、20% APR 的账单，每月还款 150 美元。一个预填好的信用卡还款计算器场景。',
        summaryIntro: '典型的首张卡余额——看每月 150 美元要多久、要花多少。',
        faqs: [
          {
            question: '20% APR 下还清 5,000 美元要多久？',
            answer: `固定每月 150 美元，约 ${r.payoffMonths} 个月（约 ${Math.ceil((r.payoffMonths ?? 0) / 12)} 年）还清，利息约 ${money(r.totalInterest ?? 0, 'zh-CN')}。`
          },
          {
            question: '比最低还款快多少？',
            answer: `仅还最低额会拖到约 ${r.baseline.payoffMonths} 个月——这个方案节省约 ${r.monthsSaved} 个月与约 ${money(r.interestSaved ?? 0, 'zh-CN')} 利息。`
          },
          {
            question: '为什么用这个预设？',
            answer:
              '这是最常见的清欠问题——修改月供或增加额外还款，月数与利息即时更新。'
          }
        ]
      }
    })
  ),

  buildPreset(
    '10k-minimum-payment-trap',
    { balance: 10000, apr: 22, strategy: 'minimum', minimumPct: 1, minimumFloor: 25, fixedMonthly: 0, extraMonthly: 0 },
    (r) => ({
      en: {
        title: 'The $10K Minimum Payment Trap',
        description:
          'A $10,000 balance at 22% APR paid with only the 1% minimum payment. A pre-filled credit card payoff calculator scenario showing why minimums barely move the balance.',
        summaryIntro: 'Minimum payments feel affordable — this is what they actually cost.',
        faqs: [
          {
            question: 'How long does minimum-only payment take?',
            answer: `Paying just the minimum on $10,000 at 22% APR takes about ${r.payoffMonths} months — roughly ${Math.ceil((r.payoffMonths ?? 0) / 12)} years — and about ${money(r.totalInterest ?? 0, 'en-US')} in interest.`
          },
          {
            question: 'Why does it take so long?',
            answer: `The minimum mostly covers interest: of the first ${money(r.schedule[0]?.payment ?? 0, 'en-US')} payment, about ${money(r.schedule[0]?.interest ?? 0, 'en-US')} is interest, leaving only a small slice for the balance.`
          },
          {
            question: 'What is the takeaway?',
            answer:
              'Pay more than the minimum — any fixed amount or extra payment dramatically cuts both the months and the interest, as the calculator shows live.'
          }
        ]
      },
      de: {
        title: 'Die 10.000-$-Mindestzahlungs-Falle',
        description:
          'Ein Saldo von 10.000 $ bei 22 % APR, bezahlt nur mit der 1-%-Mindestzahlung. Ein voreingestelltes Szenario des Kreditkarten-Tilgungsrechners, das zeigt, warum Mindestzahlungen den Saldo kaum bewegen.',
        summaryIntro: 'Mindestzahlungen fühlen sich erschwinglich an — das ist ihr wahrer Preis.',
        faqs: [
          {
            question: 'Wie lange dauert nur die Mindestzahlung?',
            answer: `Nur die Mindestzahlung bei 10.000 $ und 22 % APR dauert etwa ${r.payoffMonths} Monate — rund ${Math.ceil((r.payoffMonths ?? 0) / 12)} Jahre — und etwa ${money(r.totalInterest ?? 0, 'de-DE')} Zinsen.`
          },
          {
            question: 'Warum dauert es so lange?',
            answer: `Die Mindestzahlung deckt meist nur die Zinsen: von der ersten Zahlung von ${money(r.schedule[0]?.payment ?? 0, 'de-DE')} sind etwa ${money(r.schedule[0]?.interest ?? 0, 'de-DE')} Zinsen, nur ein kleiner Teil tilgt den Saldo.`
          },
          {
            question: 'Was ist die Erkenntnis?',
            answer:
              'Zahle mehr als das Minimum — jeder feste Betrag oder Extrabetrag senkt Monate und Zinsen drastisch, wie der Rechner live zeigt.'
          }
        ]
      },
      es: {
        title: 'La trampa del pago mínimo de 10.000 $',
        description:
          'Un saldo de 10.000 $ al 22 % TAE pagado solo con el mínimo del 1 %. Un escenario preconfigurado de la calculadora de liquidación de tarjeta que muestra por qué los mínimos apenas mueven el saldo.',
        summaryIntro: 'Los pagos mínimos parecen asequibles — esto es lo que cuestan de verdad.',
        faqs: [
          {
            question: '¿Cuánto tarda solo el pago mínimo?',
            answer: `Pagar solo el mínimo de 10.000 $ al 22 % TAE tarda unos ${r.payoffMonths} meses — unas ${Math.ceil((r.payoffMonths ?? 0) / 12)} años — y unos ${money(r.totalInterest ?? 0, 'es-ES')} de intereses.`
          },
          {
            question: '¿Por qué tarda tanto?',
            answer: `El mínimo cubre sobre todo intereses: del primer pago de ${money(r.schedule[0]?.payment ?? 0, 'es-ES')}, unos ${money(r.schedule[0]?.interest ?? 0, 'es-ES')} son intereses, dejando solo una porción pequeña para el saldo.`
          },
          {
            question: '¿Cuál es la conclusión?',
            answer:
              'Paga más que el mínimo — cualquier cantidad fija o extra recorta drásticamente meses e intereses, como muestra la calculadora en vivo.'
          }
        ]
      },
      zh: {
        title: '1 万美元最低还款陷阱',
        description:
          '一笔 10,000 美元、22% APR 的账单，仅按 1% 最低还款。一个预填好的信用卡还款计算器场景，展示最低还款几乎不动本金。',
        summaryIntro: '最低还款看似可负担——这才是它的真实代价。',
        faqs: [
          {
            question: '仅最低还款要多久？',
            answer: `10,000 美元、22% APR 仅还最低额约需 ${r.payoffMonths} 个月——约 ${Math.ceil((r.payoffMonths ?? 0) / 12)} 年——利息约 ${money(r.totalInterest ?? 0, 'zh-CN')}。`
          },
          {
            question: '为什么这么久？',
            answer: `最低还款大部分是利息：首期 ${money(r.schedule[0]?.payment ?? 0, 'zh-CN')} 中约 ${money(r.schedule[0]?.interest ?? 0, 'zh-CN')} 是利息，只有一小部分冲抵本金。`
          },
          {
            question: '结论是什么？',
            answer:
              '还的要比最低额多——任何固定金额或额外还款都能大幅缩短月数并减少利息，计算器实时展示。'
          }
        ]
      }
    })
  ),

  buildPreset(
    '15k-balance-transfer-promo',
    { balance: 15000, apr: 0, strategy: 'fixed', minimumPct: 1, minimumFloor: 25, fixedMonthly: 250, extraMonthly: 0 },
    (r) => ({
      en: {
        title: '$15K Balance Transfer at 0% APR',
        description:
          'A $15,000 balance on a 0% APR balance-transfer promo, repaid with $250 a month. A pre-filled credit card payoff calculator scenario.',
        summaryIntro: 'Zero interest changes everything — see how fast a 0% window clears $15,000.',
        faqs: [
          {
            question: 'How fast does a 0% APR window clear $15,000?',
            answer: `At 0% APR with $250 a month the balance clears in exactly ${r.payoffMonths} months, with ${money(r.totalInterest ?? 0, 'en-US')} in interest — every dollar goes to the balance.`
          },
          {
            question: 'What happens when the promo ends?',
            answer:
              'If the balance remains after the 0% window, the regular APR applies again — plan to finish inside the promo or have the payment ready for the jump.'
          },
          {
            question: 'Why use this preset?',
            answer:
              'It shows the ideal balance-transfer math — then set your own APR and payment to see the impact of the promo ending.'
          }
        ]
      },
      de: {
        title: '15.000-$-Saldoübertrag bei 0 % APR',
        description:
          'Ein Saldo von 15.000 $ bei einem 0-%-Saldoübertrags-Angebot, mit 250 $ pro Monat getilgt. Ein voreingestelltes Szenario des Kreditkarten-Tilgungsrechners.',
        summaryIntro: 'Null Zinsen ändern alles — sieh, wie schnell ein 0-%-Fenster 15.000 $ tilgt.',
        faqs: [
          {
            question: 'Wie schnell tilgt ein 0-%-APR-Fenster 15.000 $?',
            answer: `Bei 0 % APR mit 250 $ pro Monat ist der Saldo in genau ${r.payoffMonths} Monaten getilgt, mit ${money(r.totalInterest ?? 0, 'de-DE')} Zinsen — jeder Dollar geht in den Saldo.`
          },
          {
            question: 'Was passiert, wenn die Aktion endet?',
            answer:
              'Bleibt der Saldo nach dem 0-%-Fenster bestehen, gilt wieder der reguläre APR — plane, innerhalb der Aktion fertig zu werden, oder habe die Rate für den Sprung bereit.'
          },
          {
            question: 'Warum dieses Preset nutzen?',
            answer:
              'Es zeigt die ideale Saldoübertrags-Rechnung — dann eigenen APR und Rate setzen, um den Effekt des Aktionsendes zu sehen.'
          }
        ]
      },
      es: {
        title: 'Transferencia de saldo de 15.000 $ al 0 % TAE',
        description:
          'Un saldo de 15.000 $ en una promo de transferencia al 0 % TAE, pagado con 250 $ al mes. Un escenario preconfigurado de la calculadora de liquidación de tarjeta.',
        summaryIntro: 'El interés cero lo cambia todo — mira cuánto tarda una ventana al 0 % en limpiar 15.000 $.',
        faqs: [
          {
            question: '¿Cuánto tarda una ventana al 0 % en liquidar 15.000 $?',
            answer: `Al 0 % TAE con 250 $ al mes el saldo se limpia en exactamente ${r.payoffMonths} meses, con ${money(r.totalInterest ?? 0, 'es-ES')} de intereses — cada dólar va al saldo.`
          },
          {
            question: '¿Qué pasa cuando acaba la promo?',
            answer:
              'Si queda saldo tras la ventana al 0 %, vuelve a aplicarse el TAE normal — planifica terminar dentro de la promo o ten listo el pago para el salto.'
          },
          {
            question: '¿Por qué usar este preset?',
            answer:
              'Muestra las matemáticas ideales de la transferencia — luego pon tu propio TAE y pago para ver el impacto de que acabe la promo.'
          }
        ]
      },
      zh: {
        title: '1.5 万美元余额转移，0% APR 促销期',
        description:
          '一笔 15,000 美元、处于 0% APR 余额转移促销期的账单，每月还 250 美元。一个预填好的信用卡还款计算器场景。',
        summaryIntro: '零利息改变一切——看 0% 窗口期多快清掉 1.5 万美元。',
        faqs: [
          {
            question: '0% APR 窗口期多快能还清 1.5 万美元？',
            answer: `0% APR、每月 250 美元，正好 ${r.payoffMonths} 个月还清，利息为 ${money(r.totalInterest ?? 0, 'zh-CN')}——每一美元都冲抵本金。`
          },
          {
            question: '促销期结束后会怎样？',
            answer: '若 0% 窗口期后仍有余额，将恢复常规 APR——规划在促销期内还清，或为利率跳升准备好月供。'
          },
          {
            question: '为什么用这个预设？',
            answer:
              '它展示余额转移的理想数学——然后设定你自己的 APR 与月供，看促销结束的影响。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'extra-100-payoff-plan',
    { balance: 10000, apr: 20, strategy: 'fixed', minimumPct: 1, minimumFloor: 25, fixedMonthly: 250, extraMonthly: 100 },
    (r) => ({
      en: {
        title: 'Add $100 a Month — Faster Card Payoff',
        description:
          'A $10,000 balance at 20% APR paid with $250 plus $100 extra a month. A pre-filled credit card payoff calculator scenario.',
        summaryIntro: 'The $100-a-month lever: what one modest habit does to your payoff date.',
        faqs: [
          {
            question: 'How much faster does $100 extra make it?',
            answer: `With $350 a month the balance clears in ${r.payoffMonths} months versus ${r.baseline.payoffMonths} for minimum-only — about ${r.monthsSaved} months sooner.`
          },
          {
            question: 'How much interest does it save?',
            answer: `The extra payment cuts total interest to about ${money(r.totalInterest ?? 0, 'en-US')}, saving roughly ${money(r.interestSaved ?? 0, 'en-US')} compared with minimum payments.`
          },
          {
            question: 'Why use this preset?',
            answer:
              'It quantifies the single most effective debt habit — change the extra amount and watch the payoff date move.'
          }
        ]
      },
      de: {
        title: '100 $ extra pro Monat — schneller abbezahlt',
        description:
          'Ein Saldo von 10.000 $ bei 20 % APR, bezahlt mit 250 $ plus 100 $ extra pro Monat. Ein voreingestelltes Szenario des Kreditkarten-Tilgungsrechners.',
        summaryIntro: 'Der 100-$-Hebel: was eine bescheidene Gewohnheit für das Tilgungsdatum tut.',
        faqs: [
          {
            question: 'Wie viel schneller macht 100 $ extra?',
            answer: `Mit 350 $ pro Monat ist der Saldo in ${r.payoffMonths} Monaten getilgt gegenüber ${r.baseline.payoffMonths} bei nur Mindestzahlung — etwa ${r.monthsSaved} Monate früher.`
          },
          {
            question: 'Wie viel Zinsen spart es?',
            answer: `Die Extrazahlung senkt die Gesamtzinsen auf etwa ${money(r.totalInterest ?? 0, 'de-DE')} und spart rund ${money(r.interestSaved ?? 0, 'de-DE')} gegenüber Mindestzahlungen.`
          },
          {
            question: 'Warum dieses Preset nutzen?',
            answer:
              'Es beziffert die wirksamste Schuldengewohnheit — den Extrabetrag ändern und das Tilgungsdatum beobachten.'
          }
        ]
      },
      es: {
        title: 'Añade 100 $ al mes — liquidación más rápida',
        description:
          'Un saldo de 10.000 $ al 20 % TAE pagado con 250 $ más 100 $ extra al mes. Un escenario preconfigurado de la calculadora de liquidación de tarjeta.',
        summaryIntro: 'La palanca de los 100 $: lo que un hábito modesto hace por tu fecha de liquidación.',
        faqs: [
          {
            question: '¿Cuánto antes con 100 $ extra?',
            answer: `Con 350 $ al mes el saldo se limpia en ${r.payoffMonths} meses frente a ${r.baseline.payoffMonths} con solo mínimos — unos ${r.monthsSaved} meses antes.`
          },
          {
            question: '¿Cuánto interés ahorra?',
            answer: `El pago extra baja el interés total a unos ${money(r.totalInterest ?? 0, 'es-ES')}, ahorrando unos ${money(r.interestSaved ?? 0, 'es-ES')} frente a los mínimos.`
          },
          {
            question: '¿Por qué usar este preset?',
            answer:
              'Cuantifica el hábito de deuda más eficaz — cambia el extra y observa moverse la fecha de liquidación.'
          }
        ]
      },
      zh: {
        title: '每月多还 100 美元——更快还清信用卡',
        description:
          '一笔 10,000 美元、20% APR 的账单，每月还 250 美元加 100 美元额外还款。一个预填好的信用卡还款计算器场景。',
        summaryIntro: '每月 100 美元的杠杆：一个朴素习惯如何改变还清日期。',
        faqs: [
          {
            question: '每月 100 美元能提前多久？',
            answer: `每月 350 美元，${r.payoffMonths} 个月还清，而仅最低还款需 ${r.baseline.payoffMonths} 个月——提前约 ${r.monthsSaved} 个月。`
          },
          {
            question: '能省多少利息？',
            answer: `额外还款把总利息降至约 ${money(r.totalInterest ?? 0, 'zh-CN')}，相比最低还款节省约 ${money(r.interestSaved ?? 0, 'zh-CN')}。`
          },
          {
            question: '为什么用这个预设？',
            answer:
              '它量化最有效的债务习惯——修改额外金额，看还清日期随之移动。'
          }
        ]
      }
    })
  ),

  buildPreset(
    '20k-high-interest-card',
    { balance: 20000, apr: 24, strategy: 'fixed', minimumPct: 1, minimumFloor: 25, fixedMonthly: 600, extraMonthly: 0 },
    (r) => ({
      en: {
        title: 'Pay Off a $20K High-Interest Card',
        description:
          'A $20,000 balance at 24% APR repaid with $600 a month. A pre-filled credit card payoff calculator scenario.',
        summaryIntro: 'High balances at high rates compound fast — $600 a month is the antidote.',
        faqs: [
          {
            question: 'How long does $600 a month take on $20,000 at 24%?',
            answer: `The balance clears in about ${r.payoffMonths} months with about ${money(r.totalInterest ?? 0, 'en-US')} in interest — vs roughly ${r.baseline.payoffMonths} months for minimum-only.`
          },
          {
            question: 'How much interest does the plan avoid?',
            answer: `Minimum-only would cost about ${money(r.baseline.totalInterest ?? 0, 'en-US')} in interest; this plan saves roughly ${money(r.interestSaved ?? 0, 'en-US')}.`
          },
          {
            question: 'Why use this preset?',
            answer:
              'It models the high-balance high-rate scenario honestly — adjust the payment to find the fastest realistic payoff.'
          }
        ]
      },
      de: {
        title: '20.000-$-Karte mit hohem Zins abbezahlen',
        description:
          'Ein Saldo von 20.000 $ bei 24 % APR, getilgt mit 600 $ pro Monat. Ein voreingestelltes Szenario des Kreditkarten-Tilgungsrechners.',
        summaryIntro: 'Hohe Salden bei hohen Zinsen verzinsen sich schnell — 600 $ pro Monat ist das Gegenmittel.',
        faqs: [
          {
            question: 'Wie lange brauchen 600 $ pro Monat bei 20.000 $ und 24 %?',
            answer: `Der Saldo ist in etwa ${r.payoffMonths} Monaten getilgt, mit etwa ${money(r.totalInterest ?? 0, 'de-DE')} Zinsen — gegenüber rund ${r.baseline.payoffMonths} Monaten bei nur Mindestzahlung.`
          },
          {
            question: 'Wie viel Zinsen vermeidet der Plan?',
            answer: `Nur Mindestzahlung würde etwa ${money(r.baseline.totalInterest ?? 0, 'de-DE')} Zinsen kosten; dieser Plan spart rund ${money(r.interestSaved ?? 0, 'de-DE')}.`
          },
          {
            question: 'Warum dieses Preset nutzen?',
            answer:
              'Es modelliert das Hochsaldo-Hochzins-Szenario ehrlich — die Rate anpassen, um die schnellste realistische Tilgung zu finden.'
          }
        ]
      },
      es: {
        title: 'Liquidar una tarjeta de 20.000 $ de alto interés',
        description:
          'Un saldo de 20.000 $ al 24 % TAE pagado con 600 $ al mes. Un escenario preconfigurado de la calculadora de liquidación de tarjeta.',
        summaryIntro: 'Los saldos altos a tipos altos capitalizan rápido — 600 $ al mes es el antídoto.',
        faqs: [
          {
            question: '¿Cuánto tardan 600 $ al mes en 20.000 $ al 24 %?',
            answer: `El saldo se limpia en unos ${r.payoffMonths} meses con unos ${money(r.totalInterest ?? 0, 'es-ES')} de intereses — frente a unos ${r.baseline.payoffMonths} meses con solo mínimos.`
          },
          {
            question: '¿Cuánto interés evita el plan?',
            answer: `Solo mínimos costaría unos ${money(r.baseline.totalInterest ?? 0, 'es-ES')} de intereses; este plan ahorra unos ${money(r.interestSaved ?? 0, 'es-ES')}.`
          },
          {
            question: '¿Por qué usar este preset?',
            answer:
              'Modela con honestidad el escenario de saldo alto y tipo alto — ajusta el pago para hallar la liquidación realista más rápida.'
          }
        ]
      },
      zh: {
        title: '还清 2 万美元的高息信用卡',
        description:
          '一笔 20,000 美元、24% APR 的账单，每月还 600 美元。一个预填好的信用卡还款计算器场景。',
        summaryIntro: '高余额加高利率复利飞快——每月 600 美元是解药。',
        faqs: [
          {
            question: '24% 利率下每月 600 美元要还多久？',
            answer: `约 ${r.payoffMonths} 个月还清，利息约 ${money(r.totalInterest ?? 0, 'zh-CN')}——而仅最低还款需约 ${r.baseline.payoffMonths} 个月。`
          },
          {
            question: '这个方案避免了多少利息？',
            answer: `仅最低还款的利息约 ${money(r.baseline.totalInterest ?? 0, 'zh-CN')}；本方案节省约 ${money(r.interestSaved ?? 0, 'zh-CN')}。`
          },
          {
            question: '为什么用这个预设？',
            answer:
              '它如实建模高余额高利率场景——调整月供，找到最快的现实还清方案。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'fixed-3-year-payoff',
    { balance: 12000, apr: 21, strategy: 'fixed', minimumPct: 1, minimumFloor: 25, fixedMonthly: 452, extraMonthly: 0 },
    (r) => ({
      en: {
        title: 'Pay Off Your Card in 3 Years — What to Pay?',
        description:
          'The payment needed to clear a $12,000 balance at 21% APR in roughly 36 months. A pre-filled credit card payoff calculator scenario.',
        summaryIntro: 'Working backwards from a 3-year goal — the monthly number that gets you there.',
        faqs: [
          {
            question: 'How much do I pay monthly to finish in 3 years?',
            answer: `A payment near ${money(r.monthlyPayment, 'en-US')} a month clears the $12,000 balance in ${r.payoffMonths} months with about ${money(r.totalInterest ?? 0, 'en-US')} in interest.`
          },
          {
            question: 'What does minimum-only cost instead?',
            answer: `Minimum payments would drag on for about ${r.baseline.payoffMonths} months and roughly ${money(r.baseline.totalInterest ?? 0, 'en-US')} in interest — a 3-year plan saves about ${money(r.interestSaved ?? 0, 'en-US')}.`
          },
          {
            question: 'Why use this preset?',
            answer:
              'It answers the exact "how much do I need to pay" question — nudge the payment and watch the timeline adjust.'
          }
        ]
      },
      de: {
        title: 'Karte in 3 Jahren abbezahlen — wie viel zahlen?',
        description:
          'Die Rate, um einen Saldo von 12.000 $ bei 21 % APR in etwa 36 Monaten zu tilgen. Ein voreingestelltes Szenario des Kreditkarten-Tilgungsrechners.',
        summaryIntro: 'Rückwärts vom 3-Jahres-Ziel — die Monatszahl, die dich dorthin bringt.',
        faqs: [
          {
            question: 'Wie viel zahle ich monatlich, um in 3 Jahren fertig zu sein?',
            answer: `Eine Rate nahe ${money(r.monthlyPayment, 'de-DE')} pro Monat tilgt den 12.000-$-Saldo in ${r.payoffMonths} Monaten, mit etwa ${money(r.totalInterest ?? 0, 'de-DE')} Zinsen.`
          },
          {
            question: 'Was kostet nur die Mindestzahlung?',
            answer: `Mindestzahlungen würden etwa ${r.baseline.payoffMonths} Monate und rund ${money(r.baseline.totalInterest ?? 0, 'de-DE')} Zinsen kosten — ein 3-Jahres-Plan spart etwa ${money(r.interestSaved ?? 0, 'de-DE')}.`
          },
          {
            question: 'Warum dieses Preset nutzen?',
            answer:
              'Es beantwortet die exakte Frage "wie viel muss ich zahlen" — die Rate justieren und den Zeitplan beobachten.'
          }
        ]
      },
      es: {
        title: 'Liquidar la tarjeta en 3 años — ¿cuánto pagar?',
        description:
          'El pago necesario para limpiar un saldo de 12.000 $ al 21 % TAE en unos 36 meses. Un escenario preconfigurado de la calculadora de liquidación de tarjeta.',
        summaryIntro: 'Partiendo hacia atrás de un objetivo a 3 años — el número mensual que te lleva allí.',
        faqs: [
          {
            question: '¿Cuánto pago al mes para terminar en 3 años?',
            answer: `Un pago cercano a ${money(r.monthlyPayment, 'es-ES')} al mes limpia el saldo de 12.000 $ en ${r.payoffMonths} meses con unos ${money(r.totalInterest ?? 0, 'es-ES')} de intereses.`
          },
          {
            question: '¿Qué cuesta en cambio solo el mínimo?',
            answer: `Los mínimos se alargarían unos ${r.baseline.payoffMonths} meses y unos ${money(r.baseline.totalInterest ?? 0, 'es-ES')} de intereses — un plan a 3 años ahorra unos ${money(r.interestSaved ?? 0, 'es-ES')}.`
          },
          {
            question: '¿Por qué usar este preset?',
            answer:
              'Responde a la pregunta exacta de "cuánto necesito pagar" — ajusta el pago y observa cambiar el calendario.'
          }
        ]
      },
      zh: {
        title: '3 年还清信用卡——每月该还多少？',
        description:
          '在约 36 个月内还清 12,000 美元、21% APR 账单所需的月供。一个预填好的信用卡还款计算器场景。',
        summaryIntro: '从 3 年目标倒推——带你到达那里的月供数字。',
        faqs: [
          {
            question: '3 年还清每月要还多少？',
            answer: `每月约 ${money(r.monthlyPayment, 'zh-CN')}，可在 ${r.payoffMonths} 个月内还清 12,000 美元，利息约 ${money(r.totalInterest ?? 0, 'zh-CN')}。`
          },
          {
            question: '仅最低还款要付出什么代价？',
            answer: `最低还款会拖到约 ${r.baseline.payoffMonths} 个月、利息约 ${money(r.baseline.totalInterest ?? 0, 'zh-CN')}——3 年方案节省约 ${money(r.interestSaved ?? 0, 'zh-CN')}。`
          },
          {
            question: '为什么用这个预设？',
            answer:
              '它回答"我每月该还多少"这个确切问题——微调月供，看时间线随之变化。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'fixed-1-year-fast-track',
    { balance: 8000, apr: 19, strategy: 'fixed', minimumPct: 1, minimumFloor: 25, fixedMonthly: 737, extraMonthly: 0 },
    (r) => ({
      en: {
        title: 'Credit Card Debt-Free in 1 Year',
        description:
          'A fast-track plan: $8,000 at 19% APR cleared in about 12 months. A pre-filled credit card payoff calculator scenario.',
        summaryIntro: 'The aggressive one-year sprint — what it takes and what it saves.',
        faqs: [
          {
            question: 'What payment clears $8,000 in a year?',
            answer: `About ${money(r.monthlyPayment, 'en-US')} a month pays the balance in ${r.payoffMonths} months with roughly ${money(r.totalInterest ?? 0, 'en-US')} in interest.`
          },
          {
            question: 'How much does the sprint save?',
            answer: `Minimum-only would take about ${r.baseline.payoffMonths} months and about ${money(r.baseline.totalInterest ?? 0, 'en-US')} in interest — the one-year plan saves roughly ${money(r.interestSaved ?? 0, 'en-US')}.`
          },
          {
            question: 'Why use this preset?',
            answer:
              'It shows what true debt-freedom in a year costs — adjust the timeline and payment to match your budget.'
          }
        ]
      },
      de: {
        title: 'In 1 Jahr schuldenfrei mit der Karte',
        description:
          'Ein Fast-Track-Plan: 8.000 $ bei 19 % APR in etwa 12 Monaten getilgt. Ein voreingestelltes Szenario des Kreditkarten-Tilgungsrechners.',
        summaryIntro: 'Der aggressive Ein-Jahres-Sprint — was er braucht und was er spart.',
        faqs: [
          {
            question: 'Welche Rate tilgt 8.000 $ in einem Jahr?',
            answer: `Etwa ${money(r.monthlyPayment, 'de-DE')} pro Monat zahlt den Saldo in ${r.payoffMonths} Monaten, mit rund ${money(r.totalInterest ?? 0, 'de-DE')} Zinsen.`
          },
          {
            question: 'Wie viel spart der Sprint?',
            answer: `Nur Mindestzahlung würde etwa ${r.baseline.payoffMonths} Monate und etwa ${money(r.baseline.totalInterest ?? 0, 'de-DE')} Zinsen kosten — der Ein-Jahres-Plan spart rund ${money(r.interestSaved ?? 0, 'de-DE')}.`
          },
          {
            question: 'Warum dieses Preset nutzen?',
            answer:
              'Es zeigt, was echte Schuldenfreiheit in einem Jahr kostet — Zeitplan und Rate an dein Budget anpassen.'
          }
        ]
      },
      es: {
        title: 'Sin deuda de tarjeta en 1 año',
        description:
          'Un plan exprés: 8.000 $ al 19 % TAE liquidados en unos 12 meses. Un escenario preconfigurado de la calculadora de liquidación de tarjeta.',
        summaryIntro: 'El sprint agresivo de un año — lo que cuesta y lo que ahorra.',
        faqs: [
          {
            question: '¿Qué pago liquida 8.000 $ en un año?',
            answer: `Unos ${money(r.monthlyPayment, 'es-ES')} al mes pagan el saldo en ${r.payoffMonths} meses con unos ${money(r.totalInterest ?? 0, 'es-ES')} de intereses.`
          },
          {
            question: '¿Cuánto ahorra el sprint?',
            answer: `Solo mínimos tardarían unos ${r.baseline.payoffMonths} meses y unos ${money(r.baseline.totalInterest ?? 0, 'es-ES')} de intereses — el plan de un año ahorra unos ${money(r.interestSaved ?? 0, 'es-ES')}.`
          },
          {
            question: '¿Por qué usar este preset?',
            answer:
              'Muestra lo que cuesta la libertad de deuda real en un año — ajusta calendario y pago a tu presupuesto.'
          }
        ]
      },
      zh: {
        title: '1 年极速还清信用卡债务',
        description:
          '极速方案：8,000 美元、19% APR，约 12 个月还清。一个预填好的信用卡还款计算器场景。',
        summaryIntro: '激进的 1 年冲刺——需要什么、能省多少。',
        faqs: [
          {
            question: '1 年还清 8,000 美元每月要还多少？',
            answer: `每月约 ${money(r.monthlyPayment, 'zh-CN')}，可在 ${r.payoffMonths} 个月内还清，利息约 ${money(r.totalInterest ?? 0, 'zh-CN')}。`
          },
          {
            question: '冲刺能省多少？',
            answer: `仅最低还款需约 ${r.baseline.payoffMonths} 个月、利息约 ${money(r.baseline.totalInterest ?? 0, 'zh-CN')}——1 年方案节省约 ${money(r.interestSaved ?? 0, 'zh-CN')}。`
          },
          {
            question: '为什么用这个预设？',
            answer:
              '它展示一年内真正摆脱债务的代价——按你的预算调整时间线与月供。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'debt-consolidation-vs-card',
    { balance: 15000, apr: 22, strategy: 'fixed', minimumPct: 1, minimumFloor: 25, fixedMonthly: 400, extraMonthly: 0 },
    (r) => {
      // Consolidation benchmark: same $15,000 at 9% over 60 months.
      const consoPayment = 311.19;
      const consoInterest = 3671.4;
      const consoMonths = 60;
      return {
        en: {
          title: 'Debt Consolidation Loan vs Card Payoff',
          description:
            'A $15,000 balance at 22% APR: aggressive card payments versus a 9% consolidation loan over 60 months. A pre-filled credit card payoff calculator scenario.',
          summaryIntro: 'The consolidation question — compare your card plan against a cheaper fixed loan.',
          faqs: [
            {
              question: 'How do the two plans compare?',
              answer: `Paying $400 a month on the card clears the balance in ${r.payoffMonths} months with about ${money(r.totalInterest ?? 0, 'en-US')} interest; a 9% consolidation loan costs about ${money(consoInterest, 'en-US')} interest over ${consoMonths} months with a ${money(consoPayment, 'en-US')} payment.`
            },
            {
              question: 'When does consolidation win?',
              answer:
                'The 9% loan cuts interest dramatically if you keep paying at least the consolidation payment — the card plan wins only if you can pay it off very fast.'
            },
            {
              question: 'Why use this preset?',
              answer:
                'It frames the classic compare-and-contrast — plug in your own rates and payments to see which path is cheaper for you.'
            }
          ]
        },
        de: {
          title: 'Schuldenkonsolidierung vs. Karten-Tilgung',
          description:
            'Ein Saldo von 15.000 $ bei 22 % APR: aggressive Kartenzahlungen gegenüber einem 9-%-Konsolidierungsdarlehen über 60 Monate. Ein voreingestelltes Szenario des Kreditkarten-Tilgungsrechners.',
          summaryIntro: 'Die Konsolidierungsfrage — deinen Kartenplan mit einem günstigeren Festdarlehen vergleichen.',
          faqs: [
            {
              question: 'Wie vergleichen sich die beiden Pläne?',
              answer: `400 $ pro Monat auf der Karte tilgen den Saldo in ${r.payoffMonths} Monaten mit etwa ${money(r.totalInterest ?? 0, 'de-DE')} Zinsen; ein 9-%-Konsolidierungsdarlehen kostet etwa ${money(consoInterest, 'de-DE')} Zinsen über ${consoMonths} Monate bei ${money(consoPayment, 'de-DE')} pro Monat.`
            },
            {
              question: 'Wann gewinnt die Konsolidierung?',
              answer:
                'Das 9-%-Darlehen senkt die Zinsen drastisch, wenn du mindestens die Konsolidierungsrate zahlst — der Kartenplan gewinnt nur bei sehr schneller Tilgung.'
            },
            {
              question: 'Warum dieses Preset nutzen?',
              answer:
                'Es rahmt den klassischen Vergleich — eigene Zinssätze und Raten eintragen und sehen, welcher Weg für dich günstiger ist.'
            }
          ]
        },
        es: {
          title: 'Préstamo de consolidación vs liquidación de tarjeta',
          description:
            'Un saldo de 15.000 $ al 22 % TAE: pagos agresivos de tarjeta frente a un préstamo de consolidación al 9 % en 60 meses. Un escenario preconfigurado de la calculadora de liquidación de tarjeta.',
          summaryIntro: 'La pregunta de la consolidación — compara tu plan de tarjeta con un préstamo fijo más barato.',
          faqs: [
            {
              question: '¿Cómo se comparan los dos planes?',
              answer: `Pagar 400 $ al mes en la tarjeta limpia el saldo en ${r.payoffMonths} meses con unos ${money(r.totalInterest ?? 0, 'es-ES')} de intereses; un préstamo de consolidación al 9 % cuesta unos ${money(consoInterest, 'es-ES')} de intereses en ${consoMonths} meses con un pago de ${money(consoPayment, 'es-ES')}.`
            },
            {
              question: '¿Cuándo gana la consolidación?',
              answer:
                'El préstamo al 9 % recorta drásticamente los intereses si mantienes al menos ese pago — el plan de tarjeta solo gana si liquidas muy rápido.'
            },
            {
              question: '¿Por qué usar este preset?',
              answer:
                'Enmarca el clásico cara a cara — introduce tus propios tipos y pagos para ver qué camino te sale más barato.'
            }
          ]
        },
        zh: {
          title: '债务整合贷款 vs 信用卡还款',
          description:
            '一笔 15,000 美元、22% APR 的账单：激进信用卡还款 vs 60 个月 9% 整合贷款。一个预填好的信用卡还款计算器场景。',
          summaryIntro: '整合之问——把你的信用卡方案与更便宜的固定贷款对比。',
          faqs: [
            {
              question: '两个方案如何对比？',
              answer: `信用卡每月 400 美元，${r.payoffMonths} 个月还清、利息约 ${money(r.totalInterest ?? 0, 'zh-CN')}；9% 整合贷款在 ${consoMonths} 个月内利息约 ${money(consoInterest, 'zh-CN')}，月供 ${money(consoPayment, 'zh-CN')}。`
            },
            {
              question: '何时整合贷款胜出？',
              answer:
                '只要你能保持至少支付整合月供，9% 贷款就能大幅削减利息——只有极速还清时信用卡方案才更优。'
            },
            {
              question: '为什么用这个预设？',
              answer:
                '它框定经典的对比决策——填入你自己的利率与月供，看哪条路对你更便宜。'
            }
          ]
        }
      };
    }
  )
];

export const PRESET_SLUGS = PRESETS.map((p) => p.slug);

export function getPreset(scenario: string): CreditCardPayoffPreset | undefined {
  return PRESETS.find((p) => p.slug === scenario);
}

/**
 * Build the URL-query seed from a CreditCardPayoffInput preset, mirroring
 * CREDITCARDPAYOFF_URL_KEY in CreditCardPayoffCalculatorClient. Defaults are omitted
 * so a clean share link only carries the values the preset actually set.
 */
export function creditCardPayoffInitialQuery(preset: CreditCardPayoffPreset): Record<string, string> {
  const q: Record<string, string> = {};
  const p = preset.defaultParams;
  if (p.balance !== 10000) q.balance = String(p.balance);
  if (p.apr !== 22) q.apr = String(p.apr);
  if (p.strategy !== 'fixed') q.strategy = p.strategy;
  if (p.minimumPct !== 1) q.minPct = String(p.minimumPct);
  if (p.minimumFloor !== 25) q.floor = String(p.minimumFloor);
  if (p.fixedMonthly !== 300) q.fixed = String(p.fixedMonthly);
  if (p.extraMonthly !== 0) q.extra = String(p.extraMonthly);
  return q;
}
