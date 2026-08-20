/**
 * Shared Recharts style system (Sprint 5).
 *
 * One set of visual tokens for every chart on the site so tooltips, axes, grids
 * and legends render identically across the 11 calculators: rounded glass
 * tooltip, soft hover column, compact ticks and a consistent legend.
 *
 * Colors are the site's light-theme palette (the existing charts use concrete
 * HSL values because Recharts renders tick fills as SVG presentation
 * attributes, where CSS var() does not resolve — only the inline-style
 * tooltip uses theme-adaptive tokens).
 */

import type { CSSProperties } from 'react';

/** Glassmorphism tooltip: rounded, translucent, blurred, soft shadow. */
export const chartTooltipStyle: CSSProperties = {
  borderRadius: 12,
  border: '1px solid hsl(214 32% 91%)',
  background: 'rgba(255, 255, 255, 0.88)',
  backdropFilter: 'blur(8px)',
  boxShadow: '0 8px 24px -12px rgba(15, 23, 42, 0.25)',
  fontSize: 13,
  color: 'hsl(222 47% 11%)'
};

/** Soft highlight column when hovering a data point. */
export const chartCursorStyle = { fill: 'rgba(99, 102, 241, 0.06)' };

/** Axis tick tokens. */
export const chartAxisTick = { fontSize: 12, fill: 'hsl(215 16% 47%)' };

/** Cartesian grid line color. */
export const chartGridStroke = 'hsl(214 32% 91%)';

/** Legend tokens (compact, with a touch of breathing room). */
export const chartLegendStyle = { fontSize: 12, paddingTop: 4 };
