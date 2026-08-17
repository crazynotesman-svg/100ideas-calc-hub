/**
 * FIRE pSEO Preset Matrix / FIRE 程序化 SEO 预设矩阵
 * ----------------------------------------------------------------------------
 * Seed scenarios for the FIRE (Financial Independence, Retire Early) calculator.
 * Each preset is a fully described, pre-filled landing page (e.g.
 * /en/calculators/finance/fire-compound-interest-calculator/preset/fat-fire-tech-engineer)
 * with localized title, meta description, scenario summary and a scenario-specific FAQ.
 *
 * The calculator numbers embedded in the copy are computed from the live engine
 * (calculateFire) so the FAQ prose always matches the rendered benchmark section.
 */

import { calculateFire, type FireInput } from '@/lib/calculators/finance/fire';
import type { Locale } from '@/config/i18n.config';
import type { FaqEntry } from '@/lib/seo/schema';

export const FIRE_CATEGORY = 'finance';
export const FIRE_SLUG = 'fire-compound-interest-calculator';

/** Locale-independent route for a scenario page. */
export function presetRoute(scenario: string) {
  return `/calculators/${FIRE_CATEGORY}/${FIRE_SLUG}/preset/${scenario}`;
}

interface LocalizedPreset {
  title: string;
  description: string;
  summaryIntro: string;
  faqs: FaqEntry[];
}

export interface FirePreset {
  slug: string;
  /** Resolved metric input state passed straight to FireCalculator (no CLS on first paint). */
  defaultParams: FireInput;
  localized: Record<Locale, LocalizedPreset>;
}

type Result = ReturnType<typeof calculateFire>;

function buildPreset(
  slug: string,
  defaultParams: FireInput,
  localized: (r: Result) => Record<Locale, LocalizedPreset>
): FirePreset {
  return { slug, defaultParams, localized: localized(calculateFire(defaultParams)) };
}

