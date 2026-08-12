/**
 * TDEE & macronutrient engine
 * TDEE 与每日热量 / 宏量营养素计算引擎
 *
 * BMR formulas:
 *   Mifflin-St Jeor  (default, no body-fat data required)
 *   Katch-McArdle    (preferred when body-fat % is known — uses lean body mass)
 *
 * All maths is unit-agnostic: the UI converts imperial input to metric before calling in.
 */

export type Sex = 'male' | 'female';
export type UnitSystem = 'metric' | 'imperial';
export type Formula = 'mifflin' | 'katch';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
export type Goal = 'cut' | 'mild-cut' | 'maintain' | 'lean-bulk' | 'bulk';
export type MacroPreset = 'balanced' | 'high-protein' | 'low-carb' | 'keto';

export const activityFactors: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9
};

/** Calorie delta applied to TDEE, as a ratio. */
export const goalAdjustments: Record<Goal, number> = {
  cut: -0.2,
  'mild-cut': -0.1,
  maintain: 0,
  'lean-bulk': 0.1,
  bulk: 0.2
};

/** protein g per kg of bodyweight, fat share of total kcal. */
export const macroPresets: Record<MacroPreset, { proteinPerKg: number; fatShare: number }> = {
  balanced: { proteinPerKg: 1.8, fatShare: 0.28 },
  'high-protein': { proteinPerKg: 2.4, fatShare: 0.25 },
  'low-carb': { proteinPerKg: 2.2, fatShare: 0.4 },
  keto: { proteinPerKg: 1.8, fatShare: 0.7 }
};

export const KCAL_PER_G = { protein: 4, carbs: 4, fat: 9 } as const;

export interface TdeeInput {
  sex: Sex;
  age: number;
  /** centimetres */
  heightCm: number;
  /** kilograms */
  weightKg: number;
  /** 0–70, optional; required by Katch-McArdle */
  bodyFatPercent?: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  formula: Formula;
  macroPreset: MacroPreset;
}

export interface MacroSplit {
  proteinG: number;
  carbsG: number;
  fatG: number;
  proteinKcal: number;
  carbsKcal: number;
  fatKcal: number;
  proteinPercent: number;
  carbsPercent: number;
  fatPercent: number;
}

export interface TdeeResult {
  bmr: number;
  /** Effective formula actually used (falls back to Mifflin without body-fat input). */
  usedFormula: Formula;
  tdee: number;
  targetCalories: number;
  calorieDelta: number;
  /** Expected weekly weight change in kg (7700 kcal ≈ 1 kg of fat). */
  weeklyWeightChangeKg: number;
  leanBodyMassKg: number | null;
  bmi: number;
  bmiCategory: 'underweight' | 'normal' | 'overweight' | 'obese';
  /** ml of water per day (35 ml/kg baseline + activity bonus). */
  waterMl: number;
  /** Recommended daily fibre in grams (14 g / 1000 kcal). */
  fiberG: number;
  macros: MacroSplit;
  /** TDEE for every activity level — lets the UI show a comparison table without recompute. */
  activityBreakdown: Array<{ level: ActivityLevel; tdee: number }>;
  /** Calories for every goal at the current activity level. */
  goalBreakdown: Array<{ goal: Goal; calories: number }>;
}

export function lbToKg(lb: number) {
  return lb * 0.45359237;
}
export function kgToLb(kg: number) {
  return kg / 0.45359237;
}
export function inToCm(inches: number) {
  return inches * 2.54;
}
export function cmToIn(cm: number) {
  return cm / 2.54;
}
export function feetInchesToCm(feet: number, inches: number) {
  return inToCm(feet * 12 + inches);
}

function mifflinStJeor(input: TdeeInput) {
  const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age;
  return input.sex === 'male' ? base + 5 : base - 161;
}

function katchMcArdle(leanMassKg: number) {
  return 370 + 21.6 * leanMassKg;
}

function bmiCategoryFor(bmi: number): TdeeResult['bmiCategory'] {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
}

export function calculateTdee(input: TdeeInput): TdeeResult {
  const weightKg = clampNum(input.weightKg, 20, 400);
  const heightCm = clampNum(input.heightCm, 90, 250);
  const age = clampNum(input.age, 10, 100);
  const bf = input.bodyFatPercent;
  const hasBodyFat = typeof bf === 'number' && bf > 2 && bf < 70;
  const leanBodyMassKg = hasBodyFat ? round1(weightKg * (1 - bf! / 100)) : null;

  const usedFormula: Formula = input.formula === 'katch' && leanBodyMassKg ? 'katch' : 'mifflin';
  const bmr =
    usedFormula === 'katch' && leanBodyMassKg
      ? katchMcArdle(leanBodyMassKg)
      : mifflinStJeor({ ...input, weightKg, heightCm, age });

  const factor = activityFactors[input.activityLevel];
  const tdee = bmr * factor;
  const delta = tdee * goalAdjustments[input.goal];
  // Never prescribe below the basal metabolic floor.
  const targetCalories = Math.max(bmr * 0.9, tdee + delta);
  const effectiveDelta = targetCalories - tdee;

  const preset = macroPresets[input.macroPreset];
  const proteinG = Math.round(weightKg * preset.proteinPerKg);
  const fatKcal = targetCalories * preset.fatShare;
  const fatG = Math.round(fatKcal / KCAL_PER_G.fat);
  const proteinKcal = proteinG * KCAL_PER_G.protein;
  const carbsKcal = Math.max(0, targetCalories - proteinKcal - fatG * KCAL_PER_G.fat);
  const carbsG = Math.round(carbsKcal / KCAL_PER_G.carbs);
  const totalKcal = proteinKcal + fatG * KCAL_PER_G.fat + carbsG * KCAL_PER_G.carbs || 1;

  const heightM = heightCm / 100;
  const bmi = round1(weightKg / (heightM * heightM));

  return {
    bmr: Math.round(bmr),
    usedFormula,
    tdee: Math.round(tdee),
    targetCalories: Math.round(targetCalories),
    calorieDelta: Math.round(effectiveDelta),
    weeklyWeightChangeKg: round2((effectiveDelta * 7) / 7700),
    leanBodyMassKg,
    bmi,
    bmiCategory: bmiCategoryFor(bmi),
    waterMl: Math.round(weightKg * 35 + (factor - 1.2) * 500),
    fiberG: Math.round((targetCalories / 1000) * 14),
    macros: {
      proteinG,
      carbsG,
      fatG,
      proteinKcal: Math.round(proteinKcal),
      carbsKcal: Math.round(carbsG * KCAL_PER_G.carbs),
      fatKcal: Math.round(fatG * KCAL_PER_G.fat),
      proteinPercent: Math.round((proteinKcal / totalKcal) * 100),
      carbsPercent: Math.round(((carbsG * KCAL_PER_G.carbs) / totalKcal) * 100),
      fatPercent: Math.round(((fatG * KCAL_PER_G.fat) / totalKcal) * 100)
    },
    activityBreakdown: (Object.keys(activityFactors) as ActivityLevel[]).map((level) => ({
      level,
      tdee: Math.round(bmr * activityFactors[level])
    })),
    goalBreakdown: (Object.keys(goalAdjustments) as Goal[]).map((goal) => ({
      goal,
      calories: Math.round(Math.max(bmr * 0.9, tdee * (1 + goalAdjustments[goal])))
    }))
  };
}

function clampNum(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(Math.max(n, min), max);
}
function round1(n: number) {
  return Math.round(n * 10) / 10;
}
function round2(n: number) {
  return Math.round(n * 100) / 100;
}
