/**
 * Schengen pSEO Preset Matrix / 申根 程序化 SEO 预设矩阵
 * ----------------------------------------------------------------------------
 * Seed scenarios for the Schengen 90/180 calculator. Each preset is a fully
 * described, pre-filled landing page (e.g.
 * /en/calculators/travel/schengen-visa-calculator/preset/90-day-rule-tourist)
 * with localized title, meta description, scenario summary and a scenario-specific FAQ.
 *
 * The calculator numbers embedded in the copy are computed from the live engine
 * (calculateSchengen) so the FAQ prose always matches the rendered benchmark section.
 */

import { calculateSchengen, type Trip } from '@/lib/calculators/travel/schengen';
import type { Locale } from '@/config/i18n.config';
import type { FaqEntry } from '@/lib/seo/schema';

export const SCHENGEN_CATEGORY = 'travel';
export const SCHENGEN_SLUG = 'schengen-visa-calculator';

/** Locale-independent route for a scenario page. */
export function presetRoute(scenario: string) {
  return `/calculators/${SCHENGEN_CATEGORY}/${SCHENGEN_SLUG}/preset/${scenario}`;
}

interface LocalizedPreset {
  title: string;
  description: string;
  summaryIntro: string;
  faqs: FaqEntry[];
}

export interface SchengenPresetInput {
  /** Reference ("as of") date the 180-day window is evaluated against. */
  referenceDate: string;
  /** Pre-filled trips, each as an entry|exit ISO-date pair. */
  trips: Trip[];
}

export interface SchengenPreset {
  slug: string;
  /** Fixed inputs passed straight to SchengenCalculator (no CLS on first paint). */
  defaultParams: SchengenPresetInput;
  localized: Record<Locale, LocalizedPreset>;
}

type Result = ReturnType<typeof calculateSchengen>;

