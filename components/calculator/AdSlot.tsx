"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ADSENSE_CLIENT, ADSENSE_SLOTS } from "@/config/ads.config";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdFormat = "sidebar" | "sticky-sidebar" | "leaderboard" | "in-content";

/**
 * Reserved advertising containers.
 * The box is rendered at its final size from the very first paint — an ad script that loads
 * 2 seconds later drops into an already-reserved hole, so it cannot contribute to CLS.
 */
const sizes: Record<AdFormat, string> = {
  sidebar: "h-[600px] w-full max-w-[300px]",
  "sticky-sidebar": "h-[600px] w-full max-w-[300px]",
  leaderboard: "h-[90px] w-full",
  "in-content": "h-[250px] w-full"
};

export function AdSlot({
  format = "sidebar",
  label,
  slotId,
  className
}: {
  format?: AdFormat;
  label: string;
  slotId: string;
  className?: string;
}) {
  const slot = ADSENSE_SLOTS[slotId];
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!slot || pushedRef.current) return;
    pushedRef.current = true;

    const pushAd = () => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        /* AdSense loader may still be initializing; the queue is flushed on load. */
      }
    };

    if (window.adsbygoogle) {
      pushAd();
    } else {
      // Loader not yet evaluated — push once the window has finished loading.
      window.addEventListener("load", pushAd, { once: true });
    }
  }, [slot]);

  // No slot configured yet -> reserved-height placeholder, no ad served (CLS-safe).
  if (!slot) {
    return (
      <aside
        aria-label={label}
        data-ad-slot={slotId}
        className={cn("ad-shell shrink-0", sizes[format], className)}
      >
        <span className="select-none uppercase tracking-widest">{label}</span>
      </aside>
    );
  }

  return (
    <aside
      aria-label={label}
      data-ad-slot={slotId}
      className={cn("ad-shell shrink-0 overflow-hidden", sizes[format], className)}
    >
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
