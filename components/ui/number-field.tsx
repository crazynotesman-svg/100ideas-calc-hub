'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface NumberFieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

/**
 * Controlled numeric input that does NOT force a fallback on empty/invalid input.
 *
 * The previous local implementation coerced every keystroke through
 * `toNumber(event.target.value, min ?? 0)`, so clearing a field snapped it back to `min`
 * (e.g. TDEE age cleared -> "10", FIRE withdrawalRate cleared -> "1"). That made it
 * impossible to delete the last digit or type intermediate states such as "1." or "-".
 *
 * This version keeps a raw-text mirror of the field:
 *  - the user can empty the field or type partial values without snap-back;
 *  - a valid finite number is committed up to the parent (driving the calc + URL);
 *  - empty/invalid input leaves the parent's last committed value untouched;
 *  - external changes (URL hydrate, preset seed, reset, unit toggle) still flow down.
 */
export function NumberField({ id, label, value, onChange, min, max, step = 1 }: NumberFieldProps) {
  const [text, setText] = useState(() => (Number.isFinite(value) ? String(value) : ''));
  const lastEmitted = useRef(value);

  // Reflect parent-driven changes (hydrate / reset / preset / unit toggle), but never
  // overwrite what the user is currently typing: we only sync when the incoming value
  // differs from the one we last emitted ourselves.
  useEffect(() => {
    if (value !== lastEmitted.current) {
      setText(Number.isFinite(value) ? String(value) : '');
      lastEmitted.current = value;
    }
  }, [value]);

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        value={text}
        min={min}
        max={max}
        step={step}
        onChange={(event) => {
          const raw = event.target.value;
          setText(raw);
          if (raw === '') {
            // Field emptied: keep it empty, leave the parent's last value intact.
            // Mark lastEmitted to the parent's *current* value so the sync effect above
            // does not re-fill the field with the previous number.
            lastEmitted.current = value;
            return;
          }
          const n = Number(raw);
          if (Number.isFinite(n)) {
            lastEmitted.current = n;
            onChange(n);
          }
        }}
      />
    </div>
  );
}