const df = (iso: string, locale: string) =>
  new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${iso}T00:00:00Z`)
  );

function buildPreset(
  slug: string,
  defaultParams: SchengenPresetInput,
  localized: (r: Result) => Record<Locale, LocalizedPreset>
): SchengenPreset {
  return {
    slug,
    defaultParams,
    localized: localized(calculateSchengen(defaultParams.trips, defaultParams.referenceDate))
  };
}

export const PRESETS: SchengenPreset[] = [
  buildPreset(
    '90-day-rule-tourist',
    {
      referenceDate: '2026-09-15',
      trips: [{ id: 'p1', entryDate: '2026-06-23', exitDate: '2026-09-15' }]
    },
    (r) => ({
      en: {
        title: 'The 90/180-Day Rule for Tourists',
        description:
          'A single 85-day stay inside one 180-day window: how the Schengen 90/180 rule counts your days and what remains. A pre-filled Schengen calculator scenario.',
        summaryIntro: 'A long summer in Europe that pushes close to the 90-day ceiling.',
        faqs: [
          {
            question: 'How many days have I used in the current 180-day window?',
            answer: `From the reference date of 15 Sep 2026, this trip uses ${r.daysUsed} of the 90 allowed days, leaving ${r.daysRemaining} days. A single continuous stay of this length is exactly what the rule is designed to cap.`
          },
          {
            question: 'When can I re-enter the Schengen Area?',
            answer: `After this stay you can legally re-enter on ${r.nextEntryDate ? df(r.nextEntryDate, 'en-US') : '—'}, and the full 90-day allowance resets on ${df(r.fullResetDate, 'en-US')}.`
          },
          {
            question: 'Why use this preset instead of a blank form?',
            answer:
              'Presets give search engines and first-time visitors a complete, ready-to-read scenario. You can still change any date — the URL, the share link and the structured data all update live.'
          }
        ]
      },
      de: {
        title: 'Die 90/180-Tage-Regel für Touristen',
        description:
          'Ein einzelner 85-tägiger Aufenthalt innerhalb eines 180-Tage-Fensters: wie die Schengen-90/180-Regel Ihre Tage zählt und was übrig bleibt. Ein voreingestelltes Schengen-Szenario.',
        summaryIntro: 'Ein langer Sommer in Europa, der nahe an die 90-Tage-Obergrenze reicht.',
        faqs: [
          {
            question: 'Wie viele Tage habe ich im aktuellen 180-Tage-Fenster verbraucht?',
            answer: `Bezogen auf den 15.09.2026 verbraucht diese Reise ${r.daysUsed} der erlaubten 90 Tage, es bleiben ${r.daysRemaining}. Ein durchgehender Aufenthalt dieser Länge ist genau das, was die Regel begrenzen soll.`
          },
          {
            question: 'Wann darf ich wieder in den Schengen-Raum einreisen?',
            answer: `Nach diesem Aufenthalt dürfen Sie rechtmäßig wieder am ${r.nextEntryDate ? df(r.nextEntryDate, 'de-DE') : '—'} einreisen, und das volle 90-Tage-Kontingent setzt am ${df(r.fullResetDate, 'de-DE')} neu an.`
          },
          {
            question: 'Warum dieses Preset statt eines leeren Formulars?',
            answer:
              'Presets liefern Suchmaschinen und Erstbesuchern ein vollständiges, sofort lesbares Szenario. Jedes Datum lässt sich ändern — URL, Teillink und strukturierte Daten aktualisieren sich live.'
          }
        ]
      },
      es: {
        title: 'La regla 90/180 para turistas',
        description:
          'Una estancia única de 85 días dentro de una ventana de 180 días: cómo la regla Schengen 90/180 cuenta tus días y qué queda. Un escenario de calculadora Schengen preconfigurado.',
        summaryIntro: 'Un verano largo en Europa que roza el límite de 90 días.',
        faqs: [
          {
            question: '¿Cuántos días he usado en la ventana de 180 días actual?',
            answer: `Desde la fecha de referencia 15 sep 2026, este viaje usa ${r.daysUsed} de los 90 días permitidos, quedando ${r.daysRemaining}. Una estancia continua de esta longitud es justo lo que la regla limita.`
          },
          {
            question: '¿Cuándo puedo volver a entrar en el Espacio Schengen?',
            answer: `Tras esta estancia puedes reingresar legalmente el ${r.nextEntryDate ? df(r.nextEntryDate, 'es-ES') : '—'}, y el contingente completo de 90 días se reinicia el ${df(r.fullResetDate, 'es-ES')}.`
          },
          {
            question: '¿Por qué usar este preset en vez de un formulario en blanco?',
            answer:
              'Los presets dan a los buscadores y visitantes un escenario completo y listo de leer. Puedes cambiar cualquier fecha: la URL, el enlace para compartir y los datos estructurados se actualizan en vivo.'
          }
        ]
      },
      zh: {
        title: '游客的 90/180 天规则',
        description:
          '在单一 180 天窗口内一次停留 85 天：申根 90/180 规则如何计算你的天数、还剩多少。一个预填好的申根计算器场景。',
        summaryIntro: '在欧洲度过的一个悠长夏天，已逼近 90 天上限。',
        faqs: [
          {
            question: '当前 180 天窗口我已用了多少天？',
            answer: `以 2026 年 9 月 15 日为参考日，这次行程用掉 90 天额度中的 ${r.daysUsed} 天，还剩 ${r.daysRemaining} 天。这种长度的连续停留正是该规则要限制的。`
          },
          {
            question: '我何时能再次进入申根区？',
            answer: `本次停留之后，你可于 ${r.nextEntryDate ? df(r.nextEntryDate, 'zh-CN') : '—'} 合法再次入境，完整的 90 天额度将在 ${df(r.fullResetDate, 'zh-CN')} 重置。`
          },
          {
            question: '为什么用预设而不是直接填空？',
            answer:
              '预设让搜索引擎和首次访客直接看到一份完整、可读的场景。任何日期都可改——URL、分享链接与结构化数据都会实时更新。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'frequent-business-traveler',
    {
      referenceDate: '2026-10-01',
      trips: [
        { id: 'p1', entryDate: '2026-04-10', exitDate: '2026-04-20' },
        { id: 'p2', entryDate: '2026-06-05', exitDate: '2026-06-25' },
        { id: 'p3', entryDate: '2026-08-15', exitDate: '2026-09-10' },
        { id: 'p4', entryDate: '2026-09-20', exitDate: '2026-10-01' }
      ]
    },
    (r) => ({
      en: {
        title: 'Frequent Business Traveler',
        description:
          'Four short Schengen trips across one 180-day window: see how repeated short stays add up and how many days remain. A ready-made Schengen calculator scenario.',
        summaryIntro: 'A consultant hopping between European offices several times a year.',
        faqs: [
          {
            question: 'Do several short trips count together?',
            answer: `Yes. Across the window ending 1 Oct 2026 these four trips total ${r.daysUsed} days (${r.daysRemaining} remaining). The 90/180 rule sums every day of presence, no matter how the trips are split.`
          },
          {
            question: 'How many consecutive days could I still add?',
            answer: `From the next legal entry on ${r.nextEntryDate ? df(r.nextEntryDate, 'en-US') : '—'} you could stay up to ${r.maxConsecutiveDays} consecutive days before breaching the rule.`
          },
          {
            question: 'Why start from this preset?',
            answer:
              'It removes the guesswork: open the page and the calculator is already filled in. Edit any date and the result, share link and schema refresh instantly.'
          }
        ]
      },
      de: {
        title: 'Häufig reisender Geschäftsreisender',
        description:
          'Vier kurze Schengen-Reisen in einem 180-Tage-Fenster: sehen Sie, wie sich wiederholte Kurzaufenthalte addieren und wie viele Tage bleiben. Ein fertiges Schengen-Szenario.',
        summaryIntro: 'Ein Berater, der mehrmals im Jahr zwischen europäischen Büros pendelt.',
        faqs: [
          {
            question: 'Zählen mehrere kurze Reisen zusammen?',
            answer: `Ja. Im Fenster bis 1. Okt 2026 summieren sich diese vier Reisen auf ${r.daysUsed} Tage (${r.daysRemaining} verbleiben). Die 90/180-Regel zählt jeden Anwesenheitstag, egal wie die Reisen aufgeteilt sind.`
          },
          {
            question: 'Wie viele aufeinanderfolgende Tage könnte ich noch hinzufügen?',
            answer: `Ab der nächsten legalen Einreise am ${r.nextEntryDate ? df(r.nextEntryDate, 'de-DE') : '—'} könnten Sie bis zu ${r.maxConsecutiveDays} aufeinanderfolgende Tage bleiben, bevor die Regel verletzt wird.`
          },
          {
            question: 'Warum mit diesem Preset starten?',
            answer:
              'Es nimmt die Rätselei: Die Seite ist schon ausgefüllt. Ändern Sie ein Datum, und Ergebnis, Teillink und Schema aktualisieren sofort.'
          }
        ]
      },
      es: {
        title: 'Viajero de negocios frecuente',
        description:
          'Cuatro viajes cortos al Schengen en una ventana de 180 días: ve cómo se suman las estancias cortas repetidas y cuántos días quedan. Un escenario de calculadora Schengen listo para usar.',
        summaryIntro: 'Un consultor que salta entre oficinas europeas varias veces al año.',
        faqs: [
          {
            question: '¿Cuentan juntas varias escapadas cortas?',
            answer: `Sí. En la ventana que termina el 1 oct 2026, estos cuatro viajes suman ${r.daysUsed} días (quedan ${r.daysRemaining}). La regla 90/180 suma cada día de presencia, sin importar cómo se dividan los viajes.`
          },
          {
            question: '¿Cuántos días consecutivos podría añadir aún?',
            answer: `Desde la próxima entrada legal el ${r.nextEntryDate ? df(r.nextEntryDate, 'es-ES') : '—'} podrías estar hasta ${r.maxConsecutiveDays} días consecutivos antes de incumplir la regla.`
          },
          {
            question: '¿Por qué empezar desde este preset?',
            answer:
              'Elimina la suposición: al abrir la página la calculadora ya está rellena. Cambia cualquier fecha y el resultado, el enlace para compartir y el esquema se actualizan al instante.'
          }
        ]
      },
      zh: {
        title: '频繁出差的商务旅客',
        description:
          '在单个 180 天窗口内四次短途申根行程：看看多次短暂停留如何累加、还剩多少天。一个开箱即用的申根计算器场景。',
        summaryIntro: '一位一年中要往返欧洲多个办公室多次的顾问。',
        faqs: [
          {
            question: '多次短途旅行会合并计算吗？',
            answer: `会。在截至 2026 年 10 月 1 日的窗口内，这四次行程共 ${r.daysUsed} 天（剩 ${r.daysRemaining} 天）。90/180 规则累加每一个在境天数，不论行程如何拆分。`
          },
          {
            question: '我还能连续增加多少天？',
            answer: `从 ${r.nextEntryDate ? df(r.nextEntryDate, 'zh-CN') : '—'} 下一次合法入境起，你可连续停留最多 ${r.maxConsecutiveDays} 天而不违反规则。`
          },
          {
            question: '为什么从这个预设开始？',
            answer:
              '它省去试错：打开页面计算器就已填好。改任意日期，结果、分享链接与结构化数据都会即时刷新。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'digital-nomad-schengen-shuffle',
    {
      referenceDate: '2026-11-15',
      trips: [
        { id: 'p1', entryDate: '2026-07-01', exitDate: '2026-07-20' },
        { id: 'p2', entryDate: '2026-08-25', exitDate: '2026-09-20' },
        { id: 'p3', entryDate: '2026-10-10', exitDate: '2026-10-30' }
      ]
    },
    (r) => ({
      en: {
        title: 'Digital Nomad Schengen Shuffle',
        description:
          'Three split Schengen stays with gaps in between: how leaving the area resets the rolling window so you stay legal. A pre-filled Schengen calculator scenario.',
        summaryIntro: 'A nomad who hops in and out, spending the gaps in non-Schengen countries.',
        faqs: [
          {
            question: 'How do the gaps keep me under 90 days?',
            answer: `Because the 180-day window rolls forward, the three stays total only ${r.daysUsed} days in the active window (${r.daysRemaining} remaining) — the earlier days drop out as the window slides past them.`
          },
          {
            question: 'What is the longest legal stay I could add now?',
            answer: `From ${r.nextEntryDate ? df(r.nextEntryDate, 'en-US') : '—'} you could add up to ${r.maxConsecutiveDays} consecutive days without breaching the 90-day cap.`
          },
          {
            question: 'What changes in this preset?',
            answer:
              'Only the inputs. The formula, the results and the FAQ schema reflect this exact profile and update if you edit it.'
          }
        ]
      },
      de: {
        title: 'Digital-Nomad-Schengen-Shuffle',
        description:
          'Drei getrennte Schengen-Aufenthalte mit Lücken dazwischen: wie das Verlassen des Raums das rollende Fenster zurücksetzt, sodass Sie legal bleiben. Ein voreingestelltes Schengen-Szenario.',
        summaryIntro: 'Ein Nomade, der rein und raus springt und die Lücken in Nicht-Schengen-Ländern verbringt.',
        faqs: [
          {
            question: 'Wie halten mich die Lücken unter 90 Tagen?',
            answer: `Da sich das 180-Tage-Fenster vorwärts rollt, summieren sich die drei Aufenthalte im aktiven Fenster nur auf ${r.daysUsed} Tage (${r.daysRemaining} verbleiben) — frühere Tage fallen heraus, sobald das Fenster an ihnen vorbeigleitet.`
          },
          {
            question: 'Was ist der längste legale Aufenthalt, den ich nun addieren könnte?',
            answer: `Ab ${r.nextEntryDate ? df(r.nextEntryDate, 'de-DE') : '—'} könnten Sie bis zu ${r.maxConsecutiveDays} aufeinanderfolgende Tage hinzufügen, ohne die 90-Tage-Grenze zu verletzen.`
          },
          {
            question: 'Was ändert sich in diesem Preset?',
            answer:
              'Nur die Eingaben. Formel, Ergebnisse und FAQ-Schema spiegeln genau dieses Profil wider und aktualisieren sich bei Änderungen.'
          }
        ]
      },
      es: {
        title: 'Nomada digital: el baile Schengen',
        description:
          'Tres estancias Schengen divididas con huecos entre medias: cómo salir del área reinicia la ventana rodante para seguir legal. Un escenario de calculadora Schengen preconfigurado.',
        summaryIntro: 'Un nómada que entra y sale, pasando las pausas en países no Schengen.',
        faqs: [
          {
            question: '¿Cómo me mantienen bajo 90 días los huecos?',
            answer: `Como la ventana de 180 días rueda hacia adelante, las tres estancias suman solo ${r.daysUsed} días en la ventana activa (quedan ${r.daysRemaining}) — los días anteriores salen cuando la ventana los supera.`
          },
          {
            question: '¿Cuál es la estancia legal más larga que podría añadir ahora?',
            answer: `Desde ${r.nextEntryDate ? df(r.nextEntryDate, 'es-ES') : '—'} podrías añadir hasta ${r.maxConsecutiveDays} días consecutivos sin superar el límite de 90.`
          },
          {
            question: '¿Qué cambia en este preset?',
            answer:
              'Solo las entradas. La fórmula, los resultados y el esquema de FAQ reflejan exactamente este perfil y se actualizan si lo editas.'
          }
        ]
      },
      zh: {
        title: '数字游民的申根卡点跳板',
        description:
          '三段中间留有空档的申根停留：离开申根区如何让滚动窗口重置，从而保持合法。一个预填的申根计算器场景。',
        summaryIntro: '一位进进出出、把空档期安排在申根以外国家的游民。',
        faqs: [
          {
            question: '这些空档怎样帮我守住 90 天？',
            answer: `因为 180 天窗口向前滚动，三段停留只在当前活动窗口内合计 ${r.daysUsed} 天（剩 ${r.daysRemaining} 天）——较早的天数会随窗口滑过而移出。`
          },
          {
            question: '现在我最长能合法增加多少天？',
            answer: `从 ${r.nextEntryDate ? df(r.nextEntryDate, 'zh-CN') : '—'} 起，你可再连续停留最多 ${r.maxConsecutiveDays} 天而不突破 90 天上限。`
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
    'overstay-risk-checker',
    {
      referenceDate: '2026-09-30',
      trips: [
        { id: 'p1', entryDate: '2026-06-01', exitDate: '2026-08-15' },
        { id: 'p2', entryDate: '2026-09-10', exitDate: '2026-09-30' }
      ]
    },
    (r) => ({
      en: {
        title: 'Overstay Risk Checker',
        description:
          'A long summer stay plus a late return: see exactly where the 90-day cap is breached and when the allowance resets. A pre-filled Schengen calculator scenario.',
        summaryIntro: 'A traveler who risks crossing the line with a second trip too close to the first.',
        faqs: [
          {
            question: 'Have I overstayed in this example?',
            answer: `Yes — the two trips total ${r.daysUsed} days in the window ending 30 Sep 2026, which exceeds the 90-day limit by ${r.overstayDays} days${
              r.violations.length ? `, triggering ${r.violations.length} violation date(s)` : ''
            }. The earliest the full allowance returns is ${df(r.fullResetDate, 'en-US')}.`
          },
          {
            question: 'When can I legally re-enter?',
            answer: `The next legal entry is ${r.nextEntryDate ? df(r.nextEntryDate, 'en-US') : '—'}. Staying out until then avoids compounding the breach.`
          },
          {
            question: 'Why use this preset?',
            answer:
              'It lets searchers land on a fully worked overstay example instead of a blank form, and the shareable URL reproduces the exact setup for later.'
          }
        ]
      },
      de: {
        title: 'Overstay-Risiko-Check',
        description:
          'Ein langer Sommeraufenthalt plus eine späte Rückkehr: sehen Sie genau, wo die 90-Tage-Grenze überschritten wird und wann das Kontingent zurückgesetzt wird. Ein voreingestelltes Schengen-Szenario.',
        summaryIntro: 'Ein Reisender, der mit einer zweiten Reise zu nah an der ersten die Grenze riskiert.',
        faqs: [
          {
            question: 'Habe ich in diesem Beispiel die Frist überschritten?',
            answer: `Ja — die beiden Reisen summieren sich auf ${r.daysUsed} Tage im Fenster bis 30.09.2026, was das 90-Tage-Limit um ${r.overstayDays} Tage überschreitet${
              r.violations.length ? ` und ${r.violations.length} Verstoßdatum(en) auslöst` : ''
            }. Das volle Kontingent kehrt frühestens am ${df(r.fullResetDate, 'de-DE')} zurück.`
          },
          {
            question: 'Wann darf ich legal wieder einreisen?',
            answer: `Die nächste legale Einreise ist ${r.nextEntryDate ? df(r.nextEntryDate, 'de-DE') : '—'}. Bis dahin draußen bleiben verhindert eine Häufung des Verstoßes.`
          },
          {
            question: 'Warum dieses Preset verwenden?',
            answer:
              'Sucher landen auf einem vollständig ausgearbeiteten Overstay-Beispiel statt auf einem leeren Formular, und der Teillink reproduziert die exakte Einstellung.'
          }
        ]
      },
      es: {
        title: 'Comprobador de riesgo de sobreestancia',
        description:
          'Un largo verano más un regreso tardío: ve exactamente dónde se supera el límite de 90 días y cuándo se reinicia el contingente. Un escenario de calculadora Schengen preconfigurado.',
        summaryIntro: 'Un viajero que arriesga cruzar la línea con un segundo viaje demasiado cerca del primero.',
        faqs: [
          {
            question: '¿He excedido la estancia en este ejemplo?',
            answer: `Sí — los dos viajes suman ${r.daysUsed} días en la ventana que termina el 30 sep 2026, superando el límite de 90 días por ${r.overstayDays} días${
              r.violations.length ? ` y provocando ${r.violations.length} fecha(s) de infracción` : ''
            }. El contingente completo vuelve como pronto el ${df(r.fullResetDate, 'es-ES')}.`
          },
          {
            question: '¿Cuándo puedo reingresar legalmente?',
            answer: `El próximo reingreso legal es el ${r.nextEntryDate ? df(r.nextEntryDate, 'es-ES') : '—'}. Permanecer fuera hasta entonces evita acumular la infracción.`
          },
          {
            question: '¿Por qué usar este preset?',
            answer:
              'Permite a quien busca aterrizar en un ejemplo de sobreestancia ya resuelto en vez de un formulario vacío, y el enlace compartible reproduce la configuración exacta.'
          }
        ]
      },
      zh: {
        title: '逾期滞留风险自测',
        description:
          '一个悠长夏日停留加上一次偏晚的回程：精确看清 90 天上限在哪里被突破、额度何时重置。一个预填的申根计算器场景。',
        summaryIntro: '一位因第二段行程离第一段太近而有越线风险的旅行者。',
        faqs: [
          {
            question: '这个例子里我是否逾期了？',
            answer: `是的——两段行程在截至 2026 年 9 月 30 日的窗口内共 ${r.daysUsed} 天，超出 90 天上限 ${r.overstayDays} 天${
              r.violations.length ? `，触发 ${r.violations.length} 个违规日期` : ''
            }。完整额度最早在 ${df(r.fullResetDate, 'zh-CN')} 恢复。`
          },
          {
            question: '我何时能合法再次入境？',
            answer: `下一次合法入境是 ${r.nextEntryDate ? df(r.nextEntryDate, 'zh-CN') : '—'}。在此之前留在境外可避免违规叠加。`
          },
          {
            question: '为什么用这个预设？',
            answer:
              '让搜索者落到一个完整算好的逾期例子，而不是空白表单；可分享链接能精确还原这套设置。'
          }
        ]
      }
    })
  )
];

export const PRESET_SLUGS = PRESETS.map((p) => p.slug);

export function getPreset(scenario: string): SchengenPreset | undefined {
  return PRESETS.find((p) => p.slug === scenario);
}

/**
 * Build the URL-query seed from a SchengenPreset, mirroring the encodeTrips helper in
 * SchengenCalculator. `ref` carries the reference date; `trips` carries entry|exit pairs
 * joined by commas.
 */
export function schengenInitialQuery(preset: SchengenPreset): Record<string, string> {
  const encoded = preset.defaultParams.trips
    .filter((t) => t.entryDate && t.exitDate)
    .map((t) => `${t.entryDate}|${t.exitDate}`)
    .join(',');
  return { ref: preset.defaultParams.referenceDate, trips: encoded };
}
