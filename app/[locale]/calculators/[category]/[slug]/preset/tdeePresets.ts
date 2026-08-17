/**
 * TDEE pSEO Preset Matrix / TDEE 程序化 SEO 预设矩阵
 * ----------------------------------------------------------------------------
 * Seed scenarios for the programmatic-SEO scenario pages. Each preset is a fully
 * described, pre-filled TDEE landing page (e.g. /en/calculators/health/
 * tdee-macro-calculator/preset/25-year-old-male) with localized title, meta
 * description, scenario summary and a scenario-specific FAQ set.
 *
 * The calculator numbers embedded in the copy are computed from the live engine
 * (calculateTdee) so the FAQ prose always matches the rendered benchmark section.
 */

import { calculateTdee } from '@/lib/calculators/health/tdee';
import type { TdeeForm } from '@/components/calculators/TdeeCalculator';
import type { Locale } from '@/config/i18n.config';
import type { FaqEntry } from '@/lib/seo/schema';

export const TDEE_CATEGORY = 'health';
export const TDEE_SLUG = 'tdee-macro-calculator';

/** Locale-independent route for a scenario page, e.g. /calculators/health/tdee-macro-calculator/preset/25-year-old-male */
export function presetRoute(scenario: string) {
  return `/calculators/${TDEE_CATEGORY}/${TDEE_SLUG}/preset/${scenario}`;
}

interface LocalizedPreset {
  title: string;
  description: string;
  summaryIntro: string;
  faqs: FaqEntry[];
}

export interface TdeePreset {
  slug: string;
  /** Resolved metric input state passed straight to TdeeCalculator (no CLS on first paint). */
  defaultParams: TdeeForm;
  localized: Record<Locale, LocalizedPreset>;
}

type Result = ReturnType<typeof calculateTdee>;

function buildPreset(
  slug: string,
  defaultParams: TdeeForm,
  localized: (r: Result) => Record<Locale, LocalizedPreset>
): TdeePreset {
  return { slug, defaultParams, localized: localized(calculateTdee(defaultParams)) };
}

