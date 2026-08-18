'use client';

import { useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Download, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { siteConfig } from '@/config/site.config';
import type { Locale } from '@/config/i18n.config';

export interface ShareHighlight {
  label: string;
  value: string;
}

interface ResultShareCardProps {
  locale: Locale;
  calculatorId: 'tdee' | 'fire' | 'schengen' | 'compound' | 'mortgage' | 'body-fat-bmi';
  title: string;
  /** null → render a reserved-height skeleton (used by Schengen before a result exists). */
  highlights: ShareHighlight[] | null;
  /** Shareable URL — a string or a getter (useCalculatorState returns a function). */
  shareUrl: string | (() => string);
}

/** Per-calculator accent (hex, because the standalone SVG download can't read Tailwind classes). */
const ACCENT: Record<ResultShareCardProps['calculatorId'], string> = {
  tdee: '#f97316',
  fire: '#10b981',
  schengen: '#0ea5e9',
  compound: '#6366f1',
  mortgage: '#3b82f6',
  'body-fat-bmi': '#e11d48'
};

const BRAND = siteConfig.name;
const DOMAIN = 'calc.100ideas.net';

/**
 * Shareable result card.
 *
 * Renders a clean SVG "social card" of the calculation result — branded header, the
 * key scenario highlights, a metrics badge and a domain watermark — plus native
 * Download (SVG → .svg file) and Copy-link actions. No external rasterization library:
 * the card is authored directly as SVG, so it serializes losslessly for download.
 *
 * The preview lives in a fixed-aspect container, so it reserves its height on first
 * paint (skeleton and real content share the same box) → zero CLS.
 */
export function ResultShareCard({
  locale,
  calculatorId,
  title,
  highlights,
  shareUrl
}: ResultShareCardProps) {
  const t = useTranslations('common.share');
  const svgRef = useRef<SVGSVGElement>(null);
  const [copied, setCopied] = useState(false);

  const accent = ACCENT[calculatorId];
  const rows = (highlights ?? []).slice(0, 3);
  const safeTitle = title.length > 34 ? `${title.slice(0, 32)}…` : title;

  function download() {
    const svg = svgRef.current;
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${xml}`], {
      type: 'image/svg+xml;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${calculatorId}-result-card.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function copyLink() {
    // Resolve the share URL lazily inside the handler — the getter reads window.location,
    // which is unavailable during SSR/prerender. Computing it at render time would crash.
    const resolved = typeof shareUrl === 'function' ? shareUrl() : shareUrl;
    let ok = false;
    try {
      await navigator.clipboard.writeText(resolved);
      ok = true;
    } catch {
      try {
        const el = document.createElement('textarea');
        el.value = resolved;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.select();
        ok = document.execCommand('copy');
        document.body.removeChild(el);
      } catch {
        ok = false;
      }
    }
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  const cardBody = rows.length ? (
    rows.map((r, i) => {
      const y = 300 + i * 96;
      return (
        <g key={i}>
          <text x={64} y={y} fontFamily="system-ui, -apple-system, sans-serif" fontSize={22} fill="#64748b">
            {r.label}
          </text>
          <text
            x={64}
            y={y + 42}
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize={38}
            fontWeight={700}
            fill="#0f172a"
          >
            {r.value}
          </text>
        </g>
      );
    })
  ) : (
    [0, 1, 2].map((i) => (
      <rect key={i} x={64} y={278 + i * 96} width={440} height={32} rx={6} fill="#e2e8f0" />
    ))
  );

  return (
    <Card className="border-2 border-primary/10">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">{t('heading')}</p>
          <span className="text-xs text-muted-foreground">{t('sub')}</span>
        </div>

        {/* Fixed-aspect preview reserves height → 0 CLS (skeleton and real share the same box). */}
        <div className="aspect-[1200/630] w-full overflow-hidden rounded-xl border bg-white">
          <svg
            ref={svgRef}
            viewBox="0 0 1200 630"
            width="100%"
            height="100%"
            role="img"
            aria-label={t('heading')}
            lang={locale}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="share-bg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f8fafc" />
              </linearGradient>
              <linearGradient id="share-bar" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={accent} />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>

            <rect width="1200" height="630" rx="28" fill="url(#share-bg)" />
            <circle cx={92} cy={70} r={18} fill={accent} />
            <text
              x={124}
              y={80}
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize={30}
              fontWeight={700}
              fill="#0f172a"
            >
              {BRAND}
            </text>
            <text
              x={1136}
              y={80}
              textAnchor="end"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize={22}
              fill="#94a3b8"
            >
              {DOMAIN}
            </text>

            <text
              x={64}
              y={172}
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize={42}
              fontWeight={700}
              fill="#0f172a"
            >
              {safeTitle}
            </text>
            <rect x={64} y={196} width={120} height={6} rx={3} fill="url(#share-bar)" />

            {cardBody}

            <rect x={64} y={552} width={268} height={42} rx={21} fill={accent} opacity={0.12} />
            <text
              x={86}
              y={580}
              fontFamily="system-ui, -apple-system, sans-serif"
              fontSize={20}
              fontWeight={600}
              fill={accent}
            >
              {DOMAIN}
            </text>
          </svg>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={download} className="gap-1.5">
            <Download className="h-4 w-4" aria-hidden />
            {t('download')}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={copyLink} className="gap-1.5">
            {copied ? <Check className="h-4 w-4" aria-hidden /> : <Link2 className="h-4 w-4" aria-hidden />}
            {copied ? t('copied') : t('copyLink')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
