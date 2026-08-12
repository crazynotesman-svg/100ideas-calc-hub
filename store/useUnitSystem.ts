'use client';

import { create } from 'zustand';
import type { UnitSystem } from '@/lib/calculators/health/tdee';

interface UnitState {
  unitSystem: UnitSystem;
  setUnitSystem: (system: UnitSystem) => void;
  toggle: () => void;
}

/**
 * Shared across the page header toggle and every calculator form.
 * Deliberately NOT persisted: reading localStorage during hydration would make the
 * first client render differ from the static HTML and reintroduce layout shift.
 */
export const useUnitSystem = create<UnitState>((set) => ({
  unitSystem: 'metric',
  setUnitSystem: (unitSystem) => set({ unitSystem }),
  toggle: () => set((state) => ({ unitSystem: state.unitSystem === 'metric' ? 'imperial' : 'metric' }))
}));
