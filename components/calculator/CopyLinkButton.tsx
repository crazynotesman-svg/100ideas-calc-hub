'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * "Copy link with parameters" button.
 *
 * Copies the current shareable URL (inputs encoded as query params) to the clipboard
 * and shows a brief, self-dismissing toast. A textarea+execCommand fallback is used
 * when the async Clipboard API is unavailable (older browsers / insecure contexts).
 */
export function CopyLinkButton({ getUrl }: { getUrl: () => string }) {
  const tc = useTranslations('common');
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = getUrl();
    let ok = false;
    try {
      await navigator.clipboard.writeText(url);
      ok = true;
    } catch {
      try {
        const el = document.createElement('textarea');
        el.value = url;
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

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={copy} className="gap-1.5">
        {copied ? (
          <Check className="h-4 w-4" aria-hidden />
        ) : (
          <Link2 className="h-4 w-4" aria-hidden />
        )}
        {copied ? tc('linkCopied') : tc('copyLink')}
      </Button>
      {copied && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background shadow-lg"
        >
          {tc('linkCopiedToast')}
        </div>
      )}
    </>
  );
}
