/**
 * Body Fat & BMI engine
 * 体脂率与 BMI 计算引擎
 *
 * Pure, timezone-free function usable both at build time (for pSEO preset FAQ
 * copy) and at runtime in the browser. No I/O, no Date, no side effects.
 *
 * Models:
 *   - BMI = weight(kg) / height(m)^2, categorized by WHO thresholds.
 *   - Body fat via the U.S. Navy circumference method, computed in inches:
 *       male   %BF = 495 / (1.0324 − 0.19077·log10(waist−neck) + 0.15456·log10(height)) − 450
 *       female %BF = 495 / (1.29579 − 0.35004·log10(waist+hip−neck) + 0.22100·log10(height)) − 450
 *
 * Canonical inputs are METRIC (cm / kg) — the UI converts for imperial display and
 * writes back to metric, so shared links are unit-agnostic (same convention as TDEE).
 */

import { cmToIn } from './tdee';

export type Gender = 'male' | 'female';

export type BmiCategory = 'underweight' | 'normal' | 'overweight' | 'obese';

export type BodyFatCategory = 'essential' | 'athletic' | 'fitness' | 'average' | 'high';

export interface BodyFatBmiInput {
  gender: Gender;
  /** Whole years, used for the age-based ideal body-fat range. */
  age: number;
  /** Height in cm (canonical metric). */
  heightCm: number;
  /** Weight in kg (canonical metric). */
  weightKg: number;
  /** Waist circumference in cm. */
  waistCm: number;
  /** Neck circumference in cm. */
  neckCm: number;
  /** Hip circumference in cm — required for the female formula (ignored for male). */
  hipCm: number;
}

export interface BodyFatBmiResult {
  /** weight / height(m)^2, rounded to 2 decimals. */
  bmi: number;
  /** U.S. Navy body-fat percentage, rounded to 1 decimal. */
  bodyFatPercentage: number;
  /** weight × bodyFatPercentage / 100, kg. */
  fatMassKg: number;
  /** weight − fatMass, kg. */
  leanMassKg: number;
  /** WHO BMI band. */
  bmiCategory: BmiCategory;
  /** Navy % band for the gender. */
  bodyFatCategory: BodyFatCategory;
}

export interface IdealRange {
  min: number;
  max: number;
}

/**
 * Rough age- and gender-based healthy body-fat ranges (popular references).
 * Male: 8–19% (20–39), 11–21% (40–59), 13–24% (60+).
 * Female: 21–33% (20–39), 23–34% (40–59), 24–36% (60+).
 */
export function idealBodyFatRange(gender: Gender, age: number): IdealRange {
  const a = Math.max(0, Math.floor(age));
  if (gender === 'male') {
    if (a < 40) return { min: 8, max: 19 };
    if (a < 60) return { min: 11, max: 21 };
    return { min: 13, max: 24 };
  }
  if (a < 40) return { min: 21, max: 33 };
  if (a < 60) return { min: 23, max: 34 };
  return { min: 24, max: 36 };
}

function bmiCategoryOf(bmi: number): BmiCategory {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
}

function bodyFatCategoryOf(gender: Gender, pct: number): BodyFatCategory {
  if (gender === 'male') {
    if (pct < 6) return 'essential';
    if (pct < 14) return 'athletic';
    if (pct < 18) return 'fitness';
    if (pct < 25) return 'average';
    return 'high';
  }
  if (pct < 14) return 'essential';
  if (pct < 21) return 'athletic';
  if (pct < 25) return 'fitness';
  if (pct < 32) return 'average';
  return 'high';
}

export function calculateBodyFatBmi(input: BodyFatBmiInput): BodyFatBmiResult {
  const gender = input.gender === 'female' ? 'female' : 'male';
  const age = Math.max(0, Math.floor(input.age));
  const heightCm = Math.max(1, input.heightCm);
  const weightKg = Math.max(0, input.weightKg);
  const neckCm = Math.max(0, input.neckCm);
  const waistCm = Math.max(0, input.waistCm);
  const hipCm = Math.max(0, input.hipCm);

  // BMI (metric, no conversion needed).
  const heightM = heightCm / 100;
  const bmi = weightKg > 0 && heightM > 0 ? round2(weightKg / (heightM * heightM)) : 0;

  // Navy method — always in inches; guard against non-positive log inputs.
  const heightIn = cmToIn(heightCm);
  const waistIn = cmToIn(waistCm);
  const neckIn = cmToIn(neckCm);
  const hipIn = cmToIn(hipCm);

  let pct = 0;
  if (weightKg > 0 && heightIn > 0) {
    if (gender === 'male') {
      const diff = Math.max(waistIn - neckIn, 0.5);
      pct = 495 / (1.0324 - 0.19077 * Math.log10(diff) + 0.15456 * Math.log10(heightIn)) - 450;
    } else {
      const diff = Math.max(waistIn + hipIn - neckIn, 0.5);
      pct = 495 / (1.29579 - 0.35004 * Math.log10(diff) + 0.221 * Math.log10(heightIn)) - 450;
    }
  }
  const bodyFatPercentage = round1(clamp(pct, 0, 70));
  const fatMassKg = round1((weightKg * bodyFatPercentage) / 100);
  const leanMassKg = round1(weightKg - fatMassKg);

  return {
    bmi,
    bodyFatPercentage,
    fatMassKg,
    leanMassKg,
    bmiCategory: bmiCategoryOf(bmi),
    bodyFatCategory: bodyFatCategoryOf(gender, bodyFatPercentage)
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
function round1(n: number) {
  return Math.round(n * 10) / 10;
}
function round2(n: number) {
  return Math.round(n * 100) / 100;
}
