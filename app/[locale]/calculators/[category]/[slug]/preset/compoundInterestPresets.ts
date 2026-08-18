/**
 * Compound Interest pSEO Preset Matrix / 复利计算器程序化 SEO 预设矩阵
 * ----------------------------------------------------------------------------
 * Seed scenarios for the Compound Interest & Investment Growth calculator.
 * Each preset is a fully described, pre-filled landing page, with localized
 * title, meta description, scenario summary and a scenario-specific FAQ.
 *
 * The calculator numbers embedded in the copy are computed from the live engine
 * (calculateCompound) so the FAQ prose always matches the rendered benchmark.
 */

import { calculateCompound, type CompoundInput } from '@/lib/calculators/finance/compound';
import type { Locale } from '@/config/i18n.config';
import type { FaqEntry } from '@/lib/seo/schema';

export const COMPOUND_CATEGORY = 'finance';
export const COMPOUND_SLUG = 'compound-interest-calculator';

/** Locale-independent route for a scenario page. */
export function presetRoute(scenario: string) {
  return `/calculators/${COMPOUND_CATEGORY}/${COMPOUND_SLUG}/preset/${scenario}`;
}

interface LocalizedPreset {
  title: string;
  description: string;
  summaryIntro: string;
  faqs: FaqEntry[];
}

export interface CompoundPreset {
  slug: string;
  /** Resolved metric input state passed straight to the client (no CLS on first paint). */
  defaultParams: CompoundInput;
  localized: Record<Locale, LocalizedPreset>;
}

type Result = ReturnType<typeof calculateCompound>;

function buildPreset(
  slug: string,
  defaultParams: CompoundInput,
  localized: (r: Result) => Record<Locale, LocalizedPreset>
): CompoundPreset {
  return { slug, defaultParams, localized: localized(calculateCompound(defaultParams)) };
}

