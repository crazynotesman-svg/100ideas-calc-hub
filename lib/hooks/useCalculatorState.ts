'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface CalculatorFieldSpec {
  /** Value written to the URL and used as the initial value when the param is absent. */
  default: string;
}

export type CalculatorFieldConfig = Record<string, CalculatorFieldSpec>;

export interface UseCalculatorStateResult<T extends CalculatorFieldConfig> {
  values: Record<keyof T, string>;
  /** Update one field. By default also syncs the URL (replaceState, no re-render). */
  setField: (key: keyof T, value: string, opts?: { sync?: boolean }) => void;
  /** Read a field value. */
  getField: (key: keyof T) => string;
  /** True once URL params have been read on the client (post-mount). */
  hydrated: boolean;
  /** Absolute URL reflecting the current field values (defaults omitted). */
  shareUrl: () => string;
  /** Reset every field to its default and clear the URL query. */
  reset: () => void;
}

/**
 * Sync a flat set of calculator inputs with the URL query string.
 *
 * Design notes / constraints (Next.js 14 App Router + OpenNext/Cloudflare):
 *  - The server renders with default values only. URL params are read in a post-mount
 *    effect, so the SSR HTML and the first client paint are identical -> no hydration
 *    mismatch.
 *  - URL updates use window.history.replaceState (no scroll, no full re-render, no
 *    router navigation). This keeps the canonical <link> in <head> clean, because
 *    Next never re-runs generateMetadata for a client-side replaceState.
 *  - We deliberately avoid useSearchParams() so pages stay fully static (SSG) and
 *    don't require a Suspense boundary.
 *  - Defaults are omitted from the query string, so a "clean" visit produces a clean
 *    URL and a shared link only carries the values the user actually changed.
 */
export function useCalculatorState<T extends CalculatorFieldConfig>(
  config: T
): UseCalculatorStateResult<T> {
  const keys = useRef(Object.keys(config) as string[]);
  const defaults = useRef(
    Object.fromEntries(keys.current.map((k) => [k, config[k].default])) as Record<keyof T, string>
  );

  const [values, setValues] = useState<Record<keyof T, string>>(() => ({ ...defaults.current }));
  const [hydrated, setHydrated] = useState(false);
  const valuesRef = useRef(values);
  valuesRef.current = values;

  const buildQuery = useCallback((src: Record<keyof T, string>) => {
    const params = new URLSearchParams();
    for (const k of keys.current) {
      const v = src[k];
      if (v === '' || v === defaults.current[k]) continue;
      params.set(k, v);
    }
    return params.toString();
  }, []);

  const writeUrl = useCallback(
    (src: Record<keyof T, string>) => {
      const qs = buildQuery(src);
      const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
      window.history.replaceState(window.history.state, '', url);
    },
    [buildQuery]
  );

  // Read URL params once, after mount (client-only) -> no SSR/CSR hydration mismatch.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next: Record<string, string> = { ...defaults.current };
    for (const k of keys.current) {
      const v = params.get(k);
      if (v !== null) next[k] = v;
    }
    setValues(next as Record<keyof T, string>);
    if (window.location.search) writeUrl(next as Record<keyof T, string>);
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = useCallback(
    (key: keyof T, value: string, opts?: { sync?: boolean }) => {
      setValues((prev) => {
        const next = { ...prev, [key]: value };
        if (opts?.sync !== false) writeUrl(next);
        return next;
      });
    },
    [writeUrl]
  );

  const getField = useCallback((key: keyof T) => values[key], [values]);

  const shareUrl = useCallback(() => {
    const qs = buildQuery(valuesRef.current);
    const path = window.location.pathname;
    return qs ? `${window.location.origin}${path}?${qs}` : window.location.href;
  }, [buildQuery]);

  const reset = useCallback(() => {
    const d = { ...defaults.current };
    setValues(d);
    writeUrl(d);
  }, [writeUrl]);

  return { values, setField, getField, hydrated, shareUrl, reset };
}