export const PRESETS: FirePreset[] = [
  buildPreset(
    'fat-fire-tech-engineer',
    {
      currentAge: 35,
      targetRetirementAge: 50,
      initialCapital: 200000,
      monthlyContribution: 6000,
      contributionGrowthRate: 3,
      annualReturnRate: 7,
      inflationRate: 2.5,
      withdrawalRate: 3.5,
      annualExpenses: 120000,
      horizonAge: 65
    },
    (r) => ({
      en: {
        title: 'Fat FIRE for a Tech Engineer',
        description:
          'A high-spending Financial Independence plan for a 35-year-old engineer targeting a $120,000 real annual lifestyle by age 50, with a 3.5% withdrawal rate. A pre-filled FIRE calculator scenario.',
        summaryIntro: 'A senior tech professional who wants a comfortable, premium retirement rather than a lean one.',
        faqs: [
          {
            question: 'How big is the portfolio I need for a $120,000 lifestyle?',
            answer: `With a 3.5% safe withdrawal rate, the FIRE number is about $${r.fireNumber.toLocaleString('en-US')}. At a 7% nominal return and 3% salary growth, the plan projects reaching that target around age ${r.fireAge ?? '—'} (${r.yearsToFire} years from today).`
          },
          {
            question: 'What income will the portfolio safely provide?',
            answer: `In today's purchasing power the portfolio would sustain roughly $${r.sustainableRealIncome.toLocaleString('en-US')} per year at retirement, comfortably above the $120,000 spending target thanks to the conservative withdrawal rate.`
          },
          {
            question: 'Why use this preset instead of a blank form?',
            answer:
              'Presets give search engines and first-time visitors a complete, ready-to-read scenario. You can still change any input — the URL, the share link and the structured data all update live.'
          }
        ]
      },
      de: {
        title: 'Fat FIRE für einen Tech-Ingenieur',
        description:
          'Ein Finanzunabhängigkeits-Plan mit hohen Ausgaben für einen 35-jährigen Ingenieur, der ein reales Jahresbudget von 120.000 $ bis 50 mit einer Entnahmequote von 3,5 % anstrebt. Ein voreingestelltes FIRE-Szenario.',
        summaryIntro: 'Ein erfahrener Tech-Profi, der einen komfortablen, gehobenen Ruhestand statt eines schlanken will.',
        faqs: [
          {
            question: 'Wie groß muss das Portfolio für 120.000 $ Lebenshaltung sein?',
            answer: `Bei einer sicheren Entnahmequote von 3,5 % beträgt die FIRE-Zahl etwa ${r.fireNumber.toLocaleString('de-DE')} $. Bei 7 % Nominalrendite und 3 % Gehaltswachstum wird das Ziel laut Plan etwa mit ${r.fireAge ?? '—'} Jahren (${r.yearsToFire} Jahre ab heute) erreicht.`
          },
          {
            question: 'Welches Einkommen deckt das Portfolio sicher ab?',
            answer: `In heutiger Kaufkraft würde das Portfolio nachhaltig etwa ${r.sustainableRealIncome.toLocaleString('de-DE')} $ pro Jahr im Ruhestand liefern — komfortabel über dem Ausgabenziel von 120.000 $.`
          },
          {
            question: 'Warum dieses Preset statt eines leeren Formulars?',
            answer:
              'Presets liefern Suchmaschinen und Erstbesuchern ein vollständiges, sofort lesbares Szenario. Jede Eingabe lässt sich ändern — URL, Teillink und strukturierte Daten aktualisieren sich live.'
          }
        ]
      },
      es: {
        title: 'Fat FIRE para un ingeniero tecnológico',
        description:
          'Un plan de independencia financiera de alto gasto para un ingeniero de 35 años que busca un estilo de vida real de 120.000 $ anuales a los 50, con una tasa de retiro del 3,5 %. Un escenario de FIRE preconfigurado.',
        summaryIntro: 'Un profesional tech senior que quiere una jubilación cómoda y premium, no una austera.',
        faqs: [
          {
            question: '¿Qué tamaño debe tener la cartera para un estilo de vida de 120.000 $?',
            answer: `Con una tasa de retiro segura del 3,5 %, la cifra FIRE es de unos ${r.fireNumber.toLocaleString('es-ES')} $. Al 7 % nominal y 3 % de crecimiento salarial, el plan proyecta alcanzar el objetivo cerca de los ${r.fireAge ?? '—'} años (${r.yearsToFire} desde hoy).`
          },
          {
            question: '¿Qué ingreso sostendrá la cartera de forma segura?',
            answer: `En poder adquisitivo actual, la cartera sostendría unas ${r.sustainableRealIncome.toLocaleString('es-ES')} $ al año en la jubilación, cómodamente por encima del objetivo de 120.000 $.`
          },
          {
            question: '¿Por qué usar este preset en vez de un formulario en blanco?',
            answer:
              'Los presets dan a los buscadores y visitantes un escenario completo y listo de leer. Puedes cambiar cualquier campo: la URL, el enlace para compartir y los datos estructurados se actualizan en vivo.'
          }
        ]
      },
      zh: {
        title: '技术工程师的 Fat FIRE',
        description:
          '为 35 岁工程师设计的高支出财务独立方案：以 3.5%  withdrawal 率，目标 50 岁时拥有每年 12 万美元（现值）的生活水平。一个预填好的 FIRE 场景。',
        summaryIntro: '一位资深技术专家，想要舒适、宽裕的退休生活，而非极简版。',
        faqs: [
          {
            question: '维持每年 12 万美元生活需要多大的本金？',
            answer: `按 3.5% 安全提取率，FIRE 数字约为 ${r.fireNumber.toLocaleString('zh-CN')} 美元。在 7% 名义回报、3% 薪资增长下，方案预计约 ${r.fireAge ?? '—'} 岁（距今 ${r.yearsToFire} 年）达成目标。`
          },
          {
            question: '退休后组合能稳健提供多少收入？',
            answer: `按当前购买力，组合退休时每年可稳健支持约 ${r.sustainableRealIncome.toLocaleString('zh-CN')} 美元，高于 12 万美元支出目标，得益于保守的提取率。`
          },
          {
            question: '为什么用预设而不是直接填空？',
            answer:
              '预设让搜索引擎和首次访客直接看到一份完整、可读的场景。任何输入都可改——URL、分享链接与结构化数据都会实时更新。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'lean-fire-digital-nomad',
    {
      currentAge: 30,
      targetRetirementAge: 45,
      initialCapital: 80000,
      monthlyContribution: 2000,
      contributionGrowthRate: 2,
      annualReturnRate: 6,
      inflationRate: 2,
      withdrawalRate: 4,
      annualExpenses: 24000,
      horizonAge: 60
    },
    (r) => ({
      en: {
        title: 'Lean FIRE for a Digital Nomad',
        description:
          'A minimalist Financial Independence plan for a 30-year-old nomad targeting a $24,000 real annual budget by age 45 on a 4% withdrawal rate. A ready-made FIRE calculator scenario.',
        summaryIntro: 'A location-independent worker who keeps expenses low so the target portfolio stays small.',
        faqs: [
          {
            question: 'How small can the FIRE number be with a $24,000 budget?',
            answer: `At a 4% safe withdrawal rate the target is about $${r.fireNumber.toLocaleString('en-US')}. With a 6% return and $2,000 monthly contributions, the plan reaches it around age ${r.fireAge ?? '—'} — just ${r.yearsToFire} years away.`
          },
          {
            question: 'Is $24,000 a realistic lean lifestyle?',
            answer: `Yes for a nomad: it works out to about $${(24000 / 12).toLocaleString('en-US')} per month, enough across many low-cost regions. The portfolio would sustain roughly $${r.sustainableRealIncome.toLocaleString('en-US')} per year in today's money.`
          },
          {
            question: 'Why start from this preset?',
            answer:
              'It removes the guesswork: open the page and the calculator is already filled in. Edit anything and the result, share link and schema refresh instantly.'
          }
        ]
      },
      de: {
        title: 'Lean FIRE für einen Digital Nomad',
        description:
          'Ein minimalistischer Finanzunabhängigkeits-Plan für einen 30-jährigen Nomaden, der ein reales Jahresbudget von 24.000 $ bis 45 mit 4 % Entnahmequote anstrebt. Ein fertiges FIRE-Szenario.',
        summaryIntro: 'Eine ortsunabhängige Arbeitskraft, die die Ausgaben niedrig hält, damit das Zielportfolio klein bleibt.',
        faqs: [
          {
            question: 'Wie klein kann die FIRE-Zahl bei 24.000 $ Budget sein?',
            answer: `Bei 4 % sicherer Entnahmequote liegt das Ziel bei etwa ${r.fireNumber.toLocaleString('de-DE')} $. Bei 6 % Rendite und 2.000 $ Monatsbeitrag erreicht der Plan es etwa mit ${r.fireAge ?? '—'} — nur ${r.yearsToFire} Jahre entfernt.`
          },
          {
            question: 'Sind 24.000 $ ein realistischer schlanker Lebensstil?',
            answer: `Ja für einen Nomaden: das sind etwa ${('$' + (24000 / 12).toLocaleString('de-DE'))} pro Monat, ausreichend in vielen günstigen Regionen. Das Portfolio würde nachhaltig etwa ${r.sustainableRealIncome.toLocaleString('de-DE')} $ pro Jahr in heutiger Währung liefern.`
          },
          {
            question: 'Warum mit diesem Preset starten?',
            answer:
              'Es nimmt die Rätselei: Die Seite ist schon ausgefüllt. Ändern Sie etwas, und Ergebnis, Teillink und Schema aktualisieren sofort.'
          }
        ]
      },
      es: {
        title: 'Lean FIRE para un nómada digital',
        description:
          'Un plan de independencia financiera minimalista para un nómada de 30 años que busca un presupuesto real de 24.000 $ anuales a los 45 con una tasa de retiro del 4 %. Un escenario de FIRE listo para usar.',
        summaryIntro: 'Un trabajador sin fronteras que mantiene los gastos bajos para que la cartera objetivo sea pequeña.',
        faqs: [
          {
            question: '¿Qué tan pequeña puede ser la cifra FIRE con 24.000 $?',
            answer: `Con una tasa de retiro segura del 4 %, el objetivo es unos ${r.fireNumber.toLocaleString('es-ES')} $. Al 6 % y 2.000 $ mensuales, el plan lo alcanza cerca de los ${r.fireAge ?? '—'} años — solo ${r.yearsToFire} desde hoy.`
          },
          {
            question: '¿Son 24.000 $ un estilo de vida lean realista?',
            answer: `Sí para un nómada: son unos ${(24000 / 12).toLocaleString('es-ES')} $ al mes, suficiente en muchas regiones de bajo coste. La cartera sostendría unas ${r.sustainableRealIncome.toLocaleString('es-ES')} $ al año en dinero actual.`
          },
          {
            question: '¿Por qué empezar desde este preset?',
            answer:
              'Elimina la suposición: al abrir la página la calculadora ya está rellena. Cambia lo que quieras y el resultado, el enlace para compartir y el esquema se actualizan al instante.'
          }
        ]
      },
      zh: {
        title: '数字游民的 Lean FIRE',
        description:
          '为 30 岁数字游民设计的极简财务独立方案：以 4% 提取率，目标 45 岁时达到每年 2.4 万美元（现值）的预算。一个开箱即用的 FIRE 场景。',
        summaryIntro: '一位不受地点束缚的工作者，靠压低支出让目标本金保持小巧。',
        faqs: [
          {
            question: '2.4 万美元预算下 FIRE 数字能多小？',
            answer: `按 4% 安全提取率，目标约为 ${r.fireNumber.toLocaleString('zh-CN')} 美元。在 6% 回报、每月 2000 美元投入下，方案约 ${r.fireAge ?? '—'} 岁达成——距今仅 ${r.yearsToFire} 年。`
          },
          {
            question: '每年 2.4 万美元算现实的极简生活吗？',
            answer: `对游民来说可以：折合约每月 ${(24000 / 12).toLocaleString('zh-CN')} 美元，在许多低成本地区足够。组合按当前购买力每年可稳健支持约 ${r.sustainableRealIncome.toLocaleString('zh-CN')} 美元。`
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
    'barista-fire-semi-retired',
    {
      currentAge: 40,
      targetRetirementAge: 55,
      initialCapital: 150000,
      monthlyContribution: 1500,
      contributionGrowthRate: 1.5,
      annualReturnRate: 5.5,
      inflationRate: 2.5,
      withdrawalRate: 4,
      annualExpenses: 40000,
      horizonAge: 70
    },
    (r) => ({
      en: {
        title: 'Barista FIRE — Semi-Retired',
        description:
          'A semi-retired plan for a 40-year-old: quit the full-time grind at 55 while part-time work covers basics. $40,000 real annual spend, 4% withdrawal rate. A pre-filled FIRE calculator scenario.',
        summaryIntro: 'Someone who reduces hours instead of stopping completely, so the portfolio only covers the gap.',
        faqs: [
          {
            question: 'How much do I actually need if I keep a side income?',
            answer: `With a 4% withdrawal rate the gross FIRE number is about $${r.fireNumber.toLocaleString('en-US')}, but because part-time work offsets spending the plan only needs to bridge the gap. It projects reaching the target around age ${r.fireAge ?? '—'} (${r.yearsToFire} years).`
          },
          {
            question: 'What does the portfolio pay on its own?',
            answer: `In today's money the portfolio would generate roughly $${r.sustainableRealIncome.toLocaleString('en-US')} per year at retirement — the rest comes from light part-time income.`
          },
          {
            question: 'What changes in this preset?',
            answer:
              'Only the inputs. The formula, the results and the FAQ schema reflect this exact profile and update if you edit it.'
          }
        ]
      },
      de: {
        title: 'Barista FIRE — halb im Ruhestand',
        description:
          'Ein halb im Ruhestand befindlicher Plan für einen 40-Jährigen: mit 55 den Vollzeitjob quittieren, während Teilzeit das Nötigste deckt. 40.000 $ realer Jahresaufwand, 4 % Entnahmequote. Ein voreingestelltes FIRE-Szenario.',
        summaryIntro: 'Jemand, der die Stunden reduziert statt ganz aufzuhören, sodass das Portfolio nur die Lücke füllt.',
        faqs: [
          {
            question: 'Wie viel brauche ich wirklich, wenn ich Nebeneinkommen behalte?',
            answer: `Bei 4 % Entnahmequote liegt die Brutto-FIRE-Zahl bei etwa ${r.fireNumber.toLocaleString('de-DE')} $, aber da Teilzeit die Ausgaben ausgleicht, muss der Plan nur die Lücke schließen. Erreicht wird das Ziel laut Plan etwa mit ${r.fireAge ?? '—'} (${r.yearsToFire} Jahre).`
          },
          {
            question: 'Was zahlt das Portfolio allein?',
            answer: `In heutiger Währung würde das Portfolio nachhaltig etwa ${r.sustainableRealIncome.toLocaleString('de-DE')} $ pro Jahr im Ruhestand liefern — der Rest kommt aus leichter Teilzeit.`
          },
          {
            question: 'Was ändert sich in diesem Preset?',
            answer:
              'Nur die Eingaben. Formel, Ergebnisse und FAQ-Schema spiegeln genau dieses Profil wider und aktualisieren sich bei Änderungen.'
          }
        ]
      },
      es: {
        title: 'Barista FIRE — semijubilado',
        description:
          'Un plan semijubilado para alguien de 40 años: dejar el trabajo a tiempo completo a los 55 mientras un trabajo a tiempo parcial cubre lo básico. 40.000 $ de gasto anual real, tasa de retiro del 4 %. Un escenario de FIRE preconfigurado.',
        summaryIntro: 'Alguien que reduce horas en vez de parar del todo, así la cartera solo cubre el hueco.',
        faqs: [
          {
            question: '¿Cuánto necesito realmente si mantengo ingresos extra?',
            answer: `Con una tasa de retiro del 4 %, la cifra FIRE bruta es unos ${r.fireNumber.toLocaleString('es-ES')} $, pero como el trabajo parcial compensa gastos el plan solo debe cubrir la brecha. Proyecta alcanzar el objetivo cerca de los ${r.fireAge ?? '—'} años (${r.yearsToFire}).`
          },
          {
            question: '¿Qué paga la cartera por sí sola?',
            answer: `En dinero actual la cartera generaría unas ${r.sustainableRealIncome.toLocaleString('es-ES')} $ al año en la jubilación — el resto viene de ingresos ligeros a tiempo parcial.`
          },
          {
            question: '¿Qué cambia en este preset?',
            answer:
              'Solo las entradas. La fórmula, los resultados y el esquema de FAQ reflejan exactamente este perfil y se actualizan si lo editas.'
          }
        ]
      },
      zh: {
        title: 'Barista FIRE — 半退休',
        description:
          '为 40 岁人群设计的半退休方案：55 岁退出全职，靠兼职覆盖基本开支。每年 4 万美元（现值）支出、4% 提取率。一个预填的 FIRE 场景。',
        summaryIntro: '选择减少工时而非彻底停工的人，于是组合只需补上缺口。',
        faqs: [
          {
            question: '如果保留兼职收入，我实际需要多少？',
            answer: `按 4% 提取率，FIRE 毛额约为 ${r.fireNumber.toLocaleString('zh-CN')} 美元；但因兼职抵消了支出，方案只需补上缺口。预计约 ${r.fireAge ?? '—'} 岁（${r.yearsToFire} 年）达成目标。`
          },
          {
            question: '组合自身能支付多少？',
            answer: `按当前购买力，退休时组合每年可生成约 ${r.sustainableRealIncome.toLocaleString('zh-CN')} 美元——其余来自轻松的兼职收入。`
          },
          {
            question: '这个预设改了什么？',
            answer:
              '只改了输入。公式、结果和 FAQ 结构化数据都严格反映这份画像，你编辑后会同步更新。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'coast-fire-early-career',
    {
      currentAge: 25,
      targetRetirementAge: 40,
      initialCapital: 50000,
      monthlyContribution: 2500,
      contributionGrowthRate: 2,
      annualReturnRate: 7,
      inflationRate: 2.5,
      withdrawalRate: 4,
      annualExpenses: 50000,
      horizonAge: 65
    },
    (r) => ({
      en: {
        title: 'Coast FIRE in Your 20s',
        description:
          'An early-career Coast FIRE plan: save aggressively until 40, then let compounding carry the portfolio to a $50,000 real annual target with no more contributions. A ready FIRE calculator scenario.',
        summaryIntro: 'A young saver who front-loads contributions and then coasts on market growth.',
        faqs: [
          {
            question: 'When can I stop contributing entirely?',
            answer: `With 7% returns and front-loaded savings, the projection reaches the FIRE number of about $${r.fireNumber.toLocaleString('en-US')} around age ${r.fireAge ?? '—'} — after that, growth alone covers a $50,000 real lifestyle without further deposits.`
          },
          {
            question: 'What is the sustainable income at the finish line?',
            answer: `By retirement the portfolio sustains roughly $${r.sustainableRealIncome.toLocaleString('en-US')} per year in today's money, comfortably above the $50,000 spending target thanks to decades of compounding.`
          },
          {
            question: 'Why a dedicated Coast FIRE scenario?',
            answer:
              'It lets searchers land on a fully worked example instead of a blank form, and the shareable URL reproduces the exact setup for later.'
          }
        ]
      },
      de: {
        title: 'Coast FIRE mit 20',
        description:
          'Ein Coast-FIRE-Plan für den Berufsstart: bis 40 aggressiv sparen, dann die Zinseszinsen das Portfolio zu einem realen Jahresziel von 50.000 $ tragen — ohne weitere Einzahlungen. Ein fertiges FIRE-Szenario.',
        summaryIntro: 'Ein junger Sparer, der Einzahlungen vorzieht und dann auf dem Marktwachstum „coastet".',
        faqs: [
          {
            question: 'Wann kann ich ganz aufhören einzuzahlen?',
            answer: `Bei 7 % Rendite und vorzeitigem Sparen erreicht die Prognose die FIRE-Zahl von etwa ${r.fireNumber.toLocaleString('de-DE')} $ um das ${r.fireAge ?? '—'}. Alter — danach deckt allein das Wachstum 50.000 $ reale Lebenshaltung ohne weitere Einzahlungen.`
          },
          {
            question: 'Wie hoch ist das nachhaltige Einkommen am Ziel?',
            answer: `Zur Ruhestandszeit trägt das Portfolio nachhaltig etwa ${r.sustainableRealIncome.toLocaleString('de-DE')} $ pro Jahr in heutiger Währung, komfortabel über dem 50.000-$-Ziel dank jahrzehntelanger Zinseszinsen.`
          },
          {
            question: 'Warum ein eigenes Coast-FIRE-Szenario?',
            answer:
              'Sucher landen auf einem vollständig ausgearbeiteten Beispiel statt auf einem leeren Formular, und der Teillink reproduziert die exakte Einstellung.'
          }
        ]
      },
      es: {
        title: 'Coast FIRE en la veintena',
        description:
          'Un plan Coast FIRE para el inicio de carrera: ahorra agresivamente hasta los 40, luego deja que el interés compuesto lleve la cartera a un objetivo real de 50.000 $ anuales sin más aportes. Un escenario de FIRE listo para usar.',
        summaryIntro: 'Un ahorrador joven que adelanta aportes y luego navega con el crecimiento del mercado.',
        faqs: [
          {
            question: '¿Cuándo puedo dejar de aportar por completo?',
            answer: `Con un 7 % de retorno y ahorro adelantado, la proyección alcanza la cifra FIRE de unos ${r.fireNumber.toLocaleString('es-ES')} $ cerca de los ${r.fireAge ?? '—'} años — después, solo el crecimiento cubre 50.000 $ reales sin más depósitos.`
          },
          {
            question: '¿Cuál es el ingreso sostenible al final?',
            answer: `Al jubilarse, la cartera sostiene unas ${r.sustainableRealIncome.toLocaleString('es-ES')} $ al año en dinero actual, cómodamente por encima del objetivo de 50.000 $ gracias a décadas de interés compuesto.`
          },
          {
            question: '¿Por qué un escenario de Coast FIRE aparte?',
            answer:
              'Permite a quien busca aterrizar en un ejemplo ya resuelto en vez de un formulario vacío, y el enlace compartible reproduce la configuración exacta.'
          }
        ]
      },
      zh: {
        title: '二十多岁的 Coast FIRE',
        description:
          '为职业生涯早期设计的 Coast FIRE 方案：40 岁前激进储蓄，之后让复利把组合带到每年 5 万美元（现值）目标，无需再投入。一个现成的 FIRE 场景。',
        summaryIntro: '一位提前把储蓄前置、之后靠市场增长“滑行”的年轻储蓄者。',
        faqs: [
          {
            question: '我什么时候可以完全停止投入？',
            answer: `在 7% 回报、前置储蓄下，方案约 ${r.fireAge ?? '—'} 岁达到约 ${r.fireNumber.toLocaleString('zh-CN')} 美元的 FIRE 数字——此后仅靠增长就能支撑每年 5 万美元（现值）的生活，无需再存款。`
          },
          {
            question: '终点时可持续收入是多少？',
            answer: `到退休时，组合按当前购买力每年可稳健支持约 ${r.sustainableRealIncome.toLocaleString('zh-CN')} 美元，得益于数十年的复利，轻松高于 5 万美元支出目标。`
          },
          {
            question: '为什么单独做一个 Coast FIRE 场景？',
            answer:
              '让搜索者落到一个完整算好的例子，而不是空白表单；可分享链接能精确还原这套设置。'
          }
        ]
      }
    })
  )
];

export const PRESET_SLUGS = PRESETS.map((p) => p.slug);

export function getPreset(scenario: string): FirePreset | undefined {
  return PRESETS.find((p) => p.slug === scenario);
}

/**
 * Build the URL-query seed from a FireInput preset, mirroring FIRE_URL_KEY in FireCalculator.
 * Defaults are omitted so a clean share link only carries the values the preset actually set.
 */
export function fireInitialQuery(preset: FirePreset): Record<string, string> {
  const map: Partial<Record<keyof FireInput, string>> = {
    currentAge: 'age',
    targetRetirementAge: 'retire',
    initialCapital: 'capital',
    monthlyContribution: 'contrib',
    contributionGrowthRate: 'cgrowth',
    annualReturnRate: 'areturn',
    inflationRate: 'infl',
    withdrawalRate: 'withdraw',
    annualExpenses: 'expenses',
    horizonAge: 'horizon'
  };
  const q: Record<string, string> = {};
  for (const [key, urlKey] of Object.entries(map) as [keyof FireInput, string][]) {
    const v = preset.defaultParams[key];
    if (v !== undefined) q[urlKey] = String(v);
  }
  return q;
}
