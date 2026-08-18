/**
 * Body Fat & BMI pSEO Preset Matrix / 体脂率与 BMI 计算器程序化 SEO 预设矩阵
 * ----------------------------------------------------------------------------
 * Seed scenarios for the Body Fat & BMI calculator.
 * Each preset is a fully described, pre-filled landing page, with localized
 * title, meta description, scenario summary and a scenario-specific FAQ.
 *
 * The numbers embedded in the copy are computed from the live engine
 * (calculateBodyFatBmi) so the FAQ prose always matches the rendered benchmark.
 */

import { calculateBodyFatBmi, idealBodyFatRange, type BodyFatBmiInput } from '@/lib/calculators/health/body-fat-bmi';
import type { Locale } from '@/config/i18n.config';
import type { FaqEntry } from '@/lib/seo/schema';

export const BODYFAT_CATEGORY = 'health';
export const BODYFAT_SLUG = 'body-fat-bmi-calculator';

/** Locale-independent route for a scenario page. */
export function presetRoute(scenario: string) {
  return `/calculators/${BODYFAT_CATEGORY}/${BODYFAT_SLUG}/preset/${scenario}`;
}

interface LocalizedPreset {
  title: string;
  description: string;
  summaryIntro: string;
  faqs: FaqEntry[];
}

export interface BodyFatPreset {
  slug: string;
  /** Resolved metric input state passed straight to the client (no CLS on first paint). */
  defaultParams: BodyFatBmiInput;
  localized: Record<Locale, LocalizedPreset>;
}

type Result = ReturnType<typeof calculateBodyFatBmi>;

/** Locale-formatted number (1 decimal). */
function n(v: number, locale: string) {
  return v.toLocaleString(locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 });
}

function buildPreset(
  slug: string,
  defaultParams: BodyFatBmiInput,
  localized: (r: Result) => Record<Locale, LocalizedPreset>
): BodyFatPreset {
  return { slug, defaultParams, localized: localized(calculateBodyFatBmi(defaultParams)) };
}