export const PRESETS: CompoundPreset[] = [
  buildPreset(
    '10k-at-7-percent-20-years',
    { initialPrincipal: 10000, monthlyContribution: 0, annualReturnRate: 7, years: 20, compoundingFrequency: 12 },
    (r) => ({
      en: {
        title: '$10,000 at 7% for 20 Years',
        description:
          'A classic compounding benchmark: a single $10,000 lump sum growing at a 7% annual return over 20 years with monthly compounding. A pre-filled compound interest calculator scenario.',
        summaryIntro: 'The textbook example that shows how reinvested returns multiply a one-time investment.',
        faqs: [
          {
            question: 'How much does $10,000 become at 7% over 20 years?',
            answer: `With monthly compounding and no extra deposits, the balance grows to about $${r.futureValue.toLocaleString('en-US')} — roughly four times the original amount, almost all of it interest.`
          },
          {
            question: 'How much of that is real interest?',
            answer: `The portfolio earns about $${r.totalInterest.toLocaleString('en-US')} in compounded interest, which is ${Math.round(r.interestRatio * 100)}% of the final value.`
          },
          {
            question: 'Why start from this preset?',
            answer:
              'It removes the guesswork: open the page and the calculator is already filled in. Edit anything and the result, share link and schema refresh instantly.'
          }
        ]
      },
      de: {
        title: '10.000 $ bei 7 % über 20 Jahre',
        description:
          'Ein klassischer Zinseszins-Benchmark: eine einmalige Anlage von 10.000 $ wächst bei 7 % Jahresrendite über 20 Jahre mit monatlicher Verzinsung. Ein voreingestelltes Szenario des Zinseszins-Rechners.',
        summaryIntro: 'Das Lehrbuchbeispiel, das zeigt, wie reinvestierte Renditen eine einmalige Anlage vervielfachen.',
        faqs: [
          {
            question: 'Wie viel werden aus 10.000 $ bei 7 % in 20 Jahren?',
            answer: `Bei monatlicher Verzinsung und ohne weitere Einzahlungen wächst das Guthaben auf etwa ${r.futureValue.toLocaleString('de-DE')} $ — etwa das Vierfache des Ursprungsbetrags, fast alles Zinsen.`
          },
          {
            question: 'Wie viel davon ist echter Zins?',
            answer: `Das Portfolio erzielt etwa ${r.totalInterest.toLocaleString('de-DE')} $ an Zinseszinsen, also ${Math.round(r.interestRatio * 100)} % des Endwerts.`
          },
          {
            question: 'Warum mit diesem Preset starten?',
            answer:
              'Es nimmt die Rätselei: Die Seite ist schon ausgefüllt. Ändern Sie etwas, und Ergebnis, Teillink und Schema aktualisieren sofort.'
          }
        ]
      },
      es: {
        title: '10.000 $ al 7 % durante 20 años',
        description:
          'Un punto de referencia clásico del interés compuesto: una sola aportación de 10.000 $ crece a un 7 % anual durante 20 años con capitalización mensual. Un escenario preconfigurado del calculadora de interés compuesto.',
        summaryIntro: 'El ejemplo de libro de texto que muestra cómo los rendimientos reinvertidos multiplican una inversión única.',
        faqs: [
          {
            question: '¿Cuánto se obtiene de 10.000 $ al 7 % en 20 años?',
            answer: `Con capitalización mensual y sin aportes extra, el saldo crece a unas ${r.futureValue.toLocaleString('es-ES')} $ — aproximadamente cuatro veces el importe original, casi todo interés.`
          },
          {
            question: '¿Cuánto de eso es interés real?',
            answer: `La cartera genera unas ${r.totalInterest.toLocaleString('es-ES')} $ en interés compuesto, es decir, el ${Math.round(r.interestRatio * 100)} % del valor final.`
          },
          {
            question: '¿Por qué empezar desde este preset?',
            answer:
              'Elimina la suposición: al abrir la página la calculadora ya está rellena. Cambia lo que quieras y el resultado, el enlace para compartir y el esquema se actualizan al instante.'
          }
        ]
      },
      zh: {
        title: '1 万美元，7% 年化，20 年',
        description:
          '经典的复利基准：一笔 1 万美元的一次性投入，在 7% 年化回报、按月复利下增长 20 年。一个预填好的复利计算器场景。',
        summaryIntro: '教科书级的例子，展示复利如何让一次性投资成倍增长。',
        faqs: [
          {
            question: '1 万美元在 7%、20 年下会变成多少？',
            answer: `按月复利、不再追加投入，余额增长至约 ${r.futureValue.toLocaleString('zh-CN')} 美元——约为原始金额的四倍，几乎全部来自利息。`
          },
          {
            question: '其中真实利息有多少？',
            answer: `组合产生约 ${r.totalInterest.toLocaleString('zh-CN')} 美元的复利利息，占最终价值的 ${Math.round(r.interestRatio * 100)}%。`
          },
          {
            question: '为什么从这个预设开始？',
            answer:
              '它省去试错：打开页面计算器就已填好。改任意项，结果、分享链接与结构化数据都会即时刷新。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'monthly-500-dollar-index-fund-growth',
    { initialPrincipal: 0, monthlyContribution: 500, annualReturnRate: 7, years: 25, compoundingFrequency: 12 },
    (r) => ({
      en: {
        title: '$500 Monthly Index Fund Growth',
        description:
          'A dollar-cost-averaging plan: invest $500 every month into an index fund at a 7% annual return for 25 years. A ready-made compound interest calculator scenario.',
        summaryIntro: 'Steady, automated monthly investing — the habit that quietly builds wealth.',
        faqs: [
          {
            question: 'What does $500 a month become after 25 years?',
            answer: `At a 7% return the portfolio reaches about $${r.futureValue.toLocaleString('en-US')}, of which roughly $${r.totalInterest.toLocaleString('en-US')} is compounded interest.`
          },
          {
            question: 'How much did I actually deposit?',
            answer: `Across 25 years of $500 monthly deposits you put in about $${r.totalPrincipal.toLocaleString('en-US')} — so the bulk of the final balance came from compounding, not your contributions.`
          },
          {
            question: 'Why a preset instead of a blank form?',
            answer:
              'Presets give search engines and first-time visitors a complete, ready-to-read scenario. You can still change any input and everything updates live.'
          }
        ]
      },
      de: {
        title: '500 $ monatlich in Indexfonds',
        description:
          'Ein Sparplan mit konstantem Ertrag: 500 $ jeden Monat in einen Indexfonds bei 7 % Jahresrendite über 25 Jahre. Ein fertiges Szenario des Zinseszins-Rechners.',
        summaryIntro: 'Gleichmäßiges, automatisiertes monatliches Investieren — die Gewohnheit, die leise Vermögen aufbaut.',
        faqs: [
          {
            question: 'Was wird aus 500 $ pro Monat nach 25 Jahren?',
            answer: `Bei 7 % Rendite erreicht das Portfolio etwa ${r.futureValue.toLocaleString('de-DE')} $, wovon rund ${r.totalInterest.toLocaleString('de-DE')} $ Zinseszinsen sind.`
          },
          {
            question: 'Wie viel habe ich tatsächlich eingezahlt?',
            answer: `Über 25 Jahre mit 500 $ monatlich sind das etwa ${r.totalPrincipal.toLocaleString('de-DE')} $ — der Großteil des Endbetrags stammt also aus dem Zinseszins, nicht aus den Einzahlungen.`
          },
          {
            question: 'Warum ein Preset statt eines leeren Formulars?',
            answer:
              'Presets liefern Suchmaschinen und Erstbesuchern ein vollständiges, sofort lesbares Szenario. Jede Eingabe lässt sich ändern und alles aktualisiert sich live.'
          }
        ]
      },
      es: {
        title: '500 $ al mes en fondos indexados',
        description:
          'Un plan de coste medio: invierte 500 $ cada mes en un fondo indexado al 7 % anual durante 25 años. Un escenario de la calculadora de interés compuesto listo para usar.',
        summaryIntro: 'Inversión mensual automática y constante — el hábito que construye riqueza en silencio.',
        faqs: [
          {
            question: '¿En qué se convierten 500 $ al mes tras 25 años?',
            answer: `Al 7 % la cartera alcanza unas ${r.futureValue.toLocaleString('es-ES')} $, de las que unos ${r.totalInterest.toLocaleString('es-ES')} $ son interés compuesto.`
          },
          {
            question: '¿Cuánto aporté realmente?',
            answer: `En 25 años a 500 $ al mes aportaste unas ${r.totalPrincipal.toLocaleString('es-ES')} $ — por tanto la mayor parte del saldo final viene del interés compuesto, no de tus aportes.`
          },
          {
            question: '¿Por qué un preset en vez de un formulario en blanco?',
            answer:
              'Los presets dan a los buscadores y visitantes un escenario completo y listo de leer. Puedes cambiar cualquier campo y todo se actualiza en vivo.'
          }
        ]
      },
      zh: {
        title: '每月 500 美元指数基金增长',
        description:
          '一种定投计划：每月向指数基金投入 500 美元，按 7% 年化回报坚持 25 年。一个开箱即用的复利计算器场景。',
        summaryIntro: '稳定、自动的每月投资——悄然积累财富的习惯。',
        faqs: [
          {
            question: '每月 500 美元，25 年后会变成多少？',
            answer: `在 7% 回报下，组合达到约 ${r.futureValue.toLocaleString('zh-CN')} 美元，其中约 ${r.totalInterest.toLocaleString('zh-CN')} 美元来自复利利息。`
          },
          {
            question: '我实际投入了多少？',
            answer: `25 年每月 500 美元，你总共投入约 ${r.totalPrincipal.toLocaleString('zh-CN')} 美元——所以最终余额的大部分来自复利，而非本金。`
          },
          {
            question: '为什么用预设而不是直接填空？',
            answer:
              '预设让搜索引擎和首次访客直接看到一份完整、可读的场景。任何输入都可改，一切都会实时更新。'
          }
        ]
      }
    })
  ),

  buildPreset(
    '100k-sp500-historical-return-30-years',
    { initialPrincipal: 100000, monthlyContribution: 0, annualReturnRate: 10, years: 30, compoundingFrequency: 12 },
    (r) => ({
      en: {
        title: '$100K S&P 500 Historical Return — 30 Years',
        description:
          'A lump-sum retirement illustration: $100,000 in the S&P 500 at its long-run ~10% historical nominal return over 30 years. A pre-filled compound interest calculator scenario.',
        summaryIntro: 'What a single six-figure investment could become if history roughly repeats.',
        faqs: [
          {
            question: 'What could $100,000 become in 30 years at 10%?',
            answer: `At a 10% annual return the balance grows to about $${r.futureValue.toLocaleString('en-US')} — more than ten times the starting amount.`
          },
          {
            question: 'Is that a guaranteed outcome?',
            answer: `No. 10% reflects the S&P 500's long-run average; real years vary widely. The ${Math.round(r.interestRatio * 100)}% interest share simply shows how much of the final value comes from compounding.`
          },
          {
            question: 'Why use this preset?',
            answer:
              'It gives a concrete, shareable illustration of long-horizon growth without requiring any manual data entry.'
          }
        ]
      },
      de: {
        title: '100.000 $ S&P 500 historische Rendite — 30 Jahre',
        description:
          'Eine Einmalanlage zur Rentenillustration: 100.000 $ im S&P 500 bei der langfristigen ~10 %-Rendite über 30 Jahre. Ein voreingestelltes Szenario des Zinseszins-Rechners.',
        summaryIntro: 'Wozu eine einzelne sechsstellige Anlage werden kann, wenn sich die Geschichte grob wiederholt.',
        faqs: [
          {
            question: 'Was können aus 100.000 $ in 30 Jahren bei 10 % werden?',
            answer: `Bei 10 % Jahresrendite wächst das Guthaben auf etwa ${r.futureValue.toLocaleString('de-DE')} $ — mehr als das Zehnfache des Startbetrags.`
          },
          {
            question: 'Ist das ein garantiertes Ergebnis?',
            answer: `Nein. 10 % spiegelt den langfristigen S&P-500-Durchschnitt wider; reale Jahre schwanken stark. Der ${Math.round(r.interestRatio * 100)} %-Zinsanteil zeigt nur, wie viel des Endwerts aus dem Zinseszins stammt.`
          },
          {
            question: 'Warum dieses Preset nutzen?',
            answer:
              'Es liefert eine konkrete, teilbare Illustration des Langfristwachstums ohne manuelle Dateneingabe.'
          }
        ]
      },
      es: {
        title: '100.000 $ S&P 500 rendimiento histórico — 30 años',
        description:
          'Una ilustración de jubilación con aporte único: 100.000 $ en el S&P 500 a su rendimiento nominal histórico de ~10 % durante 30 años. Un escenario preconfigurado de la calculadora de interés compuesto.',
        summaryIntro: 'En lo que podría convertirse una sola inversión de seis cifras si la historia se repite aproximadamente.',
        faqs: [
          {
            question: '¿En qué se pueden convertir 100.000 $ en 30 años al 10 %?',
            answer: `Al 10 % anual el saldo crece a unas ${r.futureValue.toLocaleString('es-ES')} $ — más de diez veces el importe inicial.`
          },
          {
            question: '¿Es ese un resultado garantizado?',
            answer: `No. 10 % refleja el promedio histórico a largo plazo del S&P 500; los años reales varían mucho. El ${Math.round(r.interestRatio * 100)} % de interés solo muestra cuánto del valor final viene del interés compuesto.`
          },
          {
            question: '¿Por qué usar este preset?',
            answer:
              'Ofrece una ilustración concreta y compartible del crecimiento a largo plazo sin necesidad de introducir datos manualmente.'
          }
        ]
      },
      zh: {
        title: '10 万美元标普 500 历史回报——30 年',
        description:
          '一次性退休金示例：10 万美元投入标普 500，按长期约 10% 的名义历史回报增长 30 年。一个预填好的复利计算器场景。',
        summaryIntro: '如果历史大致重演，一笔六位数投资能变成什么规模。',
        faqs: [
          {
            question: '10 万美元在 10%、30 年下会变成多少？',
            answer: `按 10% 年化回报，余额增长至约 ${r.futureValue.toLocaleString('zh-CN')} 美元——超过起始金额的十倍。`
          },
          {
            question: '这是保证的结果吗？',
            answer: `不是。10% 反映标普 500 的长期平均；实际年份波动很大。${Math.round(r.interestRatio * 100)}% 的利息占比只是说明最终价值中有多少来自复利。`
          },
          {
            question: '为什么用这个预设？',
            answer:
              '它提供具体、可分享的长期增长示意，无需手动录入任何数据。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'millionaire-by-40-monthly-contribution',
    { initialPrincipal: 5000, monthlyContribution: 3200, annualReturnRate: 7, years: 15, compoundingFrequency: 12 },
    (r) => ({
      en: {
        title: 'Millionaire by 40 — Monthly Contribution',
        description:
          'A front-loaded wealth plan: start at 25 with $5,000 and invest $3,200 a month at 7% to approach $1,000,000 by age 40. A pre-filled compound interest calculator scenario.',
        summaryIntro: 'An aggressive saver who wants a seven-figure portfolio before midlife.',
        faqs: [
          {
            question: 'Can I reach $1 million by 40?',
            answer: `Starting at 25 with this plan the portfolio lands at about $${r.futureValue.toLocaleString('en-US')} by year 15 — essentially a million, driven mostly by consistent contributions.`
          },
          {
            question: 'How much of that is my own money?',
            answer: `You contribute roughly $${r.totalPrincipal.toLocaleString('en-US')}; the remaining $${r.totalInterest.toLocaleString('en-US')} is compounded growth on top.`
          },
          {
            question: 'Why a dedicated millionaire scenario?',
            answer:
              'It lets searchers land on a fully worked example instead of a blank form, and the shareable link reproduces the exact setup for later.'
          }
        ]
      },
      de: {
        title: 'Millionär mit 40 — monatliche Einzahlung',
        description:
          'Ein vorzeitig geprägter Vermögensplan: mit 25 Jahren 5.000 $ starten und 3.200 $ pro Monat bei 7 % anlegen, um mit 40 etwa 1.000.000 $ zu erreichen. Ein voreingestelltes Szenario des Zinseszins-Rechners.',
        summaryIntro: 'Ein aggressiver Sparer, der vor der Lebensmitte ein siebenstelliges Portfolio will.',
        faqs: [
          {
            question: 'Kann ich mit 40 Millionär werden?',
            answer: `Mit diesem Plan startet das Portfolio im 15. Jahr bei etwa ${r.futureValue.toLocaleString('de-DE')} $ — faktisch eine Million, vor allem durch konstante Einzahlungen.`
          },
          {
            question: 'Wie viel davon ist mein eigenes Geld?',
            answer: `Du zahlst etwa ${r.totalPrincipal.toLocaleString('de-DE')} $ ein; die übrigen ${r.totalInterest.toLocaleString('de-DE')} $ sind Zinseszinswachstum obendrauf.`
          },
          {
            question: 'Warum ein eigenes Millionär-Szenario?',
            answer:
              'Sucher landen auf einem vollständig ausgearbeiteten Beispiel statt auf einem leeren Formular, und der Teillink reproduziert die exakte Einstellung.'
          }
        ]
      },
      es: {
        title: 'Millonario a los 40 — aporte mensual',
        description:
          'Un plan de riqueza adelantado: empieza a los 25 con 5.000 $ e invierte 3.200 $ al mes al 7 % para acercarte a 1.000.000 $ a los 40. Un escenario preconfigurado de la calculadora de interés compuesto.',
        summaryIntro: 'Un ahorrador agresivo que quiere un patrimonio de siete cifras antes de la mitad de la vida.',
        faqs: [
          {
            question: '¿Puedo llegar a 1 millón a los 40?',
            answer: `Empezando a los 25 con este plan, la cartera llega a unas ${r.futureValue.toLocaleString('es-ES')} $ al año 15 — esencialmente un millón, impulsado sobre todo por aportes constantes.`
          },
          {
            question: '¿Cuánto de eso es mi propio dinero?',
            answer: `Aportas unas ${r.totalPrincipal.toLocaleString('es-ES')} $; las restantes ${r.totalInterest.toLocaleString('es-ES')} $ son crecimiento por interés compuesto.`
          },
          {
            question: '¿Por qué un escenario de millonario aparte?',
            answer:
              'Permite a quien busca aterrizar en un ejemplo ya resuelto en vez de un formulario vacío, y el enlace compartible reproduce la configuración exacta.'
          }
        ]
      },
      zh: {
        title: '40 岁前成为百万富翁——每月定投',
        description:
          '前置式财富计划：25 岁起步拿 5,000 美元，每月投 3,200 美元、7% 回报，争取 40 岁前逼近 100 万美元。一个预填好的复利计算器场景。',
        summaryIntro: '一位激进储蓄者，想在人生中途前就拥有七位数组合。',
        faqs: [
          {
            question: '我能在 40 岁前达到 100 万吗？',
            answer: `按此计划从 25 岁开始，第 15 年组合达到约 ${r.futureValue.toLocaleString('zh-CN')} 美元——基本就是一百万，主要靠持续定投。`
          },
          {
            question: '其中有多少是我自己的钱？',
            answer: `你投入约 ${r.totalPrincipal.toLocaleString('zh-CN')} 美元；其余 ${r.totalInterest.toLocaleString('zh-CN')} 美元是叠加的复利增长。`
          },
          {
            question: '为什么单独做一个百万富翁场景？',
            answer:
              '让搜索者落到一个完整算好的例子，而不是空白表单；可分享链接能精确还原这套设置。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'lump-sum-50k-5-years',
    { initialPrincipal: 50000, monthlyContribution: 0, annualReturnRate: 5, years: 5, compoundingFrequency: 12 },
    (r) => ({
      en: {
        title: '$50,000 Lump Sum — 5 Years',
        description:
          'A short-horizon growth check: $50,000 invested at a 5% annual return for 5 years with monthly compounding. A pre-filled compound interest calculator scenario.',
        summaryIntro: 'A near-term view of what a moderate return adds over just five years.',
        faqs: [
          {
            question: 'What does $50,000 grow to in 5 years at 5%?',
            answer: `With monthly compounding the balance reaches about $${r.futureValue.toLocaleString('en-US')}, earning roughly $${r.totalInterest.toLocaleString('en-US')} in interest.`
          },
          {
            question: 'Why only 5 years?',
            answer: `Short horizons show that compounding needs time to really accelerate — the ${Math.round(r.interestRatio * 100)}% interest share is modest compared with multi-decade plans.`
          },
          {
            question: 'Why use this preset?',
            answer:
              'It is a quick, shareable way to sanity-check a conservative near-term projection before committing capital.'
          }
        ]
      },
      de: {
        title: '50.000 $ Einmalanlage — 5 Jahre',
        description:
          'Ein Kurzfrist-Check: 50.000 $ bei 5 % Jahresrendite über 5 Jahre mit monatlicher Verzinsung. Ein voreingestelltes Szenario des Zinseszins-Rechners.',
        summaryIntro: 'Ein Nahblick darauf, was eine moderate Rendite in nur fünf Jahren bringt.',
        faqs: [
          {
            question: 'Wie viel werden aus 50.000 $ in 5 Jahren bei 5 %?',
            answer: `Bei monatlicher Verzinsung erreicht das Guthaben etwa ${r.futureValue.toLocaleString('de-DE')} $, mit rund ${r.totalInterest.toLocaleString('de-DE')} $ Zinsen.`
          },
          {
            question: 'Warum nur 5 Jahre?',
            answer: `Kurze Horizonte zeigen, dass der Zinseszins Zeit braucht, um wirklich zu beschleunigen — der ${Math.round(r.interestRatio * 100)} %-Zinsanteil fällt gegenüber Jahrzehnte-Plänen bescheiden aus.`
          },
          {
            question: 'Warum dieses Preset nutzen?',
            answer:
              'Es ist eine schnelle, teilbare Möglichkeit, eine konservative Kurzfrist-Prognose zu prüfen, bevor Kapital gebunden wird.'
          }
        ]
      },
      es: {
        title: '50.000 $ aporte único — 5 años',
        description:
          'Una comprobación a corto plazo: 50.000 $ al 5 % anual durante 5 años con capitalización mensual. Un escenario preconfigurado de la calculadora de interés compuesto.',
        summaryIntro: 'Una vista a corto plazo de lo que suma una rentabilidad moderada en solo cinco años.',
        faqs: [
          {
            question: '¿En qué se convierten 50.000 $ en 5 años al 5 %?',
            answer: `Con capitalización mensual el saldo alcanza unas ${r.futureValue.toLocaleString('es-ES')} $, generando unas ${r.totalInterest.toLocaleString('es-ES')} $ de interés.`
          },
          {
            question: '¿Por qué solo 5 años?',
            answer: `Los horizontes cortos muestran que el interés compuesto necesita tiempo para acelerarse de verdad — el ${Math.round(r.interestRatio * 100)} % de interés es modesto frente a planes de décadas.`
          },
          {
            question: '¿Por qué usar este preset?',
            answer:
              'Es una forma rápida y compartible de verificar una proyección conservadora a corto plazo antes de comprometer capital.'
          }
        ]
      },
      zh: {
        title: '5 万美元一次性投入——5 年',
        description:
          '短周期增长检验：5 万美元按 5% 年化回报、按月复利增长 5 年。一个预填好的复利计算器场景。',
        summaryIntro: '一个近景视角，看温和回报在短短五年内能带来什么。',
        faqs: [
          {
            question: '5 万美元在 5 年、5% 下会变成多少？',
            answer: `按月复利，余额达到约 ${r.futureValue.toLocaleString('zh-CN')} 美元，利息约 ${r.totalInterest.toLocaleString('zh-CN')} 美元。`
          },
          {
            question: '为什么只有 5 年？',
            answer: `短周期说明复利需要时间才能真正加速——${Math.round(r.interestRatio * 100)}% 的利息占比相比几十年的计划显得 modest。`
          },
          {
            question: '为什么用这个预设？',
            answer:
              '在投入资金前，这是一种快速、可分享的方式来核查保守的短期预测。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'conservative-saver-3-percent-20-years',
    { initialPrincipal: 20000, monthlyContribution: 200, annualReturnRate: 3, years: 20, compoundingFrequency: 12 },
    (r) => ({
      en: {
        title: 'Conservative Saver — 3% for 20 Years',
        description:
          'A low-risk growth plan: $20,000 plus $200 a month at a cautious 3% annual return over 20 years. A pre-filled compound interest calculator scenario.',
        summaryIntro: 'What patient, low-volatility saving looks like when compounding does the heavy lifting.',
        faqs: [
          {
            question: 'What does a cautious 3% plan build over 20 years?',
            answer: `The balance grows to about $${r.futureValue.toLocaleString('en-US')}, with roughly $${r.totalInterest.toLocaleString('en-US')} earned in interest.`
          },
          {
            question: 'Is 3% realistic for safe investing?',
            answer: `It is a conservative yardstick close to many high-quality bond or cash portfolios. The ${Math.round(r.interestRatio * 100)}% interest share still shows compounding quietly adding to your deposits.`
          },
          {
            question: 'Why use this preset?',
            answer:
              'It frames a realistic, low-risk expectation instead of an optimistic best case, so visitors start from grounded numbers.'
          }
        ]
      },
      de: {
        title: 'Vorsichtiger Sparer — 3 % über 20 Jahre',
        description:
          'Ein risikoarmer Wachstumsplan: 20.000 $ plus 200 $ pro Monat bei vorsichtigen 3 % Jahresrendite über 20 Jahre. Ein voreingestelltes Szenario des Zinseszins-Rechners.',
        summaryIntro: 'Wie geduldiges, niedrigvolatiles Sparen aussieht, wenn der Zinseszins die Arbeit macht.',
        faqs: [
          {
            question: 'Was baut ein vorsichtiger 3 %-Plan in 20 Jahren auf?',
            answer: `Das Guthaben wächst auf etwa ${r.futureValue.toLocaleString('de-DE')} $, mit rund ${r.totalInterest.toLocaleString('de-DE')} $ Zinsen.`
          },
          {
            question: 'Ist 3 % für sicheres Investieren realistisch?',
            answer: `Es ist ein konservativer Maßstab nahe vieler Anleihen- oder Cash-Portfolios. Der ${Math.round(r.interestRatio * 100)} %-Zinsanteil zeigt, dass der Zinseszins leise zu den Einzahlungen hinzukommt.`
          },
          {
            question: 'Warum dieses Preset nutzen?',
            answer:
              'Es setzt eine realistische, risikoarme Erwartung statt eines optimistischen Bestfalls, damit Besucher auf fundierten Zahlen starten.'
          }
        ]
      },
      es: {
        title: 'Ahorrador conservador — 3 % durante 20 años',
        description:
          'Un plan de crecimiento de bajo riesgo: 20.000 $ más 200 $ al mes a un cauteloso 3 % anual durante 20 años. Un escenario preconfigurado de la calculadora de interés compuesto.',
        summaryIntro: 'Cómo se ve un ahorro paciente y de baja volatilidad cuando el interés compuesto hace el trabajo pesado.',
        faqs: [
          {
            question: '¿Qué construye un plan cauteloso del 3 % en 20 años?',
            answer: `El saldo crece a unas ${r.futureValue.toLocaleString('es-ES')} $, con unas ${r.totalInterest.toLocaleString('es-ES')} $ de interés.`
          },
          {
            question: '¿Es realista un 3 % para invertir con seguridad?',
            answer: `Es una referencia conservadora cercana a muchos portafolios de bonos o efectivo de alta calidad. El ${Math.round(r.interestRatio * 100)} % de interés sigue mostrando el interés compuesto sumándose en silencio.`
          },
          {
            question: '¿Por qué usar este preset?',
            answer:
              'Plantea una expectativa realista y de bajo riesgo en vez de un mejor caso optimista, para que los visitantes partan de cifras sólidas.'
          }
        ]
      },
      zh: {
        title: '保守储蓄者——3%，20 年',
        description:
          '低风险增长计划：2 万美元加每月 200 美元，按谨慎的 3% 年化回报坚持 20 年。一个预填好的复利计算器场景。',
        summaryIntro: '当复利承担重任时，耐心、低波动的储蓄会是什么样。',
        faqs: [
          {
            question: '谨慎的 3% 计划在 20 年里能积累多少？',
            answer: `余额增长至约 ${r.futureValue.toLocaleString('zh-CN')} 美元，利息约 ${r.totalInterest.toLocaleString('zh-CN')} 美元。`
          },
          {
            question: '3% 做安全投资现实吗？',
            answer: `这是一个保守基准，接近许多高质量债券或现金组合。${Math.round(r.interestRatio * 100)}% 的利息占比仍显示复利在悄然叠加到你的本金上。`
          },
          {
            question: '为什么用这个预设？',
            answer:
              '它给出一个现实、低预期的基准，而非乐观的最佳情形，让访客从扎实的数字起步。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'early-start-teen-investor-18-to-65',
    { initialPrincipal: 0, monthlyContribution: 100, annualReturnRate: 8, years: 47, compoundingFrequency: 12 },
    (r) => ({
      en: {
        title: 'Early Start — Teen Investor (18 to 65)',
        description:
          'The power of time: a 18-year-old investing just $100 a month at 8% until 65. A pre-filled compound interest calculator scenario.',
        summaryIntro: 'The smallest monthly habit, given the longest runway, wins big.',
        faqs: [
          {
            question: 'What does $100 a month from 18 to 65 become?',
            answer: `Across 47 years the portfolio reaches about $${r.futureValue.toLocaleString('en-US')}, almost all of it compounded interest on tiny deposits.`
          },
          {
            question: 'How much did I actually put in?',
            answer: `You deposited only about $${r.totalPrincipal.toLocaleString('en-US')}; the remaining $${r.totalInterest.toLocaleString('en-US')} is growth — proof that time, not amount, drives compounding.`
          },
          {
            question: 'Why a teen-investor scenario?',
            answer:
              'It makes the single most important personal-finance lesson tangible: start early, stay consistent, let decades do the rest.'
          }
        ]
      },
      de: {
        title: 'Früher Start — Teenager-Investor (18 bis 65)',
        description:
          'Die Kraft der Zeit: ein 18-Jähriger investiert nur 100 $ pro Monat bei 8 % bis 65. Ein voreingestelltes Szenario des Zinseszins-Rechners.',
        summaryIntro: 'Die kleinste monatliche Gewohnheit bei der längsten Laufzeit gewinnt groß.',
        faqs: [
          {
            question: 'Was wird aus 100 $ pro Monat von 18 bis 65?',
            answer: `Über 47 Jahre erreicht das Portfolio etwa ${r.futureValue.toLocaleString('de-DE')} $, fast alles Zinseszinsen auf kleine Einzahlungen.`
          },
          {
            question: 'Wie viel habe ich tatsächlich eingezahlt?',
            answer: `Du zahltest nur etwa ${r.totalPrincipal.toLocaleString('de-DE')} $ ein; die übrigen ${r.totalInterest.toLocaleString('de-DE')} $ sind Wachstum — der Beweis, dass Zeit, nicht Betrag, den Zinseszins treibt.`
          },
          {
            question: 'Warum ein Teenager-Szenario?',
            answer:
              'Es macht die wichtigste Lektion der persönlichen Finanzen greifbar: früh starten, konstant bleiben, den Rest erledigen die Jahrzehnte.'
          }
        ]
      },
      es: {
        title: 'Inicio temprano — inversor adolescente (18 a 65)',
        description:
          'El poder del tiempo: un joven de 18 años invierte solo 100 $ al mes al 8 % hasta los 65. Un escenario preconfigurado de la calculadora de interés compuesto.',
        summaryIntro: 'El hábito mensual más pequeño, con la pista más larga, gana grande.',
        faqs: [
          {
            question: '¿En qué se convierten 100 $ al mes de 18 a 65?',
            answer: `A lo largo de 47 años la cartera alcanza unas ${r.futureValue.toLocaleString('es-ES')} $, casi todo interés compuesto sobre pequeños aportes.`
          },
          {
            question: '¿Cuánto aporté realmente?',
            answer: `Solo aportaste unas ${r.totalPrincipal.toLocaleString('es-ES')} $; las restantes ${r.totalInterest.toLocaleString('es-ES')} $ son crecimiento — prueba de que el tiempo, no el importe, impulsa el interés compuesto.`
          },
          {
            question: '¿Por qué un escenario de adolescente?',
            answer:
              'Hace tangible la lección de finanzas personales más importante: empieza pronto, mantén la constancia y deja que las décadas hagan el resto.'
          }
        ]
      },
      zh: {
        title: '尽早开始——少年投资者（18 到 65 岁）',
        description:
          '时间的力量：一位 18 岁少年每月只投 100 美元、8% 回报，坚持到 65 岁。一个预填好的复利计算器场景。',
        summaryIntro: '最小的每月习惯，配上最长的跑道，赢得最大。',
        faqs: [
          {
            question: '每月 100 美元，从 18 岁到 65 岁会变成多少？',
            answer: `47 年里组合达到约 ${r.futureValue.toLocaleString('zh-CN')} 美元，几乎全部是小额定投产生的复利利息。`
          },
          {
            question: '我实际投入了多少？',
            answer: `你只投入约 ${r.totalPrincipal.toLocaleString('zh-CN')} 美元；其余 ${r.totalInterest.toLocaleString('zh-CN')} 美元是增长——证明驱动复利的是时间而非金额。`
          },
          {
            question: '为什么做少年投资者场景？',
            answer:
              '它让最重要的个人理财道理变得具体：尽早开始、保持恒定，剩下的交给几十年。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'high-earner-2k-monthly-15-years',
    { initialPrincipal: 50000, monthlyContribution: 2000, annualReturnRate: 9, years: 15, compoundingFrequency: 12 },
    (r) => ({
      en: {
        title: 'High Earner — $2,000 Monthly for 15 Years',
        description:
          'An accelerated plan: $50,000 plus $2,000 a month at a 9% annual return over 15 years. A pre-filled compound interest calculator scenario.',
        summaryIntro: 'A higher savings rate that compounds into a serious mid-life nest egg.',
        faqs: [
          {
            question: 'What does $2,000 a month build in 15 years at 9%?',
            answer: `The portfolio reaches about $${r.futureValue.toLocaleString('en-US')}, of which roughly $${r.totalInterest.toLocaleString('en-US')} is compounded interest.`
          },
          {
            question: 'How much did I contribute myself?',
            answer: `You put in about $${r.totalPrincipal.toLocaleString('en-US')}; the rest is growth — a high savings rate plus a solid return do most of the work.`
          },
          {
            question: 'Why use this preset?',
            answer:
              'It models an ambitious but realistic accumulation path and the shareable card makes the result easy to send or save.'
          }
        ]
      },
      de: {
        title: 'Hohes Einkommen — 2.000 $ monatlich für 15 Jahre',
        description:
          'Ein beschleunigter Plan: 50.000 $ plus 2.000 $ pro Monat bei 9 % Jahresrendite über 15 Jahre. Ein voreingestelltes Szenario des Zinseszins-Rechners.',
        summaryIntro: 'Eine höhere Sparrate, die zu einem ordentlichen Ruhestands-Polster in der Lebensmitte compoundiert.',
        faqs: [
          {
            question: 'Was baut 2.000 $ pro Monat in 15 Jahren bei 9 % auf?',
            answer: `Das Portfolio erreicht etwa ${r.futureValue.toLocaleString('de-DE')} $, wovon rund ${r.totalInterest.toLocaleString('de-DE')} $ Zinseszinsen sind.`
          },
          {
            question: 'Wie viel habe ich selbst eingezahlt?',
            answer: `Du zahltest etwa ${r.totalPrincipal.toLocaleString('de-DE')} $ ein; der Rest ist Wachstum — hohe Sparrate plus solide Rendite erledigen die Arbeit.`
          },
          {
            question: 'Warum dieses Preset nutzen?',
            answer:
              'Es modelliert einen ehrgeizigen, aber realistischen Ansparpfad, und die teilbare Karte macht das Ergebnis leicht zu senden oder zu speichern.'
          }
        ]
      },
      es: {
        title: 'Alto ingreso — 2.000 $ al mes durante 15 años',
        description:
          'Un plan acelerado: 50.000 $ más 2.000 $ al mes al 9 % anual durante 15 años. Un escenario preconfigurado de la calculadora de interés compuesto.',
        summaryIntro: 'Una tasa de ahorro mayor que se capitaliza en un serio colchón para la mediana edad.',
        faqs: [
          {
            question: '¿Qué construye 2.000 $ al mes en 15 años al 9 %?',
            answer: `La cartera alcanza unas ${r.futureValue.toLocaleString('es-ES')} $, de las que unas ${r.totalInterest.toLocaleString('es-ES')} $ son interés compuesto.`
          },
          {
            question: '¿Cuánto aporté yo?',
            answer: `Aportaste unas ${r.totalPrincipal.toLocaleString('es-ES')} $; el resto es crecimiento — una alta tasa de ahorro más un buen rendimiento hacen la mayor parte del trabajo.`
          },
          {
            question: '¿Por qué usar este preset?',
            answer:
              'Modela una acumulación ambiciosa pero realista y la tarjeta compartible facilita enviar o guardar el resultado.'
          }
        ]
      },
      zh: {
        title: '高收入者——每月 2,000 美元，15 年',
        description:
          '加速计划：5 万美元加每月 2,000 美元，按 9% 年化回报坚持 15 年。一个预填好的复利计算器场景。',
        summaryIntro: '较高的储蓄率，复合成一笔可观的人生中途储备金。',
        faqs: [
          {
            question: '每月 2,000 美元，在 9%、15 年下能积累多少？',
            answer: `组合达到约 ${r.futureValue.toLocaleString('zh-CN')} 美元，其中约 ${r.totalInterest.toLocaleString('zh-CN')} 美元是复利利息。`
          },
          {
            question: '我自己投入了多少？',
            answer: `你投入约 ${r.totalPrincipal.toLocaleString('zh-CN')} 美元；其余是增长——高储蓄率加上稳健回报完成了大部分工作。`
          },
          {
            question: '为什么用这个预设？',
            answer:
              '它建模了一条雄心勃勃但现实的积累路径，而可分享卡片让结果易于发送或保存。'
          }
        ]
      }
    })
  )
];

export const PRESET_SLUGS = PRESETS.map((p) => p.slug);

export function getPreset(scenario: string): CompoundPreset | undefined {
  return PRESETS.find((p) => p.slug === scenario);
}

/**
 * Build the URL-query seed from a CompoundInput preset, mirroring COMPOUND_URL_KEY in
 * CompoundInterestCalculatorClient. Defaults are omitted so a clean share link only
 * carries the values the preset actually set.
 */
export function compoundInitialQuery(preset: CompoundPreset): Record<string, string> {
  const map: Partial<Record<keyof CompoundInput, string>> = {
    initialPrincipal: 'principal',
    monthlyContribution: 'deposit',
    annualReturnRate: 'rate',
    years: 'years',
    compoundingFrequency: 'freq'
  };
  const q: Record<string, string> = {};
  for (const [key, urlKey] of Object.entries(map) as [keyof CompoundInput, string][]) {
    const v = preset.defaultParams[key];
    if (v !== undefined) q[urlKey] = String(v);
  }
  return q;
}