export const PRESETS: TdeePreset[] = [
  buildPreset(
    '25-year-old-male',
    {
      sex: 'male',
      age: 25,
      heightCm: 175,
      weightKg: 70,
      bodyFat: '',
      activityLevel: 'moderate',
      goal: 'mild-cut',
      formula: 'mifflin',
      macroPreset: 'balanced'
    },
    (r) => ({
      en: {
        title: 'TDEE for a 25-Year-Old Male',
        description:
          'Basal metabolic rate, total daily energy expenditure and macro targets for a 25-year-old man, 175 cm, 70 kg, training moderately. A pre-filled TDEE calculator scenario.',
        summaryIntro: 'A typical healthy young man with a moderate training routine.',
        faqs: [
          {
            question: 'How many calories should a 25-year-old man eat to lean down?',
            answer: `For a 25-year-old male at 175 cm and 70 kg, basal metabolic rate is about ${r.bmr} kcal and total daily energy expenditure about ${r.tdee} kcal at a moderate activity level. A mild 10% cut targets roughly ${r.targetCalories} kcal per day — a sustainable starting point before adjusting to your weight trend.`
          },
          {
            question: 'Is 70 kg a healthy weight at 175 cm?',
            answer: `At 175 cm and 70 kg the BMI is about ${r.bmi}, which sits in the normal range. Keep protein around ${r.macros.proteinG} g per day to protect muscle while cutting.`
          },
          {
            question: 'Why use a preset instead of typing everything?',
            answer:
              'Presets give search engines and first-time visitors a complete, ready-to-read scenario. You can still change any input — the URL, the share link and the structured data all update live.'
          }
        ]
      },
      de: {
        title: 'TDEE für einen 25-jährigen Mann',
        description:
          'Grundumsatz, Gesamtumsatz und Makronährstoff-Ziele für einen 25-jährigen Mann, 175 cm, 70 kg, mit moderatem Training. Ein voreingestelltes TDEE-Szenario.',
        summaryIntro: 'Ein typischer gesunder junger Mann mit moderatem Trainingsrhythmus.',
        faqs: [
          {
            question: 'Wie viele Kalorien sollte ein 25-jähriger Mann essen, um schlank zu werden?',
            answer: `Bei einem 25-jährigen Mann (175 cm, 70 kg) liegt der Grundumsatz bei etwa ${r.bmr} kcal und der Gesamtumsatz bei etwa ${r.tdee} kcal bei moderater Aktivität. Ein leichter 10-%-Defizit zielt auf etwa ${r.targetCalories} kcal pro Tag — ein nachhaltiger Startwert, bevor man an die Gewichtstendenz anpasst.`
          },
          {
            question: 'Sind 70 kg bei 175 cm gesund?',
            answer: `Bei 175 cm und 70 kg liegt der BMI bei etwa ${r.bmi} und damit im Normalbereich. Halten Sie das Protein bei etwa ${r.macros.proteinG} g pro Tag, um Muskeln beim Abnehmen zu schützen.`
          },
          {
            question: 'Warum Presets statt alles einzutippen?',
            answer:
              'Presets liefern Suchmaschinen und Erstbesuchern ein vollständiges, sofort lesbares Szenario. Jede Eingabe lässt sich ändern — URL, Teillink und strukturierte Daten aktualisieren sich live.'
          }
        ]
      },
      es: {
        title: 'TDEE para un hombre de 25 años',
        description:
          'Tasa metabólica basal, gasto energético diario y objetivos de macronutrientes para un hombre de 25 años, 175 cm, 70 kg, con entrenamiento moderado. Un escenario de TDEE preconfigurado.',
        summaryIntro: 'Un hombre joven sano típico con una rutina de entrenamiento moderada.',
        faqs: [
          {
            question: '¿Cuántas calorías debe comer un hombre de 25 años para definir?',
            answer: `Para un hombre de 25 años (175 cm y 70 kg), la tasa metabólica basal ronda las ${r.bmr} kcal y el gasto diario total las ${r.tdee} kcal con actividad moderada. Un déficit leve del 10 % apunta a unas ${r.targetCalories} kcal al día, un punto de partida sostenible antes de ajustar según la tendencia de peso.`
          },
          {
            question: '¿Son 70 kg un peso saludable a 175 cm?',
            answer: `A 175 cm y 70 kg el IMC es de unos ${r.bmi}, dentro del rango normal. Mantén unas ${r.macros.proteinG} g de proteína al día para proteger el músculo al definir.`
          },
          {
            question: '¿Por qué usar presets en vez de escribir todo?',
            answer:
              'Los presets dan a los buscadores y a los visitantes un escenario completo y listo de leer. Puedes cambiar cualquier campo: la URL, el enlace para compartir y los datos estructurados se actualizan en vivo.'
          }
        ]
      },
      zh: {
        title: '25 岁男性的 TDEE',
        description:
          '为 25 岁、175 厘米、70 公斤、中等训练量的男性预设的基础代谢率、每日总能量消耗与宏量营养素目标。一个预填好的 TDEE 场景。',
        summaryIntro: '一位训练量中等的健康年轻男性的典型情况。',
        faqs: [
          {
            question: '25 岁男性想减脂该吃多少热量？',
            answer: `对 175 厘米、70 公斤的 25 岁男性，基础代谢率约为 ${r.bmr} 千卡，中等活动量下每日总消耗约为 ${r.tdee} 千卡。轻度 10% 缺口对应每天约 ${r.targetCalories} 千卡——在根据体重趋势微调之前，这是个可持续的起点。`
          },
          {
            question: '175 厘米 70 公斤算健康吗？',
            answer: `175 厘米、70 公斤时 BMI 约为 ${r.bmi}，处于正常范围。减脂期间把蛋白质保持在每天约 ${r.macros.proteinG} 克，有助保住肌肉。`
          },
          {
            question: '为什么用预设而不是手动输入？',
            answer:
              '预设让搜索引擎和首次访客直接看到一份完整、可读的场景。任何输入都可改——URL、分享链接与结构化数据都会实时更新。'
          }
        ]
      }
    })
  ),

  buildPreset(
    '30-year-old-female',
    {
      sex: 'female',
      age: 30,
      heightCm: 165,
      weightKg: 58,
      bodyFat: '',
      activityLevel: 'light',
      goal: 'mild-cut',
      formula: 'mifflin',
      macroPreset: 'balanced'
    },
    (r) => ({
      en: {
        title: 'TDEE for a 30-Year-Old Female',
        description:
          'BMR, TDEE and macro split for a 30-year-old woman, 165 cm, 58 kg, lightly active. A ready-made TDEE calculator scenario.',
        summaryIntro: 'A lightly active woman in her thirties at a healthy body weight.',
        faqs: [
          {
            question: 'What should a 30-year-old woman eat to stay lean?',
            answer: `At 165 cm and 58 kg, BMR is about ${r.bmr} kcal and TDEE about ${r.tdee} kcal with light activity. A mild 10% cut lands near ${r.targetCalories} kcal per day, with roughly ${r.macros.proteinG} g of protein.`
          },
          {
            question: 'Is 58 kg healthy at 165 cm?',
            answer: `BMI is about ${r.bmi}, within the normal band. Women often underestimate the calories they need; track for two to three weeks before dropping further.`
          },
          {
            question: 'Why use this scenario?',
            answer:
              'It removes the guesswork: open the page and the calculator is already filled in. Edit anything and the result, share link and schema refresh instantly.'
          }
        ]
      },
      de: {
        title: 'TDEE für eine 30-jährige Frau',
        description:
          'Grundumsatz, Gesamtumsatz und Makro-Split für eine 30-jährige Frau, 165 cm, 58 kg, leicht aktiv. Ein fertiges TDEE-Szenario.',
        summaryIntro: 'Eine leicht aktive Frau in den Dreißigern bei gesundem Körpergewicht.',
        faqs: [
          {
            question: 'Was sollte eine 30-jährige Frau essen, um schlank zu bleiben?',
            answer: `Bei 165 cm und 58 kg liegt der Grundumsatz bei etwa ${r.bmr} kcal und der Gesamtumsatz bei etwa ${r.tdee} kcal bei leichter Aktivität. Ein leichter 10-%-Defizit landet bei etwa ${r.targetCalories} kcal pro Tag, mit rund ${r.macros.proteinG} g Protein.`
          },
          {
            question: 'Sind 58 kg bei 165 cm gesund?',
            answer: `Der BMI liegt bei etwa ${r.bmi} und damit im Normalbereich. Frauen unterschätzen oft die nötigen Kalorien — verfolgen Sie den Trend zwei bis drei Wochen, bevor Sie weiter reduzieren.`
          },
          {
            question: 'Warum dieses Szenario?',
            answer:
              'Es nimmt die Rätselei: Die Seite ist schon ausgefüllt. Ändern Sie etwas, und Ergebnis, Teillink und Schema aktualisieren sofort.'
          }
        ]
      },
      es: {
        title: 'TDEE para una mujer de 30 años',
        description:
          'TMB, TDEE y reparto de macronutrientes para una mujer de 30 años, 165 cm, 58 kg, ligeramente activa. Un escenario de TDEE listo para usar.',
        summaryIntro: 'Una mujer ligeramente activa en sus treinta con un peso corporal saludable.',
        faqs: [
          {
            question: '¿Qué debe comer una mujer de 30 años para mantenerse delgada?',
            answer: `A 165 cm y 58 kg, la TMB ronda las ${r.bmr} kcal y el TDEE las ${r.tdee} kcal con actividad ligera. Un déficit leve del 10 % queda cerca de las ${r.targetCalories} kcal al día, con unas ${r.macros.proteinG} g de proteína.`
          },
          {
            question: '¿Son 58 kg saludables a 165 cm?',
            answer: `El IMC es de unos ${r.bmi}, dentro del rango normal. Las mujeres suelen subestimar las calorías necesarias; sigue la tendencia dos o tres semanas antes de bajar más.`
          },
          {
            question: '¿Por qué usar este escenario?',
            answer:
              'Elimina la suposición: al abrir la página la calculadora ya está rellena. Cambia lo que quieras y el resultado, el enlace para compartir y el esquema se actualizan al instante.'
          }
        ]
      },
      zh: {
        title: '30 岁女性的 TDEE',
        description:
          '为 30 岁、165 厘米、58 公斤、轻度活动的女性预设的基础代谢率、TDEE 与宏量配比。一个开箱即用的 TDEE 场景。',
        summaryIntro: '一位体重健康、三十来岁、轻度活动的女性。',
        faqs: [
          {
            question: '30 岁女性怎么吃才能保持苗条？',
            answer: `165 厘米、58 公斤时，基础代谢率约 ${r.bmr} 千卡，轻度活动下 TDEE 约 ${r.tdee} 千卡。轻度 10% 缺口落在每天约 ${r.targetCalories} 千卡，蛋白质约 ${r.macros.proteinG} 克。`
          },
          {
            question: '165 厘米 58 公斤健康吗？',
            answer: `BMI 约为 ${r.bmi}，处于正常范围。女性常低估所需热量；先观察 2–3 周趋势再继续下调。`
          },
          {
            question: '为什么用这个场景？',
            answer:
              '它省去试错：打开页面计算器就已填好。改任意项，结果、分享链接与结构化数据都会即时刷新。'
          }
        ]
      }
    })
  ),

  buildPreset(
    'sedentary-office-worker',
    {
      sex: 'male',
      age: 28,
      heightCm: 175,
      weightKg: 75,
      bodyFat: '',
      activityLevel: 'sedentary',
      goal: 'maintain',
      formula: 'mifflin',
      macroPreset: 'balanced'
    },
    (r) => ({
      en: {
        title: 'TDEE for a Sedentary Office Worker',
        description:
          'Energy expenditure and maintenance calories for a sedentary 28-year-old man, 175 cm, 75 kg who sits most of the day. A pre-filled TDEE scenario.',
        summaryIntro: 'A desk-bound routine with little daily movement — the most common modern baseline.',
        faqs: [
          {
            question: 'How many calories if I sit all day?',
            answer: `With a sedentary factor, BMR is about ${r.bmr} kcal and TDEE only about ${r.tdee} kcal. Maintenance therefore sits near ${r.targetCalories} kcal per day — lower than most people expect.`
          },
          {
            question: 'Will a desk job make me gain weight?',
            answer: `Only if intake exceeds TDEE. At 175 cm and 75 kg the BMI is about ${r.bmi}. Adding a short daily walk can lift TDEE by 150–250 kcal without changing your diet.`
          },
          {
            question: 'What changes in this preset?',
            answer:
              'Only the inputs. The formula, the results and the FAQ schema reflect this exact profile and update if you edit it.'
          }
        ]
      },
      de: {
        title: 'TDEE für einen sitzenden Büroangestellten',
        description:
          'Energieumsatz und Erhaltungskalorien für einen sitzenden 28-jährigen Mann, 175 cm, 75 kg, der den Großteil des Tages sitzt. Ein voreingestelltes TDEE-Szenario.',
        summaryIntro: 'Ein bewegungsarmer Alltag — die häufigste moderne Ausgangslage.',
        faqs: [
          {
            question: 'Wie viele Kalorien bei einem sitzenden Tag?',
            answer: `Bei sitzendem Faktor liegt der Grundumsatz bei etwa ${r.bmr} kcal und der Gesamtumsatz nur bei etwa ${r.tdee} kcal. Die Erhaltung liegt damit nahe ${r.targetCalories} kcal pro Tag — niedriger als die meisten erwarten.`
          },
          {
            question: 'Führt ein Bürojob zu Gewichtszunahme?',
            answer: `Nur wenn die Zufuhr den Gesamtumsatz übersteigt. Bei 175 cm und 75 kg liegt der BMI bei etwa ${r.bmi}. Ein kurzer täglicher Spaziergang hebt den Gesamtumsatz um 150–250 kcal, ohne die Ernährung zu ändern.`
          },
          {
            question: 'Was ändert sich in diesem Preset?',
            answer:
              'Nur die Eingaben. Formel, Ergebnisse und FAQ-Schema spiegeln genau dieses Profil wider und aktualisieren sich bei Änderungen.'
          }
        ]
      },
      es: {
        title: 'TDEE para un trabajador de oficina sedentario',
        description:
          'Gasto energético y calorías de mantenimiento para un hombre sedentario de 28 años, 175 cm, 75 kg que pasa sentado la mayor parte del día. Un escenario de TDEE preconfigurado.',
        summaryIntro: 'Una rutina sentada con poco movimiento diario: la base moderna más común.',
        faqs: [
          {
            question: '¿Cuántas calorías si paso el día sentado?',
            answer: `Con factor sedentario, la TMB ronda las ${r.bmr} kcal y el TDEE solo unas ${r.tdee} kcal. El mantenimiento se sitúa así cerca de las ${r.targetCalories} kcal al día, menos de lo que la mayoría espera.`
          },
          {
            question: '¿Un trabajo de oficina engorda?',
            answer: `Solo si la ingesta supera el TDEE. A 175 cm y 75 kg el IMC es de unos ${r.bmi}. Una caminata corta diaria puede subir el TDEE entre 150 y 250 kcal sin tocar la dieta.`
          },
          {
            question: '¿Qué cambia en este preset?',
            answer:
              'Solo las entradas. La fórmula, los resultados y el esquema de FAQ reflejan exactamente este perfil y se actualizan si lo editas.'
          }
        ]
      },
      zh: {
        title: '久坐办公族的 TDEE',
        description:
          '为 28 岁、175 厘米、75 公斤、一天大部分时间坐着的久坐男性预设的能量消耗与维持热量。一个预填的 TDEE 场景。',
        summaryIntro: '运动量很少的久坐日常——最典型的现代基线。',
        faqs: [
          {
            question: '整天坐着该吃多少热量？',
            answer: `久坐系数下，基础代谢约 ${r.bmr} 千卡，TDEE 只有约 ${r.tdee} 千卡。维持热量因此接近每天 ${r.targetCalories} 千卡——比多数人以为的低。`
          },
          {
            question: '坐办公室会让人长胖吗？',
            answer: `只有在摄入超过 TDEE 时才会。175 厘米、75 公斤时 BMI 约为 ${r.bmi}。每天短途散步就能把 TDEE 抬升 150–250 千卡，无需改饮食。`
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
    'weight-loss-cutting',
    {
      sex: 'female',
      age: 32,
      heightCm: 160,
      weightKg: 65,
      bodyFat: '',
      activityLevel: 'moderate',
      goal: 'cut',
      formula: 'mifflin',
      macroPreset: 'balanced'
    },
    (r) => ({
      en: {
        title: 'TDEE for Weight Loss (Cutting)',
        description:
          'Aggressive-cut calorie and macro targets for a 32-year-old woman, 160 cm, 65 kg, training moderately. A ready TDEE scenario for fat loss.',
        summaryIntro: 'A focused fat-loss setup with a 20% calorie deficit and moderate training.',
        faqs: [
          {
            question: 'How aggressive should a cut be?',
            answer: `At 160 cm and 65 kg with moderate training, BMR is about ${r.bmr} kcal and TDEE about ${r.tdee} kcal. A 20% cut targets roughly ${r.targetCalories} kcal per day — strong but still above the BMR floor.`
          },
          {
            question: 'Is 65 kg overweight at 160 cm?',
            answer: `BMI is about ${r.bmi}, at the upper edge of normal. A deficit of this size typically moves weight at 0.5–1% of bodyweight per week.`
          },
          {
            question: 'Why a dedicated cutting scenario?',
            answer:
              'It lets searchers land on a fully worked example instead of a blank form, and the shareable URL reproduces the exact setup for later.'
          }
        ]
      },
      de: {
        title: 'TDEE für Gewichtsverlust (Cutting)',
        description:
          'Kalorien- und Makro-Ziele für einen aggressiven Cut bei einer 32-jährigen Frau, 160 cm, 65 kg, mit moderatem Training. Ein fertiges TDEE-Szenario zum Fettabbau.',
        summaryIntro: 'Ein fokussiertes Fettabbau-Setup mit 20 % Kaloriendefizit und moderatem Training.',
        faqs: [
          {
            question: 'Wie aggressiv darf ein Cut sein?',
            answer: `Bei 160 cm und 65 kg mit moderatem Training liegt der Grundumsatz bei etwa ${r.bmr} kcal und der Gesamtumsatz bei etwa ${r.tdee} kcal. Ein 20-%-Cut zielt auf etwa ${r.targetCalories} kcal pro Tag — stark, aber noch über dem Grundumsatz-Boden.`
          },
          {
            question: 'Sind 65 kg bei 160 cm übergewichtig?',
            answer: `Der BMI liegt bei etwa ${r.bmi}, am oberen Rand des Normalbereichs. Ein solches Defizit bewegt das Gewicht meist um 0,5–1 % des Körpergewichts pro Woche.`
          },
          {
            question: 'Warum ein eigenes Cutting-Szenario?',
            answer:
              'Sucher landen auf einem vollständig ausgearbeiteten Beispiel statt auf einem leeren Formular, und der Teillink reproduziert die exakte Einstellung.'
          }
        ]
      },
      es: {
        title: 'TDEE para pérdida de peso (cutting)',
        description:
          'Objetivos de calorías y macros para un cut agresivo en una mujer de 32 años, 160 cm, 65 kg, con entrenamiento moderado. Un escenario de TDEE listo para la pérdida de grasa.',
        summaryIntro: 'Una configuración de pérdida de grasa con déficit del 20 % y entrenamiento moderado.',
        faqs: [
          {
            question: '¿Qué tan agresivo debe ser un cut?',
            answer: `A 160 cm y 65 kg con entrenamiento moderado, la TMB ronda las ${r.bmr} kcal y el TDEE las ${r.tdee} kcal. Un cut del 20 % apunta a unas ${r.targetCalories} kcal al día, fuerte pero aún por encima del suelo de la TMB.`
          },
          {
            question: '¿Están 65 kg por encima del peso a 160 cm?',
            answer: `El IMC es de unos ${r.bmi}, en el límite superior de lo normal. Un déficit de este tamaño suele mover el peso un 0,5–1 % del peso corporal por semana.`
          },
          {
            question: '¿Por qué un escenario de cutting aparte?',
            answer:
              'Permite a quien busca aterrizar en un ejemplo ya resuelto en vez de un formulario vacío, y el enlace compartible reproduce la configuración exacta.'
          }
        ]
      },
      zh: {
        title: '减脂（Cutting）场景的 TDEE',
        description:
          '为 32 岁、160 厘米、65 公斤、中等训练、做激进减脂的女性预设的热量与宏量目标。一个面向减脂的现成 TDEE 场景。',
        summaryIntro: '一个带 20% 热量缺口、中等训练、专注减脂的方案。',
        faqs: [
          {
            question: '减脂该多激进？',
            answer: `160 厘米、65 公斤、中等训练时，基础代谢约 ${r.bmr} 千卡，TDEE 约 ${r.tdee} 千卡。20% 缺口对应每天约 ${r.targetCalories} 千卡——力度强，但仍高于 BMR 下限。`
          },
          {
            question: '160 厘米 65 公斤算超重吗？',
            answer: `BMI 约为 ${r.bmi}，处于正常区间上沿。这种幅度的缺口通常每周移动约体重的 0.5%–1%。`
          },
          {
            question: '为什么单独做一个 cutting 场景？',
            answer:
              '让搜索者落到一个完整算好的例子，而不是空白表单；可分享链接能精确还原这套设置。'
          }
        ]
      }
    })
  )
];

export const PRESET_SLUGS = PRESETS.map((p) => p.slug);

export function getPreset(scenario: string): TdeePreset | undefined {
  return PRESETS.find((p) => p.slug === scenario);
}

/**
 * Build the URL-query seed from a TdeeForm preset. Mirrors TDEE_URL_KEY in TdeeCalculator
 * (sex/age/height/weight/bodyfat/activity/goal/formula/preset). Defaults are omitted so a
 * clean share link only carries the values the preset actually set.
 */
export function tdeeInitialQuery(preset: TdeePreset): Record<string, string> {
  const map: Record<keyof TdeeForm, string> = {
    sex: 'sex',
    age: 'age',
    heightCm: 'height',
    weightKg: 'weight',
    bodyFat: 'bodyfat',
    activityLevel: 'activity',
    goal: 'goal',
    formula: 'formula',
    macroPreset: 'preset'
  };
  const q: Record<string, string> = {};
  for (const [formKey, urlKey] of Object.entries(map) as [keyof TdeeForm, string][]) {
    const v = preset.defaultParams[formKey];
    if (v !== undefined && v !== '') q[urlKey] = String(v);
  }
  return q;
}