export const PRESETS: BodyFatPreset[] = [
  buildPreset(
    'navy-body-fat-formula-calculator',
    { gender: 'male', age: 30, heightCm: 178, weightKg: 78, waistCm: 88, neckCm: 39, hipCm: 0 },
    (r) => ({
      en: {
        title: 'U.S. Navy Body Fat Formula Calculator',
        description:
          'Body fat from three tape measurements: a 178 cm, 78 kg man with an 88 cm waist and 39 cm neck, measured with the U.S. Navy circumference method. A pre-filled body fat & BMI calculator scenario.',
        summaryIntro: 'The tape-measure method used by the military — no scales that estimate, just waist, neck and height.',
        faqs: [
          {
            question: 'What is my body fat percentage with these measurements?',
            answer: `Using the Navy method this profile lands at about ${n(r.bodyFatPercentage, 'en-US')}% body fat, with ${n(r.fatMassKg, 'en-US')} kg of fat and ${n(r.leanMassKg, 'en-US')} kg of lean mass.`
          },
          {
            question: 'How does the Navy method work?',
            answer:
              'It uses waist, neck and height (plus hip for women) in a standard circumference formula. Because it is purely tape-based, it needs no body-fat scale or impedance device.'
          },
          {
            question: 'Why use this preset?',
            answer:
              'It gives you a complete, shareable starting profile so you only change the numbers that differ — everything recalculates instantly.'
          }
        ]
      },
      de: {
        title: 'US-Navy-Formel Körperfett-Rechner',
        description:
          'Körperfett aus drei Maßband-Werten: ein 178 cm, 78 kg schwerer Mann mit 88 cm Taillen- und 39 cm Halsumfang, gemessen mit der US-Navy-Methode. Ein voreingestelltes Szenario des Körperfett- & BMI-Rechners.',
        summaryIntro: 'Die Maßband-Methode des Militärs — keine Schätzwaagen, nur Taille, Hals und Größe.',
        faqs: [
          {
            question: 'Wie hoch ist mein Körperfettanteil bei diesen Werten?',
            answer: `Mit der Navy-Methode ergibt dieses Profil etwa ${n(r.bodyFatPercentage, 'de-DE')} % Körperfett, ${n(r.fatMassKg, 'de-DE')} kg Fett und ${n(r.leanMassKg, 'de-DE')} kg fettfreie Masse.`
          },
          {
            question: 'Wie funktioniert die Navy-Methode?',
            answer:
              'Sie nutzt Taille, Hals und Größe (plus Hüfte bei Frauen) in einer Standardformel. Da sie rein maßbandbasiert ist, braucht sie keine Waage oder Impedanzmessung.'
          },
          {
            question: 'Warum dieses Preset nutzen?',
            answer:
              'Es liefert ein vollständiges, teilbares Ausgangsprofil — ändere nur die Zahlen, die bei dir abweichen, und alles berechnet sich sofort neu.'
          }
        ]
      },
      es: {
        title: 'Calculadora de grasa corporal con la fórmula Navy',
        description:
          'Grasa corporal a partir de tres medidas de cinta: un hombre de 178 cm y 78 kg con 88 cm de cintura y 39 cm de cuello, medido con el método de circunferencias de la Marina de EE. UU. Un escenario preconfigurado de la calculadora de grasa corporal e IMC.',
        summaryIntro: 'El método de cinta métrica usado por el ejército — sin básculas que estimen, solo cintura, cuello y altura.',
        faqs: [
          {
            question: '¿Cuál es mi porcentaje de grasa corporal con estas medidas?',
            answer: `Con el método Navy este perfil da alrededor de ${n(r.bodyFatPercentage, 'es-ES')} % de grasa, ${n(r.fatMassKg, 'es-ES')} kg de masa grasa y ${n(r.leanMassKg, 'es-ES')} kg de masa magra.`
          },
          {
            question: '¿Cómo funciona el método Navy?',
            answer:
              'Usa cintura, cuello y altura (más cadera en mujeres) en una fórmula estándar. Al basarse solo en cinta, no necesita báscula ni medición por impedancia.'
          },
          {
            question: '¿Por qué usar este preset?',
            answer:
              'Te da un perfil inicial completo y compartible — solo cambia las cifras que difieren y todo se recalcula al instante.'
          }
        ]
      },
      zh: {
        title: '美国海军体脂公式计算器',
        description:
          '只用三次围度测量得出体脂：一位 178 厘米、78 公斤的男性，腰围 88 厘米、颈围 39 厘米，采用美国海军围度法。一个预填好的体脂率与 BMI 计算器场景。',
        summaryIntro: '军队使用的卷尺测量法——无需体脂秤，只需腰围、颈围和身高。',
        faqs: [
          {
            question: '这些数据下我的体脂率是多少？',
            answer: `用海军公式，该体型体脂率约为 ${n(r.bodyFatPercentage, 'zh-CN')}%，脂肪质量 ${n(r.fatMassKg, 'zh-CN')} 公斤，瘦体重 ${n(r.leanMassKg, 'zh-CN')} 公斤。`
          },
          {
            question: '海军公式怎么算？',
            answer:
              '它用腰围、颈围和身高（女性加臀围）套入标准围度公式。由于纯靠卷尺，无需体脂秤或阻抗测量设备。'
          },
          {
            question: '为什么用这个预设？',
            answer:
              '它给你一个完整、可分享的起始体型——只需改动与你不同的数字，一切即时重算。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'bmi-vs-body-fat-percentage',
    { gender: 'male', age: 32, heightCm: 185, weightKg: 95, waistCm: 88, neckCm: 41, hipCm: 0 },
    (r) => ({
      en: {
        title: 'BMI vs Body Fat Percentage — Why They Disagree',
        description:
          'The classic mismatch: a 185 cm, 95 kg athletic man with an 88 cm waist and 41 cm neck. His BMI says one thing, his body fat says another. A pre-filled body fat & BMI calculator scenario.',
        summaryIntro: 'When muscle inflates BMI but body fat stays healthy — the case for measuring both.',
        faqs: [
          {
            question: 'What does BMI say for this profile?',
            answer: `At 185 cm and 95 kg the BMI is ${n(r.bmi, 'en-US')}, which lands in the "${r.bmiCategory}" band — yet the body fat reading of ${n(r.bodyFatPercentage, 'en-US')}% is a healthy athletic level.`
          },
          {
            question: 'Why do BMI and body fat disagree?',
            answer:
              'BMI only weighs height against total mass, so lean muscle counts the same as fat. Body fat percentage separates the two, which is why this profile looks "overweight" by BMI but fit by body fat.'
          },
          {
            question: 'Which number should I trust?',
            answer:
              'For tracking health, body fat percentage plus waist circumference is usually more informative than BMI alone — the calculator shows both side by side.'
          }
        ]
      },
      de: {
        title: 'BMI vs. Körperfettanteil — warum sie abweichen',
        description:
          'Der klassische Widerspruch: ein 185 cm, 95 kg schwerer athletischer Mann mit 88 cm Taille und 41 cm Hals. Sein BMI sagt eines, sein Körperfett etwas anderes. Ein voreingestelltes Szenario des Körperfett- & BMI-Rechners.',
        summaryIntro: 'Wenn Muskeln den BMI in die Höhe treiben, das Körperfett aber gesund bleibt — der Fall für beides.',
        faqs: [
          {
            question: 'Was sagt der BMI bei diesem Profil?',
            answer: `Bei 185 cm und 95 kg liegt der BMI bei ${n(r.bmi, 'de-DE')}, also in der Kategorie "${r.bmiCategory}" — doch der Körperfettanteil von ${n(r.bodyFatPercentage, 'de-DE')} % ist ein gesundes, athletisches Niveau.`
          },
          {
            question: 'Warum weichen BMI und Körperfett voneinander ab?',
            answer:
              'Der BMI setzt nur Größe ins Verhältnis zur Gesamtmasse, also zählt Muskel wie Fett. Der Körperfettanteil trennt beides — deshalb wirkt dieses Profil per BMI "übergewichtig", per Körperfett aber fit.'
          },
          {
            question: 'Welcher Zahl sollte ich vertrauen?',
            answer:
              'Für Gesundheitstracking sind Körperfettanteil plus Taillenumfang meist aussagekräftiger als der BMI allein — der Rechner zeigt beides nebeneinander.'
          }
        ]
      },
      es: {
        title: 'IMC frente a porcentaje de grasa corporal — por qué discrepan',
        description:
          'El desajuste clásico: un hombre atlético de 185 cm y 95 kg con 88 cm de cintura y 41 cm de cuello. Su IMC dice una cosa y su grasa corporal otra. Un escenario preconfigurado de la calculadora de grasa corporal e IMC.',
        summaryIntro: 'Cuando el músculo infla el IMC pero la grasa corporal sigue sana — el caso de medir ambos.',
        faqs: [
          {
            question: '¿Qué dice el IMC para este perfil?',
            answer: `A 185 cm y 95 kg el IMC es ${n(r.bmi, 'es-ES')}, en la banda "${r.bmiCategory}" — sin embargo la grasa corporal del ${n(r.bodyFatPercentage, 'es-ES')} % es un nivel atlético saludable.`
          },
          {
            question: '¿Por qué discrepan el IMC y la grasa corporal?',
            answer:
              'El IMC solo compara la altura con la masa total, así que el músculo cuenta igual que la grasa. El porcentaje de grasa los separa: por eso este perfil parece "con sobrepeso" por IMC pero en forma por grasa.'
          },
          {
            question: '¿Qué cifra debería creer?',
            answer:
              'Para controlar la salud, la grasa corporal más la cintura suele ser más informativa que el IMC solo — la calculadora muestra ambas.'
          }
        ]
      },
      zh: {
        title: 'BMI vs 体脂率——为何结果不一致',
        description:
          '经典反差：一位 185 厘米、95 公斤的运动型男性，腰围 88 厘米、颈围 41 厘米。BMI 说一套，体脂率说另一套。一个预填好的体脂率与 BMI 计算器场景。',
        summaryIntro: '当肌肉推高 BMI 而体脂依然健康——这正是两个指标都要测的理由。',
        faqs: [
          {
            question: '这个体型下 BMI 是多少？',
            answer: `185 厘米、95 公斤的 BMI 为 ${n(r.bmi, 'zh-CN')}，落入「${r.bmiCategory}」区间——但体脂率 ${n(r.bodyFatPercentage, 'zh-CN')}% 却是健康的运动水平。`
          },
          {
            question: '为什么 BMI 与体脂会不一致？',
            answer:
              'BMI 只把身高与总体重对比，肌肉和脂肪同权。体脂率把两者分开——所以这个体型按 BMI 算"超重"，按体脂算却健康。'
          },
          {
            question: '该信哪个数字？',
            answer:
              '跟踪健康时，体脂率加腰围通常比单独 BMI 更有参考价值——计算器并排展示两个指标。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'female-body-fat-calculator',
    { gender: 'female', age: 32, heightCm: 168, weightKg: 64, waistCm: 74, neckCm: 33, hipCm: 97 },
    (r) => ({
      en: {
        title: 'Female Body Fat Calculator',
        description:
          'A woman-oriented reading: 168 cm, 64 kg, 74 cm waist, 33 cm neck and 97 cm hip, measured with the U.S. Navy female formula. A pre-filled body fat & BMI calculator scenario.',
        summaryIntro: 'The female Navy formula adds the hip measurement — a more accurate picture for women.',
        faqs: [
          {
            question: 'What is a healthy body fat for a woman?',
            answer: `This profile reads about ${n(r.bodyFatPercentage, 'en-US')}% body fat with a BMI of ${n(r.bmi, 'en-US')} — well inside the healthy range for most women.`
          },
          {
            question: 'Why does the formula need the hip measurement?',
            answer:
              'The female Navy equation uses waist + hip − neck, because women store more fat around the hips and thighs. Skipping it would bias the estimate.'
          },
          {
            question: 'How do I use this preset?',
            answer:
              'Open the page with the fields pre-filled and adjust only your own measurements — the result, categories and share card update instantly.'
          }
        ]
      },
      de: {
        title: 'Körperfett-Rechner für Frauen',
        description:
          'Eine frauenspezifische Auswertung: 168 cm, 64 kg, 74 cm Taille, 33 cm Hals und 97 cm Hüfte, gemessen mit der weiblichen US-Navy-Formel. Ein voreingestelltes Szenario des Körperfett- & BMI-Rechners.',
        summaryIntro: 'Die weibliche Navy-Formel bezieht die Hüfte ein — ein genaueres Bild für Frauen.',
        faqs: [
          {
            question: 'Was ist ein gesunder Körperfettanteil für eine Frau?',
            answer: `Dieses Profil ergibt etwa ${n(r.bodyFatPercentage, 'de-DE')} % Körperfett bei einem BMI von ${n(r.bmi, 'de-DE')} — klar im gesunden Bereich der meisten Frauen.`
          },
          {
            question: 'Warum braucht die Formel den Hüftumfang?',
            answer:
              'Die weibliche Navy-Gleichung nutzt Taille + Hüfte − Hals, weil Frauen mehr Fett um Hüfte und Oberschenkel speichern. Ohne Hüfte wäre die Schätzung verzerrt.'
          },
          {
            question: 'Wie nutze ich dieses Preset?',
            answer:
              'Öffne die Seite mit vorbefüllten Feldern und passe nur deine eigenen Maße an — Ergebnis, Kategorien und Teilkarte aktualisieren sich sofort.'
          }
        ]
      },
      es: {
        title: 'Calculadora de grasa corporal para mujer',
        description:
          'Una lectura orientada a mujeres: 168 cm, 64 kg, 74 cm de cintura, 33 cm de cuello y 97 cm de cadera, medida con la fórmula femenina Navy. Un escenario preconfigurado de la calculadora de grasa corporal e IMC.',
        summaryIntro: 'La fórmula femenina Navy añade la cadera — una imagen más precisa para las mujeres.',
        faqs: [
          {
            question: '¿Cuál es una grasa corporal sana para una mujer?',
            answer: `Este perfil da alrededor de ${n(r.bodyFatPercentage, 'es-ES')} % de grasa con un IMC de ${n(r.bmi, 'es-ES')} — dentro del rango saludable de la mayoría de las mujeres.`
          },
          {
            question: '¿Por qué la fórmula necesita la cadera?',
            answer:
              'La ecuación femenina Navy usa cintura + cadera − cuello, porque las mujeres almacenan más grasa en cadera y muslos. Omitirla sesgaría la estimación.'
          },
          {
            question: '¿Cómo uso este preset?',
            answer:
              'Abre la página con los campos rellenos y ajusta solo tus propias medidas — el resultado, las categorías y la tarjeta compartible se actualizan al instante.'
          }
        ]
      },
      zh: {
        title: '女性体脂率计算器',
        description:
          '面向女性的读数：168 厘米、64 公斤、腰围 74 厘米、颈围 33 厘米、臀围 97 厘米，采用美国海军女性公式。一个预填好的体脂率与 BMI 计算器场景。',
        summaryIntro: '女性海军公式加入了臀围——为女性提供更准确的图像。',
        faqs: [
          {
            question: '女性的健康体脂率是多少？',
            answer: `该体型体脂率约 ${n(r.bodyFatPercentage, 'zh-CN')}%，BMI ${n(r.bmi, 'zh-CN')}——处于大多数女性的健康区间内。`
          },
          {
            question: '为什么公式需要臀围？',
            answer:
              '女性海军公式使用「腰围+臀围−颈围」，因为女性更多脂肪储存在臀部和大腿。省略臀围会令估算失真。'
          },
          {
            question: '怎么用这个预设？',
            answer:
              '打开页面输入已填好，只需改成你自己的测量值——结果、等级与分享卡片即时更新。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'ideal-body-fat-percentage-by-age',
    { gender: 'male', age: 45, heightCm: 176, weightKg: 80, waistCm: 86, neckCm: 39, hipCm: 0 },
    (r) => {
      const ideal = idealBodyFatRange('male', 45);
      return {
        en: {
          title: 'Ideal Body Fat Percentage by Age',
          description:
            'What "healthy" means changes with the decades: a 45-year-old man, 176 cm, 80 kg, 86 cm waist and 39 cm neck, checked against age-based body fat ranges. A pre-filled body fat & BMI calculator scenario.',
          summaryIntro: 'Healthy body fat is a moving target — see how the ideal band shifts by age.',
          faqs: [
            {
              question: 'Is my body fat healthy for my age?',
              answer: `At ${n(r.bodyFatPercentage, 'en-US')}% body fat you sit inside the ${ideal.min}–${ideal.max}% band that is commonly recommended for men in their 40s.`
            },
            {
              question: 'Why does the ideal range change with age?',
              answer:
                'Body composition norms drift as we age — fat mass tends to rise and muscle to fall, so reference bands widen and shift upward decade by decade.'
            },
            {
              question: 'How do I use this preset?',
              answer:
                'The page is pre-filled with the reference profile; change your age to see the recommended band for your own decade update live.'
            }
          ]
        },
        de: {
          title: 'Idealer Körperfettanteil nach Alter',
          description:
            'Was "gesund" heißt, ändert sich mit den Jahrzehnten: ein 45-jähriger Mann, 176 cm, 80 kg, 86 cm Taille und 39 cm Hals, geprüft gegen altersbasierte Körperfett-Ranges. Ein voreingestelltes Szenario des Körperfett- & BMI-Rechners.',
          summaryIntro: 'Gesundes Körperfett ist ein bewegliches Ziel — sieh, wie sich die Idealbandbreite mit dem Alter verschiebt.',
          faqs: [
            {
              question: 'Ist mein Körperfett für mein Alter gesund?',
              answer: `Mit ${n(r.bodyFatPercentage, 'de-DE')} % Körperfett liegst du innerhalb der ${ideal.min}–${ideal.max} %-Bandbreite, die für Männer in den 40ern üblich empfohlen wird.`
            },
            {
              question: 'Warum ändert sich die Idealbandbreite mit dem Alter?',
              answer:
                'Die Körperzusammensetzungs-Normen verschieben sich mit dem Alter — Fettmasse steigt, Muskelmasse sinkt, daher weiten und verschieben sich die Referenzbänder von Jahrzehnt zu Jahrzehnt.'
            },
            {
              question: 'Wie nutze ich dieses Preset?',
              answer:
                'Die Seite ist mit dem Referenzprofil vorbefüllt; ändere dein Alter, um die empfohlene Bandbreite für dein Jahrzehnt live zu sehen.'
            }
          ]
        },
        es: {
          title: 'Porcentaje de grasa corporal ideal según la edad',
          description:
            'Lo que es "sano" cambia con las décadas: un hombre de 45 años, 176 cm, 80 kg, 86 cm de cintura y 39 cm de cuello, comparado con rangos de grasa corporal según la edad. Un escenario preconfigurado de la calculadora de grasa corporal e IMC.',
          summaryIntro: 'La grasa corporal sana es un objetivo móvil — mira cómo cambia la banda ideal con la edad.',
          faqs: [
            {
              question: '¿Mi grasa corporal es sana para mi edad?',
              answer: `Con ${n(r.bodyFatPercentage, 'es-ES')} % de grasa corporal estás dentro de la banda del ${ideal.min}–${ideal.max} % que se recomienda habitualmente a hombres de 40 años.`
            },
            {
              question: '¿Por qué cambia el rango ideal con la edad?',
              answer:
                'Las normas de composición corporal cambian con la edad — la masa grasa tiende a subir y el músculo a bajar, así que las bandas de referencia se amplían y suben década a década.'
            },
            {
              question: '¿Cómo uso este preset?',
              answer:
                'La página viene rellena con el perfil de referencia; cambia tu edad para ver la banda recomendada para tu década en vivo.'
            }
          ]
        },
        zh: {
          title: '各年龄段的理想体脂率',
          description:
            '"健康"的定义随年龄变化：一位 45 岁男性，176 厘米、80 公斤、腰围 86 厘米、颈围 39 厘米，对照按年龄划分的体脂区间。一个预填好的体脂率与 BMI 计算器场景。',
          summaryIntro: '健康体脂是一个移动目标——看理想区间如何随年龄变化。',
          faqs: [
            {
              question: '我的体脂率在这个年龄健康吗？',
              answer: `体脂率 ${n(r.bodyFatPercentage, 'zh-CN')}% 位于 ${ideal.min}–${ideal.max}% 区间内，这正是 40 多岁男性通常被建议的范围。`
            },
            {
              question: '为什么理想区间会随年龄变化？',
              answer:
                '身体成分标准随年龄漂移——脂肪趋向增加、肌肉趋向减少，因此参考区间每十年都会拓宽并上移。'
            },
            {
              question: '怎么用这个预设？',
              answer:
                '页面已预填参考体型；修改年龄即可实时看到你所属年龄段的建议区间。'
            }
          ]
        }
      };
    }
  ),

  buildPreset(
    'body-fat-percentage-men-average',
    { gender: 'male', age: 35, heightCm: 178, weightKg: 82, waistCm: 90, neckCm: 40, hipCm: 0 },
    (r) => ({
      en: {
        title: 'Average Body Fat Percentage for Men',
        description:
          'Where most men land: a 178 cm, 82 kg man with a 90 cm waist and 40 cm neck — a typical profile checked against the average body fat band. A pre-filled body fat & BMI calculator scenario.',
        summaryIntro: 'A realistic male starting point — what "average" actually reads on the Navy scale.',
        faqs: [
          {
            question: 'What is the average body fat for a man?',
            answer: `This typical profile reads about ${n(r.bodyFatPercentage, 'en-US')}% body fat — right in the middle of the 18–24% band that is common for adult men.`
          },
          {
            question: 'How does this compare with BMI?',
            answer: `The BMI of ${n(r.bmi, 'en-US')} confirms the picture; tracking both lets you see whether weight changes are fat or lean mass.`
          },
          {
            question: 'Why use an average profile?',
            answer:
              'It is a realistic benchmark — start from this profile and tweak the measurements to see exactly where you fall on the scale.'
          }
        ]
      },
      de: {
        title: 'Durchschnittlicher Körperfettanteil bei Männern',
        description:
          'Wo die meisten Männer liegen: ein 178 cm, 82 kg schwerer Mann mit 90 cm Taille und 40 cm Hals — ein typisches Profil, geprüft gegen die durchschnittliche Körperfett-Bandbreite. Ein voreingestelltes Szenario des Körperfett- & BMI-Rechners.',
        summaryIntro: 'Ein realistischer männlicher Ausgangspunkt — was "durchschnittlich" auf der Navy-Skala wirklich heißt.',
        faqs: [
          {
            question: 'Was ist der durchschnittliche Körperfettanteil eines Mannes?',
            answer: `Dieses typische Profil ergibt etwa ${n(r.bodyFatPercentage, 'de-DE')} % Körperfett — genau in der Mitte der 18–24 %-Bandbreite, die bei erwachsenen Männern üblich ist.`
          },
          {
            question: 'Wie verhält sich das zum BMI?',
            answer: `Der BMI von ${n(r.bmi, 'de-DE')} bestätigt das Bild; beide zu verfolgen zeigt, ob Gewichtsänderungen Fett oder Muskelmasse sind.`
          },
          {
            question: 'Warum ein Durchschnittsprofil?',
            answer:
              'Es ist ein realistischer Maßstab — starte von diesem Profil und passe die Maße an, um genau zu sehen, wo du auf der Skala liegst.'
          }
        ]
      },
      es: {
        title: 'Porcentaje medio de grasa corporal en hombres',
        description:
          'Dónde aterriza la mayoría de los hombres: un hombre de 178 cm y 82 kg con 90 cm de cintura y 40 cm de cuello, un perfil típico comparado con la banda media de grasa corporal. Un escenario preconfigurado de la calculadora de grasa corporal e IMC.',
        summaryIntro: 'Un punto de partida masculino realista — lo que "promedio" significa en la escala Navy.',
        faqs: [
          {
            question: '¿Cuál es la grasa corporal media de un hombre?',
            answer: `Este perfil típico da alrededor de ${n(r.bodyFatPercentage, 'es-ES')} % de grasa — justo en medio de la banda del 18–24 % habitual en hombres adultos.`
          },
          {
            question: '¿Cómo se compara con el IMC?',
            answer: `El IMC de ${n(r.bmi, 'es-ES')} confirma el panorama; seguir ambos muestra si los cambios de peso son grasa o masa magra.`
          },
          {
            question: '¿Por qué un perfil promedio?',
            answer:
              'Es una referencia realista — parte de este perfil y ajusta las medidas para ver exactamente dónde caes en la escala.'
          }
        ]
      },
      zh: {
        title: '男性平均体脂率',
        description:
          '大多数男性的落点：一位 178 厘米、82 公斤的男性，腰围 90 厘米、颈围 40 厘米——一个典型体型，对照男性平均体脂区间。一个预填好的体脂率与 BMI 计算器场景。',
        summaryIntro: '一个现实的男性起点——"平均"在海军公式下到底是多少。',
        faqs: [
          {
            question: '男性的平均体脂率是多少？',
            answer: `该典型体型体脂率约 ${n(r.bodyFatPercentage, 'zh-CN')}%——正处于成年男性常见的 18–24% 区间中部。`
          },
          {
            question: '与 BMI 相比如何？',
            answer: `BMI ${n(r.bmi, 'zh-CN')} 印证了这一画面；同时跟踪两者，可判断体重变化是脂肪还是瘦体重。`
          },
          {
            question: '为什么要用平均体型？',
            answer:
              '它是现实的基准——从该体型出发调整测量值，即可精确看到你落在量表的哪个位置。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'bmi-calculator-weight-height',
    { gender: 'male', age: 28, heightCm: 172, weightKg: 70, waistCm: 82, neckCm: 38, hipCm: 0 },
    (r) => ({
      en: {
        title: 'BMI Calculator — Weight & Height',
        description:
          'A pure BMI check: 172 cm and 70 kg lands in the healthy band, with body composition shown alongside. A pre-filled body fat & BMI calculator scenario.',
        summaryIntro: 'The most-asked health number — weight vs height — plus the body-fat context.',
        faqs: [
          {
            question: 'What is my BMI?',
            answer: `At 172 cm and 70 kg the BMI is ${n(r.bmi, 'en-US')}, which falls in the healthy 18.5–24.9 range — category "${r.bmiCategory}".`
          },
          {
            question: 'Is BMI alone enough?',
            answer: `No — this profile also reads ${n(r.bodyFatPercentage, 'en-US')}% body fat, so you can see both the weight index and the composition behind it.`
          },
          {
            question: 'Why use this preset?',
            answer:
              'It answers the simple "is my weight healthy?" question instantly while still letting you add waist and neck for the full picture.'
          }
        ]
      },
      de: {
        title: 'BMI-Rechner — Gewicht & Größe',
        description:
          'Ein reiner BMI-Check: 172 cm und 70 kg liegen im gesunden Bereich, mit Körperzusammensetzung daneben. Ein voreingestelltes Szenario des Körperfett- & BMI-Rechners.',
        summaryIntro: 'Die meistgestellte Gesundheitszahl — Gewicht vs. Größe — plus den Körperfett-Kontext.',
        faqs: [
          {
            question: 'Wie hoch ist mein BMI?',
            answer: `Bei 172 cm und 70 kg liegt der BMI bei ${n(r.bmi, 'de-DE')}, also im gesunden 18,5–24,9-Bereich — Kategorie "${r.bmiCategory}".`
          },
          {
            question: 'Reicht der BMI allein?',
            answer: `Nein — dieses Profil zeigt auch ${n(r.bodyFatPercentage, 'de-DE')} % Körperfett, sodass du sowohl den Gewichtsindex als auch die Zusammensetzung dahinter siehst.`
          },
          {
            question: 'Warum dieses Preset?',
            answer:
              'Es beantwortet die einfache Frage "ist mein Gewicht gesund?" sofort und erlaubt trotzdem Taille und Hals für das volle Bild hinzuzufügen.'
          }
        ]
      },
      es: {
        title: 'Calculadora de IMC — peso y altura',
        description:
          'Una comprobación pura del IMC: 172 cm y 70 kg caen en la banda sana, con la composición corporal al lado. Un escenario preconfigurado de la calculadora de grasa corporal e IMC.',
        summaryIntro: 'El número de salud más preguntado — peso frente a altura — más el contexto de grasa corporal.',
        faqs: [
          {
            question: '¿Cuál es mi IMC?',
            answer: `A 172 cm y 70 kg el IMC es ${n(r.bmi, 'es-ES')}, dentro del rango sano de 18,5–24,9 — categoría "${r.bmiCategory}".`
          },
          {
            question: '¿Basta el IMC solo?',
            answer: `No — este perfil también da ${n(r.bodyFatPercentage, 'es-ES')} % de grasa, así que ves tanto el índice de peso como la composición que hay detrás.`
          },
          {
            question: '¿Por qué usar este preset?',
            answer:
              'Responde al instante a la simple pregunta "¿es sano mi peso?" y aun así permite añadir cintura y cuello para el panorama completo.'
          }
        ]
      },
      zh: {
        title: 'BMI 计算器——体重与身高',
        description:
          '一次纯粹的 BMI 检查：172 厘米、70 公斤落在健康区间，同时展示身体成分。一个预填好的体脂率与 BMI 计算器场景。',
        summaryIntro: '最常被问的健康数字——体重 vs 身高——外加体脂背景。',
        faqs: [
          {
            question: '我的 BMI 是多少？',
            answer: `172 厘米、70 公斤的 BMI 为 ${n(r.bmi, 'zh-CN')}，处于健康的 18.5–24.9 区间——等级「${r.bmiCategory}」。`
          },
          {
            question: '光看 BMI 够吗？',
            answer: `不够——该体型体脂率还有 ${n(r.bodyFatPercentage, 'zh-CN')}%，你既能看体重指数，也能看背后的成分构成。`
          },
          {
            question: '为什么用这个预设？',
            answer:
              '它即时回答"我的体重健康吗"这个简单问题，同时仍可补充腰围和颈围获得完整图景。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'lean-mass-body-composition',
    { gender: 'male', age: 30, heightCm: 180, weightKg: 85, waistCm: 82, neckCm: 40, hipCm: 0 },
    (r) => ({
      en: {
        title: 'Lean Mass & Body Composition',
        description:
          'What a trained physique looks like on the formula: 180 cm, 85 kg with an 82 cm waist and 40 cm neck. A pre-filled body fat & BMI calculator scenario for body-composition tracking.',
        summaryIntro: 'A low-fat, high-lean profile — see fat mass versus lean mass side by side.',
        faqs: [
          {
            question: 'How much of my weight is lean mass?',
            answer: `At ${n(r.bodyFatPercentage, 'en-US')}% body fat you carry about ${n(r.leanMassKg, 'en-US')} kg of lean mass and ${n(r.fatMassKg, 'en-US')} kg of fat — a strong lean-to-fat ratio.`
          },
          {
            question: 'Why track lean mass, not just weight?',
            answer:
              'Weight alone cannot tell muscle from fat. Tracking lean mass shows whether training is building tissue while the scale stays flat.'
          },
          {
            question: 'How do I use this preset?',
            answer:
              'Start from this athletic profile, enter your own waist and neck, and watch fat mass and lean mass recalculate in real time.'
          }
        ]
      },
      de: {
        title: 'Fettfreie Masse & Körperzusammensetzung',
        description:
          'Wie ein trainierter Körper in der Formel aussieht: 180 cm, 85 kg mit 82 cm Taille und 40 cm Hals. Ein voreingestelltes Szenario des Körperfett- & BMI-Rechners fürs Body-Composition-Tracking.',
        summaryIntro: 'Ein fettarmes, muskelreiches Profil — Fettmasse und fettfreie Masse nebeneinander.',
        faqs: [
          {
            question: 'Wie viel meines Gewichts ist fettfreie Masse?',
            answer: `Bei ${n(r.bodyFatPercentage, 'de-DE')} % Körperfett trägst du etwa ${n(r.leanMassKg, 'de-DE')} kg fettfreie Masse und ${n(r.fatMassKg, 'de-DE')} kg Fett — ein starkes Verhältnis.`
          },
          {
            question: 'Warum fettfreie Masse verfolgen, nicht nur Gewicht?',
            answer:
              'Gewicht allein unterscheidet Muskel nicht von Fett. Fettfreie Masse zeigt, ob das Training Gewebe aufbaut, während die Waage stillsteht.'
          },
          {
            question: 'Wie nutze ich dieses Preset?',
            answer:
              'Starte von diesem athletischen Profil, trage eigene Taille und Hals ein und sieh Fett- und fettfreie Masse in Echtzeit neu berechnen.'
          }
        ]
      },
      es: {
        title: 'Masa magra y composición corporal',
        description:
          'Cómo se ve un físico entrenado en la fórmula: 180 cm, 85 kg con 82 cm de cintura y 40 cm de cuello. Un escenario preconfigurado de la calculadora de grasa corporal e IMC para el seguimiento de la composición.',
        summaryIntro: 'Un perfil bajo en grasa y alto en masa magra — grasa frente a masa magra, lado a lado.',
        faqs: [
          {
            question: '¿Cuánto de mi peso es masa magra?',
            answer: `Con ${n(r.bodyFatPercentage, 'es-ES')} % de grasa corporal tienes unos ${n(r.leanMassKg, 'es-ES')} kg de masa magra y ${n(r.fatMassKg, 'es-ES')} kg de grasa — una fuerte proporción magra.`
          },
          {
            question: '¿Por qué seguir la masa magra y no solo el peso?',
            answer:
              'El peso solo no distingue músculo de grasa. La masa magra muestra si el entrenamiento construye tejido mientras la báscula se mantiene.'
          },
          {
            question: '¿Cómo uso este preset?',
            answer:
              'Parte de este perfil atlético, introduce tu cintura y cuello, y observa cómo se recalculan la masa grasa y la magra en tiempo real.'
          }
        ]
      },
      zh: {
        title: '瘦体重与身体成分',
        description:
          '训练有素的身材在公式下长什么样：180 厘米、85 公斤，腰围 82 厘米、颈围 40 厘米。一个用于身体成分跟踪的预填好体脂率与 BMI 计算器场景。',
        summaryIntro: '低脂高瘦体型——脂肪质量与瘦体重并排呈现。',
        faqs: [
          {
            question: '我的体重中瘦体重占多少？',
            answer: `体脂率 ${n(r.bodyFatPercentage, 'zh-CN')}%，你拥有约 ${n(r.leanMassKg, 'zh-CN')} 公斤瘦体重和 ${n(r.fatMassKg, 'zh-CN')} 公斤脂肪——瘦脂比非常出色。`
          },
          {
            question: '为什么跟踪瘦体重而不只是体重？',
            answer:
              '体重无法区分肌肉与脂肪。跟踪瘦体重能显示训练是否在增肌，即使体重秤读数不变。'
          },
          {
            question: '怎么用这个预设？',
            answer:
              '从该运动体型出发，输入自己的腰围与颈围，即可实时重算脂肪质量与瘦体重。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'weight-loss-body-fat-target',
    { gender: 'female', age: 40, heightCm: 165, weightKg: 78, waistCm: 82, neckCm: 34, hipCm: 100 },
    (r) => {
      const ideal = idealBodyFatRange('female', 40);
      return {
        en: {
          title: 'Weight Loss — Body Fat Target',
          description:
            'A goal-oriented read: a 40-year-old woman, 165 cm, 78 kg, 82 cm waist, 34 cm neck and 100 cm hip, with her body fat compared against a healthier target band. A pre-filled body fat & BMI calculator scenario.',
          summaryIntro: 'Know where you start before you cut — fat mass, lean mass and the range to aim for.',
          faqs: [
            {
              question: 'Where does my body fat sit now?',
              answer: `This profile reads about ${n(r.bodyFatPercentage, 'en-US')}% body fat with ${n(r.fatMassKg, 'en-US')} kg of fat — above the ${ideal.min}–${ideal.max}% band recommended for women in their 40s.`
            },
            {
              question: 'How much fat should I lose to hit the target?',
              answer: `To reach the top of the ${ideal.max}% band you would aim to lose roughly ${n(r.fatMassKg - ((r.fatMassKg + r.leanMassKg) * ideal.max) / 100, 'en-US')} kg — the calculator lets you change the inputs and see the gap update live.`
            },
            {
              question: 'Why track fat mass instead of just weight?',
              answer:
                'The scale mixes muscle, water and fat. Watching fat mass fall (and lean mass hold) confirms the loss is actually fat.'
            }
          ]
        },
        de: {
          title: 'Gewichtsverlust — Körperfett-Ziel',
          description:
            'Eine zielorientierte Auswertung: eine 40-jährige Frau, 165 cm, 78 kg, 82 cm Taille, 34 cm Hals und 100 cm Hüfte, mit ihrem Körperfett verglichen mit einer gesünderen Zielbandbreite. Ein voreingestelltes Szenario des Körperfett- & BMI-Rechners.',
          summaryIntro: 'Wisse, wo du stehst, bevor du reduzierst — Fettmasse, fettfreie Masse und der Zielbereich.',
          faqs: [
            {
              question: 'Wo liegt mein Körperfett jetzt?',
              answer: `Dieses Profil ergibt etwa ${n(r.bodyFatPercentage, 'de-DE')} % Körperfett mit ${n(r.fatMassKg, 'de-DE')} kg Fett — über der ${ideal.min}–${ideal.max} %-Bandbreite, die für Frauen in den 40ern empfohlen wird.`
            },
            {
              question: 'Wie viel Fett sollte ich verlieren, um das Ziel zu erreichen?',
              answer: `Um die obere ${ideal.max} %-Grenze zu erreichen, wäre ein Verlust von etwa ${n(r.fatMassKg - ((r.fatMassKg + r.leanMassKg) * ideal.max) / 100, 'de-DE')} kg nötig — der Rechner zeigt die Lücke live.`
            },
            {
              question: 'Warum Fettmasse statt nur Gewicht verfolgen?',
              answer:
                'Die Waage mischt Muskel, Wasser und Fett. Wenn die Fettmasse fällt (und die fettfreie Masse bleibt), bestätigt das, dass der Verlust wirklich Fett ist.'
            }
          ]
        },
        es: {
          title: 'Pérdida de peso — objetivo de grasa corporal',
          description:
            'Una lectura orientada a objetivos: una mujer de 40 años, 165 cm, 78 kg, 82 cm de cintura, 34 cm de cuello y 100 cm de cadera, con su grasa comparada con una banda objetivo más sana. Un escenario preconfigurado de la calculadora de grasa corporal e IMC.',
          summaryIntro: 'Sabe de dónde partes antes de recortar — masa grasa, masa magra y el rango al que apuntar.',
          faqs: [
            {
              question: '¿Dónde está ahora mi grasa corporal?',
              answer: `Este perfil da alrededor de ${n(r.bodyFatPercentage, 'es-ES')} % de grasa con ${n(r.fatMassKg, 'es-ES')} kg de masa grasa — por encima de la banda del ${ideal.min}–${ideal.max} % recomendada a mujeres de 40 años.`
            },
            {
              question: '¿Cuánta grasa debería perder para alcanzar el objetivo?',
              answer:
                `Para llegar al tope del ${ideal.max} % harían falta unos ${n(r.fatMassKg - ((r.fatMassKg + r.leanMassKg) * ideal.max) / 100, 'es-ES')} kg menos — la calculadora muestra la brecha en vivo.`
            },
            {
              question: '¿Por qué seguir la masa grasa en vez de solo el peso?',
              answer:
                'La báscula mezcla músculo, agua y grasa. Ver caer la masa grasa (y mantenerse la magra) confirma que la pérdida es realmente grasa.'
            }
          ]
        },
        zh: {
          title: '减脂——体脂目标',
          description:
            '目标导向的读数：一位 40 岁女性，165 厘米、78 公斤、腰围 82 厘米、颈围 34 厘米、臀围 100 厘米，体脂对照更健康的目标区间。一个预填好的体脂率与 BMI 计算器场景。',
          summaryIntro: '开始减重前先看清起点——脂肪质量、瘦体重与目标区间。',
          faqs: [
            {
              question: '我现在的体脂处于什么水平？',
              answer: `该体型体脂率约 ${n(r.bodyFatPercentage, 'zh-CN')}%，脂肪质量 ${n(r.fatMassKg, 'zh-CN')} 公斤——高于 40 多岁女性建议的 ${ideal.min}–${ideal.max}% 区间。`
            },
            {
              question: '要减多少脂肪才能达标？',
              answer: `要达到 ${ideal.max}% 的上限，大约需要减掉 ${n(r.fatMassKg - ((r.fatMassKg + r.leanMassKg) * ideal.max) / 100, 'zh-CN')} 公斤——计算器会实时显示差距。`
            },
            {
              question: '为什么跟踪脂肪质量而不是只看体重？',
              answer:
                '体重秤混合了肌肉、水分与脂肪。看到脂肪质量下降（瘦体重保持），才能确认减掉的是脂肪。'
            }
          ]
        }
      };
    }
  )
];

export const PRESET_SLUGS = PRESETS.map((p) => p.slug);

export function getPreset(scenario: string): BodyFatPreset | undefined {
  return PRESETS.find((p) => p.slug === scenario);
}

/**
 * Build the URL-query seed from a BodyFatBmiInput preset, mirroring BODYFAT_URL_KEY in
 * BodyFatBmiCalculatorClient. Defaults are omitted so a clean share link only carries
 * the values the preset actually set.
 */
export function bodyFatInitialQuery(preset: BodyFatPreset): Record<string, string> {
  const q: Record<string, string> = {};
  const p = preset.defaultParams;
  if (p.gender !== 'male') q.g = p.gender;
  if (p.age !== 30) q.age = String(p.age);
  if (p.heightCm !== 175) q.h = String(p.heightCm);
  if (p.weightKg !== 75) q.w = String(p.weightKg);
  if (p.waistCm !== 85) q.waist = String(p.waistCm);
  if (p.neckCm !== 38) q.neck = String(p.neckCm);
  if (p.hipCm !== 0) q.hip = String(p.hipCm);
  return q;
}
